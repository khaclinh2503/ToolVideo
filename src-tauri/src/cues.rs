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

    // Normalize line endings and check for blank lines that would corrupt the SRT file
    let normalized = text.replace("\r\n", "\n");
    if normalized.contains("\n\n") {
        return Err(PipelineError::Io(
            "Cue không thể chứa dòng trống".into(),
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

use crate::retime::{self, FitOpts};
use crate::tts::{self, TtsJob, TtsProvider};

#[derive(Debug, Clone)]
pub struct PreviewResult {
    pub audio_path: PathBuf,
    pub duration_ms: u64,
    pub length_scale: f32,
    /// Cue cuối và không lấy được độ dài video ⇒ tổng hợp không ràng buộc,
    /// nên tốc độ có thể khác lúc xuất.
    pub unconstrained: bool,
}

/// Tên tệp tạm cho wav đang sinh dở.
///
/// Đuôi PHẢI còn là `.wav`. Cầu nối VieNeu ghi bằng `soundfile`, thư viện đó
/// suy định dạng từ ĐUÔI tệp và bỏ ngang với "unable to get format from file
/// extension" nếu gặp `.tmp`. Đã xảy ra thật: `.wav.tmp` làm Nghe thử hỏng
/// 100% với VieNeu (Piper không dính vì nó ghi wav bất kể đuôi).
///
/// Cùng họ lỗi với cờ `-f wav` phải thêm cho ffmpeg ở bước ép tốc độ — ở đây
/// không có cờ nào để ép, nên phải đặt tên đúng ngay từ đầu.
pub fn duong_dan_tam(out: &Path) -> PathBuf {
    out.with_extension("tmp.wav")
}

/// Tổng hợp lại đúng một cue, ghi đè wav thật và cập nhật manifest.
///
/// KHÔNG gọi `run_retime_stage`: guard của nó so manifest với SRT trước khi làm
/// gì cả, mà sau một lần sửa thì hai bên lệch nhau đúng theo thiết kế — gọi nó
/// sẽ nhận về chính thông báo lỗi mà chức năng này sinh ra để tránh.
#[allow(clippy::too_many_arguments)]
pub fn preview(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    tgt: &str,
    index: usize,
    video_ms: Option<u64>,
    opts: &FitOpts,
) -> Result<PreviewResult, PipelineError> {
    let segs = read_segments(project_dir, tgt)?;
    if index == 0 || index > segs.len() {
        return Err(PipelineError::Io(format!(
            "Không có cue số {index} (bản dịch có {} cue)",
            segs.len()
        )));
    }
    let seg = segs[index - 1].clone();
    if seg.text.trim().is_empty() {
        return Err(PipelineError::Io(format!(
            "Cue số {index} rỗng lời — không có gì để đọc"
        )));
    }

    let tts_dir = project_dir.join("tts");
    let manifest_path = tts_dir.join("manifest.json");
    let mut m = tts_manifest::load(&manifest_path).ok_or_else(|| {
        PipelineError::Io(format!(
            "Chưa có giọng đọc — chạy Lồng tiếng trước ({})",
            manifest_path.display()
        ))
    })?;

    // Đổi giọng (hoặc đổi hẳn nhà cung cấp) rồi bấm Nghe thử là ghi một WAV
    // tần số khác vào một manifest ghi tần số cũ. `compose.rs` so tần số TỪNG
    // wav với header manifest và từ chối nếu lệch — nhưng nó chỉ chạy lúc Xuất,
    // nên lỗi lộ ra rất muộn và người dùng không hiểu vì sao. Piper 22050 Hz,
    // VieNeu 48000 Hz, nên đây là đường rất dễ đi vào.
    //
    // Chặn ngay tại điểm vào, TRƯỚC khi gọi engine hay chạm đĩa — cùng triết lý
    // đã dùng cho dòng trống ở M6.
    if m.sample_rate != p.sample_rate() {
        return Err(PipelineError::Io(format!(
            "Giọng đọc đã đổi ({} Hz so với {} Hz trong bản lồng tiếng hiện có) — chạy lại Lồng tiếng trước",
            p.sample_rate(),
            m.sample_rate
        )));
    }
    // Tần số thôi chưa đủ: đổi giọng TRONG CÙNG một nhà cung cấp giữ nguyên
    // 48000 Hz, nên guard trên cho lọt. Khi đó Nghe thử ghi một cue giọng mới
    // vào giữa một bản lồng tiếng giọng cũ, và Bước 4 phát ra một cue lạc giọng
    // mà không cảnh báo gì.
    if m.provider != p.id() || m.voice != voice.trim() {
        return Err(PipelineError::Io(format!(
            "Giọng đọc đã đổi ('{}' của {} so với '{}' của {} trong bản lồng tiếng hiện có) — chạy lại Lồng tiếng trước",
            voice.trim(),
            p.id(),
            m.voice,
            m.provider
        )));
    }

    // Ghép manifest với SRT theo VỊ TRÍ, giống hệt `cues::list` (`m.segments.get(i)`)
    // và guard của `run_export_stage` (`current_segs.iter().zip(m.segments.iter())`)
    // — ba bên đọc cùng một manifest thì phải khớp do cấu tạo, không phải do
    // trùng hợp. Từ chối sớm, TRƯỚC KHI động tới engine hay đĩa, khi vị trí này
    // không tồn tại (ví dụ Dịch lại thêm cue sau khi đã Lồng tiếng): không được
    // tự vá bằng cách chèn thêm entry, vì việc đó phá đúng bất biến vị trí ↔ cue
    // mà `list` và guard xuất đang dựa vào.
    if index > m.segments.len() {
        return Err(PipelineError::Io(format!(
            "Giọng đọc không khớp phụ đề ({} cue nhưng {} đoạn giọng) — chạy lại Lồng tiếng",
            segs.len(),
            m.segments.len()
        )));
    }

    // Ranh giới đúng quy tắc retime: start của cue kế; cue cuối lấy độ dài video.
    let (boundary_ms, unconstrained) = if index < segs.len() {
        (segs[index].start_ms, false)
    } else {
        match video_ms {
            Some(v) => (v, false),
            None => (u64::MAX, true),
        }
    };

    let rel = format!("segments/cue-{index:04}.wav");
    let out = tts_dir.join(&rel);
    if let Some(dir) = out.parent() {
        std::fs::create_dir_all(dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    // Tổng hợp vào tệp tạm cạnh đích: wav thật chỉ bị thay ở dòng `rename` cuối
    // hàm, sau khi MỌI lượt tổng hợp đã xong. Một lỗi giữa chừng (Piper chết,
    // hết đĩa, đóng app) thì để nguyên wav thật cũ — người dùng không mất giọng
    // đã sinh trước đó, và manifest (chỉ lưu sau rename) không thể nói dối về
    // một wav chưa từng tồn tại.
    let tmp = duong_dan_tam(&out);

    let synth = |scale: f32| -> Result<u64, PipelineError> {
        p.synthesize(
            &[TtsJob {
                index,
                text: seg.text.clone(),
                out: tmp.clone(),
                length_scale: scale,
                voice: None,
            }],
            &mut |_| {},
        )?;
        crate::wav::duration_ms(&tmp)
    };

    // Lượt 1: đo độ dài thật ở tốc độ nền.
    let mut scale = retime::quantize(base_scale);
    let mut dur = synth(scale)?;

    // Lượt 2: ép vừa ngân sách, đúng quy tắc dùng lúc xuất.
    let fit = retime::fit_scale(
        &retime::Cue {
            start_ms: seg.start_ms,
            boundary_ms,
            duration_ms: dur,
            scale,
        },
        opts,
    );
    if (fit.scale - scale).abs() > 1e-6 {
        scale = fit.scale;
        dur = synth(scale)?;
    }

    // Mọi lượt tổng hợp đã xong và không lỗi ⇒ giờ mới thay wav thật, atomically.
    std::fs::rename(&tmp, &out).map_err(|e| PipelineError::Io(e.to_string()))?;

    // Cập nhật manifest ⇒ cue này hết lệch với SRT. Vị trí đã được xác nhận tồn
    // tại ở trên nên đây là chỉ số hợp lệ.
    let key = tts::cache_key(p.id(), voice, scale, &seg.text);
    let e = &mut m.segments[index - 1];
    e.start_ms = seg.start_ms;
    e.end_ms = seg.end_ms;
    e.text = seg.text.clone();
    e.audio_path = Some(rel.clone());
    e.cache_key = Some(key);
    e.length_scale = scale;
    e.duration_ms = dur;
    tts_manifest::save(&manifest_path, &m)?;

    Ok(PreviewResult {
        audio_path: out,
        duration_ms: dur,
        length_scale: scale,
        unconstrained,
    })
}
