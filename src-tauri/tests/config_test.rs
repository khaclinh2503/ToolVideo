#[test]
fn stt_defaults_match_spec() {
    assert_eq!(app_lib::config::stt_defaults::VAD_THRESHOLD, 0.25);
    assert_eq!(app_lib::config::stt_defaults::NUM_THREADS, 4);
    assert_eq!(app_lib::config::stt_defaults::SAMPLE_RATE, 16000);
}

use app_lib::config::{AppConfig, OpenAiConfig};

#[test]
fn config_defaults_match_spec() {
    let c = AppConfig::default();
    assert_eq!(c.translate.default_provider, "google_free");
    assert_eq!(c.translate.target_lang, "vi");
    assert_eq!(c.translate.openai.base_url, "https://api.openai.com/v1");
    assert_eq!(c.translate.openai.model, "gpt-4o-mini");
    assert_eq!(c.translate.openai.api_key, "");
}

#[test]
fn config_json_roundtrip_and_debug_redacts_key() {
    let mut c = AppConfig::default();
    c.translate.openai.api_key = "sk-secret-123".into();
    let json = serde_json::to_string(&c).unwrap();
    let back: AppConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(back.translate.openai.api_key, "sk-secret-123");
    let dbg = format!("{:?}", OpenAiConfig { api_key: "sk-secret-123".into(), ..Default::default() });
    assert!(!dbg.contains("sk-secret-123"));
    assert!(dbg.contains("***"));
}

#[test]
fn broken_json_falls_back_to_default() {
    let v: Result<AppConfig, _> = serde_json::from_str("{not json");
    assert!(v.is_err()); // load_config phải bắt lỗi này và trả Default (kiểm tra qua hàm helper bên dưới)
    assert_eq!(app_lib::config::parse_config_or_default("{not json").translate.default_provider, "google_free");
}

#[test]
fn tts_config_defaults_and_backward_compat() {
    // config.json cũ của M2 (không có khối "tts") vẫn đọc được, dùng mặc định.
    let old = r#"{"translate":{"default_provider":"google_free","target_lang":"vi",
        "openai":{"base_url":"https://api.openai.com/v1","api_key":"","model":"gpt-4o-mini"}}}"#;
    let cfg = app_lib::config::parse_config_or_default(old);
    assert_eq!(cfg.tts.default_provider, "piper");
    assert_eq!(cfg.tts.voice, "vi_VN-vais1000-medium");
    assert!((cfg.tts.length_scale - 1.0).abs() < 1e-6);
}
