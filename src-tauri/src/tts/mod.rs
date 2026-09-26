use crate::error::PipelineError;
use sha2::{Digest, Sha256};
use std::path::PathBuf;

pub mod manifest;
pub mod piper;
pub(crate) mod procio;
pub mod vieneu;

/// Một cue cần sinh audio.
#[derive(Debug, Clone)]
pub struct TtsJob {
    /// Số thứ tự cue trong SRT, bắt đầu từ 1.
    pub index: usize,
    pub text: String,
    pub out: PathBuf,
    pub length_scale: f32,
}

pub trait TtsProvider {
    fn id(&self) -> &'static str;
    fn sample_rate(&self) -> u32;
    /// Sinh wav cho từng job theo thứ tự; `on_done(index)` gọi sau mỗi cue ghi xong.
    /// Hợp đồng: `Ok(())` ⇒ mọi `job.out` đều tồn tại.
    fn synthesize(
        &self,
        jobs: &[TtsJob],
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError>;
}

/// Khoá cache: đổi provider/voice/tốc độ/text ⇒ đổi khoá.
/// Băm kèm độ dài từng trường nên nội dung không thể giả mạo ranh giới trường.
pub fn cache_key(provider: &str, voice: &str, length_scale: f32, text: &str) -> String {
    let ls = format!("{length_scale:.3}");
    let mut h = Sha256::new();
    for field in [provider, voice, ls.as_str(), text] {
        h.update((field.len() as u64).to_le_bytes());
        h.update(b"\x1f");
        h.update(field.as_bytes());
    }
    format!("{:x}", h.finalize())
}

use crate::config::TtsConfig;
use std::path::Path;

/// Đọc `audio.sample_rate` từ file `<voice>.onnx.json` cạnh model.
/// Piper cài kèm file này (Phase A); nó khai báo tần số lấy mẫu thật của giọng
/// (vd. các giọng `x_low` là 16000 Hz, `medium` thường là 22050 Hz) — không được
/// suy ra tần số này từ hằng số, phải đọc đúng file mà Piper dùng.
fn read_piper_sample_rate(path: &Path) -> Result<u32, PipelineError> {
    let missing = |detail: &str| {
        PipelineError::EngineMissing(format!(
            "piper ({}) — {detail}, bấm 'Tải bộ công cụ' để cài lại",
            path.display()
        ))
    };
    let bytes = std::fs::read(path).map_err(|_| missing("không đọc được file cấu hình giọng nói"))?;
    let json: serde_json::Value =
        serde_json::from_slice(&bytes).map_err(|_| missing("file cấu hình giọng nói không hợp lệ"))?;
    json.get("audio")
        .and_then(|a| a.get("sample_rate"))
        .and_then(|v| v.as_u64())
        .map(|v| v as u32)
        .ok_or_else(|| missing("thiếu audio.sample_rate trong cấu hình giọng nói"))
}

pub fn make_provider(
    id: &str,
    cfg: &TtsConfig,
    models: &Path,
) -> Result<Box<dyn TtsProvider>, PipelineError> {
    match id {
        "piper" => {
            let exe = models.join("piper").join("piper.exe");
            let model = models.join("piper").join(format!("{}.onnx", cfg.voice));
            let model_cfg = models.join("piper").join(format!("{}.onnx.json", cfg.voice));
            for p in [&exe, &model, &model_cfg] {
                if !p.exists() {
                    return Err(PipelineError::EngineMissing(format!(
                        "piper ({}) — bấm 'Tải bộ công cụ' để cài",
                        p.display()
                    )));
                }
            }
            let sample_rate = read_piper_sample_rate(&model_cfg)?;
            Ok(Box::new(piper::Piper { exe, model, sample_rate }))
        }
        "vieneu" => {
            let py = crate::pyenv::python_exe(models);
            let site_packages = crate::pyenv::site_packages(models);
            let vieneu_dir = models.join("vieneu");
            let onnx_update = vieneu_dir.join("onnx_update");
            let moss = vieneu_dir.join("moss");
            for p in [&py, &site_packages.join("vieneu").join("__init__.py"), &onnx_update, &moss] {
                if !p.exists() {
                    return Err(PipelineError::EngineMissing(format!(
                        "vieneu ({}) — bấm 'Tải bộ công cụ' để cài",
                        p.display()
                    )));
                }
            }
            let bridge = vieneu::ensure_bridge_script(models)?;
            let hf_home = vieneu_dir.join("cache");

            // Kiểm tên giọng NGAY ĐÂY, trước khi tốn vài giây nạp model rồi mới
            // nhận stderr tiếng Anh `Voice '...' not found` từ SDK.
            //
            // Đường vào rất thật: đổi nhà cung cấp rồi bấm "Lưu cấu hình" trước
            // khi danh sách giọng kịp nạp xong, mở một config.json cũ, hay sửa
            // tay — khi đó `voice` vẫn là tên giọng Piper. Cấu hình rỗng thì
            // dùng giọng mặc định thay vì báo lỗi.
            let voice = if cfg.voice.trim().is_empty() {
                vieneu::GIONG_MAC_DINH.to_string()
            } else {
                vieneu::tra_giong(&cfg.voice)?.ten.to_string()
            };

            Ok(Box::new(vieneu::VieNeu {
                python: py,
                bridge,
                site_packages,
                hf_home,
                voice,
                models_dir: vieneu_dir,
                // VieNeu không tự ép tốc độ đọc được; bước `atempo` hậu xử lý
                // trong `synthesize` cần ffmpeg, nên provider phải cầm đường dẫn.
                ffmpeg: models.join("ffmpeg").join("ffmpeg.exe"),
            }))
        }
        _ => Err(PipelineError::ProviderError {
            provider: id.into(),
            status: None,
            msg: "provider TTS chưa hỗ trợ".into(),
        }),
    }
}

/// `length_scale` cho từng cue. `index` đếm từ 1, khớp với `SegmentEntry::index`.
#[derive(Debug, Clone)]
pub struct ScalePlan {
    base: f32,
    per_cue: Vec<f32>,
}

impl ScalePlan {
    /// Mọi cue dùng chung một tốc độ. Lượng tử hoá ngay tại đây (xem
    /// `retime::quantize`) để không phụ thuộc gọi đúng đường retime mới an
    /// toàn: `cache_key` băm `length_scale` bằng `"{:.3}"`, nên một giá trị
    /// 3 chữ số thập phân (ví dụ từ `save_config`) sẽ tạo khoá khác nhau
    /// giữa lượt Lồng tiếng và lượt Xuất video, khiến mọi cue bị sinh lại
    /// mãi mãi dù không ai đổi tốc độ.
    pub fn uniform(base: f32) -> Self {
        Self { base: crate::retime::quantize(base), per_cue: Vec::new() }
    }

    /// Tốc độ riêng theo thứ tự cue; `base` là giá trị dự phòng. Cùng lý do
    /// lượng tử hoá như `uniform`.
    pub fn per_cue(base: f32, v: Vec<f32>) -> Self {
        Self {
            base: crate::retime::quantize(base),
            per_cue: v.into_iter().map(crate::retime::quantize).collect(),
        }
    }

    /// Ngoài phạm vi — kể cả `index == 0` — trả về `base`.
    pub fn get(&self, index: usize) -> f32 {
        if index == 0 {
            return self.base;
        }
        self.per_cue.get(index - 1).copied().unwrap_or(self.base)
    }
}
