use app_lib::error::PipelineError;
use app_lib::ffmpeg::{classify_ffmpeg_failure, extract_audio};
use std::path::Path;

#[test]
fn missing_ffmpeg_returns_engine_missing() {
    let err = extract_audio(
        Path::new("no_such_ffmpeg.exe"),
        Path::new("in.mp4"),
        Path::new("out.wav"),
    )
    .unwrap_err();
    assert!(matches!(err, app_lib::error::PipelineError::EngineMissing(_)));
}

#[test]
fn classify_no_audio_stream() {
    let stderr = "Stream map '0:a:0' matches no streams.\nTo ignore this, add the -ignore_unknown option.";
    let err = classify_ffmpeg_failure(1, stderr);
    assert!(matches!(err, PipelineError::NoAudioStream));
}

#[test]
fn classify_other_failure_as_engine_failed() {
    let stderr = "Unknown encoder 'foo'";
    let err = classify_ffmpeg_failure(2, stderr);
    match err {
        PipelineError::EngineFailed { stage, code, stderr } => {
            assert_eq!(stage, "extract_audio");
            assert_eq!(code, 2);
            assert!(stderr.contains("Unknown encoder"));
        }
        _ => panic!("expected EngineFailed"),
    }
}
