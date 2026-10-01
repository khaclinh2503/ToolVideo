//! Sinh bảng âm Hán-Việt gọn từ Unihan, chạy tay khi cần cập nhật.
//!
//! ```text
//! curl -L -o Unihan.zip https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip
//! cargo run --bin sinh_han_viet -- Unihan.zip src/han_viet.tsv
//! ```
//!
//! Lấy `kVietnamese` (âm đọc tiếng Việt) và `kTraditionalVariant` (để tra được
//! chữ giản thể, vì phụ đề Trung Quốc đại lục toàn giản thể còn `kVietnamese`
//! phủ phồn thể tốt hơn hẳn).
//!
//! ĐÃ ĐO và phải biết trước khi dùng: ngay cả sau khi quy giản thể về phồn thể,
//! bảng này vẫn THIẾU 21% số chữ Hán trong phim mẫu (143/697), và nó trộn âm Nôm
//! với âm Hán-Việt — `燕` ra "én" chứ không phải "Yến", `磊` ra "lối" chứ không
//! phải "Lỗi". Thử trên 8 tên riêng: đúng hẳn 5, thiếu chữ 1, sai 2. Vì vậy bảng
//! này CHỈ dùng làm ý kiến thứ hai để đánh dấu chỗ đáng ngó, không được dùng làm
//! chuẩn và không được tự sửa bản dịch.

use std::collections::HashMap;
use std::io::Read;

fn main() {
    let mut arg = std::env::args().skip(1);
    let zip = arg.next().expect("cần đường dẫn Unihan.zip");
    let ra = arg.next().expect("cần đường dẫn file đầu ra");

    let f = std::fs::File::open(&zip).expect("mở được Unihan.zip");
    let mut z = zip::ZipArchive::new(f).expect("đọc được zip");

    let doc = |z: &mut zip::ZipArchive<std::fs::File>, ten: &str| -> String {
        let mut s = String::new();
        z.by_name(ten)
            .unwrap_or_else(|_| panic!("zip thiếu {ten}"))
            .read_to_string(&mut s)
            .expect("đọc được nội dung");
        s
    };

    let readings = doc(&mut z, "Unihan_Readings.txt");
    let variants = doc(&mut z, "Unihan_Variants.txt");

    let ma = |cp: &str| -> Option<char> {
        char::from_u32(u32::from_str_radix(cp.strip_prefix("U+")?, 16).ok()?)
    };

    let mut am: HashMap<char, String> = HashMap::new();
    for d in readings.lines() {
        let mut c = d.split('\t');
        let (Some(cp), Some("kVietnamese"), Some(v)) = (c.next(), c.next(), c.next()) else {
            continue;
        };
        // Có chữ khai nhiều âm cách nhau bằng dấu cách; lấy âm đầu, là âm thường
        // gặp nhất theo quy ước của Unihan.
        if let (Some(ch), Some(am1)) = (ma(cp), v.split_whitespace().next()) {
            am.insert(ch, am1.to_string());
        }
    }

    let mut phon: HashMap<char, char> = HashMap::new();
    for d in variants.lines() {
        let mut c = d.split('\t');
        let (Some(cp), Some("kTraditionalVariant"), Some(v)) = (c.next(), c.next(), c.next())
        else {
            continue;
        };
        if let (Some(gian), Some(t)) = (ma(cp), v.split_whitespace().next().and_then(ma)) {
            if gian != t {
                phon.insert(gian, t);
            }
        }
    }

    // Gộp sẵn: chữ giản thể nào tra được qua phồn thể thì ghi thẳng âm vào bảng,
    // để lúc chạy chỉ cần một lần tra chứ không phải hai.
    let mut them = 0usize;
    for (gian, t) in &phon {
        if !am.contains_key(gian) {
            if let Some(a) = am.get(t).cloned() {
                am.insert(*gian, a);
                them += 1;
            }
        }
    }

    let mut dong: Vec<(char, String)> = am.into_iter().collect();
    dong.sort_by_key(|(c, _)| *c as u32);

    let mut out = String::new();
    out.push_str("# Âm Hán-Việt rút từ Unihan (kVietnamese + kTraditionalVariant).\n");
    out.push_str("# Sinh bằng `cargo run --bin sinh_han_viet`, đừng sửa tay.\n");
    out.push_str("#\n");
    out.push_str("# Copyright (c) 1991-2024 Unicode, Inc. All rights reserved.\n");
    out.push_str("# Phát hành theo Unicode License v3: https://www.unicode.org/license.txt\n");
    out.push_str("#\n");
    out.push_str("# CHỈ dùng làm ý kiến thứ hai: bảng thiếu khoảng 21% số chữ trong\n");
    out.push_str("# phụ đề thật và trộn âm Nôm với âm Hán-Việt (燕 ra \"én\" chứ không\n");
    out.push_str("# phải \"Yến\"). Không dùng làm chuẩn, không tự sửa bản dịch.\n");
    for (c, a) in &dong {
        out.push_str(&format!("{c}\t{a}\n"));
    }
    std::fs::write(&ra, out).expect("ghi được file");
    eprintln!(
        "{} chữ ({} chữ giản thể tra qua phồn thể) -> {ra}",
        dong.len(),
        them
    );
}
