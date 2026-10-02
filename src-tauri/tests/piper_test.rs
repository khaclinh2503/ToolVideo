use app_lib::tts::piper::{build_args, build_line, group_by_scale, Piper};
use app_lib::tts::{TtsJob, TtsProvider};
use std::path::{Path, PathBuf};

fn job(index: usize, text: &str, length_scale: f32) -> TtsJob {
    TtsJob { index, text: text.into(), out: PathBuf::from(format!("out/cue-{index:04}.wav")), length_scale, voice: None }
}

#[test]
fn args_point_at_model_and_enable_json_input() {
    let a = build_args(Path::new("C:/m/piper/vi.onnx"), 0.85);
    assert_eq!(a[0], "-m");
    assert!(a[1].contains("vi.onnx"));
    assert!(a.contains(&"--json-input".to_string()), "phải bật --json-input: {a:?}");
    let pos = a
        .iter()
        .position(|s| s == "--length_scale")
        .unwrap_or_else(|| panic!("phải có cờ --length_scale: {a:?}"));
    assert_eq!(a[pos + 1], "0.850", "giá trị length_scale phải định dạng {{:.3}}: {a:?}");
}

#[test]
fn args_carry_length_scale_even_at_default_1_0() {
    // Tham số hiện rõ trong lệnh thì lần sau còn đọc được, và 1.0 đúng bằng
    // mặc định của Piper nên vô hại — không được bỏ qua khi bằng 1.0.
    let a = build_args(Path::new("C:/m/piper/vi.onnx"), 1.0);
    let pos = a
        .iter()
        .position(|s| s == "--length_scale")
        .unwrap_or_else(|| panic!("phải có cờ --length_scale kể cả khi = 1.0: {a:?}"));
    assert_eq!(a[pos + 1], "1.000");
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
fn line_never_carries_length_scale_speed_goes_via_process_flag() {
    // Bản Piper đo được (2026-09-25) bỏ qua im lặng khoá JSON `length_scale`
    // trong `--json-input` — chỉ cờ dòng lệnh `--length_scale` có tác dụng.
    // Ngay cả một job có tốc độ khác mặc định (0.85) cũng không được để lọt
    // khoá này vào JSON, kẻo lại là một lời nói dối câm lặng như trước.
    let l = build_line(&job(3, "nhanh lên", 0.85));
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert!(
        v.get("length_scale").is_none(),
        "length_scale không được nằm trong JSON, tốc độ đi qua cờ tiến trình: {l}"
    );
}

#[test]
fn group_by_scale_gom_dung_nhom_giu_dung_index_goc() {
    let jobs = vec![
        job(1, "a", 1.0),
        job(2, "b", 0.6),
        job(3, "c", 1.0),
        job(4, "d", 0.6),
    ];
    let groups = group_by_scale(&jobs);
    assert_eq!(groups.len(), 2, "phải gom còn đúng 2 nhóm: {groups:?}");

    // Duyệt theo thứ tự khoá "{:.3}" đã sắp xếp: "0.600" trước "1.000".
    let (scale0, jobs0) = &groups[0];
    assert!((scale0 - 0.6).abs() < 1e-6);
    assert_eq!(jobs0.iter().map(|j| j.index).collect::<Vec<_>>(), vec![2, 4]);

    let (scale1, jobs1) = &groups[1];
    assert!((scale1 - 1.0).abs() < 1e-6);
    assert_eq!(jobs1.iter().map(|j| j.index).collect::<Vec<_>>(), vec![1, 3]);
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
