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
        .setup(|app| {
            // Khai phạm vi asset protocol LÚC CHẠY, theo đúng thư mục dữ liệu
            // thật của app.
            //
            // Không dùng biến `$APPDATA` trong `tauri.conf.json`: Tauri giải nó
            // thành `dirs::data_dir()/<identifier>` (xem `PathResolver::app_data_dir`),
            // tức `%APPDATA%\com.dichvideo.local`, trong khi `config::data_dir()`
            // của dự án là `%APPDATA%\dichvideo-local`. Hai đường khác nhau, nên
            // scope khai trong config KHÔNG BAO GIỜ khớp và mọi yêu cầu phát
            // audio đều bị từ chối im lặng — đó là lý do nghe thử cue không phát
            // được suốt từ M6, mà không ai biết vì bước bấm-nút-nghe chưa từng
            // được làm.
            //
            // Khai lúc chạy còn đúng cả khi người dùng có AppData bị chuyển
            // hướng (roaming profile), thứ mà một hằng số trong config không
            // thể theo kịp.
            use tauri::Manager;
            let scope = app.asset_protocol_scope();
            let data = crate::config::data_dir();
            for d in [data.join("projects"), data.join("demo")] {
                std::fs::create_dir_all(&d).ok();
                if let Err(e) = scope.allow_directory(&d, true) {
                    eprintln!("không khai được phạm vi asset cho {}: {e}", d.display());
                }
            }
            Ok(())
        })
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
            commands::preview_voice,
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
