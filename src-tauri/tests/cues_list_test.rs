use app_lib::cues::{list, srt_path};
use app_lib::tts::manifest::{save as save_manifest, Manifest, SegmentEntry};
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

fn entry(index: usize, start_ms: u64, text: &str, audio: Option<&str>, dur: u64) -> SegmentEntry {
    SegmentEntry {
        index,
        start_ms,
        end_ms: start_ms + 500,
        text: text.to_string(),
        audio_path: audio.map(|s| s.to_string()),
        cache_key: audio.map(|_| "k".to_string()),
        length_scale: 1.0,
        duration_ms: dur,
    }
}

fn write_manifest(project_dir: &Path, segments: Vec<SegmentEntry>) {
    let m = Manifest {
        version: 1,
        provider: "fake".into(),
        voice: "v".into(),
        sample_rate: 22050,
        segments,
    };
    save_manifest(&project_dir.join("tts").join("manifest.json"), &m).unwrap();
}

/// Tạo file wav giả ở đường dẫn tương đối trong tts/.
fn touch_wav(project_dir: &Path, rel: &str) {
    let p = project_dir.join("tts").join(rel);
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, b"x").unwrap();
}

#[test]
fn ghep_srt_voi_manifest_lay_do_dai_va_duong_dan() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Xin chào", 0, 1000), ("Tạm biệt", 2000, 3000)]);
    write_manifest(
        d.path(),
        vec![
            entry(1, 0, "Xin chào", Some("segments/cue-0001.wav"), 900),
            entry(2, 2000, "Tạm biệt", Some("segments/cue-0002.wav"), 800),
        ],
    );
    touch_wav(d.path(), "segments/cue-0001.wav");
    touch_wav(d.path(), "segments/cue-0002.wav");

    let got = list(d.path(), "vi").unwrap();
    assert_eq!(got.len(), 2);
    assert_eq!(got[0].index, 1);
    assert_eq!(got[0].duration_ms, 900);
    assert_eq!(got[1].duration_ms, 800);
    assert!(got[0].audio_path.as_ref().unwrap().ends_with("cue-0001.wav"));
    assert!(!got[0].stale && !got[1].stale, "khớp cả text lẫn start_ms thì không lệch");
}

#[test]
fn chua_co_manifest_thi_moi_cue_deu_lech() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);

    let got = list(d.path(), "vi").unwrap();
    assert_eq!(got.len(), 2, "dự án mới dịch xong vẫn phải xem và sửa được");
    assert!(got.iter().all(|c| c.stale));
    assert!(got.iter().all(|c| c.duration_ms == 0 && c.audio_path.is_none()));
}

#[test]
fn lech_khi_text_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Câu đã sửa", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu cũ", Some("segments/cue-0001.wav"), 900)]);
    touch_wav(d.path(), "segments/cue-0001.wav");

    assert!(list(d.path(), "vi").unwrap()[0].stale);
}

#[test]
fn lech_khi_start_ms_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Cùng một câu", 500, 1500)]);
    write_manifest(d.path(), vec![entry(1, 0, "Cùng một câu", Some("segments/cue-0001.wav"), 900)]);
    touch_wav(d.path(), "segments/cue-0001.wav");

    assert!(
        list(d.path(), "vi").unwrap()[0].stale,
        "guard của run_retime_stage cũng so start_ms, nên dấu hiệu trên màn hình phải so y hệt"
    );
}

#[test]
fn khong_lech_khi_chi_end_ms_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Cùng một câu", 0, 9999)]);
    write_manifest(d.path(), vec![entry(1, 0, "Cùng một câu", Some("segments/cue-0001.wav"), 900)]);
    touch_wav(d.path(), "segments/cue-0001.wav");

    assert!(
        !list(d.path(), "vi").unwrap()[0].stale,
        "guard không so end_ms nên ở đây cũng không được so — hai bên phải nói cùng một điều"
    );
}

#[test]
fn srt_dai_hon_manifest_thi_cue_thua_la_lech() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000), ("Ba", 4000, 5000)]);
    write_manifest(
        d.path(),
        vec![entry(1, 0, "Một", Some("segments/cue-0001.wav"), 900)],
    );
    touch_wav(d.path(), "segments/cue-0001.wav");

    let got = list(d.path(), "vi").unwrap();
    assert!(!got[0].stale);
    assert!(got[1].stale && got[2].stale);
}

#[test]
fn manifest_ghi_wav_nhung_file_bi_xoa_thi_audio_path_la_none() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Một", Some("segments/cue-0001.wav"), 900)]);
    // cố ý KHÔNG tạo file wav

    let got = list(d.path(), "vi").unwrap();
    assert!(
        got[0].audio_path.is_none(),
        "trả đường dẫn không tồn tại sẽ làm nút Nghe thử phát vào hư không"
    );
}

#[test]
fn thieu_ban_dich_bao_loi_neu_dung_buoc_con_thieu() {
    let d = tempfile::tempdir().unwrap();
    let e = list(d.path(), "vi").unwrap_err();
    assert!(e.to_string().contains("Dịch"), "{e}");
}

#[test]
fn so_theo_vi_tri_khong_phai_theo_index_field_trong_manifest() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);
    // Manifest có 2 entry ở position 0 và 1, nhưng index field bị sai (7 và 9)
    // Text và start_ms khớp với SRT, nên nếu so theo position sẽ không lệch
    write_manifest(
        d.path(),
        vec![
            entry(7, 0, "Một", Some("segments/cue-0001.wav"), 900),
            entry(9, 2000, "Hai", Some("segments/cue-0002.wav"), 800),
        ],
    );
    touch_wav(d.path(), "segments/cue-0001.wav");
    touch_wav(d.path(), "segments/cue-0002.wav");

    let got = list(d.path(), "vi").unwrap();
    assert!(
        !got[0].stale && !got[1].stale,
        "so theo vi tri giong run_retime_stage guard, khong so theo index field trong manifest"
    );
}
