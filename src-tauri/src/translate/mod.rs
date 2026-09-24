use crate::{config::TranslateConfig, error::PipelineError, srt::Segment};

pub trait TranslateProvider {
    fn id(&self) -> &'static str;
    fn batch_size(&self) -> usize;
    fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str)
        -> Result<Vec<String>, PipelineError>;
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
        let texts: Vec<&str> = chunk.iter().map(|s| s.text.as_str()).collect();
        let translated = p.translate_batch(&texts, src, tgt)?;
        if translated.len() != chunk.len() {
            return Err(PipelineError::ProviderError {
                provider: p.id().into(),
                status: None,
                msg: format!("trả {} dòng, cần {}", translated.len(), chunk.len()),
            });
        }
        for (s, t) in chunk.iter().zip(translated) {
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
    _cfg: &TranslateConfig,
) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    Err(PipelineError::ProviderError {
        provider: id.into(),
        status: None,
        msg: "provider chưa hỗ trợ".into(),
    })
}
