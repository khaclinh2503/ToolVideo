use app_lib::translate::llama_server::{cho_san_sang, cong_trong, LlamaServer};
use std::time::Duration;

/// `/health` trả 200 NGAY khi tiến trình lên, nhưng lúc đó model còn đang nạp
/// và lời gọi dịch thật ăn 503. Đo thật khi dựng máy đo M9. Chờ theo `/health`
/// là chờ hụt, và biểu hiện thành một lỗi 503 khó hiểu giữa lúc dịch.
#[test]
fn san_sang_tinh_theo_loi_goi_that_khong_theo_health() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| { w.path("/health"); t.status(200).body("{}"); });
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(503).body("loading model");
    });
    let r = cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_millis(600));
    assert!(r.is_err(), "503 ở /v1/chat/completions thì KHÔNG được coi là sẵn sàng");
}

#[test]
fn san_sang_khi_loi_goi_that_tra_200() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(200).body(r#"{"choices":[{"message":{"content":"x"}}]}"#);
    });
    cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_secs(5)).unwrap();
}

/// Server lên nhưng không bao giờ nạp xong ⇒ phải hết giờ và báo rõ, không
/// treo app vô hạn.
#[test]
fn khong_bao_gio_san_sang_thi_het_gio() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(503);
    });
    let t0 = std::time::Instant::now();
    let r = cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_millis(800));
    assert!(r.is_err());
    assert!(t0.elapsed() < Duration::from_secs(5), "phải bỏ cuộc gần đúng hạn, không treo");
    let msg = format!("{}", r.unwrap_err());
    assert!(msg.contains("nạp") || msg.contains("sẵn sàng"), "thông báo phải nói rõ: {msg}");
}

/// Đóng cứng một cổng là rủi ro vì cổng có thể đang bận.
#[test]
fn cong_trong_khac_nhau_va_bind_duoc() {
    let a = cong_trong().unwrap();
    let b = cong_trong().unwrap();
    assert_ne!(a, 0);
    assert_ne!(b, 0);
    std::net::TcpListener::bind(("127.0.0.1", a)).expect("cổng phải bind được");
}

/// Thiếu engine hoặc thiếu model ⇒ lỗi phải chỉ thẳng người dùng đi tải bộ công
/// cụ, không phải một lỗi io trần trụi mà họ không biết nhìn đâu.
///
/// LƯU Ý: test này KHÔNG chạm tới nhánh đọc stderr — `khoi_dong` trả về trước
/// khi spawn. Nhánh stderr chỉ chạy khi một `llama-server.exe` CÓ THẬT chết lúc
/// nạp (thiếu DLL, driver cũ, GGUF hỏng), nên nó nằm ngoài tầm test thuần; xem
/// ghi chú cuối kế hoạch.
#[test]
fn thieu_engine_hoac_model_thi_chi_di_tai_bo_cong_cu() {
    let d = tempfile::tempdir().unwrap();

    // Thiếu exe.
    let gguf = d.path().join("k.gguf");
    std::fs::write(&gguf, b"x").unwrap();
    let r = LlamaServer::khoi_dong(&d.path().join("khong-co.exe"), &gguf);
    let msg = format!("{}", r.err().expect("thiếu exe phải lỗi"));
    assert!(msg.contains("bộ công cụ"), "phải chỉ đi tải, đang là: {msg}");

    // Thiếu model.
    let exe = d.path().join("co.exe");
    std::fs::write(&exe, b"x").unwrap();
    let r2 = LlamaServer::khoi_dong(&exe, &d.path().join("khong-co.gguf"));
    let msg2 = format!("{}", r2.err().expect("thiếu model phải lỗi"));
    assert!(msg2.contains("bộ công cụ"), "phải chỉ đi tải, đang là: {msg2}");
}
