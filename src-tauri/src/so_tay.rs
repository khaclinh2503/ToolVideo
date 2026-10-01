//! Sổ tay tên riêng và thuật ngữ của một dự án.
//!
//! Đo trên 193 cue phim Trung thật: sau khi đã sửa prompt và đã đổi model, loại
//! lỗi còn lại khó chịu nhất là tên riêng — `灵公文` ra "Ling Gongwen" trong khi
//! `林燕` ra "Lâm Yến", lẫn quy ước ngay trong một phim; `小花` ra "Hoa nhỏ" 3/3
//! vì model không biết đó là tên con chó.
//!
//! Sổ tay KHÔNG chữa bằng cách nhét quy tắc vào prompt rồi mong model nghe lời —
//! phiên trước đã thử năm cách như vậy cho lỗi xưng hô và trượt cả năm. Nó chữa
//! bằng cách ĐỐI CHIẾU sau khi dịch rồi gửi cue vi phạm đi sửa, đúng lối đã có
//! tác dụng với cue còn sót chữ Hán.

use crate::error::PipelineError;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// Một mục: dịch `goc` thì phải ra `dich`.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Muc {
    pub goc: String,
    pub dich: String,
    /// Ghi chú cho người dùng nhớ đây là ai (tên chó, thương hiệu…). Cũng được
    /// gửi kèm vào prompt vì nó cho model biết vai, mà vai thì đổi cách dịch.
    #[serde(default)]
    pub ghi_chu: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct SoTay {
    #[serde(default = "mot")]
    pub version: u32,
    #[serde(default)]
    pub muc: Vec<Muc>,
}

fn mot() -> u32 {
    1
}

pub fn duong_dan(project_dir: &Path) -> PathBuf {
    project_dir.join("glossary.json")
}

/// Đọc sổ tay; thiếu file hoặc file hỏng đều trả sổ rỗng.
///
/// Không trả lỗi: sổ tay là tiện ích, không phải điều kiện để dịch. Một
/// `glossary.json` hỏng mà chặn luôn cả bước dịch thì tai hại hơn hẳn việc dịch
/// không có sổ.
pub fn doc(project_dir: &Path) -> SoTay {
    let p = duong_dan(project_dir);
    match std::fs::read_to_string(&p) {
        Ok(t) => serde_json::from_str(&t).unwrap_or_else(|e| {
            eprintln!("glossary.json hỏng, bỏ qua sổ tay: {e}");
            SoTay::default()
        }),
        Err(_) => SoTay::default(),
    }
}

/// Ghi sổ tay. tmp + rename như mọi chỗ ghi quan trọng khác: tắt máy đúng lúc
/// không được để lại một file cụt rồi lặng lẽ mất sạch sổ.
pub fn ghi(project_dir: &Path, s: &SoTay) -> Result<(), PipelineError> {
    let p = duong_dan(project_dir);
    if let Some(dir) = p.parent() {
        std::fs::create_dir_all(dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let json = serde_json::to_string_pretty(s).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp = p.with_extension("json.tmp");
    std::fs::write(&tmp, json).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, &p).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Mục nào có `goc` xuất hiện trong một trong các câu đã cho.
///
/// Dùng để chỉ nhét phần sổ CÓ LIÊN QUAN vào prompt của lô đang dịch: nhét cả
/// sổ vừa phí token vừa làm loãng, mà phim dài thì sổ có thể hàng trăm mục.
///
/// Bỏ mục có `goc` rỗng, nếu không nó khớp mọi câu.
pub fn muc_lien_quan<'a>(so_tay: &'a SoTay, cau: &[&str]) -> Vec<&'a Muc> {
    so_tay
        .muc
        .iter()
        .filter(|m| !m.goc.trim().is_empty() && cau.iter().any(|c| c.contains(&m.goc)))
        .collect()
}

/// Mục mà cue này vi phạm: câu gốc có `goc` nhưng bản dịch không có `dich`.
///
/// So KHÔNG phân biệt hoa thường, vì tên riêng đầu câu viết hoa còn giữa câu
/// thì không — bắt chặt chữ hoa sẽ báo vi phạm giả ở nửa số cue.
///
/// Mục có `dich` rỗng thì bỏ qua: người dùng đang gõ dở, chưa phải là luật.
pub fn muc_vi_pham<'a>(goc: &str, dich: &str, muc: &[&'a Muc]) -> Vec<&'a Muc> {
    let dich_thuong = dich.to_lowercase();
    muc.iter()
        .filter(|m| !m.dich.trim().is_empty())
        .filter(|m| goc.contains(&m.goc) && !dich_thuong.contains(&m.dich.to_lowercase()))
        .copied()
        .collect()
}

/// Câu mô tả lỗi gửi kèm khi bảo model dịch lại một cue vi phạm.
pub fn mo_ta_vi_pham(muc: &[&Muc]) -> String {
    let ds: Vec<String> = muc
        .iter()
        .map(|m| {
            if m.ghi_chu.trim().is_empty() {
                format!("{} phải dịch là \"{}\"", m.goc, m.dich)
            } else {
                format!("{} ({}) phải dịch là \"{}\"", m.goc, m.ghi_chu.trim(), m.dich)
            }
        })
        .collect();
    ds.join("; ")
}
