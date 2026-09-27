//! Tải video từ link bằng yt-dlp.
//!
//! App gốc làm việc này qua một backend SaaS (`gendownload.com/api/extractsrc`)
//! giải link thành URL media rồi tự tải. Dự án này không có backend nào, nên
//! dùng yt-dlp — một file exe độc lập, tải và kiểm sha256 bằng đúng hệ thống
//! thành phần như ffmpeg/sherpa/piper.

use crate::error::PipelineError;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

/// Tên file yt-dlp ghi đường dẫn kết quả vào. Đặt trong thư mục tải về, bắt đầu
/// bằng dấu chấm để không lẫn với video.
pub const PATH_SINK: &str = ".last-download-path";

/// Số ký tự tối đa lấy từ tiêu đề video khi đặt tên file. Windows giới hạn cả
/// đường dẫn ở 260 ký tự theo mặc định, mà tiêu đề trên mạng thì dài tuỳ hứng.
const TITLE_LEN: usize = 80;

/// Dựng tham số cho yt-dlp. Hàm thuần để test được mà không cần engine.
///
/// `ffmpeg_dir` là thư mục chứa ffmpeg.exe — yt-dlp cần nó để ghép luồng hình
/// và tiếng rời nhau thành một file mp4. Không truyền thì nó đi tìm ffmpeg
/// trong PATH của hệ thống, thứ mà máy người dùng không chắc có.
pub fn build_args(url: &str, out_dir: &Path, ffmpeg_dir: &Path) -> Vec<String> {
    vec![
        // Link một video trong playlist là chuyện rất thường; không có cờ này
        // thì dán một link như vậy sẽ tải về cả trăm video.
        "--no-playlist".to_string(),
        // Tiến độ xuống dòng thay vì ghi đè bằng \r, để đọc theo dòng được.
        "--newline".to_string(),
        // Bỏ các ký tự Windows không cho phép trong tên file (: * ? " < > |).
        "--windows-filenames".to_string(),
        "--ffmpeg-location".to_string(),
        ffmpeg_dir.display().to_string(),
        // Ảnh bìa gốc của video, ghi cạnh file với cùng tên gốc. Đẹp hơn hẳn
        // một khung hình trích ở giây thứ 5, và là thứ người dùng nhận ra ngay
        // khi nhìn danh sách dự án.
        "--write-thumbnail".to_string(),
        "--convert-thumbnail".to_string(),
        "jpg".to_string(),
        // Ưu tiên mp4 sẵn có; không có thì ghép luồng tốt nhất rồi đóng gói mp4.
        "-f".to_string(),
        "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b".to_string(),
        "--merge-output-format".to_string(),
        "mp4".to_string(),
        "-o".to_string(),
        format!("{}/%(title).{TITLE_LEN}s-%(id)s.%(ext)s", out_dir.display()),
        // Đường dẫn file cuối cùng ghi ra một tệp riêng, không trộn vào stdout:
        // stdout còn có tiến độ, mà tiêu đề video thì có thể chứa bất cứ thứ gì
        // nên không thể phân biệt bằng cách đoán hình dạng dòng.
        "--print-to-file".to_string(),
        "after_move:filepath".to_string(),
        out_dir.join(PATH_SINK).display().to_string(),
        url.to_string(),
    ]
}

/// Lấy phần trăm từ một dòng tiến độ của yt-dlp, ví dụ
/// `[download]  45.3% of  12.34MiB at 1.23MiB/s ETA 00:05`.
/// Trả `None` với mọi dòng khác — yt-dlp in rất nhiều dòng không phải tiến độ.
pub fn parse_percent(line: &str) -> Option<f32> {
    let rest = line.trim_start().strip_prefix("[download]")?;
    let pct = rest.trim_start();
    let end = pct.find('%')?;
    pct[..end].trim().parse::<f32>().ok()
}

fn no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    #[cfg(not(windows))]
    let _ = cmd;
}

/// Tải video về `out_dir`, trả đường dẫn file đã tải.
///
/// `on_progress` nhận phần trăm 0..100 mỗi khi yt-dlp báo tiến độ.
pub fn run_download(
    ytdlp: &Path,
    ffmpeg_dir: &Path,
    url: &str,
    out_dir: &Path,
    on_progress: &mut dyn FnMut(f32),
) -> Result<PathBuf, PipelineError> {
    if url.trim().is_empty() {
        return Err(PipelineError::Io("Chưa nhập link video".into()));
    }
    std::fs::create_dir_all(out_dir).map_err(|e| PipelineError::Io(e.to_string()))?;

    // yt-dlp NỐI THÊM vào tệp của --print-to-file. Xoá trước để không đọc phải
    // đường dẫn của lần tải trước khi lần này hỏng giữa chừng.
    let sink = out_dir.join(PATH_SINK);
    let _ = std::fs::remove_file(&sink);

    let mut cmd = Command::new(ytdlp);
    cmd.args(build_args(url, out_dir, ffmpeg_dir))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    no_window(&mut cmd);

    let mut child = cmd.spawn().map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("yt-dlp".into())
        } else {
            PipelineError::Io(err.to_string())
        }
    })?;

    // stderr rút trên luồng riêng để tiến trình con không nghẽn ống, cùng lý do
    // đã ghi trong tts/piper.rs. Đọc theo byte rồi decode lossy vì tiêu đề video
    // có thể không phải UTF-8 hợp lệ theo codepage hệ thống.
    let stderr = child.stderr.take().expect("đã piped");
    let err_handle = std::thread::spawn(move || {
        let mut tail: Vec<String> = Vec::new();
        let mut reader = BufReader::new(stderr);
        let mut buf: Vec<u8> = Vec::new();
        loop {
            buf.clear();
            match reader.read_until(b'\n', &mut buf) {
                Ok(0) | Err(_) => break,
                Ok(_) => {}
            }
            tail.push(String::from_utf8_lossy(&buf).trim_end().to_string());
            if tail.len() > 100 {
                tail.remove(0);
            }
        }
        tail.join("\n")
    });

    let stdout = child.stdout.take().expect("đã piped");
    let mut reader = BufReader::new(stdout);
    let mut buf: Vec<u8> = Vec::new();
    loop {
        buf.clear();
        match reader.read_until(b'\n', &mut buf) {
            Ok(0) | Err(_) => break,
            Ok(_) => {}
        }
        let line = String::from_utf8_lossy(&buf);
        if let Some(p) = parse_percent(&line) {
            on_progress(p);
        }
    }

    let wait_res = child.wait();
    let stderr_tail = err_handle.join().unwrap_or_default();
    let status = wait_res.map_err(|e| PipelineError::Io(e.to_string()))?;
    if !status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "tải video".into(),
            code: status.code().unwrap_or(-1),
            stderr: stderr_tail,
        });
    }

    let text = std::fs::read_to_string(&sink).map_err(|_| {
        PipelineError::EngineFailed {
            stage: "tải video".into(),
            code: 0,
            stderr: format!("yt-dlp báo xong nhưng không ghi đường dẫn nào\n{stderr_tail}"),
        }
    })?;
    // Nhiều dòng chỉ xảy ra khi một link ra nhiều file; lấy dòng cuối là file
    // vừa hoàn tất.
    let path = text
        .lines().rfind(|l| !l.trim().is_empty())
        .map(|l| PathBuf::from(l.trim()))
        .ok_or_else(|| PipelineError::EngineFailed {
            stage: "tải video".into(),
            code: 0,
            stderr: format!("đường dẫn yt-dlp ghi ra rỗng\n{stderr_tail}"),
        })?;
    let _ = std::fs::remove_file(&sink);

    if !path.exists() {
        return Err(PipelineError::EngineFailed {
            stage: "tải video".into(),
            code: 0,
            stderr: format!("không thấy file {}\n{stderr_tail}", path.display()),
        });
    }
    Ok(path)
}
