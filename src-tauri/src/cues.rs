//! Sửa từng cue của bản dịch.
//!
//! Nguồn sự thật là file `subtitles/translated.<tgt>.srt`, không có lớp lưu
//! riêng nào đè lên: cả pipeline đọc thẳng file đó ở năm chỗ, nên một lớp đè
//! sẽ phải được hoà giải ở cả năm, và chỗ nào quên là chỗ đó âm thầm dùng bản cũ.

use crate::error::PipelineError;
use crate::srt;
use crate::tts::manifest as tts_manifest;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq)]
pub struct CueView {
    /// Số thứ tự trong SRT, đếm từ 1.
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    /// Độ dài giọng đọc đã sinh (ms); 0 khi chưa có.
    pub duration_ms: u64,
    /// Đường dẫn tuyệt đối tới wav; `None` khi chưa sinh hoặc file đã mất.
    pub audio_path: Option<PathBuf>,
    /// Manifest ghi `text` hoặc `start_ms` khác SRT ⇒ giọng đọc đang lệch với
    /// phụ đề. So đúng hai trường mà guard của `run_retime_stage` so, để dấu
    /// hiệu trên màn hình và lỗi lúc xuất không bao giờ nói hai điều khác nhau.
    pub stale: bool,
}

pub fn srt_path(project_dir: &Path, tgt: &str) -> PathBuf {
    project_dir
        .join("subtitles")
        .join(format!("translated.{}.srt", tgt.trim()))
}

fn read_segments(project_dir: &Path, tgt: &str) -> Result<Vec<srt::Segment>, PipelineError> {
    let path = srt_path(project_dir, tgt);
    let raw = std::fs::read_to_string(&path).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            path.display()
        ))
    })?;
    srt::parse_srt(&raw)
}

/// Không đòi phải có manifest: dự án mới dịch xong mà chưa lồng tiếng vẫn phải
/// xem và sửa được. Thiếu manifest ⇒ mọi cue `stale`, chưa có giọng đọc.
pub fn list(project_dir: &Path, tgt: &str) -> Result<Vec<CueView>, PipelineError> {
    let segs = read_segments(project_dir, tgt)?;
    let tts_dir = project_dir.join("tts");
    let m = tts_manifest::load(&tts_dir.join("manifest.json"));

    Ok(segs
        .iter()
        .enumerate()
        .map(|(i, s)| {
            let index = i + 1;
            // Match by position, not by index field in manifest — mirrors run_retime_stage's
            // positional guard exactly, so the on-screen staleness marker and export-time
            // refusal can never disagree when Task 3 writes to manifest entries by position.
            let entry = m.as_ref().and_then(|m| m.segments.get(i));
            match entry {
                Some(e) => CueView {
                    index,
                    start_ms: s.start_ms,
                    end_ms: s.end_ms,
                    text: s.text.clone(),
                    duration_ms: e.duration_ms,
                    audio_path: e
                        .audio_path
                        .as_ref()
                        .map(|r| tts_dir.join(r))
                        .filter(|p| p.exists()),
                    stale: e.text != s.text || e.start_ms != s.start_ms,
                },
                None => CueView {
                    index,
                    start_ms: s.start_ms,
                    end_ms: s.end_ms,
                    text: s.text.clone(),
                    duration_ms: 0,
                    audio_path: None,
                    stale: true,
                },
            }
        })
        .collect())
}

/// Ghi một cue trở lại SRT, giữ nguyên mọi cue khác. tmp + rename.
///
/// Cho phép chồng lấn với cue kề: `retime` và `compose` đã có đường xử lý
/// (đếm `saturated` trong `DubStats`), còn cấm chồng lấn sẽ chặn những ca cắt
/// phụ đề hợp lệ. Chỉ chặn khoảng thời gian rỗng hoặc âm.
pub fn save(
    project_dir: &Path,
    tgt: &str,
    index: usize,
    text: &str,
    start_ms: u64,
    end_ms: u64,
) -> Result<(), PipelineError> {
    if start_ms >= end_ms {
        return Err(PipelineError::Io(
            "Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc".into(),
        ));
    }

    let mut segs = read_segments(project_dir, tgt)?;
    if index == 0 || index > segs.len() {
        return Err(PipelineError::Io(format!(
            "Không có cue số {index} (bản dịch có {} cue)",
            segs.len()
        )));
    }

    let s = &mut segs[index - 1];
    s.text = text.to_string();
    s.start_ms = start_ms;
    s.end_ms = end_ms;

    let path = srt_path(project_dir, tgt);
    let tmp = path.with_extension("srt.tmp");
    std::fs::write(&tmp, srt::write_srt(&segs)).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, &path).map_err(|e| PipelineError::Io(e.to_string()))
}
