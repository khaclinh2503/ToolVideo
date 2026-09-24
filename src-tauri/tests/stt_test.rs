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

// Real format of sherpa-onnx-vad-with-offline-asr (stdout): "START -- END: TEXT"
#[test]
fn parses_empty_and_cjk() {
    assert_eq!(parse_output("").unwrap().len(), 0);
    let segs = parse_output("0.000 -- 1.500: 你好").unwrap();
    assert_eq!(segs[0].end_ms, 1500);
    assert_eq!(segs[0].text, "你好");
}

#[test]
fn parses_fixture_file() {
    // fixture = verbatim stdout of a real 15s run (sherpa-onnx v1.13.8, SenseVoice int8)
    let text = std::fs::read_to_string("tests/fixtures/sherpa_sample_output.txt").unwrap();
    let segs = parse_output(&text).unwrap();
    assert_eq!(segs.len(), 3);
    assert_eq!(segs[0].start_ms, 0);
    assert_eq!(segs[0].end_ms, 5212);
    assert_eq!(segs[0].text, "市场规模除了去年负增长之外，每年都在稳步增加。");
    assert_eq!(segs[2].start_ms, 11036);
    assert_eq!(segs[2].end_ms, 14976);
}

#[test]
fn parses_text_containing_colons_and_extra_spaces() {
    // only the FIRST ':' after " -- " is the separator; colons inside text are kept
    let segs = parse_output("  0.500 --  2.250:  时间: 12:30 到了  ").unwrap();
    assert_eq!(segs.len(), 1);
    assert_eq!(segs[0].start_ms, 500);
    assert_eq!(segs[0].end_ms, 2250);
    assert_eq!(segs[0].text, "时间: 12:30 到了");
}

#[test]
fn parse_output_rounds_ms() {
    let segs = parse_output("1.0005 -- 2.0: x").unwrap();
    assert_eq!(segs[0].start_ms, 1001);
    assert_eq!(segs[0].end_ms, 2000);
}

#[test]
fn parse_output_skips_log_lines_but_keeps_segments() {
    // a stray non-segment line mixed in must be skipped, not turn the run into an error
    let segs = parse_output("Started!\n0.000 -- 1.000: a\nElapsed seconds: 0.6 s\n").unwrap();
    assert_eq!(segs.len(), 1);
    assert_eq!(segs[0].text, "a");
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
