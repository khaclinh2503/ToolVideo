use crate::{
    config::{models_dir, projects_dir},
    pipeline::{run_stt_pipeline, EngineCtx},
    stt::SttModels,
};
use std::path::{Path, PathBuf};

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SttResultDto {
    pub srt_path: String,
    pub cue_count: usize,
    pub project_dir: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslateResultDto {
    pub srt_path: String,
    pub cue_count: usize,
}

fn require_path(p: PathBuf) -> Result<PathBuf, String> {
    if p.exists() {
        Ok(p)
    } else {
        Err(format!(
            "Model chưa cài: {}. Hãy bấm nút \"Tải bộ công cụ\" để tự động tải và cài đặt.",
            p.display()
        ))
    }
}

fn resolve_engine_ctx() -> Result<EngineCtx, String> {
    let md = models_dir();
    let ffmpeg = require_path(md.join("ffmpeg").join("ffmpeg.exe"))?;
    let sherpa = require_path(md.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"))?;
    let sense_voice = require_path(md.join("sherpa").join("sense-voice.onnx"))?;
    let tokens = require_path(md.join("sherpa").join("tokens.txt"))?;
    let vad = require_path(md.join("sherpa").join("vad-model.onnx"))?;
    Ok(EngineCtx {
        ffmpeg,
        sherpa,
        models: SttModels {
            sense_voice,
            tokens,
            vad,
        },
    })
}

#[tauri::command]
pub async fn run_stt(video_path: String, lang: String) -> Result<SttResultDto, String> {
    let dto = tauri::async_runtime::spawn_blocking(move || -> Result<SttResultDto, String> {
        let ctx = resolve_engine_ctx()?;
        let video = Path::new(&video_path);

        let project_dir = projects_dir().join(uuid::Uuid::new_v4().to_string());
        std::fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;

        let result = run_stt_pipeline(&ctx, video, &project_dir, &lang)
            .map_err(|e| e.to_string())?;

        let cfg = crate::config::load_config();
        let now = crate::project::now_ms();
        crate::project::save(
            &project_dir,
            &crate::project::new_project_meta(video, &lang, &cfg.translate.target_lang, now),
        )
        .map_err(|e| e.to_string())?;

        Ok(SttResultDto {
            srt_path: result.srt_path.display().to_string(),
            cue_count: result.cue_count,
            project_dir: project_dir.display().to_string(),
        })
    })
    .await
    .map_err(|e| e.to_string())??;
    Ok(dto)
}

#[tauri::command]
pub async fn run_translate(
    project_dir: String,
    provider: String,
    src: String,
    tgt: String,
) -> Result<TranslateResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<TranslateResultDto, String> {
        let cfg = crate::config::load_config();
        let p = crate::translate::make_provider(&provider, &cfg.translate).map_err(|e| e.to_string())?;
        let r = crate::pipeline::run_translate_stage(Path::new(&project_dir), p.as_ref(), &src, &tgt)
            .map_err(|e| e.to_string())?;
        // Trim khớp với run_translate_stage: nó đã trim `tgt` trước khi dựng
        // tên file translated.<tgt>.srt, nên metadata phải trim y hệt — nếu
        // không, status() tra theo tên file còn khoảng trắng và has_translation
        // kẹt ở false dù bản dịch đã nằm trên đĩa.
        let tgt_luu = tgt.trim().to_string();
        touch_project(&project_dir, move |m| m.tgt_lang = tgt_luu);
        Ok(TranslateResultDto {
            srt_path: r.srt_path.display().to_string(),
            cue_count: r.cue_count,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub fn get_config() -> crate::config::AppConfig {
    crate::config::load_config()
}

#[tauri::command]
pub fn save_config(cfg: crate::config::AppConfig) -> Result<(), String> {
    crate::config::save_config(&cfg).map_err(|e| e.to_string())
}

/// Danh sách id component chưa cài (dùng cho UI và test; không gọi mạng).
pub fn missing_component_ids(models: &std::path::Path) -> Result<Vec<String>, String> {
    let specs = crate::components::specs().map_err(|e| e.to_string())?;
    Ok(specs
        .into_iter()
        .filter(|s| !crate::components::is_installed(s, models))
        .map(|s| s.id)
        .collect())
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ComponentProgressEvent {
    pub id: String,
    pub phase: &'static str,
    pub done: u64,
    pub total: u64,
}

#[tauri::command]
pub async fn ensure_components(app: tauri::AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        use tauri::Emitter;
        let models = crate::config::models_dir();
        std::fs::create_dir_all(&models).map_err(|e| e.to_string())?;
        crate::components::install_all(&models, &mut |id, p| {
            let ev = match p {
                crate::components::Progress::Download { done, total } => ComponentProgressEvent {
                    id: id.to_string(), phase: "download", done, total,
                },
                crate::components::Progress::Extract => ComponentProgressEvent {
                    id: id.to_string(), phase: "extract", done: 0, total: 0,
                },
                crate::components::Progress::Done => ComponentProgressEvent {
                    id: id.to_string(), phase: "done", done: 0, total: 0,
                },
            };
            let _ = app.emit("component_progress", ev);
        })
        .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TtsResultDto {
    pub manifest_path: String,
    pub cue_count: usize,
    pub generated: usize,
    pub cached: usize,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResultDto {
    pub output_path: String,
    /// Số cue phải đọc nhanh hơn để vừa khung.
    pub adjusted: usize,
    /// Số cue đọc nhanh hết cỡ mà vẫn tràn.
    pub capped: usize,
    pub placed: usize,
    pub truncated: usize,
    pub saturated: usize,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportProgressEvent {
    /// "retime" | "dub" | "encode" | "done"
    pub phase: String,
}

#[tauri::command]
pub async fn run_export(
    app: tauri::AppHandle,
    project_dir: String,
    video_path: String,
    tgt: String,
    burn_subs: bool,
    soft_subs: bool,
) -> Result<ExportResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<ExportResultDto, String> {
        use tauri::Emitter;
        let cfg = crate::config::load_config();
        let md = models_dir();
        let ffmpeg = require_path(md.join("ffmpeg").join("ffmpeg.exe"))?;
        let ffprobe = require_path(md.join("ffmpeg").join("ffprobe.exe"))?;
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &md)
            .map_err(|e| e.to_string())?;

        let r = crate::pipeline::run_export_stage(
            Path::new(&project_dir),
            &ffmpeg,
            &ffprobe,
            Path::new(&video_path),
            p.as_ref(),
            &cfg.tts.voice,
            cfg.tts.length_scale,
            &tgt,
            &cfg.compose,
            burn_subs,
            soft_subs,
            &mut |phase| {
                let _ = app.emit("export_progress", ExportProgressEvent { phase: phase.to_string() });
            },
        )
        .map_err(|e| e.to_string())?;

        touch_project(&project_dir, |_| {});

        Ok(ExportResultDto {
            output_path: r.output_path.display().to_string(),
            adjusted: r.retime.adjusted,
            capped: r.retime.capped,
            placed: r.dub.placed,
            truncated: r.dub.truncated,
            saturated: r.dub.saturated,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn run_tts(project_dir: String, tgt: String) -> Result<TtsResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<TtsResultDto, String> {
        let cfg = crate::config::load_config();
        let models = models_dir();
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &models)
            .map_err(|e| e.to_string())?;
        let r = crate::pipeline::run_tts_stage(
            Path::new(&project_dir),
            p.as_ref(),
            &cfg.tts.voice,
            &crate::tts::ScalePlan::uniform(cfg.tts.length_scale),
            &tgt,
        )
        .map_err(|e| e.to_string())?;
        touch_project(&project_dir, |_| {});
        Ok(TtsResultDto {
            manifest_path: r.manifest_path.display().to_string(),
            cue_count: r.cue_count,
            generated: r.generated,
            cached: r.cached,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummaryDto {
    pub project_dir: String,
    pub video_path: String,
    /// Tên file, để hiển thị — đường dẫn đầy đủ quá dài cho một dòng danh sách.
    pub video_name: String,
    pub src_lang: String,
    pub tgt_lang: String,
    pub updated_at: u64,
    pub has_stt: bool,
    pub has_translation: bool,
    pub has_tts: bool,
    pub has_export: bool,
    pub video_exists: bool,
}

pub fn summary_to_dto(s: &crate::project::ProjectSummary) -> ProjectSummaryDto {
    ProjectSummaryDto {
        project_dir: s.project_dir.display().to_string(),
        video_path: s.meta.video_path.clone(),
        video_name: Path::new(&s.meta.video_path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| s.meta.video_path.clone()),
        src_lang: s.meta.src_lang.clone(),
        tgt_lang: s.meta.tgt_lang.clone(),
        updated_at: s.meta.updated_at,
        has_stt: s.status.has_stt,
        has_translation: s.status.has_translation,
        has_tts: s.status.has_tts,
        has_export: s.status.has_export,
        video_exists: s.status.video_exists,
    }
}

/// Chạm `updated_at` sau khi một giai đoạn chạy xong. Lỗi chỉ ghi ra stderr,
/// không làm hỏng kết quả của giai đoạn — cùng lý do với `project::update` khi
/// không có meta: không được để một dấu thời gian đánh đổ công việc thật.
fn touch_project(project_dir: &str, f: impl FnOnce(&mut crate::project::ProjectMeta)) {
    if let Err(e) = crate::project::update(
        Path::new(project_dir),
        crate::project::now_ms(),
        f,
    ) {
        eprintln!("không cập nhật được project.json: {e}");
    }
}

/// `async` + `spawn_blocking`: `project::status` gọi `Path::exists()` trên
/// `video_path` của từng dự án, và đường dẫn đó có thể là ổ mạng (UNC/ổ đã
/// map) không còn kết nối được — khi đó `exists()` treo tới khi hết timeout
/// SMB. Chạy trên thread pool blocking để không đứng hình cửa sổ chính, cùng
/// khuôn `run_tts` đã dùng trong file này.
#[tauri::command]
pub async fn list_projects() -> Result<Vec<ProjectSummaryDto>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        crate::project::list(&projects_dir())
            .iter()
            .map(summary_to_dto)
            .collect()
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_project(project_dir: String) -> Result<ProjectSummaryDto, String> {
    let dir = Path::new(&project_dir);
    let meta = crate::project::load(dir).ok_or_else(|| {
        format!(
            "Không đọc được dự án ({}) — thiếu hoặc hỏng project.json",
            dir.display()
        )
    })?;
    let status = crate::project::status(dir, &meta);
    Ok(summary_to_dto(&crate::project::ProjectSummary {
        project_dir: dir.to_path_buf(),
        meta,
        status,
    }))
}

#[tauri::command]
pub fn delete_project(project_dir: String) -> Result<(), String> {
    crate::project::delete(&projects_dir(), Path::new(&project_dir)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn src_langs() -> Vec<String> {
    crate::stt::SRC_LANGS.iter().map(|s| s.to_string()).collect()
}
