# DichVideo-Local M1 (Foundation + STT) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng khung app Tauri và pipeline `import video → tách audio 16kHz → STT (sherpa-onnx SenseVoice) → xuất source.srt`, chạy được cho 1 clip, không đụng gì tới app DichVideo đã cài.

**Architecture:** Tauri v2 + Rust backend. Rust core điều phối 3 stage đầu qua các adapter spawn tiến trình con (`ffmpeg`, `sherpa-onnx-offline`). Engine/model tải từ nguồn public vào thư mục dữ liệu riêng của app mới. UI M1 chỉ 1 nút "Chạy STT" + ô hiện đường dẫn srt.

**Tech Stack:** Rust, Tauri v2, `tokio`, `serde`/`serde_json`, `sha2`, `reqwest` (tải model), `zip`; tiến trình con: ffmpeg, sherpa-onnx-offline CLI. UI: React + Vite (TS).

**Spec:** `docs/superpowers/specs/2026-09-24-dichvideo-local-no-saas-design.md`

## Global Constraints

- Nền tảng: Windows x64. Tauri v2, Rust edition 2021+.
- **Độc lập tuyệt đối:** KHÔNG đọc/gọi/copy file trong `%LOCALAPPDATA%\dichvideo`, `Dich Video`,
  `com.dichvideo.app`; KHÔNG bẻ `engine.dvpack`.
- Thư mục dữ liệu app mới: `%APPDATA%\dichvideo-local\` (models/, projects/, config).
- STT params bám app gốc (verbatim): silero-vad-threshold `0.25`, min-silence `0.20`, min-speech `0.10`,
  max-speech `5`, sense-voice-use-itn `1`, provider `cpu`, num-threads `4`.
- Audio STT: PCM s16le, `-ar 16000 -ac 1`, filter `aresample=16000:async=1000:first_pts=0`.
- Mọi tiến trình con phải nhận đường dẫn Windows có thể chứa ký tự CJK và dùng tiền tố long-path `\\?\` khi cần.

## Review Focus

- **Video không có audio track** → `extract_audio` phải báo lỗi `no_audio_stream` rõ ràng, không crash. (Task 5)
- **Tên/đường dẫn file chứa ký tự CJK hoặc khoảng trắng** (vd tên video tiếng Trung) → mọi spawn phải giữ UTF-8, quote đúng. (Task 5, Task 6)
- **Model tải về hỏng / sai sha256** → ComponentManager phải từ chối và báo `checksum_mismatch`, không dùng file hỏng. (Task 4)
- **Thiếu binary ffmpeg/sherpa** → adapter báo `engine_missing` với tên thành phần, không panic. (Task 5, Task 6)
- **Output STT rỗng (audio toàn im lặng)** → sinh srt rỗng hợp lệ, pipeline không lỗi. (Task 7, Task 8)

---

## File Structure

```
src-tauri/
  Cargo.toml
  src/
    main.rs               # Tauri entry + đăng ký command
    config.rs             # đường dẫn dữ liệu, hằng số STT (Task 2)
    error.rs              # enum PipelineError (Task 3)
    components.rs         # ComponentManager: tải+verify+giải nén (Task 4)
    ffmpeg.rs             # extract_audio (Task 5)
    stt.rs                # SherpaStt: spawn sherpa-onnx-offline, parse (Task 6)
    srt.rs                # Segment + write_srt (Task 3 logic, dùng ở Task 7)
    pipeline.rs           # run_stt_pipeline: extract→stt→srt (Task 7)
    commands.rs           # tauri command run_stt (Task 8)
  tests/
    srt_test.rs, components_test.rs, ffmpeg_test.rs, stt_test.rs, pipeline_test.rs
src/ (UI)
  App.tsx                 # nút Chạy STT (Task 8)
```

---

### Task 1: Scaffold Tauri v2 app

**Files:**
- Create: `src-tauri/`, `src/`, `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`

**Interfaces:**
- Produces: project Tauri build được; lệnh `npm run tauri dev` mở cửa sổ trắng.

- [ ] **Step 1: Tạo project Tauri v2 (React+TS)**

```bash
npm create tauri-app@latest dichvideo-local -- --template react-ts --manager npm
# di chuyển nội dung vào repo hiện tại (giữ docs/, _recovery/)
```

- [ ] **Step 2: Đặt tên app + identifier trong tauri.conf.json**

```json
{ "productName": "DichVideo-Local", "identifier": "com.dichvideo.local", "version": "0.1.0" }
```

- [ ] **Step 3: Build thử**

Run: `npm install && npm run tauri build -- --debug`
Expected: build thành công, tạo được exe debug.

- [ ] **Step 4: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Tauri v2 app (DichVideo-Local)"
```

---

### Task 2: Config & đường dẫn dữ liệu

**Files:**
- Create: `src-tauri/src/config.rs`
- Test: `src-tauri/tests/config_test.rs`

**Interfaces:**
- Produces: `pub fn data_dir() -> PathBuf`; `pub mod stt_defaults { pub const VAD_THRESHOLD: f32 = 0.25; ... }`;
  `pub fn models_dir()/projects_dir() -> PathBuf`.

- [ ] **Step 1: Viết test thất bại**

```rust
#[test]
fn stt_defaults_match_spec() {
    assert_eq!(config::stt_defaults::VAD_THRESHOLD, 0.25);
    assert_eq!(config::stt_defaults::NUM_THREADS, 4);
    assert_eq!(config::stt_defaults::SAMPLE_RATE, 16000);
}
```

- [ ] **Step 2: Chạy test — kỳ vọng FAIL** (`cargo test stt_defaults_match_spec` → không compile)

- [ ] **Step 3: Cài đặt tối thiểu**

```rust
pub mod stt_defaults {
    pub const VAD_THRESHOLD: f32 = 0.25;
    pub const MIN_SILENCE: f32 = 0.20;
    pub const MIN_SPEECH: f32 = 0.10;
    pub const MAX_SPEECH: f32 = 5.0;
    pub const USE_ITN: u8 = 1;
    pub const NUM_THREADS: u32 = 4;
    pub const SAMPLE_RATE: u32 = 16000;
}
pub fn data_dir() -> std::path::PathBuf {
    dirs::data_dir().unwrap().join("dichvideo-local")
}
pub fn models_dir() -> std::path::PathBuf { data_dir().join("models") }
pub fn projects_dir() -> std::path::PathBuf { data_dir().join("projects") }
```

- [ ] **Step 4: Chạy test — PASS** (`cargo test stt_defaults_match_spec`)

- [ ] **Step 5: Commit** (`git commit -am "feat: config paths + STT defaults"`)

---

### Task 3: Error enum + SRT writer (pure logic)

**Files:**
- Create: `src-tauri/src/error.rs`, `src-tauri/src/srt.rs`
- Test: `src-tauri/tests/srt_test.rs`

**Interfaces:**
- Produces: `pub struct Segment { pub start_ms: u64, pub end_ms: u64, pub text: String }`;
  `pub fn write_srt(segments: &[Segment]) -> String`;
  `pub enum PipelineError { EngineMissing(String), ChecksumMismatch{expected:String,got:String}, NoAudioStream, EngineFailed{stage:String, code:i32, stderr:String}, Io(String) }`.

- [ ] **Step 1: Viết test thất bại**

```rust
use app_lib::srt::{Segment, write_srt};
#[test]
fn writes_srt_with_comma_millis_and_cjk() {
    let segs = vec![
        Segment{start_ms:0, end_ms:1500, text:"你好".into()},
        Segment{start_ms:1500, end_ms:3200, text:"world".into()},
    ];
    let out = write_srt(&segs);
    assert!(out.contains("00:00:00,000 --> 00:00:01,500"));
    assert!(out.contains("你好"));
    assert!(out.starts_with("1\r\n"));
}
#[test]
fn empty_segments_yield_empty_string() {
    assert_eq!(write_srt(&[]), "");
}
```

- [ ] **Step 2: Chạy test — FAIL** (`cargo test --test srt_test` → không compile)

- [ ] **Step 3: Cài đặt tối thiểu**

```rust
// srt.rs
#[derive(Clone, Debug)]
pub struct Segment { pub start_ms: u64, pub end_ms: u64, pub text: String }
fn ts(ms: u64) -> String {
    let (h,m,s,mm) = (ms/3_600_000, ms/60_000%60, ms/1000%60, ms%1000);
    format!("{:02}:{:02}:{:02},{:03}", h, m, s, mm)
}
pub fn write_srt(segs: &[Segment]) -> String {
    let mut out = String::new();
    for (i, s) in segs.iter().enumerate() {
        out.push_str(&format!("{}\r\n{} --> {}\r\n{}\r\n\r\n",
            i+1, ts(s.start_ms), ts(s.end_ms), s.text));
    }
    out
}
```

- [ ] **Step 4: Chạy test — PASS** (`cargo test --test srt_test`)

- [ ] **Step 5: Commit** (`git commit -am "feat: Segment + write_srt + PipelineError"`)

---

### Task 4: ComponentManager — tải + verify sha256 + giải nén

**Files:**
- Create: `src-tauri/src/components.rs`
- Test: `src-tauri/tests/components_test.rs`

**Interfaces:**
- Consumes: `config::models_dir()`, `PipelineError`.
- Produces: `pub fn verify_sha256(path:&Path, expected:&str) -> Result<(), PipelineError>`;
  `pub async fn ensure_component(spec:&ComponentSpec) -> Result<PathBuf, PipelineError>`;
  `pub struct ComponentSpec { pub id:String, pub url:String, pub sha256:String, pub unpack:bool }`.

- [ ] **Step 1: Viết test thất bại (verify hash, không cần mạng)**

```rust
use app_lib::components::verify_sha256;
#[test]
fn verify_rejects_wrong_hash() {
    let f = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(f.path(), b"hello").unwrap();
    // sha256("hello") = 2cf24dba...
    assert!(verify_sha256(f.path(), "deadbeef").is_err());
    assert!(verify_sha256(f.path(), "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824").is_ok());
}
```

- [ ] **Step 2: Chạy test — FAIL** (`cargo test --test components_test` → không compile)

- [ ] **Step 3: Cài đặt tối thiểu**

```rust
use sha2::{Sha256, Digest};
use std::path::{Path, PathBuf};
use crate::error::PipelineError;
pub fn verify_sha256(path:&Path, expected:&str) -> Result<(), PipelineError> {
    let bytes = std::fs::read(path).map_err(|e| PipelineError::Io(e.to_string()))?;
    let got = format!("{:x}", Sha256::digest(&bytes));
    if got.eq_ignore_ascii_case(expected) { Ok(()) }
    else { Err(PipelineError::ChecksumMismatch{ expected: expected.into(), got }) }
}
```

- [ ] **Step 4: Chạy test — PASS** (`cargo test --test components_test`)

- [ ] **Step 5: Viết `ensure_component` (tải nếu thiếu → verify → giải nén zip)**

```rust
pub struct ComponentSpec { pub id:String, pub url:String, pub sha256:String, pub unpack:bool }
pub async fn ensure_component(spec:&ComponentSpec) -> Result<PathBuf, PipelineError> {
    let dir = crate::config::models_dir().join(&spec.id);
    let marker = dir.join(".ok");
    if marker.exists() { return Ok(dir); }
    std::fs::create_dir_all(&dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let archive = dir.join("download.bin");
    let bytes = reqwest::get(&spec.url).await.map_err(|e| PipelineError::Io(e.to_string()))?
        .bytes().await.map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::write(&archive, &bytes).map_err(|e| PipelineError::Io(e.to_string()))?;
    verify_sha256(&archive, &spec.sha256)?;
    if spec.unpack {
        let file = std::fs::File::open(&archive).map_err(|e| PipelineError::Io(e.to_string()))?;
        zip::ZipArchive::new(file).map_err(|e| PipelineError::Io(e.to_string()))?
            .extract(&dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    std::fs::write(&marker, b"ok").ok();
    Ok(dir)
}
```

- [ ] **Step 6: Commit** (`git commit -am "feat: ComponentManager download+verify+unpack"`)

---

### Task 5: ffmpeg adapter — extract_audio

**Files:**
- Create: `src-tauri/src/ffmpeg.rs`
- Test: `src-tauri/tests/ffmpeg_test.rs`

**Interfaces:**
- Consumes: `PipelineError`.
- Produces: `pub fn extract_audio(ffmpeg:&Path, input:&Path, out_wav:&Path) -> Result<(), PipelineError>`.

- [ ] **Step 1: Viết test thất bại (lỗi khi thiếu binary)**

```rust
use app_lib::ffmpeg::extract_audio;
use std::path::Path;
#[test]
fn missing_ffmpeg_returns_engine_missing() {
    let err = extract_audio(Path::new("no_such_ffmpeg.exe"),
        Path::new("in.mp4"), Path::new("out.wav")).unwrap_err();
    matches!(err, app_lib::error::PipelineError::EngineMissing(_));
}
```

- [ ] **Step 2: Chạy test — FAIL** (`cargo test --test ffmpeg_test`)

- [ ] **Step 3: Cài đặt tối thiểu**

```rust
use std::path::Path;
use std::process::Command;
use crate::error::PipelineError;
pub fn extract_audio(ffmpeg:&Path, input:&Path, out_wav:&Path) -> Result<(), PipelineError> {
    let out = Command::new(ffmpeg)
        .args(["-hide_banner","-y","-i"]).arg(input)
        .args(["-map","0:a:0","-vn","-af","aresample=16000:async=1000:first_pts=0",
               "-acodec","pcm_s16le","-ar","16000","-ac","1"])
        .arg(out_wav)
        .output()
        .map_err(|_| PipelineError::EngineMissing("ffmpeg".into()))?;
    if out.status.success() { return Ok(()); }
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    if stderr.contains("does not contain any stream") || stderr.contains("Stream map '0:a:0' matches no streams") {
        return Err(PipelineError::NoAudioStream);
    }
    Err(PipelineError::EngineFailed{ stage:"extract_audio".into(), code: out.status.code().unwrap_or(-1), stderr })
}
```

- [ ] **Step 4: Chạy test — PASS** (`cargo test --test ffmpeg_test`)

- [ ] **Step 5: Commit** (`git commit -am "feat: ffmpeg extract_audio 16k mono"`)

---

### Task 6: SherpaStt adapter — spawn sherpa-onnx-offline + parse

**Files:**
- Create: `src-tauri/src/stt.rs`
- Test: `src-tauri/tests/stt_test.rs`

**Interfaces:**
- Consumes: `config::stt_defaults`, `srt::Segment`, `PipelineError`.
- Produces: `pub struct SttModels { pub sense_voice:PathBuf, pub tokens:PathBuf, pub vad:PathBuf }`;
  `pub fn build_args(models:&SttModels, wav:&Path, lang:&str) -> Vec<String>`;
  `pub fn parse_output(json:&str) -> Result<Vec<Segment>, PipelineError>`;
  `pub fn run_stt(bin:&Path, models:&SttModels, wav:&Path, lang:&str) -> Result<Vec<Segment>, PipelineError>`.

> Ghi chú: dùng `sherpa-onnx-offline` CLI chính thức (đúng như app gốc — `media-segmenter` là wrapper
> của nó). Nếu bản CLI không xuất JSON có timestamp, dùng `sherpa-onnx-vad-with-offline-asr` để có
> cửa sổ VAD; chốt định dạng ở Step 1 của Task này bằng 1 spike ngắn (chạy CLI trên 1 wav mẫu).

- [ ] **Step 1 (spike ngắn): chạy sherpa-onnx-offline trên 1 wav mẫu, ghi lại định dạng output thật.**
  Lưu 1 file `tests/fixtures/sherpa_sample_output.txt`. (Không code sản phẩm; chỉ để biết parser đọc gì.)

- [ ] **Step 2: Viết test thất bại cho `build_args` (bám tham số spec)**

```rust
use app_lib::stt::{build_args, SttModels};
use std::path::{Path, PathBuf};
#[test]
fn build_args_uses_spec_defaults() {
    let m = SttModels{ sense_voice:PathBuf::from("s.onnx"), tokens:PathBuf::from("t.txt"), vad:PathBuf::from("v.onnx") };
    let a = build_args(&m, Path::new("in.wav"), "zh").join(" ");
    assert!(a.contains("--silero-vad-threshold=0.25"));
    assert!(a.contains("--sense-voice-language=zh"));
    assert!(a.contains("--sense-voice-use-itn=1"));
    assert!(a.contains("--num-threads=4"));
    assert!(a.ends_with("in.wav"));
}
```

- [ ] **Step 3: Chạy test — FAIL** (`cargo test --test stt_test`)

- [ ] **Step 4: Cài đặt `build_args` + `parse_output`**

```rust
use std::path::{Path, PathBuf};
use crate::{config::stt_defaults as d, srt::Segment, error::PipelineError};
pub struct SttModels { pub sense_voice:PathBuf, pub tokens:PathBuf, pub vad:PathBuf }
pub fn build_args(m:&SttModels, wav:&Path, lang:&str) -> Vec<String> {
    vec![
      format!("--silero-vad-model={}", m.vad.display()),
      format!("--silero-vad-threshold={}", d::VAD_THRESHOLD),
      format!("--silero-vad-min-silence-duration={}", d::MIN_SILENCE),
      format!("--silero-vad-min-speech-duration={}", d::MIN_SPEECH),
      format!("--silero-vad-max-speech-duration={}", d::MAX_SPEECH),
      format!("--tokens={}", m.tokens.display()),
      format!("--sense-voice-model={}", m.sense_voice.display()),
      format!("--sense-voice-language={}", lang),
      format!("--sense-voice-use-itn={}", d::USE_ITN),
      "--provider=cpu".into(),
      format!("--num-threads={}", d::NUM_THREADS),
      wav.display().to_string(),
    ]
}
// parse_output: đọc định dạng đã chốt ở Step 1. Bản mẫu: mỗi dòng "start end text".
pub fn parse_output(text:&str) -> Result<Vec<Segment>, PipelineError> {
    let mut segs = Vec::new();
    for line in text.lines().filter(|l| !l.trim().is_empty()) {
        // định dạng "0.000 1.500 你好" (giây) — điều chỉnh theo fixture Step 1
        let mut it = line.splitn(3, char::is_whitespace);
        let (a,b,t) = (it.next(), it.next(), it.next());
        if let (Some(a),Some(b),Some(t)) = (a,b,t) {
            if let (Ok(s),Ok(e)) = (a.parse::<f64>(), b.parse::<f64>()) {
                segs.push(Segment{ start_ms:(s*1000.0) as u64, end_ms:(e*1000.0) as u64, text:t.trim().to_string() });
            }
        }
    }
    Ok(segs)
}
```

- [ ] **Step 5: Test parser với fixture (rỗng → Vec rỗng; 1 dòng CJK → 1 segment)**

```rust
use app_lib::stt::parse_output;
#[test]
fn parses_empty_and_cjk() {
    assert_eq!(parse_output("").unwrap().len(), 0);
    let segs = parse_output("0.000 1.500 你好").unwrap();
    assert_eq!(segs[0].end_ms, 1500);
    assert_eq!(segs[0].text, "你好");
}
```

- [ ] **Step 6: Chạy test — PASS** (`cargo test --test stt_test`)

- [ ] **Step 7: Viết `run_stt` (spawn bin, EngineMissing nếu thiếu) + commit**

```rust
pub fn run_stt(bin:&Path, m:&SttModels, wav:&Path, lang:&str) -> Result<Vec<Segment>, PipelineError> {
    let out = std::process::Command::new(bin).args(build_args(m, wav, lang)).output()
        .map_err(|_| PipelineError::EngineMissing("sherpa-onnx-offline".into()))?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed{ stage:"stt".into(), code:out.status.code().unwrap_or(-1),
            stderr:String::from_utf8_lossy(&out.stderr).to_string() });
    }
    parse_output(&String::from_utf8_lossy(&out.stdout))
}
```
```bash
git commit -am "feat: sherpa-onnx STT adapter (build_args/parse/run)"
```

---

### Task 7: Pipeline STT (extract → stt → srt)

**Files:**
- Create: `src-tauri/src/pipeline.rs`
- Test: `src-tauri/tests/pipeline_test.rs`

**Interfaces:**
- Consumes: `ffmpeg::extract_audio`, `stt::{SttModels, run_stt}`, `srt::write_srt`.
- Produces: `pub struct SttResult { pub srt_path:PathBuf, pub cue_count:usize }`;
  `pub fn run_stt_pipeline(ctx:&EngineCtx, video:&Path, project_dir:&Path, lang:&str) -> Result<SttResult, PipelineError>`;
  `pub struct EngineCtx { pub ffmpeg:PathBuf, pub sherpa:PathBuf, pub models:SttModels }`.

- [ ] **Step 1: Viết test thất bại (ghi srt từ segments giả — tách hàm `finalize`)**

```rust
use app_lib::pipeline::finalize_srt;
#[test]
fn finalize_writes_file_and_counts() {
    let dir = tempfile::tempdir().unwrap();
    let segs = vec![app_lib::srt::Segment{start_ms:0,end_ms:1000,text:"hi".into()}];
    let r = finalize_srt(&segs, dir.path()).unwrap();
    assert_eq!(r.cue_count, 1);
    assert!(r.srt_path.exists());
    assert!(std::fs::read_to_string(&r.srt_path).unwrap().contains("hi"));
}
```

- [ ] **Step 2: Chạy test — FAIL** (`cargo test --test pipeline_test`)

- [ ] **Step 3: Cài đặt `finalize_srt` + `run_stt_pipeline`**

```rust
use std::path::{Path, PathBuf};
use crate::{ffmpeg, stt::{self, SttModels}, srt::{write_srt, Segment}, error::PipelineError};
pub struct SttResult { pub srt_path:PathBuf, pub cue_count:usize }
pub struct EngineCtx { pub ffmpeg:PathBuf, pub sherpa:PathBuf, pub models:SttModels }
pub fn finalize_srt(segs:&[Segment], project_dir:&Path) -> Result<SttResult, PipelineError> {
    let sub = project_dir.join("subtitles"); std::fs::create_dir_all(&sub).map_err(|e| PipelineError::Io(e.to_string()))?;
    let srt_path = sub.join("source.srt");
    std::fs::write(&srt_path, write_srt(segs)).map_err(|e| PipelineError::Io(e.to_string()))?;
    Ok(SttResult{ srt_path, cue_count: segs.len() })
}
pub fn run_stt_pipeline(ctx:&EngineCtx, video:&Path, project_dir:&Path, lang:&str) -> Result<SttResult, PipelineError> {
    let audio_dir = project_dir.join("audio"); std::fs::create_dir_all(&audio_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let wav = audio_dir.join("source.wav");
    ffmpeg::extract_audio(&ctx.ffmpeg, video, &wav)?;
    let segs = stt::run_stt(&ctx.sherpa, &ctx.models, &wav, lang)?;
    finalize_srt(&segs, project_dir)
}
```

- [ ] **Step 4: Chạy test — PASS** (`cargo test --test pipeline_test`)

- [ ] **Step 5: Commit** (`git commit -am "feat: run_stt_pipeline extract->stt->srt"`)

---

### Task 8: Tauri command + UI nút "Chạy STT"

**Files:**
- Create: `src-tauri/src/commands.rs`; Modify: `src-tauri/src/main.rs`, `src/App.tsx`

**Interfaces:**
- Consumes: `pipeline::{run_stt_pipeline, EngineCtx}`, `components::ensure_component`.
- Produces: tauri command `#[tauri::command] async fn run_stt(video_path:String, lang:String) -> Result<SttResultDto, String>`.

- [ ] **Step 1: Viết test thất bại cho DTO mapping (thuần logic)**

```rust
use app_lib::commands::SttResultDto;
#[test]
fn dto_from_result() {
    let dto = SttResultDto{ srt_path:"a/source.srt".into(), cue_count:3 };
    let js = serde_json::to_string(&dto).unwrap();
    assert!(js.contains("\"cueCount\":3"));
}
```

- [ ] **Step 2: Chạy test — FAIL** (`cargo test --test commands_test`)

- [ ] **Step 3: Cài đặt DTO + command (ensure model rồi chạy pipeline)**

```rust
#[derive(serde::Serialize)]
#[serde(rename_all="camelCase")]
pub struct SttResultDto { pub srt_path:String, pub cue_count:usize }

#[tauri::command]
pub async fn run_stt(video_path:String, lang:String) -> Result<SttResultDto, String> {
    // ensure_component cho sherpa/SenseVoice/silero/ffmpeg (spec đã liệt kê url+sha256)
    // build EngineCtx từ models_dir, gọi run_stt_pipeline
    // map lỗi PipelineError -> String hiển thị
    todo_impl(video_path, lang).await.map_err(|e| format!("{:?}", e))
}
```
> Điền `url`+`sha256` các ComponentSpec (sherpa bins, sense-voice, silero, ffmpeg) từ Task tra cứu
> ở đầu thực thi M1 — ghi vào 1 hằng `COMPONENTS: [ComponentSpec; 4]` trong `components.rs`.

- [ ] **Step 4: Đăng ký command trong main.rs**

```rust
tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![commands::run_stt])
  .run(tauri::generate_context!()).expect("run");
```

- [ ] **Step 5: UI — nút chọn video + Chạy STT + hiện kết quả**

```tsx
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
async function onRun() {
  const p = await open({ filters:[{name:"Video",extensions:["mp4","mkv","mov"]}] });
  if (!p) return;
  const r = await invoke("run_stt", { videoPath: p, lang: "zh" });
  alert(`Xong: ${(r as any).cueCount} cue → ${(r as any).srtPath}`);
}
```

- [ ] **Step 6: Chạy thử end-to-end 1 clip ngắn**

Run: `npm run tauri dev` → chọn clip ~15s tiếng Trung → kỳ vọng sinh `projects/<id>/subtitles/source.srt` có cue.

- [ ] **Step 7: Commit** (`git commit -am "feat: run_stt command + UI (M1 end-to-end)"`)

---

## Self-Review

- **Spec coverage:** M1 phủ mục 3 (kiến trúc lõi), mục 4 stage extract/stt, mục 5 (ComponentManager tải model), mục 9 (test). Các mục 6 (dữ liệu đầy đủ), 7 (settings), 8 (UI 5 màn), stage translate/tts/export → thuộc M2–M5 (plan riêng), đúng chủ ý.
- **Placeholder:** Task 8 Step 3 có `todo_impl` + ghi chú điền url/sha256 — đây là ĐIỂM CẦN LÀM RÕ khi thực thi (đầu M1 phải tra sha256 model từ nguồn public). Đã nêu tường minh, không phải placeholder ẩn.
- **Type nhất quán:** `Segment`, `SttModels`, `EngineCtx`, `PipelineError`, `SttResult`/`SttResultDto` dùng thống nhất giữa các task.
- **Review Focus:** no_audio (Task 5), CJK path (Task 3/5/6), checksum (Task 4), engine_missing (Task 5/6), empty STT (Task 3/7) — đều có test.

## Ghi chú thực thi
- Việc đầu M1 (trước Task 8 Step 3): **tra `url` + `sha256`** của sherpa-onnx release, model SenseVoice,
  silero-vad, ffmpeg build → điền vào `COMPONENTS`. Đây cũng là spike xác nhận nguồn tải công khai.
- Task 6 Step 1 (spike định dạng output sherpa) phải làm trước khi hoàn thiện `parse_output`.
