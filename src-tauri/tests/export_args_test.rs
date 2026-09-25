use app_lib::export::{parse_duration_ms, prepare_burn_srt};

#[test]
fn doc_thoi_luong_ffprobe() {
    assert_eq!(parse_duration_ms("12.345"), Some(12_345));
    assert_eq!(parse_duration_ms("  7.0\n"), Some(7_000));
    assert_eq!(parse_duration_ms("0.001"), Some(1));
}

#[test]
fn thoi_luong_khong_doc_duoc_tra_ve_none() {
    assert_eq!(parse_duration_ms("N/A"), None);
    assert_eq!(parse_duration_ms(""), None);
    assert_eq!(parse_duration_ms("-1"), None);
    assert_eq!(parse_duration_ms("0"), None);
    assert_eq!(parse_duration_ms("inf"), None);
}

use app_lib::export::{build_export_args, build_filter_complex, ExportOpts, BURN_SRT_NAME};
use std::path::Path;

fn opts(burn: bool, soft: bool, has_audio: bool) -> ExportOpts {
    ExportOpts {
        burn_subs: burn,
        soft_subs: soft,
        has_audio,
        volume_original: 0.18,
        volume_dub: 3.0,
        crf: 20,
        preset: "medium".into(),
    }
}

fn args_of(o: &ExportOpts, srt: Option<&Path>) -> Vec<String> {
    build_export_args(
        Path::new(r"E:\phim\clip.mp4"),
        Path::new(r"E:\du an\tts\dub.wav"),
        srt,
        Path::new(r"E:\du an\output\final.mp4"),
        o,
    )
    .into_iter()
    .map(|s| s.to_string_lossy().to_string())
    .collect()
}

fn filter_arg(a: &[String]) -> String {
    let i = a.iter().position(|s| s == "-filter_complex").expect("thiếu -filter_complex");
    a[i + 1].clone()
}

#[test]
fn amix_phai_tat_normalize() {
    // Mặc định amix normalize=1 chia lại biên độ theo số input và xoá sạch
    // tỉ lệ 0.18/3.0. Đây là bất biến quan trọng nhất của cả module.
    let f = build_filter_complex(&opts(false, false, true));
    assert!(f.contains("normalize=0"), "filtergraph: {f}");
    assert!(
        f.contains("duration=longest"),
        "phải ăn theo luồng dài hơn: dải tiếng dịch dài bằng container, tiếng \
         gốc có thể ngắn hơn (stream copy cắt, hoặc tiếng dừng trước hình) — \
         duration=first sẽ cắt cụt đuôi dải tiếng dịch: {f}"
    );
    assert!(
        f.contains("[0:a]volume=0.18[bg]"),
        "tiếng gốc phải gắn với volume 0.18: {f}"
    );
    assert!(
        f.contains("[1:a]volume=3[vo]"),
        "tiếng lồng phải gắn với volume 3.0: {f}"
    );
    assert!(
        f.contains("[mx]alimiter=limit=0.89:level=disabled[aout]"),
        "phải chặn đỉnh sau khi nhân 3.0, và tắt auto-level (mặc định true, tự khuếch đại ngược lại đúng limit vừa áp): {f}"
    );
}

#[test]
fn khong_co_tieng_goc_thi_khong_nhan_3_lan() {
    // Hệ số 3.0 chỉ có nghĩa khi đứng cạnh nền 0.18; đứng một mình nó chỉ làm vỡ tiếng.
    let f = build_filter_complex(&opts(false, false, false));
    assert!(!f.contains("[0:a]"), "video câm không có luồng audio để lấy: {f}");
    assert!(!f.contains("amix"), "một nguồn thì không trộn: {f}");
    assert!(f.contains("[1:a]volume=1[mx]"), "filtergraph: {f}");
    assert!(
        f.contains("[mx]alimiter=limit=0.89:level=disabled[aout]"),
        "filtergraph: {f}"
    );
}

#[test]
fn filtergraph_khong_bao_gio_chua_duong_dan_tuyet_doi() {
    // Chặn việc "sửa cho gọn" bằng cách nhét đường dẫn tuyệt đối vào filtergraph:
    // dấu hai chấm ổ đĩa kết thúc tham số filter, dấu gạch ngược bị nuốt.
    for (burn, audio) in [(true, true), (true, false), (false, true), (false, false)] {
        let a = args_of(&opts(burn, false, audio), None);
        let f = filter_arg(&a);
        assert!(!f.contains('\\'), "filtergraph có dấu gạch ngược: {f}");
        assert!(!f.contains(":\\"), "filtergraph có ổ đĩa: {f}");
        assert!(!f.contains("E:"), "filtergraph có đường dẫn tuyệt đối: {f}");
    }
}

#[test]
fn burn_dung_ten_tuong_doi_va_ma_hoa_lai_video() {
    let a = args_of(&opts(true, false, true), None);
    let f = filter_arg(&a);
    assert!(f.contains(&format!("subtitles={BURN_SRT_NAME}")), "filtergraph: {f}");
    assert!(f.contains("[0:v]"), "filtergraph: {f}");

    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "libx264"));
    assert!(a.windows(2).any(|w| w[0] == "-crf" && w[1] == "20"));
    assert!(a.windows(2).any(|w| w[0] == "-preset" && w[1] == "medium"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "[v]"));
    assert!(!a.iter().any(|s| s == "copy"), "burn thì không thể copy luồng video");
}

#[test]
fn khong_burn_thi_copy_luong_video() {
    let a = args_of(&opts(false, false, true), None);
    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "copy"));
    assert!(!a.iter().any(|s| s == "libx264"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "0:v:0"));
    assert!(!filter_arg(&a).contains("subtitles"));
}

#[test]
fn phu_de_mem_them_input_thu_ba_va_mov_text() {
    let srt = Path::new(r"E:\du an\subtitles\translated.vi.srt");
    let a = args_of(&opts(false, true, true), Some(srt));
    assert_eq!(a.iter().filter(|s| *s == "-i").count(), 3, "video + dub + srt");
    assert!(a.windows(2).any(|w| w[0] == "-c:s" && w[1] == "mov_text"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "2:0"));
    assert!(a.iter().any(|s| s == "language=vie"));
    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "copy"));
    // đường dẫn srt đi qua argv, không qua filtergraph
    assert!(a.iter().any(|s| s.contains("translated.vi.srt")));
    assert!(!filter_arg(&a).contains("translated"));
}

#[test]
fn burn_thi_bo_qua_phu_de_mem() {
    // mp4 vừa burn vừa kèm track phụ đề chỉ gây rối cho người xem
    let srt = Path::new(r"E:\du an\subtitles\translated.vi.srt");
    let a = args_of(&opts(true, true, true), Some(srt));
    assert_eq!(a.iter().filter(|s| *s == "-i").count(), 2, "không thêm input srt");
    assert!(!a.iter().any(|s| s == "mov_text"));
}

#[test]
fn luon_ket_bang_duong_dan_dau_ra_va_co_faststart() {
    let a = args_of(&opts(false, false, true), None);
    assert_eq!(a.last().unwrap(), r"E:\du an\output\final.mp4");
    assert!(a.windows(2).any(|w| w[0] == "-movflags" && w[1] == "+faststart"));
    assert!(a.windows(2).any(|w| w[0] == "-c:a" && w[1] == "aac"));
    assert!(a.contains(&"-y".to_string()), "phải ghi đè file cũ, không treo chờ trả lời");
}

#[test]
fn co_nostats_de_khong_tich_luy_tien_do_vao_stderr() {
    // Thiếu -nostats: ffmpeg in tiến độ ra stderr kết thúc bằng '\r' (không
    // phải '\n'), nên cả buổi encode là MỘT dòng — error.rs lấy "20 dòng cuối"
    // sẽ nuốt trọn cả blob đó thay vì lỗi thật.
    let a = args_of(&opts(false, false, true), None);
    assert!(a.iter().any(|s| s == "-nostats"), "thiếu -nostats: {a:?}");
}

#[test]
fn burn_srt_duoc_chep_sang_ten_ascii_canh_ban_dich() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let src = sub.join("translated.vi.srt");
    std::fs::write(&src, "1\r\n00:00:00,000 --> 00:00:01,000\r\nXin chào\r\n\r\n").unwrap();

    let burn = prepare_burn_srt(&sub, &src).unwrap();

    assert_eq!(burn.file_name().unwrap(), "burn.srt");
    assert_eq!(burn.parent().unwrap(), sub);
    assert_eq!(std::fs::read_to_string(&burn).unwrap(), std::fs::read_to_string(&src).unwrap());
}

#[test]
fn burn_srt_ghi_de_ban_cu() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("burn.srt"), "rác cũ").unwrap();
    let src = sub.join("translated.vi.srt");
    std::fs::write(&src, "mới").unwrap();

    let burn = prepare_burn_srt(&sub, &src).unwrap();
    assert_eq!(std::fs::read_to_string(&burn).unwrap(), "mới");
}

#[test]
fn thieu_ban_dich_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let e = prepare_burn_srt(&sub, &sub.join("khong-co.srt")).unwrap_err();
    assert!(e.to_string().contains("Dịch"), "thông báo phải chỉ ra bước còn thiếu: {e}");
}

#[test]
fn thieu_ffmpeg_tra_ve_engine_missing() {
    let d = tempfile::tempdir().unwrap();
    let e = app_lib::export::run_export(
        Path::new("khong_co_ffmpeg.exe"),
        d.path(),
        &[std::ffi::OsString::from("-version")],
    )
    .unwrap_err();
    assert!(matches!(e, app_lib::error::PipelineError::EngineMissing(_)));
}
