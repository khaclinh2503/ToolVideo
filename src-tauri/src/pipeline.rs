use std::path::{Path, PathBuf};
use crate::{
    ffmpeg, srt::{self, Segment},
    stt::{self, SttModels},
    error::PipelineError,
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
