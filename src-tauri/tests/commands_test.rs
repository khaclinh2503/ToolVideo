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
