use std::path::{Path, PathBuf};
use crate::{
    ffmpeg, srt::{self, Segment},
    stt::{self, SttModels},
    error::PipelineError,
    translate::{TranslateProvider, translate_segments},
};

pub struct SttResult {
    pub srt_path: PathBuf,
    pub cue_count: usize,
}

pub struct EngineCtx {
    pub ffmpeg: PathBuf,
    pub sherpa: PathBuf,
    pub models: SttModels,
}

pub fn finalize_srt(segs: &[Segment], project_dir: &Path) -> Result<SttResult, PipelineError> {
    let sub = project_dir.join("subtitles");
    std::fs::create_dir_all(&sub)
        .map_err(|e| PipelineError::Io(e.to_string()))?;
    let srt_path = sub.join("source.srt");
    std::fs::write(&srt_path, srt::write_srt(segs))
        .map_err(|e| PipelineError::Io(e.to_string()))?;
    Ok(SttResult {
        srt_path,
        cue_count: segs.len(),
    })
}

pub fn run_stt_pipeline(
    ctx: &EngineCtx,
    video: &Path,
    project_dir: &Path,
    lang: &str,
) -> Result<SttResult, PipelineError> {
    let audio_dir = project_dir.join("audio");
    std::fs::create_dir_all(&audio_dir)
        .map_err(|e| PipelineError::Io(e.to_string()))?;
    let wav = audio_dir.join("source.wav");
    ffmpeg::extract_audio(&ctx.ffmpeg, video, &wav)?;
    let segs = stt::run_stt(&ctx.sherpa, &ctx.models, &wav, lang)?;
    finalize_srt(&segs, project_dir)
}

#[derive(Debug)]
pub struct TranslateResult {
    pub srt_path: PathBuf,
    pub cue_count: usize,
}

pub fn run_translate_stage(
    project_dir: &Path,
    p: &dyn TranslateProvider,
    src: &str,
    tgt: &str,
) -> Result<TranslateResult, PipelineError> {
    let sub = project_dir.join("subtitles");
    let source = sub.join("source.srt");
    let text = std::fs::read_to_string(&source)
        .map_err(|_| PipelineError::Io(format!("Chưa có source.srt — chạy STT trước ({})", source.display())))?;
    let segs = srt::parse_srt(&text)?;
    let translated = translate_segments(p, &segs, src, tgt)?;
    let srt_path = sub.join(format!("translated.{tgt}.srt"));
    std::fs::write(&srt_path, srt::write_srt(&translated)).map_err(|e| PipelineError::Io(e.to_string()))?;
    Ok(TranslateResult { srt_path, cue_count: translated.len() })
}
