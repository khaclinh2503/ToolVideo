use app_lib::error::PipelineError;
use app_lib::pipeline::run_tts_stage;
use app_lib::tts::{ScalePlan, TtsJob, TtsProvider};
use std::cell::RefCell;
use std::path::Path;

/// Provider giả: ghi 1 file WAV PCM hợp lệ dài đúng 1 giây, đếm số lần được gọi.
struct FakeTts {
    calls: RefCell<Vec<usize>>,
    scales: RefCell<Vec<(usize, f32)>>,
}

impl FakeTts {
    fn new() -> Self {
        FakeTts { calls: RefCell::new(Vec::new()), scales: RefCell::new(Vec::new()) }
    }
    fn generated(&self) -> Vec<usize> {
        self.calls.borrow().clone()
    }
    fn scales(&self) -> Vec<(usize, f32)> {
        self.scales.borrow().clone()
    }
}

fn write_one_second_wav(path: &Path, sample_rate: u32) {
    use std::io::Write;
    let channels: u16 = 1;
    let bits: u16 = 16;
    let block_align = channels * bits / 8;
    let data_len = sample_rate * block_align as u32;
    let mut f = std::fs::File::create(path).unwrap();
    f.write_all(b"RIFF").unwrap();
    f.write_all(&(36 + data_len).to_le_bytes()).unwrap();
    f.write_all(b"WAVEfmt ").unwrap();
    f.write_all(&16u32.to_le_bytes()).unwrap();
    f.write_all(&1u16.to_le_bytes()).unwrap();
    f.write_all(&channels.to_le_bytes()).unwrap();
    f.write_all(&sample_rate.to_le_bytes()).unwrap();
    f.write_all(&(sample_rate * block_align as u32).to_le_bytes()).unwrap();
    f.write_all(&block_align.to_le_bytes()).unwrap();
    f.write_all(&bits.to_le_bytes()).unwrap();
    f.write_all(b"data").unwrap();
    f.write_all(&data_len.to_le_bytes()).unwrap();
    f.write_all(&vec![0u8; data_len as usize]).unwrap();
}

impl TtsProvider for FakeTts {
    fn id(&self) -> &'static str { "fake" }
    fn sample_rate(&self) -> u32 { 22050 }
    fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError> {
        for j in jobs {
            if let Some(d) = j.out.parent() {
                std::fs::create_dir_all(d).unwrap();
            }
            write_one_second_wav(&j.out, 22050);
            self.calls.borrow_mut().push(j.index);
            self.scales.borrow_mut().push((j.index, j.length_scale));
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

#[test]
fn first_run_generates_all_and_writes_manifest() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("Tạm biệt", 1000, 2000)]);

    let p = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p, "vi_VN-vais1000-medium", &ScalePlan::uniform(1.0), "vi").unwrap();

    assert_eq!(r.cue_count, 2);
    assert_eq!(r.generated, 2);
    assert_eq!(r.cached, 0);
    assert!(dir.path().join("tts/segments/cue-0001.wav").exists());
    assert!(dir.path().join("tts/segments/cue-0002.wav").exists());

    let m = app_lib::tts::manifest::load(&r.manifest_path).unwrap();
    assert_eq!(m.provider, "fake");
    assert_eq!(m.voice, "vi_VN-vais1000-medium");
    assert_eq!(m.sample_rate, 22050);
    assert_eq!(m.segments.len(), 2);
    assert_eq!(m.segments[0].audio_path.as_deref(), Some("segments/cue-0001.wav"));
    assert_eq!(m.segments[0].duration_ms, 1000, "phải đọc độ dài thật từ file wav");
    assert_eq!(m.segments[0].start_ms, 0);
    assert_eq!(m.segments[1].end_ms, 2000);
}

#[test]
fn second_run_with_no_changes_generates_nothing() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("Tạm biệt", 1000, 2000)]);

    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "vi_VN-vais1000-medium", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "vi_VN-vais1000-medium", &ScalePlan::uniform(1.0), "vi").unwrap();
    assert_eq!(r.generated, 0, "không đổi gì ⇒ không sinh lại");
    assert_eq!(r.cached, 2);
    assert!(p2.generated().is_empty(), "provider không được gọi");
}

#[test]
fn editing_one_cue_regenerates_only_that_cue() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("Tạm biệt", 1000, 2000)]);
    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "vi_VN-vais1000-medium", &ScalePlan::uniform(1.0), "vi").unwrap();

    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("Hẹn gặp lại", 1000, 2000)]);
    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "vi_VN-vais1000-medium", &ScalePlan::uniform(1.0), "vi").unwrap();

    assert_eq!(r.generated, 1);
    assert_eq!(r.cached, 1);
    assert_eq!(p2.generated(), vec![2], "chỉ cue 2 được sinh lại");
}

#[test]
fn changing_voice_invalidates_cache() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000)]);
    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "giong-a", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "giong-b", &ScalePlan::uniform(1.0), "vi").unwrap();
    assert_eq!(r.generated, 1, "đổi giọng ⇒ phải sinh lại");
}

#[test]
fn blank_cue_is_skipped_without_calling_provider() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("   ", 1000, 1200), ("Kết thúc", 1200, 2000)]);

    let p = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    assert_eq!(r.cue_count, 3);
    assert_eq!(r.generated, 2, "cue trắng không được gửi cho TTS");
    assert_eq!(p.generated(), vec![1, 3]);

    let m = app_lib::tts::manifest::load(&r.manifest_path).unwrap();
    assert_eq!(m.segments[1].audio_path, None);
    assert_eq!(m.segments[1].cache_key, None);
    assert_eq!(m.segments[1].duration_ms, 0);
    assert!(!dir.path().join("tts/segments/cue-0002.wav").exists());
}

#[test]
fn orphan_wavs_are_removed_when_cue_count_shrinks() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Một", 0, 1000), ("Hai", 1000, 2000), ("Ba", 2000, 3000)]);
    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();
    assert!(dir.path().join("tts/segments/cue-0003.wav").exists());

    write_translated(dir.path(), &[("Một", 0, 1000), ("Hai", 1000, 2000)]);
    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    assert_eq!(r.cue_count, 2);
    assert!(!dir.path().join("tts/segments/cue-0003.wav").exists(), "wav mồ côi phải bị xoá");
}

#[test]
fn missing_translated_srt_is_clear_io_error() {
    let dir = tempfile::tempdir().unwrap();
    let p = FakeTts::new();
    let err = run_tts_stage(dir.path(), &p, "v", &ScalePlan::uniform(1.0), "vi").unwrap_err();
    match err {
        PipelineError::Io(m) => assert!(m.contains("chạy Dịch trước"), "thông điệp phải chỉ cách sửa: {m}"),
        e => panic!("mong Io, nhận {e:?}"),
    }
}

#[test]
fn empty_srt_yields_zero_cues_without_calling_provider() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[]);
    let p = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p, "v", &ScalePlan::uniform(1.0), "vi").unwrap();
    assert_eq!(r.cue_count, 0);
    assert_eq!(r.generated, 0);
    assert!(p.generated().is_empty());
    assert!(r.manifest_path.exists(), "vẫn phải ghi manifest rỗng");
}

#[test]
fn per_cue_scale_xuong_toi_provider_va_vao_manifest() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(
        dir.path(),
        &[("Một", 0, 1000), ("Hai", 1000, 2000), ("Ba", 2000, 3000)],
    );

    let p = FakeTts::new();
    let plan = ScalePlan::per_cue(1.0, vec![0.7, 0.85]); // cue 3 rơi về base
    run_tts_stage(dir.path(), &p, "v", &plan, "vi").unwrap();

    assert_eq!(p.scales(), vec![(1, 0.7), (2, 0.85), (3, 1.0)]);

    let m: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string(dir.path().join("tts/manifest.json")).unwrap(),
    )
    .unwrap();
    let ls: Vec<f64> = m["segments"]
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["length_scale"].as_f64().unwrap())
        .collect();
    assert_eq!(ls, vec![0.7, 0.85, 1.0]);
}

#[test]
fn doi_scale_mot_cue_chi_sinh_lai_cue_do() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Một", 0, 1000), ("Hai", 1000, 2000)]);

    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = FakeTts::new();
    let plan = ScalePlan::per_cue(1.0, vec![1.0, 0.8]);
    let r = run_tts_stage(dir.path(), &p2, "v", &plan, "vi").unwrap();

    assert_eq!(r.cached, 1, "cue 1 không đổi tốc độ nên phải dùng lại");
    assert_eq!(r.generated, 1);
    assert_eq!(p2.generated(), vec![2], "chỉ cue 2 được sinh lại");
}
