use crate::{
    components::ComponentSpec,
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

/// Documented public download sources for the STT toolchain (sherpa-onnx +
/// SenseVoice + silero-vad + ffmpeg). This is documentation only for now:
/// `run_stt` does NOT call `ensure_component` — sha256 checksums are unknown
/// without actually downloading multi-GB artifacts, so auto-provisioning is
/// deferred to a follow-up task. Users must place the files manually under
/// `config::models_dir()` at the fixed relative paths used in `run_stt`.
// TODO(follow-up): fill sha256 + wire auto-download via components::ensure_component.
pub fn documented_components() -> [ComponentSpec; 4] {
    [
        ComponentSpec {
            id: "sherpa".into(),
            url: "https://github.com/k2-fsa/sherpa-onnx/releases".into(),
            sha256: String::new(),
            unpack: true,
        },
        ComponentSpec {
            id: "sense-voice".into(),
            url: "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17".into(),
            sha256: String::new(),
            unpack: true,
        },
        ComponentSpec {
            id: "silero-vad".into(),
            url: "https://github.com/snakers4/silero-vad".into(),
            sha256: String::new(),
            unpack: false,
        },
        ComponentSpec {
            id: "ffmpeg".into(),
            url: "https://www.gyan.dev/ffmpeg/builds/".into(),
            sha256: String::new(),
            unpack: true,
        },
    ]
}

fn require_path(p: PathBuf) -> Result<PathBuf, String> {
    if p.exists() {
        Ok(p)
    } else {
        Err(format!(
            "Model chưa cài: {}. Hãy đặt ffmpeg, sherpa-onnx, SenseVoice và silero-VAD (vad-model.onnx) vào {}. \
             Các file cần có: ffmpeg/ffmpeg.exe, sherpa/sherpa-onnx-vad-with-offline-asr.exe, sherpa/sense-voice.onnx, \
             sherpa/tokens.txt, sherpa/vad-model.onnx.",
            p.display(),
            models_dir().display()
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
