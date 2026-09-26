//! E2E: nghe thử giọng trước khi chọn.
//!
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_VIENEU="1"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_demo_test -- --ignored --nocapture

use app_lib::commands::tao_demo;
use app_lib::config::models_dir;

#[test]
#[ignore]
fn demo_sinh_duoc_va_lan_hai_dung_lai_ban_cu() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy engine thật"
    );
    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu");
        return;
    }

    let d = tempfile::tempdir().unwrap();

    let t0 = std::time::Instant::now();
    let a = tao_demo("vieneu", "Mai Anh", &m, d.path()).expect("sinh demo");
    let giay_dau = t0.elapsed().as_secs_f32();
    assert!(a.exists(), "phải ghi ra file");
    let dai = app_lib::wav::duration_ms(&a).unwrap();
    assert!(dai > 1000, "câu demo quá ngắn: {dai} ms");
    assert_eq!(app_lib::wav::read_info(&a).unwrap().sample_rate, 48_000);

    // Lần hai CÙNG giọng: phải dùng lại file cũ, không sinh lại.
    let t1 = std::time::Instant::now();
    let b = tao_demo("vieneu", "Mai Anh", &m, d.path()).expect("lần hai");
    let giay_hai = t1.elapsed().as_secs_f32();
    assert_eq!(a, b, "cùng giọng phải ra cùng đường dẫn");
    assert!(
        giay_hai < 1.0,
        "lần hai phải tức thì (dùng lại), nhận {giay_hai:.1}s so với {giay_dau:.1}s"
    );

    // Giọng KHÁC phải ra file khác — nếu khoá không tính giọng thì hai giọng
    // dùng chung một file và người dùng nghe thử giọng nào cũng như nhau.
    let c = tao_demo("vieneu", "Hải Đăng", &m, d.path()).expect("giọng khác");
    assert_ne!(a, c, "hai giọng khác nhau phải ra hai file khác nhau");
    println!(
        "demo: {dai} ms, lần đầu {giay_dau:.1}s, lần hai {giay_hai:.2}s, giọng khác ⇒ file khác"
    );
}
