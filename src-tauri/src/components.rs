use crate::error::PipelineError;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::path::Path;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
pub enum Archive {
    #[serde(rename = "zip")]
    Zip,
    #[serde(rename = "tar.bz2")]
    TarBz2,
    #[serde(rename = "raw")]
    Raw,
}

#[derive(Debug, Clone, Deserialize)]
pub struct FileMap {
    /// `None` ⇒ archive = Raw (chính file tải về).
    /// `Some("a/b/c.exe")` ⇒ 1 file trong archive.
    /// `Some("a/b/")` ⇒ cả cây con (kết bằng '/').
    pub from: Option<String>,
    /// Đường dẫn đích, tương đối `models_dir()`, luôn dùng '/'.
    pub to: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ComponentSpec {
    pub id: String,
    pub url: String,
    pub sha256: String,
    pub size: u64,
    pub archive: Archive,
    pub files: Vec<FileMap>,
}

#[derive(Debug, Clone, Copy)]
pub enum Progress {
    Download { done: u64, total: u64 },
    Extract,
    Done,
}

pub fn specs() -> Result<Vec<ComponentSpec>, PipelineError> {
    serde_json::from_str(include_str!("../components.json"))
        .map_err(|e| PipelineError::Io(format!("components.json hỏng: {e}")))
}

pub fn verify_sha256(path: &Path, expected: &str) -> Result<(), PipelineError> {
    let bytes = std::fs::read(path).map_err(|e| PipelineError::Io(e.to_string()))?;
    let got = format!("{:x}", Sha256::digest(&bytes));
    if got.eq_ignore_ascii_case(expected) {
        Ok(())
    } else {
        Err(PipelineError::ChecksumMismatch {
            expected: expected.into(),
            got,
        })
    }
}
