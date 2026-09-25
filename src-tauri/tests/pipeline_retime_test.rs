use app_lib::error::PipelineError;
use app_lib::pipeline::{run_retime_stage, run_tts_stage};
use app_lib::retime::FitOpts;
use app_lib::tts::{ScalePlan, TtsJob, TtsProvider};
use std::cell::RefCell;
use std::path::Path;

/// Provider giả có độ dài phụ thuộc `length_scale`: mỗi cue dài
/// `base_ms[index-1] × length_scale`. Đó là cách duy nhất để kiểm rằng lượt 2
/// thật sự rút ngắn giọng chứ không chỉ ghi một con số khác vào manifest.
struct ScaledTts {
    base_ms: Vec<u64>,
    generated: RefCell<Vec<(usize, f32)>>,
}

impl ScaledTts {
    fn new(base_ms: Vec<u64>) -> Self {
        ScaledTts { base_ms, generated: RefCell::new(Vec::new()) }
    }
    fn generated(&self) -> Vec<(usize, f32)> {
        self.generated.borrow().clone()
    }
}

impl TtsProvider for ScaledTts {
    fn id(&self) -> &'static str { "scaled" }
    fn sample_rate(&self) -> u32 { 1000 } // 1 mẫu = 1 ms, dễ đối chiếu
    fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError> {
        for j in jobs {
            let base = self.base_ms[j.index - 1];
            let ms = (base as f32 * j.length_scale).round() as usize;
            app_lib::wav::write_pcm16_mono(&j.out, 1000, &vec![0i16; ms]).unwrap();
            self.generated.borrow_mut().push((j.index, j.length_scale));
            on_done(j.index);
        }
        Ok(())
    }
}

fn write_translated(dir: &Path, cues: &[(&str, u64, u64)]) {
    let sub = dir.join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let segs: Vec<app_lib::srt::Segment> = cues
        .iter()
        .map(|(t, a, b)| app_lib::srt::Segment { start_ms: *a, end_ms: *b, text: t.to_string() })
        .collect();
    std::fs::write(sub.join("translated.vi.srt"), app_lib::srt::write_srt(&segs)).unwrap();
}

fn manifest_of(dir: &Path) -> serde_json::Value {
    serde_json::from_str(&std::fs::read_to_string(dir.join("tts/manifest.json")).unwrap()).unwrap()
}

#[test]
fn chi_sinh_lai_cue_tran_va_ghi_toc_do_moi_vao_manifest() {
    let dir = tempfile::tempdir().unwrap();
    // cue 1 ở 0, cue 2 ở 5000; video dài 10000
    // cue 1: boundary 5000, budget 5000-0-80 = 4920, giọng gốc 6000 ⇒ 4920/6000 = 0.82
    // cue 2: boundary 10000, budget 4920, giọng gốc 2000 ⇒ vừa, giữ 1.0
    write_translated(dir.path(), &[("Câu dài", 0, 3000), ("Câu ngắn", 5000, 6000)]);

    let p1 = ScaledTts::new(vec![6000, 2000]);
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();
    let m1 = manifest_of(dir.path());
    assert_eq!(m1["segments"][0]["duration_ms"].as_u64().unwrap(), 6000);

    let p2 = ScaledTts::new(vec![6000, 2000]);
    let r = run_retime_stage(dir.path(), &p2, "v", 1.0, 10_000, &FitOpts::default(), "vi").unwrap();

    assert_eq!(r.adjusted, 1, "chỉ cue 1 đổi tốc độ");
    assert_eq!(r.capped, 0);
    assert_eq!(r.tts.generated, 1, "chỉ cue 1 được sinh lại");
    assert_eq!(r.tts.cached, 1, "cue 2 dùng lại wav cũ");
    assert_eq!(p2.generated(), vec![(1, 0.82)]);

    let m2 = manifest_of(dir.path());
    assert!((m2["segments"][0]["length_scale"].as_f64().unwrap() - 0.82).abs() < 1e-6);
    assert_eq!(m2["segments"][0]["duration_ms"].as_u64().unwrap(), 4920,
        "giọng mới phải vừa đúng ngân sách");
    assert!((m2["segments"][1]["length_scale"].as_f64().unwrap() - 1.0).abs() < 1e-6);
    assert_eq!(m2["segments"][1]["duration_ms"].as_u64().unwrap(), 2000);
}

#[test]
fn cue_cuoi_lay_do_dai_video_lam_ranh_gioi() {
    let dir = tempfile::tempdir().unwrap();
    // một cue duy nhất ở 0; video 3000 ⇒ budget 2920, giọng gốc 5840 ⇒ 0.5 ⇒ chạm trần 0.6
    write_translated(dir.path(), &[("Chỉ một câu", 0, 1000)]);

    let p1 = ScaledTts::new(vec![5840]);
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = ScaledTts::new(vec![5840]);
    let r = run_retime_stage(dir.path(), &p2, "v", 1.0, 3000, &FitOpts::default(), "vi").unwrap();

    assert_eq!(r.adjusted, 1);
    assert_eq!(r.capped, 1, "đọc nhanh hết cỡ vẫn không vừa");
    assert_eq!(p2.generated(), vec![(1, 0.6)]);
}

#[test]
fn khong_doi_gi_thi_khong_sinh_lai_cue_nao() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("A", 0, 1000), ("B", 5000, 6000)]);

    let p1 = ScaledTts::new(vec![1000, 1000]);
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = ScaledTts::new(vec![1000, 1000]);
    let r = run_retime_stage(dir.path(), &p2, "v", 1.0, 10_000, &FitOpts::default(), "vi").unwrap();

    assert_eq!(r.adjusted, 0);
    assert_eq!(r.capped, 0);
    assert_eq!(r.tts.generated, 0);
    assert_eq!(r.tts.cached, 2);
    assert!(p2.generated().is_empty());
}

#[test]
fn chua_chay_long_tieng_thi_bao_loi_ro_rang() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("A", 0, 1000)]);

    let p = ScaledTts::new(vec![1000]);
    let e = run_retime_stage(dir.path(), &p, "v", 1.0, 5000, &FitOpts::default(), "vi").unwrap_err();
    let msg = e.to_string();
    assert!(msg.contains("Lồng tiếng"), "thông báo phải chỉ ra bước còn thiếu: {msg}");
}
