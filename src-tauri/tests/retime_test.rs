use app_lib::retime::{boundaries, fit_scale, fit_scales, Cue, FitOpts, MIN_LENGTH_SCALE};

fn cue(start_ms: u64, boundary_ms: u64, duration_ms: u64, scale: f32) -> Cue {
    Cue { start_ms, boundary_ms, duration_ms, scale }
}

#[test]
fn vua_khung_thi_giu_nguyen_toc_do() {
    // budget = 5000 - 0 - 80 = 4920; giọng dài 2000 ⇒ thừa chỗ
    let f = fit_scale(&cue(0, 5000, 2000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 1.0);
    assert!(!f.capped);
}

#[test]
fn khong_bao_gio_keo_cham_cue_ngan() {
    // giọng chỉ dài 1/10 khe — vẫn giữ 1.0, không giãn ra cho đầy
    let f = fit_scale(&cue(0, 10_000, 1000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 1.0);
}

#[test]
fn tran_thi_nhanh_lai_dung_ti_le() {
    // budget = 2000 - 0 - 80 = 1920; giọng dài 2400 ⇒ 1920/2400 = 0.80
    let f = fit_scale(&cue(0, 2000, 2400, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 0.8);
    assert!(!f.capped);
}

#[test]
fn ti_le_nhan_len_toc_do_dang_dung() {
    // đã ở 0.8 sẵn; 0.8 × 1920/2400 = 0.64
    let f = fit_scale(&cue(0, 2000, 2400, 0.8), &FitOpts::default());
    assert_eq!(f.scale, 0.64);
    assert!(!f.capped);
}

#[test]
fn cham_tran_thi_dung_lai_o_min_va_danh_dau_capped() {
    // budget = 920; giọng dài 3000 ⇒ cần 0.307, dưới trần 0.6
    let f = fit_scale(&cue(0, 1000, 3000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, MIN_LENGTH_SCALE);
    assert!(f.capped, "cue này vẫn tràn dù đã đọc nhanh hết cỡ");
}

#[test]
fn hai_cue_sat_nhau_hon_guard_thi_ve_min() {
    // boundary - start = 50 < guard 80 ⇒ budget 0
    let f = fit_scale(&cue(1000, 1050, 2000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, MIN_LENGTH_SCALE);
    assert!(f.capped);
}

#[test]
fn cue_chua_do_duoc_do_dai_thi_giu_nguyen() {
    // duration_ms == 0 là cue rỗng lời hoặc chưa sinh audio — không suy diễn gì
    let f = fit_scale(&cue(0, 100, 0, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 1.0);
    assert!(!f.capped);
}

#[test]
fn lam_tron_2_chu_so() {
    // 1920/2430 = 0.7901234... ⇒ phải ra đúng 0.79, không phải 0.7901234
    let f = fit_scale(&cue(0, 2000, 2430, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 0.79);
}

#[test]
fn boundary_la_start_cua_cue_ke_con_cue_cuoi_lay_do_dai_video() {
    assert_eq!(boundaries(&[0, 1000, 5000], 9000), vec![1000, 5000, 9000]);
}

#[test]
fn boundaries_voi_mot_cue_va_khong_cue() {
    assert_eq!(boundaries(&[0], 3000), vec![3000]);
    assert_eq!(boundaries(&[], 3000), Vec::<u64>::new());
}

#[test]
fn fit_scales_giu_dung_thu_tu() {
    let cues = vec![
        cue(0, 5000, 2000, 1.0),   // vừa
        cue(5000, 7000, 2400, 1.0), // tràn ⇒ 0.8
    ];
    let out = fit_scales(&cues, &FitOpts::default());
    assert_eq!(out.len(), 2);
    assert_eq!(out[0].scale, 1.0);
    assert_eq!(out[1].scale, 0.8);
}
