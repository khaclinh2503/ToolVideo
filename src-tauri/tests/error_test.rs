use app_lib::error::PipelineError;

#[test]
fn engine_failed_display_shows_last_20_lines() {
    let lines: Vec<String> = (1..=30).map(|i| format!("line {i}")).collect();
    let stderr = lines.join("\n");
    let err = PipelineError::EngineFailed {
        stage: "stt".into(),
        code: 1,
        stderr,
    };
    let msg = err.to_string();
    assert!(msg.contains("[engine_failed]"));
    assert!(msg.contains("line 30"));
    assert!(!msg.lines().any(|l| l.trim() == "line 5"));
}

#[test]
fn no_audio_stream_display() {
    let err = PipelineError::NoAudioStream;
    assert!(err.to_string().contains("[no_audio_stream]"));
}

#[test]
fn provider_error_display_maps_status_to_vietnamese() {
    let e = |status: Option<u16>, msg: &str| PipelineError::ProviderError { provider: "openai_compat".into(), status, msg: msg.into() };
    assert_eq!(e(Some(401), "x").code(), "provider_error");
    assert!(e(Some(401), "x").to_string().contains("[provider_error] openai_compat: API key sai hoặc không có quyền"));
    assert!(e(Some(429), "x").to_string().contains("Quá giới hạn gọi API"));
    assert!(e(Some(503), "x").to_string().contains("Dịch vụ lỗi phía server (503)"));
    assert!(e(None, "Hết thời gian chờ").to_string().contains("Hết thời gian chờ"));
    let long = "a".repeat(5000);
    let s = e(Some(200), &long).to_string();
    assert!(s.chars().count() < 1100, "msg vẫn phải có chặn trên: {}", s.chars().count());
}

/// Chuỗi chẩn đoán dài phải giữ được PHẦN CUỐI.
///
/// Đây là lỗi thật của M9: thông báo "llama-server đã tắt" mở đầu bằng ~100 ký
/// tự tiền tố rồi mới tới đuôi stderr xếp cũ-trước-mới-sau, nên cắt cứng ở 200
/// ký tự chỉ chừa lại dòng banner build của llama.cpp — người dùng không có GPU
/// NVIDIA đọc xong vẫn không biết vì sao. Lỗi thật luôn ở cuối.
#[test]
fn provider_error_dai_van_doc_duoc_phan_cuoi_va_phan_dau() {
    let msg = format!(
        "llama-server đã tắt (mã Some(3221225781)) trước khi sẵn sàng dịch: {}{}",
        "build: 11256 (abcdef) with MSVC | ".repeat(80),
        "CUDA error: no kernel image is available for execution on the device"
    );
    let e = PipelineError::ProviderError {
        provider: "llm_tren_may".into(),
        status: None,
        msg,
    };
    let s = e.to_string();
    assert!(
        s.contains("CUDA error: no kernel image is available"),
        "phần cuối — nơi có lỗi thật — phải sống sót: {s}"
    );
    assert!(
        s.contains("llama-server đã tắt"),
        "phần đầu nói chuyện gì hỏng cũng phải sống sót: {s}"
    );
    assert!(
        s.chars().count() < 1200,
        "vẫn phải có chặn trên, không đổ cả trang log ra giao diện: {}",
        s.chars().count()
    );
}
