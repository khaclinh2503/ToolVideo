use crate::error::PipelineError;
use sha2::{Digest, Sha256};
use std::path::PathBuf;

pub mod manifest;
pub mod piper;

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
        _ => Err(PipelineError::ProviderError {
            provider: id.into(),
            status: None,
            msg: "provider TTS chưa hỗ trợ".into(),
        }),
    }
}
