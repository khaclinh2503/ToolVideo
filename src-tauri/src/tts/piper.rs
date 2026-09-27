use crate::{
    error::PipelineError,
    tts::{procio::run_line_protocol, TtsJob, TtsProvider},
};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub struct Piper {
    pub exe: PathBuf,
    /// File `.onnx` của giọng; Piper tự tìm `<model>.json` cạnh nó.
    pub model: PathBuf,
    pub sample_rate: u32,
}

pub fn build_args(model: &Path, length_scale: f32) -> Vec<String> {
    vec![
        "-m".to_string(),
        model.display().to_string(),
        "--json-input".to_string(),
        // Luôn truyền, kể cả khi = 1.0: tham số hiện rõ trong lệnh thì lần sau
        // còn đọc/gỡ được, và 1.0 đúng bằng mặc định của Piper nên vô hại.
        "--length_scale".to_string(),
        format!("{length_scale:.3}"),
    ]
}

/// Một dòng JSON cho stdin của Piper. Cue nhiều dòng được gộp thành một câu nói.
///
/// Không gửi `length_scale` trong JSON: đo trực tiếp trên Piper thật
/// (`vi_VN-vais1000-medium`, cùng một câu, ngày 2026-09-25) cho thấy bản này
/// **bỏ qua im lặng** khoá này khi đi qua `--json-input` — ba giá trị
/// length_scale 1.0 / 0.6 / 2.0 gửi qua JSON đều ra audio dài như nhau
/// (1.73 / 1.68 / 1.67 giây, chênh lệch ~3% chỉ là nhiễu suy diễn của Piper).
/// Cùng câu đó truyền qua cờ dòng lệnh `--length_scale` thì có tác dụng thật:
/// 0.6 ⇒ 1.2539 giây, 1.0 ⇒ ~1.73 giây (nền), 2.0 ⇒ 2.5890 giây. Vì vậy tốc độ
/// giờ đi qua cờ tiến trình ở `build_args`, không qua khoá JSON này nữa — giữ
/// lại khoá này là giữ một lời nói dối trong mã.
pub fn build_line(job: &TtsJob) -> String {
    let text = job.text.replace("\r\n", " ").replace(['\n', '\r'], " ");
    let v = serde_json::json!({
        "text": text,
        "output_file": job.out.display().to_string(),
    });
    v.to_string()
}

/// Gom `jobs` theo tốc độ (khoá `"{:.3}"`, khớp `tts::cache_key`) để mỗi tốc
/// độ chỉ cần một tiến trình Piper — tốc độ là cờ toàn tiến trình, không thể
/// đổi giữa chừng một lần chạy. Giữ nguyên thứ tự job trong từng nhóm; các
/// nhóm được duyệt theo thứ tự khoá đã sắp xếp để hành vi tất định.
pub fn group_by_scale(jobs: &[TtsJob]) -> Vec<(f32, Vec<TtsJob>)> {
    let mut map: std::collections::BTreeMap<String, (f32, Vec<TtsJob>)> =
        std::collections::BTreeMap::new();
    for j in jobs {
        let key = format!("{:.3}", j.length_scale);
        map.entry(key).or_insert_with(|| (j.length_scale, Vec::new())).1.push(j.clone());
    }
    map.into_values().collect()
}

impl TtsProvider for Piper {
    fn id(&self) -> &'static str {
        "piper"
    }

    fn sample_rate(&self) -> u32 {
        self.sample_rate
    }

    fn synthesize(
        &self,
        jobs: &[TtsJob],
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError> {
        // Tốc độ là cờ toàn tiến trình (`--length_scale`), không đổi được giữa
        // chừng một lần chạy Piper ⇒ gom job theo tốc độ, mỗi nhóm một tiến
        // trình riêng. `jobs` rỗng ⇒ không nhóm nào ⇒ không spawn gì cả.
        for (length_scale, group) in group_by_scale(jobs) {
            self.synthesize_group(&group, length_scale, on_done)?;
        }
        Ok(())
    }
}

impl Piper {
    fn synthesize_group(
        &self,
        jobs: &[TtsJob],
        length_scale: f32,
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError> {
        if jobs.is_empty() {
            return Ok(());
        }
        for j in jobs {
            if let Some(d) = j.out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
        }

        let mut cmd = Command::new(&self.exe);
        cmd.args(build_args(&self.model, length_scale))
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }
        let mut child = cmd.spawn().map_err(|err| {
            if err.kind() == std::io::ErrorKind::NotFound {
                PipelineError::EngineMissing("piper".into())
            } else {
                PipelineError::Io(err.to_string())
            }
        })?;

        // Khuôn ba luồng song song (stdin riêng / stdout luồng gọi / stderr
        // riêng, đọc theo byte + decode lossy) đã chuyển sang
        // `tts::procio::run_line_protocol` dùng chung với `tts/vieneu.rs` —
        // xem comment ở đó để biết lý do (treo ống 4KB trên Windows, byte
        // không phải UTF-8 trong output_file làm chết `.lines()`).
        let lines: Vec<String> = jobs.iter().map(build_line).collect();
        let mut done = 0usize;
        let (done_count, stderr_tail) = run_line_protocol(&mut child, lines, &mut |_line| {
            if done < jobs.len() {
                on_done(jobs[done].index);
            }
            done += 1;
        });
        let done = done_count;

        let status = child.wait().map_err(|e| PipelineError::Io(e.to_string()))?;

        if !status.success() || done < jobs.len() {
            let failed_index = jobs.get(done).map(|j| j.index).unwrap_or(0);
            return Err(PipelineError::EngineFailed {
                stage: format!("tts cue {failed_index}"),
                code: status.code().unwrap_or(-1),
                stderr: stderr_tail,
            });
        }

        // Hợp đồng của trait: Ok ⇒ mọi file đích tồn tại.
        for j in jobs {
            if !j.out.exists() {
                return Err(PipelineError::EngineFailed {
                    stage: format!("tts cue {}", j.index),
                    code: 0,
                    stderr: format!("piper báo xong nhưng thiếu file {}", j.out.display()),
                });
            }
        }
        Ok(())
    }
}
