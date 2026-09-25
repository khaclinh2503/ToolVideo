//! Kiểm lại rằng mọi giá trị trong `stt::SRC_LANGS` vẫn được engine chấp nhận.
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_CLIP="<path.mp4>"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_src_lang_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ engine.

use app_lib::config::{models_dir, projects_dir};
use app_lib::pipeline::{run_stt_pipeline, EngineCtx};
use app_lib::stt::{SttModels, SRC_LANGS};
use std::path::Path;

#[test]
#[ignore]
fn src_langs_deu_duoc_engine_chap_nhan() {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let m = models_dir();

    assert!(!SRC_LANGS.is_empty(), "SRC_LANGS rỗng — Step 2 chưa điền");

    for lang in SRC_LANGS {
        let ctx = EngineCtx {
            ffmpeg: m.join("ffmpeg").join("ffmpeg.exe"),
            sherpa: m.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"),
            models: SttModels {
                sense_voice: m.join("sherpa").join("sense-voice.onnx"),
                tokens: m.join("sherpa").join("tokens.txt"),
                vad: m.join("sherpa").join("vad-model.onnx"),
            },
        };
        let project = projects_dir().join(format!("e2e-srclang-{}-{}", lang, uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&project).unwrap();

        let r = run_stt_pipeline(&ctx, Path::new(&clip), &project, lang);
        println!("lang={lang:?} -> {:?}", r.as_ref().map(|x| x.cue_count));
        r.unwrap_or_else(|e| panic!("engine từ chối --sense-voice-language={lang}: {e}"));

        let _ = std::fs::remove_dir_all(&project);
    }
}
