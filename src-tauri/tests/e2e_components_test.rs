//! E2E: tải & cài thật cả 8 component (~428MB). Bỏ qua mặc định; bật bằng:
//!   DVL_E2E_DOWNLOAD=1 cargo test --test e2e_components_test -- --ignored --nocapture

use app_lib::components::{install_all, specs};
use app_lib::config::models_dir;

#[test]
#[ignore]
fn e2e_install_all_components() {
    assert_eq!(
        std::env::var("DVL_E2E_DOWNLOAD").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_DOWNLOAD=1 để cho phép tải thật"
    );
    let models = models_dir();
    std::fs::create_dir_all(&models).unwrap();

    let t0 = std::time::Instant::now();
    let mut last_id = String::new();
    install_all(&models, &mut |id, p| {
        if id != last_id {
            last_id = id.to_string();
            println!("--> {id}");
        }
        if let app_lib::components::Progress::Download { done, total } = p {
            if total > 0 && (done * 100 / total) % 25 == 0 {
                println!("    {}%", done * 100 / total);
            }
        }
    })
    .unwrap_or_else(|e| panic!("cài thất bại: {e}"));
    println!("cài xong sau {:.0}s", t0.elapsed().as_secs_f32());

    // 5 đường dẫn M1 đòi + piper + voice
    for rel in [
        "ffmpeg/ffmpeg.exe",
        "sherpa/sherpa-onnx-vad-with-offline-asr.exe",
        "sherpa/sense-voice.onnx",
        "sherpa/tokens.txt",
        "sherpa/vad-model.onnx",
        "piper/piper.exe",
        "piper/vi_VN-vais1000-medium.onnx",
        "piper/vi_VN-vais1000-medium.onnx.json",
    ] {
        assert!(models.join(rel).exists(), "thiếu {rel} sau khi cài");
    }

    // Chạy lại: mọi component đều đã cài ⇒ không tải gì nữa.
    for s in specs().unwrap() {
        assert!(app_lib::components::is_installed(&s, &models), "{} phải ở trạng thái đã cài", s.id);
    }
}
