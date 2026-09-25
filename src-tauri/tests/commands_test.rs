use app_lib::commands::SttResultDto;

#[test]
fn dto_from_result() {
    let dto = SttResultDto {
        srt_path: "a/source.srt".into(),
        cue_count: 3,
        project_dir: "a".into(),
    };
    let js = serde_json::to_string(&dto).unwrap();
    assert!(js.contains("\"cueCount\":3"));
}

#[test]
fn dtos_are_camel_case_and_stt_has_project_dir() {
    let s = app_lib::commands::SttResultDto { srt_path: "a".into(), cue_count: 1, project_dir: "p".into() };
    let js = serde_json::to_string(&s).unwrap();
    assert!(js.contains("\"projectDir\":\"p\"") && js.contains("\"cueCount\":1"));
    let t = app_lib::commands::TranslateResultDto { srt_path: "b".into(), cue_count: 2 };
    assert!(serde_json::to_string(&t).unwrap().contains("\"cueCount\":2"));
}

#[test]
fn component_progress_event_is_camel_case_with_expected_phases() {
    let ev = app_lib::commands::ComponentProgressEvent {
        id: "ffmpeg".into(),
        phase: "download",
        done: 1,
        total: 2,
    };
    let js = serde_json::to_string(&ev).unwrap();
    assert!(js.contains("\"id\":\"ffmpeg\""));
    assert!(js.contains("\"phase\":\"download\""));
    assert!(js.contains("\"done\":1"));
    assert!(js.contains("\"total\":2"));

    // App.tsx branches on these three literal phase strings.
    for phase in ["download", "extract", "done"] {
        let ev = app_lib::commands::ComponentProgressEvent {
            id: "x".into(),
            phase,
            done: 0,
            total: 0,
        };
        let js = serde_json::to_string(&ev).unwrap();
        assert!(js.contains(&format!("\"phase\":\"{phase}\"")));
    }
}

#[test]
fn components_missing_report_lists_ids_not_yet_installed() {
    let dir = tempfile::tempdir().unwrap();
    let missing = app_lib::commands::missing_component_ids(dir.path()).unwrap();
    assert_eq!(missing.len(), 8, "thư mục trống ⇒ cả 8 component đều thiếu");
    assert!(missing.contains(&"piper".to_string()));
}

#[test]
fn export_dto_serialize_ra_camel_case() {
    let dto = app_lib::commands::ExportResultDto {
        output_path: r"E:\du an\output\final.mp4".into(),
        adjusted: 3,
        capped: 1,
        placed: 42,
        truncated: 0,
        saturated: 0,
    };
    let j = serde_json::to_string(&dto).unwrap();
    assert!(j.contains("\"outputPath\""), "UI đọc camelCase: {j}");
    assert!(!j.contains("output_path"), "{j}");
}

#[test]
fn export_progress_event_giu_nguyen_4_ten_phase() {
    // App.tsx branches on these four literal phase strings verbatim.
    for phase in ["retime", "dub", "encode", "done"] {
        let ev = app_lib::commands::ExportProgressEvent { phase: phase.into() };
        let j = serde_json::to_string(&ev).unwrap();
        assert_eq!(j, format!("{{\"phase\":\"{phase}\"}}"), "{j}");
    }
}
