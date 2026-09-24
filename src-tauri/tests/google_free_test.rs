use app_lib::error::PipelineError;
use app_lib::translate::{google_free::GoogleFree, TranslateProvider};
use httpmock::prelude::*;

#[test]
fn parses_gtx_response_and_sends_params() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(GET).path("/translate_a/single")
            .query_param("client", "gtx").query_param("sl", "auto").query_param("tl", "vi")
            .query_param("dt", "t").query_param("q", "你好");
        then.status(200).body(r#"[[["Xin chào","你好",null,null,10]],null,"zh"]"#);
    });
    let p = GoogleFree::with_endpoint(server.url("/translate_a/single"));
    assert_eq!(p.id(), "google_free");
    assert_eq!(p.batch_size(), 20);
    let out = p.translate_batch(&["你好"], "auto", "vi").unwrap();
    assert_eq!(out, vec!["Xin chào"]);
    m.assert();
}

#[test]
fn concatenates_multi_sentence_chunks() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET);
        then.status(200).body(r#"[[["Câu một. ","句一。",null,null,1],["Câu hai.","句二。",null,null,1]],null,"zh"]"#);
    });
    let p = GoogleFree::with_endpoint(server.url("/translate_a/single"));
    assert_eq!(p.translate_batch(&["句一。句二。"], "auto", "vi").unwrap(), vec!["Câu một. Câu hai."]);
}

#[test]
fn http_429_and_weird_body_are_provider_errors() {
    let server = MockServer::start();
    server.mock(|when, then| { when.method(GET).query_param("q", "a"); then.status(429).body("slow down"); });
    server.mock(|when, then| { when.method(GET).query_param("q", "b"); then.status(200).body("<html>captcha</html>"); });
    let p = GoogleFree::with_endpoint(server.url("/translate_a/single"));
    match p.translate_batch(&["a"], "auto", "vi").unwrap_err() {
        PipelineError::ProviderError { status, .. } => assert_eq!(status, Some(429)),
        e => panic!("{e:?}"),
    }
    match p.translate_batch(&["b"], "auto", "vi").unwrap_err() {
        PipelineError::ProviderError { status, msg, .. } => { assert_eq!(status, Some(200)); assert!(msg.contains("captcha")); }
        e => panic!("{e:?}"),
    }
}
