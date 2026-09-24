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
fn bad_json_content_is_error_after_retry() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST);
        then.status(200).body(
            serde_json::json!({"choices":[{"message":{"role":"assistant","content":"not json"}}]})
                .to_string(),
        );
    });
    let err = p(&server).translate_batch(&["a", "b"], "zh", "vi").unwrap_err();
    match &err {
        PipelineError::ProviderError { status, .. } => assert_eq!(*status, Some(200)),
        e => panic!("{e:?}"),
    }
    assert_eq!(m.hits(), 2, "phải retry đúng 1 lần trước khi báo lỗi");
}

/// Deterministic two-response fake HTTP server: first connection gets a
/// bad-count body, second gets a valid one. httpmock cannot vary its
/// response between two requests to the same mock, so this proves the
/// retry path succeeds when only the SECOND attempt is valid.
mod fake_server {
    use std::io::{BufRead, BufReader, Read, Write};
    use std::net::TcpStream;

    pub fn read_request(stream: &mut TcpStream) {
        let mut reader = BufReader::new(stream.try_clone().expect("clone stream"));
        let mut content_length = 0usize;
        loop {
            let mut line = String::new();
            reader.read_line(&mut line).expect("read header line");
            if line == "\r\n" || line.is_empty() {
                break;
            }
            if let Some(rest) = line.to_ascii_lowercase().strip_prefix("content-length:") {
                content_length = rest.trim().parse().unwrap_or(0);
            }
        }
        let mut body = vec![0u8; content_length];
        reader.read_exact(&mut body).expect("read body");
    }

    pub fn respond(stream: &mut TcpStream, body: &str) {
        let resp = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
            body.len(),
            body
        );
        stream.write_all(resp.as_bytes()).expect("write response");
        stream.flush().expect("flush response");
    }
}

#[test]
fn retry_succeeds_when_second_attempt_is_valid() {
    use std::net::TcpListener;

    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    let bad_body = ok_body(r#"{"i":0,"text":"x"}"#); // wrong count: 1 item, need 2
    let good_body = ok_body(r#"{"i":0,"text":"A"},{"i":1,"text":"B"}"#);

    let handle = std::thread::spawn(move || {
        for (i, stream) in listener.incoming().enumerate() {
            let mut stream = stream.expect("accept connection");
            fake_server::read_request(&mut stream);
            if i == 0 {
                fake_server::respond(&mut stream, &bad_body);
            } else {
                fake_server::respond(&mut stream, &good_body);
                break;
            }
        }
    });

    let provider = OpenAiCompat {
        base_url: format!("http://{addr}"),
        api_key: "sk-test".into(),
        model: "gpt-4o-mini".into(),
    };
    let out = provider.translate_batch(&["a", "b"], "zh", "vi").unwrap();
    assert_eq!(out, vec!["A", "B"]);
    handle.join().expect("fake server thread");
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
