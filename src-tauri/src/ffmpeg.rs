use std::path::Path;
use std::process::Command;
use crate::error::PipelineError;

pub fn classify_ffmpeg_failure(code: i32, stderr: &str) -> PipelineError {
    if stderr.contains("does not contain any stream") || stderr.contains("matches no streams") {
        PipelineError::NoAudioStream
    } else {
        PipelineError::EngineFailed {
            stage: "extract_audio".into(),
            code,
            stderr: stderr.to_string(),
        }
    }
}

pub fn extract_audio(ffmpeg: &Path, input: &Path, out_wav: &Path) -> Result<(), PipelineError> {
    let mut cmd = Command::new(ffmpeg);
    cmd.args(["-hide_banner", "-y", "-i"])
        .arg(input)
        .args([
            "-map", "0:a:0", "-vn", "-af",
            "aresample=16000:async=1000:first_pts=0",
            "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        ])
        .arg(out_wav);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    let out = cmd.output().map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffmpeg".into())
        } else {
            PipelineError::Io(err.to_string())
        }
    })?;

    if out.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    Err(classify_ffmpeg_failure(out.status.code().unwrap_or(-1), &stderr))
}
