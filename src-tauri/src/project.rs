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
}

pub fn meta_path(project_dir: &Path) -> PathBuf {
    project_dir.join("project.json")
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
