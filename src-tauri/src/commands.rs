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
