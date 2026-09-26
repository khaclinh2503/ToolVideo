//! Provider `VieNeu` (M7): gọi `python/vieneu_bridge.py` làm tiến trình con,
//! theo đúng giao thức dòng JSON đã chốt ở Task 3
//! (`src-tauri/python/vieneu_bridge.py`, đọc chính file đó — không phải kế
//! hoạch — nếu cần đối chiếu hợp đồng).
//!
//! KHÔNG ép tốc độ đọc ở đây, CỐ Ý: VieNeu-TTS không có tham số
//! `length_scale`/`speed` nào trong `infer()` của SDK (Task 3 đã grep xác
//! nhận rỗng trong `vieneu/v3turbo.py` và `vieneu/base.py` — xem docstring
//! của `vieneu_bridge.py`). `job.length_scale` bị BỎ QUA có chủ ý trong
//! `synthesize` bên dưới; việc ép tốc độ dồn hết cho ffmpeg `atempo` hậu xử
//! lý, một task riêng ngay SAU task này. Đừng lặng lẽ thêm lại khoá
//! "length_scale"/"speed" vào JSON gửi cho cầu nối — cầu nối không có gì để
//! làm với khoá đó.

use crate::{
    error::PipelineError,
    tts::{procio::run_line_protocol, TtsJob, TtsProvider},
};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

/// Nội dung `vieneu_bridge.py`, nhúng thẳng vào binary lúc biên dịch — cùng
/// lý do với `pyenv::REQUIREMENTS`: bản đóng gói (`tauri build`) không có cây
/// nguồn `src-tauri/python/` trên máy người dùng, nên không thể đọc file này
/// từ đĩa theo đường dẫn tương đối lúc chạy. Nhúng vào binary rồi ghi ra đĩa
/// ở `ensure_bridge_script` mỗi lần khởi tạo provider — luôn khớp bản binary
/// đang chạy, không thể kẹt lại một bản cầu nối cũ sau khi nâng cấp app.
pub const BRIDGE_SCRIPT: &str = include_str!("../../python/vieneu_bridge.py");

/// Ghi `BRIDGE_SCRIPT` ra `<models>/vieneu/vieneu_bridge.py`; bỏ qua nếu nội
/// dung trên đĩa đã khớp (tránh ghi lại không cần thiết mỗi lần gọi). Trả về
/// đường dẫn đã ghi.
pub fn ensure_bridge_script(models: &Path) -> Result<PathBuf, PipelineError> {
    let dir = models.join("vieneu");
    std::fs::create_dir_all(&dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let path = dir.join("vieneu_bridge.py");
    let da_khop = std::fs::read_to_string(&path).map(|s| s == BRIDGE_SCRIPT).unwrap_or(false);
    if !da_khop {
        std::fs::write(&path, BRIDGE_SCRIPT).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    Ok(path)
}

/// Provider VieNeu-TTS.
pub struct VieNeu {
    pub python: PathBuf,
    pub bridge: PathBuf,
    pub site_packages: PathBuf,
    pub hf_home: PathBuf,
    pub voice: String,
    /// `<models>/vieneu` — thư mục gốc chứa 15 file đã pin cứng trong
    /// `components.json` (`config.json`, `denoiser.onnx` ở gốc; `onnx_update/`
    /// với 7 file backbone fp32; `moss/` với 6 file codec ONNX). Truyền cho
    /// cầu nối qua biến môi trường `VIENEU_MODELS_DIR`; cầu nối tự quyết định
    /// dùng cục bộ (offline) hay để SDK tải qua HF Hub nếu thư mục chưa đủ —
    /// xem `_tao_vieneu()` trong `vieneu_bridge.py`.
    pub models_dir: PathBuf,
}

/// Một dòng JSON cho stdin của cầu nối VieNeu. Cùng quy tắc gộp xuống dòng với
/// `piper::build_line`; khác biệt duy nhất là khoá `"voice"`.
///
/// `voice` PHẢI là tên hiển thị có dấu lấy từ `list_preset_voices()` của SDK
/// (vd. `"Mai Anh"`), KHÔNG phải slug (`"mai_anh"` ⇒ SDK báo lỗi
/// `Voice not found`) — xem `giong-tu-sdk.json`, việc chọn đúng tên hiển thị
/// thuộc Task 5 (chọn giọng), hàm này chỉ chuyển tiếp nguyên văn.
///
/// KHÔNG có khoá "length_scale"/"speed" — xem comment đầu file module.
pub fn build_line(job: &TtsJob, voice: &str) -> String {
    let text = job.text.replace("\r\n", " ").replace('\n', " ").replace('\r', " ");
    let v = serde_json::json!({
        "text": text,
        "output_file": job.out.display().to_string(),
        "voice": voice,
    });
    v.to_string()
}

/// Gom `jobs` theo tốc độ (khoá `"{:.3}"`, khớp `tts::cache_key` và
/// `piper::group_by_scale`). VieNeu KHÔNG cần nhóm này để spawn — SDK không
/// có cờ tốc độ theo tiến trình như Piper, và nạp model chỉ nên xảy ra một
/// lần cho toàn batch (nạp lại tốn vài giây, xem docstring
/// `vieneu_bridge.py`) — nên `synthesize` bên dưới luôn gọi ĐÚNG MỘT tiến
/// trình cho toàn bộ `jobs`, không dùng hàm này.
///
/// Hàm này tồn tại để task ép tốc độ hậu xử lý (ffmpeg `atempo`, ngay sau
/// task này) có sẵn cách nhóm cue theo tốc độ mong muốn, cùng quy ước khoá
/// với phần còn lại của pipeline.
pub fn group_by_speed(jobs: &[TtsJob]) -> Vec<(f32, Vec<TtsJob>)> {
    let mut map: std::collections::BTreeMap<String, (f32, Vec<TtsJob>)> =
        std::collections::BTreeMap::new();
    for j in jobs {
        let key = format!("{:.3}", j.length_scale);
        map.entry(key).or_insert_with(|| (j.length_scale, Vec::new())).1.push(j.clone());
    }
    map.into_values().collect()
}

impl TtsProvider for VieNeu {
    fn id(&self) -> &'static str {
        "vieneu"
    }

    fn sample_rate(&self) -> u32 {
        // VieNeu-TTS v3 Turbo luôn ra 48kHz — hằng số của SDK
        // (`V3TurboVieNeuTTS.__init__`: `self.sample_rate = 48_000`), không
        // đọc từ file cấu hình như Piper (không có file kiểu đó ở đây).
        48_000
    }

    fn synthesize(
        &self,
        jobs: &[TtsJob],
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError> {
        // Không có job ⇒ không spawn gì cả (đúng hợp đồng trait, và để test
        // `khong_co_job_thi_khong_spawn` chạy được với `python` không tồn tại).
        if jobs.is_empty() {
            return Ok(());
        }
        for j in jobs {
            if let Some(d) = j.out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
        }
        // HF_HOME phải tồn tại trước khi spawn: huggingface_hub tự tạo cây con
        // bên trong, nhưng không tự tạo thư mục gốc nếu cha nó còn thiếu.
        std::fs::create_dir_all(&self.hf_home).map_err(|e| PipelineError::Io(e.to_string()))?;

        let mut cmd = Command::new(&self.python);
        cmd.arg(&self.bridge)
            .env("PYTHONPATH", &self.site_packages)
            .env("HF_HOME", &self.hf_home)
            .env("PYTHONIOENCODING", "utf-8")
            .env("VIENEU_MODELS_DIR", &self.models_dir)
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
                PipelineError::EngineMissing("vieneu".into())
            } else {
                PipelineError::Io(err.to_string())
            }
        })?;

        // Khuôn ba luồng song song (stdin riêng / stdout luồng gọi / stderr
        // riêng, đọc theo byte + decode lossy) — dùng chung với `tts/piper.rs`
        // qua `tts::procio::run_line_protocol`. Xem comment ở đó để biết lý
        // do (treo ống 4KB trên Windows, byte không phải UTF-8 trong đường
        // dẫn output_file làm chết `.lines()`).
        let lines: Vec<String> = jobs.iter().map(|j| build_line(j, &self.voice)).collect();
        let mut done = 0usize;
        let (done_count, stderr_tail) = run_line_protocol(&mut child, lines, &mut |_line| {
            // `on_done` nhận `job.index` GỐC (không phải số thứ tự trong
            // batch): cùng quy ước với `piper.rs`, vì `jobs` ở đây đã là toàn
            // bộ batch (VieNeu không gom nhóm theo tốc độ như Piper).
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
                    stderr: format!("vieneu báo xong nhưng thiếu file {}", j.out.display()),
                });
            }
        }
        Ok(())
    }
}
