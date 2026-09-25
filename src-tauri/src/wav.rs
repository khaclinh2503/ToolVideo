use crate::error::PipelineError;
use std::path::Path;

fn u16le(b: &[u8], at: usize) -> u16 {
    u16::from_le_bytes([b[at], b[at + 1]])
}

fn u32le(b: &[u8], at: usize) -> u32 {
    u32::from_le_bytes([b[at], b[at + 1], b[at + 2], b[at + 3]])
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct WavInfo {
    pub sample_rate: u32,
    pub channels: u16,
    pub bits: u16,
    /// Offset byte của thân chunk `data` trong file.
    pub data_off: usize,
    pub data_len: usize,
}

fn bad(path: &Path) -> PipelineError {
    PipelineError::Io(format!("wav không hợp lệ: {}", path.display()))
}

/// Duyệt chunk RIFF thật sự, không giả định header 44 byte.
fn parse(b: &[u8], path: &Path) -> Result<WavInfo, PipelineError> {
    if b.len() < 12 || &b[0..4] != b"RIFF" || &b[8..12] != b"WAVE" {
        return Err(bad(path));
    }

    let mut sample_rate: u32 = 0;
    let mut channels: u16 = 0;
    let mut bits: u16 = 0;
    let mut pos = 12usize;

    while pos + 8 <= b.len() {
        let id = &b[pos..pos + 4];
        let len = u32le(b, pos + 4) as usize;
        let body = pos + 8;
        if body + len > b.len() {
            return Err(bad(path));
        }
        if id == b"fmt " {
            if len < 16 {
                return Err(bad(path));
            }
            channels = u16le(b, body + 2);
            sample_rate = u32le(b, body + 4);
            bits = u16le(b, body + 14);
        } else if id == b"data" {
            if sample_rate == 0 || channels == 0 || bits == 0 {
                return Err(bad(path));
            }
            return Ok(WavInfo { sample_rate, channels, bits, data_off: body, data_len: len });
        }
        // chunk luôn căn chẵn 2 byte
        pos = body + len + (len % 2);
    }
    Err(bad(path))
}

fn read_all(path: &Path) -> Result<Vec<u8>, PipelineError> {
    std::fs::read(path)
        .map_err(|e| PipelineError::Io(format!("không đọc được wav {}: {e}", path.display())))
}

pub fn read_info(path: &Path) -> Result<WavInfo, PipelineError> {
    let b = read_all(path)?;
    parse(&b, path)
}

/// Độ dài (ms) của file WAV PCM.
pub fn duration_ms(path: &Path) -> Result<u64, PipelineError> {
    let i = read_info(path)?;
    let bytes_per_sec = i.sample_rate as u64 * i.channels as u64 * (i.bits as u64 / 8);
    if bytes_per_sec == 0 {
        return Err(bad(path));
    }
    Ok(i.data_len as u64 * 1000 / bytes_per_sec)
}

/// Đọc mẫu PCM 16-bit mono. Không tự downmix, không tự đổi tần số: Piper luôn
/// ra mono 16-bit, nên khác đi là dấu hiệu cache lẫn giữa hai lần cấu hình —
/// im lặng chuyển đổi chỉ giấu lỗi đi.
pub fn read_pcm16_mono(path: &Path) -> Result<(u32, Vec<i16>), PipelineError> {
    let b = read_all(path)?;
    let i = parse(&b, path)?;
    if i.channels != 1 {
        return Err(PipelineError::Io(format!(
            "{} có {} kênh, cần wav mono",
            path.display(),
            i.channels
        )));
    }
    if i.bits != 16 {
        return Err(PipelineError::Io(format!(
            "{} là wav {} bit, cần 16 bit",
            path.display(),
            i.bits
        )));
    }
    let end = i.data_off + (i.data_len - i.data_len % 2);
    let mut v = Vec::with_capacity((end - i.data_off) / 2);
    let mut k = i.data_off;
    while k + 2 <= end {
        v.push(i16::from_le_bytes([b[k], b[k + 1]]));
        k += 2;
    }
    Ok((i.sample_rate, v))
}

/// Ghi wav PCM 16-bit mono chuẩn 44-byte header.
pub fn write_pcm16_mono(path: &Path, rate: u32, samples: &[i16]) -> Result<(), PipelineError> {
    let data_len = samples
        .len()
        .checked_mul(2)
        .and_then(|n| u32::try_from(n).ok())
        .filter(|n| *n <= u32::MAX - 36)
        .ok_or_else(|| {
            PipelineError::Io(format!(
                "dải audio quá dài để ghi vào wav ({} mẫu) — định dạng RIFF giới hạn 4 GB",
                samples.len()
            ))
        })?;

    if let Some(d) = path.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }

    let mut b = Vec::with_capacity(44 + data_len as usize);
    b.extend_from_slice(b"RIFF");
    b.extend_from_slice(&(36 + data_len).to_le_bytes());
    b.extend_from_slice(b"WAVEfmt ");
    b.extend_from_slice(&16u32.to_le_bytes());
    b.extend_from_slice(&1u16.to_le_bytes()); // PCM
    b.extend_from_slice(&1u16.to_le_bytes()); // mono
    b.extend_from_slice(&rate.to_le_bytes());
    b.extend_from_slice(&(rate * 2).to_le_bytes()); // byte/giây
    b.extend_from_slice(&2u16.to_le_bytes()); // block align
    b.extend_from_slice(&16u16.to_le_bytes()); // bits
    b.extend_from_slice(b"data");
    b.extend_from_slice(&data_len.to_le_bytes());
    for s in samples {
        b.extend_from_slice(&s.to_le_bytes());
    }

    std::fs::write(path, b)
        .map_err(|e| PipelineError::Io(format!("không ghi được wav {}: {e}", path.display())))
}
