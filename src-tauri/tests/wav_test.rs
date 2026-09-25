use app_lib::wav::{duration_ms, read_info, read_pcm16_mono, write_pcm16_mono};
use std::io::Write;

/// Dựng 1 file WAV PCM hợp lệ; `extra_chunk` cho phép chèn 1 chunk lạ trước `data`.
fn make_wav(path: &std::path::Path, sample_rate: u32, channels: u16, frames: u32, bits: u16, extra_chunk: bool) {
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
    make_wav(&p, 22050, 1, 22050, 16, false); // đúng 1 giây
    assert_eq!(duration_ms(&p).unwrap(), 1000);
}

#[test]
fn duration_skips_unknown_chunk_before_data() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("b.wav");
    make_wav(&p, 16000, 1, 8000, 16, true); // 0.5 giây, có chunk LIST chen vào
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn duration_handles_stereo() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("c.wav");
    make_wav(&p, 48000, 2, 24000, 16, false); // 0.5 giây stereo
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn truncated_header_is_error_not_panic() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("d.wav");
    std::fs::write(&p, b"RIFF\x04\x00\x00\x00WAV").unwrap();
    assert!(duration_ms(&p).is_err());
}

#[test]
fn truncated_data_chunk_is_error_not_panic() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("e.wav");
    let mut f = std::fs::File::create(&p).unwrap();
    f.write_all(b"RIFF").unwrap();
    let riff_len: u32 = 4 + (8 + 16) + (8 + 100000);
    f.write_all(&riff_len.to_le_bytes()).unwrap();
    f.write_all(b"WAVE").unwrap();
    f.write_all(b"fmt ").unwrap();
    f.write_all(&16u32.to_le_bytes()).unwrap();
    f.write_all(&1u16.to_le_bytes()).unwrap();             // PCM
    f.write_all(&1u16.to_le_bytes()).unwrap();             // channels
    f.write_all(&22050u32.to_le_bytes()).unwrap();         // sample_rate
    f.write_all(&(22050u32 * 2u32).to_le_bytes()).unwrap(); // byte rate
    f.write_all(&2u16.to_le_bytes()).unwrap();             // block align
    f.write_all(&16u16.to_le_bytes()).unwrap();            // bits
    f.write_all(b"data").unwrap();
    f.write_all(&100000u32.to_le_bytes()).unwrap(); // data chunk declares 100000 bytes
    f.write_all(&[0u8; 100]).unwrap(); // but only provide 100 bytes
    assert!(duration_ms(&p).is_err());
}

#[test]
fn odd_length_chunk_padding_is_handled() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("f.wav");
    let mut f = std::fs::File::create(&p).unwrap();
    let payload = b"INFOx"; // 15 bytes (odd length)
    let extra_len = 4 + 4 + payload.len() as u32; // "LIST" + size + payload
    let data_len: u32 = 16000; // 0.5 second at 16000 Hz, 1 channel, 16-bit = 16000*2 bytes
    let riff_len = 4 + (8 + 16) + extra_len + (8 + data_len);
    f.write_all(b"RIFF").unwrap();
    f.write_all(&riff_len.to_le_bytes()).unwrap();
    f.write_all(b"WAVE").unwrap();
    f.write_all(b"fmt ").unwrap();
    f.write_all(&16u32.to_le_bytes()).unwrap();
    f.write_all(&1u16.to_le_bytes()).unwrap();             // PCM
    f.write_all(&1u16.to_le_bytes()).unwrap();             // channels
    f.write_all(&16000u32.to_le_bytes()).unwrap();         // sample_rate
    f.write_all(&(16000u32 * 2u32).to_le_bytes()).unwrap(); // byte rate
    f.write_all(&2u16.to_le_bytes()).unwrap();             // block align
    f.write_all(&16u16.to_le_bytes()).unwrap();            // bits
    f.write_all(b"LIST").unwrap();
    f.write_all(&(payload.len() as u32).to_le_bytes()).unwrap();
    f.write_all(payload).unwrap();
    f.write_all(&[0u8; 1]).unwrap(); // 1 byte padding to align odd chunk
    f.write_all(b"data").unwrap();
    f.write_all(&data_len.to_le_bytes()).unwrap();
    f.write_all(&vec![0u8; data_len as usize]).unwrap();
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn non_whole_millisecond_duration_truncates() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("g.wav");
    // sample_rate=7, channels=1, bits=16, frames=1
    // bytes_per_sec = 7*1*2 = 14
    // data_len = 1*2 = 2
    // true duration = 2*1000/14 = 142.857... -> truncates to 142
    make_wav(&p, 7, 1, 1, 16, false);
    assert_eq!(duration_ms(&p).unwrap(), 142);
}

#[test]
fn eight_bit_depth_is_handled() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("h.wav");
    make_wav(&p, 22050, 1, 22050, 8, false); // 1 second at 8-bit
    assert_eq!(duration_ms(&p).unwrap(), 1000);
}

#[test]
fn twenty_four_bit_depth_is_handled() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("i.wav");
    make_wav(&p, 48000, 1, 48000, 24, false); // 1 second at 24-bit
    assert_eq!(duration_ms(&p).unwrap(), 1000);
}

#[test]
fn missing_file_is_error() {
    assert!(duration_ms(std::path::Path::new("khong-ton-tai.wav")).is_err());
}

#[test]
fn read_info_khop_voi_header() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("a.wav");
    make_wav(&p, 22050, 1, 100, 16, false);
    let i = read_info(&p).unwrap();
    assert_eq!(i.sample_rate, 22050);
    assert_eq!(i.channels, 1);
    assert_eq!(i.bits, 16);
    assert_eq!(i.data_len, 200, "100 frame × 2 byte");
}

#[test]
fn read_info_bo_qua_chunk_la_truoc_data() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("b.wav");
    make_wav(&p, 16000, 1, 50, 16, true); // có chunk LIST chen vào
    let i = read_info(&p).unwrap();
    assert_eq!(i.sample_rate, 16000);
    assert_eq!(i.data_len, 100);
}

#[test]
fn ghi_roi_doc_lai_ra_dung_mau() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("rt.wav");
    let src: Vec<i16> = vec![0, 1, -1, 32767, -32768, 1234];
    write_pcm16_mono(&p, 22050, &src).unwrap();

    let (rate, got) = read_pcm16_mono(&p).unwrap();
    assert_eq!(rate, 22050);
    assert_eq!(got, src);
}

#[test]
fn ghi_roi_doc_lai_bang_duration_ms_cu() {
    // Bộ ghi phải tạo ra wav mà bộ duyệt chunk sẵn có đọc được
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("dur.wav");
    write_pcm16_mono(&p, 1000, &vec![0i16; 2500]).unwrap();
    assert_eq!(app_lib::wav::duration_ms(&p).unwrap(), 2500);
}

#[test]
fn tu_choi_stereo() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("st.wav");
    make_wav(&p, 22050, 2, 100, 16, false);
    let e = read_pcm16_mono(&p).unwrap_err();
    let msg = e.to_string();
    assert!(msg.contains("st.wav"), "lỗi phải nêu tên file: {msg}");
    assert!(msg.contains("mono"), "lỗi phải nói rõ cần mono: {msg}");
}

#[test]
fn tu_choi_24_bit() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("b24.wav");
    make_wav(&p, 22050, 1, 100, 24, false);
    let e = read_pcm16_mono(&p).unwrap_err();
    assert!(e.to_string().contains("16"), "lỗi phải nói rõ cần 16-bit");
}

#[test]
fn doc_file_rong_bao_loi_chu_khong_panic() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("empty.wav");
    std::fs::write(&p, b"").unwrap();
    assert!(read_pcm16_mono(&p).is_err());
    assert!(read_info(&p).is_err());
}
