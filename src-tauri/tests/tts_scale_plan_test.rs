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

#[test]
fn uniform_luong_tu_hoa_gia_tri_3_chu_so() {
    // cache_key định dạng length_scale bằng "{:.3}"; nếu ScalePlan không
    // lượng tử hoá ngay tại đây, một giá trị 3 chữ số thập phân từ config
    // (vd. do save_config nhận thẳng từ frontend) sẽ đổi khoá cache mỗi lần
    // gọi, khiến mọi cue bị sinh lại vô ích.
    let p = ScalePlan::uniform(0.975);
    assert_eq!(p.get(1), 0.98);
    assert_eq!(p.get(999), 0.98);
}

#[test]
fn per_cue_luong_tu_hoa_gia_tri_3_chu_so() {
    let p = ScalePlan::per_cue(0.975, vec![0.975, 0.604]);
    assert_eq!(p.get(1), 0.98);
    assert_eq!(p.get(2), 0.6, "0.604 làm tròn 2 chữ số thành 0.60");
    assert_eq!(p.get(3), 0.98, "ngoài phạm vi rơi về base đã lượng tử hoá");
}
