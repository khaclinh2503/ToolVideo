/// Provider phải SỞ HỮU server: `Box<dyn TranslateProvider>` bị thả lúc dịch
/// xong là `Drop` của LlamaServer giết tiến trình và trả lại VRAM. Nếu server
/// nằm ngoài, `run_translate_stage` và `commands.rs` đều phải sửa để tắt nó —
/// và ai đó sẽ quên ở một trong hai đường lỗi.
#[test]
fn lo_khong_tim_thay_engine_thi_bao_ro_phai_tai_bo_cong_cu() {
    let d = tempfile::tempdir().unwrap();
    let cfg = app_lib::config::TranslateConfig::default();
    let r = app_lib::translate::make_provider("llm_tren_may", &cfg, d.path());
    assert!(r.is_err());
    // `.unwrap_err()` cần `T: Debug`, mà `Box<dyn TranslateProvider>` (kiểu Ok)
    // không có — dùng `.err().unwrap()` để lấy lỗi mà không đòi hỏi đó.
    let msg = format!("{}", r.err().unwrap());
    assert!(msg.contains("bộ công cụ"), "phải chỉ người dùng đi tải, đang là: {msg}");
}

#[test]
fn id_provider_dung_ten() {
    // Không dựng được provider thật mà không có model 9,8 GB, nên chỉ chốt
    // rằng tên id khớp với thứ config và giao diện dùng.
    assert_eq!(app_lib::translate::llm_tren_may::ID, "llm_tren_may");
}

/// Các provider cũ không được đổi hành vi khi thêm tham số `models`.
#[test]
fn provider_cu_van_dung_duoc() {
    let d = tempfile::tempdir().unwrap();
    let cfg = app_lib::config::TranslateConfig::default();
    let p = app_lib::translate::make_provider("google_free", &cfg, d.path()).unwrap();
    assert_eq!(p.id(), "google_free");

    let mut c2 = cfg.clone();
    c2.openai.api_key = "k".into();
    c2.openai.base_url = "http://x/v1".into();
    c2.openai.model = "m".into();
    let p2 = app_lib::translate::make_provider("openai_compat", &c2, d.path()).unwrap();
    assert_eq!(p2.id(), "openai_compat");
}

/// Máy công ty hay đặt `HTTP_PROXY`/`ALL_PROXY`. `reqwest` 0.12 đọc các biến đó
/// theo mặc định và KHÔNG miễn trừ loopback, nên nếu không tắt proxy thì mọi lô
/// dịch gửi tới `127.0.0.1` đều bị đẩy ra proxy rồi hỏng — đúng trong môi trường
/// mà "không cần mạng" là lý do tồn tại của nhà cung cấp này.
///
/// Gộp luôn phép kiểm tên nhà cung cấp trong thông báo lỗi vào đây: hai thứ đều
/// phải chạy dưới cùng một biến môi trường proxy, và biến môi trường là của cả
/// tiến trình nên tách ra hai phép kiểm chạy song song sẽ đua nhau.
#[test]
fn dich_tren_may_khong_qua_proxy_va_loi_bao_dung_ten_nha_cung_cap() {
    use app_lib::translate::{openai_compat::OpenAiCompat, TranslateProvider};
    use std::io::{BufRead, BufReader, Read, Write};
    use std::net::{TcpListener, TcpStream};

    /// Server giả tối giản: đọc hết request rồi trả đúng một câu trả lời.
    /// Không dùng `httpmock` vì phép kiểm này đặt biến proxy cho cả tiến trình,
    /// và httpmock tự nó cũng nói chuyện HTTP với chính nó.
    fn phuc_vu_mot_lan(l: TcpListener, ma: u16, than: String) -> std::thread::JoinHandle<()> {
        std::thread::spawn(move || {
            let (mut s, _) = l.accept().expect("nhận được kết nối");
            doc_het_request(&mut s);
            let resp = format!(
                "HTTP/1.1 {ma} X\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{than}",
                than.len()
            );
            let _ = s.write_all(resp.as_bytes());
            let _ = s.flush();
        })
    }
    fn doc_het_request(s: &mut TcpStream) {
        let mut r = BufReader::new(s.try_clone().expect("nhân bản socket"));
        let mut n = 0usize;
        loop {
            let mut dong = String::new();
            if r.read_line(&mut dong).unwrap_or(0) == 0 || dong == "\r\n" {
                break;
            }
            if let Some(v) = dong.to_ascii_lowercase().strip_prefix("content-length:") {
                n = v.trim().parse().unwrap_or(0);
            }
        }
        let mut than = vec![0u8; n];
        let _ = r.read_exact(&mut than);
    }

    // Proxy trỏ vào một cổng chắc chắn không ai nghe: client nào còn dùng proxy
    // sẽ hỏng ngay, client đã tắt proxy thì đi thẳng tới loopback.
    for bien in ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "all_proxy"] {
        std::env::set_var(bien, "http://127.0.0.1:1");
    }

    let ok = TcpListener::bind("127.0.0.1:0").unwrap();
    let dia_chi = ok.local_addr().unwrap();
    let than = serde_json::json!({"choices":[{"message":{"role":"assistant",
        "content":"{\"items\":[{\"i\":0,\"text\":\"Xin chào\"}]}"}}]})
    .to_string();
    let h = phuc_vu_mot_lan(ok, 200, than);
    let p = OpenAiCompat {
        chu_so_huu: app_lib::translate::llm_tren_may::ID,
        base_url: format!("http://{dia_chi}/v1"),
        api_key: String::new(),
        model: "local".into(),
        context: "phim".into(),
    };
    let ra = p
        .translate_batch(&["Hello"], "en", "vi")
        .expect("request tới loopback không được đi vòng qua proxy");
    assert_eq!(ra, vec!["Xin chào"]);
    h.join().expect("luồng server giả");

    // Lỗi của server chạy TRÊN MÁY phải tự xưng là `llm_tren_may`: xưng
    // "openai_compat" thì `error.rs` biến nó thành "Dịch vụ lỗi phía server" và
    // người dùng đi kiểm tra mạng với API key, trong khi hỏng nằm ở máy họ.
    let loi = TcpListener::bind("127.0.0.1:0").unwrap();
    let dia_chi2 = loi.local_addr().unwrap();
    let h2 = phuc_vu_mot_lan(loi, 503, "server busy".into());
    let p2 = OpenAiCompat {
        chu_so_huu: app_lib::translate::llm_tren_may::ID,
        base_url: format!("http://{dia_chi2}/v1"),
        api_key: String::new(),
        model: "local".into(),
        context: String::new(),
    };
    let e = p2
        .translate_batch(&["Hello"], "en", "vi")
        .err()
        .expect("503 thì phải lỗi");
    let msg = format!("{e}");
    assert!(msg.contains("llm_tren_may"), "phải xưng đúng tên: {msg}");
    assert!(!msg.contains("openai_compat"), "không được xưng nhầm: {msg}");
    h2.join().expect("luồng server giả 2");
    assert_eq!(p2.id(), "llm_tren_may");
}

/// Việc miễn trừ proxy xét theo HOST chứ không theo nhãn nhà cung cấp:
/// `google_free` vẫn phải đi qua proxy trên chính cái máy đó.
#[test]
fn nhan_dien_dung_dia_chi_loopback() {
    use app_lib::translate::la_loopback;
    assert!(la_loopback("http://127.0.0.1:8080/v1"));
    assert!(la_loopback("http://localhost:1234/v1/chat/completions"));
    assert!(la_loopback("http://[::1]:8080/v1"));
    assert!(la_loopback("http://127.5.6.7/v1"));
    assert!(!la_loopback("https://translate.googleapis.com/translate_a/single"));
    assert!(!la_loopback("https://integrate.api.nvidia.com/v1"));
    // Mẹo qua mặt quen thuộc: host thật nằm sau dấu '@', và tên miền chỉ
    // *chứa* chữ localhost thì không phải loopback.
    assert!(!la_loopback("http://127.0.0.1@evil.example.com/v1"));
    assert!(!la_loopback("http://localhost.evil.example.com/v1"));
}
