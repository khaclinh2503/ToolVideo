# DichVideo-Local M3 pha A (ComponentManager) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bấm 1 nút trong app là tải xong 8 artifact (~428MB), verify sha256, cài đúng chỗ trong `%APPDATA%\dichvideo-local\models\` — không còn bắt người dùng tự đặt file như M1.

**Architecture:** `components.json` (ghim url + sha256 + bố cục) được nhúng vào binary bằng `include_str!`. `install_component` tải **theo luồng** 64KB (vừa ghi vừa băm, không nạp cả file vào RAM), so sha256, giải nén chỉ những member cần vào `.tmp/`, rồi `rename` sang đích, cuối cùng ghi `.state/<id>.json`. Command Tauri `ensure_components` chạy trong `spawn_blocking` và `emit` sự kiện tiến độ cho UI.

**Tech Stack:** Rust, Tauri v2, `reqwest::blocking` (streaming qua `Read`), `sha2`, `zip`, **mới: `tar` + `bzip2`**, `serde`/`serde_json`; dev: `httpmock`, `tempfile`.

**Spec:** `docs/superpowers/specs/2026-09-24-dichvideo-local-m3-tts-design.md` (§3, §4.1, §4.2, §7)

## Global Constraints

- Windows x64, Tauri v2, crate `app_lib`; **độc lập tuyệt đối** với app DichVideo đã cài — không đọc/ghi `%LOCALAPPDATA%\dichvideo`, `Dich Video`, `com.dichvideo.app`.
- Mọi thông điệp lỗi hướng tới người dùng viết **tiếng Việt**, theo đúng lệ `error.rs` hiện có.
- **Không thêm biến thể `PipelineError` mới.** Dùng `Io`, `ChecksumMismatch`, `ProviderError`, `EngineMissing` đã có.
- Đường dẫn cài **phải** khớp `commands::resolve_engine_ctx` hiện hành: `ffmpeg/ffmpeg.exe`, `sherpa/sherpa-onnx-vad-with-offline-asr.exe`, `sherpa/sense-voice.onnx`, `sherpa/tokens.txt`, `sherpa/vad-model.onnx`.
- Tải **theo luồng**, khối **65536** byte; callback tiến độ tối đa ~10 lần/giây.
- Sai sha256 ⇒ xoá file tạm, **không** để lại file đích nào.
- User-Agent **`DichVideo-Local/0.1`** (như `translate::http_client`); `connect_timeout` 30s, **không** đặt timeout tổng (tải 239MB có thể lâu).
- Thư mục làm việc dưới `models_dir()`: `.tmp/` (tải & giải nén), `.state/` (sổ ghi đã cài).
- Test không được gọi mạng thật. Mọi test dùng `httpmock`; chỉ 2 test E2E gắn `#[ignore]` được phép gọi mạng.
- Không nuốt lỗi: `install_all` dừng ở component lỗi đầu tiên và trả lỗi đó lên.

## Review Focus

- **Tải giữa chừng bị lỗi/sai hash** → không được để lại `.part` hay file đích nửa vời (Task 2, Task 4).
- **Chạy `ensure_components` lần 2** → không một request mạng nào được phát ra (Task 4, khẳng định bằng số hit của mock).
- **`from` là cây con** (`bin/`, `piper/`) → chép đủ cả file con trong thư mục con, giữ cấu trúc (Task 3).
- **Zip/tar chứa đường dẫn kiểu `../`** (zip-slip) → phải từ chối, không ghi ra ngoài thư mục đích (Task 3).
- **`content-length` thiếu** → `total = 0`, tiến độ vẫn chạy, không chia cho 0 (Task 2, Task 5).
- **Ghi `.state` trước khi file đích tồn tại** → sai; phải ghi sau cùng (Task 4).

---

## File Structure

```
src-tauri/Cargo.toml                    + tar = "0.4", bzip2 = "0.4"; [[bin]] pin_components
src-tauri/components.json               MỚI — 8 spec (sha256 điền ở Task 6)          (Task 1, 6)
src-tauri/src/components.rs             VIẾT LẠI — specs/download/extract/install     (Task 1-4)
src-tauri/src/bin/pin_components.rs     MỚI — công cụ dev lấy sha256 + liệt kê entry  (Task 6)
src-tauri/src/commands.rs               + ensure_components                            (Task 5)
src-tauri/src/lib.rs                    + đăng ký command                              (Task 5)
src/App.tsx                             + nút "Tải bộ công cụ" + thanh tiến độ         (Task 5)
src-tauri/tests/components_test.rs      VIẾT LẠI (giữ test verify_sha256 cũ)          (Task 1-4)
src-tauri/tests/e2e_components_test.rs  MỚI — tải thật, #[ignore]                      (Task 6)
```

---

### Task 1: Manifest `components.json` + `specs()`

**Files:**
- Create: `src-tauri/components.json`
- Modify: `src-tauri/src/components.rs` (viết lại phần đầu; **giữ nguyên** `verify_sha256` đang có ở dòng 12-24, xoá `ComponentSpec` cũ và `ensure_component` cũ)
- Modify: `src-tauri/Cargo.toml`
- Test: `src-tauri/tests/components_test.rs`

**Interfaces:**
- Consumes: `PipelineError::Io`.
- Produces: `components::{ComponentSpec, FileMap, Archive, Progress, specs}`.
  - `pub struct ComponentSpec { pub id: String, pub url: String, pub sha256: String, pub size: u64, pub archive: Archive, pub files: Vec<FileMap> }`
  - `pub struct FileMap { pub from: Option<String>, pub to: String }`
  - `pub enum Archive { Zip, TarBz2, Raw }`
  - `pub enum Progress { Download { done: u64, total: u64 }, Extract, Done }`
  - `pub fn specs() -> Result<Vec<ComponentSpec>, PipelineError>`

- [ ] **Step 1: Thêm dependency**

Trong `src-tauri/Cargo.toml`, khối `[dependencies]`, thêm 2 dòng sau `zip = "2"`:

```toml
tar = "0.4"
bzip2 = "0.4"
```

- [ ] **Step 2: Viết test thất bại**

Thay toàn bộ nội dung `src-tauri/tests/components_test.rs` bằng:

```rust
use app_lib::components::{specs, Archive};
use app_lib::components::verify_sha256;

#[test]
fn verify_rejects_wrong_hash() {
    let f = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(f.path(), b"hello").unwrap();
    // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    assert!(verify_sha256(f.path(), "deadbeef").is_err());
    assert!(verify_sha256(
        f.path(),
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    )
    .is_ok());
}

#[test]
fn manifest_has_all_eight_components_with_valid_shape() {
    let s = specs().unwrap();
    assert_eq!(s.len(), 8, "components.json phải có đủ 8 artifact");

    let ids: Vec<&str> = s.iter().map(|c| c.id.as_str()).collect();
    for want in [
        "ffmpeg", "sherpa", "sense-voice", "sense-voice-tokens",
        "silero-vad", "piper", "piper-voice-vi", "piper-voice-vi-cfg",
    ] {
        assert!(ids.contains(&want), "thiếu component '{want}' trong {ids:?}");
    }

    for c in &s {
        assert!(c.url.starts_with("https://"), "{}: url phải là https", c.id);
        assert!(!c.files.is_empty(), "{}: files rỗng", c.id);
        if c.archive == Archive::Raw {
            assert_eq!(c.files.len(), 1, "{}: raw phải có đúng 1 file map", c.id);
            assert!(c.files[0].from.is_none(), "{}: raw không được có 'from'", c.id);
        } else {
            for f in &c.files {
                assert!(f.from.is_some(), "{}: archive phải có 'from'", c.id);
            }
        }
    }
}

#[test]
fn manifest_installs_to_paths_m1_expects() {
    let s = specs().unwrap();
    let all_to: Vec<String> = s.iter().flat_map(|c| c.files.iter().map(|f| f.to.clone())).collect();
    // 5 đường dẫn resolve_engine_ctx đang đòi (ffmpeg.exe nằm trong cây con "ffmpeg")
    for want in ["sherpa/sense-voice.onnx", "sherpa/tokens.txt", "sherpa/vad-model.onnx"] {
        assert!(all_to.contains(&want.to_string()), "thiếu đích '{want}' trong {all_to:?}");
    }
}
```

- [ ] **Step 3: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test components_test`
Expected: FAIL — `specs`/`Archive` chưa tồn tại (lỗi biên dịch `unresolved import`).

- [ ] **Step 4: Tạo `src-tauri/components.json`**

`sha256` để rỗng ở bước này — Task 6 điền giá trị thật. `from` của `sherpa` dùng tên thư mục suy ra từ tên asset; Task 6 sẽ xác nhận lại bằng danh sách entry thật.

```json
[
  {
    "id": "ffmpeg",
    "url": "https://github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip",
    "sha256": "",
    "size": 0,
    "archive": "zip",
    "files": [
      { "from": "ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe", "to": "ffmpeg/ffmpeg.exe" },
      { "from": "ffmpeg-9.0.2-essentials_build/bin/ffprobe.exe", "to": "ffmpeg/ffprobe.exe" }
    ]
  },
  {
    "id": "sherpa",
    "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.13.8/sherpa-onnx-v1.13.8-win-x64-shared-MT-Release.tar.bz2",
    "sha256": "",
    "size": 0,
    "archive": "tar.bz2",
    "files": [
      { "from": "sherpa-onnx-v1.13.8-win-x64-shared-MT-Release/bin/", "to": "sherpa" }
    ]
  },
  {
    "id": "sense-voice",
    "url": "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/model.int8.onnx",
    "sha256": "c71f0ce00bec95b07744e116345e33d8cbbe08cef896382cf907bf4b51a2cd51",
    "size": 239233841,
    "archive": "raw",
    "files": [{ "from": null, "to": "sherpa/sense-voice.onnx" }]
  },
  {
    "id": "sense-voice-tokens",
    "url": "https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/tokens.txt",
    "sha256": "",
    "size": 315894,
    "archive": "raw",
    "files": [{ "from": null, "to": "sherpa/tokens.txt" }]
  },
  {
    "id": "silero-vad",
    "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx",
    "sha256": "",
    "size": 0,
    "archive": "raw",
    "files": [{ "from": null, "to": "sherpa/vad-model.onnx" }]
  },
  {
    "id": "piper",
    "url": "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip",
    "sha256": "",
    "size": 0,
    "archive": "zip",
    "files": [{ "from": "piper/", "to": "piper" }]
  },
  {
    "id": "piper-voice-vi",
    "url": "https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx",
    "sha256": "ec7c89e2c85f4d1edc24b6120c18aaf1bda614f06b511567eb9c7c0de15e2dab",
    "size": 63201294,
    "archive": "raw",
    "files": [{ "from": null, "to": "piper/vi_VN-vais1000-medium.onnx" }]
  },
  {
    "id": "piper-voice-vi-cfg",
    "url": "https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx.json",
    "sha256": "",
    "size": 4860,
    "archive": "raw",
    "files": [{ "from": null, "to": "piper/vi_VN-vais1000-medium.onnx.json" }]
  }
]
```

- [ ] **Step 5: Viết phần đầu `components.rs`**

Trong `src-tauri/src/components.rs`: **xoá** `pub struct ComponentSpec {...}` cũ và `pub async fn ensure_component(...)` cũ, **giữ** `verify_sha256`. Đặt phần sau lên đầu file (sau `use`):

```rust
use crate::error::PipelineError;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
pub enum Archive {
    #[serde(rename = "zip")]
    Zip,
    #[serde(rename = "tar.bz2")]
    TarBz2,
    #[serde(rename = "raw")]
    Raw,
}

#[derive(Debug, Clone, Deserialize)]
pub struct FileMap {
    /// `None` ⇒ archive = Raw (chính file tải về).
    /// `Some("a/b/c.exe")` ⇒ 1 file trong archive.
    /// `Some("a/b/")` ⇒ cả cây con (kết bằng '/').
    pub from: Option<String>,
    /// Đường dẫn đích, tương đối `models_dir()`, luôn dùng '/'.
    pub to: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ComponentSpec {
    pub id: String,
    pub url: String,
    pub sha256: String,
    pub size: u64,
    pub archive: Archive,
    pub files: Vec<FileMap>,
}

#[derive(Debug, Clone, Copy)]
pub enum Progress {
    Download { done: u64, total: u64 },
    Extract,
    Done,
}

pub fn specs() -> Result<Vec<ComponentSpec>, PipelineError> {
    serde_json::from_str(include_str!("../components.json"))
        .map_err(|e| PipelineError::Io(format!("components.json hỏng: {e}")))
}
```

- [ ] **Step 6: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test components_test`
Expected: PASS 3/3.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/components.json src-tauri/src/components.rs src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tests/components_test.rs
git commit -m "feat(components): manifest components.json + specs() cho 8 artifact"
```

---

### Task 2: Tải theo luồng + verify sha256

**Files:**
- Modify: `src-tauri/src/components.rs` (thêm sau `specs`)
- Test: `src-tauri/tests/components_test.rs` (thêm vào cuối)

**Interfaces:**
- Consumes: `Progress`, `PipelineError::{Io, ChecksumMismatch, ProviderError}`.
- Produces: `pub fn download_verified(url: &str, dest: &Path, expected_sha256: &str, on: &mut dyn FnMut(Progress)) -> Result<(), PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/components_test.rs`:

```rust
use app_lib::components::{download_verified, Progress};
use app_lib::error::PipelineError;
use httpmock::prelude::*;

// sha256("hello world") = b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
const HELLO_SHA: &str = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

#[test]
fn download_writes_file_and_reports_progress() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/a.bin");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let dest = dir.path().join("sub").join("a.part");

    let mut seen: Vec<(u64, u64)> = Vec::new();
    let mut on = |p: Progress| {
        if let Progress::Download { done, total } = p {
            seen.push((done, total));
        }
    };
    download_verified(&server.url("/a.bin"), &dest, HELLO_SHA, &mut on).unwrap();

    assert_eq!(std::fs::read(&dest).unwrap(), b"hello world");
    let last = seen.last().copied().expect("phải báo tiến độ ít nhất 1 lần");
    assert_eq!(last.0, 11, "done phải bằng số byte đã tải");
}

#[test]
fn download_with_wrong_hash_errors_and_leaves_no_file() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/b.bin");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let dest = dir.path().join("b.part");

    let err = download_verified(&server.url("/b.bin"), &dest, "deadbeef", &mut |_| {}).unwrap_err();
    match err {
        PipelineError::ChecksumMismatch { got, .. } => assert_eq!(got, HELLO_SHA),
        e => panic!("mong ChecksumMismatch, nhận {e:?}"),
    }
    assert!(!dest.exists(), "file tạm phải bị xoá khi sai hash");
}

#[test]
fn download_http_404_is_provider_error() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/missing");
        then.status(404).body("nope");
    });
    let dir = tempfile::tempdir().unwrap();
    let err = download_verified(
        &server.url("/missing"),
        &dir.path().join("c.part"),
        HELLO_SHA,
        &mut |_| {},
    )
    .unwrap_err();
    match err {
        PipelineError::ProviderError { status, .. } => assert_eq!(status, Some(404)),
        e => panic!("mong ProviderError, nhận {e:?}"),
    }
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test components_test`
Expected: FAIL — `download_verified` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Thêm vào `src-tauri/src/components.rs`:

```rust
use std::io::{Read, Write};

/// Tải `url` về `dest` theo luồng, vừa ghi vừa băm sha256.
/// Sai hash ⇒ xoá `dest` và trả `ChecksumMismatch`.
pub fn download_verified(
    url: &str,
    dest: &Path,
    expected_sha256: &str,
    on: &mut dyn FnMut(Progress),
) -> Result<(), PipelineError> {
    if let Some(d) = dest.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let client = reqwest::blocking::Client::builder()
        .user_agent("DichVideo-Local/0.1")
        .connect_timeout(std::time::Duration::from_secs(30))
        .timeout(None)
        .build()
        .map_err(|e| PipelineError::Io(e.to_string()))?;

    let mut resp = client
        .get(url)
        .send()
        .map_err(|e| PipelineError::Io(format!("không tải được {url}: {e}")))?;
    if !resp.status().is_success() {
        return Err(PipelineError::ProviderError {
            provider: "download".into(),
            status: Some(resp.status().as_u16()),
            msg: url.to_string(),
        });
    }

    let total = resp.content_length().unwrap_or(0);
    let mut file = std::fs::File::create(dest).map_err(|e| PipelineError::Io(e.to_string()))?;
    let mut hasher = Sha256::new();
    let mut buf = vec![0u8; 65536];
    let mut done: u64 = 0;
    let mut last = std::time::Instant::now();
    loop {
        let n = resp
            .read(&mut buf)
            .map_err(|e| PipelineError::Io(format!("đứt kết nối khi tải {url}: {e}")))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
        file.write_all(&buf[..n]).map_err(|e| PipelineError::Io(e.to_string()))?;
        done += n as u64;
        if last.elapsed() >= std::time::Duration::from_millis(100) {
            last = std::time::Instant::now();
            on(Progress::Download { done, total });
        }
    }
    file.flush().map_err(|e| PipelineError::Io(e.to_string()))?;
    drop(file);
    on(Progress::Download { done, total });

    let got = format!("{:x}", hasher.finalize());
    if !got.eq_ignore_ascii_case(expected_sha256) {
        let _ = std::fs::remove_file(dest);
        return Err(PipelineError::ChecksumMismatch {
            expected: expected_sha256.to_string(),
            got,
        });
    }
    Ok(())
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test components_test`
Expected: PASS 6/6.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/components.rs src-tauri/tests/components_test.rs
git commit -m "feat(components): tải theo luồng 64KB + verify sha256, xoá file tạm khi lệch"
```

---

### Task 3: Giải nén & đặt file (zip / tar.bz2 / raw)

**Files:**
- Modify: `src-tauri/src/components.rs`
- Test: `src-tauri/tests/components_test.rs`

**Interfaces:**
- Consumes: `ComponentSpec`, `Archive`, `FileMap`, `PipelineError::Io`.
- Produces: `pub fn place_files(archive_path: &Path, spec: &ComponentSpec, models: &Path) -> Result<Vec<String>, PipelineError>`
  — trả về danh sách đường dẫn đích **tương đối `models`** đã ghi (dùng '/'), để Task 4 ghi vào `.state`.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/components_test.rs`:

```rust
use app_lib::components::{place_files, ComponentSpec, FileMap};
use std::io::Write as _;

fn spec(id: &str, archive: Archive, files: Vec<(Option<&str>, &str)>) -> ComponentSpec {
    ComponentSpec {
        id: id.into(),
        url: "https://example.invalid/x".into(),
        sha256: String::new(),
        size: 0,
        archive,
        files: files
            .into_iter()
            .map(|(from, to)| FileMap { from: from.map(|s| s.to_string()), to: to.into() })
            .collect(),
    }
}

fn make_zip(path: &std::path::Path, entries: &[(&str, &[u8])]) {
    let f = std::fs::File::create(path).unwrap();
    let mut z = zip::ZipWriter::new(f);
    let opt = zip::write::SimpleFileOptions::default();
    for (name, data) in entries {
        z.start_file(*name, opt).unwrap();
        z.write_all(data).unwrap();
    }
    z.finish().unwrap();
}

fn make_tar_bz2(path: &std::path::Path, entries: &[(&str, &[u8])]) {
    let f = std::fs::File::create(path).unwrap();
    let enc = bzip2::write::BzEncoder::new(f, bzip2::Compression::fast());
    let mut t = tar::Builder::new(enc);
    for (name, data) in entries {
        let mut h = tar::Header::new_gnu();
        h.set_size(data.len() as u64);
        h.set_mode(0o644);
        h.set_cksum();
        t.append_data(&mut h, *name, *data).unwrap();
    }
    t.into_inner().unwrap().finish().unwrap();
}

#[test]
fn place_raw_renames_download_to_target() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let part = dir.path().join("x.part");
    std::fs::write(&part, b"MODEL").unwrap();

    let s = spec("m", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    let written = place_files(&part, &s, &models).unwrap();

    assert_eq!(written, vec!["sherpa/sense-voice.onnx".to_string()]);
    assert_eq!(std::fs::read(models.join("sherpa/sense-voice.onnx")).unwrap(), b"MODEL");
}

#[test]
fn place_zip_picks_single_files_and_ignores_the_rest() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let zip_path = dir.path().join("a.zip");
    make_zip(&zip_path, &[
        ("build/bin/ffmpeg.exe", b"FF"),
        ("build/bin/ffprobe.exe", b"FP"),
        ("build/bin/ffplay.exe", b"PLAY"),
    ]);

    let s = spec("ffmpeg", Archive::Zip, vec![
        (Some("build/bin/ffmpeg.exe"), "ffmpeg/ffmpeg.exe"),
        (Some("build/bin/ffprobe.exe"), "ffmpeg/ffprobe.exe"),
    ]);
    place_files(&zip_path, &s, &models).unwrap();

    assert_eq!(std::fs::read(models.join("ffmpeg/ffmpeg.exe")).unwrap(), b"FF");
    assert_eq!(std::fs::read(models.join("ffmpeg/ffprobe.exe")).unwrap(), b"FP");
    assert!(!models.join("ffmpeg/ffplay.exe").exists(), "không được chép file không khai báo");
}

#[test]
fn place_zip_copies_whole_subtree_when_from_ends_with_slash() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let zip_path = dir.path().join("p.zip");
    make_zip(&zip_path, &[
        ("piper/piper.exe", b"EXE"),
        ("piper/espeak-ng-data/vi_dict", b"DICT"),
        ("other/readme.txt", b"NO"),
    ]);

    let s = spec("piper", Archive::Zip, vec![(Some("piper/"), "piper")]);
    let mut written = place_files(&zip_path, &s, &models).unwrap();
    written.sort();

    assert_eq!(written, vec!["piper/espeak-ng-data/vi_dict".to_string(), "piper/piper.exe".to_string()]);
    assert_eq!(std::fs::read(models.join("piper/piper.exe")).unwrap(), b"EXE");
    assert_eq!(std::fs::read(models.join("piper/espeak-ng-data/vi_dict")).unwrap(), b"DICT");
    assert!(!models.join("other").exists());
}

#[test]
fn place_tar_bz2_copies_subtree() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let tb = dir.path().join("s.tar.bz2");
    make_tar_bz2(&tb, &[
        ("sherpa-onnx-v1/bin/sherpa-onnx-vad-with-offline-asr.exe", b"ASR"),
        ("sherpa-onnx-v1/bin/onnxruntime.dll", b"DLL"),
        ("sherpa-onnx-v1/include/x.h", b"H"),
    ]);

    let s = spec("sherpa", Archive::TarBz2, vec![(Some("sherpa-onnx-v1/bin/"), "sherpa")]);
    place_files(&tb, &s, &models).unwrap();

    assert_eq!(
        std::fs::read(models.join("sherpa/sherpa-onnx-vad-with-offline-asr.exe")).unwrap(),
        b"ASR"
    );
    assert_eq!(std::fs::read(models.join("sherpa/onnxruntime.dll")).unwrap(), b"DLL");
    assert!(!models.join("sherpa/x.h").exists());
}

#[test]
fn place_errors_when_declared_member_missing() {
    let dir = tempfile::tempdir().unwrap();
    let zip_path = dir.path().join("e.zip");
    make_zip(&zip_path, &[("build/bin/other.exe", b"X")]);

    let s = spec("ffmpeg", Archive::Zip, vec![(Some("build/bin/ffmpeg.exe"), "ffmpeg/ffmpeg.exe")]);
    let err = place_files(&zip_path, &s, &dir.path().join("models")).unwrap_err();
    match err {
        PipelineError::Io(m) => assert!(m.contains("ffmpeg.exe"), "thông điệp phải nêu tên file: {m}"),
        e => panic!("mong Io, nhận {e:?}"),
    }
}

#[test]
fn place_rejects_path_traversal_entries() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let zip_path = dir.path().join("evil.zip");
    make_zip(&zip_path, &[("piper/../../evil.txt", b"PWN"), ("piper/ok.txt", b"OK")]);

    let s = spec("piper", Archive::Zip, vec![(Some("piper/"), "piper")]);
    let err = place_files(&zip_path, &s, &models).unwrap_err();
    match err {
        PipelineError::Io(m) => assert!(m.contains("không hợp lệ"), "{m}"),
        e => panic!("mong Io, nhận {e:?}"),
    }
    assert!(!dir.path().join("evil.txt").exists());
}
```

Không cần thêm `[dev-dependencies]`: Cargo cho test tích hợp trong `tests/` dùng cả `[dependencies]` của package, nên `zip::`, `tar::`, `bzip2::` đã sẵn sàng sau Task 1.

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test components_test`
Expected: FAIL — `place_files` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Thêm vào `src-tauri/src/components.rs`:

```rust
/// Ghép `models` + đường dẫn tương đối, từ chối mọi đường đi ra ngoài `models`.
fn safe_join(models: &Path, rel: &str) -> Result<PathBuf, PipelineError> {
    if rel.is_empty() || rel.contains("..") || rel.starts_with('/') || rel.contains(':') {
        return Err(PipelineError::Io(format!("đường dẫn trong gói không hợp lệ: '{rel}'")));
    }
    Ok(models.join(rel.replace('/', std::path::MAIN_SEPARATOR_STR)))
}

fn write_member(models: &Path, rel_to: &str, data: &[u8]) -> Result<(), PipelineError> {
    let out = safe_join(models, rel_to)?;
    if let Some(d) = out.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    std::fs::write(&out, data).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Đích tương ứng cho một entry trong archive, hoặc `None` nếu entry không được khai báo.
/// `from` kết bằng '/' ⇒ cây con: đích = `to` + phần đuôi sau tiền tố.
fn target_for(files: &[FileMap], entry: &str) -> Option<String> {
    for f in files {
        let Some(from) = f.from.as_deref() else { continue };
        if let Some(prefix) = from.strip_suffix('/') {
            let prefix = format!("{prefix}/");
            if let Some(rest) = entry.strip_prefix(&prefix) {
                if !rest.is_empty() {
                    return Some(format!("{}/{}", f.to.trim_end_matches('/'), rest));
                }
            }
        } else if entry == from {
            return Some(f.to.clone());
        }
    }
    None
}

/// Đặt các file khai báo trong `spec.files` từ `archive_path` vào `models`.
/// Trả danh sách đích tương đối đã ghi (dùng '/').
pub fn place_files(
    archive_path: &Path,
    spec: &ComponentSpec,
    models: &Path,
) -> Result<Vec<String>, PipelineError> {
    let mut written: Vec<String> = Vec::new();

    match spec.archive {
        Archive::Raw => {
            let to = &spec.files[0].to;
            let out = safe_join(models, to)?;
            if let Some(d) = out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
            // rename có thể thất bại khi khác volume ⇒ fallback copy.
            if std::fs::rename(archive_path, &out).is_err() {
                std::fs::copy(archive_path, &out).map_err(|e| PipelineError::Io(e.to_string()))?;
                let _ = std::fs::remove_file(archive_path);
            }
            written.push(to.clone());
        }
        Archive::Zip => {
            let f = std::fs::File::open(archive_path).map_err(|e| PipelineError::Io(e.to_string()))?;
            let mut z = zip::ZipArchive::new(f).map_err(|e| PipelineError::Io(e.to_string()))?;
            for i in 0..z.len() {
                let mut e = z.by_index(i).map_err(|e| PipelineError::Io(e.to_string()))?;
                if e.is_dir() {
                    continue;
                }
                let name = e.name().replace('\\', "/");
                let Some(to) = target_for(&spec.files, &name) else { continue };
                let mut data = Vec::with_capacity(e.size() as usize);
                e.read_to_end(&mut data).map_err(|e| PipelineError::Io(e.to_string()))?;
                write_member(models, &to, &data)?;
                written.push(to);
            }
        }
        Archive::TarBz2 => {
            let f = std::fs::File::open(archive_path).map_err(|e| PipelineError::Io(e.to_string()))?;
            let dec = bzip2::read::BzDecoder::new(f);
            let mut t = tar::Archive::new(dec);
            for e in t.entries().map_err(|e| PipelineError::Io(e.to_string()))? {
                let mut e = e.map_err(|e| PipelineError::Io(e.to_string()))?;
                if !e.header().entry_type().is_file() {
                    continue;
                }
                let name = e
                    .path()
                    .map_err(|e| PipelineError::Io(e.to_string()))?
                    .to_string_lossy()
                    .replace('\\', "/");
                let Some(to) = target_for(&spec.files, &name) else { continue };
                let mut data = Vec::new();
                e.read_to_end(&mut data).map_err(|e| PipelineError::Io(e.to_string()))?;
                write_member(models, &to, &data)?;
                written.push(to);
            }
        }
    }

    // Mọi `from` là file lẻ đều phải tìm thấy; cây con phải chép được ít nhất 1 file.
    for f in &spec.files {
        let Some(from) = f.from.as_deref() else { continue };
        let found = if from.ends_with('/') {
            written.iter().any(|w| w.starts_with(&format!("{}/", f.to.trim_end_matches('/'))))
        } else {
            written.iter().any(|w| w == &f.to)
        };
        if !found {
            return Err(PipelineError::Io(format!(
                "gói '{}' thiếu '{from}' — bố cục archive đã đổi, cập nhật components.json",
                spec.id
            )));
        }
    }
    Ok(written)
}
```


- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test components_test`
Expected: PASS 12/12.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/components.rs src-tauri/tests/components_test.rs src-tauri/Cargo.toml src-tauri/Cargo.lock
git commit -m "feat(components): place_files cho zip/tar.bz2/raw, hỗ trợ cây con, chặn zip-slip"
```

---

### Task 4: `is_installed` + `.state` + `install_component` + `install_all`

**Files:**
- Modify: `src-tauri/src/components.rs`
- Test: `src-tauri/tests/components_test.rs`

**Interfaces:**
- Consumes: `download_verified`, `place_files`, `specs`.
- Produces:
  - `pub fn is_installed(spec: &ComponentSpec, models: &Path) -> bool`
  - `pub fn install_component(spec: &ComponentSpec, models: &Path, on: &mut dyn FnMut(Progress)) -> Result<(), PipelineError>`
  - `pub fn install_all(models: &Path, on: &mut dyn FnMut(&str, Progress)) -> Result<(), PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/components_test.rs`:

```rust
use app_lib::components::{install_component, is_installed};

#[test]
fn install_downloads_places_and_records_state() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(GET).path("/model.onnx");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();

    let mut s = spec("sense-voice", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    s.url = server.url("/model.onnx");
    s.sha256 = HELLO_SHA.into();

    assert!(!is_installed(&s, &models));
    install_component(&s, &models, &mut |_| {}).unwrap();

    assert_eq!(std::fs::read(models.join("sherpa/sense-voice.onnx")).unwrap(), b"hello world");
    assert!(models.join(".state").join("sense-voice.json").exists());
    assert!(is_installed(&s, &models));
    m.assert_hits(1);

    // Lần 2: bỏ qua hoàn toàn, không phát request nào nữa.
    install_component(&s, &models, &mut |_| {}).unwrap();
    m.assert_hits(1);
}

#[test]
fn install_with_bad_hash_leaves_no_target_and_no_state() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/bad.onnx");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();

    let mut s = spec("sense-voice", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    s.url = server.url("/bad.onnx");
    s.sha256 = "0000000000000000000000000000000000000000000000000000000000000000".into();

    assert!(install_component(&s, &models, &mut |_| {}).is_err());
    assert!(!models.join("sherpa/sense-voice.onnx").exists());
    assert!(!models.join(".state").join("sense-voice.json").exists());
    assert!(!is_installed(&s, &models));
}

#[test]
fn is_installed_false_when_state_hash_differs() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();
    std::fs::create_dir_all(models.join("sherpa")).unwrap();
    std::fs::write(models.join("sherpa/sense-voice.onnx"), b"x").unwrap();
    std::fs::create_dir_all(models.join(".state")).unwrap();
    std::fs::write(
        models.join(".state").join("sense-voice.json"),
        r#"{"sha256":"cũ","files":["sherpa/sense-voice.onnx"]}"#,
    )
    .unwrap();

    let mut s = spec("sense-voice", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    s.sha256 = "mới".into();
    assert!(!is_installed(&s, &models), "sha256 đổi ⇒ phải cài lại");
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test components_test`
Expected: FAIL — `install_component`/`is_installed` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

Thêm vào `src-tauri/src/components.rs`:

```rust
#[derive(serde::Serialize, serde::Deserialize)]
struct InstallState {
    sha256: String,
    files: Vec<String>,
}

fn state_path(models: &Path, id: &str) -> PathBuf {
    models.join(".state").join(format!("{id}.json"))
}

/// Đã cài = sổ `.state` ghi đúng sha256 hiện hành **và** mọi file trong sổ còn tồn tại.
pub fn is_installed(spec: &ComponentSpec, models: &Path) -> bool {
    let Ok(text) = std::fs::read_to_string(state_path(models, &spec.id)) else {
        return false;
    };
    let Ok(st) = serde_json::from_str::<InstallState>(&text) else {
        return false;
    };
    if !st.sha256.eq_ignore_ascii_case(&spec.sha256) {
        return false;
    }
    !st.files.is_empty()
        && st.files.iter().all(|f| {
            safe_join(models, f).map(|p| p.exists()).unwrap_or(false)
        })
}

pub fn install_component(
    spec: &ComponentSpec,
    models: &Path,
    on: &mut dyn FnMut(Progress),
) -> Result<(), PipelineError> {
    if is_installed(spec, models) {
        on(Progress::Done);
        return Ok(());
    }
    let tmp_dir = models.join(".tmp");
    std::fs::create_dir_all(&tmp_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let part = tmp_dir.join(format!("{}.part", spec.id));

    download_verified(&spec.url, &part, &spec.sha256, on)?;

    on(Progress::Extract);
    let files = place_files(&part, spec, models)?;
    let _ = std::fs::remove_file(&part);

    let sp = state_path(models, &spec.id);
    if let Some(d) = sp.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let st = InstallState { sha256: spec.sha256.clone(), files };
    std::fs::write(
        &sp,
        serde_json::to_string_pretty(&st).map_err(|e| PipelineError::Io(e.to_string()))?,
    )
    .map_err(|e| PipelineError::Io(e.to_string()))?;

    on(Progress::Done);
    Ok(())
}

/// Cài lần lượt mọi component; dừng ngay ở cái đầu tiên lỗi.
pub fn install_all(
    models: &Path,
    on: &mut dyn FnMut(&str, Progress),
) -> Result<(), PipelineError> {
    for spec in specs()? {
        if spec.sha256.trim().is_empty() {
            return Err(PipelineError::Io(format!(
                "component '{}' chưa ghim sha256 trong components.json — chạy `cargo run --bin pin_components`",
                spec.id
            )));
        }
        let id = spec.id.clone();
        install_component(&spec, models, &mut |p| on(&id, p))?;
    }
    Ok(())
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test components_test`
Expected: PASS 15/15.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/components.rs src-tauri/tests/components_test.rs
git commit -m "feat(components): install_component/install_all + sổ .state (bỏ qua khi đã cài đúng hash)"
```

---

### Task 5: Command `ensure_components` + nút UI

**Files:**
- Modify: `src-tauri/src/commands.rs` (xoá `documented_components()` ở dòng 26-58 — nay đã thừa; giữ `require_path`/`resolve_engine_ctx`)
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/App.tsx`
- Test: `src-tauri/tests/commands_test.rs`

**Interfaces:**
- Consumes: `components::{install_all, specs, is_installed, Progress}`, `config::models_dir`.
- Produces: `#[tauri::command] pub async fn ensure_components(app: tauri::AppHandle) -> Result<(), String>`; event `component_progress` `{ id, phase, done, total }` với `phase ∈ {"download","extract","done"}`.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/commands_test.rs`:

```rust
#[test]
fn components_missing_report_lists_ids_not_yet_installed() {
    let dir = tempfile::tempdir().unwrap();
    let missing = app_lib::commands::missing_component_ids(dir.path()).unwrap();
    assert_eq!(missing.len(), 8, "thư mục trống ⇒ cả 8 component đều thiếu");
    assert!(missing.contains(&"piper".to_string()));
}
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `cd src-tauri && cargo test --test commands_test`
Expected: FAIL — `missing_component_ids` chưa tồn tại.

- [ ] **Step 3: Cài đặt backend**

Trong `src-tauri/src/commands.rs`: **xoá** hàm `documented_components()` cùng khối chú thích TODO phía trên nó, bỏ `use crate::components::ComponentSpec;`, rồi thêm:

```rust
/// Danh sách id component chưa cài (dùng cho UI và test; không gọi mạng).
pub fn missing_component_ids(models: &std::path::Path) -> Result<Vec<String>, String> {
    let specs = crate::components::specs().map_err(|e| e.to_string())?;
    Ok(specs
        .into_iter()
        .filter(|s| !crate::components::is_installed(s, models))
        .map(|s| s.id)
        .collect())
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ComponentProgressEvent {
    id: String,
    phase: &'static str,
    done: u64,
    total: u64,
}

#[tauri::command]
pub async fn ensure_components(app: tauri::AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        use tauri::Emitter;
        let models = crate::config::models_dir();
        std::fs::create_dir_all(&models).map_err(|e| e.to_string())?;
        crate::components::install_all(&models, &mut |id, p| {
            let ev = match p {
                crate::components::Progress::Download { done, total } => ComponentProgressEvent {
                    id: id.to_string(), phase: "download", done, total,
                },
                crate::components::Progress::Extract => ComponentProgressEvent {
                    id: id.to_string(), phase: "extract", done: 0, total: 0,
                },
                crate::components::Progress::Done => ComponentProgressEvent {
                    id: id.to_string(), phase: "done", done: 0, total: 0,
                },
            };
            let _ = app.emit("component_progress", ev);
        })
        .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}
```

Trong `src-tauri/src/lib.rs`, thêm `commands::ensure_components,` vào `tauri::generate_handler![...]`.

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `cd src-tauri && cargo test --test commands_test`
Expected: PASS.

- [ ] **Step 5: Thêm nút và thanh tiến độ vào UI**

Trong `src/App.tsx`, thêm import sự kiện ở đầu file:

```tsx
import { listen } from "@tauri-apps/api/event";
```

Thêm state và effect sau dòng `const [tgt, setTgt] = useState("vi");`:

```tsx
const [dl, setDl] = useState("");

useEffect(() => {
  const un = listen<{ id: string; phase: string; done: number; total: number }>(
    "component_progress",
    (e) => {
      const { id, phase, done, total } = e.payload;
      if (phase === "download") {
        const pct = total > 0 ? ` ${Math.floor((done / total) * 100)}%` : ` ${(done / 1048576).toFixed(0)}MB`;
        setDl(`Đang tải ${id}${pct}`);
      } else if (phase === "extract") {
        setDl(`Đang giải nén ${id}...`);
      } else {
        setDl(`Xong ${id}`);
      }
    },
  );
  return () => { un.then((f) => f()); };
}, []);

async function onEnsure() {
  setRunning(true); setStatus("Đang chuẩn bị bộ công cụ...");
  try {
    await invoke("ensure_components");
    setStatus("Đã cài đủ bộ công cụ."); setDl("");
  } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
}
```

Thêm nút ngay trước nút "Chạy STT" trong khối `<div className="row">`:

```tsx
<button type="button" onClick={onEnsure} disabled={running}>Tải bộ công cụ</button>
```

Và hiện tiến độ ngay dưới nút đó:

```tsx
{dl && <p style={{ opacity: 0.7 }}>{dl}</p>}
```

- [ ] **Step 6: Kiểm tra biên dịch cả hai phía**

Run: `cd src-tauri && cargo build` rồi `cd .. && npm run build`
Expected: cả hai thành công, không cảnh báo về biến không dùng.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/src/lib.rs src/App.tsx src-tauri/tests/commands_test.rs
git commit -m "feat(components): command ensure_components + nút Tải bộ công cụ có tiến độ"
```

---

### Task 6: `pin_components` + ghim sha256 thật + cài thật

**Files:**
- Create: `src-tauri/src/bin/pin_components.rs`
- Create: `src-tauri/tests/e2e_components_test.rs`
- Modify: `src-tauri/components.json` (điền sha256 + size thật, sửa `from` nếu bố cục khác dự đoán)
- Modify: `src-tauri/Cargo.toml`

**Interfaces:**
- Consumes: `components::{specs, download_verified, Archive}`.
- Produces: binary dev `pin_components` (không nằm trong app); `components.json` đã ghim.

- [ ] **Step 1: Khai báo binary**

Thêm vào cuối `src-tauri/Cargo.toml`:

```toml
[[bin]]
name = "pin_components"
path = "src/bin/pin_components.rs"
```

- [ ] **Step 2: Viết công cụ**

Tạo `src-tauri/src/bin/pin_components.rs`:

```rust
//! Công cụ DEV (không đóng gói vào app): tải từng artifact trong components.json,
//! in sha256 + size thật và liệt kê entry đầu của archive để chốt chuỗi `from`.
//!
//!   cd src-tauri && cargo run --bin pin_components
//!
//! Sau đó chép giá trị in ra vào components.json rồi commit.

use app_lib::components::{specs, Archive};
use sha2::{Digest, Sha256};
use std::io::Read;

fn sha256_of(path: &std::path::Path) -> std::io::Result<(String, u64)> {
    let mut f = std::fs::File::open(path)?;
    let mut h = Sha256::new();
    let mut buf = vec![0u8; 65536];
    let mut n_total = 0u64;
    loop {
        let n = f.read(&mut buf)?;
        if n == 0 { break; }
        h.update(&buf[..n]);
        n_total += n as u64;
    }
    Ok((format!("{:x}", h.finalize()), n_total))
}

fn list_entries(path: &std::path::Path, archive: Archive) -> Vec<String> {
    let mut out = Vec::new();
    match archive {
        Archive::Zip => {
            if let Ok(f) = std::fs::File::open(path) {
                if let Ok(mut z) = zip::ZipArchive::new(f) {
                    for i in 0..z.len() {
                        if let Ok(e) = z.by_index(i) {
                            out.push(e.name().to_string());
                        }
                    }
                }
            }
        }
        Archive::TarBz2 => {
            if let Ok(f) = std::fs::File::open(path) {
                let dec = bzip2::read::BzDecoder::new(f);
                let mut t = tar::Archive::new(dec);
                if let Ok(entries) = t.entries() {
                    for e in entries.flatten() {
                        if let Ok(p) = e.path() {
                            out.push(p.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
        Archive::Raw => {}
    }
    out
}

fn main() {
    let dir = std::env::temp_dir().join("dvl-pin");
    std::fs::create_dir_all(&dir).unwrap();
    let specs = specs().expect("components.json hỏng");

    for s in &specs {
        let dest = dir.join(format!("{}.bin", s.id));
        if !dest.exists() {
            eprintln!("--> tải {} ...", s.id);
            // Ghim = chấp nhận bất kỳ hash nào ở lần đầu: tải bằng client thô, không verify.
            let mut resp = reqwest::blocking::Client::builder()
                .user_agent("DichVideo-Local/0.1")
                .connect_timeout(std::time::Duration::from_secs(30))
                .timeout(None)
                .build()
                .unwrap()
                .get(&s.url)
                .send()
                .unwrap_or_else(|e| panic!("{}: {e}", s.id));
            assert!(resp.status().is_success(), "{}: HTTP {}", s.id, resp.status());
            let mut f = std::fs::File::create(&dest).unwrap();
            std::io::copy(&mut resp, &mut f).unwrap();
        }
        let (sha, size) = sha256_of(&dest).unwrap();
        println!("\n=== {} ===\n  \"sha256\": \"{sha}\",\n  \"size\": {size},", s.id);

        let entries = list_entries(&dest, s.archive);
        if !entries.is_empty() {
            println!("  entries ({}), 40 dòng đầu:", entries.len());
            for e in entries.iter().take(40) {
                println!("    {e}");
            }
        }
    }
    println!("\nChép các giá trị trên vào src-tauri/components.json (và sửa 'from' nếu lệch).");
}
```

- [ ] **Step 3: Chạy công cụ thật (có mạng, ~428MB)**

Run: `cd src-tauri && cargo run --bin pin_components 2>&1 | tee ../pin-output.txt`
Expected: in ra 8 khối `=== <id> ===` kèm sha256 + size, và danh sách entry cho `ffmpeg`, `sherpa`, `piper`.

- [ ] **Step 4: Đối chiếu và điền `components.json`**

- Chép `sha256` + `size` của cả 8 vào `src-tauri/components.json`.
- **Kiểm tra chéo 2 giá trị đã biết trước:** `sense-voice` phải ra `c71f0ce00bec95b07744e116345e33d8cbbe08cef896382cf907bf4b51a2cd51`, `piper-voice-vi` phải ra `ec7c89e2c85f4d1edc24b6120c18aaf1bda614f06b511567eb9c7c0de15e2dab`. Lệch ⇒ dừng lại, điều tra (tải hỏng hoặc bị chặn/proxy chèn).
- Đối chiếu danh sách entry với 3 chuỗi `from` đang đoán; sửa cho khớp thực tế:
  - `ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe` và `.../ffprobe.exe`
  - `sherpa-onnx-v1.13.8-win-x64-shared-MT-Release/bin/`
  - `piper/`
- Nếu `sherpa` để `.dll` ở thư mục khác `bin/` (vd `lib/`), thêm một `FileMap` nữa: `{ "from": "…/lib/", "to": "sherpa" }`.

- [ ] **Step 5: Viết test E2E tải thật**

Tạo `src-tauri/tests/e2e_components_test.rs`:

```rust
//! E2E: tải & cài thật cả 8 component (~428MB). Bỏ qua mặc định; bật bằng:
//!   DVL_E2E_DOWNLOAD=1 cargo test --test e2e_components_test -- --ignored --nocapture

use app_lib::components::{install_all, specs};
use app_lib::config::models_dir;

#[test]
#[ignore]
fn e2e_install_all_components() {
    assert_eq!(
        std::env::var("DVL_E2E_DOWNLOAD").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_DOWNLOAD=1 để cho phép tải thật"
    );
    let models = models_dir();
    std::fs::create_dir_all(&models).unwrap();

    let t0 = std::time::Instant::now();
    let mut last_id = String::new();
    install_all(&models, &mut |id, p| {
        if id != last_id {
            last_id = id.to_string();
            println!("--> {id}");
        }
        if let app_lib::components::Progress::Download { done, total } = p {
            if total > 0 && (done * 100 / total) % 25 == 0 {
                println!("    {}%", done * 100 / total);
            }
        }
    })
    .unwrap_or_else(|e| panic!("cài thất bại: {e}"));
    println!("cài xong sau {:.0}s", t0.elapsed().as_secs_f32());

    // 5 đường dẫn M1 đòi + piper + voice
    for rel in [
        "ffmpeg/ffmpeg.exe",
        "sherpa/sherpa-onnx-vad-with-offline-asr.exe",
        "sherpa/sense-voice.onnx",
        "sherpa/tokens.txt",
        "sherpa/vad-model.onnx",
        "piper/piper.exe",
        "piper/vi_VN-vais1000-medium.onnx",
        "piper/vi_VN-vais1000-medium.onnx.json",
    ] {
        assert!(models.join(rel).exists(), "thiếu {rel} sau khi cài");
    }

    // Chạy lại: mọi component đều đã cài ⇒ không tải gì nữa.
    for s in specs().unwrap() {
        assert!(app_lib::components::is_installed(&s, &models), "{} phải ở trạng thái đã cài", s.id);
    }
}
```

- [ ] **Step 6: Chạy E2E thật**

Run: `cd src-tauri && DVL_E2E_DOWNLOAD=1 cargo test --test e2e_components_test -- --ignored --nocapture`
Expected: PASS, in thời gian cài, đủ 8 đường dẫn tồn tại.
Nếu thiếu `.dll` khiến bước sau chạy `piper.exe`/`sherpa...exe` lỗi, quay lại Step 4 bổ sung `FileMap`.

- [ ] **Step 7: Kiểm tra engine thật chạy được (chốt pha A)**

Run: `cd src-tauri && cargo test --test e2e_stt_test -- --ignored --nocapture` với `DVL_E2E_CLIP` trỏ tới 1 clip.
Expected: STT của M1 lần đầu tiên chạy trên model thật, trả `cue_count > 0`.
Chưa có clip thì tạo bằng:

```bash
# giọng SAPI tiếng Anh + nền đen 15s, chạy offline
powershell -c "Add-Type -AssemblyName System.Speech; \
  \$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; \
  \$s.SetOutputToWaveFile('$PWD/clip.wav'); \
  \$s.Speak('This is a short test clip for the translation pipeline. It has two sentences.'); \
  \$s.Dispose()"
"$APPDATA/dichvideo-local/models/ffmpeg/ffmpeg.exe" -y -f lavfi -i color=c=black:s=640x360:r=25 \
  -i clip.wav -shortest -c:v libx264 -c:a aac clip.mp4
```
Rồi `DVL_E2E_CLIP=$PWD/clip.mp4 DVL_E2E_LANG=en cargo test --test e2e_stt_test -- --ignored --nocapture`.

- [ ] **Step 8: Commit**

```bash
git add src-tauri/components.json src-tauri/src/bin/pin_components.rs src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tests/e2e_components_test.rs
git commit -m "feat(components): ghim sha256 thật cho 8 artifact + công cụ pin_components + E2E cài thật"
```

---

## Hoàn thành pha A khi

- `cargo test` xanh toàn bộ (15 test `components_test` + các test cũ của M1/M2).
- `DVL_E2E_DOWNLOAD=1 … e2e_components_test` cài đủ 8 artifact trên máy trắng.
- `e2e_stt_test` chạy được trên model thật — lần đầu tiên M1 được kiểm chứng end-to-end.
- `components.json` không còn `"sha256": ""`.
