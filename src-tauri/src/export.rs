//! Trộn tiếng gốc với dải tiếng dịch rồi mux vào video.
//!
//! Chia làm hai nửa: `build_*` là hàm thuần trên chuỗi (test được không cần
//! ffmpeg), `run_export`/`probe_*` gọi tiến trình con.

use crate::error::PipelineError;
use std::path::Path;
use std::process::Command;

/// Ẩn cửa sổ console của tiến trình con trên Windows.
fn no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    #[cfg(not(windows))]
    let _ = cmd;
}

fn run_ffprobe(ffprobe: &Path, args: &[&str], video: &Path) -> Result<String, PipelineError> {
    let mut cmd = Command::new(ffprobe);
    cmd.args(args).arg(video);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffprobe".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "ffprobe".into(),
            code: out.status.code().unwrap_or(-1),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        });
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
}

/// `ffprobe` in ra thời lượng dạng giây thập phân, hoặc `N/A` với container
/// không khai báo. Hàm thuần để test được mà không cần ffprobe thật.
pub fn parse_duration_ms(s: &str) -> Option<u64> {
    let v: f64 = s.trim().parse().ok()?;
    if !v.is_finite() || v <= 0.0 {
        return None;
    }
    Some((v * 1000.0).round() as u64)
}

pub fn probe_duration_ms(ffprobe: &Path, video: &Path) -> Result<u64, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
        ],
        video,
    )?;
    parse_duration_ms(&s).ok_or_else(|| PipelineError::EngineFailed {
        stage: "ffprobe".into(),
        code: 0,
        stderr: format!(
            "Không đọc được thời lượng của {} (ffprobe trả về '{s}')",
            video.display()
        ),
    })
}

/// Video câm là chuyện bình thường (màn hình quay, slide). Không có tiếng gốc
/// thì nhánh `[0:a]` của filtergraph sẽ làm ffmpeg chết ngay, nên phải hỏi trước.
pub fn probe_has_audio(ffprobe: &Path, video: &Path) -> Result<bool, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
        ],
        video,
    )?;
    Ok(!s.trim().is_empty())
}
