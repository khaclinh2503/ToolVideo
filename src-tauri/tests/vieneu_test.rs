use app_lib::tts::vieneu::{build_line, group_by_speed, VieNeu};
use app_lib::tts::{TtsJob, TtsProvider};
use std::path::PathBuf;

fn job(index: usize, text: &str, length_scale: f32) -> TtsJob {
    TtsJob { index, text: text.into(), out: PathBuf::from(format!("out/cue-{index:04}.wav")), length_scale }
}

/// `VieNeu` với `python` không tồn tại — đủ cho các test không thật sự cần
/// spawn tiến trình (missing engine / no-op khi rỗng job).
fn provider_voi_python(python: &str) -> VieNeu {
    VieNeu {
        python: PathBuf::from(python),
        bridge: PathBuf::from("khong-dung-toi.py"),
        site_packages: PathBuf::from("khong-dung-toi/site-packages"),
        hf_home: PathBuf::from("target/tmp-vieneu-test/hf_home"),
        voice: "Mai Anh".into(),
        models_dir: PathBuf::from("khong-dung-toi/vieneu"),
    }
}

#[test]
fn dong_json_gop_xuong_dong_va_mang_ten_giong() {
    let l = build_line(&job(1, "dòng một\r\ndòng \"hai\"", 1.0), "Mai Anh");
    assert!(!l.contains('\n'), "dòng gửi stdin không được chứa xuống dòng");
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert_eq!(v["text"], "dòng một dòng \"hai\"");
    assert_eq!(v["voice"], "Mai Anh");
}

#[test]
fn dong_json_khong_co_khoa_length_scale() {
    // VieNeu-TTS không có tham số ép tốc độ — cầu nối (Task 3) đã xác nhận
    // rỗng bằng grep. `build_line` không được lặng lẽ thêm lại khoá này.
    let l = build_line(&job(2, "nhanh lên", 0.6), "Hải Đăng");
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert!(v.get("length_scale").is_none(), "không được có length_scale: {l}");
    assert!(v.get("speed").is_none(), "không được có speed: {l}");
}

#[test]
fn thieu_python_bao_engine_missing() {
    let p = provider_voi_python("khong-ton-tai.exe");
    let err = p.synthesize(&[job(1, "a", 1.0)], &mut |_| {}).unwrap_err();
    assert_eq!(err.code(), "engine_missing", "nhận: {err}");
}

#[test]
fn khong_co_job_thi_khong_spawn() {
    // exe không tồn tại mà vẫn Ok ⇒ chứng minh là không spawn.
    let p = provider_voi_python("khong-ton-tai.exe");
    p.synthesize(&[], &mut |_| {}).unwrap();
}

#[test]
fn sample_rate_la_48000() {
    assert_eq!(provider_voi_python("khong-ton-tai.exe").sample_rate(), 48000);
}

#[test]
fn id_la_vieneu() {
    assert_eq!(provider_voi_python("khong-ton-tai.exe").id(), "vieneu");
}

#[test]
fn group_by_speed_gom_dung_nhom_giu_dung_index_goc() {
    let jobs = vec![
        job(1, "a", 1.0),
        job(2, "b", 0.6),
        job(3, "c", 1.0),
        job(4, "d", 0.6),
    ];
    let groups = group_by_speed(&jobs);
    assert_eq!(groups.len(), 2, "phải gom còn đúng 2 nhóm: {groups:?}");

    let (scale0, jobs0) = &groups[0];
    assert!((scale0 - 0.6).abs() < 1e-6);
    assert_eq!(jobs0.iter().map(|j| j.index).collect::<Vec<_>>(), vec![2, 4]);

    let (scale1, jobs1) = &groups[1];
    assert!((scale1 - 1.0).abs() < 1e-6);
    assert_eq!(jobs1.iter().map(|j| j.index).collect::<Vec<_>>(), vec![1, 3]);
}
