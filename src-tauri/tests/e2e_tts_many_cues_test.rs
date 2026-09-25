//! E2E: TTS thật với ~120 cue (không qua video/STT) — kiểm chứng việc phục vụ đồng
//! thời stdin/stdout của driver Piper (xem `src/tts/piper.rs`). Một bản trước ghi hết
//! stdin rồi mới đọc stdout: với batch đủ lớn (ống nặc danh trên Windows ~4KB), hai
//! bên chặn lẫn nhau và treo vĩnh viễn, không lỗi, không timeout. Test 2-cue của
//! `e2e_tts_test.rs` không tạo đủ dữ liệu để gặp trường hợp này. Bỏ qua mặc định;
//! bật bằng:
//!   DVL_E2E_TTS_MANY=1 cargo test --test e2e_tts_many_cues_test -- --ignored --nocapture
//! Yêu cầu đã chạy pha A (ensure_components) để có piper.exe + voice cài sẵn.

use app_lib::config::{models_dir, projects_dir};
use app_lib::pipeline::run_tts_stage;
use app_lib::srt::{write_srt, Segment};
use std::path::Path;

const CUE_COUNT: usize = 120;

/// 12 mẫu câu tiếng Việt ngắn, lặp vòng để tạo đủ 120 cue có nội dung khác nhau.
const TEMPLATES: [&str; 12] = [
    "Xin chào buổi sáng.",
    "Hôm nay trời rất đẹp.",
    "Tôi thích xem phim vào cuối tuần.",
    "Cảm ơn bạn đã giúp đỡ.",
    "Chúng ta cùng đi ăn trưa nhé.",
    "Đường phố hôm nay rất đông người.",
    "Bạn có khỏe không?",
    "Tôi vừa mới về đến nhà.",
    "Ngày mai chúng ta có cuộc họp.",
    "Cái này giá bao nhiêu vậy?",
    "Xin lỗi vì đã đến trễ.",
    "Chúc bạn một ngày tốt lành.",
];

fn write_synthetic_translated_srt(project: &Path) {
    let sub = project.join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let segs: Vec<Segment> = (0..CUE_COUNT)
        .map(|i| {
            let text = format!("Câu số {}: {}", i + 1, TEMPLATES[i % TEMPLATES.len()]);
            Segment {
                start_ms: (i as u64) * 1000,
                end_ms: (i as u64) * 1000 + 900,
                text,
            }
        })
        .collect();
    std::fs::write(sub.join("translated.vi.srt"), write_srt(&segs)).unwrap();
}

#[test]
#[ignore]
fn e2e_tts_many_cues_no_deadlock() {
    assert_eq!(
        std::env::var("DVL_E2E_TTS_MANY").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_TTS_MANY=1 để chạy TTS thật với nhiều cue"
    );

    let m = models_dir();
    let cfg = app_lib::config::load_config();
    let tts_cfg = cfg.tts.clone();
    let p = app_lib::tts::make_provider(&tts_cfg.default_provider, &tts_cfg, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));

    // Thư mục dự án thật (không dùng tempfile — file cần còn tồn tại sau khi test
    // chạy xong để nghe thử kiểm tra bằng tai).
    let project = projects_dir().join(format!("e2e-tts-many-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();
    write_synthetic_translated_srt(&project);

    println!("Bắt đầu TTS {CUE_COUNT} cue thật (Piper) — nếu treo, đây là bằng chứng lỗi bế tắc ống stdin/stdout.");
    let t0 = std::time::Instant::now();
    let r = run_tts_stage(&project, p.as_ref(), &tts_cfg.voice, tts_cfg.length_scale, "vi")
        .unwrap_or_else(|e| panic!("TTS lỗi: {e}"));
    let secs = t0.elapsed().as_secs_f32();
    println!(
        "TTS xong {} cue, sinh {} / cache {} trong {:.1}s → {}",
        r.cue_count, r.generated, r.cached, secs, r.manifest_path.display()
    );

    assert_eq!(r.cue_count, CUE_COUNT);
    assert_eq!(r.generated, CUE_COUNT, "lần đầu phải sinh mọi cue");
    assert_eq!(r.cached, 0);

    let man = app_lib::tts::manifest::load(&r.manifest_path).unwrap();
    assert_eq!(man.segments.len(), CUE_COUNT);
    for s in &man.segments {
        let rel = s.audio_path.as_ref().unwrap_or_else(|| panic!("cue {} thiếu audio_path", s.index));
        let wav = project.join("tts").join(rel);
        assert!(wav.exists(), "thiếu {}", wav.display());
        assert!(s.duration_ms > 0, "cue {} có wav rỗng", s.index);
    }

    println!(
        "\nKhông treo — hoàn tất {} cue trong {:.1}s. Nghe thử: {}",
        CUE_COUNT,
        secs,
        project.join("tts").join("segments").display()
    );
}
