use crate::error::PipelineError;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};

pub struct ComponentSpec {
    pub id: String,
    pub url: String,
    pub sha256: String,
    pub unpack: bool,
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

pub async fn ensure_component(spec: &ComponentSpec) -> Result<PathBuf, PipelineError> {
    let dir = crate::config::models_dir().join(&spec.id);
    let marker = dir.join(".ok");
    if marker.exists() {
        return Ok(dir);
    }
    std::fs::create_dir_all(&dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let archive = dir.join("download.bin");
    let bytes = reqwest::get(&spec.url)
        .await
        .map_err(|e| PipelineError::Io(e.to_string()))?
        .bytes()
        .await
        .map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::write(&archive, &bytes).map_err(|e| PipelineError::Io(e.to_string()))?;
    verify_sha256(&archive, &spec.sha256)?;
    if spec.unpack {
        let file = std::fs::File::open(&archive).map_err(|e| PipelineError::Io(e.to_string()))?;
        zip::ZipArchive::new(file)
            .map_err(|e| PipelineError::Io(e.to_string()))?
            .extract(&dir)
            .map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    std::fs::write(&marker, b"ok").ok();
    Ok(dir)
}
