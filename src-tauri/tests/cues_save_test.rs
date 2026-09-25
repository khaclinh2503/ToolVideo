use app_lib::cues::{save, srt_path};
use std::path::Path;

fn write_srt(project_dir: &Path, tgt: &str, cues: &[(&str, u64, u64)]) {
    let segs: Vec<app_lib::srt::Segment> = cues
        .iter()
        .map(|(t, a, b)| app_lib::srt::Segment { start_ms: *a, end_ms: *b, text: t.to_string() })
        .collect();
    let p = srt_path(project_dir, tgt);
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, app_lib::srt::write_srt(&segs)).unwrap();
}

fn read_cues(project_dir: &Path, tgt: &str) -> Vec<app_lib::srt::Segment> {
    let raw = std::fs::read_to_string(srt_path(project_dir, tgt)).unwrap();
    app_lib::srt::parse_srt(&raw).unwrap()
}

#[test]
fn sua_cue_giua_danh_sach_khong_dung_toi_cue_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000), ("Ba", 4000, 5000)]);

    save(d.path(), "vi", 2, "Hai đã sửa", 2100, 3200).unwrap();

    let got = read_cues(d.path(), "vi");
    assert_eq!(got.len(), 3);
    assert_eq!((got[0].text.as_str(), got[0].start_ms, got[0].end_ms), ("Một", 0, 1000));
    assert_eq!((got[1].text.as_str(), got[1].start_ms, got[1].end_ms), ("Hai đã sửa", 2100, 3200));
    assert_eq!((got[2].text.as_str(), got[2].start_ms, got[2].end_ms), ("Ba", 4000, 5000));
}

#[test]
fn text_nhieu_dong_di_vong_qua_duoc() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);

    save(d.path(), "vi", 1, "Dòng một\nDòng hai", 0, 1000).unwrap();

    assert_eq!(read_cues(d.path(), "vi")[0].text, "Dòng một\nDòng hai");
}

#[test]
fn start_bang_hoac_lon_hon_end_bi_tu_choi_va_file_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    let truoc = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();

    for (a, b) in [(1000u64, 1000u64), (2000, 1000)] {
        let e = save(d.path(), "vi", 1, "X", a, b).unwrap_err();
        assert!(e.to_string().contains("nhỏ hơn"), "{e}");
    }

    let sau = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();
    assert_eq!(truoc, sau, "lời gọi bị từ chối KHÔNG được đụng vào file");
}

#[test]
fn index_ngoai_pham_vi_bi_tu_choi_va_file_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);
    let truoc = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();

    for i in [0usize, 3, 99] {
        let e = save(d.path(), "vi", i, "X", 0, 500).unwrap_err();
        assert!(e.to_string().contains("cue"), "{e}");
    }

    let sau = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();
    assert_eq!(truoc, sau, "lời gọi bị từ chối KHÔNG được đụng vào file");
}

#[test]
fn cho_phep_chong_lan_voi_cue_ke() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);

    // cue 1 kéo dài đè lên cue 2 — hợp lệ, retime và compose đã có đường xử lý
    save(d.path(), "vi", 1, "Một dài", 0, 2500).unwrap();
    assert_eq!(read_cues(d.path(), "vi")[0].end_ms, 2500);
}

#[test]
fn khong_sot_file_tmp() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    save(d.path(), "vi", 1, "Một sửa", 0, 1000).unwrap();

    let con: Vec<String> = std::fs::read_dir(d.path().join("subtitles"))
        .unwrap()
        .flatten()
        .map(|e| e.file_name().to_string_lossy().to_string())
        .collect();
    assert_eq!(con, vec!["translated.vi.srt".to_string()], "còn sót file tạm: {con:?}");
}

#[test]
fn thieu_ban_dich_bao_loi_neu_dung_buoc_con_thieu() {
    let d = tempfile::tempdir().unwrap();
    let e = save(d.path(), "vi", 1, "X", 0, 500).unwrap_err();
    assert!(e.to_string().contains("Dịch"), "{e}");
}

#[test]
fn dung_cho_text_co_dong_trong_va_file_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    let truoc = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();

    // Test with \n\n (Unix newlines)
    for text in ["A\n\nB", "Dòng một\n\nDòng hai"] {
        let e = save(d.path(), "vi", 1, text, 0, 1000).unwrap_err();
        assert!(e.to_string().contains("trống"), "{e}");
    }

    // Test with \r\n\r\n (Windows newlines)
    let e = save(d.path(), "vi", 1, "A\r\n\r\nB", 0, 1000).unwrap_err();
    assert!(e.to_string().contains("trống"), "{e}");

    let sau = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();
    assert_eq!(truoc, sau, "lời gọi bị từ chối KHÔNG được đụng vào file");
}
