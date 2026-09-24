use crate::{config::TranslateConfig, error::PipelineError, srt::Segment};

pub mod google_free;
pub mod openai_compat;

pub(crate) fn http_client() -> Result<reqwest::blocking::Client, PipelineError> {
    reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .user_agent("DichVideo-Local/0.1")
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
) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    match id {
        "google_free" => Ok(Box::new(google_free::GoogleFree::new())),
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
                base_url: o.base_url.clone(),
                api_key: o.api_key.clone(),
                model: o.model.clone(),
            }))
        }
        _ => Err(PipelineError::ProviderError {
            provider: id.into(),
            status: None,
            msg: "provider chưa hỗ trợ".into(),
        }),
    }
}
