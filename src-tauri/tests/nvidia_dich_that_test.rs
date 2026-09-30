//! Dịch THẬT qua endpoint tương thích-OpenAI bằng đúng đường mà app dùng.
//!
//! Chạy: $env:DVL_NV_KEY="<khoá>"; $env:DVL_NV_MODEL="openai/gpt-oss-20b"
//!       cargo test --manifest-path src-tauri/Cargo.toml --test nvidia_dich_that_test -- --ignored --nocapture

use app_lib::translate::{openai_compat::OpenAiCompat, TranslateProvider};

/// Thoại thật trích từ một dự án: có tên riêng, số, thán từ và câu cụt — đúng
/// kiểu đầu vào làm mấy bộ dịch máy vỡ trận.
const NGUON: &[&str] = &[
    "我的天啊，以下资料全发生在过去72小时内",
    "世界已经变得超出我们的理解",
    "它为什么这么大？",
    "姐夫，妹妹和我，你更喜欢谁？",
    "这条蟒蛇重达180公斤",
    "别动！",
];

#[test]
#[ignore]
fn dich_that_qua_nvidia() {
    let Ok(key) = std::env::var("DVL_NV_KEY") else {
        eprintln!("đặt DVL_NV_KEY để chạy");
        return;
    };
    let model = std::env::var("DVL_NV_MODEL").unwrap_or_else(|_| "openai/gpt-oss-20b".into());
    let base_url = std::env::var("DVL_NV_URL")
        .unwrap_or_else(|_| "https://integrate.api.nvidia.com/v1".into());
    let context = std::env::var("DVL_NV_CONTEXT").unwrap_or_else(|_| "phim".into());

    let p = OpenAiCompat { chu_so_huu: "openai_compat", base_url, api_key: key, model: model.clone(), context };

    // DVL_NV_SRT trỏ vào một .srt thật thì đo trên lô 40 cue đúng như lúc chạy
    // phim — sáu câu mẫu quá ngắn để thấy model nào đốt hết hạn mức token.
    let doc;
    let nguon: Vec<&str> = match std::env::var("DVL_NV_SRT") {
        Ok(d) => {
            doc = std::fs::read_to_string(&d).expect("đọc được .srt");
            let segs = app_lib::srt::parse_srt(&doc).expect("phân tích được SRT");
            let lay = segs.len().min(40);
            Box::leak(
                segs[..lay]
                    .iter()
                    .map(|s| s.text.clone())
                    .collect::<Vec<_>>()
                    .into_boxed_slice(),
            )
            .iter()
            .map(|s| s.as_str())
            .collect()
        }
        Err(_) => NGUON.to_vec(),
    };
    let nguon: &[&str] = &nguon;

    let t0 = std::time::Instant::now();
    let ra = p
        .translate_batch(nguon, "zh", "vi")
        .unwrap_or_else(|e| panic!("dịch lỗi: {e}"));
    let giay = t0.elapsed().as_secs_f32();

    println!("\n=== {model} — {giay:.1}s cho {} câu ===", nguon.len());
    for (a, b) in nguon.iter().zip(ra.iter()).take(6) {
        println!("  {a}\n  → {b}\n");
    }

    // Số câu phải khớp: lệch một câu là phụ đề lệch từ đó tới hết phim.
    assert_eq!(ra.len(), nguon.len(), "số câu trả về không khớp");
    assert!(ra.iter().all(|s| !s.trim().is_empty()), "có câu dịch rỗng");
    // Không được trả lại nguyên văn tiếng Trung — deepseek-v4.1-flash làm đúng
    // thế khi tắt suy luận: trả đủ 40/40 item nhưng chữ vẫn là tiếng Trung.
    let mut giu_nguyen = 0usize;
    for (a, b) in nguon.iter().zip(ra.iter()) {
        // Cue chỉ có dấu câu ("." hay "?") thì bản dịch giống hệt bản gốc là
        // ĐÚNG, không phải bỏ sót. Chỉ soi những câu có chữ thật.
        if !a.chars().any(char::is_alphabetic) {
            continue;
        }
        if a == b {
            // Một mảnh như "The." hay "Yeah." để nguyên là hợp lý; đếm rồi đòi
            // phần lớn phải đổi, chứ bắt TỪNG câu phải khác là test tồi.
            giu_nguyen += 1;
        }
        assert!(
            !b.chars().any(|c| ('\u{4e00}'..='\u{9fff}').contains(&c)),
            "còn sót chữ Hán, model chưa thật sự dịch: {b}"
        );
    }
    assert!(
        giu_nguyen * 5 <= nguon.len(),
        "{giu_nguyen}/{} câu giữ nguyên văn — model không thật sự dịch",
        nguon.len()
    );
    // Phải là tiếng Việt: ít nhất một chữ có dấu.
    let co_dau = ra.iter().any(|s| {
        s.chars()
            .any(|c| "ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụ".contains(c.to_lowercase().next().unwrap_or(' ')))
    });
    assert!(co_dau, "không thấy chữ tiếng Việt có dấu nào: {ra:?}");
}
