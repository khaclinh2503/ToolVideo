#[test]
fn stt_defaults_match_spec() {
    assert_eq!(app_lib::config::stt_defaults::VAD_THRESHOLD, 0.25);
    assert_eq!(app_lib::config::stt_defaults::NUM_THREADS, 4);
    assert_eq!(app_lib::config::stt_defaults::SAMPLE_RATE, 16000);
}
