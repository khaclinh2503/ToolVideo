//! E2E: xác nhận Piper THẬT nghe lệnh ép tốc độ — test lẽ ra phải tồn tại từ
//! M3 (xem task-3b-brief.md). Không cần clip video, chỉ cần model đã cài. Bỏ
//! qua mặc định; bật bằng:
//!   DVL_E2E_TTS_SCALE=1 cargo test --manifest-path src-tauri/Cargo.toml --test e2e_piper_scale_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ Piper + voice.

use app_lib::config::{load_config, models_dir};
use app_lib::tts::{make_provider, TtsJob};
use app_lib::wav;

#[test]
#[ignore]
fn piper_that_nghe_lenh_ep_toc_do_qua_co_dong_lenh() {
    assert_eq!(
        std::env::var("DVL_E2E_TTS_SCALE").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_TTS_SCALE=1 để chạy TTS thật (không cần clip, chỉ cần model đã cài)"
    );
    let cfg = load_config();
    let m = models_dir();
    let p = make_provider(&cfg.tts.default_provider, &cfg.tts, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));

    // Thư mục tạm tự dọn khi biến `dir` bị drop cuối hàm — không đụng %APPDATA%.
    let dir = tempfile::tempdir().unwrap();
    let text = "Đây là một câu kiểm tra tốc độ đọc của Piper.";

    let out_nen = dir.path().join("scale-1_0.wav");
    p.synthesize(
        &[TtsJob { index: 1, text: text.into(), out: out_nen.clone(), length_scale: 1.0, voice: None }],
        &mut |_| {},
    )
    .unwrap_or_else(|e| panic!("tổng hợp length_scale=1.0 lỗi: {e}"));
    let dur_nen = wav::duration_ms(&out_nen).unwrap();

    let out_ep = dir.path().join("scale-0_6.wav");
    p.synthesize(
        &[TtsJob { index: 2, text: text.into(), out: out_ep.clone(), length_scale: 0.6, voice: None }],
        &mut |_| {},
    )
    .unwrap_or_else(|e| panic!("tổng hợp length_scale=0.6 lỗi: {e}"));
    let dur_ep = wav::duration_ms(&out_ep).unwrap();

    println!("length_scale=1.0 ⇒ {dur_nen} ms; length_scale=0.6 ⇒ {dur_ep} ms");

    // Ngưỡng 10%, tính lại từ biên thật thay vì ước lượng (review task-3b,
    // F2). Ba lượt đo cùng tốc độ trong task-3b-brief.md (1.7299 / 1.6834 /
    // 1.6719 giây) cho mỗi phép đo lệch khoảng ±1.7% quanh trung bình do
    // nhiễu suy diễn của Piper.
    //   - Trường hợp thật (hiệu ứng ép ~20%): nếu bản ép đo cao 1.7% còn bản
    //     nền đo thấp 1.7%, tỉ lệ quan sát được xấu nhất là 0.80 × 1.034 ⇒
    //     rút ngắn chỉ còn ~17%.
    //   - Trường hợp lỗi (engine phớt lờ length_scale): hai phép đo lệch
    //     ngược chiều cho rút ngắn biểu kiến tối đa ~3.4%.
    //   ⇒ phân bố thật là "≥17% nếu đúng" và "≤3.4% nếu hỏng"; 10% nằm gần
    //     giữa, cách mỗi phía khoảng 7 điểm phần trăm.
    // Câu kiểm tra ở đây chỉ đo được ~19-20% (không phải ~27% như câu khác
    // trong brief) vì Piper thêm khoảng lặng đầu/cuối không co giãn theo
    // length_scale — biên vẫn đủ rộng so với ngưỡng 10% nên không cần đổi câu.
    let nguong = dur_nen * 90 / 100;
    assert!(
        dur_ep < nguong,
        "length_scale=0.6 phải ngắn hơn ít nhất 10% so với length_scale=1.0: {dur_ep}ms so với ngưỡng {nguong}ms (nền {dur_nen}ms)"
    );
}
