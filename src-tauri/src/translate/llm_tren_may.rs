//! Nhà cung cấp dịch chạy trên máy: `llama-server` + Gemma-3-12B.
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

/// Tên file model trong `models/llm/gguf`, phải khớp `files[].to` của mục
/// `gemma-3-12b` trong components.json.
///
/// ĐÃ ĐỔI TỪ Qwen3-14B-Q5_K_M sang đây. Lý do, đo trên 193 cue phim Trung thật:
///
/// * Xưng hô: Gemma 7/8 ca đúng, Qwen 5/8. Qwen bám cặp xưng hô của item đầu lô
///   rồi áp cho cả lô — lính báo cáo chỉ huy cũng xưng "con". Năm cách sửa
///   prompt đều thất bại; đổi model là cách duy nhất chữa được.
/// * Chữ Hán còn sót: Gemma 0 cue, Qwen 1 cue.
/// * Khớp hàng: hoà, 18/19 mốc neo số cho cả hai.
/// * Nhẹ hơn 2 GB, cùng tốc độ.
///
/// Gemma trả chuỗi RỖNG cho cue rác chỉ có dấu chấm, Qwen trả lại ".". Rỗng là
/// đúng hơn: `pipeline.rs` bỏ qua cue rỗng khi sinh tiếng, còn "." thì TTS đi
/// đọc một dấu chấm.
///
/// Một kết luận cũ từng nói Gemma "lệch hàng 8/19" — SAI, và sai vì công cụ đo
/// chứ không vì model: script đo lại bỏ qua cue rỗng khi đọc file nên mọi cue
/// phía sau tụt chỉ số đúng bằng số cue rỗng. Đếm số cue đọc ra trước khi tin
/// bất kỳ con số nào tính trên chỉ số cue.
pub const TEN_GGUF: &str = "gemma-3-12b-it-Q5_K_M.gguf";

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
        let gguf = models.join("llm").join("gguf").join(TEN_GGUF);
        let mut server = LlamaServer::khoi_dong(&exe, &gguf)?;
        // `doi_san_sang` tự kiểm tiến trình còn sống giữa các lần thăm dò, và
        // gắn đuôi stderr vào CẢ HAI đường lỗi của nó — tiến trình chết sớm và
        // hết giờ nạp. Vì vậy không bọc thêm `ly_do_chet()` ở đây, kẻo đuôi
        // stderr lặp lại hai lần trong cùng một thông báo.
        server.doi_san_sang(CHO_NAP)?;
        let base = server.base_url();
        Ok(LlmTrenMay {
            inner: OpenAiCompat {
                // Lỗi dịch phải tự xưng là nhà cung cấp người dùng đã chọn:
                // hỏng ở đây là hỏng trên máy này, không phải một dịch vụ cloud.
                chu_so_huu: ID,
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
