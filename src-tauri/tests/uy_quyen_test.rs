//! `LlmTrenMay` phải chuyển tiếp MỌI phương thức của `TranslateProvider`.
//!
//! Vì sao cần một bài test đọc mã nguồn thay vì một bài test bình thường: quên
//! chuyển tiếp một phương thức KHÔNG gây lỗi biên dịch và KHÔNG làm đỏ bộ kiểm.
//! Nó lặng lẽ rơi về bản mặc định của trait, mà bản mặc định luôn là một đường
//! chạy được — chỉ tệ hơn.
//!
//! Đã dính đúng một lần: `dich_lai_sua_loi` không được chuyển tiếp, nên mọi lần
//! sửa cue qua `llm_tren_may` đều rơi về nhánh gửi lại y nguyên thay vì gửi yêu
//! cầu sửa lỗi. Bộ kiểm bằng mock vẫn xanh suốt vì nó gọi thẳng `OpenAiCompat`,
//! còn số đo trên máy thật thì bị quy công nhầm cho prompt sửa lỗi.
//!
//! `LlmTrenMay` ôm một `LlamaServer` thật nên không dựng được trong test thường;
//! đọc mã nguồn là cách duy nhất chặn được chuyện này mà không cần GPU.

/// Tên các phương thức khai trong `trait TranslateProvider`.
fn phuong_thuc_cua_trait(src: &str) -> Vec<String> {
    let bat_dau = src
        .find("pub trait TranslateProvider")
        .expect("phải có trait TranslateProvider");
    let than = &src[bat_dau..];
    // Trait kết thúc ở dấu `}` đầu dòng đầu tiên sau khi mở.
    let het = than.find("\n}").expect("trait phải đóng ngoặc");
    than[..het]
        .lines()
        .filter_map(|d| {
            let d = d.trim();
            let sau = d.strip_prefix("fn ")?;
            let ten: String = sau.chars().take_while(|c| *c != '(' && *c != '<').collect();
            Some(ten)
        })
        .collect()
}

#[test]
fn llm_tren_may_chuyen_tiep_moi_phuong_thuc_cua_trait() {
    let trait_src =
        std::fs::read_to_string("src/translate/mod.rs").expect("đọc được translate/mod.rs");
    let impl_src = std::fs::read_to_string("src/translate/llm_tren_may.rs")
        .expect("đọc được llm_tren_may.rs");

    let bat_dau = impl_src
        .find("impl TranslateProvider for LlmTrenMay")
        .expect("phải có impl TranslateProvider cho LlmTrenMay");
    let than = &impl_src[bat_dau..];

    let pt = phuong_thuc_cua_trait(&trait_src);
    assert!(pt.len() >= 5, "đọc trait hỏng, chỉ thấy {pt:?}");

    let thieu: Vec<&String> = pt
        .iter()
        .filter(|ten| {
            // `id` trả hằng nên không chuyển tiếp xuống inner được, và cũng
            // KHÔNG ĐƯỢC chuyển tiếp: lỗi của tiến trình chạy trên máy phải tự
            // xưng là `llm_tren_may`, không phải `openai_compat`.
            *ten != "id" && !than.contains(&format!("fn {ten}("))
        })
        .collect();

    assert!(
        thieu.is_empty(),
        "LlmTrenMay quên chuyển tiếp {thieu:?} xuống inner — chúng sẽ lặng lẽ rơi \
         về bản mặc định của trait mà không ai thấy"
    );
}

/// Chuyển tiếp `id` là hỏng chứ không phải thiếu: lỗi của tiến trình chạy ngay
/// trên máy mà tự xưng `openai_compat` thì người dùng đi kiểm tra mạng và API
/// key, trong khi chẳng cái nào dính dáng.
#[test]
fn id_khong_duoc_chuyen_tiep_xuong_inner() {
    let src = std::fs::read_to_string("src/translate/llm_tren_may.rs").expect("đọc được");
    let bat_dau = src.find("impl TranslateProvider for LlmTrenMay").unwrap();
    let than = &src[bat_dau..];
    assert!(
        !than.contains("self.inner.id()"),
        "id() phải trả ID của llm_tren_may, không được mượn tên của inner"
    );
}
