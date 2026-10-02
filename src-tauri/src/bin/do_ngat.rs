//! So chất lượng ngắt dòng phụ đề: cách cắt CŨ (tham lam, cắt ở khoảng trắng
//! gần trần nhất) với cách cắt MỚI (chấm điểm rồi chọn chỗ tốt nhất).
//!
//! Chạy trên một file SRT thật, chấm cả hai bằng cùng một thước `diem_ngat`.
use app_lib::srt;

/// Bản sao của bộ cắt CŨ, giữ nguyên để so sánh. Tham lam: lấp đầy dòng tới
/// trần rồi cắt ở khoảng trắng — đúng với tiếng Anh, sai với tiếng Việt.
fn cat_cu(cau: &str, toi_da: usize) -> Vec<String> {
    let mut ra: Vec<String> = Vec::new();
    let mut dong = String::new();
    for t in cau.split_whitespace() {
        let se_dai = if dong.is_empty() { t.chars().count() } else { dong.chars().count() + 1 + t.chars().count() };
        if !dong.is_empty() && se_dai > toi_da {
            ra.push(std::mem::take(&mut dong));
        }
        if !dong.is_empty() { dong.push(' '); }
        dong.push_str(t);
        let ket = t.chars().last().unwrap_or(' ');
        if matches!(ket, ',' | ';' | ':' | '—') && dong.chars().count() >= toi_da / 2 {
            ra.push(std::mem::take(&mut dong));
        }
    }
    if !dong.is_empty() { ra.push(dong); }
    ra
}

/// Đếm điểm của mọi chỗ ngắt trong một danh sách dòng.
fn cham(dong: &[String], bang: &mut [usize; 5]) {
    for w in dong.windows(2) {
        let truoc = w[0].split_whitespace().last().unwrap_or("");
        let sau = w[1].split_whitespace().next().unwrap_or("");
        if truoc.is_empty() || sau.is_empty() { continue; }
        bang[srt::diem_ngat(truoc, sau) as usize] += 1;
    }
}

fn main() {
    let duong = std::env::args().nth(1).expect("cần đường dẫn .srt");
    let text = std::fs::read_to_string(&duong).expect("đọc được srt");
    let segs = srt::parse_srt(&text).expect("srt hợp lệ");

    let mut cu = [0usize; 5];
    let mut moi = [0usize; 5];
    let mut xau: Vec<(String, String)> = Vec::new();
    for s in &segs {
        // Cách cũ cắt thẳng cả cue; cách mới đi qua cat_cue_dai.
        cham(&cat_cu(&s.text, srt::MAX_MOT_DONG), &mut cu);
        let n: Vec<String> = srt::cat_cue_dai(std::slice::from_ref(s), srt::MAX_MOT_DONG)
            .into_iter().map(|x| x.text).collect();
        cham(&n, &mut moi);
        for w in n.windows(2) {
            let a = w[0].split_whitespace().last().unwrap_or("");
            let b = w[1].split_whitespace().next().unwrap_or("");
            if !a.is_empty() && !b.is_empty() && srt::diem_ngat(a, b) == 0 {
                xau.push((a.to_string(), b.to_string()));
            }
        }
    }
    let ten = ["cắt bừa", "trước hư từ hai mặt", "trước hư từ mở ngữ", "sau dấu ngắt", "sau dấu kết câu"];
    println!("{:<22} {:>8} {:>8}", "chất lượng chỗ ngắt", "CŨ", "MỚI");
    for i in (0..5).rev() {
        println!("{:<22} {:>8} {:>8}", ten[i], cu[i], moi[i]);
    }
    println!("{:<22} {:>8} {:>8}", "TỔNG", cu.iter().sum::<usize>(), moi.iter().sum::<usize>());
    xau.sort();
    xau.dedup();
    println!("\ncòn cắt bừa ({}): {}", xau.len(),
        xau.iter().map(|(a, b)| format!("{a} {b}")).collect::<Vec<_>>().join(" · "));
}
