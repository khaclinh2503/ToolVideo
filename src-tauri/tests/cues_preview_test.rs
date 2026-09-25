use app_lib::cues::{preview, srt_path};
use app_lib::error::PipelineError;
use app_lib::retime::FitOpts;
use app_lib::tts::manifest::{load as load_manifest, save as save_manifest, Manifest, SegmentEntry};
use app_lib::tts::{TtsJob, TtsProvider};
use std::cell::RefCell;
use std::path::Path;

/// Provider giả có độ dài phụ thuộc `length_scale`: `base_ms × length_scale`.
/// Đó là cách duy nhất để kiểm rằng preview thật sự ép tốc độ chứ không chỉ ghi
/// một con số khác vào manifest.
struct ScaledTts {
    base_ms: u64,
    calls: RefCell<Vec<f32>>,
}

impl ScaledTts {
    fn new(base_ms: u64) -> Self {
        ScaledTts { base_ms, calls: RefCell::new(Vec::new()) }
    }
    fn calls(&self) -> Vec<f32> {
        self.calls.borrow().clone()
    }
}

impl TtsProvider for ScaledTts {
    fn id(&self) -> &'static str { "scaled" }
    fn sample_rate(&self) -> u32 { 1000 } // 1 mẫu = 1 ms
    fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError> {
        for j in jobs {
            let ms = (self.base_ms as f32 * j.length_scale).round() as usize;
            app_lib::wav::write_pcm16_mono(&j.out, 1000, &vec![0i16; ms]).unwrap();
            self.calls.borrow_mut().push(j.length_scale);
            on_done(j.index);
        }
        Ok(())
    }
}

fn write_srt(project_dir: &Path, cues: &[(&str, u64, u64)]) {
    let segs: Vec<app_lib::srt::Segment> = cues
        .iter()
        .map(|(t, a, b)| app_lib::srt::Segment { start_ms: *a, end_ms: *b, text: t.to_string() })
        .collect();
    let p = srt_path(project_dir, "vi");
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, app_lib::srt::write_srt(&segs)).unwrap();
}

fn write_manifest(project_dir: &Path, segments: Vec<SegmentEntry>) {
    let m = Manifest { version: 1, provider: "scaled".into(), voice: "v".into(), sample_rate: 1000, segments };
    save_manifest(&project_dir.join("tts").join("manifest.json"), &m).unwrap();
}

fn entry(index: usize, start_ms: u64, text: &str) -> SegmentEntry {
    SegmentEntry {
        index,
        start_ms,
        end_ms: start_ms + 500,
        text: text.to_string(),
        audio_path: Some(format!("segments/cue-{index:04}.wav")),
        cache_key: Some("cu".into()),
        length_scale: 1.0,
        duration_ms: 0,
    }
}

#[test]
fn cue_tran_ngan_sach_thi_ep_toc_do_dung_ti_le() {
    let d = tempfile::tempdir().unwrap();
    // cue 1 ở 0, cue 2 ở 5000 ⇒ ngân sách = 5000 - 0 - 80 = 4920
    write_srt(d.path(), &[("Câu dài", 0, 3000), ("Câu sau", 5000, 6000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu dài"), entry(2, 5000, "Câu sau")]);

    // giọng gốc 6000 ms ⇒ 4920/6000 = 0.82
    let p = ScaledTts::new(6000);
    let r = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap();

    assert_eq!(p.calls(), vec![1.0, 0.82], "lượt 1 đo, lượt 2 ép vừa");
    assert!((r.length_scale - 0.82).abs() < 1e-6);
    assert_eq!(r.duration_ms, 4920);
    assert!(!r.unconstrained);
    assert!(r.audio_path.ends_with("cue-0001.wav"));
}

#[test]
fn cue_vua_khung_chi_tong_hop_mot_lan() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Ngắn", 0, 3000), ("Câu sau", 5000, 6000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Ngắn"), entry(2, 5000, "Câu sau")]);

    let p = ScaledTts::new(1000);
    let r = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap();

    assert_eq!(p.calls(), vec![1.0], "vừa khung thì không tổng hợp lại");
    assert_eq!(r.duration_ms, 1000);
}

#[test]
fn sau_khi_nghe_thu_manifest_khop_lai_voi_srt() {
    let d = tempfile::tempdir().unwrap();
    // manifest đang giữ text cũ và start cũ — đúng trạng thái sau một lần sửa
    write_srt(d.path(), &[("Câu đã sửa", 700, 3000), ("Câu sau", 9000, 9500)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu cũ"), entry(2, 9000, "Câu sau")]);

    let p = ScaledTts::new(1000);
    preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap();

    let m = load_manifest(&d.path().join("tts").join("manifest.json")).unwrap();
    let e = m.segments.iter().find(|e| e.index == 1).unwrap();
    assert_eq!(e.text, "Câu đã sửa", "đây là lời hứa trung tâm của M6");
    assert_eq!(e.start_ms, 700);
    assert_eq!(e.end_ms, 3000);
    assert_eq!(e.duration_ms, 1000);
    assert!(e.cache_key.is_some());
}

#[test]
fn cue_cuoi_khong_co_do_dai_video_thi_khong_rang_buoc() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Chỉ một câu", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Chỉ một câu")]);

    let p = ScaledTts::new(9000);
    let r = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap();

    assert!(r.unconstrained);
    assert_eq!(p.calls(), vec![1.0], "không ngân sách thì không ép");
    assert_eq!(r.duration_ms, 9000);
}

#[test]
fn cue_cuoi_co_do_dai_video_thi_bi_rang_buoc() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Chỉ một câu", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Chỉ một câu")]);

    // video 3000 ms ⇒ ngân sách 2920; giọng gốc 5840 ⇒ cần 0.5 ⇒ chạm trần 0.6
    let p = ScaledTts::new(5840);
    let r = preview(d.path(), &p, "v", 1.0, "vi", 1, Some(3000), &FitOpts::default()).unwrap();

    assert!(!r.unconstrained);
    assert_eq!(p.calls(), vec![1.0, 0.6]);
}

#[test]
fn cue_rong_loi_thi_bao_loi_chu_khong_goi_engine() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("   ", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "   ")]);

    let p = ScaledTts::new(1000);
    let e = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap_err();
    assert!(e.to_string().contains("rỗng"), "{e}");
    assert!(p.calls().is_empty(), "không được gọi engine với chuỗi rỗng");
}

#[test]
fn chua_lam_tieng_thi_bao_loi_neu_dung_buoc_con_thieu() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Một", 0, 1000)]);
    // cố ý không có manifest

    let p = ScaledTts::new(1000);
    let e = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap_err();
    assert!(e.to_string().contains("Lồng tiếng"), "{e}");
}

#[test]
fn index_ngoai_pham_vi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Một", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Một")]);

    let p = ScaledTts::new(1000);
    assert!(preview(d.path(), &p, "v", 1.0, "vi", 5, None, &FitOpts::default()).is_err());
}
