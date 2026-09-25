//! Ghép các wav cue rời thành một dải audio liền mạch dài bằng video.
//!
//! Không dùng `filter_complex` của ffmpeg: video 10 phút có ~200 cue, tức ~200
//! input và một chuỗi filter dài hàng chục nghìn ký tự — vượt giới hạn 32767
//! ký tự của `CreateProcess` trên Windows, và khi hỏng thì ffmpeg chỉ báo một
//! dòng lỗi cú pháp không chỉ ra cue nào.

use crate::error::PipelineError;
use crate::tts::manifest::Manifest;
use crate::wav;
use std::path::Path;

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DubStats {
    /// Số cue đã đặt được vào dải.
    pub placed: usize,
    /// Cue bắt đầu sau khi video đã hết.
    pub skipped: usize,
    /// Cue bị cắt đuôi vì chạm cuối video.
    pub truncated: usize,
    /// Số mẫu chạm trần do hai cue chồng lên nhau.
    pub saturated: usize,
    pub total_ms: u64,
}

pub fn build_dub_track(
    tts_dir: &Path,
    m: &Manifest,
    video_ms: u64,
    out: &Path,
) -> Result<DubStats, PipelineError> {
    let rate = m.sample_rate;
    if rate == 0 {
        return Err(PipelineError::Io(
            "manifest giọng đọc thiếu sample_rate — xoá thư mục tts/ rồi chạy lại Lồng tiếng".into(),
        ));
    }

    // ceil để không cắt mất mili-giây cuối
    let n = ((video_ms as u128 * rate as u128).div_ceil(1000)) as usize;
    let mut buf = vec![0i16; n];
    let mut st = DubStats { total_ms: video_ms, ..Default::default() };

    for s in &m.segments {
        let rel = match &s.audio_path {
            Some(r) => r,
            None => continue,
        };
        let path = tts_dir.join(rel);
        if !path.exists() {
            return Err(PipelineError::Io(format!(
                "thiếu file wav của cue {} ({}) — xoá thư mục tts/ rồi chạy lại Lồng tiếng",
                s.index,
                path.display()
            )));
        }
        let (r, samples) = wav::read_pcm16_mono(&path)?;
        if r != rate {
            return Err(PipelineError::Io(format!(
                "{} có tần số {r} Hz nhưng manifest ghi {rate} Hz — xoá thư mục tts/ rồi chạy lại Lồng tiếng",
                path.display()
            )));
        }

        let off = (s.start_ms as u128 * rate as u128 / 1000) as usize;
        if off >= n {
            st.skipped += 1;
            continue;
        }
        let take = samples.len().min(n - off);
        if take < samples.len() {
            st.truncated += 1;
        }
        for (i, v) in samples[..take].iter().enumerate() {
            let dst = &mut buf[off + i];
            let sum = *dst as i32 + *v as i32;
            let clamped = sum.clamp(i16::MIN as i32, i16::MAX as i32);
            if sum != clamped {
                st.saturated += 1;
            }
            *dst = clamped as i16;
        }
        st.placed += 1;
    }

    wav::write_pcm16_mono(out, rate, &buf)?;
    Ok(st)
}
