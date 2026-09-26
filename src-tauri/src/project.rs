//! Siêu dữ liệu dự án: những gì không suy ra được từ các file trên đĩa.
//!
//! Chủ ý KHÔNG lưu ở đây: trạng thái từng giai đoạn (suy từ file, xem `status`),
//! `revision`, hệ "authority", sổ artifact. Ứng dụng gốc có cả ba, nhưng lý do
//! tài liệu tái dựng đưa ra cho chúng là undo/redo — thứ M5 chưa có.

use crate::error::PipelineError;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ProjectMeta {
    pub version: u32,
    /// Đường dẫn tuyệt đối tới video nguồn.
    pub video_path: String,
    /// Mã ngôn ngữ truyền cho `--sense-voice-language`.
    pub src_lang: String,
    pub tgt_lang: String,
    /// Epoch mili-giây. Dùng `u64` thay vì chuỗi ISO để khỏi thêm dependency
    /// ngày tháng; phía UI đã có sẵn `new Date(ms)`.
    pub created_at: u64,
    pub updated_at: u64,
    /// Đường dẫn bản xuất gần nhất. `None` với dự án tạo trước khi có tính năng
    /// chọn thư mục xuất — khi đó `status()` lùi về chỗ cũ `<dự án>/output/final.mp4`.
    #[serde(default)]
    pub export_path: Option<String>,
}

pub fn meta_path(project_dir: &Path) -> PathBuf {
    project_dir.join("project.json")
}

/// Dựng metadata cho một dự án mới tạo (dùng bởi `run_stt`).
///
/// `src_lang`/`tgt_lang` được trim trước khi lưu: `run_translate_stage` trim
/// `tgt` trước khi dựng tên file `translated.<tgt>.srt`, nên nếu metadata giữ
/// nguyên khoảng trắng thừa, `status()` sẽ tra theo tên file sai (còn khoảng
/// trắng) và không bao giờ tìm thấy file đã dịch — `has_translation` kẹt ở
/// `false` vĩnh viễn dù bản dịch đã có trên đĩa.
pub fn new_project_meta(video: &Path, src_lang: &str, tgt_lang: &str, now: u64) -> ProjectMeta {
    ProjectMeta {
        version: 1,
        video_path: video.display().to_string(),
        src_lang: src_lang.trim().to_string(),
        tgt_lang: tgt_lang.trim().to_string(),
        created_at: now,
        updated_at: now,
        export_path: None,
    }
}

/// Thiếu file hoặc JSON hỏng ⇒ `None`, không phải lỗi. Cùng quy ước với
/// `tts::manifest::load`: một dự án không đọc được chỉ đơn giản là không hiện
/// trong danh sách, chứ không làm hỏng cả lần liệt kê.
pub fn load(project_dir: &Path) -> Option<ProjectMeta> {
    let text = std::fs::read_to_string(meta_path(project_dir)).ok()?;
    serde_json::from_str(&text).ok()
}

/// Ghi qua tmp + rename để không bao giờ để lại file dở.
pub fn save(project_dir: &Path, m: &ProjectMeta) -> Result<(), PipelineError> {
    std::fs::create_dir_all(project_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let path = meta_path(project_dir);
    let json = serde_json::to_string_pretty(m).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, json).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, &path).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Tách riêng khỏi `update` để test ghim được thời gian.
pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Đọc, sửa, đặt `updated_at = now_ms`, ghi lại.
///
/// **Không có meta ⇒ không làm gì và trả `Ok(())`.** Dự án tạo trước M5 không có
/// `project.json`, và một giai đoạn xử lý không được phép thất bại chỉ vì không
/// cập nhật nổi một dấu thời gian.
pub fn update(
    project_dir: &Path,
    now_ms: u64,
    f: impl FnOnce(&mut ProjectMeta),
) -> Result<(), PipelineError> {
    let mut m = match load(project_dir) {
        Some(m) => m,
        None => return Ok(()),
    };
    f(&mut m);
    m.updated_at = now_ms;
    save(project_dir, &m)
}

/// Trạng thái từng giai đoạn, **suy từ file đang có trên đĩa** mỗi lần hỏi.
/// Không lưu vào `project.json`: một bản sao sẽ nói dối ngay khi người dùng xoá
/// tay thư mục `tts/`.
#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct ProjectStatus {
    pub has_stt: bool,
    pub has_translation: bool,
    pub has_tts: bool,
    pub has_export: bool,
    /// Video nguồn còn ở chỗ cũ không. Ổ cắm ngoài bị rút hay file bị chuyển là
    /// hỏng hóc dễ gặp nhất sau một thời gian dùng, và danh sách phải nói ra
    /// thay vì để người dùng bấm Xuất rồi mới thấy lỗi.
    pub video_exists: bool,
}

pub fn status(project_dir: &Path, m: &ProjectMeta) -> ProjectStatus {
    ProjectStatus {
        has_stt: project_dir.join("subtitles").join("source.srt").exists(),
        has_translation: project_dir
            .join("subtitles")
            .join(format!("translated.{}.srt", m.tgt_lang))
            .exists(),
        has_tts: project_dir.join("tts").join("manifest.json").exists(),
        // Ưu tiên đường dẫn đã ghi trong metadata vì người dùng có thể đã xuất
        // ra thư mục riêng; chỉ lùi về chỗ mặc định cho dự án cũ chưa có trường này.
        has_export: match m.export_path.as_deref() {
            Some(p) => Path::new(p).exists(),
            None => project_dir.join("output").join("final.mp4").exists(),
        },
        video_exists: Path::new(&m.video_path).exists(),
    }
}

#[derive(Clone, Debug)]
pub struct ProjectSummary {
    pub project_dir: PathBuf,
    pub meta: ProjectMeta,
    pub status: ProjectStatus,
}

/// Quét `projects_root`, bỏ qua mọi thư mục con không có `project.json` đọc được
/// — đó cũng chính là cách thư mục do test E2E sinh ra không lọt vào danh sách,
/// không cần danh sách loại trừ theo tên. Sắp xếp `updated_at` giảm dần.
pub fn list(projects_root: &Path) -> Vec<ProjectSummary> {
    let rd = match std::fs::read_dir(projects_root) {
        Ok(rd) => rd,
        Err(_) => return Vec::new(),
    };
    let mut out: Vec<ProjectSummary> = rd
        .flatten()
        .map(|e| e.path())
        .filter(|p| p.is_dir())
        .filter_map(|dir| {
            let meta = load(&dir)?;
            let st = status(&dir, &meta);
            Some(ProjectSummary { project_dir: dir, meta, status: st })
        })
        .collect();
    out.sort_by(|a, b| b.meta.updated_at.cmp(&a.meta.updated_at));
    out
}

/// Xoá cả thư mục dự án.
///
/// Đây là hàm duy nhất trong ứng dụng gọi `remove_dir_all` lên dữ liệu người
/// dùng. Mọi ràng buộc được kiểm **sau** `canonicalize` cả hai phía, để `..` và
/// symlink không lách qua được: chuỗi ký tự có thể nói dối, đường dẫn đã chuẩn
/// hoá thì không.
pub fn delete(projects_root: &Path, project_dir: &Path) -> Result<(), PipelineError> {
    let root = projects_root.canonicalize().map_err(|e| {
        PipelineError::Io(format!(
            "không đọc được thư mục dự án gốc {}: {e}",
            projects_root.display()
        ))
    })?;
    let dir = project_dir.canonicalize().map_err(|e| {
        PipelineError::Io(format!("không tìm thấy dự án {}: {e}", project_dir.display()))
    })?;

    let refuse = |d: &Path| {
        PipelineError::Io(format!(
            "Đường dẫn không nằm trong thư mục dự án — từ chối xoá ({})",
            d.display()
        ))
    };

    if !dir.is_dir() {
        return Err(refuse(&dir));
    }
    if dir == root {
        return Err(refuse(&dir));
    }
    if dir.parent() != Some(root.as_path()) {
        return Err(refuse(&dir));
    }

    std::fs::remove_dir_all(&dir)
        .map_err(|e| PipelineError::Io(format!("không xoá được {}: {e}", dir.display())))
}

/// Tham số ffmpeg trích một khung hình làm ảnh bìa. Hàm thuần để test.
///
/// Lấy ở giây thứ 5 chứ không phải giây 0: rất nhiều video mở đầu bằng màn hình
/// đen hoặc logo, nên khung đầu tiên thường vô dụng. Thu còn rộng 320px vì đây
/// chỉ là ảnh nhỏ trong danh sách dự án.
pub fn build_thumbnail_args(video: &Path, ra: &Path) -> Vec<String> {
    vec![
        "-nostdin".into(),
        "-hide_banner".into(),
        "-loglevel".into(),
        "error".into(),
        "-y".into(),
        "-ss".into(),
        "5".into(),
        "-i".into(),
        video.display().to_string(),
        "-frames:v".into(),
        "1".into(),
        "-q:v".into(),
        "2".into(),
        "-vf".into(),
        "scale=320:-1".into(),
        ra.display().to_string(),
    ]
}

/// Đường dẫn ảnh bìa của một dự án.
pub fn thumbnail_path(project_dir: &Path) -> PathBuf {
    project_dir.join("media").join("thumbnail.jpg")
}

/// Ảnh bìa mà yt-dlp đã tải về cạnh video, nếu có.
///
/// yt-dlp ghi ảnh cùng tên gốc với video, chỉ khác đuôi. Ảnh bìa thật của
/// YouTube/Bilibili đẹp và nhận ra được ngay, hơn hẳn một khung hình bất kỳ.
pub fn anh_bia_canh_video(video: &Path) -> Option<PathBuf> {
    for duoi in ["jpg", "jpeg", "png", "webp"] {
        let p = video.with_extension(duoi);
        if p.exists() {
            return Some(p);
        }
    }
    None
}

/// Đặt ảnh bìa cho dự án: ưu tiên ảnh yt-dlp tải cùng video, không có thì trích
/// một khung hình bằng ffmpeg.
///
/// Không bao giờ trả lỗi ra ngoài: thiếu ảnh bìa chỉ làm danh sách dự án xấu
/// hơn một chút, không đáng để làm hỏng cả lần chạy nhận dạng vừa tốn vài phút.
pub fn tao_thumbnail(ffmpeg: &Path, video: &Path, project_dir: &Path) {
    let ra = thumbnail_path(project_dir);
    if let Some(d) = ra.parent() {
        if std::fs::create_dir_all(d).is_err() {
            return;
        }
    }
    if let Some(co_san) = anh_bia_canh_video(video) {
        if co_san.extension().and_then(|e| e.to_str()) == Some("jpg") {
            let _ = std::fs::copy(&co_san, &ra);
            return;
        }
        // Định dạng khác (webp/png) thì để ffmpeg đổi sang jpg cho webview chắc
        // chắn hiển thị được.
        let mut cmd = std::process::Command::new(ffmpeg);
        cmd.args([
            "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i",
        ])
        .arg(&co_san)
        .arg(&ra);
        crate::export::no_window(&mut cmd);
        if cmd.output().map(|o| o.status.success()).unwrap_or(false) {
            return;
        }
    }
    let mut cmd = std::process::Command::new(ffmpeg);
    cmd.args(build_thumbnail_args(video, &ra));
    crate::export::no_window(&mut cmd);
    let _ = cmd.output();
}
