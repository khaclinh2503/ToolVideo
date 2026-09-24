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
