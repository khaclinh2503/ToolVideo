use crate::{
    error::PipelineError,
    tts::{TtsJob, TtsProvider},
};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub struct Piper {
    pub exe: PathBuf,
    /// File `.onnx` của giọng; Piper tự tìm `<model>.json` cạnh nó.
    pub model: PathBuf,
    pub sample_rate: u32,
}

pub fn build_args(model: &Path) -> Vec<String> {
    vec![
        "-m".to_string(),
        model.display().to_string(),
        "--json-input".to_string(),
    ]
}

/// Một dòng JSON cho stdin của Piper. Cue nhiều dòng được gộp thành một câu nói.
pub fn build_line(job: &TtsJob) -> String {
    let text = job.text.replace("\r\n", " ").replace('\n', " ").replace('\r', " ");
    let mut v = serde_json::json!({
        "text": text,
        "output_file": job.out.display().to_string(),
    });
    if (job.length_scale - 1.0).abs() > 1e-6 {
        v["length_scale"] = serde_json::json!(job.length_scale);
    }
    v.to_string()
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
        if jobs.is_empty() {
            return Ok(());
        }
        for j in jobs {
            if let Some(d) = j.out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
        }

        let mut cmd = Command::new(&self.exe);
        cmd.args(build_args(&self.model))
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

        // stderr đọc song song để tiến trình con không nghẽn ống.
        let stderr = child.stderr.take().expect("đã piped");
        let err_handle = std::thread::spawn(move || {
            let mut tail: Vec<String> = Vec::new();
            for line in BufReader::new(stderr).lines().map_while(Result::ok) {
                tail.push(line);
                if tail.len() > 100 {
                    tail.remove(0);
                }
            }
            tail.join("\n")
        });

        // Ghi stdin trên luồng riêng, đọc stdout trên luồng gọi — chạy song song.
        //
        // Ống nặc danh trên Windows có bộ đệm khoảng 4KB. Nếu ghi hết stdin rồi mới
        // đọc stdout (như brief ban đầu mô tả), với một batch lớn (~200 cue ⇒ ~40KB
        // JSON vào, ~12KB đường dẫn ra) sẽ nghẽn: ghi đầy bộ đệm stdin ⇒ tiến trình
        // gọi bị chặn ở write; Piper đầy bộ đệm stdout vì không ai đọc ⇒ Piper bị
        // chặn ở write stdout; Piper bị chặn nên ngừng đọc stdin ⇒ không bên nào
        // tiến được nữa — treo vĩnh viễn, không lỗi, không timeout.
        //
        // Tách ghi stdin ra luồng riêng và đọc stdout ngay trên luồng gọi giải quyết
        // việc này: mỗi ống luôn có người rút cạn phía bên kia bất kể ống nào đầy
        // trước.
        let mut stdin = child.stdin.take().expect("đã piped");
        let lines: Vec<String> = jobs.iter().map(build_line).collect();
        let writer_handle = std::thread::spawn(move || -> std::io::Result<()> {
            for l in &lines {
                stdin.write_all(l.as_bytes())?;
                stdin.write_all(b"\n")?;
            }
            stdin.flush()
            // `stdin` bị drop ở cuối closure ⇒ báo hết đầu vào cho Piper.
        });

        let stdout = child.stdout.take().expect("đã piped");
        let mut done = 0usize;
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if line.trim().is_empty() {
                continue;
            }
            if done < jobs.len() {
                on_done(jobs[done].index);
            }
            done += 1;
        }

        // Join luồng ghi trước khi wait(): lỗi ghi thường do tiến trình con đã
        // chết — để phần dưới báo lỗi có ngữ cảnh (mã thoát + stderr) thay vì
        // trả lỗi I/O trần trụi ở đây.
        let _ = writer_handle.join();

        let status = child.wait().map_err(|e| PipelineError::Io(e.to_string()))?;
        let stderr_tail = err_handle.join().unwrap_or_default();

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
