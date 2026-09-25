use app_lib::compose::build_dub_track;
use app_lib::tts::manifest::{Manifest, SegmentEntry};
use app_lib::wav::{read_pcm16_mono, write_pcm16_mono};
use std::path::Path;

/// Ghi 1 cue wav gồm `n` mẫu, mọi mẫu đều bằng `value`.
fn cue_wav(tts_dir: &Path, rel: &str, rate: u32, n: usize, value: i16) {
    let p = tts_dir.join(rel);
    write_pcm16_mono(&p, rate, &vec![value; n]).unwrap();
}

fn seg(index: usize, start_ms: u64, rel: Option<&str>) -> SegmentEntry {
    SegmentEntry {
        index,
        start_ms,
        end_ms: start_ms + 500,
        text: "x".into(),
        audio_path: rel.map(|s| s.to_string()),
        cache_key: rel.map(|_| "k".to_string()),
        length_scale: 1.0,
        duration_ms: 0,
    }
}

fn manifest(rate: u32, segments: Vec<SegmentEntry>) -> Manifest {
    Manifest { version: 1, provider: "fake".into(), voice: "v".into(), sample_rate: rate, segments }
}

#[test]
fn dat_dung_offset_va_do_dai_bang_video() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    // 1000 Hz cho dễ tính: 1 mẫu = 1 ms
    cue_wav(tts, "segments/cue-0001.wav", 1000, 100, 1000);
    cue_wav(tts, "segments/cue-0002.wav", 1000, 100, 2000);

    let m = manifest(
        1000,
        vec![
            seg(1, 0, Some("segments/cue-0001.wav")),
            seg(2, 500, Some("segments/cue-0002.wav")),
        ],
    );

    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 2000, &out).unwrap();

    assert_eq!(st.placed, 2);
    assert_eq!(st.skipped, 0);
    assert_eq!(st.truncated, 0);
    assert_eq!(st.saturated, 0);
    assert_eq!(st.total_ms, 2000);

    let (rate, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(rate, 1000);
    assert_eq!(s.len(), 2000, "dải phải dài đúng bằng video");
    assert_eq!(s[0], 1000, "cue 1 bắt đầu ở mẫu 0");
    assert_eq!(s[99], 1000);
    assert_eq!(s[100], 0, "hết cue 1 là im lặng");
    assert_eq!(s[499], 0);
    assert_eq!(s[500], 2000, "cue 2 bắt đầu ở mẫu 500");
    assert_eq!(s[599], 2000);
    assert_eq!(s[600], 0);
    assert_eq!(s[1999], 0);
}

#[test]
fn cue_khong_co_audio_thi_bo_qua() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0002.wav", 1000, 10, 5);

    let m = manifest(1000, vec![seg(1, 0, None), seg(2, 100, Some("segments/cue-0002.wav"))]);
    let st = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap();
    assert_eq!(st.placed, 1);
    assert_eq!(st.skipped, 0);
}

#[test]
fn offset_qua_cuoi_video_thi_skip() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0001.wav", 1000, 10, 7);

    let m = manifest(1000, vec![seg(1, 5000, Some("segments/cue-0001.wav"))]);
    let st = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap();
    assert_eq!(st.placed, 0);
    assert_eq!(st.skipped, 1);
}

#[test]
fn cue_vuot_cuoi_video_thi_cat_duoi() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0001.wav", 1000, 500, 9);

    let m = manifest(1000, vec![seg(1, 800, Some("segments/cue-0001.wav"))]);
    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 1000, &out).unwrap();

    assert_eq!(st.placed, 1);
    assert_eq!(st.truncated, 1);
    let (_, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(s.len(), 1000);
    assert_eq!(s[800], 9);
    assert_eq!(s[999], 9, "phần vừa trong video vẫn được giữ");
}

#[test]
fn hai_cue_chong_nhau_thi_cong_don_va_dem_bao_hoa() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    // 20000 + 20000 = 40000 > 32767 ⇒ bão hoà
    cue_wav(tts, "segments/cue-0001.wav", 1000, 100, 20000);
    cue_wav(tts, "segments/cue-0002.wav", 1000, 100, 20000);

    let m = manifest(
        1000,
        vec![
            seg(1, 0, Some("segments/cue-0001.wav")),
            seg(2, 50, Some("segments/cue-0002.wav")),
        ],
    );
    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 1000, &out).unwrap();

    assert_eq!(st.placed, 2);
    assert_eq!(st.saturated, 50, "50 mẫu chồng nhau đều chạm trần");

    let (_, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(s[0], 20000, "chưa chồng");
    assert_eq!(s[50], i16::MAX, "chồng ⇒ kẹp ở trần chứ không tràn số âm");
    assert_eq!(s[99], i16::MAX);
    assert_eq!(s[100], 20000, "hết phần chồng");
}

#[test]
fn lech_sample_rate_thi_bao_loi_chu_khong_ghep_bua() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0001.wav", 16000, 100, 1);

    let m = manifest(22050, vec![seg(1, 0, Some("segments/cue-0001.wav"))]);
    let e = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap_err();
    let msg = e.to_string();
    assert!(msg.contains("16000"), "lỗi phải nêu tần số thật: {msg}");
    assert!(msg.contains("22050"), "lỗi phải nêu tần số manifest: {msg}");
}

#[test]
fn thieu_file_cue_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    let m = manifest(1000, vec![seg(1, 0, Some("segments/khong-ton-tai.wav"))]);
    let e = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap_err();
    let msg = e.to_string();
    assert!(
        msg.contains("khong-ton-tai.wav"),
        "lỗi phải nêu tên file thiếu: {msg}"
    );
    assert!(
        msg.contains("chạy lại Lồng tiếng"),
        "lỗi phải nêu cách khắc phục, như hai lỗi compose khác: {msg}"
    );
}

#[test]
fn khong_co_cue_nao_van_ra_dai_im_lang_dung_do_dai() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    let m = manifest(1000, vec![]);
    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 1500, &out).unwrap();
    assert_eq!(st.placed, 0);
    let (_, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(s.len(), 1500);
    assert!(s.iter().all(|v| *v == 0));
}

#[test]
fn ceiling_buffer_length_cho_rate_khong_chia_het() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    // 22050 Hz (Piper rate) với 1 ms: 1 × 22050 / 1000 = 22.05 → ceil = 23 samples
    let m = manifest(22050, vec![]);
    let out = tts.join("dub.wav");
    build_dub_track(tts, &m, 1, &out).unwrap();
    let (rate, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(rate, 22050);
    assert_eq!(s.len(), 23, "buffer phải ceil(1 × 22050 / 1000) = 23 mẫu, không phải floor = 22");
}

#[test]
fn ceiling_buffer_length_longer_uneven_divide() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    // 22050 Hz với 1001 ms: 1001 × 22050 / 1000 = 22072.05 → ceil = 22073
    let m = manifest(22050, vec![]);
    let out = tts.join("dub.wav");
    build_dub_track(tts, &m, 1001, &out).unwrap();
    let (rate, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(rate, 22050);
    assert_eq!(s.len(), 22073, "buffer phải ceil(1001 × 22050 / 1000) = 22073 mẫu");
}
