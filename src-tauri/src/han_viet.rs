//! Tra âm Hán-Việt của một tên riêng, dùng làm **ý kiến thứ hai**.
//!
//! Bảng sinh từ Unihan bằng `cargo run --bin sinh_han_viet`; xem chú thích ở
//! binary đó cho giấy phép và cách cập nhật.
//!
//! ĐÃ ĐO, phải biết trước khi tin: bảng thiếu khoảng 21% số chữ Hán trong phụ đề
//! thật, và nó trộn âm Nôm với âm Hán-Việt — `燕` ra "én" chứ không phải "Yến",
//! `磊` ra "lối" chứ không phải "Lỗi". Thử trên 8 tên riêng: đúng hẳn 5, thiếu
//! chữ 1, sai 2; trong khi model dịch đúng 4/5 trên phim thật.
//!
//! Vì vậy module này KHÔNG tự sửa bản dịch và KHÔNG làm chuẩn. Nó chỉ trả lời
//! "bảng đọc tên này thế nào", để giao diện đánh dấu chỗ model và bảng không
//! đồng ý — chỗ đó đáng người dùng ngó, chứ không có nghĩa là model sai.

use std::collections::HashMap;
use std::sync::OnceLock;

const BANG: &str = include_str!("han_viet.tsv");

fn bang() -> &'static HashMap<char, &'static str> {
    static B: OnceLock<HashMap<char, &'static str>> = OnceLock::new();
    B.get_or_init(|| {
        let mut m = HashMap::new();
        for d in BANG.lines() {
            if d.starts_with('#') {
                continue;
            }
            let mut c = d.split('\t');
            if let (Some(k), Some(v)) = (c.next(), c.next()) {
                if let Some(ch) = k.chars().next() {
                    m.insert(ch, v);
                }
            }
        }
        m
    })
}

/// Âm Hán-Việt của một chữ, chữ thường.
pub fn am(c: char) -> Option<&'static str> {
    bang().get(&c).copied()
}

/// Đọc cả một tên riêng, viết hoa từng âm tiết: `林燕` → `Lâm Én`.
///
/// Trả `None` nếu CÓ MỘT chữ không tra được. Đọc nửa vời rồi chêm dấu hỏi vào
/// giữa thì tệ hơn im lặng: người dùng sẽ tưởng đó là một đề xuất hoàn chỉnh.
///
/// Chuỗi không có chữ Hán nào cũng trả `None` — không có gì để góp ý.
pub fn doc_ten(s: &str) -> Option<String> {
    let chu: Vec<char> = s.chars().filter(|c| !c.is_whitespace()).collect();
    if chu.is_empty() || !chu.iter().any(|c| la_chu_han(*c)) {
        return None;
    }
    let mut ra: Vec<String> = Vec::with_capacity(chu.len());
    for c in chu {
        let a = am(c)?;
        let mut it = a.chars();
        let dau = it.next()?;
        ra.push(dau.to_uppercase().collect::<String>() + it.as_str());
    }
    Some(ra.join(" "))
}

fn la_chu_han(c: char) -> bool {
    matches!(c as u32, 0x3400..=0x4DBF | 0x4E00..=0x9FFF | 0xF900..=0xFAFF)
}

/// Bảng có đồng ý với cách model đã dịch tên này không.
///
/// So không phân biệt hoa thường và bỏ qua khoảng trắng thừa. Tra không ra thì
/// trả `None` — "không biết", khác hẳn với "không đồng ý".
pub fn dong_y(goc: &str, dich: &str) -> Option<bool> {
    let bang_doc = doc_ten(goc)?;
    let gon = |s: &str| {
        s.split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
            .to_lowercase()
    };
    Some(gon(&bang_doc) == gon(dich))
}
