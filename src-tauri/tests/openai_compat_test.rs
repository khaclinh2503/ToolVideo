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
        chu_so_huu: "openai_compat",
        base_url: server.url("/v1"),
        api_key: "sk-test".into(),
        model: "gpt-4o-mini".into(),
        context: String::new(),
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
        chu_so_huu: "openai_compat",
        base_url: format!("http://{addr}"),
        api_key: "sk-test".into(),
        model: "gpt-4o-mini".into(),
        context: String::new(),
    };
    let out = provider.translate_batch(&["a", "b"], "zh", "vi").unwrap();
    assert_eq!(out, vec!["A", "B"]);
    handle.join().expect("fake server thread");
}

#[test]
fn make_provider_requires_config() {
    let mut cfg = TranslateConfig::default(); // api_key rỗng
    let models = std::path::Path::new(".");
    match make_provider("openai_compat", &cfg, models) {
        Err(PipelineError::ProviderError { .. }) => {}
        _ => panic!("expected ProviderError for missing config"),
    }
    cfg.openai.api_key = "k".into();
    assert_eq!(make_provider("openai_compat", &cfg, models).unwrap().id(), "openai_compat");
    assert_eq!(make_provider("google_free", &cfg, models).unwrap().id(), "google_free");
}

#[test]
fn prompt_luon_giu_quy_dinh_dang_json() {
    use app_lib::translate::openai_compat::{build_system_prompt, CONTEXTS, SYSTEM_PROMPT};
    // Đây là thứ giữ cho provider chạy được: mất quy định JSON thì mọi bản dịch
    // đều hỏng parse. Ngữ cảnh phải NỐI THÊM chứ không thay thế.
    for ma in std::iter::once("").chain(CONTEXTS.iter().map(|(m, _, _)| *m)) {
        let p = build_system_prompt(ma);
        assert!(p.contains(SYSTEM_PROMPT), "ngữ cảnh {ma:?} đã nuốt mất prompt gốc: {p}");
        assert!(p.contains("{\"items\":"), "ngữ cảnh {ma:?} mất quy định JSON: {p}");
    }
}

/// Hai lỗi đo được trên bản dịch thật mà prompt cũ không chặn: `球球` (tên con
/// chó) ra "Bóng bóng", và `干。` (tiếng chửi) ra "Chán." Cả hai là lỗi của
/// prompt chứ không của model — cùng một model dịch đúng khi prompt nói rõ.
/// Ràng ở MỌI ngữ cảnh vì hai lỗi này không riêng phim: bản tin cũng có tên
/// riêng, podcast cũng có tiếng chửi.
#[test]
fn moi_ngu_canh_deu_chan_dich_nghia_ten_rieng_va_lam_nhe_tho_tuc() {
    use app_lib::translate::openai_compat::{build_system_prompt, CONTEXTS};
    for ma in std::iter::once("").chain(CONTEXTS.iter().map(|(m, _, _)| *m)) {
        let p = build_system_prompt(ma);
        assert!(p.contains("Hán-Việt"), "ngữ cảnh {ma:?} thiếu quy tắc phiên âm tên riêng: {p}");
        assert!(p.contains("球球"), "ngữ cảnh {ma:?} mất ví dụ tên riêng — câu suông đã đo là không ăn thua: {p}");
        assert!(p.contains("thô tục"), "ngữ cảnh {ma:?} thiếu quy tắc giữ mức độ thô tục: {p}");
        assert!(
            p.contains("không được hoán ngôi"),
            "ngữ cảnh {ma:?} thiếu quy tắc giữ ngôi 我/你/他: {p}"
        );
    }
}

/// Quy tắc thô tục phải ràng HAI CHIỀU. Chỉ nói "đừng làm nhẹ" thì bản tin và
/// bài giảng có nguy cơ bị kéo giọng theo.
#[test]
fn quy_tac_tho_tuc_cam_ca_chieu_them_vao() {
    use app_lib::translate::openai_compat::build_system_prompt;
    let p = build_system_prompt("tin_tuc");
    assert!(p.contains("không làm nhẹ đi"), "{p}");
    assert!(p.contains("không thêm vào chỗ bản gốc không có"), "{p}");
}

/// Ngữ cảnh phim phải giữ phần xưng hô và bảng quan hệ họ hàng — bảng này đo
/// được 0/4 ⇒ 4/4 cho 姐夫, là một trong những luật ăn rõ nhất.
///
/// CẢNH BÁO cho người đọc bài test này: xanh ở đây KHÔNG có nghĩa là xưng hô đã
/// đúng. Model vẫn bám cặp xưng hô của item đầu lô rồi áp cho cả lô — đo được
/// 2/4 kiểu xưng hô cần thiết, và bốn cách viết prompt khác nhau đều ra đúng
/// 2/4. Một trong bốn cách còn làm cue dài bị cắt mất vế sau (3/4 ⇒ 0/3) nên đã
/// trả về nguyên văn này. Xem chú thích ở mục "phim" trong CONTEXTS.
#[test]
fn ngu_canh_phim_giu_phan_xung_ho_va_bang_ho_hang() {
    use app_lib::translate::openai_compat::build_system_prompt;
    let p = build_system_prompt("phim");
    assert!(
        p.contains("cặp xưng hô cho mỗi cặp nhân vật"),
        "phim mất phần xưng hô theo cặp nhân vật: {p}"
    );
    assert!(p.contains("姐夫 là anh rể"), "phim mất bảng quan hệ họ hàng: {p}");
}

#[test]
fn moi_ngu_canh_cho_ra_huong_dan_khac_nhau() {
    use app_lib::translate::openai_compat::{build_system_prompt, CONTEXTS};
    let mut thay: Vec<String> = CONTEXTS.iter().map(|(m, _, _)| build_system_prompt(m)).collect();
    let truoc = thay.len();
    thay.sort();
    thay.dedup();
    assert_eq!(thay.len(), truoc, "có hai ngữ cảnh sinh ra cùng một prompt");
}

#[test]
fn ngu_canh_rong_hoac_la_thi_ve_che_do_tu_doan() {
    use app_lib::translate::openai_compat::build_system_prompt;
    let tu_dong = build_system_prompt("");
    assert!(tu_dong.contains("tự đoán"), "{tu_dong}");
    // Mã lạ (cấu hình cũ, người dùng sửa tay) không được làm hỏng gì, cũng không
    // được im lặng bỏ luôn phần hướng dẫn.
    assert_eq!(build_system_prompt("khong_ton_tai_dau"), tu_dong);
    assert_eq!(build_system_prompt("  ban_hang  "), build_system_prompt("ban_hang"));
}

#[test]
fn ngu_canh_co_ma_thi_dung_dung_huong_dan_cua_no() {
    use app_lib::translate::openai_compat::{build_system_prompt, CONTEXTS};
    let (ma, _, huong_dan) = CONTEXTS[0];
    assert!(build_system_prompt(ma).contains(huong_dan));
}

#[test]
fn danh_sach_ngu_canh_khong_trung_ma_va_khong_rong() {
    use app_lib::translate::openai_compat::CONTEXTS;
    assert!(!CONTEXTS.is_empty());
    let mut ma: Vec<&str> = CONTEXTS.iter().map(|(m, _, _)| *m).collect();
    ma.sort();
    let truoc = ma.len();
    ma.dedup();
    assert_eq!(ma.len(), truoc, "mã ngữ cảnh bị trùng");
    for (m, nhan, h) in CONTEXTS {
        assert!(!m.trim().is_empty(), "mã rỗng");
        assert!(!nhan.trim().is_empty(), "nhãn rỗng: {m}");
        assert!(!h.trim().is_empty(), "hướng dẫn rỗng: {m}");
    }
}

#[test]
fn endpoint_tu_choi_response_format_thi_thu_lai_khong_kem_tham_so_do() {
    // build.nvidia.com và nhiều endpoint tương thích-OpenAI khác (Groq,
    // LM Studio, OpenRouter) không khai `response_format`. Trả 400 ⇒ app phải
    // tự thử lại KHÔNG kèm tham số đó thay vì bắt người dùng tự đoán; prompt đã
    // yêu cầu trả JSON nên đường này vẫn dùng được.
    let server = MockServer::start();

    // Lần một CÓ response_format ⇒ endpoint từ chối.
    let m400 = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .body_contains("response_format");
        then.status(400)
            .header("content-type", "application/json")
            .body(r#"{"error":"unknown field response_format"}"#);
    });
    // Lần hai KHÔNG có response_format ⇒ chạy bình thường.
    let mok = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .matches(|req| {
                let b = req.body.as_ref().map(|b| String::from_utf8_lossy(b).to_string()).unwrap_or_default();
                !b.contains("response_format")
            });
        then.status(200)
            .header("content-type", "application/json")
            .body(ok_body(r#"{"i":0,"text":"Xin chào"}"#));
    });

    let out = p(&server).translate_batch(&["Hello"], "en", "vi").unwrap();
    assert_eq!(out, vec!["Xin chào"]);
    // HAI lần 400, không phải một: app lùi từng bước vì thông báo lỗi không nói
    // rõ tham số nào bị chê. Nấc giữa (bỏ khoá tắt suy luận, còn giữ JSON) ở
    // đây là một lần gọi thừa — chấp nhận được vì 400 trả về tức thì, trong khi
    // đoán sai tham số thì người dùng mất cả lô dịch.
    m400.assert_hits(2);
    mok.assert_hits(1);
}

#[test]
fn endpoint_tu_choi_khoa_tat_suy_luan_thi_van_giu_che_do_json() {
    // Ngược lại: endpoint nhận `response_format` nhưng không biết
    // `reasoning_effort`. Lùi hết một lượt là mất luôn chế độ JSON dù endpoint
    // vẫn hỗ trợ, nên nấc giữa phải giữ lại JSON.
    let server = MockServer::start();

    let m400 = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .body_contains("reasoning_effort");
        then.status(400)
            .header("content-type", "application/json")
            .body(r#"{"error":"unknown field reasoning_effort"}"#);
    });
    let mok = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .matches(|req| {
                let b = req
                    .body
                    .as_ref()
                    .map(|b| String::from_utf8_lossy(b).to_string())
                    .unwrap_or_default();
                !b.contains("reasoning_effort") && b.contains("response_format")
            });
        then.status(200)
            .header("content-type", "application/json")
            .body(ok_body(r#"{"i":0,"text":"Xin chào"}"#));
    });

    let out = p(&server).translate_batch(&["Hello"], "en", "vi").unwrap();
    assert_eq!(out, vec!["Xin chào"]);
    m400.assert_hits(1);
    mok.assert_hits(1);
}

#[test]
fn mac_dinh_gui_kem_khoa_tat_suy_luan() {
    // Model suy luận đốt sạch max_tokens vào phần nghĩ rồi trả về RỖNG — đo
    // thật trên NVIDIA: deepseek-v4.1-flash tiêu 4095/4096 token cho suy luận,
    // 173 giây, không một chữ dịch nào. Thiếu hai khoá này là hỏng ngay.
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .body_contains("reasoning_effort")
            .body_contains("chat_template_kwargs");
        then.status(200)
            .header("content-type", "application/json")
            .body(ok_body(r#"{"i":0,"text":"Xin chào"}"#));
    });

    let out = p(&server).translate_batch(&["Hello"], "en", "vi").unwrap();
    assert_eq!(out, vec!["Xin chào"]);
    m.assert_hits(1);
}

#[test]
fn loi_401_thi_khong_thu_lai() {
    // Khoá sai là 401. Thử lại chỉ tốn thêm một lần gọi mà chắc chắn hỏng y hệt,
    // và làm người dùng chờ lâu hơn trước khi thấy lỗi thật.
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST).path("/v1/chat/completions");
        then.status(401).body(r#"{"error":"invalid api key"}"#);
    });
    let err = p(&server).translate_batch(&["Hello"], "en", "vi").unwrap_err();
    assert_eq!(err.code(), "provider_error", "nhận: {err}");
    m.assert_hits(1);
}

#[test]
fn loc_duoc_json_khoi_phan_suy_nghi_cua_model_reasoning() {
    use app_lib::translate::openai_compat::loc_khoi_json;
    let json = r#"{"items":[{"i":0,"text":"Xin chào"}]}"#;

    // Dạng 1: khối <think> tường minh (GLM, DeepSeek-R1…). Bên trong nó cũng có
    // ngoặc nhọn, nên phải cắt theo </think> trước chứ không phải tìm '{' đầu tiên.
    let co_think = format!("<think>Tôi sẽ dịch {{từng}} câu một</think>\n{json}");
    assert_eq!(loc_khoi_json(&co_think), json, "phải bỏ cả ngoặc nằm trong think");

    // Dạng 2: văn xuôi trần trước JSON.
    assert_eq!(loc_khoi_json(&format!("Đây là bản dịch:\n{json}")), json);

    // Dạng 3: rào markdown.
    assert_eq!(loc_khoi_json(&format!("```json\n{json}\n```")), json);

    // Dạng 4: sạch sẵn thì không đụng vào.
    assert_eq!(loc_khoi_json(json), json);

    // Không có ngoặc nào ⇒ trả nguyên chuỗi, để thông báo lỗi hiện đúng thứ
    // model đã trả thay vì một chuỗi rỗng khó hiểu.
    assert_eq!(loc_khoi_json("xin lỗi, tôi không dịch được"), "xin lỗi, tôi không dịch được");
}

#[test]
fn model_tra_ve_kem_phan_suy_nghi_van_dich_duoc() {
    // Đường chạy thật: GLM/Nemotron trên NVIDIA trả kèm suy nghĩ. Trước bản sửa
    // này cả lô 40 cue hỏng và hiện ra là provider_error, không ai đoán được
    // nguyên nhân.
    let server = MockServer::start();
    let content = "<think>Người dùng muốn dịch sang tiếng Việt.</think>\n{\"items\":[{\"i\":0,\"text\":\"Xin chào\"}]}";
    let body = serde_json::json!({"choices":[{"message":{"role":"assistant","content":content}}]}).to_string();
    let m = server.mock(|when, then| {
        when.method(POST).path("/v1/chat/completions");
        then.status(200).header("content-type", "application/json").body(body);
    });
    let out = p(&server).translate_batch(&["Hello"], "en", "vi").unwrap();
    assert_eq!(out, vec!["Xin chào"]);
    m.assert_hits(1);
}

#[test]
fn co_gui_max_tokens_du_rong_cho_mot_lo_40_cue() {
    // Endpoint áp mặc định của nó nếu ta không gửi — đoạn mã mẫu của NVIDIA
    // dùng 1024, quá nhỏ cho 40 câu phụ đề. Trả lời bị cắt cụt ⇒ JSON hỏng.
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .body_contains("\"max_tokens\":4096");
        then.status(200)
            .header("content-type", "application/json")
            .body(ok_body(r#"{"i":0,"text":"Xin chào"}"#));
    });
    p(&server).translate_batch(&["Hello"], "en", "vi").unwrap();
    m.assert_hits(1);
}

/// Lần dịch lại phải là một yêu cầu KHÁC, không phải lần gieo lại: nó nói rõ
/// bản trước hỏng và chỉ đích danh chữ còn sót. Gửi lại y nguyên thì model trả
/// lại đúng cái cũ.
#[test]
fn dich_lai_mot_cue_gui_prompt_sua_loi_kem_chu_con_sot() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST)
            .path("/v1/chat/completions")
            .body_contains("HỎNG")
            .body_contains("半天")
            // Vẫn phải giữ nguyên phần quy định JSON, nếu không thì parse hỏng.
            .body_contains("Bạn là dịch giả phụ đề");
        then.status(200).body(ok_body(r#"{"i":0,"text":"nghỉ nửa ngày"}"#));
    });
    let ra = p(&server)
        .dich_lai_sua_loi("我得请半天假", "nó bỏ nguyên các chữ 半天 không dịch", "zh", "vi")
        .unwrap();
    assert_eq!(ra, "nghỉ nửa ngày");
    assert_eq!(m.hits(), 1, "sửa một cue chỉ tốn một request");
}

/// Prompt sửa lỗi chỉ được THÊM vào, không được nuốt mất phần ngữ cảnh — mất
/// ngữ cảnh thì câu sửa xong lại lạc giọng so với phần còn lại.
#[test]
fn prompt_sua_loi_van_giu_huong_dan_ngu_canh() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST).body_contains("Đây là lời thoại phim");
        then.status(200).body(ok_body(r#"{"i":0,"text":"xong"}"#));
    });
    let mut nha = p(&server);
    nha.context = "phim".into();
    nha.dich_lai_sua_loi("干", "nó dịch quá nhẹ", "zh", "vi").unwrap();
    assert_eq!(m.hits(), 1);
}

#[test]
fn lay_dung_nhung_chu_con_sot_moi_chu_mot_lan() {
    use app_lib::translate::chu_dong_a_trong;
    assert_eq!(chu_dong_a_trong("tôi phải nghỉ半天, mày小子 đi"), "半天小子");
    assert_eq!(chu_dong_a_trong("半天 rồi lại 半天"), "半天", "mỗi chữ kể một lần");
    assert_eq!(chu_dong_a_trong("không có gì"), "");
}

/// Sổ tay phải THẬT SỰ tới được prompt, và phải NỐI THÊM chứ không thay thế —
/// mất phần quy định JSON thì mọi bản dịch đều hỏng parse.
#[test]
fn so_tay_duoc_gan_vao_prompt_va_khong_nuot_phan_quy_dinh_json() {
    use app_lib::so_tay::Muc;
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST)
            .body_contains("球球 = Cầu Cầu (tên con chó)")
            .body_contains("BẮT BUỘC")
            .body_contains("Bạn là dịch giả phụ đề");
        then.status(200).body(ok_body(r#"{"i":0,"text":"Cầu Cầu đâu"}"#));
    });
    let muc = Muc {
        goc: "球球".into(),
        dich: "Cầu Cầu".into(),
        ghi_chu: "tên con chó".into(),
    };
    let ra = p(&server)
        .translate_batch_voi_so_tay(&["球球呢"], "zh", "vi", &[&muc])
        .unwrap();
    assert_eq!(ra, vec!["Cầu Cầu đâu"]);
    assert_eq!(m.hits(), 1);
}

/// Sổ tay rỗng thì không được đổi gì so với đường cũ — không thêm câu thừa vào
/// prompt, và vẫn đi đúng nhánh `translate_batch`.
#[test]
fn so_tay_rong_thi_prompt_khong_doi() {
    let server = MockServer::start();
    // Khai cái hẹp TRƯỚC: nếu prompt lỡ có câu sổ tay thì nó dính vào đây.
    let co_so_tay = server.mock(|when, then| {
        when.method(POST).body_contains("BẮT BUỘC");
        then.status(500).body("không được có câu sổ tay");
    });
    let m = server.mock(|when, then| {
        when.method(POST);
        then.status(200).body(ok_body(r#"{"i":0,"text":"xong"}"#));
    });
    p(&server)
        .translate_batch_voi_so_tay(&["一"], "zh", "vi", &[])
        .unwrap();
    assert_eq!(m.hits(), 1);
    assert_eq!(co_so_tay.hits(), 0, "sổ rỗng mà vẫn nhét câu sổ tay vào prompt");
}
