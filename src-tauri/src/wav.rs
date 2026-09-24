use crate::error::PipelineError;
use std::path::Path;

fn u16le(b: &[u8], at: usize) -> u16 {
    u16::from_le_bytes([b[at], b[at + 1]])
}

fn u32le(b: &[u8], at: usize) -> u32 {
    u32::from_le_bytes([b[at], b[at + 1], b[at + 2], b[at + 3]])
}

/// Độ dài (ms) của file WAV PCM. Duyệt chunk thật sự, không giả định header 44 byte.
pub fn duration_ms(path: &Path) -> Result<u64, PipelineError> {
    let b = std::fs::read(path)
        .map_err(|e| PipelineError::Io(format!("không đọc được wav {}: {e}", path.display())))?;
    let bad = || PipelineError::Io(format!("wav không hợp lệ: {}", path.display()));

    if b.len() < 12 || &b[0..4] != b"RIFF" || &b[8..12] != b"WAVE" {
        return Err(bad());
    }

    let mut sample_rate: u32 = 0;
    let mut channels: u16 = 0;
    let mut bits: u16 = 0;
    let mut pos = 12usize;

    while pos + 8 <= b.len() {
        let id = &b[pos..pos + 4];
        let len = u32le(&b, pos + 4) as usize;
        let body = pos + 8;
        if body + len > b.len() {
            return Err(bad());
        }
        if id == b"fmt " {
            if len < 16 {
                return Err(bad());
            }
            channels = u16le(&b, body + 2);
            sample_rate = u32le(&b, body + 4);
            bits = u16le(&b, body + 14);
        } else if id == b"data" {
            if sample_rate == 0 || channels == 0 || bits == 0 {
                return Err(bad());
            }
            let bytes_per_sec = sample_rate as u64 * channels as u64 * (bits as u64 / 8);
            if bytes_per_sec == 0 {
                return Err(bad());
            }
            return Ok(len as u64 * 1000 / bytes_per_sec);
        }
        // chunk luôn căn chẵn 2 byte
        pos = body + len + (len % 2);
    }
    Err(bad())
}
