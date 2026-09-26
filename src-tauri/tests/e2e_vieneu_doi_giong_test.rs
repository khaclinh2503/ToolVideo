//! E2E: đổi giọng phải THẬT SỰ ra audio khác.
//!
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_VIENEU="1"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_doi_giong_test -- --ignored --nocapture
//!
//! Vì sao cần: `vieneu_test.rs` chỉ khẳng định dòng JSON có mang khoá `voice`
//! — tức khẳng định thứ ta GỬI ĐI, không khẳng định thứ engine LÀM với nó.
//! Đó đúng là chỗ mù đã để `--length_scale` của Piper thành no-op suốt từ M3
//! tới khi phát hiện ở M6: test đơn vị xanh, engine phớt lờ tham số, không ai
//! biết. Test này đóng đúng chỗ mù đó cho tham số `voice`.

use app_lib::config::models_dir;
use app_lib::tts::{vieneu::VieNeu, TtsJob, TtsProvider};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};

fn sha256(p: &Path) -> String {
    format!("{:x}", Sha256::digest(std::fs::read(p).unwrap()))
}

fn provider(models: &Path, giong: &str) -> VieNeu {
    VieNeu {
        python: models.join("python").join("python.exe"),
        bridge: app_lib::tts::vieneu::ensure_bridge_script(models).unwrap(),
        site_packages: app_lib::pyenv::site_packages(models),
        hf_home: models.join("vieneu").join("cache"),
        voice: giong.to_string(),
        models_dir: models.join("vieneu"),
        ffmpeg: models.join("ffmpeg").join("ffmpeg.exe"),
    }
}

fn job(index: usize, out: PathBuf) -> TtsJob {
    TtsJob {
        index,
        text: "Xin chào, đây là câu kiểm tra đổi giọng.".into(),
        out,
        length_scale: 1.0,
    }
}

#[test]
#[ignore]
fn hai_giong_khac_nhau_cho_ra_audio_khac_nhau() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy engine thật"
    );

    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu ở {}", m.display());
        return;
    }

    let d = tempfile::tempdir().unwrap();
    let a = d.path().join("nu.wav");
    let b = d.path().join("nam.wav");

    // Hai giọng KHÁC GIỚI cho khác biệt rõ nhất. Không dùng "Mạnh Dũng" —
    // giọng đó nằm trong manifest GGUF trên HuggingFace nhưng KHÔNG có trong
    // SDK ONNX/Python mà app dùng.
    provider(&m, "Mai Anh")
        .synthesize(&[job(1, a.clone())], &mut |_| {})
        .expect("tổng hợp giọng nữ phải chạy được");
    provider(&m, "Hải Đăng")
        .synthesize(&[job(1, b.clone())], &mut |_| {})
        .expect("tổng hợp giọng nam phải chạy được");

    let ha = sha256(&a);
    let hb = sha256(&b);
    let da = app_lib::wav::duration_ms(&a).unwrap();
    let db = app_lib::wav::duration_ms(&b).unwrap();
    println!("Mai Anh: {da} ms, sha {}…", &ha[..12]);
    println!("Hải Đăng: {db} ms, sha {}…", &hb[..12]);

    // ĐÂY là khẳng định quan trọng: nếu engine bỏ qua tham số `voice` thì hai
    // file sẽ giống hệt nhau và test đỏ.
    assert_ne!(ha, hb, "đổi giọng mà audio y hệt ⇒ engine đang bỏ qua tham số voice");

    // Cả hai phải là audio thật, không phải file rỗng.
    assert!(da > 500, "giọng nữ quá ngắn: {da} ms");
    assert!(db > 500, "giọng nam quá ngắn: {db} ms");

    // Tần số phải đúng 48 kHz — compose.rs so tần số từng wav với manifest.
    for p in [&a, &b] {
        assert_eq!(
            app_lib::wav::read_info(p).unwrap().sample_rate,
            48_000,
            "{} phải là 48 kHz",
            p.display()
        );
    }
}

#[test]
#[ignore]
fn giong_khong_ton_tai_thi_bao_loi_chu_khong_doc_bang_giong_khac() {
    assert_eq!(std::env::var("DVL_E2E_VIENEU").as_deref(), Ok("1"));
    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu");
        return;
    }

    let d = tempfile::tempdir().unwrap();
    // `mai_anh` là id dạng slug lấy nhầm từ gguf/voices/manifest.json — SDK
    // không nhận. Phải BÁO LỖI chứ không được lặng lẽ rơi về giọng mặc định:
    // người dùng chọn một giọng rồi nghe ra giọng khác là kiểu hỏng tệ nhất.
    let err = provider(&m, "mai_anh")
        .synthesize(&[job(1, d.path().join("x.wav"))], &mut |_| {})
        .unwrap_err();
    println!("lỗi nhận được: {err}");
    assert_eq!(err.code(), "engine_failed", "nhận: {err}");
}
