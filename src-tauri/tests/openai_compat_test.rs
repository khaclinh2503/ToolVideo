use app_lib::config::TranslateConfig;
use app_lib::error::PipelineError;
use app_lib::translate::{make_provider, openai_compat::OpenAiCompat, TranslateProvider};
use httpmock::prelude::*;

fn ok_body(items: &str) -> String {
    let content = format!(r#"{{"items":[{items}]}}"#);
    serde_json::json!({"choices":[{"message":{"role":"assistant","content":content}}]}).to_string()
}
fn p(server: &MockServer) -> OpenAiCompat {
    OpenAiCompat {
        base_url: server.url("/v1"),
        api_key: "sk-test".into(),
        model: "gpt-4o-mini".into(),
    }
}

#[test]
fn sends_bearer_json_mode_and_parses_items_sorted_by_i() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .header("authorization", "Bearer sk-test")
            .body_contains(r#""response_format":{"type":"json_object"}"#)
            .body_contains(r#""temperature":0.2"#)
            .body_contains("Bạn là dịch giả phụ đề");
        then.status(200)
            .body(ok_body(r#"{"i":1,"text":"hai"},{"i":0,"text":"một \"q\"\nx"}"#));
    });
    let out = p(&server).translate_batch(&["一", "二"], "zh", "vi").unwrap();
    assert_eq!(out, vec!["một \"q\"\nx", "hai"]);
    m.assert();
    assert_eq!(m.hits(), 1);
    assert_eq!(p(&server).batch_size(), 40);
}

#[test]
fn bad_count_twice_is_error_with_exactly_two_requests() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST);
        then.status(200).body(ok_body(r#"{"i":0,"text":"x"}"#));
    });
    let err = p(&server).translate_batch(&["a", "b"], "zh", "vi").unwrap_err();
    assert!(matches!(err, PipelineError::ProviderError { .. }));
    assert_eq!(m.hits(), 2, "phải retry đúng 1 lần");
}

#[test]
fn good_response_sends_exactly_one_request() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST);
        then.status(200)
            .body(ok_body(r#"{"i":0,"text":"A"},{"i":1,"text":"B"}"#));
    });
    let out = p(&server).translate_batch(&["a", "b"], "zh", "vi").unwrap();
    assert_eq!(out, vec!["A", "B"]);
    assert_eq!(m.hits(), 1);
}

#[test]
fn http_401_is_provider_error_with_vietnamese_message() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST);
        then.status(401).body(r#"{"error":"bad key"}"#);
    });
    let err = p(&server).translate_batch(&["a"], "zh", "vi").unwrap_err();
    match &err {
        PipelineError::ProviderError { status, .. } => assert_eq!(*status, Some(401)),
        e => panic!("{e:?}"),
    }
    assert!(err.to_string().contains("API key sai"));
    // HTTP errors are not retried
    assert_eq!(m.hits(), 1);
}

#[test]
fn make_provider_requires_config() {
    let mut cfg = TranslateConfig::default(); // api_key rỗng
    match make_provider("openai_compat", &cfg) {
        Err(PipelineError::ProviderError { .. }) => {}
        _ => panic!("expected ProviderError for missing config"),
    }
    cfg.openai.api_key = "k".into();
    assert_eq!(make_provider("openai_compat", &cfg).unwrap().id(), "openai_compat");
    assert_eq!(make_provider("google_free", &cfg).unwrap().id(), "google_free");
}
