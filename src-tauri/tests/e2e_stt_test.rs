//! E2E: chạy pipeline STT thật trên 1 clip. Bỏ qua mặc định; bật bằng:
//!   DVL_E2E_CLIP=<path.mp4> cargo test --test e2e_stt_test -- --ignored --nocapture
//! Yêu cầu 5 file trong config::models_dir() (xem commands::resolve_engine_ctx).

use app_lib::config::{models_dir, projects_dir};
use app_lib::pipeline::{run_stt_pipeline, EngineCtx};
use app_lib::stt::SttModels;
use std::path::Path;

#[test]
#[ignore]
fn e2e_stt_on_clip_writes_srt() {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let lang = std::env::var("DVL_E2E_LANG").unwrap_or_else(|_| "zh".into());
    let m = models_dir();
    let ctx = EngineCtx {
        ffmpeg: m.join("ffmpeg").join("ffmpeg.exe"),
        sherpa: m.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"),
        models: SttModels {
            sense_voice: m.join("sherpa").join("sense-voice.onnx"),
            tokens: m.join("sherpa").join("tokens.txt"),
            vad: m.join("sherpa").join("vad-model.onnx"),
        },
    };
    for p in [&ctx.ffmpeg, &ctx.sherpa, &ctx.models.sense_voice, &ctx.models.tokens, &ctx.models.vad] {
        assert!(p.exists(), "thiếu file: {}", p.display());
    }
    let project = projects_dir().join(format!("e2e-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();

    let t0 = std::time::Instant::now();
    let res = run_stt_pipeline(&ctx, Path::new(&clip), &project, &lang);
    let secs = t0.elapsed().as_secs_f32();

    match res {
        Ok(r) => {
            let srt = std::fs::read_to_string(&r.srt_path).unwrap();
            println!("\n=== E2E OK in {secs:.1}s: {} cue -> {}\n{}", r.cue_count, r.srt_path.display(), srt);
            assert!(r.cue_count > 0, "STT trả 0 cue trên clip có tiếng nói");
        }
        Err(e) => panic!("\n=== E2E FAILED in {secs:.1}s: {e}\n"),
    }
}
