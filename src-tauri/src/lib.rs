// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
pub mod components;
pub mod compose;
pub mod config;
pub mod cues;
pub mod download;
pub mod error;
pub mod export;
pub mod ffmpeg;
pub mod pipeline;
pub mod project;
pub mod pyenv;
pub mod retime;
pub mod srt;
pub mod stt;
pub mod translate;
pub mod tts;
pub mod wav;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::run_stt,
            commands::run_translate,
            commands::get_config,
            commands::save_config,
            commands::ensure_components,
            commands::components_ready,
            commands::download_video,
            commands::translate_contexts,
            commands::tts_voices,
            commands::run_tts,
            commands::run_export,
            commands::list_projects,
            commands::open_project,
            commands::delete_project,
            commands::src_langs,
            commands::list_cues,
            commands::save_cue,
            commands::preview_cue,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
