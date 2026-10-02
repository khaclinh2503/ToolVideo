//! Tách người nói: đọc kết quả và gán cue cho người nói.

use app_lib::srt::Segment;
use app_lib::tach_nguoi_noi::{gan_cho_cue, parse_output, DoanNguoiNoi};

fn seg(a: u64, b: u64) -> Segment {
    Segment { start_ms: a, end_ms: b, text: "x".into() }
}

const THAT: &str = "\
OfflineSpeakerDiarizationConfig(segmentation=...)
Started
2.360 -- 3.338 speaker_01
3.541 -- 6.764 speaker_00
17.615 -- 18.121 speaker_02
";

#[test]
fn doc_dung_dinh_dang_that() {
    let d = parse_output(THAT);
    assert_eq!(d.len(), 3, "{d:?}");
    assert_eq!(d[0], DoanNguoiNoi { start_ms: 2360, end_ms: 3338, nguoi: "speaker_01".into() });
    assert_eq!(d[2].start_ms, 17615);
}

/// Dòng tiến độ của stderr chen vào giữa một dòng kết quả.
///
/// Đây KHÔNG phải ca giả định: lần chạy thử đầu tiên gộp hai luồng (`2>&1`) và
/// đẻ ra đúng dòng dưới đây. Khớp lỏng thì nó thành một đoạn giả dài 12 phút,
/// nuốt trọn mọi cue khi gán theo độ chồng lấn, và cả phim ra một người nói mà
/// không lỗi nào báo. Khớp cả dòng là thứ duy nhất chặn được.
#[test]
fn dong_tien_do_chen_vao_thi_bo_qua_chu_khong_nuot_ca_phim() {
    let ban = "\
2.360 -- 3.338 speaker_01
progress 4.35
35 -- 751.779 speaker_00
750.100 -- 751.779 speaker_00
";
    let d = parse_output(ban);
    assert_eq!(d.len(), 2, "dòng rác phải bị bỏ: {d:?}");
    assert!(
        d.iter().all(|x| x.end_ms - x.start_ms < 60_000),
        "lọt một đoạn dài bất thường: {d:?}"
    );
}

/// Thời gian phải có đúng ba chữ số thập phân. Nới ra là mọi dòng có dấu chấm
/// đều lọt.
#[test]
fn doi_dung_ba_chu_so_thap_phan() {
    assert!(parse_output("1.5 -- 2.5 speaker_00").is_empty());
    assert!(parse_output("1 -- 2 speaker_00").is_empty());
    assert!(parse_output("1.500 -- 2.500 speaker_0a").is_empty());
    assert_eq!(parse_output("1.500 -- 2.500 speaker_00").len(), 1);
}

/// Đoạn rỗng hoặc ngược thời gian thì bỏ, đừng để lọt vào phép gán.
#[test]
fn doan_rong_hoac_nguoc_thoi_gian_bi_bo() {
    assert!(parse_output("5.000 -- 5.000 speaker_00").is_empty());
    assert!(parse_output("5.000 -- 4.000 speaker_00").is_empty());
}

#[test]
fn gan_cue_cho_nguoi_chong_lan_nhieu_nhat() {
    let doan = parse_output(
        "0.000 -- 5.000 speaker_00\n4.000 -- 9.000 speaker_01\n20.000 -- 25.000 speaker_02\n",
    );
    let cues = [
        seg(0, 3000),      // trọn trong speaker_00
        seg(4500, 8000),   // chồng 500ms với 00, 3500ms với 01
        seg(12000, 15000), // không ai nói
    ];
    let g = gan_cho_cue(&cues, &doan);
    assert_eq!(g[0].as_deref(), Some("speaker_00"));
    assert_eq!(g[1].as_deref(), Some("speaker_01"));
    assert_eq!(g[2], None, "cue không chạm đoạn nào phải là None, không phải người đầu tiên");
}

/// Không đoạn nào ⇒ mọi cue đều `None`, chứ không phải hoảng hay gán bừa.
#[test]
fn khong_co_doan_nao_thi_khong_gan_bua() {
    let g = gan_cho_cue(&[seg(0, 1000)], &[]);
    assert_eq!(g, vec![None]);
}

/// Tham số dòng lệnh: `--num-threads` KHÔNG tồn tại ở lệnh này — truyền vào là
/// công cụ bỏ chạy với mã 127. Đã dính một lần.
#[test]
fn khong_truyen_num_threads_toan_cuc() {
    use app_lib::tach_nguoi_noi::{build_args, models};
    let m = models(std::path::Path::new("M"));
    let a = build_args(&m, std::path::Path::new("a.wav"), 6);
    assert!(
        !a.iter().any(|x| x.starts_with("--num-threads")),
        "lệnh này chỉ nhận --segmentation.num-threads và --embedding.num-threads: {a:?}"
    );
    assert!(a.iter().any(|x| x.starts_with("--segmentation.num-threads")));
    assert!(a.iter().any(|x| x.starts_with("--embedding.num-threads")));
    assert!(a.iter().any(|x| x == "--clustering.num-clusters=6"));
    assert_eq!(a.last().unwrap(), "a.wav", "đường dẫn wav phải đứng cuối");
}
