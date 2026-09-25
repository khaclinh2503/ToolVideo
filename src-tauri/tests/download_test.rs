use app_lib::download::{build_args, parse_percent, run_download, PATH_SINK};
use std::path::{Path, PathBuf};

fn args(url: &str) -> Vec<String> {
    build_args(url, Path::new("C:/dl"), Path::new("C:/m/ffmpeg"))
}

#[test]
fn args_chan_tai_ca_playlist() {
    // Link một video nằm trong playlist là chuyện rất thường. Thiếu cờ này thì
    // dán một link như vậy sẽ tải về cả trăm video.
    assert!(args("https://x/watch?v=a&list=b").contains(&"--no-playlist".to_string()));
}

#[test]
fn args_bao_yt_dlp_dung_ffmpeg_cua_app() {
    let a = args("https://x/y");
    let i = a.iter().position(|s| s == "--ffmpeg-location").expect("phải có cờ");
    assert_eq!(a[i + 1], "C:/m/ffmpeg", "phải trỏ vào ffmpeg app tự tải, không phải PATH hệ thống");
}

#[test]
fn args_xuong_dong_tien_do_de_doc_duoc() {
    // Mặc định yt-dlp ghi đè dòng bằng \r; đọc theo dòng sẽ không thấy gì cho
    // tới khi tải xong.
    assert!(args("https://x/y").contains(&"--newline".to_string()));
}

#[test]
fn args_ten_file_hop_le_tren_windows() {
    assert!(args("https://x/y").contains(&"--windows-filenames".to_string()));
}

#[test]
fn args_ghi_duong_dan_ra_tep_rieng_khong_tron_vao_stdout() {
    let a = args("https://x/y");
    let i = a.iter().position(|s| s == "--print-to-file").expect("phải có cờ");
    assert_eq!(a[i + 1], "after_move:filepath");
    assert!(a[i + 2].contains(PATH_SINK), "phải ghi vào tệp riêng: {}", a[i + 2]);
}

#[test]
fn args_url_nam_cuoi_cung() {
    let a = args("https://x/y?z=1");
    assert_eq!(a.last().unwrap(), "https://x/y?z=1");
}

#[test]
fn args_cat_ngan_tieu_de_trong_ten_file() {
    // Windows giới hạn đường dẫn 260 ký tự; tiêu đề trên mạng dài tuỳ hứng.
    let a = args("https://x/y");
    let o = a.iter().position(|s| s == "-o").expect("phải có -o");
    assert!(a[o + 1].contains("%(title).80s"), "mẫu tên: {}", a[o + 1]);
    assert!(a[o + 1].ends_with("%(id)s.%(ext)s"), "mẫu tên: {}", a[o + 1]);
}

#[test]
fn doc_duoc_phan_tram_tu_dong_tien_do() {
    assert_eq!(
        parse_percent("[download]  45.3% of  12.34MiB at 1.23MiB/s ETA 00:05"),
        Some(45.3)
    );
    assert_eq!(parse_percent("[download] 100% of 5.00MiB in 00:03"), Some(100.0));
    assert_eq!(parse_percent("[download]   0.0% of ~1.00MiB"), Some(0.0));
}

#[test]
fn bo_qua_dong_khong_phai_tien_do() {
    // yt-dlp in rất nhiều dòng khác; nhận nhầm sẽ làm thanh tiến độ nhảy loạn.
    for l in [
        "[youtube] Extracting URL: https://x/y",
        "[info] Downloading 1 format(s): 137+140",
        "[Merger] Merging formats into \"a.mp4\"",
        "",
        "Deleting original file a.f137.mp4",
    ] {
        assert_eq!(parse_percent(l), None, "không được coi là tiến độ: {l}");
    }
}

#[test]
fn link_rong_bao_loi_chu_khong_goi_engine() {
    // exe không tồn tại: nếu hàm vẫn spawn thì sẽ ra engine_missing, nên test
    // này phân biệt được "chặn trước" với "chặn sau".
    let d = tempfile::tempdir().unwrap();
    let err = run_download(
        &PathBuf::from("yt-dlp-khong-ton-tai.exe"),
        Path::new("C:/m/ffmpeg"),
        "   ",
        d.path(),
        &mut |_| {},
    )
    .unwrap_err();
    assert_eq!(err.code(), "io_error", "nhận: {err}");
    assert!(err.to_string().contains("Chưa nhập link"), "nhận: {err}");
}

#[test]
fn thieu_yt_dlp_bao_engine_missing() {
    let d = tempfile::tempdir().unwrap();
    let err = run_download(
        &PathBuf::from("yt-dlp-khong-ton-tai.exe"),
        Path::new("C:/m/ffmpeg"),
        "https://x/y",
        d.path(),
        &mut |_| {},
    )
    .unwrap_err();
    assert_eq!(err.code(), "engine_missing", "nhận: {err}");
}
