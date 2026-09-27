//! Dựng khung hình thật bằng ĐÚNG tham số app sinh ra, để chắc kiểu chữ có tác
//! dụng thật chứ không bị ffmpeg lặng lẽ bỏ qua (ffmpeg không báo lỗi khi gặp
//! khoá force_style lạ, nên test so chuỗi không phát hiện được).
//!
//! Chạy: $env:DVL_E2E_CLIP="<video>"
//!       cargo test --manifest-path src-tauri/Cargo.toml --test kieu_chu_that_test -- --ignored --nocapture

use app_lib::export::{build_preview_frame_args, SubStyle};
use std::path::{Path, PathBuf};
use std::process::Command;

fn ffmpeg() -> PathBuf {
    app_lib::config::models_dir().join("ffmpeg").join("ffmpeg.exe")
}

fn dung(thu_muc: &Path, style: &SubStyle, ten: &str, clip: &Path) -> PathBuf {
    let ra = thu_muc.join(ten);
    let args = build_preview_frame_args(clip, "xem-thu.srt", 2000, Some(style), &ra);
    let out = Command::new(ffmpeg())
        .args(&args)
        .current_dir(thu_muc)
        .output()
        .expect("chạy được ffmpeg");
    assert!(
        out.status.success(),
        "ffmpeg hỏng: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    ra
}

#[test]
#[ignore]
fn doi_kieu_chu_thi_khung_hinh_phai_khac_di() {
    let Ok(clip) = std::env::var("DVL_E2E_CLIP") else {
        eprintln!("đặt DVL_E2E_CLIP=<video> để chạy");
        return;
    };
    let clip = PathBuf::from(clip);
    let d = tempfile::tempdir().unwrap();
    std::fs::write(
        d.path().join("xem-thu.srt"),
        "1\r\n00:00:00,500 --> 00:00:09,000\r\nXin chao day la phu de thu\r\n\r\n",
    )
    .unwrap();

    let mac_dinh = SubStyle::default();
    let to_vang = SubStyle {
        font: "Arial".into(),
        size: 48,
        color: "#FFD400".into(),
        outline_color: "#101010".into(),
        outline: 4,
    };

    let a = dung(d.path(), &mac_dinh, "a.jpg", &clip);
    let b = dung(d.path(), &to_vang, "b.jpg", &clip);
    let c = dung(d.path(), &mac_dinh, "c.jpg", &clip);

    let (da, db, dc) = (
        std::fs::read(&a).unwrap(),
        std::fs::read(&b).unwrap(),
        std::fs::read(&c).unwrap(),
    );
    assert!(!da.is_empty() && !db.is_empty(), "phải ra ảnh");
    // Cùng kiểu chữ ⇒ cùng khung hình: chứng minh khác biệt bên dưới đúng là do
    // kiểu chữ, chứ không phải ffmpeg lấy nhầm khung mỗi lần chạy.
    assert_eq!(da, dc, "cùng kiểu chữ mà ra hai ảnh khác nhau");
    assert_ne!(
        da, db,
        "đổi font/cỡ/màu mà khung hình y hệt ⇒ ffmpeg đã lặng lẽ bỏ qua force_style"
    );
    println!("mặc định {} byte, to-vàng {} byte", da.len(), db.len());
    // Giữ lại để mắt người soi.
    let luu = std::env::temp_dir().join("dvl-kieu-chu");
    std::fs::create_dir_all(&luu).unwrap();
    std::fs::copy(&a, luu.join("mac-dinh.jpg")).unwrap();
    std::fs::copy(&b, luu.join("to-vang.jpg")).unwrap();
    println!("ảnh lưu tại {}", luu.display());
}

/// Chạy đúng cái nút "Xem thử phụ đề" trong app gọi, trên một dự án thật.
///
/// Chạy: $env:DVL_PROJECT="<thư mục dự án>"
///       cargo test --manifest-path src-tauri/Cargo.toml --test kieu_chu_that_test -- --ignored --nocapture nut_xem_thu
#[test]
#[ignore]
fn nut_xem_thu_dung_duoc_tren_du_an_that() {
    let Ok(du_an) = std::env::var("DVL_PROJECT") else {
        eprintln!("đặt DVL_PROJECT=<thư mục dự án> để chạy");
        return;
    };
    let du_an = PathBuf::from(du_an);
    let style = SubStyle {
        font: "Arial".into(),
        size: 40,
        color: "#00E5FF".into(),
        outline_color: "#000000".into(),
        outline: 3,
    };
    let anh = app_lib::commands::tao_xem_thu_phu_de(&du_an, "vi", &style, &ffmpeg())
        .unwrap_or_else(|e| panic!("nút xem thử lỗi: {e}"));
    let n = std::fs::metadata(&anh).expect("phải ra file").len();
    assert!(n > 2_000, "ảnh quá nhỏ, chắc là khung đen: {n} byte");
    println!("ảnh {} ({n} byte)", anh.display());
}
