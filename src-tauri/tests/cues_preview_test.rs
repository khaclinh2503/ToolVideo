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
        voice: None,
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

/// Provider giả lỗi đúng vào lượt tổng hợp thứ hai (dùng đếm lượt gọi
/// `synthesize`), để kiểm ca "lượt hai hỏng giữa chừng" mà F2 nêu.
struct FailSecondPass {
    base_ms: u64,
    calls: RefCell<usize>,
}

impl FailSecondPass {
    fn new(base_ms: u64) -> Self {
        FailSecondPass { base_ms, calls: RefCell::new(0) }
    }
}

impl TtsProvider for FailSecondPass {
    // Cùng id với manifest fixture ("scaled"): test này kiểm việc lượt hai hỏng
    // thì wav và manifest cũ còn nguyên, KHÔNG kiểm guard đổi giọng. Để id khác
    // là bị guard chặn trước khi tới được phần cần kiểm.
    fn id(&self) -> &'static str { "scaled" }
    fn sample_rate(&self) -> u32 { 1000 }
    fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError> {
        let mut c = self.calls.borrow_mut();
        *c += 1;
        if *c == 2 {
            return Err(PipelineError::Io("piper lỗi giả lập ở lượt hai".into()));
        }
        for j in jobs {
            let ms = (self.base_ms as f32 * j.length_scale).round() as usize;
            app_lib::wav::write_pcm16_mono(&j.out, 1000, &vec![0i16; ms]).unwrap();
            on_done(j.index);
        }
        Ok(())
    }
}

/// F1 — manifest thiếu entry ở đúng vị trí cue đang nghe thử (ví dụ Dịch lại
/// sinh thêm cue sau khi đã Lồng tiếng): `preview` phải từ chối theo VỊ TRÍ,
/// giống hệt cách `cues::list` và guard xuất ghép manifest với SRT — không
/// được tự vá bằng cách chèn thêm entry (việc đó phá bất biến vị trí ↔ cue).
#[test]
fn manifest_thieu_entry_o_vi_tri_do_thi_bao_loi_chu_khong_tu_vien() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Một", 0, 1000), ("Hai", 2000, 3000)]);
    // Chỉ có entry cho cue 1 — cue 2 chưa từng được Lồng tiếng.
    write_manifest(d.path(), vec![entry(1, 0, "Một")]);

    let manifest_path = d.path().join("tts").join("manifest.json");
    let manifest_truoc = std::fs::read_to_string(&manifest_path).unwrap();

    let p = ScaledTts::new(1000);
    let e = preview(d.path(), &p, "v", 1.0, "vi", 2, None, &FitOpts::default()).unwrap_err();
    assert!(e.to_string().contains("Lồng tiếng"), "{e}");
    assert!(p.calls().is_empty(), "vị trí không có trong manifest thì không được gọi engine");

    let manifest_sau = std::fs::read_to_string(&manifest_path).unwrap();
    assert_eq!(manifest_truoc, manifest_sau, "manifest không được đổi khi từ chối");
}

/// F2 — lượt hai lỗi giữa chừng (Piper chết, hết đĩa, đóng app...) không được
/// để lại wav thật đã bị ghi đè trong khi manifest vẫn ghi thông tin cũ: đó là
/// trạng thái "manifest nói dối" mà cache lúc Xuất sẽ tin nhầm.
#[test]
fn loi_o_luot_hai_thi_wav_va_manifest_cu_con_nguyen() {
    let d = tempfile::tempdir().unwrap();
    // Ca tràn ngân sách y hệt test đầu file: cue 1 ở 0, cue 2 ở 5000 ⇒ ngân
    // sách 4920; giọng gốc 6000 ⇒ cần ép về 0.82 ⇒ bắt buộc phải có lượt hai.
    write_srt(d.path(), &[("Câu dài", 0, 3000), ("Câu sau", 5000, 6000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu dài"), entry(2, 5000, "Câu sau")]);

    // Wav "cũ" đã có trên đĩa trước khi nghe thử (ví dụ từ lần Xuất trước) —
    // phải còn nguyên byte nếu lượt hai lỗi.
    let out = d.path().join("tts").join("segments").join("cue-0001.wav");
    std::fs::create_dir_all(out.parent().unwrap()).unwrap();
    app_lib::wav::write_pcm16_mono(&out, 1000, &vec![7i16; 321]).unwrap();
    let wav_truoc = std::fs::read(&out).unwrap();

    let manifest_path = d.path().join("tts").join("manifest.json");
    let manifest_truoc = std::fs::read_to_string(&manifest_path).unwrap();

    let p = FailSecondPass::new(6000);
    let e = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap_err();
    assert!(e.to_string().contains("lỗi"), "{e}");

    let wav_sau = std::fs::read(&out).unwrap();
    assert_eq!(wav_truoc, wav_sau, "wav thật không được đổi khi lượt hai lỗi");

    let manifest_sau = std::fs::read_to_string(&manifest_path).unwrap();
    assert_eq!(manifest_truoc, manifest_sau, "manifest không được đổi khi lượt hai lỗi");
}

/// Provider giả có tần số KHÁC manifest — mô phỏng người dùng đổi từ Piper
/// (22050 Hz) sang VieNeu (48000 Hz) rồi bấm Nghe thử.
struct KhacTanSo {
    calls: RefCell<Vec<f32>>,
}

impl TtsProvider for KhacTanSo {
    fn id(&self) -> &'static str { "khac" }
    fn sample_rate(&self) -> u32 { 48_000 }
    fn synthesize(&self, jobs: &[TtsJob], _on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError> {
        for j in jobs {
            self.calls.borrow_mut().push(j.length_scale);
            app_lib::wav::write_pcm16_mono(&j.out, 48_000, &[0i16; 100]).unwrap();
        }
        Ok(())
    }
}

#[test]
fn doi_giong_khac_tan_so_thi_tu_choi_truoc_khi_goi_engine() {
    // Ghi một wav 48 kHz vào manifest ghi 1000 Hz thì compose.rs sẽ từ chối —
    // nhưng chỉ lúc Xuất, rất muộn và khó hiểu. Phải chặn ngay ở Nghe thử.
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Câu một", 0, 1000), ("Câu hai", 2000, 3000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu một"), entry(2, 2000, "Câu hai")]);

    let wav = d.path().join("tts").join("segments").join("cue-0001.wav");
    std::fs::create_dir_all(wav.parent().unwrap()).unwrap();
    app_lib::wav::write_pcm16_mono(&wav, 1000, &[7i16; 42]).unwrap();
    let truoc = std::fs::read(&wav).unwrap();

    let p = KhacTanSo { calls: RefCell::new(Vec::new()) };
    let err = preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default()).unwrap_err();

    assert!(err.to_string().contains("chạy lại Lồng tiếng"), "nhận: {err}");
    assert!(err.to_string().contains("48000"), "phải nêu tần số của giọng mới: {err}");
    assert!(err.to_string().contains("1000"), "phải nêu tần số đang có: {err}");
    // Phân biệt "chặn trước" với "gọi engine rồi mới từ chối".
    assert!(p.calls.borrow().is_empty(), "không được gọi engine rồi mới từ chối");
    assert_eq!(std::fs::read(&wav).unwrap(), truoc, "wav cũ phải còn nguyên");
}

#[test]
fn cung_tan_so_thi_van_nghe_thu_duoc() {
    // Mặt kia của guard: đúng tần số thì không được chặn nhầm.
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Câu một", 0, 1000), ("Câu hai", 2000, 3000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu một"), entry(2, 2000, "Câu hai")]);
    let p = ScaledTts::new(300);
    preview(d.path(), &p, "v", 1.0, "vi", 1, None, &FitOpts::default())
        .expect("cùng tần số thì phải chạy được");
    assert!(!p.calls().is_empty(), "engine phải được gọi");
}

#[test]
fn ten_tep_tam_van_giu_duoi_wav() {
    use app_lib::cues::duong_dan_tam;
    use std::path::Path;
    // Cầu nối VieNeu ghi bằng `soundfile`, thư viện đó suy định dạng từ ĐUÔI
    // tệp. Đã chạy thật và xác nhận: `.wav.tmp` ⇒ mã thoát 1, "unable to get
    // format from file extension", không có file nào được ghi; `.tmp.wav` ⇒
    // mã thoát 0, file ghi đúng. Piper không dính vì nó ghi wav bất kể đuôi,
    // nên lỗi này chỉ lộ ra sau khi thêm VieNeu.
    let t = duong_dan_tam(Path::new("C:/du an/tts/segments/cue-0001.wav"));
    assert_eq!(
        t.extension().and_then(|e| e.to_str()),
        Some("wav"),
        "tệp tạm phải còn đuôi .wav, nhận {}",
        t.display()
    );
    // Và phải KHÁC file thật, nếu không thì tmp+rename mất tác dụng.
    assert_ne!(t, Path::new("C:/du an/tts/segments/cue-0001.wav"));
}

#[test]
fn doi_giong_cung_tan_so_thi_van_tu_choi() {
    // M1: guard chỉ so tần số là chưa đủ. Đổi giọng TRONG CÙNG một nhà cung cấp
    // giữ nguyên 48000 Hz, nên nghe thử vẫn chạy và ghi một cue giọng mới vào
    // giữa một bản lồng tiếng giọng cũ — Bước 4 phát ra một cue lạc giọng mà
    // không cảnh báo gì.
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), &[("Câu một", 0, 1000), ("Câu hai", 2000, 3000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu một"), entry(2, 2000, "Câu hai")]);

    let p = ScaledTts::new(300);
    // Manifest fixture ghi voice = "v"; đây là một giọng khác, cùng provider.
    let err = preview(d.path(), &p, "giong-khac", 1.0, "vi", 1, None, &FitOpts::default())
        .unwrap_err();
    assert!(err.to_string().contains("chạy lại Lồng tiếng"), "nhận: {err}");
    assert!(err.to_string().contains("giong-khac"), "phải nêu giọng mới: {err}");
    assert!(p.calls().is_empty(), "không được gọi engine rồi mới từ chối");
}
