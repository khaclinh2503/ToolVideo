use app_lib::stt::{build_args, parse_output, SttModels};
use std::path::{Path, PathBuf};

#[test]
fn build_args_uses_spec_defaults() {
    let m = SttModels {
        sense_voice: PathBuf::from("s.onnx"),
        tokens: PathBuf::from("t.txt"),
        vad: PathBuf::from("v.onnx"),
    };
    let a = build_args(&m, Path::new("in.wav"), "zh").join(" ");
    assert!(a.contains("--silero-vad-threshold=0.25"));
    assert!(a.contains("--sense-voice-language=zh"));
    assert!(a.contains("--sense-voice-use-itn=1"));
    assert!(a.contains("--num-threads=4"));
    assert!(a.ends_with("in.wav"));
}

#[test]
fn parses_empty_and_cjk() {
    assert_eq!(parse_output("").unwrap().len(), 0);
    let segs = parse_output("0.000 1.500 你好").unwrap();
    assert_eq!(segs[0].end_ms, 1500);
    assert_eq!(segs[0].text, "你好");
}

#[test]
fn parses_fixture_file() {
    let text = std::fs::read_to_string("tests/fixtures/sherpa_sample_output.txt").unwrap();
    let segs = parse_output(&text).unwrap();
    assert_eq!(segs.len(), 3);
    assert_eq!(segs[0].start_ms, 0);
    assert_eq!(segs[0].end_ms, 1500);
    assert_eq!(segs[0].text, "你好，欢迎使用");
}
