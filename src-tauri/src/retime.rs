//! Khớp giọng dịch vào khung thời gian phụ đề bằng cách chọn `length_scale`
//! cho từng cue. Thuần số học: không I/O, không tiến trình con.

/// Khoảng đệm giữa hai câu để chúng không dính vào nhau.
pub const GUARD_MS: u64 = 80;

/// Chặn dưới của `length_scale` (~1.67× tốc độ thường). Dưới ngưỡng này giọng
/// Piper bắt đầu méo, nghe khó chịu hơn là để cue tràn sang khoảng lặng.
pub const MIN_LENGTH_SCALE: f32 = 0.6;

#[derive(Debug, Clone, Copy)]
pub struct FitOpts {
    pub guard_ms: u64,
    pub min_scale: f32,
}

impl Default for FitOpts {
    fn default() -> Self {
        Self { guard_ms: GUARD_MS, min_scale: MIN_LENGTH_SCALE }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Cue {
    pub start_ms: u64,
    /// Mốc cue này không được vượt qua: `start_ms` của cue kế tiếp, hoặc độ dài
    /// video nếu là cue cuối. KHÔNG phải `end_ms` của chính nó — phụ đề thường
    /// kết thúc sớm hơn nhiều so với lúc người kế tiếp mở miệng.
    pub boundary_ms: u64,
    /// Độ dài WAV đã đo được khi sinh ở tốc độ `scale`.
    pub duration_ms: u64,
    pub scale: f32,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Fit {
    pub scale: f32,
    /// `true` khi cue chạm trần tốc độ mà vẫn không vừa khe.
    pub capped: bool,
}

/// Làm tròn 2 chữ số thập phân. `tts::cache_key` định dạng `length_scale` bằng
/// `"{:.3}"`, nên nhiễu float ở chữ số thứ 7 sẽ sinh khoá khác nhau giữa hai
/// lần chạy và bắt sinh lại toàn bộ giọng. Lượng tử hoá là bắt buộc.
pub fn quantize(x: f32) -> f32 {
    (x * 100.0).round() / 100.0
}

/// Mốc chặn của từng cue: `start_ms` của cue sau, cue cuối lấy `video_ms`.
pub fn boundaries(starts: &[u64], video_ms: u64) -> Vec<u64> {
    (0..starts.len())
        .map(|i| if i + 1 < starts.len() { starts[i + 1] } else { video_ms })
        .collect()
}

pub fn fit_scale(c: &Cue, o: &FitOpts) -> Fit {
    if c.duration_ms == 0 {
        return Fit { scale: quantize(c.scale), capped: false };
    }
    let budget = c
        .boundary_ms
        .saturating_sub(c.start_ms)
        .saturating_sub(o.guard_ms);
    if budget == 0 {
        return Fit { scale: quantize(o.min_scale), capped: true };
    }
    if c.duration_ms <= budget {
        return Fit { scale: quantize(c.scale), capped: false };
    }
    let needed = c.scale * budget as f32 / c.duration_ms as f32;
    if needed < o.min_scale {
        Fit { scale: quantize(o.min_scale), capped: true }
    } else {
        Fit { scale: quantize(needed), capped: false }
    }
}

pub fn fit_scales(cues: &[Cue], o: &FitOpts) -> Vec<Fit> {
    cues.iter().map(|c| fit_scale(c, o)).collect()
}
