//! Nhà cung cấp dịch chạy trên máy: `llama-server` + Qwen3-14B.
//!
//! Provider SỞ HỮU server làm một trường. Nhờ vậy `Box<dyn TranslateProvider>`
//! bị thả lúc dịch xong là `Drop` của `LlamaServer` giết tiến trình và trả lại
//! 13,5 GB VRAM — không phải sửa `run_translate_stage` hay `commands.rs`, và
//! không có đường lỗi nào quên tắt server.

use super::llama_server::LlamaServer;
use super::openai_compat::OpenAiCompat;
use super::TranslateProvider;
use crate::error::PipelineError;
use std::path::Path;
use std::time::Duration;

pub const ID: &str = "llm_tren_may";

/// Nạp 9,8 GB lên VRAM mất khoảng 15 giây trên máy đích. 180 giây là rộng rãi
/// cho cả trường hợp đĩa chậm hoặc VRAM đang bị việc khác chiếm, mà vẫn không
/// treo app cả buổi nếu server hỏng hẳn.
const CHO_NAP: Duration = Duration::from_secs(180);

pub struct LlmTrenMay {
    // Thứ tự khai báo có ý nghĩa: Rust thả trường theo đúng thứ tự này, nên
    // `inner` (chỉ là cấu hình, không giữ tài nguyên) đi trước, `server` sau.
    inner: OpenAiCompat,
    #[allow(dead_code)]
    server: LlamaServer,
}

impl LlmTrenMay {
    pub fn khoi_dong(models: &Path, context: String) -> Result<LlmTrenMay, PipelineError> {
        let exe = models.join("llm").join("bin").join("llama-server.exe");
        let gguf = models.join("llm").join("gguf").join("Qwen3-14B-Q5_K_M.gguf");
        let mut server = LlamaServer::khoi_dong(&exe, &gguf)?;
        // `doi_san_sang` đã tự kiểm tiến trình còn sống giữa các lần thăm dò
        // và gắn đuôi stderr vào lỗi khi thất bại — không bọc thêm
        // `ly_do_chet()` ở đây nữa, kẻo đuôi stderr lặp lại hai lần trong
        // cùng một thông báo.
        server.doi_san_sang(CHO_NAP)?;
        let base = server.base_url();
        Ok(LlmTrenMay {
            inner: OpenAiCompat {
                base_url: base,
                // llama-server không kiểm token; gửi rỗng cho khỏi giả vờ có key.
                api_key: String::new(),
                // Chỉ nạp đúng một model nên nó bỏ qua trường này.
                model: "local".into(),
                context,
            },
            server,
        })
    }
}

impl TranslateProvider for LlmTrenMay {
    fn id(&self) -> &'static str {
        ID
    }
    fn batch_size(&self) -> usize {
        self.inner.batch_size()
    }
    fn translate_batch(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
    ) -> Result<Vec<String>, PipelineError> {
        self.inner.translate_batch(texts, src, tgt)
    }
}
