//! Bảng người nói của một dự án: ai nói đoạn nào, và mỗi người lồng giọng gì.
//!
//! Để trong dự án chứ không trong cấu hình chung: nhân vật là chuyện của từng
//! phim. Cùng lý do với `so_tay` (tên riêng).

use crate::pipeline::GiongCue;
use crate::srt::Segment;
use crate::tach_nguoi_noi::{gan_cho_cue, DoanNguoiNoi};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::Path;

pub const TEN_FILE: &str = "nguoi_noi.json";

/// Số nhân vật mặc định khi người dùng chưa chọn.
///
/// Công cụ có cả chế độ tự đoán số người theo ngưỡng khoảng cách, nhưng đo
/// thật trên phim mẫu 24 phút thì ngưỡng 0,8 cho ra 47 "người" — phim có nhạc
/// nền và tiếng động nên embedding nhiễu, đoán tự động không dùng được. Bắt
/// người dùng nói số nhân vật là cách rẻ và chắc hơn.
pub const SO_NGUOI_MAC_DINH: u32 = 6;

/// Trần số nhân vật. Trên mức này thì chọn giọng cho từng người đã thành việc
/// nặng hơn là lợi ích.
pub const SO_NGUOI_TOI_DA: u32 = 12;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct NguoiNoi {
    #[serde(default)]
    pub version: u32,
    #[serde(default)]
    pub so_nguoi: u32,
    #[serde(default)]
    pub doan: Vec<DoanNguoiNoi>,
    /// Nhãn người nói (`speaker_00`) → tên giọng. Nhãn không có ở đây thì cue
    /// của người đó dùng giọng mặc định của dự án.
    #[serde(default)]
    pub giong: BTreeMap<String, String>,
}

/// Thiếu file hoặc JSON hỏng ⇒ bảng rỗng, không phải lỗi.
///
/// Giống `so_tay::doc`: đây là dữ liệu phụ trợ, hỏng thì lồng tiếng vẫn chạy
/// được bằng một giọng — dừng cả bước vì một file phụ là đổi một phiền toái
/// nhỏ lấy một bế tắc.
pub fn doc(project_dir: &Path) -> NguoiNoi {
    std::fs::read_to_string(project_dir.join(TEN_FILE))
        .ok()
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or_default()
}

pub fn ghi(project_dir: &Path, n: &NguoiNoi) -> Result<(), crate::error::PipelineError> {
    use crate::error::PipelineError;
    let p = project_dir.join(TEN_FILE);
    let json = serde_json::to_string_pretty(n).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp = p.with_extension("json.tmp");
    std::fs::write(&tmp, json).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, &p).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Mỗi người nói đã nhận bao nhiêu đoạn, xếp nhiều trước — để giao diện bày
/// nhân vật chính lên đầu thay vì theo số thứ tự ngẫu nhiên của công cụ.
pub fn dem_theo_nguoi(n: &NguoiNoi) -> Vec<(String, usize)> {
    let mut m: BTreeMap<&str, usize> = BTreeMap::new();
    for d in &n.doan {
        *m.entry(d.nguoi.as_str()).or_default() += 1;
    }
    let mut v: Vec<(String, usize)> = m.into_iter().map(|(k, c)| (k.to_string(), c)).collect();
    v.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
    v
}

/// Bảng giọng theo số thứ tự cue, dùng thẳng cho bước lồng tiếng.
///
/// Cue không chạm đoạn nào, hoặc người nói chưa được gán giọng, thì KHÔNG có
/// mặt trong bảng — bước lồng tiếng tự rơi về giọng mặc định của dự án.
pub fn giong_cue(n: &NguoiNoi, cues: &[Segment]) -> GiongCue {
    let gan = gan_cho_cue(cues, &n.doan);
    let mut ra = GiongCue::new();
    for (i, ai) in gan.iter().enumerate() {
        let Some(ai) = ai else { continue };
        if let Some(v) = n.giong.get(ai) {
            if !v.trim().is_empty() {
                ra.insert(i + 1, v.clone());
            }
        }
    }
    ra
}

/// Câu thoại tiêu biểu của một người nói: cue dài nhất mà người đó nói.
///
/// Giao diện cần nó để người dùng biết `speaker_03` là ai trước khi chọn
/// giọng — nhìn một nhãn trống thì không ai chọn nổi.
pub fn cau_tieu_bieu<'a>(n: &NguoiNoi, cues: &'a [Segment], ai: &str) -> Option<&'a str> {
    let gan = gan_cho_cue(cues, &n.doan);
    cues.iter()
        .zip(gan.iter())
        .filter(|(c, g)| g.as_deref() == Some(ai) && !c.text.trim().is_empty())
        .max_by_key(|(c, _)| c.text.chars().count())
        .map(|(c, _)| c.text.as_str())
}
