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
    let long = "a".repeat(500);
    let s = e(Some(200), &long).to_string();
    assert!(s.len() < 300, "msg phải bị cắt ~200 ký tự");
}
