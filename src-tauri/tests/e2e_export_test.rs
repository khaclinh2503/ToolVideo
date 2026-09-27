//! E2E: video → STT → dịch → TTS → xuất mp4 trên engine thật. Bỏ qua mặc định:
//!   $env:DVL_E2E_CLIP="E:\path\clip.mp4"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ ffmpeg/ffprobe/sherpa/piper.

use app_lib::config::{load_config, models_dir, projects_dir};
use app_lib::pipeline::{
    run_export_stage, run_stt_pipeline, run_translate_stage, run_tts_stage, EngineCtx,
};
use app_lib::stt::SttModels;
use app_lib::tts::ScalePlan;
use std::path::Path;
use std::process::Command;

fn ffprobe_ra(ffprobe: &Path, args: &[&str], file: &Path) -> String {
    let out = Command::new(ffprobe).args(args).arg(file).output().unwrap();
    assert!(out.status.success(), "ffprobe lỗi: {}", String::from_utf8_lossy(&out.stderr));
    String::from_utf8_lossy(&out.stdout).trim().to_string()
}

/// Đỉnh âm của file, dBFS. `astats` in ra `Peak level dB: -3.21`.
fn dinh_am_dbfs(ffmpeg: &Path, file: &Path) -> f64 {
    let out = Command::new(ffmpeg)
        .args(["-hide_banner", "-nostats", "-i"])
        .arg(file)
        .args(["-af", "astats=measure_overall=Peak_level:measure_perchannel=none", "-f", "null", "-"])
        .output()
        .unwrap();
    let err = String::from_utf8_lossy(&out.stderr).to_string();
    for line in err.lines() {
        if let Some(v) = line.split("Peak level dB:").nth(1) {
            if let Ok(x) = v.trim().parse::<f64>() {
                return x;
            }
        }
    }
    panic!("không tìm thấy 'Peak level dB' trong đầu ra astats:\n{err}");
}

fn chay(burn: bool, soft: bool, ten: &str) {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let lang = std::env::var("DVL_E2E_LANG").unwrap_or_else(|_| "zh".into());
    let m = models_dir();
    let ffmpeg = m.join("ffmpeg").join("ffmpeg.exe");
    let ffprobe = m.join("ffmpeg").join("ffprobe.exe");

    let ctx = EngineCtx {
        ffmpeg: ffmpeg.clone(),
        sherpa: m.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"),
        models: SttModels {
            sense_voice: m.join("sherpa").join("sense-voice.onnx"),
            tokens: m.join("sherpa").join("tokens.txt"),
            vad: m.join("sherpa").join("vad-model.onnx"),
        },
    };

    let project = projects_dir().join(format!("e2e-export-{ten}-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();
    println!("dự án: {}", project.display());

    let stt = run_stt_pipeline(&ctx, Path::new(&clip), &project, &lang)
        .unwrap_or_else(|e| panic!("STT lỗi: {e}"));
    assert!(stt.cue_count > 0);

    let cfg = load_config();
    let tp = app_lib::translate::make_provider("google_free", &cfg.translate).unwrap();
    run_translate_stage(&project, tp.as_ref(), "auto", "vi")
        .unwrap_or_else(|e| panic!("Dịch lỗi: {e}"));

    let p = app_lib::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));
    run_tts_stage(&project, p.as_ref(), &cfg.tts.voice, &ScalePlan::uniform(cfg.tts.length_scale), "vi")
        .unwrap_or_else(|e| panic!("TTS lỗi: {e}"));

    let t0 = std::time::Instant::now();
    let r = run_export_stage(
        &project, &ffmpeg, &ffprobe, Path::new(&clip),
        p.as_ref(), &cfg.tts.voice, cfg.tts.length_scale, "vi",
        &cfg.compose, burn, soft,
        None, // ghi vào thư mục dự án như mặc định
        // Kiểu chữ khác mặc định: chỉ chạy thật mới biết ffmpeg có nuốt nổi
        // chuỗi force_style hay không — test thuần chỉ so được chuỗi với chuỗi.
        Some(app_lib::export::SubStyle {
            font: "Arial".into(),
            size: 28,
            color: "#FFD400".into(),
            outline_color: "#101010".into(),
            outline: 3,
        }),
        &mut |ph| println!("  [{ph}] {:.1}s", t0.elapsed().as_secs_f32()),
    )
    .unwrap_or_else(|e| panic!("Xuất lỗi: {e}"));

    println!(
        "xong {:.1}s — {} câu, {} câu nhanh lại, {} câu chạm trần, {} mẫu bão hoà",
        t0.elapsed().as_secs_f32(), r.dub.placed, r.retime.adjusted, r.retime.capped, r.dub.saturated
    );

    let out = &r.output_path;
    assert!(out.exists(), "không có file đầu ra");
    assert!(std::fs::metadata(out).unwrap().len() > 10_000, "file đầu ra quá nhỏ");

    // Thời lượng lệch dưới 0.5 s so với nguồn
    let d_src: f64 = ffprobe_ra(&ffprobe, &["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1"], Path::new(&clip)).parse().unwrap();
    let d_out: f64 = ffprobe_ra(&ffprobe, &["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1"], out).parse().unwrap();
    assert!((d_src - d_out).abs() < 0.5, "thời lượng lệch: nguồn {d_src}s, xuất {d_out}s");

    // Đúng số luồng
    let kinds = ffprobe_ra(&ffprobe, &["-v","error","-show_entries","stream=codec_type","-of","csv=p=0"], out);
    println!("luồng: {kinds:?}");
    assert!(kinds.contains("video"));
    assert!(kinds.contains("audio"));
    if soft && !burn {
        assert!(kinds.contains("subtitle"), "chọn phụ đề mềm mà không có luồng subtitle");

        let lang = ffprobe_ra(&ffprobe, &["-v","error","-select_streams","s:0",
            "-show_entries","stream_tags=language","-of","csv=p=0"], out);
        assert_eq!(lang, "vie", "thiếu thẻ ngôn ngữ trên luồng phụ đề");

        let n = ffprobe_ra(&ffprobe, &["-v","error","-select_streams","s:0",
            "-count_frames","-show_entries","stream=nb_read_frames","-of","csv=p=0"], out);
        assert!(n.parse::<u32>().unwrap_or(0) > 0, "luồng phụ đề rỗng");
    }
    if burn {
        assert!(!kinds.contains("subtitle"), "burn thì không kèm luồng subtitle");
        // Nhánh burn chỉ kiểm HÌNH DẠNG (không có luồng subtitle riêng, video
        // đã mã hoá lại). Không có assertion nào ở đây chứng minh phụ đề thật
        // sự được VẼ lên hình — phân biệt một khung hình có chữ với một khung
        // hình mà filter `subtitles` âm thầm lỗi cần soi pixel, ngoài phạm vi
        // của phép kiểm này.
    }

    // Không vỡ tiếng, VÀ có tiếng lồng thật (không phải im lặng/pass-through).
    // Tiếng gốc đơn độc bị hạ còn 0.18 = -14.9 dBFS; bất kỳ cue nào đủ to để
    // limiter phải ghìm sẽ neo đỉnh quanh -1.0 dBFS (xem limit=0.89 ở
    // export.rs) — biên ~6 dB mỗi phía quanh mốc -6 dB, không phụ thuộc nội
    // dung dịch của ngày hôm đó.
    let peak = dinh_am_dbfs(&ffmpeg, out);
    println!("đỉnh âm: {peak} dBFS");
    assert!(peak <= 0.0, "âm thanh bị cắt đỉnh: {peak} dBFS");
    assert!(peak > -6.0, "không nghe thấy tiếng lồng trong bản xuất: {peak} dBFS");
    assert!(r.dub.placed > 0, "không cue nào được đặt vào dải tiếng dịch");
}

#[test]
#[ignore]
fn e2e_xuat_nhanh_kem_phu_de_mem() {
    chay(false, true, "soft");
}

#[test]
#[ignore]
fn e2e_xuat_burn_phu_de() {
    chay(true, false, "burn");
}
