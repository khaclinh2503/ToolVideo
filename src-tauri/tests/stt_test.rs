use app_lib::error::PipelineError;
use app_lib::stt::{build_args, parse_output, run_stt, SttModels};
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
    assert!(a.contains("--silero-vad-min-silence-duration=0.20"));
    assert!(a.contains("--silero-vad-min-speech-duration=0.10"));
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

#[test]
fn parses_double_space_separated_line() {
    let segs = parse_output("0.000  1.500  你好").unwrap();
    assert_eq!(segs.len(), 1);
    assert_eq!(segs[0].start_ms, 0);
    assert_eq!(segs[0].end_ms, 1500);
    assert_eq!(segs[0].text, "你好");
}

#[test]
fn parse_output_rounds_ms() {
    let segs = parse_output("1.0005 2.0 x").unwrap();
    assert_eq!(segs[0].start_ms, 1001);
    assert_eq!(segs[0].end_ms, 2000);
}

#[test]
fn parse_output_garbage_only_is_err() {
    let err = parse_output("hello world").unwrap_err();
    match err {
        PipelineError::EngineFailed { stage, .. } => assert_eq!(stage, "stt_parse"),
        _ => panic!("expected EngineFailed"),
    }
}

#[test]
fn parse_output_empty_is_ok_empty() {
    let segs = parse_output("").unwrap();
    assert!(segs.is_empty());
}

#[test]
fn run_stt_missing_binary_returns_engine_missing() {
    let m = SttModels {
        sense_voice: PathBuf::from("s.onnx"),
        tokens: PathBuf::from("t.txt"),
        vad: PathBuf::from("v.onnx"),
    };
    let err = run_stt(
        Path::new("no_such_sherpa_binary.exe"),
        &m,
        Path::new("in.wav"),
        "zh",
    )
    .unwrap_err();
    assert!(matches!(err, PipelineError::EngineMissing(_)));
}

#[test]
fn build_args_preserves_cjk_and_spaces_in_paths() {
    let m = SttModels {
        sense_voice: PathBuf::from(r"C:\测试 dir\sense.onnx"),
        tokens: PathBuf::from("t.txt"),
        vad: PathBuf::from("v.onnx"),
    };
    let a = build_args(&m, Path::new("in.wav"), "zh").join(" ");
    assert!(a.contains(r"C:\测试 dir\sense.onnx"));
}
