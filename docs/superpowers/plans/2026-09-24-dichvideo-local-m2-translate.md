# DichVideo-Local M2 (Translate multi-provider) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Từ `subtitles/source.srt` (M1), người dùng chọn provider (Google free mặc định | LLM OpenAI-compatible với key riêng) và bấm "Dịch" → `subtitles/translated.<tgt>.srt` cùng số cue/timing; lỗi provider hiện rõ tiếng Việt.

**Architecture:** Trait `TranslateProvider` (sync, `reqwest::blocking`) + 2 impl (`GoogleFree`, `OpenAiCompat`), batcher `translate_segments` giữ timing 1:1, stage `run_translate_stage` trong pipeline, config JSON plaintext `data_dir()/config.json`, 3 Tauri command (`run_translate`, `get_config`, `save_config`) chạy qua `spawn_blocking`, UI thêm khối "Dịch" sau STT.

**Tech Stack:** Rust, Tauri v2, `reqwest` (blocking + json + rustls), `serde`/`serde_json`, dev: `httpmock`, `tempfile`. UI React+TS.

**Spec:** `docs/superpowers/specs/2026-09-24-dichvideo-local-m2-translate-design.md`

## Global Constraints

- Windows x64, Tauri v2, crate `app_lib`; **độc lập tuyệt đối** với app DichVideo đã cài.
- Trait contract: `Ok(v)` ⇒ `v.len() == texts.len()` cùng thứ tự; vi phạm ⇒ `ProviderError`.
- `batch_size`: `google_free` = **20**, `openai_compat` = **40**.
- Timeout mỗi request **30s**; User-Agent **`DichVideo-Local/0.1`**.
- LLM: `temperature` **0.2**, `response_format: {"type":"json_object"}`, **retry đúng 1 lần** khi JSON hỏng/sai số item; **không fallback** provider.
- SYSTEM_PROMPT (verbatim): `Bạn là dịch giả phụ đề. Dịch từng item sang ngôn ngữ đích, giữ nguyên số lượng và thứ tự, không thêm giải thích. Trả về JSON đúng dạng {"items":[{"i":<số>,"text":"<bản dịch>"}]}.`
- Mặc định config: `default_provider="google_free"`, `target_lang="vi"`, `openai.base_url="https://api.openai.com/v1"`, `openai.model="gpt-4o-mini"`, `openai.api_key=""`.
- **Không log api_key**: `OpenAiConfig` tự impl `Debug` che key thành `"***"`.
- SRT: CRLF, `HH:MM:SS,mmm`. Output: `subtitles/translated.<tgt>.srt`.
- Command không chặn runtime Tauri: dùng `tauri::async_runtime::spawn_blocking`.

## Review Focus

- **`source.srt` rỗng (0 cue)** → `Ok(cue_count=0)`, ghi srt rỗng, **không gọi mạng** (Task 3 + Task 6).
- **LLM trả items đúng số nhưng đảo thứ tự `i`** → phải sắp theo `i` rồi mới ghép (Task 5).
- **Cue nhiều dòng / chứa dấu `"` và `\n`** → `parse_srt` giữ nguyên; JSON serde escape đúng (Task 1, Task 5).
- **HTTP 429 từ Google/LLM** → `ProviderError{status:429}` với Display "Quá giới hạn gọi API" (Task 2, 4, 5).
- **Chưa có `source.srt` khi bấm Dịch** → `Io("Chưa có source.srt — chạy STT trước")`, không panic (Task 6).

---

## File Structure

```
src-tauri/Cargo.toml                 + reqwest features ["rustls-tls","blocking","json"]; dev httpmock
src-tauri/src/lib.rs                 + pub mod translate; đăng ký 3 command
src-tauri/src/srt.rs                 + parse_srt                                  (Task 1)
src-tauri/src/error.rs               + ProviderError + Display                    (Task 2)
src-tauri/src/config.rs              + AppConfig/TranslateConfig/OpenAiConfig, load/save (Task 2)
src-tauri/src/translate/mod.rs       trait + translate_segments + make_provider  (Task 3)
src-tauri/src/translate/google_free.rs                                           (Task 4)
src-tauri/src/translate/openai_compat.rs                                         (Task 5)
src-tauri/src/pipeline.rs            + TranslateResult + run_translate_stage     (Task 6)
src-tauri/src/commands.rs            + run_translate/get_config/save_config, projectDir (Task 7)
src/App.tsx                          + khối "Dịch"                                (Task 7)
src-tauri/tests/{srt_parse_test,config_test(+),error_test(+),translate_core_test,
                 google_free_test,openai_compat_test,pipeline_test(+),commands_test(+),e2e_translate_test}.rs
```

---

### Task 1: `parse_srt` (thuần logic)

**Files:**
- Modify: `src-tauri/src/srt.rs` (thêm sau `write_srt`, dòng 28)
- Test: `src-tauri/tests/srt_parse_test.rs`

**Interfaces:**
- Consumes: `Segment`, `PipelineError::EngineFailed`.
- Produces: `pub fn parse_srt(text:&str) -> Result<Vec<Segment>, PipelineError>`.

- [ ] **Step 1: Viết test thất bại**

```rust
use app_lib::error::PipelineError;
use app_lib::srt::{parse_srt, write_srt, Segment};

#[test]
fn parses_crlf_bom_cjk_and_roundtrips() {
    let src = "\u{feff}1\r\n00:00:00,000 --> 00:00:05,212\r\n市场规模。\r\n\r\n2\r\n00:00:05,308 --> 00:00:10,780\r\nhello \"world\"\r\n\r\n";
    let segs = parse_srt(src).unwrap();
    assert_eq!(segs.len(), 2);
    assert_eq!(segs[0].start_ms, 0);
    assert_eq!(segs[0].end_ms, 5212);
    assert_eq!(segs[0].text, "市场规模。");
    assert_eq!(segs[1].text, "hello \"world\"");
    let back = write_srt(&segs);
    assert_eq!(back, src.trim_start_matches('\u{feff}'));
}

#[test]
fn parses_lf_and_multiline_text() {
    let segs = parse_srt("1\n00:01:02,003 --> 00:01:03,004\nline a\nline b\n\n").unwrap();
    assert_eq!(segs[0].start_ms, 62_003);
    assert_eq!(segs[0].end_ms, 63_004);
    assert_eq!(segs[0].text, "line a\nline b");
}

#[test]
fn empty_is_empty_and_bad_block_is_err() {
    assert!(parse_srt("").unwrap().is_empty());
    assert!(parse_srt("   \r\n\r\n").unwrap().is_empty());
    let err = parse_srt("1\r\nnot a timestamp\r\ntext\r\n").unwrap_err();
    match err {
        PipelineError::EngineFailed { stage, .. } => assert_eq!(stage, "srt_parse"),
        _ => panic!("expected EngineFailed srt_parse"),
    }
}
```

- [ ] **Step 2: Chạy — FAIL** (`cargo test --test srt_parse_test` → `parse_srt` không tồn tại)

- [ ] **Step 3: Cài đặt**

```rust
// srt.rs — thêm:
use crate::error::PipelineError;

fn parse_ts(s: &str) -> Option<u64> {
    // "HH:MM:SS,mmm" (chấp nhận '.' thay ',')
    let s = s.trim().replace('.', ",");
    let (hms, ms) = s.split_once(',')?;
    let mut it = hms.split(':');
    let h: u64 = it.next()?.parse().ok()?;
    let m: u64 = it.next()?.parse().ok()?;
    let sec: u64 = it.next()?.parse().ok()?;
    let ms: u64 = ms.parse().ok()?;
    Some(h * 3_600_000 + m * 60_000 + sec * 1000 + ms)
}

pub fn parse_srt(text: &str) -> Result<Vec<Segment>, PipelineError> {
    let text = text.trim_start_matches('\u{feff}').replace("\r\n", "\n");
    let mut segs = Vec::new();
    for block in text.split("\n\n").map(str::trim).filter(|b| !b.is_empty()) {
        let mut lines = block.lines();
        let bad = || PipelineError::EngineFailed { stage: "srt_parse".into(), code: 0, stderr: block.to_string() };
        let _index = lines.next().ok_or_else(bad)?;
        let timing = lines.next().ok_or_else(bad)?;
        let (a, b) = timing.split_once("-->").ok_or_else(bad)?;
        let (start_ms, end_ms) = (parse_ts(a).ok_or_else(bad)?, parse_ts(b).ok_or_else(bad)?);
        let text = lines.collect::<Vec<_>>().join("\n");
        segs.push(Segment { start_ms, end_ms, text });
    }
    Ok(segs)
}
```

- [ ] **Step 4: Chạy — PASS** (`cargo test --test srt_parse_test`; chạy thêm `cargo test --test srt_test` để chắc `write_srt` không đổi)

- [ ] **Step 5: Commit** (`git commit -am "feat(srt): parse_srt with CRLF/BOM/multiline support"`)

---

### Task 2: `ProviderError` + `AppConfig` load/save

**Files:**
- Modify: `src-tauri/src/error.rs` (enum dòng 2-8, `code()` dòng 11-19, Display dòng 24-45)
- Modify: `src-tauri/src/config.rs` (thêm cuối file)
- Test: `src-tauri/tests/error_test.rs` (thêm), `src-tauri/tests/config_test.rs` (thêm)

**Interfaces:**
- Produces: `PipelineError::ProviderError { provider:String, status:Option<u16>, msg:String }` (code `"provider_error"`);
  `config::{AppConfig, TranslateConfig, OpenAiConfig, config_path, load_config, save_config}`.

- [ ] **Step 1: Viết test thất bại (error)**

```rust
// thêm vào tests/error_test.rs
use app_lib::error::PipelineError;

#[test]
fn provider_error_display_maps_status_to_vietnamese() {
    let e = |status: Option<u16>, msg: &str| PipelineError::ProviderError { provider: "openai_compat".into(), status, msg: msg.into() };
    assert_eq!(e(Some(401), "x").code(), "provider_error");
    assert!(e(Some(401), "x").to_string().contains("[provider_error] openai_compat: API key sai hoặc không có quyền"));
    assert!(e(Some(429), "x").to_string().contains("Quá giới hạn gọi API"));
    assert!(e(Some(503), "x").to_string().contains("Dịch vụ lỗi phía server (503)"));
    assert!(e(None, "Hết thời gian chờ").to_string().contains("Hết thời gian chờ"));
    let long = "a".repeat(500);
    let s = e(Some(200), &long).to_string();
    assert!(s.len() < 300, "msg phải bị cắt ~200 ký tự");
}
```

- [ ] **Step 2: Viết test thất bại (config)**

```rust
// thêm vào tests/config_test.rs
use app_lib::config::{AppConfig, OpenAiConfig};

#[test]
fn config_defaults_match_spec() {
    let c = AppConfig::default();
    assert_eq!(c.translate.default_provider, "google_free");
    assert_eq!(c.translate.target_lang, "vi");
    assert_eq!(c.translate.openai.base_url, "https://api.openai.com/v1");
    assert_eq!(c.translate.openai.model, "gpt-4o-mini");
    assert_eq!(c.translate.openai.api_key, "");
}

#[test]
fn config_json_roundtrip_and_debug_redacts_key() {
    let mut c = AppConfig::default();
    c.translate.openai.api_key = "sk-secret-123".into();
    let json = serde_json::to_string(&c).unwrap();
    let back: AppConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(back.translate.openai.api_key, "sk-secret-123");
    let dbg = format!("{:?}", OpenAiConfig { api_key: "sk-secret-123".into(), ..Default::default() });
    assert!(!dbg.contains("sk-secret-123"));
    assert!(dbg.contains("***"));
}

#[test]
fn broken_json_falls_back_to_default() {
    let v: Result<AppConfig, _> = serde_json::from_str("{not json");
    assert!(v.is_err()); // load_config phải bắt lỗi này và trả Default (kiểm tra qua hàm helper bên dưới)
    assert_eq!(app_lib::config::parse_config_or_default("{not json").translate.default_provider, "google_free");
}
```

- [ ] **Step 3: Chạy — FAIL** (`cargo test --test error_test --test config_test`)

- [ ] **Step 4: Cài đặt error.rs**

```rust
// enum: thêm variant
    ProviderError { provider: String, status: Option<u16>, msg: String },
// code(): thêm
            PipelineError::ProviderError { .. } => "provider_error",
// Display: thêm arm
            PipelineError::ProviderError { provider, status, msg } => {
                let vi = match status {
                    Some(401) | Some(403) => "API key sai hoặc không có quyền".to_string(),
                    Some(429) => "Quá giới hạn gọi API, thử lại sau".to_string(),
                    Some(s) if *s >= 500 => format!("Dịch vụ lỗi phía server ({s})"),
                    _ => msg.chars().take(200).collect(),
                };
                write!(f, "[provider_error] {provider}: {vi}")
            }
```

- [ ] **Step 5: Cài đặt config.rs**

```rust
use serde::{Deserialize, Serialize};
use crate::error::PipelineError;

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct AppConfig { #[serde(default)] pub translate: TranslateConfig }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TranslateConfig {
    pub default_provider: String,
    pub target_lang: String,
    #[serde(default)] pub openai: OpenAiConfig,
}
impl Default for TranslateConfig {
    fn default() -> Self {
        Self { default_provider: "google_free".into(), target_lang: "vi".into(), openai: OpenAiConfig::default() }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OpenAiConfig { pub base_url: String, pub api_key: String, pub model: String }
impl Default for OpenAiConfig {
    fn default() -> Self {
        Self { base_url: "https://api.openai.com/v1".into(), api_key: String::new(), model: "gpt-4o-mini".into() }
    }
}
impl std::fmt::Debug for OpenAiConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("OpenAiConfig").field("base_url", &self.base_url)
            .field("api_key", &"***").field("model", &self.model).finish()
    }
}

pub fn config_path() -> PathBuf { data_dir().join("config.json") }

pub fn parse_config_or_default(text: &str) -> AppConfig {
    serde_json::from_str(text).unwrap_or_else(|e| {
        eprintln!("config.json hỏng, dùng mặc định: {e}");
        AppConfig::default()
    })
}

pub fn load_config() -> AppConfig {
    match std::fs::read_to_string(config_path()) {
        Ok(t) => parse_config_or_default(&t),
        Err(_) => AppConfig::default(),
    }
}

pub fn save_config(cfg: &AppConfig) -> Result<(), PipelineError> {
    let p = config_path();
    if let Some(dir) = p.parent() { std::fs::create_dir_all(dir).map_err(|e| PipelineError::Io(e.to_string()))?; }
    let json = serde_json::to_string_pretty(cfg).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::write(&p, json).map_err(|e| PipelineError::Io(e.to_string()))
}
```

- [ ] **Step 6: Chạy — PASS** (`cargo test --test error_test --test config_test`; full `cargo test` để chắc match arms cũ vẫn compile)

- [ ] **Step 7: Commit** (`git commit -am "feat: ProviderError + AppConfig load/save (plaintext, key redacted in Debug)"`)

---

### Task 3: trait `TranslateProvider` + `translate_segments` + `make_provider` (skeleton)

**Files:**
- Create: `src-tauri/src/translate/mod.rs`
- Modify: `src-tauri/src/lib.rs:9` (thêm `pub mod translate;`)
- Test: `src-tauri/tests/translate_core_test.rs`

**Interfaces:**
- Consumes: `Segment`, `PipelineError`, `config::TranslateConfig`.
- Produces: `pub trait TranslateProvider { fn id(&self)->&'static str; fn batch_size(&self)->usize; fn translate_batch(&self, texts:&[&str], src:&str, tgt:&str)->Result<Vec<String>,PipelineError>; }`;
  `pub fn translate_segments(p:&dyn TranslateProvider, segs:&[Segment], src:&str, tgt:&str)->Result<Vec<Segment>,PipelineError>`;
  `pub fn make_provider(id:&str, cfg:&TranslateConfig)->Result<Box<dyn TranslateProvider>,PipelineError>` (Task 4/5 điền impl; ở Task 3 trả `ProviderError{msg:"provider chưa hỗ trợ"}` cho mọi id).

- [ ] **Step 1: Viết test thất bại**

```rust
use app_lib::error::PipelineError;
use app_lib::srt::Segment;
use app_lib::translate::{translate_segments, TranslateProvider};
use std::cell::RefCell;

struct Fake { calls: RefCell<Vec<usize>>, bad_len: bool }
impl TranslateProvider for Fake {
    fn id(&self) -> &'static str { "fake" }
    fn batch_size(&self) -> usize { 3 }
    fn translate_batch(&self, texts: &[&str], _s: &str, _t: &str) -> Result<Vec<String>, PipelineError> {
        self.calls.borrow_mut().push(texts.len());
        if self.bad_len { return Ok(vec!["x".into()]); }
        Ok(texts.iter().map(|t| format!("VI:{t}")).collect())
    }
}
fn segs(n: usize) -> Vec<Segment> {
    (0..n).map(|i| Segment { start_ms: i as u64 * 1000, end_ms: i as u64 * 1000 + 500, text: format!("t{i}") }).collect()
}

#[test]
fn chunks_by_batch_size_and_keeps_order_and_timing() {
    let p = Fake { calls: RefCell::new(vec![]), bad_len: false };
    let out = translate_segments(&p, &segs(7), "zh", "vi").unwrap();
    assert_eq!(p.calls.borrow().as_slice(), &[3, 3, 1]);
    assert_eq!(out.len(), 7);
    assert_eq!(out[4].text, "VI:t4");
    assert_eq!(out[4].start_ms, 4000);
    assert_eq!(out[4].end_ms, 4500);
}

#[test]
fn empty_input_makes_no_calls() {
    let p = Fake { calls: RefCell::new(vec![]), bad_len: false };
    assert!(translate_segments(&p, &[], "zh", "vi").unwrap().is_empty());
    assert!(p.calls.borrow().is_empty());
}

#[test]
fn length_mismatch_is_provider_error() {
    let p = Fake { calls: RefCell::new(vec![]), bad_len: true };
    let err = translate_segments(&p, &segs(2), "zh", "vi").unwrap_err();
    assert!(matches!(err, PipelineError::ProviderError { .. }));
}
```

- [ ] **Step 2: Chạy — FAIL** (`cargo test --test translate_core_test`)

- [ ] **Step 3: Cài đặt `translate/mod.rs`**

```rust
use crate::{config::TranslateConfig, error::PipelineError, srt::Segment};

pub trait TranslateProvider {
    fn id(&self) -> &'static str;
    fn batch_size(&self) -> usize;
    fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str) -> Result<Vec<String>, PipelineError>;
}

pub fn translate_segments(
    p: &dyn TranslateProvider, segs: &[Segment], src: &str, tgt: &str,
) -> Result<Vec<Segment>, PipelineError> {
    let mut out = Vec::with_capacity(segs.len());
    let bs = p.batch_size().max(1);
    for chunk in segs.chunks(bs) {
        let texts: Vec<&str> = chunk.iter().map(|s| s.text.as_str()).collect();
        let translated = p.translate_batch(&texts, src, tgt)?;
        if translated.len() != chunk.len() {
            return Err(PipelineError::ProviderError {
                provider: p.id().into(), status: None,
                msg: format!("trả {} dòng, cần {}", translated.len(), chunk.len()),
            });
        }
        for (s, t) in chunk.iter().zip(translated) {
            out.push(Segment { start_ms: s.start_ms, end_ms: s.end_ms, text: t });
        }
    }
    Ok(out)
}

pub fn make_provider(id: &str, _cfg: &TranslateConfig) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    Err(PipelineError::ProviderError { provider: id.into(), status: None, msg: "provider chưa hỗ trợ".into() })
}
```

- [ ] **Step 4: Chạy — PASS** (`cargo test --test translate_core_test`)

- [ ] **Step 5: Commit** (`git commit -am "feat(translate): TranslateProvider trait + batcher"`)

---

### Task 4: `GoogleFree` provider

**Files:**
- Create: `src-tauri/src/translate/google_free.rs`
- Modify: `src-tauri/src/translate/mod.rs` (`pub mod google_free;` + `make_provider` nhánh `"google_free"`)
- Modify: `src-tauri/Cargo.toml:29` → `reqwest = { version = "0.12", features = ["rustls-tls", "blocking", "json"], default-features = false }`; `[dev-dependencies]` + `httpmock = "0.7"`
- Test: `src-tauri/tests/google_free_test.rs`

**Interfaces:**
- Produces: `pub struct GoogleFree { pub endpoint: String }`; `impl GoogleFree { pub fn new() -> Self /* endpoint mặc định */; pub fn with_endpoint(url:String)->Self }`; impl `TranslateProvider` với `id="google_free"`, `batch_size=20`.
- Nội bộ dùng chung: `pub(crate) fn http_client() -> reqwest::blocking::Client` trong `translate/mod.rs` (timeout 30s, UA).

- [ ] **Step 1: Viết test thất bại**

```rust
use app_lib::error::PipelineError;
use app_lib::translate::{google_free::GoogleFree, TranslateProvider};
use httpmock::prelude::*;

#[test]
fn parses_gtx_response_and_sends_params() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(GET).path("/translate_a/single")
            .query_param("client", "gtx").query_param("sl", "auto").query_param("tl", "vi")
            .query_param("dt", "t").query_param("q", "你好");
        then.status(200).body(r#"[[["Xin chào","你好",null,null,10]],null,"zh"]"#);
    });
    let p = GoogleFree::with_endpoint(server.url("/translate_a/single"));
    assert_eq!(p.id(), "google_free");
    assert_eq!(p.batch_size(), 20);
    let out = p.translate_batch(&["你好"], "auto", "vi").unwrap();
    assert_eq!(out, vec!["Xin chào"]);
    m.assert();
}

#[test]
fn concatenates_multi_sentence_chunks() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET);
        then.status(200).body(r#"[[["Câu một. ","句一。",null,null,1],["Câu hai.","句二。",null,null,1]],null,"zh"]"#);
    });
    let p = GoogleFree::with_endpoint(server.url("/translate_a/single"));
    assert_eq!(p.translate_batch(&["句一。句二。"], "auto", "vi").unwrap(), vec!["Câu một. Câu hai."]);
}

#[test]
fn http_429_and_weird_body_are_provider_errors() {
    let server = MockServer::start();
    server.mock(|when, then| { when.method(GET).query_param("q", "a"); then.status(429).body("slow down"); });
    server.mock(|when, then| { when.method(GET).query_param("q", "b"); then.status(200).body("<html>captcha</html>"); });
    let p = GoogleFree::with_endpoint(server.url("/translate_a/single"));
    match p.translate_batch(&["a"], "auto", "vi").unwrap_err() {
        PipelineError::ProviderError { status, .. } => assert_eq!(status, Some(429)),
        e => panic!("{e:?}"),
    }
    match p.translate_batch(&["b"], "auto", "vi").unwrap_err() {
        PipelineError::ProviderError { status, msg, .. } => { assert_eq!(status, Some(200)); assert!(msg.contains("captcha")); }
        e => panic!("{e:?}"),
    }
}
```

- [ ] **Step 2: Chạy — FAIL** (`cargo test --test google_free_test`)

- [ ] **Step 3: Cài đặt** (thêm vào `mod.rs`: `pub mod google_free;` và helper)

```rust
// translate/mod.rs — thêm
pub(crate) fn http_client() -> reqwest::blocking::Client {
    reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .user_agent("DichVideo-Local/0.1")
        .build()
        .expect("reqwest client")
}
pub(crate) fn map_http_err(provider: &str, e: reqwest::Error) -> PipelineError {
    let msg = if e.is_timeout() { "Hết thời gian chờ".to_string() } else { e.to_string() };
    PipelineError::ProviderError { provider: provider.into(), status: e.status().map(|s| s.as_u16()), msg }
}
// make_provider: thay thân hàm
pub fn make_provider(id: &str, cfg: &TranslateConfig) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    match id {
        "google_free" => Ok(Box::new(google_free::GoogleFree::new())),
        _ => Err(PipelineError::ProviderError { provider: id.into(), status: None, msg: "provider chưa hỗ trợ".into() }),
    }
}
```

```rust
// translate/google_free.rs
use super::{http_client, map_http_err, TranslateProvider};
use crate::error::PipelineError;

pub struct GoogleFree { pub endpoint: String }
impl GoogleFree {
    pub fn new() -> Self { Self::with_endpoint("https://translate.googleapis.com/translate_a/single".into()) }
    pub fn with_endpoint(endpoint: String) -> Self { Self { endpoint } }
    fn one(&self, text: &str, src: &str, tgt: &str) -> Result<String, PipelineError> {
        let resp = http_client().get(&self.endpoint)
            .query(&[("client", "gtx"), ("sl", src), ("tl", tgt), ("dt", "t"), ("q", text)])
            .send().map_err(|e| map_http_err("google_free", e))?;
        let status = resp.status().as_u16();
        let body = resp.text().map_err(|e| map_http_err("google_free", e))?;
        if !(200..300).contains(&status) {
            return Err(PipelineError::ProviderError { provider: "google_free".into(), status: Some(status), msg: body.chars().take(200).collect() });
        }
        let v: serde_json::Value = serde_json::from_str(&body).map_err(|_| PipelineError::ProviderError {
            provider: "google_free".into(), status: Some(200), msg: body.chars().take(200).collect() })?;
        let parts = v.get(0).and_then(|a| a.as_array()).ok_or_else(|| PipelineError::ProviderError {
            provider: "google_free".into(), status: Some(200), msg: body.chars().take(200).collect() })?;
        Ok(parts.iter().filter_map(|p| p.get(0).and_then(|s| s.as_str())).collect::<String>().trim().to_string())
    }
}
impl TranslateProvider for GoogleFree {
    fn id(&self) -> &'static str { "google_free" }
    fn batch_size(&self) -> usize { 20 }
    fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str) -> Result<Vec<String>, PipelineError> {
        texts.iter().map(|t| self.one(t, src, tgt)).collect()
    }
}
```

- [ ] **Step 4: Chạy — PASS** (`cargo test --test google_free_test`)

- [ ] **Step 5: Commit** (`git commit -am "feat(translate): GoogleFree provider (gtx) with httpmock tests"`)

---

### Task 5: `OpenAiCompat` provider (JSON mode, retry 1 lần)

**Files:**
- Create: `src-tauri/src/translate/openai_compat.rs`
- Modify: `src-tauri/src/translate/mod.rs` (`pub mod openai_compat;` + nhánh `"openai_compat"` trong `make_provider`, kiểm tra thiếu cấu hình)
- Test: `src-tauri/tests/openai_compat_test.rs`

**Interfaces:**
- Produces: `pub struct OpenAiCompat { pub base_url:String, pub api_key:String, pub model:String }`; `pub const SYSTEM_PROMPT:&str`; impl `TranslateProvider` với `id="openai_compat"`, `batch_size=40`.
- `make_provider("openai_compat", cfg)`: thiếu `api_key`/`base_url`/`model` (rỗng) ⇒ `ProviderError{msg:"thiếu cấu hình openai_compat: api_key/base_url/model"}`.

- [ ] **Step 1: Viết test thất bại**

```rust
use app_lib::config::TranslateConfig;
use app_lib::error::PipelineError;
use app_lib::translate::{make_provider, openai_compat::OpenAiCompat, TranslateProvider};
use httpmock::prelude::*;

fn ok_body(items: &str) -> String {
    let content = format!(r#"{{"items":[{items}]}}"#);
    serde_json::json!({"choices":[{"message":{"role":"assistant","content":content}}]}).to_string()
}
fn p(server: &MockServer) -> OpenAiCompat {
    OpenAiCompat { base_url: server.url("/v1"), api_key: "sk-test".into(), model: "gpt-4o-mini".into() }
}

#[test]
fn sends_bearer_json_mode_and_parses_items_sorted_by_i() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(POST).path("/v1/chat/completions")
            .header("authorization", "Bearer sk-test")
            .body_contains(r#""response_format":{"type":"json_object"}"#)
            .body_contains(r#""temperature":0.2"#)
            .body_contains("Bạn là dịch giả phụ đề");
        then.status(200).body(ok_body(r#"{"i":1,"text":"hai"},{"i":0,"text":"một \"q\"\nx"}"#));
    });
    let out = p(&server).translate_batch(&["一", "二"], "zh", "vi").unwrap();
    assert_eq!(out, vec!["một \"q\"\nx", "hai"]);
    m.assert();
    assert_eq!(p(&server).batch_size(), 40);
}

#[test]
fn retries_once_on_bad_count_then_succeeds() {
    let server = MockServer::start();
    let bad = server.mock(|when, then| {
        when.method(POST).body_contains("retry-marker-never"); then.status(500);
    });
    // httpmock trả mock theo thứ tự đăng ký khi cùng match: dùng 2 mock với hits giới hạn
    let first = server.mock(|when, then| { when.method(POST); then.status(200).body(ok_body(r#"{"i":0,"text":"only one"}"#)); });
    let out = {
        let prov = p(&server);
        let r1 = prov.translate_batch(&["a", "b"], "zh", "vi");
        first.delete();
        let good = server.mock(|when, then| { when.method(POST); then.status(200).body(ok_body(r#"{"i":0,"text":"A"},{"i":1,"text":"B"}"#)); });
        let r2 = prov.translate_batch(&["a", "b"], "zh", "vi");
        (r1, r2, good.hits())
    };
    // r1: lần 1 sai số (mock first), retry lần 2 vẫn gặp mock first ⇒ Err; r2: mock good ⇒ Ok
    assert!(matches!(out.0, Err(PipelineError::ProviderError { .. })));
    assert_eq!(out.1.unwrap(), vec!["A", "B"]);
    assert_eq!(out.2, 1);
    let _ = bad;
}

#[test]
fn bad_count_twice_is_error_with_exactly_two_requests() {
    let server = MockServer::start();
    let m = server.mock(|when, then| { when.method(POST); then.status(200).body(ok_body(r#"{"i":0,"text":"x"}"#)); });
    let err = p(&server).translate_batch(&["a", "b"], "zh", "vi").unwrap_err();
    assert!(matches!(err, PipelineError::ProviderError { .. }));
    assert_eq!(m.hits(), 2, "phải retry đúng 1 lần");
}

#[test]
fn http_401_is_provider_error_with_vietnamese_message() {
    let server = MockServer::start();
    server.mock(|when, then| { when.method(POST); then.status(401).body(r#"{"error":"bad key"}"#); });
    let err = p(&server).translate_batch(&["a"], "zh", "vi").unwrap_err();
    match &err { PipelineError::ProviderError { status, .. } => assert_eq!(*status, Some(401)), e => panic!("{e:?}") }
    assert!(err.to_string().contains("API key sai"));
}

#[test]
fn make_provider_requires_config() {
    let mut cfg = TranslateConfig::default(); // api_key rỗng
    assert!(matches!(make_provider("openai_compat", &cfg).unwrap_err(), PipelineError::ProviderError { .. }));
    cfg.openai.api_key = "k".into();
    assert_eq!(make_provider("openai_compat", &cfg).unwrap().id(), "openai_compat");
    assert_eq!(make_provider("google_free", &cfg).unwrap().id(), "google_free");
}
```

- [ ] **Step 2: Chạy — FAIL** (`cargo test --test openai_compat_test`)

- [ ] **Step 3: Cài đặt**

```rust
// translate/openai_compat.rs
use super::{http_client, map_http_err, TranslateProvider};
use crate::error::PipelineError;
use serde::{Deserialize, Serialize};

pub const SYSTEM_PROMPT: &str = "Bạn là dịch giả phụ đề. Dịch từng item sang ngôn ngữ đích, giữ nguyên số lượng và thứ tự, không thêm giải thích. Trả về JSON đúng dạng {\"items\":[{\"i\":<số>,\"text\":\"<bản dịch>\"}]}.";

pub struct OpenAiCompat { pub base_url: String, pub api_key: String, pub model: String }

#[derive(Serialize)] struct Item<'a> { i: usize, text: &'a str }
#[derive(Deserialize)] struct OutItem { i: usize, text: String }
#[derive(Deserialize)] struct OutItems { items: Vec<OutItem> }
#[derive(Deserialize)] struct Msg { content: String }
#[derive(Deserialize)] struct Choice { message: Msg }
#[derive(Deserialize)] struct ChatResp { choices: Vec<Choice> }

impl OpenAiCompat {
    fn perr(&self, status: Option<u16>, msg: impl Into<String>) -> PipelineError {
        PipelineError::ProviderError { provider: "openai_compat".into(), status, msg: msg.into() }
    }
    fn once(&self, texts: &[&str], src: &str, tgt: &str) -> Result<Vec<String>, PipelineError> {
        let items: Vec<Item> = texts.iter().enumerate().map(|(i, t)| Item { i, text: t }).collect();
        let user = serde_json::json!({ "src": src, "tgt": tgt, "items": items });
        let body = serde_json::json!({
            "model": self.model, "temperature": 0.2,
            "response_format": { "type": "json_object" },
            "messages": [ {"role":"system","content": SYSTEM_PROMPT}, {"role":"user","content": user.to_string()} ]
        });
        let url = format!("{}/chat/completions", self.base_url.trim_end_matches('/'));
        let resp = http_client().post(url).bearer_auth(&self.api_key).json(&body)
            .send().map_err(|e| map_http_err("openai_compat", e))?;
        let status = resp.status().as_u16();
        let text = resp.text().map_err(|e| map_http_err("openai_compat", e))?;
        if !(200..300).contains(&status) {
            return Err(self.perr(Some(status), text.chars().take(200).collect::<String>()));
        }
        let chat: ChatResp = serde_json::from_str(&text).map_err(|_| self.perr(Some(200), text.chars().take(200).collect::<String>()))?;
        let content = chat.choices.first().map(|c| c.message.content.as_str()).ok_or_else(|| self.perr(Some(200), "không có choices"))?;
        let mut out: OutItems = serde_json::from_str(content).map_err(|_| self.perr(Some(200), content.chars().take(200).collect::<String>()))?;
        out.items.sort_by_key(|x| x.i);
        let ok = out.items.len() == texts.len() && out.items.iter().enumerate().all(|(k, x)| x.i == k);
        if !ok { return Err(self.perr(Some(200), format!("LLM trả {} item (cần {})", out.items.len(), texts.len()))); }
        Ok(out.items.into_iter().map(|x| x.text).collect())
    }
}

impl TranslateProvider for OpenAiCompat {
    fn id(&self) -> &'static str { "openai_compat" }
    fn batch_size(&self) -> usize { 40 }
    fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str) -> Result<Vec<String>, PipelineError> {
        match self.once(texts, src, tgt) {
            Ok(v) => Ok(v),
            // retry đúng 1 lần chỉ khi lỗi nội dung (status 200 nhưng JSON/số item sai); lỗi HTTP không retry
            Err(PipelineError::ProviderError { status: Some(200), .. }) => self.once(texts, src, tgt),
            Err(e) => Err(e),
        }
    }
}
```

```rust
// translate/mod.rs — make_provider nhánh mới
        "openai_compat" => {
            let o = &cfg.openai;
            if o.api_key.trim().is_empty() || o.base_url.trim().is_empty() || o.model.trim().is_empty() {
                return Err(PipelineError::ProviderError { provider: id.into(), status: None,
                    msg: "thiếu cấu hình openai_compat: api_key/base_url/model".into() });
            }
            Ok(Box::new(openai_compat::OpenAiCompat { base_url: o.base_url.clone(), api_key: o.api_key.clone(), model: o.model.clone() }))
        }
```

- [ ] **Step 4: Chạy — PASS** (`cargo test --test openai_compat_test`; nếu test `retries_once_on_bad_count_then_succeeds` khó ổn định với httpmock, đơn giản hoá còn `bad_count_twice_is_error_with_exactly_two_requests` + một test "lần 1 sai, lần 2 đúng" bằng `Mock::hits` với `then.status(200)` đổi body qua `delete()` như trên — mục tiêu bắt buộc: **đúng 2 request khi sai số**, **1 request khi đúng**)

- [ ] **Step 5: Commit** (`git commit -am "feat(translate): OpenAI-compatible provider, JSON mode, single retry"`)

---

### Task 6: `run_translate_stage`

**Files:**
- Modify: `src-tauri/src/pipeline.rs` (thêm cuối; import `translate::TranslateProvider`, `srt::parse_srt`)
- Test: `src-tauri/tests/pipeline_test.rs` (thêm)

**Interfaces:**
- Produces: `pub struct TranslateResult { pub srt_path:PathBuf, pub cue_count:usize }`;
  `pub fn run_translate_stage(project_dir:&Path, p:&dyn TranslateProvider, src:&str, tgt:&str) -> Result<TranslateResult,PipelineError>`.

- [ ] **Step 1: Viết test thất bại**

```rust
// thêm vào tests/pipeline_test.rs
use app_lib::pipeline::run_translate_stage;
use app_lib::translate::TranslateProvider;

struct Upper;
impl TranslateProvider for Upper {
    fn id(&self) -> &'static str { "upper" }
    fn batch_size(&self) -> usize { 10 }
    fn translate_batch(&self, t: &[&str], _: &str, _: &str) -> Result<Vec<String>, PipelineError> {
        Ok(t.iter().map(|s| s.to_uppercase()).collect())
    }
}

#[test]
fn translate_stage_reads_source_writes_translated_keeping_timing() {
    let dir = tempfile::tempdir().unwrap();
    let segs = vec![
        Segment { start_ms: 0, end_ms: 1000, text: "abc".into() },
        Segment { start_ms: 1000, end_ms: 2000, text: "def".into() },
    ];
    app_lib::pipeline::finalize_srt(&segs, dir.path()).unwrap();
    let r = run_translate_stage(dir.path(), &Upper, "auto", "vi").unwrap();
    assert_eq!(r.cue_count, 2);
    assert!(r.srt_path.ends_with("subtitles/translated.vi.srt") || r.srt_path.ends_with("subtitles\\translated.vi.srt"));
    let out = app_lib::srt::parse_srt(&std::fs::read_to_string(&r.srt_path).unwrap()).unwrap();
    assert_eq!(out[1].text, "DEF");
    assert_eq!(out[1].start_ms, 1000);
}

#[test]
fn translate_stage_without_source_is_clear_io_error() {
    let dir = tempfile::tempdir().unwrap();
    let err = run_translate_stage(dir.path(), &Upper, "auto", "vi").unwrap_err();
    match err { PipelineError::Io(m) => assert!(m.contains("Chưa có source.srt")), e => panic!("{e:?}") }
}

#[test]
fn translate_stage_empty_source_gives_zero_cues() {
    let dir = tempfile::tempdir().unwrap();
    app_lib::pipeline::finalize_srt(&[], dir.path()).unwrap();
    let r = run_translate_stage(dir.path(), &Upper, "auto", "vi").unwrap();
    assert_eq!(r.cue_count, 0);
    assert_eq!(std::fs::read_to_string(r.srt_path).unwrap(), "");
}
```

- [ ] **Step 2: Chạy — FAIL** (`cargo test --test pipeline_test`)

- [ ] **Step 3: Cài đặt**

```rust
// pipeline.rs — thêm imports: use crate::{srt::parse_srt, translate::{translate_segments, TranslateProvider}};
pub struct TranslateResult { pub srt_path: PathBuf, pub cue_count: usize }

pub fn run_translate_stage(
    project_dir: &Path, p: &dyn TranslateProvider, src: &str, tgt: &str,
) -> Result<TranslateResult, PipelineError> {
    let sub = project_dir.join("subtitles");
    let source = sub.join("source.srt");
    let text = std::fs::read_to_string(&source)
        .map_err(|_| PipelineError::Io(format!("Chưa có source.srt — chạy STT trước ({})", source.display())))?;
    let segs = parse_srt(&text)?;
    let translated = translate_segments(p, &segs, src, tgt)?;
    let srt_path = sub.join(format!("translated.{tgt}.srt"));
    std::fs::write(&srt_path, srt::write_srt(&translated)).map_err(|e| PipelineError::Io(e.to_string()))?;
    Ok(TranslateResult { srt_path, cue_count: translated.len() })
}
```

- [ ] **Step 4: Chạy — PASS** (`cargo test --test pipeline_test`)

- [ ] **Step 5: Commit** (`git commit -am "feat(pipeline): run_translate_stage source.srt -> translated.<tgt>.srt"`)

---

### Task 7: Commands + `projectDir` + UI "Dịch" + E2E

**Files:**
- Modify: `src-tauri/src/commands.rs` (`SttResultDto` dòng 9-14; `run_stt` dòng 84-99; thêm 3 command)
- Modify: `src-tauri/src/lib.rs:16` (`generate_handler![commands::run_stt, commands::run_translate, commands::get_config, commands::save_config]`)
- Modify: `src/App.tsx`
- Test: `src-tauri/tests/commands_test.rs` (thêm), Create: `src-tauri/tests/e2e_translate_test.rs`

**Interfaces:**
- Produces: `SttResultDto { srt_path, cue_count, project_dir }` (camelCase); `TranslateResultDto { srt_path, cue_count }`;
  `#[tauri::command] async fn run_translate(project_dir:String, provider:String, src:String, tgt:String) -> Result<TranslateResultDto,String>`;
  `#[tauri::command] fn get_config() -> AppConfig`; `#[tauri::command] fn save_config(cfg:AppConfig) -> Result<(),String>`.

- [ ] **Step 1: Viết test thất bại (DTO)**

```rust
// thêm vào tests/commands_test.rs
#[test]
fn dtos_are_camel_case_and_stt_has_project_dir() {
    let s = app_lib::commands::SttResultDto { srt_path: "a".into(), cue_count: 1, project_dir: "p".into() };
    let js = serde_json::to_string(&s).unwrap();
    assert!(js.contains("\"projectDir\":\"p\"") && js.contains("\"cueCount\":1"));
    let t = app_lib::commands::TranslateResultDto { srt_path: "b".into(), cue_count: 2 };
    assert!(serde_json::to_string(&t).unwrap().contains("\"cueCount\":2"));
}
```

- [ ] **Step 2: Chạy — FAIL** (`cargo test --test commands_test`)

- [ ] **Step 3: Cài đặt commands.rs**

```rust
// SttResultDto: thêm field
    pub project_dir: String,
// run_stt: điền project_dir: project_dir.display().to_string() vào Ok(SttResultDto{..})
// và bọc phần blocking: 
//   let dto = tauri::async_runtime::spawn_blocking(move || -> Result<SttResultDto, String> { ...code cũ... })
//       .await.map_err(|e| e.to_string())??;   Ok(dto)

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslateResultDto { pub srt_path: String, pub cue_count: usize }

#[tauri::command]
pub async fn run_translate(project_dir: String, provider: String, src: String, tgt: String) -> Result<TranslateResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<TranslateResultDto, String> {
        let cfg = crate::config::load_config();
        let p = crate::translate::make_provider(&provider, &cfg.translate).map_err(|e| e.to_string())?;
        let r = crate::pipeline::run_translate_stage(Path::new(&project_dir), p.as_ref(), &src, &tgt).map_err(|e| e.to_string())?;
        Ok(TranslateResultDto { srt_path: r.srt_path.display().to_string(), cue_count: r.cue_count })
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
pub fn get_config() -> crate::config::AppConfig { crate::config::load_config() }

#[tauri::command]
pub fn save_config(cfg: crate::config::AppConfig) -> Result<(), String> { crate::config::save_config(&cfg).map_err(|e| e.to_string()) }
```

- [ ] **Step 4: Chạy — PASS** (`cargo test --test commands_test`; `cargo build`)

- [ ] **Step 5: UI — thay `src/App.tsx`**

```tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

interface SttResultDto { srtPath: string; cueCount: number; projectDir: string }
interface TranslateResultDto { srtPath: string; cueCount: number }
interface OpenAiConfig { base_url: string; api_key: string; model: string }
interface AppConfig { translate: { default_provider: string; target_lang: string; openai: OpenAiConfig } }

function App() {
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [projectDir, setProjectDir] = useState("");
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [provider, setProvider] = useState("google_free");
  const [tgt, setTgt] = useState("vi");

  useEffect(() => {
    invoke<AppConfig>("get_config").then((c) => { setCfg(c); setProvider(c.translate.default_provider); setTgt(c.translate.target_lang); });
  }, []);

  async function onRun() {
    const selected = await open({ filters: [{ name: "Video", extensions: ["mp4", "mkv", "mov"] }] });
    if (!selected) return;
    setRunning(true); setStatus("Đang chạy STT...");
    try {
      const r = await invoke<SttResultDto>("run_stt", { videoPath: selected, lang: "zh" });
      setProjectDir(r.projectDir);
      setStatus(`STT xong: ${r.cueCount} cue → ${r.srtPath}`);
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onSaveCfg() {
    if (!cfg) return;
    try { await invoke("save_config", { cfg }); setStatus("Đã lưu cấu hình."); } catch (e) { setStatus(`Lỗi lưu: ${String(e)}`); }
  }

  async function onTranslate() {
    if (!projectDir) { setStatus("Chạy STT trước."); return; }
    setRunning(true); setStatus(`Đang dịch bằng ${provider}...`);
    try {
      const src = provider === "google_free" ? "auto" : "zh";
      const r = await invoke<TranslateResultDto>("run_translate", { projectDir, provider, src, tgt });
      setStatus(`Dịch xong: ${r.cueCount} cue → ${r.srtPath}`);
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  const oa = cfg?.translate.openai;
  const setOa = (patch: Partial<OpenAiConfig>) => cfg && setCfg({ ...cfg, translate: { ...cfg.translate, openai: { ...cfg.translate.openai, ...patch } } });

  return (
    <main className="container">
      <h1>DichVideo-Local</h1>
      <div className="row"><button type="button" onClick={onRun} disabled={running}>{running ? "Đang chạy..." : "Chạy STT"}</button></div>

      <h2>Dịch</h2>
      <div className="row">
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="google_free">Google (miễn phí)</option>
          <option value="openai_compat">LLM (OpenAI-compatible, key riêng)</option>
        </select>
        <input value={tgt} onChange={(e) => setTgt(e.target.value)} placeholder="Ngôn ngữ đích (vi)" style={{ width: 80 }} />
        <button type="button" onClick={onTranslate} disabled={running || !projectDir}>Dịch</button>
      </div>
      {provider === "openai_compat" && oa && (
        <div className="row" style={{ flexDirection: "column", gap: 6 }}>
          <input value={oa.base_url} onChange={(e) => setOa({ base_url: e.target.value })} placeholder="base_url" />
          <input value={oa.api_key} onChange={(e) => setOa({ api_key: e.target.value })} placeholder="api_key" type="password" />
          <input value={oa.model} onChange={(e) => setOa({ model: e.target.value })} placeholder="model" />
          <button type="button" onClick={onSaveCfg}>Lưu cấu hình</button>
        </div>
      )}
      {status && <p>{status}</p>}
    </main>
  );
}
export default App;
```

- [ ] **Step 6: E2E ignored test**

```rust
// tests/e2e_translate_test.rs
//! DVL_E2E_PROJECT=<project_dir có subtitles/source.srt> cargo test --test e2e_translate_test -- --ignored --nocapture
use app_lib::pipeline::run_translate_stage;
use app_lib::translate::google_free::GoogleFree;
use std::path::Path;

#[test]
#[ignore]
fn e2e_google_free_translates_source_srt() {
    let dir = std::env::var("DVL_E2E_PROJECT").expect("set DVL_E2E_PROJECT");
    let src_cues = app_lib::srt::parse_srt(&std::fs::read_to_string(Path::new(&dir).join("subtitles/source.srt")).unwrap()).unwrap().len();
    let r = run_translate_stage(Path::new(&dir), &GoogleFree::new(), "auto", "vi").unwrap();
    println!("\n=== E2E translate OK: {} cue -> {}\n{}", r.cue_count, r.srt_path.display(), std::fs::read_to_string(&r.srt_path).unwrap());
    assert_eq!(r.cue_count, src_cues);
}
```

- [ ] **Step 7: Build + full test** (`cargo test` toàn suite, `cargo build`, `npm run build`)

- [ ] **Step 8: Commit** (`git commit -am "feat: run_translate/get_config/save_config commands + Dịch UI (M2 end-to-end)"`)

---

## Self-Review

- **Spec coverage:** §3 mọi module có task (1 parse_srt; 2 error+config; 3 trait/batcher/make_provider; 4 Google; 5 OpenAI; 6 stage; 7 commands/UI/E2E). §5 bảng lỗi: HTTP≠2xx/timeout (Task 4,5 `map_http_err`), JSON hỏng/sai số + retry 1 (Task 5), Google body lạ (Task 4), source thiếu/hỏng (Task 6 + Task 1), thiếu config (Task 5), 0 cue (Task 3,6). §7 timeout/UA (Task 4 `http_client`), không log key (Task 2 Debug), spawn_blocking (Task 7).
- **Placeholder:** không TBD/TODO. Test `retries_once_on_bad_count_then_succeeds` có ghi chú cách đơn giản hoá nếu httpmock không ổn — yêu cầu bắt buộc đã nêu tường minh.
- **Type nhất quán:** `ProviderError{provider,status,msg}`, `TranslateProvider` 3 method, `TranslateResult{srt_path,cue_count}`, `SttResultDto.project_dir`, `TranslateConfig.openai` dùng đồng nhất Task 2→7.
- **Review Focus:** 0 cue (Task 3,6 tests), items đảo `i` (Task 5 test 1), text có `"`/`\n` (Task 1, Task 5), 429 (Task 4), thiếu source.srt (Task 6) — đều có test.
