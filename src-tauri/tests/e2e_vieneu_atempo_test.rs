//! E2E: chứng minh ffmpeg `atempo` THẬT SỰ ép được tốc độ, và ép đúng chiều.
//!
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_VIENEU="1"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_atempo_test -- --ignored --nocapture
//!
//! KHÔNG cần model VieNeu: nguồn âm thanh do chính ffmpeg sinh ra. Đó là chủ ý.
//! Ở M6 phải đo nhiễu trước rồi mới đặt ngưỡng, vì Piper sinh lại audio khác
//! nhau mỗi lượt. Ở đây `atempo` là phép biến đổi xác định trên **cùng một file
//! đầu vào**, nên tỉ lệ đo được phải khớp lý thuyết trong sai số làm tròn khung
//! — không có nhiễu mô hình nào để trừ hao.

use app_lib::config::models_dir;
use app_lib::tts::vieneu::ep_toc_do_tep;
use std::path::{Path, PathBuf};
use std::process::Command;

fn ffmpeg() -> PathBuf {
    models_dir().join("ffmpeg").join("ffmpeg.exe")
}

/// Sinh một file WAV 48 kHz, 16-bit, mono dài `giay` giây bằng chính ffmpeg.
fn sinh_wav(dich: &Path, giay: f32) {
    let out = Command::new(ffmpeg())
        .args([
            "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "lavfi",
            "-i", &format!("sine=frequency=440:duration={giay}:sample_rate=48000"),
            "-ac", "1", "-c:a", "pcm_s16le",
        ])
        .arg(dich)
        .output()
        .expect("chạy được ffmpeg");
    assert!(out.status.success(), "ffmpeg sinh wav lỗi: {}", String::from_utf8_lossy(&out.stderr));
}

#[test]
#[ignore]
fn atempo_ep_dung_chieu_va_dung_ti_le() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy ffmpeg thật"
    );

    let d = tempfile::tempdir().unwrap();
    let goc = d.path().join("goc.wav");
    let ep = d.path().join("ep.wav");

    sinh_wav(&goc, 3.0);
    std::fs::copy(&goc, &ep).unwrap();

    let truoc = app_lib::wav::read_info(&goc).unwrap();
    let dai_truoc = app_lib::wav::duration_ms(&goc).unwrap();

    // length_scale 0.6 = "đọc nhanh hơn" theo quy ước Piper/ScalePlan.
    ep_toc_do_tep(&ffmpeg(), &ep, 0.6, 1).expect("ép tốc độ phải chạy được");

    let sau = app_lib::wav::read_info(&ep).unwrap();
    let dai_sau = app_lib::wav::duration_ms(&ep).unwrap();
    let ti_le = dai_sau as f64 / dai_truoc as f64;
    println!("trước {dai_truoc} ms → sau {dai_sau} ms | tỉ lệ {ti_le:.4} (kỳ vọng ~0.6)");

    // ĐÚNG CHIỀU: phải NGẮN đi. Đảo chiều thì tỉ lệ ra ~1.667 và test này đỏ.
    assert!(
        dai_sau < dai_truoc,
        "đảo chiều rồi: length_scale 0.6 phải cho audio NGẮN hơn, nhận {dai_sau} so với {dai_truoc}"
    );
    // ĐÚNG TỈ LỆ, sai số 10% cho làm tròn khung.
    assert!(
        (ti_le - 0.6).abs() < 0.06,
        "tỉ lệ phải xấp xỉ 0.6, nhận {ti_le:.4}"
    );

    // compose.rs so tần số từng wav với header manifest rồi TỪ CHỐI nếu lệch.
    assert_eq!(sau.sample_rate, 48000, "atempo không được đổi tần số mẫu");
    assert_eq!(sau.sample_rate, truoc.sample_rate);
    assert_eq!(sau.channels, truoc.channels, "atempo không được đổi số kênh");

    // Không để lại tệp tạm.
    assert!(
        !ep.with_extension("wav.tmp").exists(),
        "tệp tạm phải được rename đi, không còn sót"
    );
}

#[test]
#[ignore]
fn he_so_1_thi_khong_dung_toi_file() {
    assert_eq!(std::env::var("DVL_E2E_VIENEU").as_deref(), Ok("1"));
    let d = tempfile::tempdir().unwrap();
    let f = d.path().join("a.wav");
    sinh_wav(&f, 1.0);
    let truoc = std::fs::read(&f).unwrap();

    // ffmpeg cố tình trỏ vào đường dẫn không tồn tại: nếu hàm vẫn gọi ffmpeg
    // thì sẽ ra EngineMissing, nên test này phân biệt được "bỏ qua sớm" với
    // "vẫn chạy rồi tình cờ ra kết quả giống".
    ep_toc_do_tep(Path::new("ffmpeg-khong-ton-tai.exe"), &f, 1.0, 1)
        .expect("hệ số 1.0 phải bỏ qua sớm, không chạm ffmpeg");

    assert_eq!(std::fs::read(&f).unwrap(), truoc, "file không được đụng tới");
}
