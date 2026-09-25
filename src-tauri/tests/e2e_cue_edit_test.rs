//! E2E: sửa một cue rồi nghe thử trên Piper thật. Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_CLIP="<path.mp4>"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_cue_edit_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ engine.

use app_lib::config::{load_config, models_dir, projects_dir};
use app_lib::cues;
use app_lib::pipeline::{run_stt_pipeline, run_translate_stage, run_tts_stage, EngineCtx};
use app_lib::retime::{FitOpts, MIN_LENGTH_SCALE};
use app_lib::stt::SttModels;
use app_lib::tts::ScalePlan;
use std::path::Path;

fn sha256_file(p: &Path) -> String {
    use sha2::{Digest, Sha256};
    let b = std::fs::read(p).unwrap();
    let mut h = Sha256::new();
    h.update(&b);
    format!("{:x}", h.finalize())
}

#[test]
#[ignore]
fn sua_mot_cue_roi_nghe_thu_chi_doi_wav_cua_cue_do() {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let lang = std::env::var("DVL_E2E_LANG").unwrap_or_else(|_| "auto".into());
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
    let project = projects_dir().join(format!("e2e-cue-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();
    println!("dự án: {}", project.display());

    run_stt_pipeline(&ctx, Path::new(&clip), &project, &lang).unwrap();
    let cfg = load_config();
    let tp = app_lib::translate::make_provider("google_free", &cfg.translate).unwrap();
    run_translate_stage(&project, tp.as_ref(), "auto", "vi").unwrap();
    let p = app_lib::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &m).unwrap();
    run_tts_stage(&project, p.as_ref(), &cfg.tts.voice, &ScalePlan::uniform(cfg.tts.length_scale), "vi").unwrap();

    let truoc = cues::list(&project, "vi").unwrap();
    assert!(truoc.len() >= 2, "clip phải có ít nhất 2 cue để so sánh");
    assert!(truoc.iter().all(|c| !c.stale), "sau khi lồng tiếng thì không cue nào lệch");

    // Cue rỗng lời không có wav — STT thỉnh thoảng sinh ra, nên lọc theo index
    // thay vì unwrap mù.
    let hash_of = |cs: &[app_lib::cues::CueView]| -> Vec<(usize, String)> {
        cs.iter()
            .filter_map(|c| c.audio_path.as_ref().map(|p| (c.index, sha256_file(p))))
            .collect()
    };
    let hash_truoc = hash_of(&truoc);
    assert!(
        hash_truoc.iter().any(|(i, _)| *i == 1),
        "cue 1 phải có giọng đọc thì mới so sánh được"
    );

    // Sửa cue 1, kiểm nó thành lệch
    cues::save(&project, "vi", 1, "Đây là câu đã sửa để kiểm tra.", truoc[0].start_ms, truoc[0].end_ms).unwrap();
    assert!(cues::list(&project, "vi").unwrap()[0].stale);

    // Nghe thử ⇒ sinh lại đúng cue đó và hết lệch
    let r = cues::preview(&project, p.as_ref(), &cfg.tts.voice, cfg.tts.length_scale, "vi", 1, None, &FitOpts::default()).unwrap();
    println!("nghe thử: {} ms, tốc độ {}", r.duration_ms, r.length_scale);
    assert!(r.duration_ms > 0);

    let sau = cues::list(&project, "vi").unwrap();
    assert!(!sau[0].stale, "nghe thử xong thì cue phải hết lệch");

    let hash_sau = hash_of(&sau);
    for (i, h_truoc) in &hash_truoc {
        let h_sau = hash_sau
            .iter()
            .find(|(j, _)| j == i)
            .map(|(_, h)| h)
            .unwrap_or_else(|| panic!("cue {i} mất wav sau khi nghe thử"));
        if *i == 1 {
            assert_ne!(h_truoc, h_sau, "wav của cue vừa sửa phải đổi");
        } else {
            assert_eq!(h_truoc, h_sau, "wav của cue {i} không được đụng tới");
        }
    }

    // F3: lượt vừa rồi rơi vào ca vừa khung (budget mặc định > độ dài đo được)
    // nên chỉ chạy một lượt tổng hợp — đường "ép tốc độ" rủi ro nhất chưa từng
    // chạm Piper thật. Ép ngân sách nhỏ hơn hẳn `r.duration_ms` đã đo, tính từ
    // đúng số liệu thật của clip (không chép hằng số của ai khác), để buộc
    // lượt hai phải chạy trên engine thật.
    let boundary_ms = sau[1].start_ms;
    let start_ms = sau[0].start_ms;
    let full_gap = boundary_ms.saturating_sub(start_ms);
    let target_budget = r.duration_ms / 2; // ép còn một nửa ⇒ chắc chắn cần lượt hai
    let guard_ms = full_gap.saturating_sub(target_budget);
    let budget = full_gap.saturating_sub(guard_ms);
    let chat = FitOpts { guard_ms, ..FitOpts::default() };
    println!(
        "ép ngân sách: full_gap={full_gap} guard_ms={guard_ms} ngân sách={budget} (đo lượt trước={} ms)",
        r.duration_ms
    );

    let r2 = cues::preview(&project, p.as_ref(), &cfg.tts.voice, cfg.tts.length_scale, "vi", 1, None, &chat).unwrap();
    println!("nghe thử (ép tốc độ, lượt hai bắt buộc): {} ms, tốc độ {}", r2.duration_ms, r2.length_scale);

    assert!(
        r2.length_scale < cfg.tts.length_scale,
        "ngân sách hẹp hơn hẳn độ dài đo được thì phải bị ép chậm lại: {}",
        r2.length_scale
    );
    assert!(
        r2.duration_ms < r.duration_ms,
        "wav sau khi ép phải ngắn hơn wav đo ở tốc độ nền: {} so với {}",
        r2.duration_ms,
        r.duration_ms
    );
    if (r2.length_scale - MIN_LENGTH_SCALE).abs() > 1e-6 {
        // Không chạm trần tốc độ ⇒ phải thực sự vừa đúng ngân sách vừa ép.
        assert!(
            r2.duration_ms <= budget,
            "không chạm trần MIN_LENGTH_SCALE thì phải vừa ngân sách: {} <= {}",
            r2.duration_ms,
            budget
        );
    } else {
        println!("chạm trần MIN_LENGTH_SCALE={MIN_LENGTH_SCALE} — đúng hành vi capped của retime::fit_scale, không phải lỗi");
    }

    let _ = std::fs::remove_dir_all(&project);
}
