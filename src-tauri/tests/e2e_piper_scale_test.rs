//! E2E: xác nhận Piper THẬT nghe lệnh ép tốc độ — test lẽ ra phải tồn tại từ
//! M3 (xem task-3b-brief.md). Bỏ qua mặc định; bật bằng:
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_piper_scale_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ Piper + voice.

use app_lib::config::{load_config, models_dir};
use app_lib::tts::{make_provider, TtsJob};
use app_lib::wav;

#[test]
#[ignore]
fn piper_that_nghe_lenh_ep_toc_do_qua_co_dong_lenh() {
    let cfg = load_config();
    let m = models_dir();
    let p = make_provider(&cfg.tts.default_provider, &cfg.tts, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));

    // Thư mục tạm tự dọn khi biến `dir` bị drop cuối hàm — không đụng %APPDATA%.
    let dir = tempfile::tempdir().unwrap();
    let text = "Đây là một câu kiểm tra tốc độ đọc của Piper.";

    let out_nen = dir.path().join("scale-1_0.wav");
    p.synthesize(
        &[TtsJob { index: 1, text: text.into(), out: out_nen.clone(), length_scale: 1.0 }],
        &mut |_| {},
    )
    .unwrap_or_else(|e| panic!("tổng hợp length_scale=1.0 lỗi: {e}"));
    let dur_nen = wav::duration_ms(&out_nen).unwrap();

    let out_ep = dir.path().join("scale-0_6.wav");
    p.synthesize(
        &[TtsJob { index: 2, text: text.into(), out: out_ep.clone(), length_scale: 0.6 }],
        &mut |_| {},
    )
    .unwrap_or_else(|e| panic!("tổng hợp length_scale=0.6 lỗi: {e}"));
    let dur_ep = wav::duration_ms(&out_ep).unwrap();

    println!("length_scale=1.0 ⇒ {dur_nen} ms; length_scale=0.6 ⇒ {dur_ep} ms");

    // Ngưỡng 15% chọn từ số đo thật (task-3b-brief.md): ở 0.6, cờ CLI cho
    // 1.2539s so với nền 1.73s (~27% ngắn hơn); nhiễu suy diễn của Piper qua
    // khoá JSON (bị bỏ qua) đo được ~3%. 15% nằm giữa, đủ xa cả hai phía —
    // nhiễu không thể làm test xanh, hành vi thật cũng không làm nó đỏ oan.
    let nguong = dur_nen * 85 / 100;
    assert!(
        dur_ep < nguong,
        "length_scale=0.6 phải ngắn hơn ít nhất 15% so với length_scale=1.0: {dur_ep}ms so với ngưỡng {nguong}ms (nền {dur_nen}ms)"
    );
}
