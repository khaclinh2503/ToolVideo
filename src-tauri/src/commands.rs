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
             Các file cần có: ffmpeg/ffmpeg.exe, sherpa/sherpa-onnx-offline.exe, sherpa/sense-voice.onnx, \
             sherpa/tokens.txt, sherpa/vad-model.onnx.",
            p.display(),
            models_dir().display()
        ))
    }
}

fn resolve_engine_ctx() -> Result<EngineCtx, String> {
    let md = models_dir();
    let ffmpeg = require_path(md.join("ffmpeg").join("ffmpeg.exe"))?;
    let sherpa = require_path(md.join("sherpa").join("sherpa-onnx-offline.exe"))?;
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
    let ctx = resolve_engine_ctx()?;
    let video = Path::new(&video_path);

    let project_dir = projects_dir().join(uuid::Uuid::new_v4().to_string());
    std::fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;

    let result = run_stt_pipeline(&ctx, video, &project_dir, &lang)
        .map_err(|e| e.to_string())?;

    Ok(SttResultDto {
        srt_path: result.srt_path.display().to_string(),
        cue_count: result.cue_count,
    })
}
