//! Đo lớp chặn "gán giới tính bừa" trên model THẬT, bằng đúng đường chạy của app.
//!
//! ```text
//! $env:DVL_E2E_DICH="1"
//! cargo test --test e2e_gioi_tinh_test -- --ignored --nocapture --test-threads=1
//! ```
//!
//! Ca đo là câu thật người dùng báo: 不要脸的东西 (nghĩa "thứ vô liêm sỉ", không
//! nói nam hay nữ) ra "Thằng vô liêm sỉ" trong cảnh con gái mắng con gái.

use app_lib::config::{models_dir, TranslateConfig};
use app_lib::srt::Segment;
use app_lib::translate::{gan_gioi_tinh_bua, make_provider, translate_segments};

fn seg(t: &str) -> Segment {
    Segment { start_ms: 0, end_ms: 2000, text: t.into() }
}

#[test]
#[ignore]
fn chui_trung_tinh_khong_bi_gan_gioi_tinh() {
    if std::env::var("DVL_E2E_DICH").as_deref() != Ok("1") {
        eprintln!("bỏ qua: đặt DVL_E2E_DICH=1 để gọi model thật");
        return;
    }
    let ma = std::env::var("DVL_E2E_NHA_CUNG_CAP").unwrap_or_else(|_| "llm_tren_may".into());
    let p = make_provider(&ma, &TranslateConfig::default(), &models_dir()).expect("dựng provider");

    // Lặp lại nhiều vòng: nhiệt độ 0.2 nên một lần chạy không chứng minh gì.
    let vong: usize = std::env::var("DVL_E2E_VONG")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3);
    let cau = [
        "不要脸的东西，他是你姐夫。",
        "你这个家伙真让人失望。",
        "这玩意儿到底是谁放在这里的？",
    ];
    let segs: Vec<Segment> = cau.iter().map(|c| seg(c)).collect();

    let mut dinh = 0usize;
    for v in 1..=vong {
        let ra = translate_segments(&*p, &segs, "zh", "vi").expect("dịch được");
        for (g, t) in cau.iter().zip(&ra) {
            let xau = gan_gioi_tinh_bua(g, &t.text);
            if xau.is_some() {
                dinh += 1;
            }
            eprintln!(
                "vòng {v} {} {g}\n          -> {}",
                if xau.is_some() { "DÍNH " } else { "sạch " },
                t.text
            );
        }
    }
    assert_eq!(dinh, 0, "{dinh} câu vẫn bị gán giới tính sau khi đã qua lớp sửa");
}

/// Cùng một ca, nhưng dịch trong LÔ 40 CUE như app chạy thật.
///
/// Vì sao cần bản này: gửi ba câu rời thì model không hề gán giới tính, kể cả
/// khi bỏ hẳn luật khỏi prompt — tức là ca rời KHÔNG tái hiện được lỗi, nên nó
/// không chứng minh được lớp chặn có tác dụng. Lỗi thật xuất hiện khi cue nằm
/// giữa một lô 40 cue: ba lần dịch cả phim, cả ba lần đều ra "Thằng vô liêm
/// sỉ". Cue 不要脸的东西 là cue thứ 15 của phụ đề mẫu nên nó rơi vào lô đầu.
///
/// ```text
/// $env:DVL_E2E_DICH="1"; $env:DVL_E2E_SRT="<source.srt>"
/// cargo test --test e2e_gioi_tinh_test lo_that -- --ignored --nocapture --test-threads=1
/// ```
#[test]
#[ignore]
fn lo_that_40_cue_khong_gan_gioi_tinh() {
    if std::env::var("DVL_E2E_DICH").as_deref() != Ok("1") {
        eprintln!("bỏ qua: đặt DVL_E2E_DICH=1 để gọi model thật");
        return;
    }
    let duong = std::env::var("DVL_E2E_SRT").expect("đặt DVL_E2E_SRT=<đường dẫn source.srt>");
    let goc = std::fs::read_to_string(&duong).expect("đọc được SRT");
    let segs = app_lib::srt::parse_srt(&goc).expect("SRT hỏng");
    let lo: Vec<Segment> = segs.into_iter().take(40).collect();

    let ma = std::env::var("DVL_E2E_NHA_CUNG_CAP").unwrap_or_else(|_| "llm_tren_may".into());
    let p = make_provider(&ma, &TranslateConfig::default(), &models_dir()).expect("dựng provider");

    let bat_dau = std::time::Instant::now();
    let ra = translate_segments(&*p, &lo, "zh", "vi").expect("dịch được");
    eprintln!("{} cue, {:.0}s", ra.len(), bat_dau.elapsed().as_secs_f32());

    let mut dinh = 0usize;
    for (g, t) in lo.iter().zip(&ra) {
        if let Some(tu) = gan_gioi_tinh_bua(&g.text, &t.text) {
            dinh += 1;
            eprintln!("DÍNH \"{tu}\"  {}\n          -> {}", g.text, t.text);
        } else if g.text.contains("东西") || g.text.contains("家伙") {
            eprintln!("sạch       {}\n          -> {}", g.text, t.text);
        }
    }
    assert_eq!(dinh, 0, "{dinh} cue vẫn bị gán giới tính sau khi đã qua lớp sửa");
}
