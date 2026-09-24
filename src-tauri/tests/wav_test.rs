use app_lib::wav::duration_ms;
use std::io::Write;

/// Dựng 1 file WAV PCM hợp lệ; `extra_chunk` cho phép chèn 1 chunk lạ trước `data`.
fn make_wav(path: &std::path::Path, sample_rate: u32, channels: u16, frames: u32, extra_chunk: bool) {
    let bits: u16 = 16;
    let block_align = channels * bits / 8;
    let data_len = frames * block_align as u32;
    let extra: Vec<u8> = if extra_chunk {
        let payload = b"INFOhello world!";
        let mut v = Vec::new();
        v.extend_from_slice(b"LIST");
        v.extend_from_slice(&(payload.len() as u32).to_le_bytes());
        v.extend_from_slice(payload);
        v
    } else {
        Vec::new()
    };
    let riff_len = 4 + (8 + 16) + extra.len() as u32 + (8 + data_len);

    let mut f = std::fs::File::create(path).unwrap();
    f.write_all(b"RIFF").unwrap();
    f.write_all(&riff_len.to_le_bytes()).unwrap();
    f.write_all(b"WAVE").unwrap();
    f.write_all(b"fmt ").unwrap();
    f.write_all(&16u32.to_le_bytes()).unwrap();
    f.write_all(&1u16.to_le_bytes()).unwrap();             // PCM
    f.write_all(&channels.to_le_bytes()).unwrap();
    f.write_all(&sample_rate.to_le_bytes()).unwrap();
    f.write_all(&(sample_rate * block_align as u32).to_le_bytes()).unwrap();
    f.write_all(&block_align.to_le_bytes()).unwrap();
    f.write_all(&bits.to_le_bytes()).unwrap();
    f.write_all(&extra).unwrap();
    f.write_all(b"data").unwrap();
    f.write_all(&data_len.to_le_bytes()).unwrap();
    f.write_all(&vec![0u8; data_len as usize]).unwrap();
}

#[test]
fn duration_of_plain_wav() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("a.wav");
    make_wav(&p, 22050, 1, 22050, false); // đúng 1 giây
    assert_eq!(duration_ms(&p).unwrap(), 1000);
}

#[test]
fn duration_skips_unknown_chunk_before_data() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("b.wav");
    make_wav(&p, 16000, 1, 8000, true); // 0.5 giây, có chunk LIST chen vào
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn duration_handles_stereo() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("c.wav");
    make_wav(&p, 48000, 2, 24000, false); // 0.5 giây stereo
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn truncated_file_is_error_not_panic() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("d.wav");
    std::fs::write(&p, b"RIFF\x04\x00\x00\x00WAV").unwrap();
    assert!(duration_ms(&p).is_err());
}

#[test]
fn missing_file_is_error() {
    assert!(duration_ms(std::path::Path::new("khong-ton-tai.wav")).is_err());
}
