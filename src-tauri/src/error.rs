#[derive(Debug)]
pub enum PipelineError {
    EngineMissing(String),
    ChecksumMismatch { expected: String, got: String },
    NoAudioStream,
    EngineFailed { stage: String, code: i32, stderr: String },
    Io(String),
    ProviderError { provider: String, status: Option<u16>, msg: String },
}

impl PipelineError {
    pub fn code(&self) -> &'static str {
        match self {
            PipelineError::EngineMissing(_) => "engine_missing",
            PipelineError::ChecksumMismatch { .. } => "checksum_mismatch",
            PipelineError::NoAudioStream => "no_audio_stream",
            PipelineError::EngineFailed { .. } => "engine_failed",
            PipelineError::Io(_) => "io_error",
            PipelineError::ProviderError { .. } => "provider_error",
        }
    }
}

/// Giới hạn hiển thị của `msg` trong `ProviderError`.
///
/// 200 ký tự như trước là quá chật kể từ M9: thông báo dài nhất trong app là
/// chuỗi chẩn đoán của `llm_tren_may` — khoảng 100 ký tự tiền tố ("llama-server
/// đã tắt (mã …)") rồi tới đuôi stderr của `llama-server`. Cắt ở 200 thì tất cả
/// những gì người dùng đọc được là dòng banner "build: … with MSVC", đúng thứ
/// vô dụng nhất, còn lỗi thật (thiếu DLL CUDA, không thấy GPU) nằm ở CUỐI thì bị
/// vứt. Hai provider cloud không bị ảnh hưởng: `google_free` và `openai_compat`
/// đã tự cắt thân trả lời về 200 ký tự TRƯỚC khi dựng lỗi, nên nới ở đây không
/// làm chúng đổ nguyên một trang HTML ra giao diện.
const MSG_CAP: usize = 1000;

/// Phần ĐẦU giữ lại khi `msg` vẫn vượt `MSG_CAP`.
///
/// Giữ cả hai đầu chứ không chỉ một: đầu chuỗi nói *chuyện gì hỏng* (tiến trình
/// đã tắt với mã thoát nào — `0xC0000135` là thiếu DLL, tự nó đã là chẩn đoán),
/// còn cuối chuỗi nói *vì sao* (dòng stderr cuối cùng trước khi chết). Cắt một
/// đầu nào cũng mất một nửa câu trả lời.
const MSG_DAU: usize = 160;

/// Rút gọn `msg` mà vẫn giữ được phần cuối — nơi mọi nguồn sinh ra chuỗi này
/// đặt thông tin quan trọng nhất (đuôi stderr, dòng lỗi cuối).
fn rut_gon_msg(msg: &str) -> String {
    let ky_tu: Vec<char> = msg.chars().collect();
    if ky_tu.len() <= MSG_CAP {
        return msg.to_string();
    }
    let dau: String = ky_tu[..MSG_DAU].iter().collect();
    let duoi: String = ky_tu[ky_tu.len() - (MSG_CAP - MSG_DAU)..].iter().collect();
    format!("{dau} […] {duoi}")
}

impl std::fmt::Display for PipelineError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PipelineError::EngineMissing(name) => write!(
                f,
                "[engine_missing] Không tìm thấy công cụ '{name}'. Hãy cài/đặt đúng đường dẫn."
            ),
            PipelineError::NoAudioStream => {
                write!(f, "[no_audio_stream] Video không có luồng âm thanh.")
            }
            PipelineError::EngineFailed { stage, code, stderr } => {
                let tail: Vec<&str> = stderr.lines().rev().take(20).collect();
                let tail: String = tail.into_iter().rev().collect::<Vec<_>>().join("\n");
                write!(
                    f,
                    "[engine_failed] Bước '{stage}' lỗi (mã {code}): {tail}"
                )
            }
            PipelineError::ChecksumMismatch { expected, got } => write!(
                f,
                "[checksum_mismatch] File tải về hỏng (sha256 mong đợi {expected}, nhận {got})."
            ),
            PipelineError::Io(msg) => write!(f, "[io_error] {msg}"),
            PipelineError::ProviderError { provider, status, msg } => {
                let vi = match status {
                    Some(401) | Some(403) => "API key sai hoặc không có quyền".to_string(),
                    Some(429) => "Quá giới hạn gọi API, thử lại sau".to_string(),
                    Some(s) if *s >= 500 => format!("Dịch vụ lỗi phía server ({s})"),
                    _ => rut_gon_msg(msg),
                };
                write!(f, "[provider_error] {provider}: {vi}")
            }
        }
    }
}

impl std::error::Error for PipelineError {}
