# M6 — Sửa từng cue + nghe thử Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa text và thời điểm của một cue, nghe thử riêng cue đó, rồi xuất mà không phải chạy lại lồng tiếng cho cả dự án.

**Architecture:** Module mới `cues.rs` làm ba việc trên file SRT — đọc ra kèm trạng thái lệch, ghi một cue trở lại, và tổng hợp lại một cue. Nghe thử chính là sinh lại: nó ghi đè wav thật và cập nhật manifest, nên guard chống lệch phụ đề của M4 giữ nguyên ý nghĩa và không phải sửa. Ba lệnh Tauri mỏng bọc lấy nó, và `App.tsx` thêm một khối danh sách cue sửa tại chỗ.

**Tech Stack:** Rust 2021, crate `app_lib` (`src-tauri/`), `serde`/`serde_json`, `tempfile` cho test; React + TypeScript (`src/App.tsx`); asset protocol của Tauri v2 + `convertFileSrc`. Không thêm dependency mới ở cả hai phía.

**Spec:** `docs/superpowers/specs/2026-09-25-dichvideo-local-m6-cue-editing-design.md`

## Global Constraints

- Nền tảng: Windows 11, shell PowerShell. `cargo` KHÔNG có sẵn trên PATH của shell mới — **mọi lệnh cargo phải mở đầu bằng** `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path";` (PowerShell) hoặc `export PATH="$HOME/.cargo/bin:$PATH"` (bash). Bỏ qua thì báo "cargo: command not found", không phải lỗi code.
- **Chạy mọi lệnh ở foreground và đợi nó xong.** Không chạy nền.
- Mọi thông báo lỗi hướng tới người dùng viết **tiếng Việt**, theo giọng `src-tauri/src/error.rs`, dạng nêu đúng bước còn thiếu.
- Không thêm biến thể vào `enum PipelineError`. Lỗi mới dùng `PipelineError::Io(String)`.
- **File SRT là nguồn sự thật duy nhất.** Không tạo file phụ nào lưu cue đã sửa.
- Ghi file qua **tmp + rename**, theo khuôn `tts::manifest::save` và `run_translate_stage`.
- **`stale` so đúng hai trường mà guard của `run_retime_stage` so**: `text` và `start_ms`. Không hơn, không kém — để dấu hiệu trên màn hình và lỗi lúc xuất không bao giờ nói hai điều khác nhau.
- `tgt` phải `.trim()` trước khi dựng đường dẫn, theo phán quyết của M5 (một dấu cách thừa từng làm `has_translation` sai vĩnh viễn).
- Cho phép cue chồng lấn nhau; chỉ chặn `start_ms >= end_ms`.
- Test dùng `tempfile::tempdir()`, không đụng `%APPDATA%` thật. Test cần engine thật phải `#[ignore]` và có cổng biến môi trường.
- Kết thúc mỗi task: `cargo test` xanh, **0 warning**. Mốc hiện tại: **202 passed / 8 ignored / 0 failed / 0 warnings**.
- Không push lên remote.

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `src-tauri/src/cues.rs` (tạo mới) | Đọc danh sách cue kèm trạng thái lệch, ghi một cue, tổng hợp lại một cue. |
| `src-tauri/src/lib.rs` (sửa) | `pub mod cues;` + đăng ký 3 lệnh. |
| `src-tauri/src/commands.rs` (sửa) | `CueDto`, `PreviewDto`, `list_cues`/`save_cue`/`preview_cue`. |
| `src-tauri/tauri.conf.json` (sửa) | Bật asset protocol với scope giới hạn thư mục dự án. |
| `src/App.tsx` (sửa) | Khối "Sửa phụ đề". |
| `src-tauri/tests/cues_list_test.rs` (tạo mới) | Ghép SRT với manifest, cờ `stale`. |
| `src-tauri/tests/cues_save_test.rs` (tạo mới) | Ghi một cue, các phép chặn. |
| `src-tauri/tests/cues_preview_test.rs` (tạo mới) | Ép tốc độ, cập nhật manifest, cờ `unconstrained`. |
| `src-tauri/tests/e2e_cue_edit_test.rs` (tạo mới) | Sửa + nghe thử trên engine thật, `#[ignore]`. |
| `src-tauri/tests/commands_test.rs` (sửa) | DTO camelCase. |

---

### Task 1: `cues.rs` — đọc danh sách cue kèm trạng thái lệch

**Files:**
- Create: `src-tauri/src/cues.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod cues;`)
- Test: `src-tauri/tests/cues_list_test.rs`

**Interfaces:**
- Consumes: `crate::srt::{parse_srt, Segment}`, `crate::tts::manifest::{load, Manifest, SegmentEntry}`, `crate::error::PipelineError` (đã có).
- Produces:
  - `app_lib::cues::CueView { pub index: usize, pub start_ms: u64, pub end_ms: u64, pub text: String, pub duration_ms: u64, pub audio_path: Option<PathBuf>, pub stale: bool }`
  - `app_lib::cues::srt_path(project_dir: &Path, tgt: &str) -> PathBuf`
  - `app_lib::cues::list(project_dir: &Path, tgt: &str) -> Result<Vec<CueView>, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/cues_list_test.rs`:

```rust
use app_lib::cues::{list, srt_path};
use app_lib::tts::manifest::{save as save_manifest, Manifest, SegmentEntry};
use std::path::Path;

fn write_srt(project_dir: &Path, tgt: &str, cues: &[(&str, u64, u64)]) {
    let segs: Vec<app_lib::srt::Segment> = cues
        .iter()
        .map(|(t, a, b)| app_lib::srt::Segment { start_ms: *a, end_ms: *b, text: t.to_string() })
        .collect();
    let p = srt_path(project_dir, tgt);
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, app_lib::srt::write_srt(&segs)).unwrap();
}

fn entry(index: usize, start_ms: u64, text: &str, audio: Option<&str>, dur: u64) -> SegmentEntry {
    SegmentEntry {
        index,
        start_ms,
        end_ms: start_ms + 500,
        text: text.to_string(),
        audio_path: audio.map(|s| s.to_string()),
        cache_key: audio.map(|_| "k".to_string()),
        length_scale: 1.0,
        duration_ms: dur,
    }
}

fn write_manifest(project_dir: &Path, segments: Vec<SegmentEntry>) {
    let m = Manifest {
        version: 1,
        provider: "fake".into(),
        voice: "v".into(),
        sample_rate: 22050,
        segments,
    };
    save_manifest(&project_dir.join("tts").join("manifest.json"), &m).unwrap();
}

/// Tạo file wav giả ở đường dẫn tương đối trong tts/.
fn touch_wav(project_dir: &Path, rel: &str) {
    let p = project_dir.join("tts").join(rel);
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, b"x").unwrap();
}

#[test]
fn ghep_srt_voi_manifest_lay_do_dai_va_duong_dan() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Xin chào", 0, 1000), ("Tạm biệt", 2000, 3000)]);
    write_manifest(
        d.path(),
        vec![
            entry(1, 0, "Xin chào", Some("segments/cue-0001.wav"), 900),
            entry(2, 2000, "Tạm biệt", Some("segments/cue-0002.wav"), 800),
        ],
    );
    touch_wav(d.path(), "segments/cue-0001.wav");
    touch_wav(d.path(), "segments/cue-0002.wav");

    let got = list(d.path(), "vi").unwrap();
    assert_eq!(got.len(), 2);
    assert_eq!(got[0].index, 1);
    assert_eq!(got[0].duration_ms, 900);
    assert_eq!(got[1].duration_ms, 800);
    assert!(got[0].audio_path.as_ref().unwrap().ends_with("cue-0001.wav"));
    assert!(!got[0].stale && !got[1].stale, "khớp cả text lẫn start_ms thì không lệch");
}

#[test]
fn chua_co_manifest_thi_moi_cue_deu_lech() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);

    let got = list(d.path(), "vi").unwrap();
    assert_eq!(got.len(), 2, "dự án mới dịch xong vẫn phải xem và sửa được");
    assert!(got.iter().all(|c| c.stale));
    assert!(got.iter().all(|c| c.duration_ms == 0 && c.audio_path.is_none()));
}

#[test]
fn lech_khi_text_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Câu đã sửa", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Câu cũ", Some("segments/cue-0001.wav"), 900)]);
    touch_wav(d.path(), "segments/cue-0001.wav");

    assert!(list(d.path(), "vi").unwrap()[0].stale);
}

#[test]
fn lech_khi_start_ms_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Cùng một câu", 500, 1500)]);
    write_manifest(d.path(), vec![entry(1, 0, "Cùng một câu", Some("segments/cue-0001.wav"), 900)]);
    touch_wav(d.path(), "segments/cue-0001.wav");

    assert!(
        list(d.path(), "vi").unwrap()[0].stale,
        "guard của run_retime_stage cũng so start_ms, nên dấu hiệu trên màn hình phải so y hệt"
    );
}

#[test]
fn khong_lech_khi_chi_end_ms_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Cùng một câu", 0, 9999)]);
    write_manifest(d.path(), vec![entry(1, 0, "Cùng một câu", Some("segments/cue-0001.wav"), 900)]);
    touch_wav(d.path(), "segments/cue-0001.wav");

    assert!(
        !list(d.path(), "vi").unwrap()[0].stale,
        "guard không so end_ms nên ở đây cũng không được so — hai bên phải nói cùng một điều"
    );
}

#[test]
fn srt_dai_hon_manifest_thi_cue_thua_la_lech() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000), ("Ba", 4000, 5000)]);
    write_manifest(
        d.path(),
        vec![entry(1, 0, "Một", Some("segments/cue-0001.wav"), 900)],
    );
    touch_wav(d.path(), "segments/cue-0001.wav");

    let got = list(d.path(), "vi").unwrap();
    assert!(!got[0].stale);
    assert!(got[1].stale && got[2].stale);
}

#[test]
fn manifest_ghi_wav_nhung_file_bi_xoa_thi_audio_path_la_none() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    write_manifest(d.path(), vec![entry(1, 0, "Một", Some("segments/cue-0001.wav"), 900)]);
    // cố ý KHÔNG tạo file wav

    let got = list(d.path(), "vi").unwrap();
    assert!(
        got[0].audio_path.is_none(),
        "trả đường dẫn không tồn tại sẽ làm nút Nghe thử phát vào hư không"
    );
}

#[test]
fn thieu_ban_dich_bao_loi_neu_dung_buoc_con_thieu() {
    let d = tempfile::tempdir().unwrap();
    let e = list(d.path(), "vi").unwrap_err();
    assert!(e.to_string().contains("Dịch"), "{e}");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test cues_list_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::cues`".

- [ ] **Step 3: Cài `cues.rs`**

Tạo `src-tauri/src/cues.rs`:

```rust
//! Sửa từng cue của bản dịch.
//!
//! Nguồn sự thật là file `subtitles/translated.<tgt>.srt`, không có lớp lưu
//! riêng nào đè lên: cả pipeline đọc thẳng file đó ở năm chỗ, nên một lớp đè
//! sẽ phải được hoà giải ở cả năm, và chỗ nào quên là chỗ đó âm thầm dùng bản cũ.

use crate::error::PipelineError;
use crate::srt;
use crate::tts::manifest as tts_manifest;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq)]
pub struct CueView {
    /// Số thứ tự trong SRT, đếm từ 1.
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    /// Độ dài giọng đọc đã sinh (ms); 0 khi chưa có.
    pub duration_ms: u64,
    /// Đường dẫn tuyệt đối tới wav; `None` khi chưa sinh hoặc file đã mất.
    pub audio_path: Option<PathBuf>,
    /// Manifest ghi `text` hoặc `start_ms` khác SRT ⇒ giọng đọc đang lệch với
    /// phụ đề. So đúng hai trường mà guard của `run_retime_stage` so, để dấu
    /// hiệu trên màn hình và lỗi lúc xuất không bao giờ nói hai điều khác nhau.
    pub stale: bool,
}

pub fn srt_path(project_dir: &Path, tgt: &str) -> PathBuf {
    project_dir
        .join("subtitles")
        .join(format!("translated.{}.srt", tgt.trim()))
}

fn read_segments(project_dir: &Path, tgt: &str) -> Result<Vec<srt::Segment>, PipelineError> {
    let path = srt_path(project_dir, tgt);
    let raw = std::fs::read_to_string(&path).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            path.display()
        ))
    })?;
    srt::parse_srt(&raw)
}

/// Không đòi phải có manifest: dự án mới dịch xong mà chưa lồng tiếng vẫn phải
/// xem và sửa được. Thiếu manifest ⇒ mọi cue `stale`, chưa có giọng đọc.
pub fn list(project_dir: &Path, tgt: &str) -> Result<Vec<CueView>, PipelineError> {
    let segs = read_segments(project_dir, tgt)?;
    let tts_dir = project_dir.join("tts");
    let m = tts_manifest::load(&tts_dir.join("manifest.json"));

    Ok(segs
        .iter()
        .enumerate()
        .map(|(i, s)| {
            let index = i + 1;
            let entry = m
                .as_ref()
                .and_then(|m| m.segments.iter().find(|e| e.index == index));
            match entry {
                Some(e) => CueView {
                    index,
                    start_ms: s.start_ms,
                    end_ms: s.end_ms,
                    text: s.text.clone(),
                    duration_ms: e.duration_ms,
                    audio_path: e
                        .audio_path
                        .as_ref()
                        .map(|r| tts_dir.join(r))
                        .filter(|p| p.exists()),
                    stale: e.text != s.text || e.start_ms != s.start_ms,
                },
                None => CueView {
                    index,
                    start_ms: s.start_ms,
                    end_ms: s.end_ms,
                    text: s.text.clone(),
                    duration_ms: 0,
                    audio_path: None,
                    stale: true,
                },
            }
        })
        .collect())
}
```

Thêm vào `src-tauri/src/lib.rs`, giữ thứ tự alphabet — `cues` đứng giữa `pub mod config;` và `pub mod error;`:

```rust
pub mod cues;
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test cues_list_test
```
Kỳ vọng: 8 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm đổi điều kiện `stale` thành `e.text != s.text` (bỏ vế `start_ms`). Test `lech_khi_start_ms_khac` PHẢI đỏ. Khôi phục.

Rồi tạm bỏ `.filter(|p| p.exists())`. Test `manifest_ghi_wav_nhung_file_bi_xoa_thi_audio_path_la_none` PHẢI đỏ. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/cues.rs src-tauri/src/lib.rs src-tauri/tests/cues_list_test.rs
git commit -m "feat(cues): đọc danh sách cue kèm trạng thái lệch với manifest"
```

---

### Task 2: Ghi một cue trở lại SRT

**Files:**
- Modify: `src-tauri/src/cues.rs` (thêm vào cuối)
- Test: `src-tauri/tests/cues_save_test.rs`

**Interfaces:**
- Consumes: `app_lib::cues::srt_path` (Task 1); `crate::srt::{parse_srt, write_srt}`.
- Produces: `app_lib::cues::save(project_dir: &Path, tgt: &str, index: usize, text: &str, start_ms: u64, end_ms: u64) -> Result<(), PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/cues_save_test.rs`:

```rust
use app_lib::cues::{save, srt_path};
use std::path::Path;

fn write_srt(project_dir: &Path, tgt: &str, cues: &[(&str, u64, u64)]) {
    let segs: Vec<app_lib::srt::Segment> = cues
        .iter()
        .map(|(t, a, b)| app_lib::srt::Segment { start_ms: *a, end_ms: *b, text: t.to_string() })
        .collect();
    let p = srt_path(project_dir, tgt);
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, app_lib::srt::write_srt(&segs)).unwrap();
}

fn read_cues(project_dir: &Path, tgt: &str) -> Vec<app_lib::srt::Segment> {
    let raw = std::fs::read_to_string(srt_path(project_dir, tgt)).unwrap();
    app_lib::srt::parse_srt(&raw).unwrap()
}

#[test]
fn sua_cue_giua_danh_sach_khong_dung_toi_cue_khac() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000), ("Ba", 4000, 5000)]);

    save(d.path(), "vi", 2, "Hai đã sửa", 2100, 3200).unwrap();

    let got = read_cues(d.path(), "vi");
    assert_eq!(got.len(), 3);
    assert_eq!((got[0].text.as_str(), got[0].start_ms, got[0].end_ms), ("Một", 0, 1000));
    assert_eq!((got[1].text.as_str(), got[1].start_ms, got[1].end_ms), ("Hai đã sửa", 2100, 3200));
    assert_eq!((got[2].text.as_str(), got[2].start_ms, got[2].end_ms), ("Ba", 4000, 5000));
}

#[test]
fn text_nhieu_dong_di_vong_qua_duoc() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);

    save(d.path(), "vi", 1, "Dòng một\nDòng hai", 0, 1000).unwrap();

    assert_eq!(read_cues(d.path(), "vi")[0].text, "Dòng một\nDòng hai");
}

#[test]
fn start_bang_hoac_lon_hon_end_bi_tu_choi_va_file_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    let truoc = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();

    for (a, b) in [(1000u64, 1000u64), (2000, 1000)] {
        let e = save(d.path(), "vi", 1, "X", a, b).unwrap_err();
        assert!(e.to_string().contains("nhỏ hơn"), "{e}");
    }

    let sau = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();
    assert_eq!(truoc, sau, "lời gọi bị từ chối KHÔNG được đụng vào file");
}

#[test]
fn index_ngoai_pham_vi_bi_tu_choi_va_file_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);
    let truoc = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();

    for i in [0usize, 3, 99] {
        let e = save(d.path(), "vi", i, "X", 0, 500).unwrap_err();
        assert!(e.to_string().contains("cue"), "{e}");
    }

    let sau = std::fs::read_to_string(srt_path(d.path(), "vi")).unwrap();
    assert_eq!(truoc, sau, "lời gọi bị từ chối KHÔNG được đụng vào file");
}

#[test]
fn cho_phep_chong_lan_voi_cue_ke() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000), ("Hai", 2000, 3000)]);

    // cue 1 kéo dài đè lên cue 2 — hợp lệ, retime và compose đã có đường xử lý
    save(d.path(), "vi", 1, "Một dài", 0, 2500).unwrap();
    assert_eq!(read_cues(d.path(), "vi")[0].end_ms, 2500);
}

#[test]
fn khong_sot_file_tmp() {
    let d = tempfile::tempdir().unwrap();
    write_srt(d.path(), "vi", &[("Một", 0, 1000)]);
    save(d.path(), "vi", 1, "Một sửa", 0, 1000).unwrap();

    let con: Vec<String> = std::fs::read_dir(d.path().join("subtitles"))
        .unwrap()
        .flatten()
        .map(|e| e.file_name().to_string_lossy().to_string())
        .collect();
    assert_eq!(con, vec!["translated.vi.srt".to_string()], "còn sót file tạm: {con:?}");
}

#[test]
fn thieu_ban_dich_bao_loi_neu_dung_buoc_con_thieu() {
    let d = tempfile::tempdir().unwrap();
    let e = save(d.path(), "vi", 1, "X", 0, 500).unwrap_err();
    assert!(e.to_string().contains("Dịch"), "{e}");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test cues_save_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::cues::save`".

- [ ] **Step 3: Cài `save`**

Thêm vào cuối `src-tauri/src/cues.rs`:

```rust
/// Ghi một cue trở lại SRT, giữ nguyên mọi cue khác. tmp + rename.
///
/// Cho phép chồng lấn với cue kề: `retime` và `compose` đã có đường xử lý
/// (đếm `saturated` trong `DubStats`), còn cấm chồng lấn sẽ chặn những ca cắt
/// phụ đề hợp lệ. Chỉ chặn khoảng thời gian rỗng hoặc âm.
pub fn save(
    project_dir: &Path,
    tgt: &str,
    index: usize,
    text: &str,
    start_ms: u64,
    end_ms: u64,
) -> Result<(), PipelineError> {
    if start_ms >= end_ms {
        return Err(PipelineError::Io(
            "Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc".into(),
        ));
    }

    let mut segs = read_segments(project_dir, tgt)?;
    if index == 0 || index > segs.len() {
        return Err(PipelineError::Io(format!(
            "Không có cue số {index} (bản dịch có {} cue)",
            segs.len()
        )));
    }

    let s = &mut segs[index - 1];
    s.text = text.to_string();
    s.start_ms = start_ms;
    s.end_ms = end_ms;

    let path = srt_path(project_dir, tgt);
    let tmp = path.with_extension("srt.tmp");
    std::fs::write(&tmp, srt::write_srt(&segs)).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, &path).map_err(|e| PipelineError::Io(e.to_string()))
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test cues_save_test
```
Kỳ vọng: 7 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm chuyển hai phép chặn xuống **sau** lệnh ghi file (ghi trước, từ chối sau). Hai test `..._bi_tu_choi_va_file_khong_doi` PHẢI đỏ ở dòng `assert_eq!(truoc, sau, ...)`. Nếu chúng vẫn xanh nghĩa là test chỉ kiểm `is_err()` và không che được gì. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/cues.rs src-tauri/tests/cues_save_test.rs
git commit -m "feat(cues): ghi một cue trở lại SRT, chặn khoảng thời gian rỗng"
```

---

### Task 3: Nghe thử — tổng hợp lại một cue

Nghe thử **chính là sinh lại**: ghi đè wav thật và cập nhật manifest, nên manifest khớp lại SRT ngay sau đó và guard chống lệch phụ đề của M4 giữ nguyên ý nghĩa.

Ngân sách thời gian tính y hệt lúc xuất, nếu không thì người dùng nghe một thứ và nhận một thứ khác.

**Files:**
- Modify: `src-tauri/src/cues.rs` (thêm vào cuối)
- Test: `src-tauri/tests/cues_preview_test.rs`
- Test: `src-tauri/tests/e2e_cue_edit_test.rs` (tạo mới, `#[ignore]`)

**Interfaces:**
- Consumes: `app_lib::cues::{srt_path, save}` (Task 1, 2); `app_lib::retime::{fit_scale, quantize, Cue, FitOpts}`; `app_lib::tts::{cache_key, TtsJob, TtsProvider}`; `app_lib::tts::manifest::{load, save, Manifest, SegmentEntry}`; `app_lib::wav::duration_ms`.
- Produces:
  - `app_lib::cues::PreviewResult { pub audio_path: PathBuf, pub duration_ms: u64, pub length_scale: f32, pub unconstrained: bool }`
  - `app_lib::cues::preview(project_dir: &Path, p: &dyn TtsProvider, voice: &str, base_scale: f32, tgt: &str, index: usize, video_ms: Option<u64>, opts: &FitOpts) -> Result<PreviewResult, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/cues_preview_test.rs`:

```rust
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
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test cues_preview_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::cues::preview`".

- [ ] **Step 3: Cài `preview`**

Thêm vào cuối `src-tauri/src/cues.rs`:

```rust
use crate::retime::{self, FitOpts};
use crate::tts::{self, TtsJob, TtsProvider};

#[derive(Debug, Clone)]
pub struct PreviewResult {
    pub audio_path: PathBuf,
    pub duration_ms: u64,
    pub length_scale: f32,
    /// Cue cuối và không lấy được độ dài video ⇒ tổng hợp không ràng buộc,
    /// nên tốc độ có thể khác lúc xuất.
    pub unconstrained: bool,
}

/// Tổng hợp lại đúng một cue, ghi đè wav thật và cập nhật manifest.
///
/// KHÔNG gọi `run_retime_stage`: guard của nó so manifest với SRT trước khi làm
/// gì cả, mà sau một lần sửa thì hai bên lệch nhau đúng theo thiết kế — gọi nó
/// sẽ nhận về chính thông báo lỗi mà chức năng này sinh ra để tránh.
#[allow(clippy::too_many_arguments)]
pub fn preview(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    tgt: &str,
    index: usize,
    video_ms: Option<u64>,
    opts: &FitOpts,
) -> Result<PreviewResult, PipelineError> {
    let segs = read_segments(project_dir, tgt)?;
    if index == 0 || index > segs.len() {
        return Err(PipelineError::Io(format!(
            "Không có cue số {index} (bản dịch có {} cue)",
            segs.len()
        )));
    }
    let seg = segs[index - 1].clone();
    if seg.text.trim().is_empty() {
        return Err(PipelineError::Io(format!(
            "Cue số {index} rỗng lời — không có gì để đọc"
        )));
    }

    let tts_dir = project_dir.join("tts");
    let manifest_path = tts_dir.join("manifest.json");
    let mut m = tts_manifest::load(&manifest_path).ok_or_else(|| {
        PipelineError::Io(format!(
            "Chưa có giọng đọc — chạy Lồng tiếng trước ({})",
            manifest_path.display()
        ))
    })?;

    // Ranh giới đúng quy tắc retime: start của cue kế; cue cuối lấy độ dài video.
    let (boundary_ms, unconstrained) = if index < segs.len() {
        (segs[index].start_ms, false)
    } else {
        match video_ms {
            Some(v) => (v, false),
            None => (u64::MAX, true),
        }
    };

    let rel = format!("segments/cue-{index:04}.wav");
    let out = tts_dir.join(&rel);
    if let Some(dir) = out.parent() {
        std::fs::create_dir_all(dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    }

    let synth = |scale: f32| -> Result<u64, PipelineError> {
        p.synthesize(
            &[TtsJob {
                index,
                text: seg.text.clone(),
                out: out.clone(),
                length_scale: scale,
            }],
            &mut |_| {},
        )?;
        crate::wav::duration_ms(&out)
    };

    // Lượt 1: đo độ dài thật ở tốc độ nền.
    let mut scale = retime::quantize(base_scale);
    let mut dur = synth(scale)?;

    // Lượt 2: ép vừa ngân sách, đúng quy tắc dùng lúc xuất.
    let fit = retime::fit_scale(
        &retime::Cue {
            start_ms: seg.start_ms,
            boundary_ms,
            duration_ms: dur,
            scale,
        },
        opts,
    );
    if (fit.scale - scale).abs() > 1e-6 {
        scale = fit.scale;
        dur = synth(scale)?;
    }

    // Cập nhật manifest ⇒ cue này hết lệch với SRT.
    let key = tts::cache_key(p.id(), voice, scale, &seg.text);
    match m.segments.iter_mut().find(|e| e.index == index) {
        Some(e) => {
            e.start_ms = seg.start_ms;
            e.end_ms = seg.end_ms;
            e.text = seg.text.clone();
            e.audio_path = Some(rel.clone());
            e.cache_key = Some(key);
            e.length_scale = scale;
            e.duration_ms = dur;
        }
        None => {
            m.segments.push(tts_manifest::SegmentEntry {
                index,
                start_ms: seg.start_ms,
                end_ms: seg.end_ms,
                text: seg.text.clone(),
                audio_path: Some(rel.clone()),
                cache_key: Some(key),
                length_scale: scale,
                duration_ms: dur,
            });
            m.segments.sort_by_key(|e| e.index);
        }
    }
    tts_manifest::save(&manifest_path, &m)?;

    Ok(PreviewResult {
        audio_path: out,
        duration_ms: dur,
        length_scale: scale,
        unconstrained,
    })
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test cues_preview_test
```
Kỳ vọng: 8 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm bỏ lượt hai (xoá khối `if (fit.scale - scale).abs() > 1e-6 { ... }`). Test `cue_tran_ngan_sach_thi_ep_toc_do_dung_ti_le` PHẢI đỏ ở dòng khẳng định `p.calls() == vec![1.0, 0.82]`.

Rồi khôi phục, và tạm bỏ dòng `e.text = seg.text.clone();` trong nhánh cập nhật manifest. Test `sau_khi_nghe_thu_manifest_khop_lai_voi_srt` PHẢI đỏ. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Viết E2E trên engine thật**

Tạo `src-tauri/tests/e2e_cue_edit_test.rs`:

```rust
//! E2E: sửa một cue rồi nghe thử trên Piper thật. Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_CLIP="<path.mp4>"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_cue_edit_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ engine.

use app_lib::config::{load_config, models_dir, projects_dir};
use app_lib::cues;
use app_lib::pipeline::{run_stt_pipeline, run_translate_stage, run_tts_stage, EngineCtx};
use app_lib::retime::FitOpts;
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
}
```

- [ ] **Step 7: Kiểm biên dịch và trạng thái bỏ qua**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: 225 passed / **9** ignored / 0 warning (202 mốc + 8 + 7 + 8 = 225; E2E mới bị bỏ qua).

- [ ] **Step 8: Chạy E2E thật một lần**

```
$env:DVL_E2E_CLIP = "C:\Users\dokha\AppData\Local\Temp\claude\E--workspace-ToolVideo\e7009a41-7477-40f2-a60f-9ca24a67f87d\scratchpad\e2e-clip.mp4"
cargo test --manifest-path src-tauri/Cargo.toml --test e2e_cue_edit_test -- --ignored --nocapture
```
Kỳ vọng: PASS. Ghi lại vào báo cáo: số cue, độ dài và tốc độ của cue vừa nghe thử. Hỏng thì báo nguyên văn lệnh và lỗi rồi dừng — **đừng nới assertion cho test xanh**.

- [ ] **Step 9: Commit**

```bash
git add src-tauri/src/cues.rs src-tauri/tests/cues_preview_test.rs src-tauri/tests/e2e_cue_edit_test.rs
git commit -m "feat(cues): nghe thử là sinh lại một cue, ép tốc độ như lúc xuất"
```

---

### Task 4: Lệnh Tauri và asset protocol

**Files:**
- Modify: `src-tauri/src/commands.rs` (thêm vào cuối)
- Modify: `src-tauri/src/lib.rs` (đăng ký 3 lệnh)
- Modify: `src-tauri/tauri.conf.json`
- Test: `src-tauri/tests/commands_test.rs`

**Interfaces:**
- Consumes: `app_lib::cues::{list, save, preview, CueView, PreviewResult}` (Task 1–3); `app_lib::project::load`; `app_lib::export::probe_duration_ms`; `app_lib::config::{load_config, models_dir}`; `app_lib::retime::FitOpts`.
- Produces:
  - `app_lib::commands::{CueDto, PreviewDto, cue_to_dto}`
  - Lệnh Tauri `list_cues`, `save_cue`, `preview_cue`

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/commands_test.rs`:

```rust
#[test]
fn cue_dto_serialize_ra_camel_case() {
    let v = app_lib::cues::CueView {
        index: 3,
        start_ms: 1000,
        end_ms: 2000,
        text: "Xin chào".into(),
        duration_ms: 900,
        audio_path: Some(std::path::PathBuf::from(r"E:\du an\tts\segments\cue-0003.wav")),
        stale: true,
    };
    let j = serde_json::to_string(&app_lib::commands::cue_to_dto(&v)).unwrap();

    // Cặp đa từ mới phân biệt được rename_all; trường một từ thì không.
    assert!(j.contains("\"startMs\":1000"), "{j}");
    assert!(!j.contains("start_ms"), "{j}");
    assert!(j.contains("\"durationMs\":900"), "{j}");
    assert!(j.contains("\"audioPath\""), "{j}");
    assert!(j.contains("\"stale\":true"), "{j}");
}

#[test]
fn cue_dto_audio_path_null_khi_chua_co_giong() {
    let v = app_lib::cues::CueView {
        index: 1,
        start_ms: 0,
        end_ms: 1000,
        text: "X".into(),
        duration_ms: 0,
        audio_path: None,
        stale: true,
    };
    let j = serde_json::to_string(&app_lib::commands::cue_to_dto(&v)).unwrap();
    assert!(j.contains("\"audioPath\":null"), "{j}");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test commands_test
```
Kỳ vọng: FAIL, "cannot find function `cue_to_dto`".

- [ ] **Step 3: Thêm DTO và ba lệnh**

Thêm vào cuối `src-tauri/src/commands.rs`:

```rust
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CueDto {
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    pub duration_ms: u64,
    pub audio_path: Option<String>,
    pub stale: bool,
}

pub fn cue_to_dto(c: &crate::cues::CueView) -> CueDto {
    CueDto {
        index: c.index,
        start_ms: c.start_ms,
        end_ms: c.end_ms,
        text: c.text.clone(),
        duration_ms: c.duration_ms,
        audio_path: c.audio_path.as_ref().map(|p| p.display().to_string()),
        stale: c.stale,
    }
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviewDto {
    pub audio_path: String,
    pub duration_ms: u64,
    pub length_scale: f32,
    pub unconstrained: bool,
}

#[tauri::command]
pub fn list_cues(project_dir: String, tgt: String) -> Result<Vec<CueDto>, String> {
    crate::cues::list(Path::new(&project_dir), &tgt)
        .map(|v| v.iter().map(cue_to_dto).collect())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_cue(
    project_dir: String,
    tgt: String,
    index: usize,
    text: String,
    start_ms: u64,
    end_ms: u64,
) -> Result<(), String> {
    crate::cues::save(Path::new(&project_dir), &tgt, index, &text, start_ms, end_ms)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn preview_cue(
    project_dir: String,
    tgt: String,
    index: usize,
) -> Result<PreviewDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<PreviewDto, String> {
        let cfg = crate::config::load_config();
        let md = models_dir();
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &md)
            .map_err(|e| e.to_string())?;

        // Độ dài video chỉ cần cho cue cuối; video mất thì nghe thử không ràng buộc.
        let dir = Path::new(&project_dir);
        let video_ms = crate::project::load(dir).and_then(|meta| {
            let ffprobe = md.join("ffmpeg").join("ffprobe.exe");
            let video = Path::new(&meta.video_path);
            if !ffprobe.exists() || !video.exists() {
                return None;
            }
            crate::export::probe_duration_ms(&ffprobe, video).ok()
        });

        let opts = crate::retime::FitOpts {
            guard_ms: cfg.compose.guard_ms,
            min_scale: cfg.compose.min_length_scale,
        };
        let r = crate::cues::preview(
            dir,
            p.as_ref(),
            &cfg.tts.voice,
            cfg.tts.length_scale,
            &tgt,
            index,
            video_ms,
            &opts,
        )
        .map_err(|e| e.to_string())?;

        Ok(PreviewDto {
            audio_path: r.audio_path.display().to_string(),
            duration_ms: r.duration_ms,
            length_scale: r.length_scale,
            unconstrained: r.unconstrained,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}
```

- [ ] **Step 4: Đăng ký ba lệnh**

Trong `src-tauri/src/lib.rs`, thêm vào cuối `generate_handler![]`:

```rust
            commands::list_cues,
            commands::save_cue,
            commands::preview_cue,
```

Kiểm bằng `grep -n "list_cues\|save_cue\|preview_cue" src-tauri/src/lib.rs` — phải thấy đủ ba dòng. Lệnh biên dịch được nhưng quên đăng ký thì chỉ chết lúc chạy, không test nào bắt.

- [ ] **Step 5: Bật asset protocol**

Trong `src-tauri/tauri.conf.json`, đổi khối `app.security` thành:

```json
    "security": {
      "csp": null,
      "assetProtocol": {
        "enable": true,
        "scope": ["$APPDATA/dichvideo-local/projects/**"]
      }
    }
```

Scope ôm đúng thư mục dự án, không rộng hơn — bật asset protocol là mở cho webview đọc file trong phạm vi đó.

- [ ] **Step 6: Chạy toàn bộ, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: 227 passed / 9 ignored / 0 warning.

`build.rs` chạy `tauri-build`, vốn đọc và kiểm `tauri.conf.json` theo schema, nên một lỗi cú pháp JSON hay một khoá sai tên sẽ làm bước này đỏ. **Nhưng schema không kiểm được scope có khớp đường dẫn thật hay không** — việc đó chỉ lộ ra khi phát một cue, và đó là bước cuối của Task 5.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/src/lib.rs src-tauri/tauri.conf.json src-tauri/tests/commands_test.rs
git commit -m "feat(commands): list_cues/save_cue/preview_cue + bật asset protocol"
```

---

### Task 5: Giao diện sửa phụ đề

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: lệnh `list_cues`, `save_cue`, `preview_cue` (Task 4).
- Produces: không có gì cho task sau.

- [ ] **Step 1: Khai báo kiểu, state và hai hàm đổi định dạng thời gian**

Thêm cạnh các interface khác ở đầu `src/App.tsx`:

```tsx
interface CueDto {
  index: number; startMs: number; endMs: number; text: string;
  durationMs: number; audioPath: string | null; stale: boolean;
}
interface PreviewDto {
  audioPath: string; durationMs: number; lengthScale: number; unconstrained: boolean;
}

/** 83450 -> "00:01:23,450" — cùng định dạng SRT mà người dùng đã quen. */
function msToTime(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor(ms / 60_000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  const mm = ms % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(mm, 3)}`;
}

/** "00:01:23,450" -> 83450; trả null nếu không đúng định dạng. */
function timeToMs(v: string): number | null {
  const m = v.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
  if (!m) return null;
  return (+m[1]) * 3_600_000 + (+m[2]) * 60_000 + (+m[3]) * 1000 + (+m[4].padEnd(3, "0"));
}
```

Thêm vào khối `useState`:

```tsx
  const [cues, setCues] = useState<CueDto[]>([]);
  const [cueAudio, setCueAudio] = useState("");
  const [cueNote, setCueNote] = useState("");
```

Thêm `convertFileSrc` vào dòng import của `@tauri-apps/api/core`:

```tsx
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
```

- [ ] **Step 2: Thêm ba hàm xử lý**

Thêm sau `onTts`:

```tsx
  async function onLoadCues() {
    setRunning(true);
    try {
      setCues(await invoke<CueDto[]>("list_cues", { projectDir, tgt }));
      setCueNote("");
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onSaveCue(c: CueDto, text: string, startRaw: string, endRaw: string) {
    const startMs = timeToMs(startRaw);
    const endMs = timeToMs(endRaw);
    if (startMs === null || endMs === null) {
      setStatus("Thời điểm phải theo dạng HH:MM:SS,mmm — ví dụ 00:01:23,450");
      return;
    }
    setRunning(true);
    try {
      await invoke("save_cue", { projectDir, tgt, index: c.index, text, startMs, endMs });
      setCues(await invoke<CueDto[]>("list_cues", { projectDir, tgt }));
      setStatus(`Đã lưu cue ${c.index}.`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onPreviewCue(c: CueDto) {
    setRunning(true);
    setCueNote("");
    try {
      const r = await invoke<PreviewDto>("preview_cue", { projectDir, tgt, index: c.index });
      // Thêm tham số đổi mỗi lần để webview không phát lại bản đã cache.
      setCueAudio(`${convertFileSrc(r.audioPath)}?t=${Date.now()}`);
      setCues(await invoke<CueDto[]>("list_cues", { projectDir, tgt }));
      setStatus(`Nghe thử cue ${c.index}: ${r.durationMs} ms, tốc độ ${r.lengthScale}`);
      if (r.unconstrained) {
        setCueNote(
          "Không tìm thấy video gốc nên cue cuối được đọc không ràng buộc — tốc độ lúc xuất có thể khác.",
        );
      }
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }
```

- [ ] **Step 3: Thêm khối giao diện**

Thêm ngay **trước** khối `<h2>Lồng tiếng</h2>`:

```tsx
      <h2>Sửa phụ đề</h2>
      <div className="row">
        <button type="button" onClick={onLoadCues} disabled={running || !projectDir}>
          Nạp danh sách
        </button>
        {cues.length > 0 && <span style={{ opacity: 0.7 }}>{cues.length} cue</span>}
      </div>
      {cueNote && <p style={{ color: "#c60" }}>{cueNote}</p>}
      {cueAudio && <audio src={cueAudio} controls autoPlay style={{ width: "100%" }} />}
      {cues.map((c) => (
        <CueRow key={c.index} cue={c} running={running} onSave={onSaveCue} onPreview={onPreviewCue} />
      ))}
```

Rồi thêm component `CueRow` **ngoài** hàm `App`, ngay trên `export default App;`:

```tsx
function CueRow({
  cue,
  running,
  onSave,
  onPreview,
}: {
  cue: CueDto;
  running: boolean;
  onSave: (c: CueDto, text: string, startRaw: string, endRaw: string) => void;
  onPreview: (c: CueDto) => void;
}) {
  const [text, setText] = useState(cue.text);
  const [startRaw, setStartRaw] = useState(msToTime(cue.startMs));
  const [endRaw, setEndRaw] = useState(msToTime(cue.endMs));

  // Danh sách được nạp lại sau mỗi lần lưu hoặc nghe thử; đồng bộ lại ô nhập
  // theo giá trị vừa về từ đĩa, nếu không người dùng sẽ thấy bản cũ của chính mình.
  useEffect(() => {
    setText(cue.text);
    setStartRaw(msToTime(cue.startMs));
    setEndRaw(msToTime(cue.endMs));
  }, [cue.text, cue.startMs, cue.endMs]);

  return (
    <div className="row" style={{ alignItems: "flex-start" }}>
      <span style={{ width: 32, opacity: 0.6 }}>{cue.index}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <input value={startRaw} onChange={(e) => setStartRaw(e.target.value)} style={{ width: 120 }} />
        <input value={endRaw} onChange={(e) => setEndRaw(e.target.value)} style={{ width: 120 }} />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        style={{ flex: 1 }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button type="button" onClick={() => onSave(cue, text, startRaw, endRaw)} disabled={running}>
          Lưu
        </button>
        <button type="button" onClick={() => onPreview(cue)} disabled={running}>
          Nghe thử
        </button>
      </div>
      {cue.stale && <span style={{ color: "#c60", width: 110 }}>⚠ chưa nghe lại</span>}
    </div>
  );
}
```

- [ ] **Step 4: Kiểm biên dịch**

```
npm run build
```
Kỳ vọng: build thành công, không lỗi TypeScript.

- [ ] **Step 5: Đọc lại diff, đối chiếu từng tên trên dây**

`npm run build` chỉ kiểm được những hình dạng do chính bạn khai báo, nên nó **không** bắt được tên lệnh sai hay tên trường DTO sai — đó là lỗi lúc chạy, hiện ra dưới dạng `undefined` hoặc một lỗi Tauri khó hiểu. Đối chiếu từng ký tự:

- tên lệnh: `list_cues`, `save_cue`, `preview_cue`;
- khoá tham số: `{ projectDir, tgt }`, `{ projectDir, tgt, index, text, startMs, endMs }`, `{ projectDir, tgt, index }`;
- 7 trường của `CueDto` và 4 trường của `PreviewDto` đúng như khai báo ở Step 1.

- [ ] **Step 6: PHÁT THẬT MỘT CUE — bước duy nhất chứng minh asset protocol chạy được**

Không test nào che được bước này. Schema của Tauri chỉ kiểm `tauri.conf.json` đúng cú pháp; nó **không** kiểm scope có khớp đường dẫn thật hay không.

```
npm run tauri dev
```

Trong app: mở một dự án đã lồng tiếng từ danh sách "Dự án gần đây", bấm **Nạp danh sách** ở khối Sửa phụ đề, rồi bấm **Nghe thử** trên một cue bất kỳ.

- Nghe được tiếng ⇒ scope đúng. Ghi lại vào báo cáo.
- Không nghe được ⇒ mở DevTools (F12) xem lỗi ở tab Console/Network. Lỗi kiểu `asset.localhost` bị từ chối hoặc `Not allowed to load local resource` nghĩa là scope không khớp. Sửa scope trong `tauri.conf.json` rồi phát lại cho tới khi nghe được, và **ghi lại giá trị scope cuối cùng cùng với những giá trị đã thử và thất bại**.
- Nếu sau vài lần thử vẫn không phát được, **dừng và báo NEEDS_CONTEXT** kèm nguyên văn lỗi ở Console — đừng chuyển sang cách khác (đọc byte qua IPC, phát bằng tiến trình ngoài) mà không hỏi.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src-tauri/tauri.conf.json
git commit -m "feat(ui): khối Sửa phụ đề, sửa tại chỗ và nghe thử từng cue"
```

---

## Nghiệm thu M6

Chạy thủ công sau Task 5 — không test nào che được:

1. Mở một dự án đã lồng tiếng, nạp danh sách cue.
2. Sửa text của một cue, bấm Lưu. Dòng đó phải hiện "⚠ chưa nghe lại".
3. Bấm Nghe thử trên đúng cue đó. Phải nghe thấy **câu mới**, và dấu hiệu lệch phải biến mất.
4. Bấm Xuất video. Phải chạy được ngay, **không** phải bấm Lồng tiếng lại.
5. Mở `output/final.mp4` và xác nhận câu đã sửa xuất hiện đúng chỗ trong bản lồng tiếng.
