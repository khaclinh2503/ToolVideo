#[derive(Debug)]
pub enum PipelineError {
    EngineMissing(String),
    ChecksumMismatch { expected: String, got: String },
    NoAudioStream,
    EngineFailed { stage: String, code: i32, stderr: String },
    Io(String),
}
