use app_lib::srt::{Segment, write_srt};

#[test]
fn writes_srt_with_comma_millis_and_cjk() {
    let segs = vec![
        Segment{start_ms:0, end_ms:1500, text:"你好".into()},
        Segment{start_ms:1500, end_ms:3200, text:"world".into()},
    ];
    let out = write_srt(&segs);
    assert!(out.contains("00:00:00,000 --> 00:00:01,500"));
    assert!(out.contains("你好"));
    assert!(out.starts_with("1\r\n"));
}

#[test]
fn empty_segments_yield_empty_string() {
    assert_eq!(write_srt(&[]), "");
}

// ---------- cắt cue dài thành phụ đề một dòng ----------

fn seg(a: u64, b: u64, t: &str) -> app_lib::srt::Segment {
    app_lib::srt::Segment { start_ms: a, end_ms: b, text: t.into() }
}

#[test]
fn cue_ngan_thi_khong_dung_toi() {
    use app_lib::srt::{cat_cue_dai, MAX_MOT_DONG};
    let v = vec![seg(0, 1000, "Xin chào các bạn.")];
    let ra = cat_cue_dai(&v, MAX_MOT_DONG);
    assert_eq!(ra.len(), 1, "cue vừa một dòng thì không được đụng vào");
    assert_eq!(ra[0].text, "Xin chào các bạn.");
    assert_eq!((ra[0].start_ms, ra[0].end_ms), (0, 1000));
}

#[test]
fn cat_theo_ranh_gioi_cau_chu_khong_cat_giua_cau() {
    use app_lib::srt::{cat_cue_dai, MAX_MOT_DONG};
    let v = vec![seg(
        0,
        6000,
        "Tôi vừa đổi điện thoại. Máy này khá đắt. Nhưng dùng thì rất đáng tiền.",
    )];
    let ra = cat_cue_dai(&v, MAX_MOT_DONG);
    assert_eq!(ra.len(), 3, "ba câu ⇒ ba cue: {:?}", ra.iter().map(|s| &s.text).collect::<Vec<_>>());
    assert_eq!(ra[0].text, "Tôi vừa đổi điện thoại.");
    assert_eq!(ra[1].text, "Máy này khá đắt.");
    assert_eq!(ra[2].text, "Nhưng dùng thì rất đáng tiền.");
}

#[test]
fn thoi_gian_chia_lien_mach_va_phu_kin_cue_goc() {
    use app_lib::srt::{cat_cue_dai, MAX_MOT_DONG};
    let v = vec![seg(1000, 7000, "Câu một ở đây. Câu hai dài hơn một chút nhé. Câu ba.")];
    let ra = cat_cue_dai(&v, MAX_MOT_DONG);
    assert!(ra.len() >= 2);
    // Bắt đầu và kết thúc phải trùng cue gốc — không được nuốt mất thời gian.
    assert_eq!(ra[0].start_ms, 1000);
    assert_eq!(ra.last().unwrap().end_ms, 7000);
    // Liền mạch, không chồng lấn và không hở.
    for w in ra.windows(2) {
        assert_eq!(w[0].end_ms, w[1].start_ms, "phải liền mạch: {:?}", (w[0].end_ms, w[1].start_ms));
        assert!(w[0].end_ms > w[0].start_ms, "cue không được rỗng thời gian");
    }
}

#[test]
fn khong_bao_gio_cat_giua_tu() {
    use app_lib::srt::cat_cue_dai;
    let v = vec![seg(0, 5000, "một hai ba bốn năm sáu bảy tám chín mười mười một mười hai")];
    let ra = cat_cue_dai(&v, 20);
    for s in &ra {
        assert!(s.text.chars().count() <= 20 || !s.text.contains(' '), "quá dài: {:?}", s.text);
        assert!(!s.text.starts_with(' ') && !s.text.ends_with(' '), "thừa khoảng trắng: {:?}", s.text);
    }
    // Ghép lại phải ra đúng chuỗi gốc — không mất chữ nào.
    let ghep = ra.iter().map(|s| s.text.as_str()).collect::<Vec<_>>().join(" ");
    assert_eq!(ghep, "một hai ba bốn năm sáu bảy tám chín mười mười một mười hai");
}

#[test]
fn tu_dai_hon_gioi_han_thi_de_nguyen_chu_khong_bam_nat() {
    use app_lib::srt::cat_cue_dai;
    let v = vec![seg(0, 2000, "https://example.com/mot-duong-dan-rat-dai-khong-the-cat")];
    let ra = cat_cue_dai(&v, 20);
    assert_eq!(ra.len(), 1, "cắt giữa một đường dẫn chỉ làm khó đọc hơn");
}

#[test]
fn cue_rong_loi_van_duoc_giu_lai() {
    use app_lib::srt::{cat_cue_dai, MAX_MOT_DONG};
    // run_tts_stage dựa vào số cue khớp giữa SRT và manifest; âm thầm bỏ cue
    // rỗng ở đây sẽ làm lệch toàn bộ phép ghép theo vị trí.
    let v = vec![seg(0, 1000, "  "), seg(1000, 2000, "Có lời.")];
    let ra = cat_cue_dai(&v, MAX_MOT_DONG);
    assert_eq!(ra.len(), 2, "không được bỏ cue rỗng lời");
}

#[test]
fn khong_cat_o_dau_cham_trong_so_tien_hay_ten_mien() {
    use app_lib::srt::cat_cue_dai;
    // Video bán hàng đầy giá tiền kiểu này; cắt ở mọi dấu chấm là bổ đôi con số.
    let v = vec![seg(0, 3000, "Giá chỉ 1.500.000 đồng thôi nhé.")];
    let ra = cat_cue_dai(&v, 42);
    assert_eq!(ra.len(), 1, "nhận: {:?}", ra.iter().map(|s| &s.text).collect::<Vec<_>>());
    assert!(ra[0].text.contains("1.500.000"), "con số phải nguyên vẹn: {:?}", ra[0].text);
}
