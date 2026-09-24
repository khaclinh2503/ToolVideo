use app_lib::ffmpeg::extract_audio;
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
