use app_lib::tts::piper::{build_args, build_line, Piper};
use app_lib::tts::{TtsJob, TtsProvider};
use std::path::{Path, PathBuf};

fn job(index: usize, text: &str, length_scale: f32) -> TtsJob {
    TtsJob { index, text: text.into(), out: PathBuf::from(format!("out/cue-{index:04}.wav")), length_scale }
}

#[test]
fn args_point_at_model_and_enable_json_input() {
    let a = build_args(Path::new("C:/m/piper/vi.onnx"));
    assert_eq!(a[0], "-m");
    assert!(a[1].contains("vi.onnx"));
    assert!(a.contains(&"--json-input".to_string()), "phải bật --json-input: {a:?}");
}

#[test]
fn line_is_single_line_valid_json_with_output_file() {
    let l = build_line(&job(1, "Xin chào", 1.0));
    assert!(!l.contains('\n'), "dòng gửi stdin không được chứa xuống dòng");
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert_eq!(v["text"], "Xin chào");
    assert!(v["output_file"].as_str().unwrap().contains("cue-0001.wav"));
    assert!(v.get("length_scale").is_none(), "1.0 là mặc định ⇒ không cần gửi");
}

#[test]
fn line_collapses_newlines_and_escapes_quotes() {
    let l = build_line(&job(2, "dòng một\r\ndòng \"hai\"", 1.0));
    assert!(!l.contains('\n'));
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert_eq!(v["text"], "dòng một dòng \"hai\"", "xuống dòng thành dấu cách, dấu nháy được escape");
}

#[test]
fn line_carries_length_scale_when_not_default() {
    let l = build_line(&job(3, "nhanh lên", 0.85));
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert!((v["length_scale"].as_f64().unwrap() - 0.85).abs() < 1e-6);
}

#[test]
fn missing_exe_reports_engine_missing() {
    let p = Piper {
        exe: PathBuf::from("piper-khong-ton-tai.exe"),
        model: PathBuf::from("vi.onnx"),
        sample_rate: 22050,
    };
    let err = p.synthesize(&[job(1, "a", 1.0)], &mut |_| {}).unwrap_err();
    assert_eq!(err.code(), "engine_missing", "nhận: {err}");
}

#[test]
fn empty_job_list_does_not_spawn_anything() {
    let p = Piper {
        exe: PathBuf::from("piper-khong-ton-tai.exe"),
        model: PathBuf::from("vi.onnx"),
        sample_rate: 22050,
    };
    // Không có job ⇒ không được spawn ⇒ không lỗi dù exe không tồn tại.
    p.synthesize(&[], &mut |_| {}).unwrap();
    assert_eq!(p.id(), "piper");
    assert_eq!(p.sample_rate(), 22050);
}
