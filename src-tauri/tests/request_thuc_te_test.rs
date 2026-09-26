//! In ra ĐÚNG request mà app gửi cho endpoint tương thích-OpenAI, để đối chiếu
//! với đoạn mã mẫu của nhà cung cấp mà không cần khoá thật.
//!
//! Chạy: cargo test --manifest-path src-tauri/Cargo.toml --test request_thuc_te_test -- --ignored --nocapture

use app_lib::translate::{openai_compat::OpenAiCompat, TranslateProvider};
use httpmock::prelude::*;
use std::sync::{Mutex, OnceLock};

/// `httpmock::matches` chỉ nhận con trỏ hàm (không bắt biến được), nên chỗ chứa
/// request bắt được phải là biến static.
static DA_BAT: OnceLock<Mutex<Option<Vec<u8>>>> = OnceLock::new();

fn cho_chua() -> &'static Mutex<Option<Vec<u8>>> {
    DA_BAT.get_or_init(|| Mutex::new(None))
}

fn bat_request(req: &HttpMockRequest) -> bool {
    *cho_chua().lock().unwrap() = req.body.clone();
    true
}

#[test]
#[ignore]
fn in_ra_request_app_gui() {
    let server = MockServer::start();
    let _m = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .matches(bat_request);
        then.status(200)
            .header("content-type", "application/json")
            .body(
                serde_json::json!({"choices":[{"message":{"role":"assistant",
                    "content":"{\"items\":[{\"i\":0,\"text\":\"Xin chào\"},{\"i\":1,\"text\":\"Tạm biệt\"}]}"}}]})
                .to_string(),
            );
    });

    let p = OpenAiCompat {
        base_url: server.url("/v1"),
        api_key: "khoa-gia-chi-de-in-request".into(),
        model: "z-ai/glm-5.3".into(),
        context: "phim".into(),
    };
    let out = p.translate_batch(&["Hello", "Goodbye"], "en", "vi").unwrap();

    let thu = cho_chua().lock().unwrap().clone().expect("phải bắt được request");
    let body: serde_json::Value = serde_json::from_slice(&thu).unwrap();

    println!("\n===== ĐƯỜNG DẪN =====");
    println!("POST <base_url>/chat/completions   (header: Authorization: Bearer <khoá>)");
    println!("\n===== THÂN REQUEST =====");
    println!("{}", serde_json::to_string_pretty(&body).unwrap());
    println!("\n===== KẾT QUẢ PHÂN TÍCH =====");
    println!("{out:?}");
}
