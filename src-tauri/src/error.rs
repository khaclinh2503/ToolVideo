#[derive(Debug)]
pub enum PipelineError {
    EngineMissing(String),
    ChecksumMismatch { expected: String, got: String },
    NoAudioStream,
    EngineFailed { stage: String, code: i32, stderr: String },
    Io(String),
}

impl PipelineError {
    pub fn code(&self) -> &'static str {
        match self {
            PipelineError::EngineMissing(_) => "engine_missing",
            PipelineError::ChecksumMismatch { .. } => "checksum_mismatch",
            PipelineError::NoAudioStream => "no_audio_stream",
            PipelineError::EngineFailed { .. } => "engine_failed",
            PipelineError::Io(_) => "io_error",
        }
    }
}

impl std::fmt::Display for PipelineError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PipelineError::EngineMissing(name) => write!(
                f,
                "[engine_missing] Không tìm thấy công cụ '{name}'. Hãy cài/đặt đúng đường dẫn."
            ),
            PipelineError::NoAudioStream => {
                write!(f, "[no_audio_stream] Video không có luồng âm thanh.")
            }
            PipelineError::EngineFailed { stage, code, stderr } => {
                let tail: Vec<&str> = stderr.lines().rev().take(20).collect();
                let tail: String = tail.into_iter().rev().collect::<Vec<_>>().join("\n");
                write!(
                    f,
                    "[engine_failed] Bước '{stage}' lỗi (mã {code}): {tail}"
                )
            }
            PipelineError::ChecksumMismatch { expected, got } => write!(
                f,
                "[checksum_mismatch] File tải về hỏng (sha256 mong đợi {expected}, nhận {got})."
            ),
            PipelineError::Io(msg) => write!(f, "[io_error] {msg}"),
        }
    }
}

impl std::error::Error for PipelineError {}
