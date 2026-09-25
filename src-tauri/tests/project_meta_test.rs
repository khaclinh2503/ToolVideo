use app_lib::project::{load, meta_path, save, update, ProjectMeta};
use std::path::Path;

fn meta(video: &str, tgt: &str, created: u64, updated: u64) -> ProjectMeta {
    ProjectMeta {
        version: 1,
        video_path: video.to_string(),
        src_lang: "zh".into(),
        tgt_lang: tgt.to_string(),
        created_at: created,
        updated_at: updated,
        export_path: None,
    }
}

#[test]
fn ghi_roi_doc_lai_ra_dung_meta() {
    let d = tempfile::tempdir().unwrap();
    let m = meta(r"E:\phim\clip.mp4", "vi", 1000, 2000);
    save(d.path(), &m).unwrap();
    assert_eq!(load(d.path()).unwrap(), m);
}

#[test]
fn meta_path_la_project_json_trong_thu_muc_du_an() {
    assert_eq!(
        meta_path(Path::new("/a/b")).file_name().unwrap(),
        "project.json"
    );
}

#[test]
fn thieu_file_tra_ve_none() {
    let d = tempfile::tempdir().unwrap();
    assert!(load(d.path()).is_none());
}

#[test]
fn json_hong_tra_ve_none_chu_khong_panic() {
    let d = tempfile::tempdir().unwrap();
    std::fs::write(meta_path(d.path()), "{ không phải json").unwrap();
    assert!(load(d.path()).is_none());
}

#[test]
fn save_khong_de_lai_file_tmp() {
    let d = tempfile::tempdir().unwrap();
    save(d.path(), &meta("v.mp4", "vi", 1, 1)).unwrap();
    let con: Vec<String> = std::fs::read_dir(d.path())
        .unwrap()
        .flatten()
        .map(|e| e.file_name().to_string_lossy().to_string())
        .collect();
    assert_eq!(con, vec!["project.json".to_string()], "còn sót file tạm: {con:?}");
}

#[test]
fn update_bump_updated_at_va_giu_created_at() {
    let d = tempfile::tempdir().unwrap();
    save(d.path(), &meta("v.mp4", "vi", 1000, 1000)).unwrap();

    update(d.path(), 5555, |m| m.tgt_lang = "en".into()).unwrap();

    let got = load(d.path()).unwrap();
    assert_eq!(got.created_at, 1000, "created_at phải giữ nguyên");
    assert_eq!(got.updated_at, 5555);
    assert_eq!(got.tgt_lang, "en");
    assert_eq!(got.video_path, "v.mp4", "các trường khác không được đụng tới");
}

#[test]
fn update_khi_chua_co_meta_thi_khong_lam_gi_va_khong_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    // Dự án tạo trước M5 không có project.json. Một giai đoạn xử lý không được
    // phép thất bại chỉ vì không cập nhật nổi dấu thời gian.
    update(d.path(), 9999, |m| m.tgt_lang = "en".into()).unwrap();
    assert!(load(d.path()).is_none(), "không được tự tạo meta");
    assert!(!meta_path(d.path()).exists());
}

#[test]
fn du_an_cu_khong_co_export_path_van_doc_duoc() {
    // project.json viết trước khi có tính năng chọn thư mục xuất không hề có
    // khoá này. Thiếu #[serde(default)] thì mọi dự án cũ biến mất khỏi danh sách.
    let d = tempfile::tempdir().unwrap();
    // Khoá snake_case đúng như project.json thật trên đĩa.
    let cu = r#"{"version":1,"video_path":"E:/phim/clip.mp4","src_lang":"zh","tgt_lang":"vi","created_at":1,"updated_at":2}"#;
    std::fs::write(meta_path(d.path()), cu).unwrap();
    let m = load(d.path()).expect("dự án cũ phải đọc được");
    assert_eq!(m.tgt_lang, "vi");
    assert_eq!(m.export_path, None);
}

#[test]
fn du_an_cu_van_nhan_ra_ban_xuat_o_cho_mac_dinh() {
    let d = tempfile::tempdir().unwrap();
    let m = meta(r"E:\phim\clip.mp4", "vi", 1, 2);
    std::fs::create_dir_all(d.path().join("output")).unwrap();
    std::fs::write(d.path().join("output").join("final.mp4"), b"x").unwrap();
    assert!(app_lib::project::status(d.path(), &m).has_export);
}

#[test]
fn nhan_ra_ban_xuat_nam_ngoai_thu_muc_du_an() {
    // Xuất ra thư mục riêng thì <dự án>/output/final.mp4 KHÔNG tồn tại; chỉ dựa
    // vào chỗ cũ là dự án sẽ báo "chưa xuất" dù file nằm sờ sờ trên Desktop.
    let d = tempfile::tempdir().unwrap();
    let ngoai = tempfile::tempdir().unwrap();
    let f = ngoai.path().join("clip-vi.mp4");
    std::fs::write(&f, b"x").unwrap();
    let mut m = meta(r"E:\phim\clip.mp4", "vi", 1, 2);
    m.export_path = Some(f.display().to_string());
    assert!(!d.path().join("output").join("final.mp4").exists(), "tiền đề của test");
    assert!(app_lib::project::status(d.path(), &m).has_export);
}

#[test]
fn ban_xuat_bi_xoa_thi_bao_la_chua_co() {
    // Phân biệt "đọc đường dẫn rồi kiểm tồn tại" với "chỉ cần có Some là xong":
    // người dùng xoá hoặc chuyển file đi thì nút Mở thư mục phải biến mất, chứ
    // không được trỏ vào chỗ trống.
    let d = tempfile::tempdir().unwrap();
    let mut m = meta(r"E:\phim\clip.mp4", "vi", 1, 2);
    m.export_path = Some(r"E:\khong\ton\tai\clip-vi.mp4".into());
    assert!(!app_lib::project::status(d.path(), &m).has_export);
}
