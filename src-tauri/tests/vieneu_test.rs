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
        ffmpeg: PathBuf::from("khong-dung-toi/ffmpeg.exe"),
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

// ---------- ép tốc độ bằng ffmpeg atempo ----------

#[test]
fn doi_chieu_he_so_dung_cach() {
    use app_lib::tts::vieneu::atempo_tu_length_scale;
    // `length_scale` 0.6 nghĩa là "đọc NHANH hơn" theo quy ước Piper/ScalePlan.
    // `atempo` là hệ số TỐC ĐỘ nên phải LỚN HƠN 1. Đảo chiều thì giọng chậm
    // lại, cue tràn nặng hơn, và không có gì báo lỗi — test này là lưới duy nhất.
    let a = atempo_tu_length_scale(0.6).unwrap();
    assert!(a > 1.0, "đảo chiều rồi: length_scale 0.6 phải cho atempo > 1, nhận {a}");
    assert!((a - 1.0 / 0.6).abs() < 1e-6, "nhận {a}");
}

#[test]
fn he_so_1_thi_atempo_cung_1() {
    use app_lib::tts::vieneu::atempo_tu_length_scale;
    assert!((atempo_tu_length_scale(1.0).unwrap() - 1.0).abs() < 1e-6);
}

#[test]
fn he_so_ngoai_dai_bi_chan_ro_rang() {
    use app_lib::tts::vieneu::atempo_tu_length_scale;
    // atempo một tầng chỉ nhận [0.5, 2.0]. length_scale 0.4 ⇒ atempo 2.5.
    let err = atempo_tu_length_scale(0.4).unwrap_err();
    assert!(err.to_string().contains("vượt dải"), "nhận: {err}");
    // Giá trị vô nghĩa phải bị chặn chứ không cho ra inf rồi đẩy sang ffmpeg.
    assert!(atempo_tu_length_scale(0.0).is_err());
    assert!(atempo_tu_length_scale(-1.0).is_err());
    assert!(atempo_tu_length_scale(f32::NAN).is_err());
}

#[test]
fn tham_so_ffmpeg_mang_dung_he_so_va_giu_dinh_dang() {
    use app_lib::tts::vieneu::{atempo_tu_length_scale, build_atempo_args};
    use std::path::Path;
    let a = atempo_tu_length_scale(0.8).unwrap();
    let args = build_atempo_args(Path::new("vao.wav"), Path::new("ra.wav"), a);

    let i = args.iter().position(|s| s == "-filter:a").expect("phải có -filter:a");
    assert_eq!(args[i + 1], format!("atempo={:.6}", 1.0 / 0.8), "{args:?}");

    // compose.rs so tần số từng wav với header manifest rồi TỪ CHỐI nếu lệch,
    // nên đầu ra phải giữ nguyên định dạng PCM 16-bit.
    let c = args.iter().position(|s| s == "-c:a").expect("phải ép codec");
    assert_eq!(args[c + 1], "pcm_s16le", "{args:?}");

    assert!(args.contains(&"-y".to_string()), "phải ghi đè tệp tạm: {args:?}");

    // Đầu ra là tệp tạm đuôi `.wav.tmp`; ffmpeg không suy ra định dạng từ đuôi
    // đó nên phải chỉ định rõ. Thiếu dòng này thì ffmpeg bỏ ngang — đã gặp thật
    // khi chạy E2E lần đầu.
    let f = args.iter().position(|s| s == "-f").expect("phải chỉ định -f: {args:?}");
    assert_eq!(args[f + 1], "wav", "{args:?}");
    assert_eq!(args.last().unwrap(), "ra.wav", "đầu ra phải ở cuối: {args:?}");
    let vi_tri_vao = args.iter().position(|s| s == "vao.wav").unwrap();
    assert!(vi_tri_vao < args.len() - 1, "đầu vào phải trước đầu ra: {args:?}");
}
