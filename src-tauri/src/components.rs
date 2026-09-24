use crate::error::PipelineError;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::path::Path;
use std::io::{Read, Write};

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

/// Tải `url` về `dest` theo luồng, vừa ghi vừa băm sha256.
/// Sai hash ⇒ xoá `dest` và trả `ChecksumMismatch`.
pub fn download_verified(
    url: &str,
    dest: &Path,
    expected_sha256: &str,
    on: &mut dyn FnMut(Progress),
) -> Result<(), PipelineError> {
    if let Some(d) = dest.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let client = reqwest::blocking::Client::builder()
        .user_agent("DichVideo-Local/0.1")
        .connect_timeout(std::time::Duration::from_secs(30))
        .timeout(None)
        .build()
        .map_err(|e| PipelineError::Io(e.to_string()))?;

    let mut resp = client
        .get(url)
        .send()
        .map_err(|e| PipelineError::Io(format!("không tải được {url}: {e}")))?;
    if !resp.status().is_success() {
        return Err(PipelineError::ProviderError {
            provider: "download".into(),
            status: Some(resp.status().as_u16()),
            msg: url.to_string(),
        });
    }

    let total = resp.content_length().unwrap_or(0);
    let mut file = std::fs::File::create(dest).map_err(|e| PipelineError::Io(e.to_string()))?;
    let mut hasher = Sha256::new();
    let mut buf = vec![0u8; 65536];
    let mut done: u64 = 0;
    let mut last = std::time::Instant::now();
    loop {
        let n = resp
            .read(&mut buf)
            .map_err(|e| PipelineError::Io(format!("đứt kết nối khi tải {url}: {e}")))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
        file.write_all(&buf[..n]).map_err(|e| PipelineError::Io(e.to_string()))?;
        done += n as u64;
        if last.elapsed() >= std::time::Duration::from_millis(100) {
            last = std::time::Instant::now();
            on(Progress::Download { done, total });
        }
    }
    file.flush().map_err(|e| PipelineError::Io(e.to_string()))?;
    drop(file);
    on(Progress::Download { done, total });

    let got = format!("{:x}", hasher.finalize());
    if !got.eq_ignore_ascii_case(expected_sha256) {
        let _ = std::fs::remove_file(dest);
        return Err(PipelineError::ChecksumMismatch {
            expected: expected_sha256.to_string(),
            got,
        });
    }
    Ok(())
}
