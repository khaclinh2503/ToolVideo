//! E2E: video → STT → dịch → TTS → xuất mp4 trên engine thật. Bỏ qua mặc định:
//!   $env:DVL_E2E_CLIP="E:\path\clip.mp4"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ ffmpeg/ffprobe/sherpa/piper.

mod common;

use app_lib::config::{load_config, models_dir};
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

    let _giu = common::DuAnTam::moi(&format!("e2e-export-{ten}"));
    let project = _giu.duong_dan().to_path_buf();
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
        &app_lib::config::WatermarkConfig::default(),
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
        // đã mã hoá lại). Không assertion nào ở ĐÂY chứng minh phụ đề thật sự
        // được VẼ lên hình; việc đó do kieu_chu_that_test lo, bằng cách dựng
        // khung hình rồi đòi hai kiểu chữ khác nhau phải ra hai ảnh khác nhau.
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

// ============================================================================
// E2E logo: ffmpeg THẬT chạy nhánh overlay, KHÔNG cần DVL_E2E_CLIP.
//
// Nguồn (video nền + logo + dải "dub") đều dựng bằng chính ffmpeg qua `lavfi`,
// giống cách e2e_vieneu_atempo_test.rs dựng sine wave — không cần một file clip
// nào của người dùng. Gọn bằng đó nên bỏ qua mặc định vẫn theo đúng khuôn của
// atempo test: PANIC nếu quên đặt biến môi trường, không lặng lẽ return, để
// một lần chạy --ignored quên bật cờ không bị hiểu lầm là "đã kiểm mà xanh".
//
//   $env:DVL_E2E_WATERMARK="1"
//   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test -- --ignored --nocapture watermark
// ============================================================================

fn doi_watermark() {
    assert_eq!(
        std::env::var("DVL_E2E_WATERMARK").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_WATERMARK=1 để chạy ffmpeg thật cho nhánh logo"
    );
}

/// Nền xanh dương đặc, không có luồng tiếng — đúng nhánh "video câm" mà
/// `has_audio=false` xử lý trong `build_filter_complex`.
fn dung_nen_xanh(ffmpeg: &Path, dich: &Path, w: u32, h: u32, giay: f32) {
    let out = Command::new(ffmpeg)
        .args(["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i"])
        .arg(format!("color=c=blue:s={w}x{h}:d={giay}:r=5"))
        .args(["-c:v", "libx264", "-crf", "0", "-preset", "ultrafast", "-pix_fmt", "yuv420p"])
        .arg(dich)
        .output()
        .expect("chạy được ffmpeg");
    assert!(out.status.success(), "dựng nền lỗi: {}", String::from_utf8_lossy(&out.stderr));
}

/// Logo đỏ đặc, vuông, không kênh alpha — `format=rgba` trong filtergraph phải
/// tự thêm alpha=1.0 rồi `colorchannelmixer` mới nhân độ mờ được (xem chú
/// thích ở build_filter_complex).
fn dung_logo_do(ffmpeg: &Path, dich: &Path, size: u32) {
    let out = Command::new(ffmpeg)
        .args(["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i"])
        .arg(format!("color=c=red:s={size}x{size}"))
        .args(["-frames:v", "1"])
        .arg(dich)
        .output()
        .expect("chạy được ffmpeg");
    assert!(out.status.success(), "dựng logo lỗi: {}", String::from_utf8_lossy(&out.stderr));
}

/// Dải "dub" câm — chỉ cần tồn tại để khớp input `1` mà `build_export_args`
/// luôn giả định có; nội dung tiếng không phải chuyện phép kiểm này quan tâm.
fn dung_dub_cam(ffmpeg: &Path, dich: &Path, giay: f32) {
    let out = Command::new(ffmpeg)
        .args(["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i"])
        .arg(format!("anullsrc=r=48000:cl=mono:d={giay}"))
        .args(["-c:a", "pcm_s16le"])
        .arg(dich)
        .output()
        .expect("chạy được ffmpeg");
    assert!(out.status.success(), "dựng dub lỗi: {}", String::from_utf8_lossy(&out.stderr));
}

/// Lấy 1 pixel RGB (góc trên-trái của một ô 2×2) của khung hình đầu, bằng
/// `crop=2:2:x:y` + rawvideo — không kéo thêm crate ảnh nào chỉ để đọc vài
/// byte. `crop=1:1` bị chính ffmpeg từ chối ("Invalid too big or non positive
/// size for width '0'"): filter crop làm tròn kích thước xuống số chẵn cho
/// khớp lấy mẫu màu yuv420p, và 1 làm tròn xuống 0 — đo thật ra lỗi này trước
/// khi đổi sang 2×2.
fn pixel_rgb(ffmpeg: &Path, file: &Path, x: u32, y: u32) -> (u8, u8, u8) {
    let out = Command::new(ffmpeg)
        .args(["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i"])
        .arg(file)
        .args([
            "-vf", &format!("crop=2:2:{x}:{y}"),
            "-frames:v", "1",
            "-f", "rawvideo",
            "-pix_fmt", "rgb24",
            "-",
        ])
        .output()
        .expect("chạy được ffmpeg");
    assert!(out.status.success(), "lấy pixel ({x},{y}) lỗi: {}", String::from_utf8_lossy(&out.stderr));
    assert_eq!(out.stdout.len(), 12, "phải ra đúng ô 2x2 RGB (12 byte), nhận {} byte", out.stdout.len());
    (out.stdout[0], out.stdout[1], out.stdout[2])
}

fn la_do(p: (u8, u8, u8)) -> bool {
    p.0 > 150 && p.1 < 100 && p.2 < 100
}
fn la_xanh_duong(p: (u8, u8, u8)) -> bool {
    p.2 > 150 && p.0 < 100 && p.1 < 100
}

/// Dựng nền+logo+dub bằng ffmpeg thật, chạy ĐÚNG `build_export_args` +
/// `run_export` (chỗ pipeline gọi khi xuất có logo), rồi soi 2 điểm ảnh: một
/// bên trong vùng logo (phải đỏ) và một ở góc đối diện (phải vẫn xanh dương —
/// không dính logo). Kiểm ở HAI góc khác nhau nên một vị trí đóng cứng sẽ làm
/// một trong hai lượt đỏ.
fn chay_mot_goc(corner: &str, video_w: u32, video_h: u32, size_pct: u32, margin_pct: u32) {
    doi_watermark();
    let ffmpeg = models_dir().join("ffmpeg").join("ffmpeg.exe");
    let d = tempfile::tempdir().unwrap();

    let video = d.path().join("nen.mp4");
    let logo = d.path().join("logo.png");
    let dub = d.path().join("dub.wav");
    let out = d.path().join("out.mp4");

    dung_nen_xanh(&ffmpeg, &video, video_w, video_h, 1.0);
    dung_logo_do(&ffmpeg, &logo, 80);
    dung_dub_cam(&ffmpeg, &dub, 1.0);

    let wm = app_lib::export::Watermark::moi(corner, video_w, size_pct, margin_pct, 1.0);
    // Logo vuông 80x80 nguồn ⇒ scale=W:-1 giữ nguyên vuông, nên logo_h_px ==
    // logo_w_px — cần biết để tính điểm lấy mẫu "chắc chắn nằm trong logo".
    let logo_w = wm.logo_w_px;
    let margin = wm.margin_px;

    let opts = app_lib::export::ExportOpts {
        burn_subs: false,
        soft_subs: false,
        has_audio: false,
        volume_original: 0.18,
        volume_dub: 1.0,
        crf: 0,
        preset: "ultrafast".into(),
        style: None,
        watermark: Some(wm),
    };
    let args = app_lib::export::build_export_args(&video, &dub, None, Some(&logo), &out, &opts);
    app_lib::export::run_export(&ffmpeg, d.path(), &args)
        .unwrap_or_else(|e| panic!("xuất lỗi ({corner}): {e}"));
    assert!(out.exists(), "không có file đầu ra ({corner})");

    // Toạ độ góc: xem bảng ở Watermark::overlay_xy. Lùi vào giữa logo (offset
    // logo_w/2) để không ăn biên nén; lùi 10px từ mép khung cho góc đối diện.
    let (x_trong, y_trong) = match corner {
        "tl" => (margin + logo_w / 2, margin + logo_w / 2),
        "tr" => (video_w - margin - logo_w / 2, margin + logo_w / 2),
        "bl" => (margin + logo_w / 2, video_h - margin - logo_w / 2),
        _ => (video_w - margin - logo_w / 2, video_h - margin - logo_w / 2),
    };
    let (x_doi, y_doi) = match corner {
        "tl" => (video_w - 10, video_h - 10),
        "tr" => (10, video_h - 10),
        "bl" => (video_w - 10, 10),
        _ => (10, 10),
    };

    let trong = pixel_rgb(&ffmpeg, &out, x_trong, y_trong);
    let doi = pixel_rgb(&ffmpeg, &out, x_doi, y_doi);
    println!("góc {corner}: trong logo {trong:?}, góc đối diện {doi:?}");

    assert!(la_do(trong), "góc {corner}: điểm ({x_trong},{y_trong}) phải là logo đỏ, nhận {trong:?}");
    assert!(
        la_xanh_duong(doi),
        "góc {corner}: điểm đối diện ({x_doi},{y_doi}) phải vẫn là nền xanh dương (không dính logo), nhận {doi:?}"
    );
}

#[test]
#[ignore]
fn e2e_logo_dat_dung_goc_tren_trai() {
    chay_mot_goc("tl", 640, 360, 25, 5);
}

#[test]
#[ignore]
fn e2e_logo_dat_dung_goc_duoi_phai() {
    chay_mot_goc("br", 640, 360, 25, 5);
}

/// Bằng chứng gián tiếp: `probe_video_size` không chỉ đúng trên JSON giả (xem
/// `export_args_test.rs`) mà còn đúng khi hỏi ffprobe THẬT một file có ma trận
/// xoay thật. Dựng bằng `-display_rotation` (input option) rồi remux `-c copy`
/// — cách duy nhất quan sát được ghi ra side_data trên bản ffprobe/ffmpeg đi
/// kèm app, xem chú thích ở `probe_video_size`.
#[test]
#[ignore]
fn e2e_probe_video_size_doi_cho_khi_video_xoay() {
    doi_watermark();
    let ffmpeg = models_dir().join("ffmpeg").join("ffmpeg.exe");
    let ffprobe = models_dir().join("ffmpeg").join("ffprobe.exe");
    let d = tempfile::tempdir().unwrap();

    let ngang = d.path().join("ngang.mp4");
    dung_nen_xanh(&ffmpeg, &ngang, 1920, 1080, 0.5);

    // Không xoay: giữ nguyên 1920x1080.
    let (w, h) = app_lib::export::probe_video_size(&ffprobe, &ngang)
        .unwrap_or_else(|| panic!("không probe được video không xoay"));
    assert_eq!((w, h), (1920, 1080), "video không xoay phải giữ nguyên kích thước coded");

    // Gắn ma trận xoay -90° (CCW) khi remux — đúng thứ ffprobe hiện đại báo và
    // đúng thứ ffmpeg autorotate khi giải mã (đã tự tay decode-so-khung-hình
    // để xác nhận trước khi viết test này — xem báo cáo kèm).
    let xoay = d.path().join("xoay.mp4");
    let out = Command::new(&ffmpeg)
        .args(["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-display_rotation:v", "-90", "-i"])
        .arg(&ngang)
        .args(["-c", "copy"])
        .arg(&xoay)
        .output()
        .expect("chạy được ffmpeg");
    assert!(out.status.success(), "gắn ma trận xoay lỗi: {}", String::from_utf8_lossy(&out.stderr));

    let (w2, h2) = app_lib::export::probe_video_size(&ffprobe, &xoay)
        .unwrap_or_else(|| panic!("không probe được video đã xoay"));
    assert_eq!(
        (w2, h2),
        (1080, 1920),
        "video coded 1920x1080 kèm ma trận xoay -90° phải báo về (1080,1920) — kích thước SAU autorotate, đúng cái filter chain thấy"
    );
}
