use crate::error::PipelineError;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SegmentEntry {
    /// Số thứ tự cue trong SRT, bắt đầu từ 1.
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    /// Tương đối thư mục `tts/`; `None` khi cue không có lời.
    pub audio_path: Option<String>,
    pub cache_key: Option<String>,
    pub length_scale: f32,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub version: u32,
    pub provider: String,
    pub voice: String,
    pub sample_rate: u32,
    pub segments: Vec<SegmentEntry>,
}

/// Thiếu file hoặc JSON hỏng ⇒ `None` (coi như chưa có cache), không phải lỗi.
pub fn load(path: &Path) -> Option<Manifest> {
    let text = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

/// Ghi qua tmp + rename để không bao giờ để lại manifest dở.
pub fn save(path: &Path, m: &Manifest) -> Result<(), PipelineError> {
    if let Some(d) = path.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let json = serde_json::to_string_pretty(m).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, json).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, path).map_err(|e| PipelineError::Io(e.to_string()))
}
