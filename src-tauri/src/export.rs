//! Trộn tiếng gốc với dải tiếng dịch rồi mux vào video.
//!
//! Chia làm hai nửa: `build_*` là hàm thuần trên chuỗi (test được không cần
//! ffmpeg), `run_export`/`probe_*` gọi tiến trình con.

use crate::error::PipelineError;
use std::path::Path;
use std::process::Command;

/// Ẩn cửa sổ console của tiến trình con trên Windows.
fn no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    #[cfg(not(windows))]
    let _ = cmd;
}

fn run_ffprobe(ffprobe: &Path, args: &[&str], video: &Path) -> Result<String, PipelineError> {
    let mut cmd = Command::new(ffprobe);
    cmd.args(args).arg(video);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffprobe".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "ffprobe".into(),
            code: out.status.code().unwrap_or(-1),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        });
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
}

/// `ffprobe` in ra thời lượng dạng giây thập phân, hoặc `N/A` với container
/// không khai báo. Hàm thuần để test được mà không cần ffprobe thật.
pub fn parse_duration_ms(s: &str) -> Option<u64> {
    let v: f64 = s.trim().parse().ok()?;
    if !v.is_finite() || v <= 0.0 {
        return None;
    }
    Some((v * 1000.0).round() as u64)
}

pub fn probe_duration_ms(ffprobe: &Path, video: &Path) -> Result<u64, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
        ],
        video,
    )?;
    parse_duration_ms(&s).ok_or_else(|| PipelineError::EngineFailed {
        stage: "ffprobe".into(),
        code: 0,
        stderr: format!(
            "Không đọc được thời lượng của {} (ffprobe trả về '{s}')",
            video.display()
        ),
    })
}

/// Video câm là chuyện bình thường (màn hình quay, slide). Không có tiếng gốc
/// thì nhánh `[0:a]` của filtergraph sẽ làm ffmpeg chết ngay, nên phải hỏi trước.
pub fn probe_has_audio(ffprobe: &Path, video: &Path) -> Result<bool, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
        ],
        video,
    )?;
    Ok(!s.trim().is_empty())
}

use std::ffi::OsString;

/// Tên file phụ đề dùng trong filtergraph. Luôn là tên ASCII **tương đối**:
/// ffmpeg chạy với `current_dir` đặt ở thư mục chứa nó, nên filtergraph không
/// bao giờ phải mang đường dẫn tuyệt đối. Trên Windows, dấu hai chấm ổ đĩa kết
/// thúc tham số filter, dấu gạch ngược bị nuốt, và `[ ] , ;` trong tên thư mục
/// phá luôn graph — tên người dùng có dấu tiếng Việt làm mọi thứ tệ hơn.
pub const BURN_SRT_NAME: &str = "burn.srt";

#[derive(Debug, Clone)]
pub struct ExportOpts {
    pub burn_subs: bool,
    /// Chỉ có tác dụng khi `burn_subs == false`.
    pub soft_subs: bool,
    pub has_audio: bool,
    pub volume_original: f32,
    pub volume_dub: f32,
    pub crf: u32,
    pub preset: String,
}

/// `0.18` chứ không phải `0.180`; `3` chứ không phải `3.000`.
fn fmt_vol(v: f32) -> String {
    let s = format!("{v:.3}");
    let s = s.trim_end_matches('0');
    s.trim_end_matches('.').to_string()
}

pub fn build_filter_complex(o: &ExportOpts) -> String {
    let mut parts: Vec<String> = Vec::new();

    if o.burn_subs {
        parts.push(format!("[0:v]subtitles={BURN_SRT_NAME}[v]"));
    }

    if o.has_audio {
        parts.push(format!("[0:a]volume={}[bg]", fmt_vol(o.volume_original)));
        parts.push(format!("[1:a]volume={}[vo]", fmt_vol(o.volume_dub)));
        // normalize=0 bắt buộc: mặc định amix chia lại biên độ theo số input,
        // xoá sạch tỉ lệ vừa đặt ở hai dòng trên.
        // duration=longest chứ không phải first: `[0:a]` là tiếng GỐC, có thể
        // ngắn hơn hình (stream copy bị cắt, hoặc file gốc tiếng dừng trước
        // hình) trong khi dải tiếng dịch `[1:a]` luôn được dựng dài đúng bằng
        // `video_ms` (thời lượng container). Nếu ăn theo tiếng gốc ngắn hơn,
        // amix cắt cụt đúng phần đuôi dải tiếng dịch mà không cue/thống kê nào
        // phát hiện. Cả hai input đã bị chặn trần ở `video_ms` nên `longest`
        // không kéo dài mix ra ngoài hình; normalize=0 vẫn còn nên không có
        // hiện tượng khuếch đại lại khi một nhánh im lặng ở đuôi.
        parts.push(
            "[bg][vo]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0[mx]".into(),
        );
    } else {
        // Video câm: hệ số nhân 3.0 vô nghĩa vì không có nền nào để nổi lên trên.
        parts.push("[1:a]volume=1[mx]".into());
    }

    // Nhân 3.0 lên một giọng Piper vốn gần full-scale sẽ cắt đỉnh thô; limiter
    // giữ đỉnh dưới 0 dBFS.
    // level=disabled bắt buộc: mặc định alimiter tự bật "auto level", tự động
    // khuếch đại lại đầu ra về 0 dB — xoá sạch chính cái limit vừa đặt, y hệt
    // cái bẫy normalize=1 của amix ở trên.
    // limit=0.89 (~ -1 dBFS), không phải một số gần 0 dBFS: mux cuối cùng mã
    // hoá AAC, và giải mã AAC có thể vọt đỉnh tới ~0.5 dB so với mẫu PCM đưa
    // vào — đo được trên chính giọng lồng thật, không phải suy đoán. Ở
    // limit=0.98 đỉnh sau AAC đã vượt hẳn 0 dBFS dù limiter "đúng". −1 dBFS là
    // mức đệm quy ước cho phát hành qua codec mất dữ liệu, chọn theo nguyên
    // tắc đó chứ không theo riêng file test này — đừng chỉnh lại gần 0 dBFS.
    parts.push("[mx]alimiter=limit=0.89:level=disabled[aout]".into());
    parts.join(";")
}

pub fn build_export_args(
    video: &Path,
    dub: &Path,
    srt: Option<&Path>,
    out: &Path,
    o: &ExportOpts,
) -> Vec<OsString> {
    let soft = o.soft_subs && !o.burn_subs;
    let soft_srt = if soft { srt } else { None };

    let mut a: Vec<OsString> = vec!["-hide_banner".into(), "-nostats".into(), "-y".into()];
    a.push("-i".into());
    a.push(video.into());
    a.push("-i".into());
    a.push(dub.into());
    if let Some(s) = soft_srt {
        a.push("-i".into());
        a.push(s.into());
    }

    a.push("-filter_complex".into());
    a.push(build_filter_complex(o).into());

    a.push("-map".into());
    a.push(OsString::from(if o.burn_subs { "[v]" } else { "0:v:0" }));
    a.push("-map".into());
    a.push("[aout]".into());
    if soft_srt.is_some() {
        a.push("-map".into());
        a.push("2:0".into());
        a.push("-c:s".into());
        a.push("mov_text".into());
        a.push("-metadata:s:s:0".into());
        a.push("language=vie".into());
    }

    if o.burn_subs {
        a.push("-c:v".into());
        a.push("libx264".into());
        a.push("-preset".into());
        a.push(o.preset.as_str().into());
        a.push("-crf".into());
        a.push(o.crf.to_string().into());
        a.push("-pix_fmt".into());
        a.push("yuv420p".into());
    } else {
        a.push("-c:v".into());
        a.push("copy".into());
    }

    a.push("-c:a".into());
    a.push("aac".into());
    a.push("-b:a".into());
    a.push("192k".into());
    a.push("-movflags".into());
    a.push("+faststart".into());
    a.push(out.into());
    a
}

use std::path::PathBuf;

/// Chép bản dịch sang `burn.srt` cạnh nó. Trả về đường dẫn tuyệt đối, nhưng
/// filtergraph chỉ dùng tên `BURN_SRT_NAME` — xem chú thích ở hằng số đó.
pub fn prepare_burn_srt(subtitles_dir: &Path, translated: &Path) -> Result<PathBuf, PipelineError> {
    let text = std::fs::read(translated).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            translated.display()
        ))
    })?;
    std::fs::create_dir_all(subtitles_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let dst = subtitles_dir.join(BURN_SRT_NAME);
    std::fs::write(&dst, text)
        .map_err(|e| PipelineError::Io(format!("không ghi được {}: {e}", dst.display())))?;
    Ok(dst)
}

/// Chạy ffmpeg với thư mục làm việc đặt ở `work_dir` — đó là cách filtergraph
/// tham chiếu `burn.srt` bằng tên tương đối mà không phải escape đường dẫn.
pub fn run_export(ffmpeg: &Path, work_dir: &Path, args: &[OsString]) -> Result<(), PipelineError> {
    let mut cmd = Command::new(ffmpeg);
    cmd.current_dir(work_dir).args(args);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffmpeg".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if out.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    Err(crate::ffmpeg::classify_ffmpeg_failure(
        "export",
        out.status.code().unwrap_or(-1),
        &stderr,
    ))
}

/// Tên file xuất khi ghi vào thư mục do người dùng chọn: `<tên video>-<tgt>.mp4`.
///
/// Không dùng `final.mp4` như khi ghi trong thư mục dự án: ở đó mỗi dự án có
/// thư mục riêng nên trùng tên vô hại, còn thư mục của người dùng thì mọi dự án
/// đổ chung một chỗ và sẽ đè lên nhau.
pub fn output_name(video: &Path, tgt: &str) -> String {
    let goc = video
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "video".to_string());
    let t = tgt.trim();
    if t.is_empty() {
        format!("{goc}.mp4")
    } else {
        format!("{goc}-{t}.mp4")
    }
}

/// Đường dẫn còn trống trong `dir`: giữ nguyên `name` nếu chưa có, nếu đã có thì
/// thêm ` (2)`, ` (3)`…
///
/// Ghi đè im lặng một file sẵn có trong thư mục của người dùng là mất dữ liệu
/// không hoàn lại — họ có thể đã xuất bản cũ và còn cần nó.
pub fn unique_path(dir: &Path, name: &str) -> PathBuf {
    let p = dir.join(name);
    if !p.exists() {
        return p;
    }
    let (than, duoi) = match name.rsplit_once('.') {
        Some((a, b)) => (a.to_string(), format!(".{b}")),
        None => (name.to_string(), String::new()),
    };
    // Dừng ở 999 thay vì lặp vô hạn: tới mức đó thì thư mục đã hỏng theo nghĩa
    // nào đó, và trả về đường dẫn cuối còn hơn treo cứng.
    for i in 2..1000 {
        let p = dir.join(format!("{than} ({i}){duoi}"));
        if !p.exists() {
            return p;
        }
    }
    dir.join(format!("{than} (1000){duoi}"))
}
