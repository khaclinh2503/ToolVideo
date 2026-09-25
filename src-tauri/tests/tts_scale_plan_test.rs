use app_lib::tts::ScalePlan;

#[test]
fn uniform_tra_ve_base_cho_moi_index() {
    let p = ScalePlan::uniform(1.25);
    assert_eq!(p.get(1), 1.25);
    assert_eq!(p.get(999), 1.25);
}

#[test]
fn per_cue_dem_tu_1() {
    let p = ScalePlan::per_cue(1.0, vec![0.8, 0.9, 1.1]);
    assert_eq!(p.get(1), 0.8);
    assert_eq!(p.get(2), 0.9);
    assert_eq!(p.get(3), 1.1);
}

#[test]
fn per_cue_ngoai_pham_vi_tra_ve_base() {
    let p = ScalePlan::per_cue(1.0, vec![0.8]);
    assert_eq!(p.get(2), 1.0, "index vượt danh sách phải rơi về base");
    assert_eq!(p.get(0), 1.0, "manifest đếm từ 1, index 0 không hợp lệ");
}
