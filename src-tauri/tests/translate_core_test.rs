use app_lib::error::PipelineError;
use app_lib::srt::Segment;
use app_lib::translate::{translate_segments, TranslateProvider};
use std::cell::RefCell;

struct Fake {
    calls: RefCell<Vec<usize>>,
    bad_len: bool,
}

impl TranslateProvider for Fake {
    fn id(&self) -> &'static str {
        "fake"
    }

    fn batch_size(&self) -> usize {
        3
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        self.calls.borrow_mut().push(texts.len());
        if self.bad_len {
            return Ok(vec!["x".into()]);
        }
        Ok(texts.iter().map(|t| format!("VI:{t}")).collect())
    }
}

fn segs(n: usize) -> Vec<Segment> {
    (0..n)
        .map(|i| Segment {
            start_ms: i as u64 * 1000,
            end_ms: i as u64 * 1000 + 500,
            text: format!("t{i}"),
        })
        .collect()
}

#[test]
fn chunks_by_batch_size_and_keeps_order_and_timing() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: false,
    };
    let out = translate_segments(&p, &segs(7), "zh", "vi").unwrap();
    assert_eq!(p.calls.borrow().as_slice(), &[3, 3, 1]);
    assert_eq!(out.len(), 7);
    assert_eq!(out[4].text, "VI:t4");
    assert_eq!(out[4].start_ms, 4000);
    assert_eq!(out[4].end_ms, 4500);
}

#[test]
fn empty_input_makes_no_calls() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: false,
    };
    assert!(translate_segments(&p, &[], "zh", "vi").unwrap().is_empty());
    assert!(p.calls.borrow().is_empty());
}

#[test]
fn length_mismatch_is_provider_error() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: true,
    };
    let err = translate_segments(&p, &segs(2), "zh", "vi").unwrap_err();
    assert!(matches!(err, PipelineError::ProviderError { .. }));
}

struct FakeWide {
    calls: RefCell<Vec<usize>>,
}

impl TranslateProvider for FakeWide {
    fn id(&self) -> &'static str {
        "fake_wide"
    }

    fn batch_size(&self) -> usize {
        // Large enough that all 4 segments in the blank-text test land in a
        // single chunk, so we can assert exactly one call is made.
        40
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        self.calls.borrow_mut().push(texts.len());
        Ok(texts.iter().map(|t| format!("VI:{t}")).collect())
    }
}

#[test]
fn blank_texts_are_not_sent_and_map_to_empty_string() {
    let p = FakeWide {
        calls: RefCell::new(vec![]),
    };
    let segs = vec![
        Segment { start_ms: 0, end_ms: 100, text: "a".into() },
        Segment { start_ms: 100, end_ms: 200, text: "".into() },
        Segment { start_ms: 200, end_ms: 300, text: "  ".into() },
        Segment { start_ms: 300, end_ms: 400, text: "b".into() },
    ];
    let out = translate_segments(&p, &segs, "zh", "vi").unwrap();
    // Exactly one call sent, containing only the non-blank texts.
    assert_eq!(p.calls.borrow().as_slice(), &[2]);
    let texts: Vec<&str> = out.iter().map(|s| s.text.as_str()).collect();
    assert_eq!(texts, vec!["VI:a", "", "", "VI:b"]);
    // timings preserved
    assert_eq!(out[3].start_ms, 300);
    assert_eq!(out[3].end_ms, 400);
}

#[test]
fn chunk_with_only_blank_texts_makes_no_call() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: false,
    };
    let segs = vec![
        Segment { start_ms: 0, end_ms: 100, text: "".into() },
        Segment { start_ms: 100, end_ms: 200, text: "   ".into() },
    ];
    let out = translate_segments(&p, &segs, "zh", "vi").unwrap();
    assert!(p.calls.borrow().is_empty());
    assert_eq!(out.iter().map(|s| s.text.as_str()).collect::<Vec<_>>(), vec!["", ""]);
}

struct Newliner;
impl TranslateProvider for Newliner {
    fn id(&self) -> &'static str {
        "newliner"
    }
    fn batch_size(&self) -> usize {
        10
    }
    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        Ok(texts
            .iter()
            .map(|t| match *t {
                "x" => "x\n\n\ny".to_string(),
                "z" => "  z  ".to_string(),
                other => other.to_string(),
            })
            .collect())
    }
}

#[test]
fn translated_text_is_normalized_for_clean_srt_reparse() {
    let p = Newliner;
    let segs = vec![
        Segment { start_ms: 0, end_ms: 100, text: "x".into() },
        Segment { start_ms: 100, end_ms: 200, text: "z".into() },
    ];
    let out = translate_segments(&p, &segs, "zh", "vi").unwrap();
    assert_eq!(out[0].text, "x\ny");
    assert_eq!(out[1].text, "z");
}

/// Lô lớn để sót chữ Hán ở một cue; gửi riêng cue đó thì dịch trọn.
struct SotHan {
    goi: RefCell<Vec<usize>>,
    so_cue_sot: usize,
    lai_van_sot: bool,
    lai_tra: String,
    lai_loi: bool,
}

impl SotHan {
    fn moi(so_cue_sot: usize) -> Self {
        Self {
            goi: RefCell::new(vec![]),
            so_cue_sot,
            lai_van_sot: false,
            lai_tra: "vẫn nghỉ 半天".into(),
            lai_loi: false,
        }
    }
    /// Số lần gọi với đúng một cue — tức số lần dịch lại.
    fn so_lan_dich_lai(&self) -> usize {
        self.goi.borrow().iter().filter(|n| **n == 1).count()
    }
}

impl TranslateProvider for SotHan {
    fn id(&self) -> &'static str {
        "sot_han"
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
        self.goi.borrow_mut().push(texts.len());
        if texts.len() == 1 {
            if self.lai_loi {
                return Err(PipelineError::ProviderError {
                    provider: "sot_han".into(),
                    status: None,
                    msg: "rớt mạng".into(),
                });
            }
            if self.lai_van_sot {
                return Ok(vec![self.lai_tra.clone()]);
            }
            return Ok(vec!["đã dịch trọn".into()]);
        }
        Ok(texts
            .iter()
            .enumerate()
            .map(|(i, t)| {
                if i < self.so_cue_sot {
                    format!("nghỉ 半天 {t}")
                } else {
                    format!("VI:{t}")
                }
            })
            .collect())
    }
}

#[test]
fn cue_con_sot_chu_han_thi_duoc_gui_lai_rieng() {
    let p = SotHan::moi(2);
    let out = translate_segments(&p, &segs(5), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "đã dịch trọn");
    assert_eq!(out[1].text, "đã dịch trọn");
    assert_eq!(out[2].text, "VI:t2", "cue sạch không được đụng vào");
    assert_eq!(p.so_lan_dich_lai(), 2, "chỉ dịch lại đúng cue dính");
}

#[test]
fn khong_cue_nao_sot_thi_khong_goi_them_request_nao() {
    let p = SotHan::moi(0);
    translate_segments(&p, &segs(5), "zh", "vi").unwrap();
    assert_eq!(p.so_lan_dich_lai(), 0);
}

/// Dịch SANG tiếng Trung thì chữ Hán là bản dịch đúng. Đem đi kiểm thì cue nào
/// cũng "sai", và mỗi cue tốn thêm một request vô nghĩa.
#[test]
fn dich_sang_tieng_trung_thi_khong_kiem_chu_han() {
    for tgt in ["zh", "zh-CN", "ZH_Hans", "ja", "yue"] {
        let p = SotHan::moi(2);
        translate_segments(&p, &segs(5), "vi", tgt).unwrap();
        assert_eq!(p.so_lan_dich_lai(), 0, "ngôn ngữ đích {tgt} không được kiểm");
    }
}

/// Bản vá hỏng không được xoá mất bản dịch đang có — thà vụng còn hơn mất.
#[test]
fn dich_lai_van_sot_thi_giu_nguyen_ban_cu() {
    let mut p = SotHan::moi(1);
    p.lai_van_sot = true;
    let out = translate_segments(&p, &segs(3), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "nghỉ 半天 t0");
    assert_eq!(p.so_lan_dich_lai(), 1, "chỉ thử lại một lần, không lặp");
}

/// Cả lô đã dịch xong; một request vá lỗi hỏng không được kéo sập toàn bộ.
#[test]
fn dich_lai_loi_thi_van_tra_ve_ban_dich_cua_ca_lo() {
    let mut p = SotHan::moi(1);
    p.lai_loi = true;
    let out = translate_segments(&p, &segs(3), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "nghỉ 半天 t0");
    assert_eq!(out[1].text, "VI:t1");
}

/// Cả lô cùng sót là hỏng hệ thống, không phải lỗi ngẫu nhiên. 40 request nữa
/// cũng không chữa được, chỉ tổ chậm và tốn tiền với nhà cung cấp cloud.
#[test]
fn ca_lo_cung_sot_thi_chan_lai_o_tran() {
    let p = SotHan::moi(30);
    translate_segments(&p, &segs(30), "zh", "vi").unwrap();
    assert_eq!(p.so_lan_dich_lai(), 8);
}

#[test]
fn nhan_dien_duoc_chu_han_va_kana_nhung_khong_bat_nham_tieng_viet() {
    use app_lib::translate::con_chu_dong_a;
    assert!(con_chu_dong_a("bị trúng độc酮 cấp tính"));
    assert!(con_chu_dong_a("助けてして"), "kana cũng là dịch sót");
    assert!(con_chu_dong_a("カタカナ"));
    assert!(!con_chu_dong_a("Chị Minh Nguyệt đang đợi anh ở trên lầu."));
    assert!(!con_chu_dong_a("iPhone 16 Pro, 5.439 đồng — rẻ hơn 400!"));
    assert!(!con_chu_dong_a(""));
}

/// Bản sửa bớt được chữ sót thì phải nhận, dù chưa sạch hẳn. Đo thật: có câu
/// chỉ rụng được `小子` còn `半天` vẫn ở lại — đòi sạch thì vứt luôn phần khá
/// hơn đó.
#[test]
fn dich_lai_bot_duoc_chu_sot_thi_nhan_du_chua_sach_han() {
    let mut p = SotHan::moi(1);
    p.lai_van_sot = true;
    p.lai_tra = "nghỉ 半 thôi".into(); // 2 chữ sót xuống còn 1
    let out = translate_segments(&p, &segs(3), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "nghỉ 半 thôi");
}

/// Bản sửa sót BẰNG hoặc NHIỀU HƠN thì giữ nguyên bản cũ — luật phải đơn điệu,
/// không bao giờ được làm xấu đi.
#[test]
fn dich_lai_sot_nhieu_hon_thi_khong_duoc_nhan() {
    let mut p = SotHan::moi(1);
    p.lai_van_sot = true;
    p.lai_tra = "còn 半天假 nữa".into(); // 3 chữ sót, nhiều hơn bản cũ
    let out = translate_segments(&p, &segs(3), "zh", "vi").unwrap();
    assert_eq!(out[0].text, "nghỉ 半天 t0");
}

/// Tiến độ phải báo sau MỖI LÔ, với mẫu số là tổng số cue của cả file.
///
/// Mẫu số sai là thanh tiến độ nói dối: lấy nhầm số cue của một lô thì nó chạy
/// 0→100% rồi nhảy về 0, lặp đi lặp lại.
#[test]
fn bao_tien_do_sau_moi_lo_voi_mau_so_la_tong_so_cue() {
    use app_lib::translate::translate_segments_co_tien_do;
    let p = Fake { calls: RefCell::new(vec![]), bad_len: false };
    let mut moc: Vec<(usize, usize)> = Vec::new();
    // Fake có batch_size 3, nên 7 cue chia thành 3 + 3 + 1.
    translate_segments_co_tien_do(
        &p,
        &segs(7),
        "zh",
        "vi",
        &app_lib::so_tay::SoTay::default(),
        &mut |xong, tong| moc.push((xong, tong)),
    )
    .unwrap();
    assert_eq!(moc, vec![(3, 7), (6, 7), (7, 7)]);
}

/// Lô cuối phải chốt đúng ở 100%, kể cả khi tổng số cue chia hết cho cỡ lô —
/// nếu không thanh tiến độ đứng ở 99% mãi và người dùng tưởng còn đang chạy.
#[test]
fn lo_cuoi_chot_dung_o_tong_so_cue() {
    use app_lib::translate::translate_segments_co_tien_do;
    let p = Fake { calls: RefCell::new(vec![]), bad_len: false };
    let mut moc: Vec<(usize, usize)> = Vec::new();
    translate_segments_co_tien_do(
        &p,
        &segs(6),
        "zh",
        "vi",
        &app_lib::so_tay::SoTay::default(),
        &mut |xong, tong| moc.push((xong, tong)),
    )
    .unwrap();
    assert_eq!(moc.last(), Some(&(6, 6)));
}
