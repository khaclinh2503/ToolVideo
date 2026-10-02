//! Bảng người nói của dự án: đọc/ghi, gán giọng, xếp nhân vật chính lên đầu.

use app_lib::nguoi_noi::{cau_tieu_bieu, dem_theo_nguoi, doc, ghi, giong_cue, NguoiNoi};
use app_lib::srt::Segment;
use app_lib::tach_nguoi_noi::DoanNguoiNoi;

fn seg(a: u64, b: u64, t: &str) -> Segment {
    Segment { start_ms: a, end_ms: b, text: t.into() }
}

fn doan(a: u64, b: u64, ai: &str) -> DoanNguoiNoi {
    DoanNguoiNoi { start_ms: a, end_ms: b, nguoi: ai.into() }
}

fn bang() -> NguoiNoi {
    let mut n = NguoiNoi { version: 1, so_nguoi: 3, doan: vec![], giong: Default::default() };
    n.doan = vec![
        doan(0, 2000, "speaker_00"),
        doan(2000, 4000, "speaker_01"),
        doan(4000, 6000, "speaker_01"),
        doan(6000, 8000, "speaker_01"),
        doan(8000, 9000, "speaker_02"),
        doan(9000, 10000, "speaker_02"),
    ];
    n
}

/// Thiếu file hoặc JSON hỏng ⇒ bảng rỗng, không phải lỗi: lồng tiếng vẫn chạy
/// được bằng một giọng, dừng cả bước vì một file phụ là đổi phiền toái nhỏ lấy
/// bế tắc.
#[test]
fn thieu_file_hoac_hong_thi_bang_rong() {
    let d = tempfile::tempdir().unwrap();
    assert!(doc(d.path()).doan.is_empty());
    std::fs::write(d.path().join("nguoi_noi.json"), "{ hỏng").unwrap();
    assert!(doc(d.path()).doan.is_empty());
}

#[test]
fn ghi_roi_doc_lai_giu_nguyen() {
    let d = tempfile::tempdir().unwrap();
    let mut n = bang();
    n.giong.insert("speaker_01".into(), "Trúc Ly".into());
    ghi(d.path(), &n).unwrap();
    let lai = doc(d.path());
    assert_eq!(lai.doan.len(), 6);
    assert_eq!(lai.so_nguoi, 3);
    assert_eq!(lai.giong.get("speaker_01").map(String::as_str), Some("Trúc Ly"));
}

/// Xếp theo số đoạn giảm dần: giao diện phải bày nhân vật chính lên đầu, chứ
/// `speaker_00` chỉ là số thứ tự công cụ đặt, không phải vai chính.
#[test]
fn xep_nguoi_noi_nhieu_doan_len_dau() {
    let d = dem_theo_nguoi(&bang());
    assert_eq!(d[0], ("speaker_01".to_string(), 3));
    assert_eq!(d[1], ("speaker_02".to_string(), 2));
    assert_eq!(d[2], ("speaker_00".to_string(), 1));
}

#[test]
fn giong_cue_chi_co_cue_cua_nguoi_da_gan_giong() {
    let mut n = bang();
    n.giong.insert("speaker_01".into(), "Trúc Ly".into());
    let cues = [
        seg(0, 1500, "một"),    // speaker_00, chưa gán giọng
        seg(2500, 3500, "hai"), // speaker_01
        seg(20000, 21000, "ba"), // không ai nói
    ];
    let g = giong_cue(&n, &cues);
    assert_eq!(g.len(), 1, "{g:?}");
    assert_eq!(g.get(&2).map(String::as_str), Some("Trúc Ly"));
}

/// Giọng rỗng không được coi là đã gán — nếu không, bước lồng tiếng truyền
/// chuỗi rỗng xuống engine thay vì rơi về giọng mặc định.
#[test]
fn giong_rong_khong_tinh_la_da_gan() {
    let mut n = bang();
    n.giong.insert("speaker_01".into(), "   ".into());
    let g = giong_cue(&n, &[seg(2500, 3500, "hai")]);
    assert!(g.is_empty(), "{g:?}");
}

/// Câu tiêu biểu là cue DÀI NHẤT của người đó: người dùng phải nhận ra nhân
/// vật trước khi chọn giọng, mà một nhãn trống thì không ai chọn nổi.
#[test]
fn cau_tieu_bieu_lay_cue_dai_nhat() {
    let n = bang();
    let cues = [
        seg(2100, 2400, "Ừ."),
        seg(4100, 5900, "Câu này dài hơn hẳn nên phải chọn nó."),
        seg(6100, 7900, "Ngắn."),
    ];
    assert_eq!(
        cau_tieu_bieu(&n, &cues, "speaker_01"),
        Some("Câu này dài hơn hẳn nên phải chọn nó.")
    );
    assert_eq!(cau_tieu_bieu(&n, &cues, "speaker_09"), None);
}
