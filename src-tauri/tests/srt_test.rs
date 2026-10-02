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

// ---------- ngắt dòng theo từ tiếng Việt ----------

/// Ghép lại các dòng rồi kiểm từng chỗ ngắt: không chỗ nào được chấm 0 điểm.
fn cho_ngat(v: &[app_lib::srt::Segment], toi_da: usize) -> Vec<(String, String)> {
    let ra = app_lib::srt::cat_cue_dai(v, toi_da);
    ra.windows(2)
        .filter_map(|w| {
            let a = w[0].text.split_whitespace().last()?;
            let b = w[1].text.split_whitespace().next()?;
            Some((a.to_string(), b.to_string()))
        })
        .collect()
}

/// Tiếng Việt viết rời từng âm tiết, nên khoảng trắng KHÔNG phải ranh giới từ.
///
/// Đây là câu có thật lấy từ phụ đề một dự án: cách cắt cũ cho ra "...báo cáo
/// kiểm" rồi "tra chi tiết...", bổ đôi cả "kiểm tra" lẫn "chi tiết" — mà hai
/// mảnh còn hiện ở hai thời điểm khác nhau nên người xem đọc thành hai cụm vô
/// nghĩa. Người dùng báo đúng ca này.
#[test]
fn khong_bo_doi_tu_ghep_tieng_viet() {
    use app_lib::srt::{cat_cue_dai, MAX_MOT_DONG};
    let v = vec![seg(
        0,
        9000,
        "Mỗi máy đều có báo cáo kiểm tra chi tiết, chất lượng rõ ràng, \
         còn hỗ trợ trả lại hàng trong 7 ngày và bảo hành 1 năm.",
    )];
    let ra = cat_cue_dai(&v, MAX_MOT_DONG);
    let dong: Vec<&str> = ra.iter().map(|s| s.text.as_str()).collect();
    for cap in ["kiểm tra", "chi tiết", "chất lượng", "bảo hành"] {
        let (a, b) = cap.split_once(' ').unwrap();
        assert!(
            !dong.iter().any(|d| d.ends_with(a) && d.len() > a.len()),
            "bổ đôi {cap:?}: {dong:?}"
        );
        let _ = b;
    }
    assert!(
        dong.iter().any(|d| d.contains("kiểm tra")),
        "\"kiểm tra\" phải nằm trọn trong một dòng: {dong:?}"
    );
}

/// Chỗ ngắt phải rơi trước một hư từ hoặc sau dấu câu, không cắt bừa ở khoảng
/// trắng gần trần nhất.
///
/// Với ngưỡng dòng tối thiểu bằng NỬA trần, câu này không có chỗ ngắt sạch nào
/// đủ dài (chỗ sạch duy nhất là trước "đang", dài 20 ký tự) nên bộ cắt rơi về
/// cắt bừa và bổ đôi "chu kỳ". Ngưỡng một phần ba sửa đúng ca đó.
#[test]
fn ngat_truoc_hu_tu_chu_khong_cat_bua() {
    use app_lib::srt::{MAX_MOT_DONG, diem_ngat};
    let v = vec![seg(
        0,
        9000,
        "Sự nóng lên liên tục đang làm thay đổi chu kỳ phát triển \
         của một số loài côn trùng.",
    )];
    for (a, b) in cho_ngat(&v, MAX_MOT_DONG) {
        assert!(diem_ngat(&a, &b) > 0, "cắt bừa giữa {a:?} và {b:?}");
    }
}

/// Không tách con số khỏi đơn vị của nó. Video bán hàng đầy "7 ngày",
/// "100 tệ", "5.439 đồng" — tách ra là người xem đọc hụt mất con số.
#[test]
fn khong_tach_so_khoi_don_vi() {
    use app_lib::srt::{MAX_MOT_DONG, diem_ngat};
    assert_eq!(diem_ngat("7", "ngày"), 0, "số và đơn vị phải dính nhau");
    assert_eq!(diem_ngat("100", "tệ"), 0);
    let v = vec![seg(
        0,
        6000,
        "Rẻ hơn ít nhất 100 nhân dân tệ so với giá thị trường hiện nay nhé bạn.",
    )];
    let ra = app_lib::srt::cat_cue_dai(&v, MAX_MOT_DONG);
    let dong: Vec<&str> = ra.iter().map(|s| s.text.as_str()).collect();
    assert!(
        !dong.iter().any(|d| d.trim_end().ends_with("100")),
        "cắt ngay sau con số: {dong:?}"
    );
}

/// Không ngắt giữa HAI hư từ: "còn | có", "đã | được" đi liền thành một cụm.
#[test]
fn khong_ngat_giua_hai_hu_tu() {
    use app_lib::srt::diem_ngat;
    for (a, b) in [("còn", "có"), ("đã", "được"), ("cũng", "không"), ("một", "số")] {
        assert_eq!(diem_ngat(a, b), 0, "{a} | {b} phải bị coi là chỗ ngắt xấu");
    }
}

/// Hư từ HAI MẶT chỉ được dùng khi không còn chỗ nào khá hơn: `bị` trong
/// "chuẩn bị", `ông` trong "đàn ông", `người` trong "loài người" đều là âm tiết
/// sau của từ ghép, nên chúng phải xếp dưới hư từ mở ngữ.
#[test]
fn hu_tu_hai_mat_xep_duoi_hu_tu_mo_ngu() {
    use app_lib::srt::diem_ngat;
    assert!(diem_ngat("xong", "rồi") > diem_ngat("đàn", "ông"));
    assert!(diem_ngat("nhà", "và") > diem_ngat("chuẩn", "bị"));
    assert!(diem_ngat("trời", "đã") > diem_ngat("loài", "người"));
    // Dấu câu vẫn là chỗ ngắt tốt nhất.
    assert!(diem_ngat("rồi.", "Tôi") > diem_ngat("nhà", "và"));
}
