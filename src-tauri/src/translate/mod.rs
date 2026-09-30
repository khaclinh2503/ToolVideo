use crate::{config::TranslateConfig, error::PipelineError, srt::Segment};

pub mod google_free;
pub mod llama_server;
pub mod llm_tren_may;
pub mod openai_compat;

/// Hạn chờ cho endpoint LLM. Đo thật trên NVIDIA: một lô 40 cue mất 11–17 giây
/// với model đã tắt suy luận, nhưng 103–206 giây nếu nó vẫn nghĩ. 30 giây như cũ
/// cắt đứt gần như mọi lô thật; 240 giây đủ rộng mà vẫn không treo app cả buổi.
pub(crate) const CHO_LLM: std::time::Duration = std::time::Duration::from_secs(240);

/// Hạn chờ cho Google miễn phí: chỉ là một GET nhỏ, chờ lâu là hỏng thật.
pub(crate) const CHO_NHANH: std::time::Duration = std::time::Duration::from_secs(30);

pub(crate) fn http_client_voi(cho: std::time::Duration) -> Result<reqwest::blocking::Client, PipelineError> {
    reqwest::blocking::Client::builder()
        .timeout(cho)
        .user_agent("DichVideo-Local/0.1")
        .build()
        .map_err(|e| PipelineError::ProviderError {
            provider: "http".into(),
            status: None,
            msg: e.to_string(),
        })
}

pub(crate) fn http_client() -> Result<reqwest::blocking::Client, PipelineError> {
    http_client_voi(CHO_NHANH)
}

/// Host của `url` có phải loopback không (`127.x.x.x`, `localhost`, `::1`).
///
/// Tách chuỗi bằng tay thay vì kéo thêm crate `url`: chỉ cần phần authority, và
/// mọi base_url đi qua đây đều do app tự dựng hoặc do người dùng gõ vào một ô
/// duy nhất.
pub fn la_loopback(url: &str) -> bool {
    let sau_scheme = url.split_once("://").map(|(_, s)| s).unwrap_or(url);
    // Cắt đường dẫn/query/fragment, rồi cắt userinfo nếu có.
    let authority = sau_scheme
        .split(['/', '?', '#'])
        .next()
        .unwrap_or("");
    let authority = authority.rsplit_once('@').map(|(_, h)| h).unwrap_or(authority);
    // IPv6 trong ngoặc vuông: `[::1]:8080`.
    let host = if let Some(dong) = authority.strip_prefix('[') {
        match dong.split_once(']') {
            Some((h, _)) => h,
            None => dong,
        }
    } else {
        authority.split(':').next().unwrap_or("")
    };
    if host.eq_ignore_ascii_case("localhost") {
        return true;
    }
    host.parse::<std::net::IpAddr>()
        .map(|ip| ip.is_loopback())
        .unwrap_or(false)
}

/// Client HTTP hướng tới đúng `url` này.
///
/// Vì sao không dùng thẳng `http_client_voi`: `reqwest` 0.12 đọc
/// `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY` từ môi trường theo mặc định và KHÔNG
/// tự miễn trừ địa chỉ loopback. Trên một máy công ty có đặt các biến đó, mọi
/// request tới `127.0.0.1` — cả lần thăm dò sẵn sàng lẫn từng lô dịch của
/// `llm_tren_may` — đều bị đẩy ra proxy rồi hỏng hoặc treo, đúng trong môi
/// trường mà "không cần mạng" là lý do tồn tại của nhà cung cấp này. Biểu hiện
/// của nó là một lần hết giờ 180 giây không rõ nguyên nhân.
///
/// Xét theo HOST chứ không theo tên nhà cung cấp: `google_free` vẫn cần proxy
/// trên chính cái máy đó (nó ra Internet thật), còn một `openai_compat` mà
/// người dùng trỏ vào LM Studio ở máy mình thì cũng phải được miễn trừ y như
/// `llm_tren_may`. Host mới là thứ quyết định, không phải nhãn provider.
pub(crate) fn http_client_cho_url(
    url: &str,
    cho: std::time::Duration,
) -> Result<reqwest::blocking::Client, PipelineError> {
    if !la_loopback(url) {
        return http_client_voi(cho);
    }
    reqwest::blocking::Client::builder()
        .timeout(cho)
        .user_agent("DichVideo-Local/0.1")
        .no_proxy()
        .build()
        .map_err(|e| PipelineError::ProviderError {
            provider: "http".into(),
            status: None,
            msg: e.to_string(),
        })
}

pub(crate) fn map_http_err(provider: &str, e: reqwest::Error) -> PipelineError {
    let msg = if e.is_timeout() {
        "Hết thời gian chờ".to_string()
    } else {
        e.to_string()
    };
    PipelineError::ProviderError {
        provider: provider.into(),
        status: e.status().map(|s| s.as_u16()),
        msg,
    }
}

pub trait TranslateProvider {
    fn id(&self) -> &'static str;
    fn batch_size(&self) -> usize;
    fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str)
        -> Result<Vec<String>, PipelineError>;
}

/// Trim, then collapse runs of 2+ newlines (including "\r\n\r\n"-style runs)
/// into a single '\n' so the resulting text re-parses cleanly as SRT.
fn normalize_translated(s: &str) -> String {
    let s = s.trim();
    let mut out = String::with_capacity(s.len());
    let mut newline_run = 0usize;
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\r' {
            // treat \r (and \r\n) as part of a newline run
            if chars.peek() == Some(&'\n') {
                chars.next();
            }
            newline_run += 1;
            continue;
        }
        if c == '\n' {
            newline_run += 1;
            continue;
        }
        if newline_run > 0 {
            out.push('\n');
            newline_run = 0;
        }
        out.push(c);
    }
    // trailing newline run is dropped (we already trimmed, but be safe)
    out
}

pub fn translate_segments(
    p: &dyn TranslateProvider,
    segs: &[Segment],
    src: &str,
    tgt: &str,
) -> Result<Vec<Segment>, PipelineError> {
    let mut out = Vec::with_capacity(segs.len());
    let bs = p.batch_size().max(1);
    for chunk in segs.chunks(bs) {
        // Only send non-blank texts to the provider; blank inputs (empty or
        // whitespace-only) map straight to "" without hitting the network.
        let mut idx: Vec<usize> = Vec::new();
        let mut texts: Vec<&str> = Vec::new();
        for (i, s) in chunk.iter().enumerate() {
            if !s.text.trim().is_empty() {
                idx.push(i);
                texts.push(s.text.as_str());
            }
        }

        let mut translated_by_idx: Vec<String> = vec![String::new(); chunk.len()];
        if !texts.is_empty() {
            let translated = p.translate_batch(&texts, src, tgt)?;
            if translated.len() != texts.len() {
                return Err(PipelineError::ProviderError {
                    provider: p.id().into(),
                    status: None,
                    msg: format!("trả {} dòng, cần {}", translated.len(), texts.len()),
                });
            }
            for (pos, t) in idx.iter().zip(translated) {
                translated_by_idx[*pos] = normalize_translated(&t);
            }
        }

        for (s, t) in chunk.iter().zip(translated_by_idx) {
            out.push(Segment {
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: t,
            });
        }
    }
    Ok(out)
}

pub fn make_provider(
    id: &str,
    cfg: &TranslateConfig,
    models: &std::path::Path,
) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    match id {
        "google_free" => Ok(Box::new(google_free::GoogleFree::new())),
        llm_tren_may::ID => Ok(Box::new(llm_tren_may::LlmTrenMay::khoi_dong(
            models,
            cfg.openai.context.clone(),
        )?)),
        "openai_compat" => {
            let o = &cfg.openai;
            if o.api_key.trim().is_empty() || o.base_url.trim().is_empty() || o.model.trim().is_empty() {
                return Err(PipelineError::ProviderError {
                    provider: id.into(),
                    status: None,
                    msg: "thiếu cấu hình openai_compat: api_key/base_url/model (nhập rồi bấm Lưu cấu hình)".into(),
                });
            }
            Ok(Box::new(openai_compat::OpenAiCompat {
                chu_so_huu: "openai_compat",
                base_url: o.base_url.clone(),
                api_key: o.api_key.clone(),
                model: o.model.clone(),
                context: o.context.clone(),
            }))
        }
        _ => Err(PipelineError::ProviderError {
            provider: id.into(),
            status: None,
            msg: "provider chưa hỗ trợ".into(),
        }),
    }
}
