use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::error::PipelineError;

pub mod stt_defaults {
    pub const VAD_THRESHOLD: f32 = 0.25;
    pub const MIN_SILENCE: f32 = 0.20;
    pub const MIN_SPEECH: f32 = 0.10;
    pub const MAX_SPEECH: f32 = 5.0;
    pub const USE_ITN: u8 = 1;
    pub const NUM_THREADS: u32 = 4;
    pub const SAMPLE_RATE: u32 = 16000;
}

pub fn data_dir() -> PathBuf {
    dirs::data_dir()
        .expect("Không xác định được thư mục dữ liệu người dùng (APPDATA)")
        .join("dichvideo-local")
}

pub fn models_dir() -> PathBuf {
    data_dir().join("models")
}

pub fn projects_dir() -> PathBuf {
    data_dir().join("projects")
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct AppConfig {
    #[serde(default)]
    pub translate: TranslateConfig,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TranslateConfig {
    pub default_provider: String,
    pub target_lang: String,
    #[serde(default)]
    pub openai: OpenAiConfig,
}

impl Default for TranslateConfig {
    fn default() -> Self {
        Self {
            default_provider: "google_free".into(),
            target_lang: "vi".into(),
            openai: OpenAiConfig::default(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OpenAiConfig {
    pub base_url: String,
    pub api_key: String,
    pub model: String,
}

impl Default for OpenAiConfig {
    fn default() -> Self {
        Self {
            base_url: "https://api.openai.com/v1".into(),
            api_key: String::new(),
            model: "gpt-4o-mini".into(),
        }
    }
}

impl std::fmt::Debug for OpenAiConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("OpenAiConfig")
            .field("base_url", &self.base_url)
            .field("api_key", &"***")
            .field("model", &self.model)
            .finish()
    }
}

pub fn config_path() -> PathBuf {
    data_dir().join("config.json")
}

pub fn parse_config_or_default(text: &str) -> AppConfig {
    serde_json::from_str(text).unwrap_or_else(|e| {
        eprintln!("config.json hỏng, dùng mặc định: {e}");
        AppConfig::default()
    })
}

pub fn load_config() -> AppConfig {
    match std::fs::read_to_string(config_path()) {
        Ok(t) => parse_config_or_default(&t),
        Err(_) => AppConfig::default(),
    }
}

pub fn save_config(cfg: &AppConfig) -> Result<(), PipelineError> {
    let p = config_path();
    if let Some(dir) = p.parent() {
        std::fs::create_dir_all(dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let json = serde_json::to_string_pretty(cfg).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::write(&p, json).map_err(|e| PipelineError::Io(e.to_string()))
}
