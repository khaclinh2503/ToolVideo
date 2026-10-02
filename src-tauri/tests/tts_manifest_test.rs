use app_lib::tts::manifest::{load, save, Manifest, SegmentEntry};

fn sample() -> Manifest {
    Manifest {
        version: 1,
        provider: "piper".into(),
        voice: "vi_VN-vais1000-medium".into(),
        sample_rate: 22050,
        segments: vec![
            SegmentEntry {
                index: 1,
                start_ms: 0,
                end_ms: 5212,
                text: "Xin chào \"thế giới\"\nhai dòng".into(),
                audio_path: Some("segments/cue-0001.wav".into()),
                cache_key: Some("abc123".into()),
                length_scale: 1.0,
                duration_ms: 1840,
                voice: None,
            },
            SegmentEntry {
                index: 2,
                start_ms: 5212,
                end_ms: 6000,
                text: "   ".into(),
                audio_path: None,
                cache_key: None,
                length_scale: 1.0,
                duration_ms: 0,
                voice: None,
            },
        ],
    }
}

#[test]
fn save_then_load_roundtrips() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("manifest.json");
    save(&p, &sample()).unwrap();

    let m = load(&p).expect("đọc lại được");
    assert_eq!(m.version, 1);
    assert_eq!(m.sample_rate, 22050);
    assert_eq!(m.segments.len(), 2);
    assert_eq!(m.segments[0].text, "Xin chào \"thế giới\"\nhai dòng");
    assert_eq!(m.segments[0].audio_path.as_deref(), Some("segments/cue-0001.wav"));
    assert_eq!(m.segments[1].audio_path, None);
    assert_eq!(m.segments[1].cache_key, None);
    assert_eq!(m.segments[1].duration_ms, 0);
}

#[test]
fn save_leaves_no_tmp_file_behind() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("manifest.json");
    save(&p, &sample()).unwrap();
    let leftovers: Vec<_> = std::fs::read_dir(dir.path())
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.file_name().to_string_lossy().to_string())
        .filter(|n| n.ends_with(".tmp"))
        .collect();
    assert!(leftovers.is_empty(), "còn file tạm: {leftovers:?}");
}

#[test]
fn load_returns_none_for_missing_or_corrupt() {
    let dir = tempfile::tempdir().unwrap();
    assert!(load(&dir.path().join("khong-co.json")).is_none());

    let bad = dir.path().join("bad.json");
    std::fs::write(&bad, b"{ khong phai json").unwrap();
    assert!(load(&bad).is_none(), "manifest hỏng ⇒ coi như chưa có cache");
}

#[test]
fn json_uses_snake_case_field_names() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("manifest.json");
    save(&p, &sample()).unwrap();
    let text = std::fs::read_to_string(&p).unwrap();
    for key in ["\"audio_path\"", "\"cache_key\"", "\"duration_ms\"", "\"sample_rate\"", "\"length_scale\""] {
        assert!(text.contains(key), "thiếu khoá {key} trong:\n{text}");
    }
}
