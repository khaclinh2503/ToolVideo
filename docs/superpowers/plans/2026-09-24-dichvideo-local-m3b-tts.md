# DichVideo-Local M3 pha B (TTS local qua Piper) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Từ `subtitles/translated.<tgt>.srt` (M2), bấm "Lồng tiếng" → sinh `tts/segments/cue-XXXX.wav` cho từng cue + `tts/manifest.json`; chạy lại chỉ sinh cue đã đổi text.

**Architecture:** Trait `TtsProvider` với 1 impl `Piper` chạy **một tiến trình cho cả batch** (`--json-input`, mỗi dòng stdin là 1 cue, mỗi dòng stdout là đường dẫn wav vừa ghi ⇒ biết chính xác cue nào xong). Stage `run_tts_stage` lo cache (so `cache_key` với manifest cũ), gọi provider cho phần thiếu, đọc `duration_ms` từ header wav, ghi manifest bằng tmp+rename.

**Tech Stack:** Rust, Tauri v2, `serde`/`serde_json`, `sha2`; dev: `tempfile`. UI React+TS. Engine ngoài: `piper.exe` (ONNX) do pha A cài.

**Spec:** `docs/superpowers/specs/2026-09-24-dichvideo-local-m3-tts-design.md` (§4.3-§4.9, §5, §6, §7)

**Phụ thuộc:** Pha A (`docs/superpowers/plans/2026-09-24-dichvideo-local-m3a-components.md`) phải xong — Task 7 cần `piper.exe` + voice thật trong `models_dir()`.

## Global Constraints

- Windows x64, Tauri v2, crate `app_lib`; mọi thông điệp lỗi hướng người dùng viết **tiếng Việt**.
- **Không thêm biến thể `PipelineError` mới.** Dùng `Io`, `EngineMissing`, `EngineFailed` đã có.
- Cấu trúc project giữ nguyên lệ M1/M2: mọi thứ nằm dưới `project_dir`; output TTS ở `tts/segments/cue-%04d.wav` (đánh số **từ 1**, khớp số thứ tự cue của SRT) và `tts/manifest.json`.
- `cache_key` = sha256 hex của `format!("{provider}\u{1f}{voice}\u{1f}{length_scale:.3}\u{1f}{text}")` — ký tự ngăn cách là **US (0x1F)**.
- Mặc định config: `tts.default_provider = "piper"`, `tts.voice = "vi_VN-vais1000-medium"`, `tts.length_scale = 1.0`.
- Piper voice `vais1000 medium` sinh wav **22050 Hz** mono 16-bit; ghi `sample_rate` vào manifest để M4 resample.
- `audio_path` trong manifest **tương đối thư mục `tts/`** (project phải di chuyển được).
- Cue có text rỗng/toàn khoảng trắng ⇒ **không gọi TTS**, `audio_path: null`, `cache_key: null`, `duration_ms: 0`.
- Ghi manifest qua **tmp + rename** (theo đúng `run_translate_stage`), không bao giờ để lại file dở.
- Tiến trình con phải có cờ `CREATE_NO_WINDOW` (`creation_flags(0x08000000)`) như `stt.rs`/`ffmpeg.rs`.
- Test không được gọi engine thật; chỉ test E2E gắn `#[ignore]` mới dùng `piper.exe`.

## Review Focus

- **Chạy lần 2 không đổi gì** → `generated == 0`, không spawn tiến trình nào (Task 5).
- **Sửa đúng 1 cue rồi chạy lại** → đúng 1 cue được sinh lại, các wav khác giữ nguyên nội dung (Task 5).
- **Cue nhiều dòng / có dấu `"`** → dòng JSON gửi Piper vẫn là **một** dòng hợp lệ (Task 4).
- **Piper chết giữa batch** → lỗi phải nêu **cue nào** hỏng, không phải lỗi chung chung (Task 4).
- **wav header không phải 44 byte** (có chunk `LIST`) → `duration_ms` vẫn đúng (Task 1).
- **Số cue giảm sau khi sửa phụ đề** → wav mồ côi bị xoá, manifest không còn mục thừa (Task 5).

---

## File Structure

```
src-tauri/src/wav.rs             MỚI — duration_ms đọc header RIFF            (Task 1)
src-tauri/src/tts/mod.rs         MỚI — TtsJob, TtsProvider, cache_key, make_provider (Task 2, 6)
src-tauri/src/tts/manifest.rs    MỚI — schema + load/save                      (Task 3)
src-tauri/src/tts/piper.rs       MỚI — build_args/build_line + driver 1 tiến trình (Task 4)
src-tauri/src/pipeline.rs        + TtsResult + run_tts_stage                   (Task 5)
src-tauri/src/config.rs          + TtsConfig                                   (Task 6)
src-tauri/src/commands.rs        + run_tts                                     (Task 6)
src-tauri/src/lib.rs             + pub mod tts; pub mod wav; đăng ký command   (Task 2, 6)
src/App.tsx                      + nút "Lồng tiếng"                            (Task 6)
src-tauri/tests/wav_test.rs           MỚI                                      (Task 1)
src-tauri/tests/tts_cache_test.rs     MỚI                                      (Task 2)
src-tauri/tests/tts_manifest_test.rs  MỚI                                      (Task 3)
src-tauri/tests/piper_test.rs         MỚI                                      (Task 4)
src-tauri/tests/pipeline_tts_test.rs  MỚI                                      (Task 5)
src-tauri/tests/e2e_tts_test.rs       MỚI — #[ignore]                          (Task 7)
```

---

### Task 1: `wav::duration_ms`

**Files:**
- Create: `src-tauri/src/wav.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod wav;`)
- Test: `src-tauri/tests/wav_test.rs`

**Interfaces:**
- Consumes: `PipelineError::Io`.
- Produces: `pub fn duration_ms(path: &Path) -> Result<u64, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/wav_test.rs`:

```rust
use app_lib::wav::duration_ms;
use std::io::Write;

/// Dựng 1 file WAV PCM hợp lệ; `extra_chunk` cho phép chèn 1 chunk lạ trước `data`.
fn make_wav(path: &std::path::Path, sample_rate: u32, channels: u16, frames: u32, extra_chunk: bool) {
    let bits: u16 = 16;
    let block_align = channels * bits / 8;
    let data_len = frames * block_align as u32;
    let extra: Vec<u8> = if extra_chunk {
        let payload = b"INFOhello world!";
        let mut v = Vec::new();
        v.extend_from_slice(b"LIST");
        v.extend_from_slice(&(payload.len() as u32).to_le_bytes());
        v.extend_from_slice(payload);
        v
    } else {
        Vec::new()
    };
    let riff_len = 4 + (8 + 16) + extra.len() as u32 + (8 + data_len);

    let mut f = std::fs::File::create(path).unwrap();
    f.write_all(b"RIFF").unwrap();
    f.write_all(&riff_len.to_le_bytes()).unwrap();
    f.write_all(b"WAVE").unwrap();
    f.write_all(b"fmt ").unwrap();
    f.write_all(&16u32.to_le_bytes()).unwrap();
    f.write_all(&1u16.to_le_bytes()).unwrap();             // PCM
    f.write_all(&channels.to_le_bytes()).unwrap();
    f.write_all(&sample_rate.to_le_bytes()).unwrap();
    f.write_all(&(sample_rate * block_align as u32).to_le_bytes()).unwrap();
    f.write_all(&block_align.to_le_bytes()).unwrap();
    f.write_all(&bits.to_le_bytes()).unwrap();
    f.write_all(&extra).unwrap();
    f.write_all(b"data").unwrap();
    f.write_all(&data_len.to_le_bytes()).unwrap();
    f.write_all(&vec![0u8; data_len as usize]).unwrap();
}

#[test]
fn duration_of_plain_wav() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("a.wav");
    make_wav(&p, 22050, 1, 22050, false); // đúng 1 giây
    assert_eq!(duration_ms(&p).unwrap(), 1000);
}

#[test]
fn duration_skips_unknown_chunk_before_data() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("b.wav");
    make_wav(&p, 16000, 1, 8000, true); // 0.5 giây, có chunk LIST chen vào
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn duration_handles_stereo() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("c.wav");
    make_wav(&p, 48000, 2, 24000, false); // 0.5 giây stereo
    assert_eq!(duration_ms(&p).unwrap(), 500);
}

#[test]
fn truncated_file_is_error_not_panic() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("d.wav");
    std::fs::write(&p, b"RIFF\x04\x00\x00\x00WAV").unwrap();
    assert!(duration_ms(&p).is_err());
}

#[test]
fn missing_file_is_error() {
    assert!(duration_ms(std::path::Path::new("khong-ton-tai.wav")).is_err());
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test wav_test`
Expected: FAIL — module `wav` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Tạo `src-tauri/src/wav.rs`:

```rust
use crate::error::PipelineError;
use std::path::Path;

fn u16le(b: &[u8], at: usize) -> u16 {
    u16::from_le_bytes([b[at], b[at + 1]])
}

fn u32le(b: &[u8], at: usize) -> u32 {
    u32::from_le_bytes([b[at], b[at + 1], b[at + 2], b[at + 3]])
}

/// Độ dài (ms) của file WAV PCM. Duyệt chunk thật sự, không giả định header 44 byte.
pub fn duration_ms(path: &Path) -> Result<u64, PipelineError> {
    let b = std::fs::read(path)
        .map_err(|e| PipelineError::Io(format!("không đọc được wav {}: {e}", path.display())))?;
    let bad = || PipelineError::Io(format!("wav không hợp lệ: {}", path.display()));

    if b.len() < 12 || &b[0..4] != b"RIFF" || &b[8..12] != b"WAVE" {
        return Err(bad());
    }

    let mut sample_rate: u32 = 0;
    let mut channels: u16 = 0;
    let mut bits: u16 = 0;
    let mut pos = 12usize;

    while pos + 8 <= b.len() {
        let id = &b[pos..pos + 4];
        let len = u32le(&b, pos + 4) as usize;
        let body = pos + 8;
        if body + len > b.len() {
            return Err(bad());
        }
        if id == b"fmt " {
            if len < 16 {
                return Err(bad());
            }
            channels = u16le(&b, body + 2);
            sample_rate = u32le(&b, body + 4);
            bits = u16le(&b, body + 14);
        } else if id == b"data" {
            if sample_rate == 0 || channels == 0 || bits == 0 {
                return Err(bad());
            }
            let bytes_per_sec = sample_rate as u64 * channels as u64 * (bits as u64 / 8);
            if bytes_per_sec == 0 {
                return Err(bad());
            }
            return Ok(len as u64 * 1000 / bytes_per_sec);
        }
        // chunk luôn căn chẵn 2 byte
        pos = body + len + (len % 2);
    }
    Err(bad())
}
```

Thêm `pub mod wav;` vào `src-tauri/src/lib.rs` (sau `pub mod translate;`, giữ thứ tự alphabet).

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test wav_test`
Expected: PASS 5/5.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/wav.rs src-tauri/src/lib.rs src-tauri/tests/wav_test.rs
git commit -m "feat(wav): duration_ms đọc header RIFF đúng cách (không giả định 44 byte)"
```

---

### Task 2: Trait `TtsProvider` + `cache_key`

**Files:**
- Create: `src-tauri/src/tts/mod.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod tts;`)
- Test: `src-tauri/tests/tts_cache_test.rs`

**Interfaces:**
- Consumes: `PipelineError`, `sha2`.
- Produces:
  - `pub struct TtsJob { pub index: usize, pub text: String, pub out: PathBuf, pub length_scale: f32 }`
  - `pub trait TtsProvider { fn id(&self) -> &'static str; fn sample_rate(&self) -> u32; fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError>; }`
  - `pub fn cache_key(provider: &str, voice: &str, length_scale: f32, text: &str) -> String`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/tts_cache_test.rs`:

```rust
use app_lib::tts::cache_key;

#[test]
fn key_is_stable_and_hex_sha256() {
    let a = cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào");
    let b = cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào");
    assert_eq!(a, b);
    assert_eq!(a.len(), 64, "sha256 hex phải dài 64 ký tự");
    assert!(a.chars().all(|c| c.is_ascii_hexdigit()));
}

#[test]
fn key_changes_with_every_parameter() {
    let base = cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào");
    assert_ne!(base, cache_key("vieneu", "vi_VN-vais1000-medium", 1.0, "Xin chào"));
    assert_ne!(base, cache_key("piper", "vi_VN-vivos-x_low", 1.0, "Xin chào"));
    assert_ne!(base, cache_key("piper", "vi_VN-vais1000-medium", 1.2, "Xin chào"));
    assert_ne!(base, cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào!"));
}

#[test]
fn length_scale_compared_at_three_decimals() {
    // 1.0 và 1.0004 làm tròn về "1.000" ⇒ cùng key (chênh lệch không nghe được).
    assert_eq!(
        cache_key("piper", "v", 1.0, "a"),
        cache_key("piper", "v", 1.0004, "a")
    );
    assert_ne!(
        cache_key("piper", "v", 1.0, "a"),
        cache_key("piper", "v", 1.002, "a")
    );
}

#[test]
fn text_cannot_forge_field_boundary() {
    // Nếu ghép trường bằng chuỗi thường, "v" + "\u{1f}" + "a" có thể đụng với voice="v\u{1f}a".
    let x = cache_key("piper", "v", 1.0, "\u{1f}a");
    let y = cache_key("piper", "v\u{1f}", 1.0, "a");
    assert_ne!(x, y, "0x1F trong text không được làm nhoè ranh giới trường");
}
```

Ghi chú cho người cài: để `text_cannot_forge_field_boundary` pass, `cache_key` phải băm **độ dài** của từng trường trước nội dung, chứ không chỉ nối bằng 0x1F.

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test tts_cache_test`
Expected: FAIL — module `tts` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Tạo `src-tauri/src/tts/mod.rs`:

```rust
use crate::error::PipelineError;
use sha2::{Digest, Sha256};
use std::path::PathBuf;

pub mod manifest;
pub mod piper;

/// Một cue cần sinh audio.
#[derive(Debug, Clone)]
pub struct TtsJob {
    /// Số thứ tự cue trong SRT, bắt đầu từ 1.
    pub index: usize,
    pub text: String,
    pub out: PathBuf,
    pub length_scale: f32,
}

pub trait TtsProvider {
    fn id(&self) -> &'static str;
    fn sample_rate(&self) -> u32;
    /// Sinh wav cho từng job theo thứ tự; `on_done(index)` gọi sau mỗi cue ghi xong.
    /// Hợp đồng: `Ok(())` ⇒ mọi `job.out` đều tồn tại.
    fn synthesize(
        &self,
        jobs: &[TtsJob],
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError>;
}

/// Khoá cache: đổi provider/voice/tốc độ/text ⇒ đổi khoá.
/// Băm kèm độ dài từng trường nên nội dung không thể giả mạo ranh giới trường.
pub fn cache_key(provider: &str, voice: &str, length_scale: f32, text: &str) -> String {
    let ls = format!("{length_scale:.3}");
    let mut h = Sha256::new();
    for field in [provider, voice, ls.as_str(), text] {
        h.update((field.len() as u64).to_le_bytes());
        h.update(b"\x1f");
        h.update(field.as_bytes());
    }
    format!("{:x}", h.finalize())
}
```

Thêm `pub mod tts;` vào `src-tauri/src/lib.rs`.

> `pub mod manifest;` và `pub mod piper;` trỏ tới file của Task 3 và Task 4. Để Task 2 biên dịch được ngay, tạo 2 file rỗng `src-tauri/src/tts/manifest.rs` và `src-tauri/src/tts/piper.rs` ở bước này (Task 3, 4 sẽ điền).

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test tts_cache_test`
Expected: PASS 4/4.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/tts src-tauri/src/lib.rs src-tauri/tests/tts_cache_test.rs
git commit -m "feat(tts): trait TtsProvider + cache_key băm kèm độ dài trường"
```

---

### Task 3: Manifest

**Files:**
- Modify: `src-tauri/src/tts/manifest.rs` (file rỗng tạo ở Task 2)
- Test: `src-tauri/tests/tts_manifest_test.rs`

**Interfaces:**
- Consumes: `PipelineError::Io`.
- Produces:
  - `pub struct SegmentEntry { pub index: usize, pub start_ms: u64, pub end_ms: u64, pub text: String, pub audio_path: Option<String>, pub cache_key: Option<String>, pub length_scale: f32, pub duration_ms: u64 }`
  - `pub struct Manifest { pub version: u32, pub provider: String, pub voice: String, pub sample_rate: u32, pub segments: Vec<SegmentEntry> }`
  - `pub fn load(path: &Path) -> Option<Manifest>` — hỏng/thiếu ⇒ `None`
  - `pub fn save(path: &Path, m: &Manifest) -> Result<(), PipelineError>` — tmp + rename

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/tts_manifest_test.rs`:

```rust
use app_lib::tts::manifest::{load, save, Manifest, SegmentEntry};

fn sample() -> Manifest {
    Manifest {
        version: 1,
        provider: "piper".into(),
        voice: "vi_VN-vais1000-medium".into(),
        sample_rate: 22050,
        segments: vec![
            SegmentEntry {
                index: 1,
                start_ms: 0,
                end_ms: 5212,
                text: "Xin chào \"thế giới\"\nhai dòng".into(),
                audio_path: Some("segments/cue-0001.wav".into()),
                cache_key: Some("abc123".into()),
                length_scale: 1.0,
                duration_ms: 1840,
            },
            SegmentEntry {
                index: 2,
                start_ms: 5212,
                end_ms: 6000,
                text: "   ".into(),
                audio_path: None,
                cache_key: None,
                length_scale: 1.0,
                duration_ms: 0,
            },
        ],
    }
}

#[test]
fn save_then_load_roundtrips() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("manifest.json");
    save(&p, &sample()).unwrap();

    let m = load(&p).expect("đọc lại được");
    assert_eq!(m.version, 1);
    assert_eq!(m.sample_rate, 22050);
    assert_eq!(m.segments.len(), 2);
    assert_eq!(m.segments[0].text, "Xin chào \"thế giới\"\nhai dòng");
    assert_eq!(m.segments[0].audio_path.as_deref(), Some("segments/cue-0001.wav"));
    assert_eq!(m.segments[1].audio_path, None);
    assert_eq!(m.segments[1].cache_key, None);
    assert_eq!(m.segments[1].duration_ms, 0);
}

#[test]
fn save_leaves_no_tmp_file_behind() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("manifest.json");
    save(&p, &sample()).unwrap();
    let leftovers: Vec<_> = std::fs::read_dir(dir.path())
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.file_name().to_string_lossy().to_string())
        .filter(|n| n.ends_with(".tmp"))
        .collect();
    assert!(leftovers.is_empty(), "còn file tạm: {leftovers:?}");
}

#[test]
fn load_returns_none_for_missing_or_corrupt() {
    let dir = tempfile::tempdir().unwrap();
    assert!(load(&dir.path().join("khong-co.json")).is_none());

    let bad = dir.path().join("bad.json");
    std::fs::write(&bad, b"{ khong phai json").unwrap();
    assert!(load(&bad).is_none(), "manifest hỏng ⇒ coi như chưa có cache");
}

#[test]
fn json_uses_snake_case_field_names() {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path().join("manifest.json");
    save(&p, &sample()).unwrap();
    let text = std::fs::read_to_string(&p).unwrap();
    for key in ["\"audio_path\"", "\"cache_key\"", "\"duration_ms\"", "\"sample_rate\"", "\"length_scale\""] {
        assert!(text.contains(key), "thiếu khoá {key} trong:\n{text}");
    }
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test tts_manifest_test`
Expected: FAIL — `manifest::{load, save, Manifest, SegmentEntry}` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Nội dung `src-tauri/src/tts/manifest.rs`:

```rust
use crate::error::PipelineError;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SegmentEntry {
    /// Số thứ tự cue trong SRT, bắt đầu từ 1.
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    /// Tương đối thư mục `tts/`; `None` khi cue không có lời.
    pub audio_path: Option<String>,
    pub cache_key: Option<String>,
    pub length_scale: f32,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub version: u32,
    pub provider: String,
    pub voice: String,
    pub sample_rate: u32,
    pub segments: Vec<SegmentEntry>,
}

/// Thiếu file hoặc JSON hỏng ⇒ `None` (coi như chưa có cache), không phải lỗi.
pub fn load(path: &Path) -> Option<Manifest> {
    let text = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

/// Ghi qua tmp + rename để không bao giờ để lại manifest dở.
pub fn save(path: &Path, m: &Manifest) -> Result<(), PipelineError> {
    if let Some(d) = path.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let json = serde_json::to_string_pretty(m).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, json).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, path).map_err(|e| PipelineError::Io(e.to_string()))
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test tts_manifest_test`
Expected: PASS 4/4.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/tts/manifest.rs src-tauri/tests/tts_manifest_test.rs
git commit -m "feat(tts): schema manifest.json + load/save (tmp+rename, hỏng ⇒ None)"
```

---

### Task 4: Driver Piper (1 tiến trình cho cả batch)

**Files:**
- Modify: `src-tauri/src/tts/piper.rs` (file rỗng tạo ở Task 2)
- Test: `src-tauri/tests/piper_test.rs`

**Interfaces:**
- Consumes: `TtsJob`, `TtsProvider`, `PipelineError::{EngineMissing, EngineFailed, Io}`.
- Produces:
  - `pub struct Piper { pub exe: PathBuf, pub model: PathBuf, pub sample_rate: u32 }`
  - `pub fn build_args(model: &Path) -> Vec<String>`
  - `pub fn build_line(job: &TtsJob) -> String`
  - `impl TtsProvider for Piper`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/piper_test.rs`:

```rust
use app_lib::tts::piper::{build_args, build_line, Piper};
use app_lib::tts::{TtsJob, TtsProvider};
use std::path::{Path, PathBuf};

fn job(index: usize, text: &str, length_scale: f32) -> TtsJob {
    TtsJob { index, text: text.into(), out: PathBuf::from(format!("out/cue-{index:04}.wav")), length_scale }
}

#[test]
fn args_point_at_model_and_enable_json_input() {
    let a = build_args(Path::new("C:/m/piper/vi.onnx"));
    assert_eq!(a[0], "-m");
    assert!(a[1].contains("vi.onnx"));
    assert!(a.contains(&"--json-input".to_string()), "phải bật --json-input: {a:?}");
}

#[test]
fn line_is_single_line_valid_json_with_output_file() {
    let l = build_line(&job(1, "Xin chào", 1.0));
    assert!(!l.contains('\n'), "dòng gửi stdin không được chứa xuống dòng");
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert_eq!(v["text"], "Xin chào");
    assert!(v["output_file"].as_str().unwrap().contains("cue-0001.wav"));
    assert!(v.get("length_scale").is_none(), "1.0 là mặc định ⇒ không cần gửi");
}

#[test]
fn line_collapses_newlines_and_escapes_quotes() {
    let l = build_line(&job(2, "dòng một\r\ndòng \"hai\"", 1.0));
    assert!(!l.contains('\n'));
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert_eq!(v["text"], "dòng một dòng \"hai\"", "xuống dòng thành dấu cách, dấu nháy được escape");
}

#[test]
fn line_carries_length_scale_when_not_default() {
    let l = build_line(&job(3, "nhanh lên", 0.85));
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert!((v["length_scale"].as_f64().unwrap() - 0.85).abs() < 1e-6);
}

#[test]
fn missing_exe_reports_engine_missing() {
    let p = Piper {
        exe: PathBuf::from("piper-khong-ton-tai.exe"),
        model: PathBuf::from("vi.onnx"),
        sample_rate: 22050,
    };
    let err = p.synthesize(&[job(1, "a", 1.0)], &mut |_| {}).unwrap_err();
    assert_eq!(err.code(), "engine_missing", "nhận: {err}");
}

#[test]
fn empty_job_list_does_not_spawn_anything() {
    let p = Piper {
        exe: PathBuf::from("piper-khong-ton-tai.exe"),
        model: PathBuf::from("vi.onnx"),
        sample_rate: 22050,
    };
    // Không có job ⇒ không được spawn ⇒ không lỗi dù exe không tồn tại.
    p.synthesize(&[], &mut |_| {}).unwrap();
    assert_eq!(p.id(), "piper");
    assert_eq!(p.sample_rate(), 22050);
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test piper_test`
Expected: FAIL — `piper::{build_args, build_line, Piper}` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Nội dung `src-tauri/src/tts/piper.rs`:

```rust
use crate::{
    error::PipelineError,
    tts::{TtsJob, TtsProvider},
};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub struct Piper {
    pub exe: PathBuf,
    /// File `.onnx` của giọng; Piper tự tìm `<model>.json` cạnh nó.
    pub model: PathBuf,
    pub sample_rate: u32,
}

pub fn build_args(model: &Path) -> Vec<String> {
    vec![
        "-m".to_string(),
        model.display().to_string(),
        "--json-input".to_string(),
    ]
}

/// Một dòng JSON cho stdin của Piper. Cue nhiều dòng được gộp thành một câu nói.
pub fn build_line(job: &TtsJob) -> String {
    let text = job.text.replace("\r\n", " ").replace('\n', " ").replace('\r', " ");
    let mut v = serde_json::json!({
        "text": text,
        "output_file": job.out.display().to_string(),
    });
    if (job.length_scale - 1.0).abs() > 1e-6 {
        v["length_scale"] = serde_json::json!(job.length_scale);
    }
    v.to_string()
}

impl TtsProvider for Piper {
    fn id(&self) -> &'static str {
        "piper"
    }

    fn sample_rate(&self) -> u32 {
        self.sample_rate
    }

    fn synthesize(
        &self,
        jobs: &[TtsJob],
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError> {
        if jobs.is_empty() {
            return Ok(());
        }
        for j in jobs {
            if let Some(d) = j.out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
        }

        let mut cmd = Command::new(&self.exe);
        cmd.args(build_args(&self.model))
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }
        let mut child = cmd.spawn().map_err(|err| {
            if err.kind() == std::io::ErrorKind::NotFound {
                PipelineError::EngineMissing("piper".into())
            } else {
                PipelineError::Io(err.to_string())
            }
        })?;

        // stderr đọc song song để tiến trình con không nghẽn ống.
        let stderr = child.stderr.take().expect("đã piped");
        let err_handle = std::thread::spawn(move || {
            let mut tail: Vec<String> = Vec::new();
            for line in BufReader::new(stderr).lines().map_while(Result::ok) {
                tail.push(line);
                if tail.len() > 100 {
                    tail.remove(0);
                }
            }
            tail.join("\n")
        });

        let mut stdin = child.stdin.take().expect("đã piped");
        let lines: Vec<String> = jobs.iter().map(build_line).collect();
        let write_res = (|| -> std::io::Result<()> {
            for l in &lines {
                stdin.write_all(l.as_bytes())?;
                stdin.write_all(b"\n")?;
            }
            stdin.flush()
        })();
        drop(stdin); // báo hết đầu vào
        // Lỗi ghi thường do tiến trình con đã chết — để phần dưới báo lỗi có ngữ cảnh.
        let _ = write_res;

        let stdout = child.stdout.take().expect("đã piped");
        let mut done = 0usize;
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if line.trim().is_empty() {
                continue;
            }
            if done < jobs.len() {
                on_done(jobs[done].index);
            }
            done += 1;
        }

        let status = child.wait().map_err(|e| PipelineError::Io(e.to_string()))?;
        let stderr_tail = err_handle.join().unwrap_or_default();

        if !status.success() || done < jobs.len() {
            let failed_index = jobs.get(done).map(|j| j.index).unwrap_or(0);
            return Err(PipelineError::EngineFailed {
                stage: format!("tts cue {failed_index}"),
                code: status.code().unwrap_or(-1),
                stderr: stderr_tail,
            });
        }

        // Hợp đồng của trait: Ok ⇒ mọi file đích tồn tại.
        for j in jobs {
            if !j.out.exists() {
                return Err(PipelineError::EngineFailed {
                    stage: format!("tts cue {}", j.index),
                    code: 0,
                    stderr: format!("piper báo xong nhưng thiếu file {}", j.out.display()),
                });
            }
        }
        Ok(())
    }
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test piper_test`
Expected: PASS 6/6.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/tts/piper.rs src-tauri/tests/piper_test.rs
git commit -m "feat(tts): driver Piper 1 tiến trình/batch qua --json-input, lỗi nêu đúng cue"
```

---

### Task 5: `run_tts_stage` (cache + manifest + dọn mồ côi)

**Files:**
- Modify: `src-tauri/src/pipeline.rs` (thêm cuối file)
- Test: `src-tauri/tests/pipeline_tts_test.rs`

**Interfaces:**
- Consumes: `srt::parse_srt`, `tts::{TtsJob, TtsProvider, cache_key}`, `tts::manifest::{Manifest, SegmentEntry, load, save}`, `wav::duration_ms`.
- Produces:
  - `pub struct TtsResult { pub manifest_path: PathBuf, pub cue_count: usize, pub generated: usize, pub cached: usize }`
  - `pub fn run_tts_stage(project_dir: &Path, p: &dyn TtsProvider, voice: &str, length_scale: f32, tgt: &str) -> Result<TtsResult, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/pipeline_tts_test.rs`:

```rust
use app_lib::error::PipelineError;
use app_lib::pipeline::run_tts_stage;
use app_lib::tts::{TtsJob, TtsProvider};
use std::cell::RefCell;
use std::path::Path;

/// Provider giả: ghi 1 file WAV PCM hợp lệ dài đúng 1 giây, đếm số lần được gọi.
struct FakeTts {
    calls: RefCell<Vec<usize>>,
}

impl FakeTts {
    fn new() -> Self {
        FakeTts { calls: RefCell::new(Vec::new()) }
    }
    fn generated(&self) -> Vec<usize> {
        self.calls.borrow().clone()
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
    let r = run_tts_stage(dir.path(), &p, "vi_VN-vais1000-medium", 1.0, "vi").unwrap();

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
    run_tts_stage(dir.path(), &p1, "vi_VN-vais1000-medium", 1.0, "vi").unwrap();

    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "vi_VN-vais1000-medium", 1.0, "vi").unwrap();
    assert_eq!(r.generated, 0, "không đổi gì ⇒ không sinh lại");
    assert_eq!(r.cached, 2);
    assert!(p2.generated().is_empty(), "provider không được gọi");
}

#[test]
fn editing_one_cue_regenerates_only_that_cue() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("Tạm biệt", 1000, 2000)]);
    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "vi_VN-vais1000-medium", 1.0, "vi").unwrap();

    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("Hẹn gặp lại", 1000, 2000)]);
    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "vi_VN-vais1000-medium", 1.0, "vi").unwrap();

    assert_eq!(r.generated, 1);
    assert_eq!(r.cached, 1);
    assert_eq!(p2.generated(), vec![2], "chỉ cue 2 được sinh lại");
}

#[test]
fn changing_voice_invalidates_cache() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000)]);
    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "giong-a", 1.0, "vi").unwrap();

    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "giong-b", 1.0, "vi").unwrap();
    assert_eq!(r.generated, 1, "đổi giọng ⇒ phải sinh lại");
}

#[test]
fn blank_cue_is_skipped_without_calling_provider() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Xin chào", 0, 1000), ("   ", 1000, 1200), ("Kết thúc", 1200, 2000)]);

    let p = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p, "v", 1.0, "vi").unwrap();

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
    run_tts_stage(dir.path(), &p1, "v", 1.0, "vi").unwrap();
    assert!(dir.path().join("tts/segments/cue-0003.wav").exists());

    write_translated(dir.path(), &[("Một", 0, 1000), ("Hai", 1000, 2000)]);
    let p2 = FakeTts::new();
    let r = run_tts_stage(dir.path(), &p2, "v", 1.0, "vi").unwrap();

    assert_eq!(r.cue_count, 2);
    assert!(!dir.path().join("tts/segments/cue-0003.wav").exists(), "wav mồ côi phải bị xoá");
}

#[test]
fn missing_translated_srt_is_clear_io_error() {
    let dir = tempfile::tempdir().unwrap();
    let p = FakeTts::new();
    let err = run_tts_stage(dir.path(), &p, "v", 1.0, "vi").unwrap_err();
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
    let r = run_tts_stage(dir.path(), &p, "v", 1.0, "vi").unwrap();
    assert_eq!(r.cue_count, 0);
    assert_eq!(r.generated, 0);
    assert!(p.generated().is_empty());
    assert!(r.manifest_path.exists(), "vẫn phải ghi manifest rỗng");
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test pipeline_tts_test`
Expected: FAIL — `run_tts_stage` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Thêm vào cuối `src-tauri/src/pipeline.rs`:

```rust
use crate::tts::{self, manifest as tts_manifest, TtsJob, TtsProvider};

#[derive(Debug)]
pub struct TtsResult {
    pub manifest_path: PathBuf,
    pub cue_count: usize,
    pub generated: usize,
    pub cached: usize,
}

/// Sinh audio cho từng cue của `translated.<tgt>.srt`, dùng lại cue không đổi.
pub fn run_tts_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    length_scale: f32,
    tgt: &str,
) -> Result<TtsResult, PipelineError> {
    let srt_path = project_dir.join("subtitles").join(format!("translated.{tgt}.srt"));
    let text = std::fs::read_to_string(&srt_path).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            srt_path.display()
        ))
    })?;
    let segs = srt::parse_srt(&text)?;

    let tts_dir = project_dir.join("tts");
    let seg_dir = tts_dir.join("segments");
    std::fs::create_dir_all(&seg_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let manifest_path = tts_dir.join("manifest.json");

    // Cache cũ: cache_key -> audio_path (tương đối tts/)
    let old = tts_manifest::load(&manifest_path);
    let mut old_by_index: std::collections::HashMap<usize, (String, String, u64)> =
        std::collections::HashMap::new();
    if let Some(m) = &old {
        for s in &m.segments {
            if let (Some(k), Some(a)) = (s.cache_key.as_ref(), s.audio_path.as_ref()) {
                old_by_index.insert(s.index, (k.clone(), a.clone(), s.duration_ms));
            }
        }
    }

    let mut entries: Vec<tts_manifest::SegmentEntry> = Vec::with_capacity(segs.len());
    let mut jobs: Vec<TtsJob> = Vec::new();
    let mut cached = 0usize;

    for (i, s) in segs.iter().enumerate() {
        let index = i + 1;
        if s.text.trim().is_empty() {
            entries.push(tts_manifest::SegmentEntry {
                index,
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: s.text.clone(),
                audio_path: None,
                cache_key: None,
                length_scale,
                duration_ms: 0,
            });
            continue;
        }

        let key = tts::cache_key(p.id(), voice, length_scale, &s.text);
        let rel = format!("segments/cue-{index:04}.wav");
        let abs = tts_dir.join(format!("segments/cue-{index:04}.wav"));

        let hit = old_by_index
            .get(&index)
            .filter(|(k, a, _)| k == &key && a == &rel && abs.exists());

        if let Some((_, _, dur)) = hit {
            cached += 1;
            entries.push(tts_manifest::SegmentEntry {
                index,
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: s.text.clone(),
                audio_path: Some(rel),
                cache_key: Some(key),
                length_scale,
                duration_ms: *dur,
            });
        } else {
            jobs.push(TtsJob {
                index,
                text: s.text.clone(),
                out: abs,
                length_scale,
            });
            entries.push(tts_manifest::SegmentEntry {
                index,
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: s.text.clone(),
                audio_path: Some(rel),
                cache_key: Some(key),
                length_scale,
                duration_ms: 0,
            });
        }
    }

    let generated = jobs.len();
    if !jobs.is_empty() {
        p.synthesize(&jobs, &mut |_| {})?;
    }

    // Độ dài thật của mọi cue có audio (kể cả cache hit chưa có số liệu).
    for e in entries.iter_mut() {
        if let Some(rel) = &e.audio_path {
            if e.duration_ms == 0 {
                e.duration_ms = crate::wav::duration_ms(&tts_dir.join(rel))?;
            }
        }
    }

    let m = tts_manifest::Manifest {
        version: 1,
        provider: p.id().to_string(),
        voice: voice.to_string(),
        sample_rate: p.sample_rate(),
        segments: entries,
    };
    tts_manifest::save(&manifest_path, &m)?;

    // Dọn wav mồ côi (cue bị xoá bớt sau khi sửa phụ đề).
    let keep: std::collections::HashSet<String> = m
        .segments
        .iter()
        .filter_map(|s| s.audio_path.clone())
        .map(|a| a.trim_start_matches("segments/").to_string())
        .collect();
    if let Ok(rd) = std::fs::read_dir(&seg_dir) {
        for e in rd.flatten() {
            let name = e.file_name().to_string_lossy().to_string();
            if name.ends_with(".wav") && !keep.contains(&name) {
                let _ = std::fs::remove_file(e.path());
            }
        }
    }

    Ok(TtsResult {
        manifest_path,
        cue_count: m.segments.len(),
        generated,
        cached,
    })
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test pipeline_tts_test`
Expected: PASS 8/8.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/pipeline.rs src-tauri/tests/pipeline_tts_test.rs
git commit -m "feat(pipeline): run_tts_stage — cache theo cache_key, manifest, dọn wav mồ côi"
```

---

### Task 6: Config + `make_provider` + command `run_tts` + nút UI

**Files:**
- Modify: `src-tauri/src/config.rs`
- Modify: `src-tauri/src/tts/mod.rs` (thêm `make_provider`)
- Modify: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/App.tsx`
- Test: `src-tauri/tests/config_test.rs` (thêm), `src-tauri/tests/tts_cache_test.rs` (thêm)

**Interfaces:**
- Consumes: `config::AppConfig`, `tts::piper::Piper`.
- Produces:
  - `pub struct TtsConfig { pub default_provider: String, pub voice: String, pub length_scale: f32 }` + `AppConfig.tts`
  - `pub fn make_provider(id: &str, cfg: &TtsConfig, models: &Path) -> Result<Box<dyn TtsProvider>, PipelineError>`
  - `#[tauri::command] pub async fn run_tts(project_dir: String, tgt: String) -> Result<TtsResultDto, String>`
  - `TtsResultDto { manifestPath, cueCount, generated, cached }`

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/config_test.rs`:

```rust
#[test]
fn tts_config_defaults_and_backward_compat() {
    // config.json cũ của M2 (không có khối "tts") vẫn đọc được, dùng mặc định.
    let old = r#"{"translate":{"default_provider":"google_free","target_lang":"vi",
        "openai":{"base_url":"https://api.openai.com/v1","api_key":"","model":"gpt-4o-mini"}}}"#;
    let cfg = app_lib::config::parse_config_or_default(old);
    assert_eq!(cfg.tts.default_provider, "piper");
    assert_eq!(cfg.tts.voice, "vi_VN-vais1000-medium");
    assert!((cfg.tts.length_scale - 1.0).abs() < 1e-6);
}
```

Thêm vào cuối `src-tauri/tests/tts_cache_test.rs`:

```rust
#[test]
fn make_provider_rejects_unknown_id_and_missing_exe() {
    let cfg = app_lib::config::TtsConfig::default();
    let dir = tempfile::tempdir().unwrap();

    let err = app_lib::tts::make_provider("khong-co", &cfg, dir.path()).unwrap_err();
    assert!(format!("{err}").contains("chưa hỗ trợ"), "{err}");

    // piper.exe chưa cài ⇒ báo engine_missing kèm gợi ý tải bộ công cụ
    let err = app_lib::tts::make_provider("piper", &cfg, dir.path()).unwrap_err();
    assert_eq!(err.code(), "engine_missing", "{err}");
}

#[test]
fn make_provider_builds_piper_when_files_exist() {
    let dir = tempfile::tempdir().unwrap();
    let piper_dir = dir.path().join("piper");
    std::fs::create_dir_all(&piper_dir).unwrap();
    std::fs::write(piper_dir.join("piper.exe"), b"x").unwrap();
    std::fs::write(piper_dir.join("vi_VN-vais1000-medium.onnx"), b"x").unwrap();

    let cfg = app_lib::config::TtsConfig::default();
    let p = app_lib::tts::make_provider("piper", &cfg, dir.path()).unwrap();
    assert_eq!(p.id(), "piper");
    assert_eq!(p.sample_rate(), 22050);
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test config_test --test tts_cache_test`
Expected: FAIL — `TtsConfig` và `make_provider` chưa tồn tại.

- [ ] **Step 3: Thêm `TtsConfig`**

Trong `src-tauri/src/config.rs`, sửa `AppConfig` và thêm struct mới:

```rust
#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct AppConfig {
    #[serde(default)]
    pub translate: TranslateConfig,
    #[serde(default)]
    pub tts: TtsConfig,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TtsConfig {
    pub default_provider: String,
    pub voice: String,
    pub length_scale: f32,
}

impl Default for TtsConfig {
    fn default() -> Self {
        Self {
            default_provider: "piper".into(),
            voice: "vi_VN-vais1000-medium".into(),
            length_scale: 1.0,
        }
    }
}
```

- [ ] **Step 4: Thêm `make_provider`**

Thêm vào cuối `src-tauri/src/tts/mod.rs`:

```rust
use crate::config::TtsConfig;
use std::path::Path;

pub fn make_provider(
    id: &str,
    cfg: &TtsConfig,
    models: &Path,
) -> Result<Box<dyn TtsProvider>, PipelineError> {
    match id {
        "piper" => {
            let exe = models.join("piper").join("piper.exe");
            let model = models.join("piper").join(format!("{}.onnx", cfg.voice));
            for p in [&exe, &model] {
                if !p.exists() {
                    return Err(PipelineError::EngineMissing(format!(
                        "piper ({}) — bấm 'Tải bộ công cụ' để cài",
                        p.display()
                    )));
                }
            }
            Ok(Box::new(piper::Piper { exe, model, sample_rate: 22050 }))
        }
        _ => Err(PipelineError::ProviderError {
            provider: id.into(),
            status: None,
            msg: "provider TTS chưa hỗ trợ".into(),
        }),
    }
}
```

- [ ] **Step 5: Thêm command**

Thêm vào cuối `src-tauri/src/commands.rs`:

```rust
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TtsResultDto {
    pub manifest_path: String,
    pub cue_count: usize,
    pub generated: usize,
    pub cached: usize,
}

#[tauri::command]
pub async fn run_tts(project_dir: String, tgt: String) -> Result<TtsResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<TtsResultDto, String> {
        let cfg = crate::config::load_config();
        let models = models_dir();
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &models)
            .map_err(|e| e.to_string())?;
        let r = crate::pipeline::run_tts_stage(
            Path::new(&project_dir),
            p.as_ref(),
            &cfg.tts.voice,
            cfg.tts.length_scale,
            &tgt,
        )
        .map_err(|e| e.to_string())?;
        Ok(TtsResultDto {
            manifest_path: r.manifest_path.display().to_string(),
            cue_count: r.cue_count,
            generated: r.generated,
            cached: r.cached,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}
```

Thêm `commands::run_tts,` vào `tauri::generate_handler![...]` trong `src-tauri/src/lib.rs`.

- [ ] **Step 6: Thêm nút UI**

Trong `src/App.tsx`, thêm interface sau `interface TranslateResultDto`:

```tsx
interface TtsResultDto { manifestPath: string; cueCount: number; generated: number; cached: number }
```

Thêm hàm sau `onTranslate`:

```tsx
async function onTts() {
  if (!projectDir) { setStatus("Chạy STT và Dịch trước."); return; }
  setRunning(true); setStatus("Đang lồng tiếng...");
  try {
    const r = await invoke<TtsResultDto>("run_tts", { projectDir, tgt });
    setStatus(`Lồng tiếng xong: ${r.cueCount} cue (sinh mới ${r.generated}, dùng lại ${r.cached}) → ${r.manifestPath}`);
  } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
}
```

Thêm khối mới sau khối "Dịch":

```tsx
<h2>Lồng tiếng</h2>
<div className="row">
  <button type="button" onClick={onTts} disabled={running || !projectDir}>Lồng tiếng</button>
</div>
```

- [ ] **Step 7: Chạy test + build cả hai phía**

Run: `cd src-tauri && cargo test` rồi `cd .. && npm run build`
Expected: toàn bộ test xanh; build UI thành công.

- [ ] **Step 8: Commit**

```bash
git add src-tauri/src/config.rs src-tauri/src/tts/mod.rs src-tauri/src/commands.rs src-tauri/src/lib.rs src/App.tsx src-tauri/tests/config_test.rs src-tauri/tests/tts_cache_test.rs
git commit -m "feat(tts): TtsConfig + make_provider + command run_tts + nút Lồng tiếng"
```

---

### Task 7: E2E thật trên 1 clip

**Files:**
- Create: `src-tauri/tests/e2e_tts_test.rs`

**Interfaces:**
- Consumes: `pipeline::{run_stt_pipeline, run_translate_stage, run_tts_stage}`, `tts::make_provider`, `translate::make_provider`.
- Produces: không có API mới — đây là cổng nghiệm thu.

- [ ] **Step 1: Viết test E2E**

Tạo `src-tauri/tests/e2e_tts_test.rs`:

```rust
//! E2E: video → STT → dịch → TTS trên engine thật. Bỏ qua mặc định; bật bằng:
//!   DVL_E2E_CLIP=<path.mp4> cargo test --test e2e_tts_test -- --ignored --nocapture
//! Yêu cầu đã chạy pha A (ensure_components) để có đủ engine + voice.

use app_lib::config::{load_config, models_dir, projects_dir};
use app_lib::pipeline::{run_stt_pipeline, run_translate_stage, run_tts_stage, EngineCtx};
use app_lib::stt::SttModels;
use std::path::Path;

#[test]
#[ignore]
fn e2e_video_to_voiced_segments() {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let lang = std::env::var("DVL_E2E_LANG").unwrap_or_else(|_| "zh".into());
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
    let project = projects_dir().join(format!("e2e-tts-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();

    let stt = run_stt_pipeline(&ctx, Path::new(&clip), &project, &lang)
        .unwrap_or_else(|e| panic!("STT lỗi: {e}"));
    println!("STT: {} cue", stt.cue_count);
    assert!(stt.cue_count > 0);

    let cfg = load_config();
    let tp = app_lib::translate::make_provider("google_free", &cfg.translate).unwrap();
    let tr = run_translate_stage(&project, tp.as_ref(), "auto", "vi")
        .unwrap_or_else(|e| panic!("Dịch lỗi: {e}"));
    println!("Dịch: {} cue → {}", tr.cue_count, tr.srt_path.display());

    let tts_cfg = cfg.tts.clone();
    let p = app_lib::tts::make_provider(&tts_cfg.default_provider, &tts_cfg, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));

    let t0 = std::time::Instant::now();
    let r = run_tts_stage(&project, p.as_ref(), &tts_cfg.voice, tts_cfg.length_scale, "vi")
        .unwrap_or_else(|e| panic!("TTS lỗi: {e}"));
    println!(
        "TTS: {} cue, sinh {} / cache {} trong {:.1}s → {}",
        r.cue_count, r.generated, r.cached, t0.elapsed().as_secs_f32(), r.manifest_path.display()
    );

    let man = app_lib::tts::manifest::load(&r.manifest_path).unwrap();
    let voiced: Vec<_> = man.segments.iter().filter(|s| s.audio_path.is_some()).collect();
    assert!(!voiced.is_empty(), "không có cue nào được lồng tiếng");
    for s in &voiced {
        let wav = project.join("tts").join(s.audio_path.as_ref().unwrap());
        assert!(wav.exists(), "thiếu {}", wav.display());
        assert!(s.duration_ms > 0, "cue {} có wav rỗng", s.index);
        println!("  cue {} [{}ms]: {}", s.index, s.duration_ms, s.text);
    }

    // Chạy lại: toàn bộ phải vào cache.
    let r2 = run_tts_stage(&project, p.as_ref(), &tts_cfg.voice, tts_cfg.length_scale, "vi").unwrap();
    assert_eq!(r2.generated, 0, "lần 2 không được sinh lại cue nào");
    assert_eq!(r2.cached, voiced.len());

    println!("\nNghe thử: {}", project.join("tts").join("segments").display());
}
```

- [ ] **Step 2: Chạy E2E thật**

Run: `cd src-tauri && DVL_E2E_CLIP=<đường dẫn clip> DVL_E2E_LANG=en cargo test --test e2e_tts_test -- --ignored --nocapture`
Expected: PASS; in danh sách cue kèm `duration_ms`; lần 2 `generated == 0`.

Chưa có clip thì dựng bằng lệnh ở Task 6 Step 7 của plan pha A (SAPI + ffmpeg, chạy offline).

- [ ] **Step 3: Nghe kiểm tra bằng tai**

Mở thư mục `tts/segments/` mà test in ra, nghe 2-3 file. Kiểm: đúng tiếng Việt, không méo, không cụt đầu/đuôi câu.
Nếu giọng sai ngôn ngữ ⇒ kiểm `cfg.tts.voice` và file `.onnx.json` đi kèm có nằm cạnh `.onnx` không.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/tests/e2e_tts_test.rs
git commit -m "test(tts): E2E video → STT → dịch → TTS trên engine thật"
```

---

## Hoàn thành pha B khi

- `cargo test` xanh toàn bộ (wav 5, cache 6, manifest 4, piper 6, pipeline_tts 8 + các test cũ).
- `e2e_tts_test` chạy thật: sinh đủ wav cho mọi cue có lời, `duration_ms > 0`, lần 2 `generated == 0`.
- Nghe thử được tiếng Việt từ `tts/segments/`.
- UI có nút "Lồng tiếng" báo `sinh mới N / dùng lại M`.

## Bàn giao sang M4

M4 (retime + compose + export) nhận đầu vào từ `tts/manifest.json`: mỗi cue có `start_ms`/`end_ms`
(khung thời gian phải khớp), `duration_ms` (độ dài audio thật) và `sample_rate` (22050, cần resample
khi mix với nền 16000). Tỉ lệ cần co giãn của cue = `duration_ms / (end_ms - start_ms)`, cap ở
`maxAccelerate = 2.0`. Cần đọc lại bằng `length_scale` thay vì tăng tốc hậu kỳ thì đặt
`length_scale` mới rồi gọi lại `run_tts_stage` — cache_key đã tính sẵn tham số này nên chỉ cue đổi
tốc độ mới được sinh lại.
