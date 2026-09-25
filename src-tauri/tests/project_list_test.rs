use app_lib::project::{list, save, status, ProjectMeta};
use std::path::Path;

fn meta(video: &str, tgt: &str, updated: u64) -> ProjectMeta {
    ProjectMeta {
        version: 1,
        video_path: video.to_string(),
        src_lang: "zh".into(),
        tgt_lang: tgt.to_string(),
        created_at: 1,
        updated_at: updated,
    }
}

/// Tạo file rỗng kèm mọi thư mục cha.
fn touch(p: &Path) {
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, b"x").unwrap();
}

#[test]
fn du_an_trong_thi_moi_co_deu_false() {
    let d = tempfile::tempdir().unwrap();
    let m = meta("khong-ton-tai.mp4", "vi", 1);
    let s = status(d.path(), &m);
    assert!(!s.has_stt && !s.has_translation && !s.has_tts && !s.has_export);
    assert!(!s.video_exists);
}

#[test]
fn tung_co_bat_theo_dung_file_tuong_ung() {
    let d = tempfile::tempdir().unwrap();
    let m = meta("khong-ton-tai.mp4", "vi", 1);

    touch(&d.path().join("subtitles/source.srt"));
    assert!(status(d.path(), &m).has_stt);
    assert!(!status(d.path(), &m).has_translation);

    touch(&d.path().join("subtitles/translated.vi.srt"));
    assert!(status(d.path(), &m).has_translation);

    touch(&d.path().join("tts/manifest.json"));
    assert!(status(d.path(), &m).has_tts);

    touch(&d.path().join("output/final.mp4"));
    assert!(status(d.path(), &m).has_export);
}

#[test]
fn has_translation_theo_dung_tgt_lang_trong_meta() {
    let d = tempfile::tempdir().unwrap();
    touch(&d.path().join("subtitles/translated.vi.srt"));

    assert!(status(d.path(), &meta("v.mp4", "vi", 1)).has_translation);
    assert!(
        !status(d.path(), &meta("v.mp4", "en", 1)).has_translation,
        "đổi ngôn ngữ đích thì bản dịch cũ không còn tính là bản dịch của dự án"
    );
}

#[test]
fn video_exists_theo_duong_dan_that() {
    let d = tempfile::tempdir().unwrap();
    let v = d.path().join("clip.mp4");
    std::fs::write(&v, b"x").unwrap();

    assert!(status(d.path(), &meta(&v.display().to_string(), "vi", 1)).video_exists);
    assert!(!status(d.path(), &meta(r"E:\khong\co\clip.mp4", "vi", 1)).video_exists);
}

#[test]
fn list_bo_qua_thu_muc_khong_co_meta_va_meta_hong() {
    let root = tempfile::tempdir().unwrap();

    for (name, updated) in [("a", 300u64), ("b", 100), ("c", 200)] {
        let dir = root.path().join(name);
        save(&dir, &meta(&format!("{name}.mp4"), "vi", updated)).unwrap();
    }
    // thư mục do test E2E sinh ra: không bao giờ có project.json
    std::fs::create_dir_all(root.path().join("e2e-rac/audio")).unwrap();
    // meta hỏng
    let hong = root.path().join("hong");
    std::fs::create_dir_all(&hong).unwrap();
    std::fs::write(hong.join("project.json"), "{ vỡ").unwrap();

    let got = list(root.path());
    let names: Vec<String> = got
        .iter()
        .map(|s| s.project_dir.file_name().unwrap().to_string_lossy().to_string())
        .collect();
    assert_eq!(names, vec!["a", "c", "b"], "sắp xếp updated_at giảm dần: {names:?}");
}

#[test]
fn list_kem_status_cua_tung_du_an() {
    let root = tempfile::tempdir().unwrap();
    let dir = root.path().join("p1");
    save(&dir, &meta("v.mp4", "vi", 1)).unwrap();
    touch(&dir.join("subtitles/source.srt"));

    let got = list(root.path());
    assert_eq!(got.len(), 1);
    assert!(got[0].status.has_stt);
    assert!(!got[0].status.has_tts);
}

#[test]
fn list_tren_thu_muc_khong_ton_tai_tra_ve_rong() {
    let d = tempfile::tempdir().unwrap();
    assert!(list(&d.path().join("khong-co")).is_empty());
}

#[test]
fn list_bo_qua_file_le_o_cap_root() {
    let root = tempfile::tempdir().unwrap();
    std::fs::write(root.path().join("ghi-chu.txt"), b"x").unwrap();
    assert!(list(root.path()).is_empty());
}
