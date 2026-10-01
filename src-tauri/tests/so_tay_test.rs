//! Sổ tay tên riêng: đọc/ghi, lọc theo lô, bắt vi phạm, và sửa cue vi phạm.
//!
//! Điểm quan trọng nhất ở đây: sổ tay KHÔNG dựa vào việc model nghe lời prompt.
//! Phiên đo trước đã thử năm cách nhét quy tắc vào prompt cho một lỗi khác và
//! trượt cả năm. Thứ bắt buộc được kết quả là phần đối chiếu sau khi dịch.

use app_lib::error::PipelineError;
use app_lib::so_tay::{self, Muc, SoTay};
use app_lib::srt::Segment;
use app_lib::translate::{translate_segments_voi_so_tay, TranslateProvider};
use std::cell::RefCell;

fn muc(goc: &str, dich: &str, ghi_chu: &str) -> Muc {
    Muc {
        goc: goc.into(),
        dich: dich.into(),
        ghi_chu: ghi_chu.into(),
    }
}

fn so_tay_mau() -> SoTay {
    SoTay {
        version: 1,
        muc: vec![
            muc("球球", "Cầu Cầu", "tên con chó"),
            muc("灵公文", "Linh Công Văn", ""),
        ],
    }
}

#[test]
fn doc_ghi_quay_vong_duoc() {
    let d = tempfile::tempdir().unwrap();
    so_tay::ghi(d.path(), &so_tay_mau()).unwrap();
    let lai = so_tay::doc(d.path());
    assert_eq!(lai.muc, so_tay_mau().muc);
}

/// Sổ tay là tiện ích, không phải điều kiện để dịch. Thiếu file hay file hỏng
/// đều phải cho ra sổ rỗng chứ không được làm chết cả bước dịch.
#[test]
fn thieu_file_hoac_file_hong_deu_ra_so_rong() {
    let d = tempfile::tempdir().unwrap();
    assert!(so_tay::doc(d.path()).muc.is_empty(), "thiếu file");
    std::fs::write(so_tay::duong_dan(d.path()), "{ đây không phải JSON").unwrap();
    assert!(so_tay::doc(d.path()).muc.is_empty(), "file hỏng");
}

#[test]
fn chi_lay_muc_co_mat_trong_lo_dang_dich() {
    let s = so_tay_mau();
    let lq = so_tay::muc_lien_quan(&s, &["球球呢刚不还在吗？"]);
    assert_eq!(lq.len(), 1);
    assert_eq!(lq[0].dich, "Cầu Cầu");
    assert!(so_tay::muc_lien_quan(&s, &["không có tên nào"]).is_empty());
}

/// Mục `goc` rỗng khớp MỌI câu nếu không chặn — người dùng gõ dở một dòng là cả
/// sổ bị kéo vào prompt của mọi lô.
#[test]
fn muc_goc_rong_khong_duoc_khop_moi_cau() {
    let s = SoTay {
        version: 1,
        muc: vec![muc("", "Gì Đó", "")],
    };
    assert!(so_tay::muc_lien_quan(&s, &["bất kỳ câu nào"]).is_empty());
}

#[test]
fn bat_vi_pham_khong_phan_biet_hoa_thuong() {
    let s = so_tay_mau();
    let tat_ca: Vec<&Muc> = s.muc.iter().collect();
    // Đúng: có "Cầu Cầu".
    assert!(so_tay::muc_vi_pham("球球呢", "Cầu Cầu đâu rồi", &tat_ca).is_empty());
    // Viết thường giữa câu vẫn là đúng, không được báo vi phạm.
    assert!(so_tay::muc_vi_pham("球球呢", "con cầu cầu đâu rồi", &tat_ca).is_empty());
    // Sai: dịch nghĩa thay vì phiên âm.
    let v = so_tay::muc_vi_pham("球球呢", "Bóng bóng đâu rồi", &tat_ca);
    assert_eq!(v.len(), 1);
    assert_eq!(v[0].goc, "球球");
}

/// Người dùng đang gõ dở một mục (chưa điền vế dịch) thì mọi cue chứa từ gốc
/// đều thành "vi phạm" và bị gửi đi sửa vô ích.
#[test]
fn muc_chua_dien_ve_dich_thi_chua_phai_la_luat() {
    let s = SoTay {
        version: 1,
        muc: vec![muc("球球", "   ", "")],
    };
    let tat_ca: Vec<&Muc> = s.muc.iter().collect();
    assert!(so_tay::muc_vi_pham("球球呢", "Bóng bóng đâu", &tat_ca).is_empty());
}

struct Gia {
    goi: RefCell<Vec<String>>,
    /// Bản dịch đầu gọi sai tên; bản sửa gọi đúng.
    sua_duoc: bool,
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
        self.goi.borrow_mut().push("lo".into());
        Ok(texts.iter().map(|_| "Bóng bóng đâu rồi".to_string()).collect())
    }
    fn dich_lai_sua_loi(
        &self,
        _text: &str,
        mo_ta_loi: &str,
        _s: &str,
        _t: &str,
    ) -> Result<String, PipelineError> {
        self.goi.borrow_mut().push(mo_ta_loi.to_string());
        if self.sua_duoc {
            Ok("Cầu Cầu đâu rồi".into())
        } else {
            Ok("Bóng bóng đâu rồi".into())
        }
    }
}

fn segs() -> Vec<Segment> {
    vec![Segment {
        start_ms: 0,
        end_ms: 500,
        text: "球球呢刚不还在吗？".into(),
    }]
}

#[test]
fn cue_goi_sai_ten_rieng_thi_duoc_gui_di_sua() {
    let p = Gia {
        goi: RefCell::new(vec![]),
        sua_duoc: true,
    };
    let out = translate_segments_voi_so_tay(&p, &segs(), "zh", "vi", &so_tay_mau()).unwrap();
    assert_eq!(out[0].text, "Cầu Cầu đâu rồi");
    let goi = p.goi.borrow();
    assert_eq!(goi.len(), 2, "một lần dịch lô, một lần sửa");
    // Mô tả lỗi phải chỉ đích danh tên và cách gọi đúng, kèm vai nếu có.
    assert!(goi[1].contains("球球"), "{}", goi[1]);
    assert!(goi[1].contains("Cầu Cầu"), "{}", goi[1]);
    assert!(goi[1].contains("tên con chó"), "{}", goi[1]);
}

/// Bản sửa vẫn sai thì giữ nguyên bản cũ — luật đơn điệu, không bao giờ làm xấu
/// đi, y như nhánh sửa chữ Hán còn sót.
#[test]
fn ban_sua_van_sai_thi_giu_nguyen_ban_cu() {
    let p = Gia {
        goi: RefCell::new(vec![]),
        sua_duoc: false,
    };
    let out = translate_segments_voi_so_tay(&p, &segs(), "zh", "vi", &so_tay_mau()).unwrap();
    assert_eq!(out[0].text, "Bóng bóng đâu rồi");
    assert_eq!(p.goi.borrow().len(), 2, "chỉ thử lại một lần, không lặp");
}

#[test]
fn so_tay_rong_thi_khong_goi_them_request_nao() {
    let p = Gia {
        goi: RefCell::new(vec![]),
        sua_duoc: true,
    };
    translate_segments_voi_so_tay(&p, &segs(), "zh", "vi", &SoTay::default()).unwrap();
    assert_eq!(p.goi.borrow().len(), 1);
}
