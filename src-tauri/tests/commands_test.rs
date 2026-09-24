use app_lib::commands::SttResultDto;

#[test]
fn dto_from_result() {
    let dto = SttResultDto {
        srt_path: "a/source.srt".into(),
        cue_count: 3,
    };
    let js = serde_json::to_string(&dto).unwrap();
    assert!(js.contains("\"cueCount\":3"));
}
