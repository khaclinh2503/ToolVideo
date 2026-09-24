// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
pub mod components;
pub mod config;
pub mod error;
pub mod ffmpeg;
pub mod pipeline;
pub mod srt;
pub mod stt;
pub mod translate;

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
