use std::path::PathBuf;

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
    dirs::data_dir().unwrap().join("dichvideo-local")
}

pub fn models_dir() -> PathBuf {
    data_dir().join("models")
}

pub fn projects_dir() -> PathBuf {
    data_dir().join("projects")
}
