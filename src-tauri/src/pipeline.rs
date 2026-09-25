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

/// Validates a target-language tag like "vi", "en", "zh-TW", "pt-BR":
/// `^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})?$`, implemented by hand (no regex crate).
pub fn is_valid_lang_tag(s: &str) -> bool {
    let mut parts = s.split('-');
    let primary = match parts.next() {
        Some(p) => p,
        None => return false,
    };
    if primary.is_empty() || primary.len() < 2 || primary.len() > 3 {
        return false;
    }
    if !primary.chars().all(|c| c.is_ascii_alphabetic()) {
        return false;
    }
    match parts.next() {
        None => parts.next().is_none(),
        Some(sub) => {
            if sub.is_empty() || sub.len() < 2 || sub.len() > 8 {
                return false;
            }
            if !sub.chars().all(|c| c.is_ascii_alphanumeric()) {
                return false;
            }
            // No further '-' segments allowed.
            parts.next().is_none()
        }
    }
}

pub fn run_translate_stage(
    project_dir: &Path,
    p: &dyn TranslateProvider,
    src: &str,
    tgt: &str,
) -> Result<TranslateResult, PipelineError> {
    let tgt = tgt.trim();
    if !is_valid_lang_tag(tgt) {
        return Err(PipelineError::ProviderError {
            provider: "pipeline".into(),
            status: None,
            msg: format!("Mã ngôn ngữ đích không hợp lệ: '{tgt}' (ví dụ: vi, en, zh-TW)"),
        });
    }

    let sub = project_dir.join("subtitles");
    let source = sub.join("source.srt");
    let text = std::fs::read_to_string(&source)
        .map_err(|_| PipelineError::Io(format!("Chưa có source.srt — chạy STT trước ({})", source.display())))?;
    let segs = srt::parse_srt(&text)?;

    let srt_path = sub.join(format!("translated.{tgt}.srt"));
    // No stale/partial output: remove any previous final file up front.
    match std::fs::remove_file(&srt_path) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
        Err(e) => return Err(PipelineError::Io(e.to_string())),
    }

    let translated = translate_segments(p, &segs, src, tgt)?;

    let tmp_path = sub.join(format!("translated.{tgt}.srt.tmp"));
    std::fs::write(&tmp_path, srt::write_srt(&translated)).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp_path, &srt_path).map_err(|e| PipelineError::Io(e.to_string()))?;

    Ok(TranslateResult { srt_path, cue_count: translated.len() })
}

use crate::tts::{self, manifest as tts_manifest, TtsJob, TtsProvider};

#[derive(Debug)]
pub struct TtsResult {
    pub manifest_path: PathBuf,
    pub cue_count: usize,
    pub generated: usize,
    pub cached: usize,
}

/// Sinh audio cho từng cue của `translated.<tgt>.srt`, dùng lại cue không đổi.
pub fn run_tts_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    length_scale: f32,
    tgt: &str,
) -> Result<TtsResult, PipelineError> {
    let srt_path = project_dir.join("subtitles").join(format!("translated.{tgt}.srt"));
    let text = std::fs::read_to_string(&srt_path).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            srt_path.display()
        ))
    })?;
    let segs = srt::parse_srt(&text)?;

    let tts_dir = project_dir.join("tts");
    let seg_dir = tts_dir.join("segments");
    std::fs::create_dir_all(&seg_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let manifest_path = tts_dir.join("manifest.json");

    // Cache cũ: cache_key -> audio_path (tương đối tts/)
    let old = tts_manifest::load(&manifest_path);
    let mut old_by_index: std::collections::HashMap<usize, (String, String, u64)> =
        std::collections::HashMap::new();
    if let Some(m) = &old {
        for s in &m.segments {
            if let (Some(k), Some(a)) = (s.cache_key.as_ref(), s.audio_path.as_ref()) {
                old_by_index.insert(s.index, (k.clone(), a.clone(), s.duration_ms));
            }
        }
    }

    let mut entries: Vec<tts_manifest::SegmentEntry> = Vec::with_capacity(segs.len());
    let mut jobs: Vec<TtsJob> = Vec::new();
    let mut cached = 0usize;

    for (i, s) in segs.iter().enumerate() {
        let index = i + 1;
        if s.text.trim().is_empty() {
            entries.push(tts_manifest::SegmentEntry {
                index,
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: s.text.clone(),
                audio_path: None,
                cache_key: None,
                length_scale,
                duration_ms: 0,
            });
            continue;
        }

        let key = tts::cache_key(p.id(), voice, length_scale, &s.text);
        let rel = format!("segments/cue-{index:04}.wav");
        let abs = tts_dir.join(format!("segments/cue-{index:04}.wav"));

        let hit = old_by_index
            .get(&index)
            .filter(|(k, a, _)| k == &key && a == &rel && abs.exists());

        if let Some((_, _, dur)) = hit {
            cached += 1;
            entries.push(tts_manifest::SegmentEntry {
                index,
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: s.text.clone(),
                audio_path: Some(rel),
                cache_key: Some(key),
                length_scale,
                duration_ms: *dur,
            });
        } else {
            jobs.push(TtsJob {
                index,
                text: s.text.clone(),
                out: abs,
                length_scale,
            });
            entries.push(tts_manifest::SegmentEntry {
                index,
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: s.text.clone(),
                audio_path: Some(rel),
                cache_key: Some(key),
                length_scale,
                duration_ms: 0,
            });
        }
    }

    let generated = jobs.len();
    if !jobs.is_empty() {
        p.synthesize(&jobs, &mut |_| {})?;
    }

    // Độ dài thật của mọi cue có audio (kể cả cache hit chưa có số liệu).
    for e in entries.iter_mut() {
        if let Some(rel) = &e.audio_path {
            if e.duration_ms == 0 {
                e.duration_ms = crate::wav::duration_ms(&tts_dir.join(rel))?;
            }
        }
    }

    let m = tts_manifest::Manifest {
        version: 1,
        provider: p.id().to_string(),
        voice: voice.to_string(),
        sample_rate: p.sample_rate(),
        segments: entries,
    };
    tts_manifest::save(&manifest_path, &m)?;

    // Dọn wav mồ côi (cue bị xoá bớt sau khi sửa phụ đề).
    let keep: std::collections::HashSet<String> = m
        .segments
        .iter()
        .filter_map(|s| s.audio_path.clone())
        .map(|a| a.trim_start_matches("segments/").to_string())
        .collect();
    if let Ok(rd) = std::fs::read_dir(&seg_dir) {
        for e in rd.flatten() {
            let name = e.file_name().to_string_lossy().to_string();
            if name.ends_with(".wav") && !keep.contains(&name) {
                let _ = std::fs::remove_file(e.path());
            }
        }
    }

    Ok(TtsResult {
        manifest_path,
        cue_count: m.segments.len(),
        generated,
        cached,
    })
}
