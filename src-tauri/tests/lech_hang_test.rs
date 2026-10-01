//! Chặn bản dịch bị lệch hàng.
//!
//! Lệch hàng là lỗi nguy hiểm nhất của đường dịch: nhà cung cấp trả đủ số item,
//! chỉ số liên tục từ 0, không cue nào rỗng — mọi lớp kiểm cũ đều xanh — nhưng
//! nội dung đã dịch chuyển đi vài dòng, nên phụ đề chạy sai với tiếng nói suốt
//! phim. Chưa gặp model nào thật sự lệch, nhưng hậu quả quá nặng để chờ gặp
//! rồi mới chặn — và người dùng không tự nhận ra được, vì từng câu đọc vẫn xuôi.

use app_lib::error::PipelineError;
use app_lib::srt::Segment;
use app_lib::translate::{cum_so, translate_segments, TranslateProvider};
use std::cell::RefCell;

/// Câu gốc có số làm mốc neo; `None` nghĩa là câu không có số.
const NGUON: &[&str] = &[
    "trước 200 mét có đường hầm",
    "tôi mua nó 12000 tệ",
    "không có số nào ở đây",
    "qua 48 giờ vừa rồi",
    "chỉ là lời thoại thường",
];

/// Trả bản dịch ĐÚNG hàng.
fn dung(texts: &[&str]) -> Vec<String> {
    texts.iter().map(|t| format!("VI[{t}]")).collect()
}

/// Trả bản dịch bị dịch chuyển một dòng: item i nhận nội dung của item i+1.
fn lech_mot_dong(texts: &[&str]) -> Vec<String> {
    (0..texts.len())
        .map(|i| format!("VI[{}]", texts[(i + 1) % texts.len()]))
        .collect()
}

struct Gia {
    goi: RefCell<usize>,
    /// Số lần đầu trả lệch; sau đó trả đúng.
    lech_may_lan: usize,
    /// Viết số thành chữ thay vì giữ chữ số — thứ dễ bị nhầm thành lệch hàng.
    so_thanh_chu: bool,
}

impl Gia {
    fn moi(lech_may_lan: usize) -> Self {
        Self { goi: RefCell::new(0), lech_may_lan, so_thanh_chu: false }
    }
}

impl TranslateProvider for Gia {
    fn id(&self) -> &'static str {
        "gia"
    }
    fn batch_size(&self) -> usize {
        40
    }
    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        let lan = {
            let mut g = self.goi.borrow_mut();
            *g += 1;
            *g
        };
        if self.so_thanh_chu {
            // Mọi con số biến mất khỏi CẢ LÔ — không có số nào mọc ở câu khác.
            return Ok(texts
                .iter()
                .map(|t| {
                    t.chars()
                        .filter(|c| !c.is_ascii_digit())
                        .collect::<String>()
                        + " hai trăm"
                })
                .collect());
        }
        if lan <= self.lech_may_lan {
            Ok(lech_mot_dong(texts))
        } else {
            Ok(dung(texts))
        }
    }
}

fn segs() -> Vec<Segment> {
    NGUON
        .iter()
        .enumerate()
        .map(|(i, t)| Segment {
            start_ms: i as u64 * 1000,
            end_ms: i as u64 * 1000 + 500,
            text: (*t).into(),
        })
        .collect()
}

#[test]
fn lech_hang_keo_dai_thi_bao_loi_chu_khong_tra_ve_phu_de_sai() {
    let p = Gia::moi(usize::MAX); // lệch mãi
    let err = translate_segments(&p, &segs(), "zh", "vi").unwrap_err();
    let PipelineError::ProviderError { provider, msg, .. } = err else {
        panic!("phải là ProviderError");
    };
    assert_eq!(provider, "gia");
    assert!(msg.contains("lệch hàng"), "{msg}");
    // Thông báo phải dẫn được ví dụ, nếu không người dùng chẳng biết tìm ở đâu.
    assert!(msg.contains("200 mét") || msg.contains("12000"), "{msg}");
    assert_eq!(*p.goi.borrow(), 2, "thử lại đúng một lần rồi mới bỏ cuộc");
}

#[test]
fn lech_mot_lan_roi_dich_lai_dung_thi_nhan_ban_dung() {
    let p = Gia::moi(1);
    let out = translate_segments(&p, &segs(), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "VI[trước 200 mét có đường hầm]");
    assert_eq!(out[1].text, "VI[tôi mua nó 12000 tệ]");
    assert_eq!(*p.goi.borrow(), 2);
}

#[test]
fn dich_dung_hang_thi_khong_goi_them_request_nao() {
    let p = Gia::moi(0);
    let out = translate_segments(&p, &segs(), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "VI[trước 200 mét có đường hầm]");
    assert_eq!(*p.goi.borrow(), 1);
}

/// Thứ dễ bị nhầm thành lệch hàng nhất: model viết số thành chữ. Khi đó con số
/// biến mất khỏi cả lô chứ không mọc ở câu khác — không được coi là lệch, càng
/// không được bắt cả bản dịch tốt phải chết.
#[test]
fn model_viet_so_thanh_chu_thi_khong_bi_ket_toi_lech_hang() {
    let mut p = Gia::moi(0);
    p.so_thanh_chu = true;
    let out = translate_segments(&p, &segs(), "zh", "vi").unwrap();
    assert!(out[0].text.contains("hai trăm"));
    assert_eq!(*p.goi.borrow(), 1, "không được thử lại");
}

#[test]
fn cum_so_bo_dau_phan_cach_hang_nghin_nhung_giu_dau_cau() {
    // Tiếng Việt viết 12.000, bản gốc viết 12000 — không chuẩn hoá thì mọi con
    // số lớn đều bị kết tội lệch hàng.
    assert_eq!(cum_so("tôi trả 12.000 đồng"), vec!["12000"]);
    assert_eq!(cum_so("tôi trả 12,000 đồng"), vec!["12000"]);
    assert_eq!(cum_so("tôi trả 12000 đồng"), vec!["12000"]);
    // Dấu chấm hết câu không phải phân cách.
    assert_eq!(cum_so("qua 72 giờ. Rồi 48 giờ"), vec!["72", "48"]);
    // Số một chữ số bỏ qua: trùng nhau quá dễ, lại hay được viết thành chữ.
    assert_eq!(cum_so("có 3 người"), Vec::<String>::new());
    assert_eq!(cum_so("không có số"), Vec::<String>::new());
}

#[path = "du_lieu_lech.rs"]
mod du_lieu_lech;

/// Một lô 40 cue tiếng Việt THẬT bị dịch chuyển 5 dòng.
///
/// Bài trên dùng câu bịa ngắn; bài này dùng văn thật của phim, vì ngưỡng và
/// cách nhận diện chỉ đáng tin khi thử trên mật độ số thật của một lô thật —
/// có lô chỉ vài cue mang số. Không cần model.
#[test]
fn chan_duoc_lo_40_cue_that_bi_dich_chuyen_nam_dong() {
    struct Phat;
    impl TranslateProvider for Phat {
        fn id(&self) -> &'static str {
            "phat_lai"
        }
        fn batch_size(&self) -> usize {
            40
        }
        fn translate_batch(
            &self,
            _t: &[&str],
            _s: &str,
            _g: &str,
        ) -> Result<Vec<String>, PipelineError> {
            Ok(du_lieu_lech::DICH_LECH.iter().map(|x| (*x).to_string()).collect())
        }
    }
    let segs: Vec<Segment> = du_lieu_lech::NGUON
        .iter()
        .enumerate()
        .map(|(i, t)| Segment {
            start_ms: i as u64 * 1000,
            end_ms: i as u64 * 1000 + 500,
            text: (*t).into(),
        })
        .collect();
    let err = translate_segments(&Phat, &segs, "zh", "vi").unwrap_err();
    let PipelineError::ProviderError { msg, .. } = err else {
        panic!("phải là ProviderError");
    };
    assert!(msg.contains("lệch hàng"), "{msg}");
}
