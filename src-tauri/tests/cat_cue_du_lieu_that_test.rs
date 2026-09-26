//! Chạy bộ cắt cue trên một file SRT THẬT và in thống kê trước/sau.
//!
//! Chạy: $env:DVL_SRT="<đường dẫn .srt>"
//!       cargo test --manifest-path src-tauri/Cargo.toml --test cat_cue_du_lieu_that_test -- --ignored --nocapture

use app_lib::srt::{cat_cue_dai, parse_srt, Segment, MAX_MOT_DONG};

fn thong_ke(segs: &[Segment], nhan: &str) {
    let mut dai: Vec<usize> = segs.iter().map(|s| s.text.chars().count()).collect();
    dai.sort_unstable();
    let qua = dai.iter().filter(|&&x| x > MAX_MOT_DONG).count();
    println!(
        "{nhan}: {} cue | trung vị {} | dài nhất {} | vượt một dòng: {} ({}%)",
        dai.len(),
        dai.get(dai.len() / 2).copied().unwrap_or(0),
        dai.last().copied().unwrap_or(0),
        qua,
        if dai.is_empty() { 0 } else { qua * 100 / dai.len() }
    );
}

#[test]
#[ignore]
fn cat_tren_srt_that() {
    let Ok(duong_dan) = std::env::var("DVL_SRT") else {
        eprintln!("đặt DVL_SRT=<đường dẫn .srt> để chạy");
        return;
    };
    let raw = std::fs::read_to_string(&duong_dan).expect("đọc được file");
    let truoc = parse_srt(&raw).expect("phân tích được SRT");
    let sau = cat_cue_dai(&truoc, MAX_MOT_DONG);

    thong_ke(&truoc, "TRƯỚC");
    thong_ke(&sau, "SAU  ");

    // Không được mất chữ nào: ghép toàn bộ text hai bên phải khớp.
    let a: String = truoc.iter().map(|s| s.text.split_whitespace().collect::<Vec<_>>().join(" ")).collect::<Vec<_>>().join(" ");
    let b: String = sau.iter().map(|s| s.text.split_whitespace().collect::<Vec<_>>().join(" ")).collect::<Vec<_>>().join(" ");
    assert_eq!(a, b, "cắt cue không được làm mất hay đổi chữ nào");

    // Thời gian phải nằm trong khung cũ và không chồng lấn.
    for w in sau.windows(2) {
        assert!(w[0].end_ms <= w[1].start_ms, "cue chồng lấn: {:?}", (w[0].end_ms, w[1].start_ms));
    }
    assert_eq!(sau.first().unwrap().start_ms, truoc.first().unwrap().start_ms);
    assert_eq!(sau.last().unwrap().end_ms, truoc.last().unwrap().end_ms);

    println!("\nVÀI CUE SAU KHI CẮT:");
    for s in sau.iter().take(6) {
        println!("  [{:>6}–{:>6}ms] {}", s.start_ms, s.end_ms, s.text);
    }
}
