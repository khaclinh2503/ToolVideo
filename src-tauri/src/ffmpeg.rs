use std::path::Path;
use std::process::Command;
use crate::error::PipelineError;

pub fn extract_audio(ffmpeg: &Path, input: &Path, out_wav: &Path) -> Result<(), PipelineError> {
    let out = Command::new(ffmpeg)
        .args(["-hide_banner", "-y", "-i"])
        .arg(input)
        .args([
            "-map", "0:a:0", "-vn", "-af",
            "aresample=16000:async=1000:first_pts=0",
            "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        ])
        .arg(out_wav)
        .output()
        .map_err(|_| PipelineError::EngineMissing("ffmpeg".into()))?;

    if out.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    if stderr.contains("does not contain any stream") || stderr.contains("Stream map '0:a:0' matches no streams") {
        return Err(PipelineError::NoAudioStream);
    }

    Err(PipelineError::EngineFailed {
        stage: "extract_audio".into(),
        code: out.status.code().unwrap_or(-1),
        stderr,
    })
}
