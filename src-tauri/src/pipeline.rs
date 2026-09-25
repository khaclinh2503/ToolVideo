use std::path::{Path, PathBuf};
use crate::{
    ffmpeg, srt::{self, Segment},
    stt::{self, SttModels},
    error::PipelineError,
    translate::{TranslateProvider, translate_segments},
    retime::{self, FitOpts},
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

use crate::tts::{self, manifest as tts_manifest, ScalePlan, TtsJob, TtsProvider};

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
    scales: &ScalePlan,
    tgt: &str,
) -> Result<TtsResult, PipelineError> {
    let tgt = tgt.trim();
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
        let length_scale = scales.get(index);
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

#[derive(Debug)]
pub struct RetimeResult {
    /// Số cue đổi `length_scale` so với lượt trước.
    pub adjusted: usize,
    /// Số cue đã đọc nhanh hết cỡ mà vẫn tràn sang cue sau.
    pub capped: usize,
    pub tts: TtsResult,
}

/// Lượt hai của TTS: đọc độ dài thật từ manifest lượt một, chọn `length_scale`
/// cho từng cue, rồi sinh lại đúng những cue tràn. `cache_key` đã băm
/// `length_scale` nên cue không đổi tốc độ được dùng lại nguyên.
pub fn run_retime_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    video_ms: u64,
    opts: &FitOpts,
    tgt: &str,
) -> Result<RetimeResult, PipelineError> {
    let tgt = tgt.trim();
    let manifest_path = project_dir.join("tts").join("manifest.json");
    let m = tts_manifest::load(&manifest_path).ok_or_else(|| {
        PipelineError::Io(format!(
            "Chưa có giọng đọc — chạy Lồng tiếng trước ({})",
            manifest_path.display()
        ))
    })?;

    // `run_tts_stage` sẽ đọc lại đúng file này và áp `scales` theo VỊ TRÍ
    // (index trong SRT). Nếu phụ đề đã bị sửa (thêm/bớt/sửa cue) kể từ lần
    // Lồng tiếng ghi manifest, thì cue boundary/scale tính từ manifest cũ sẽ
    // bị lệch khỏi cue thật ở vị trí đó — không có gì phát hiện việc này nếu
    // không đối chiếu ở đây. So khớp `text` và `start_ms`, KHÔNG so `end_ms`:
    // `run_retime_stage` chưa từng dùng `end_ms` (boundary lấy từ `start_ms`
    // của cue kế tiếp), nên chỉ đổi `end_ms` không phải dấu hiệu phụ đề đã
    // "đổi" theo nghĩa ảnh hưởng tới retime.
    let srt_path = project_dir.join("subtitles").join(format!("translated.{tgt}.srt"));
    let srt_text = std::fs::read_to_string(&srt_path).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            srt_path.display()
        ))
    })?;
    let current_segs = srt::parse_srt(&srt_text)?;
    let stale = || {
        PipelineError::Io(format!(
            "Phụ đề đã thay đổi sau khi lồng tiếng — chạy lại Lồng tiếng trước khi xuất ({})",
            srt_path.display()
        ))
    };
    if current_segs.len() != m.segments.len() {
        return Err(stale());
    }
    for (seg, entry) in current_segs.iter().zip(m.segments.iter()) {
        if seg.text != entry.text || seg.start_ms != entry.start_ms {
            return Err(stale());
        }
    }

    let starts: Vec<u64> = m.segments.iter().map(|s| s.start_ms).collect();
    let bounds = retime::boundaries(&starts, video_ms);
    let cues: Vec<retime::Cue> = m
        .segments
        .iter()
        .zip(bounds.iter())
        .map(|(s, b)| retime::Cue {
            start_ms: s.start_ms,
            boundary_ms: *b,
            duration_ms: s.duration_ms,
            scale: s.length_scale,
        })
        .collect();

    let fits = retime::fit_scales(&cues, opts);
    let adjusted = fits
        .iter()
        .zip(cues.iter())
        .filter(|(f, c)| (f.scale - retime::quantize(c.scale)).abs() > 1e-6)
        .count();
    let capped = fits.iter().filter(|f| f.capped).count();

    let scales: Vec<f32> = fits.iter().map(|f| f.scale).collect();
    let plan = ScalePlan::per_cue(base_scale, scales);
    let tts = run_tts_stage(project_dir, p, voice, &plan, tgt)?;

    Ok(RetimeResult { adjusted, capped, tts })
}

use crate::compose::{self, DubStats};
use crate::config::ComposeConfig;
use crate::export;

#[derive(Debug)]
pub struct ExportResult {
    pub output_path: PathBuf,
    pub retime: RetimeResult,
    pub dub: DubStats,
}

/// Điều kiện trước: đã chạy Lồng tiếng (có `tts/manifest.json`). Hàm này KHÔNG
/// tự chạy lượt TTS đầu — người dùng bấm "Xuất video" không nên bất ngờ chờ
/// vài phút sinh cả bộ giọng.
#[allow(clippy::too_many_arguments)]
pub fn run_export_stage(
    project_dir: &Path,
    ffmpeg: &Path,
    ffprobe: &Path,
    video: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    tgt: &str,
    cfg: &ComposeConfig,
    burn_subs: bool,
    soft_subs: bool,
    on_phase: &mut dyn FnMut(&str),
) -> Result<ExportResult, PipelineError> {
    // Cùng lý do trim ở run_tts_stage/run_retime_stage: hàm này tự dựng lại
    // đường dẫn `translated.<tgt>.srt` bên dưới (cho burn/soft-subs), độc lập
    // với tgt đã trim bên trong run_retime_stage — không trim ở đây thì cùng
    // một lỗi "Chưa có bản dịch" chỉ dời sang muộn hơn, ngay bước mã hoá.
    let tgt = tgt.trim();
    // `current_dir` chỉ an toàn vì mọi đường dẫn ngoài filtergraph (video, dub,
    // srt, output) đều tuyệt đối; một `video` tương đối sẽ bị re-root theo
    // `subtitles/` (thư mục làm việc của ffmpeg) và cho ra lỗi ffmpeg tiếng Anh
    // khó hiểu thay vì lỗi rõ ràng ở đây.
    debug_assert!(video.is_absolute(), "video phải là đường dẫn tuyệt đối: {}", video.display());

    if !video.exists() {
        return Err(PipelineError::Io(format!(
            "Không tìm thấy video gốc ({}) — chọn lại video rồi xuất",
            video.display()
        )));
    }

    let video_ms = export::probe_duration_ms(ffprobe, video)?;
    let has_audio = export::probe_has_audio(ffprobe, video)?;

    on_phase("retime");
    let fit_opts = FitOpts { guard_ms: cfg.guard_ms, min_scale: cfg.min_length_scale };
    let retimed = run_retime_stage(project_dir, p, voice, base_scale, video_ms, &fit_opts, tgt)?;

    on_phase("dub");
    let tts_dir = project_dir.join("tts");
    let m = tts_manifest::load(&retimed.tts.manifest_path).ok_or_else(|| {
        PipelineError::Io(format!(
            "không đọc lại được manifest vừa ghi ({})",
            retimed.tts.manifest_path.display()
        ))
    })?;
    let dub_path = tts_dir.join("dub.wav");
    let dub = compose::build_dub_track(&tts_dir, &m, video_ms, &dub_path)?;

    on_phase("encode");
    let sub_dir = project_dir.join("subtitles");
    std::fs::create_dir_all(&sub_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let translated = sub_dir.join(format!("translated.{tgt}.srt"));
    if burn_subs {
        export::prepare_burn_srt(&sub_dir, &translated)?;
    }

    let out_dir = project_dir.join("output");
    std::fs::create_dir_all(&out_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let output_path = out_dir.join("final.mp4");

    let export_opts = export::ExportOpts {
        burn_subs,
        soft_subs,
        has_audio,
        volume_original: cfg.volume_original,
        volume_dub: cfg.volume_dub,
        crf: cfg.crf,
        preset: cfg.preset.clone(),
    };
    let args = export::build_export_args(
        video,
        &dub_path,
        if soft_subs && !burn_subs { Some(translated.as_path()) } else { None },
        &output_path,
        &export_opts,
    );
    export::run_export(ffmpeg, &sub_dir, &args)?;

    on_phase("done");
    Ok(ExportResult { output_path, retime: retimed, dub })
}
