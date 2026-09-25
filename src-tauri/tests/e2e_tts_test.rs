//! E2E: video → STT → dịch → TTS trên engine thật. Bỏ qua mặc định; bật bằng:
//!   DVL_E2E_CLIP=<path.mp4> cargo test --test e2e_tts_test -- --ignored --nocapture
//! Yêu cầu đã chạy pha A (ensure_components) để có đủ engine + voice.

use app_lib::config::{load_config, models_dir, projects_dir};
use app_lib::pipeline::{run_stt_pipeline, run_translate_stage, run_tts_stage, EngineCtx};
use app_lib::stt::SttModels;
use std::path::Path;

#[test]
#[ignore]
fn e2e_video_to_voiced_segments() {
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
    let project = projects_dir().join(format!("e2e-tts-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();

    let stt = run_stt_pipeline(&ctx, Path::new(&clip), &project, &lang)
        .unwrap_or_else(|e| panic!("STT lỗi: {e}"));
    println!("STT: {} cue", stt.cue_count);
    assert!(stt.cue_count > 0);

    let cfg = load_config();
    let tp = app_lib::translate::make_provider("google_free", &cfg.translate).unwrap();
    let tr = run_translate_stage(&project, tp.as_ref(), "auto", "vi")
        .unwrap_or_else(|e| panic!("Dịch lỗi: {e}"));
    println!("Dịch: {} cue → {}", tr.cue_count, tr.srt_path.display());

    let tts_cfg = cfg.tts.clone();
    let p = app_lib::tts::make_provider(&tts_cfg.default_provider, &tts_cfg, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));

    let t0 = std::time::Instant::now();
    let r = run_tts_stage(&project, p.as_ref(), &tts_cfg.voice, tts_cfg.length_scale, "vi")
        .unwrap_or_else(|e| panic!("TTS lỗi: {e}"));
    println!(
        "TTS: {} cue, sinh {} / cache {} trong {:.1}s → {}",
        r.cue_count, r.generated, r.cached, t0.elapsed().as_secs_f32(), r.manifest_path.display()
    );

    let man = app_lib::tts::manifest::load(&r.manifest_path).unwrap();
    let voiced: Vec<_> = man.segments.iter().filter(|s| s.audio_path.is_some()).collect();
    assert!(!voiced.is_empty(), "không có cue nào được lồng tiếng");
    for s in &voiced {
        let wav = project.join("tts").join(s.audio_path.as_ref().unwrap());
        assert!(wav.exists(), "thiếu {}", wav.display());
        assert!(s.duration_ms > 0, "cue {} có wav rỗng", s.index);
        println!("  cue {} [{}ms]: {}", s.index, s.duration_ms, s.text);
    }

    // Chạy lại: toàn bộ phải vào cache.
    let r2 = run_tts_stage(&project, p.as_ref(), &tts_cfg.voice, tts_cfg.length_scale, "vi").unwrap();
    assert_eq!(r2.generated, 0, "lần 2 không được sinh lại cue nào");
    assert_eq!(r2.cached, voiced.len());

    println!("\nNghe thử: {}", project.join("tts").join("segments").display());
}
