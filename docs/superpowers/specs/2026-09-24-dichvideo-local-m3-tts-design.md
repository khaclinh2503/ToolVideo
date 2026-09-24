# DichVideo-Local M3 — ComponentManager + TTS local (thiết kế)

- **Ngày:** 2026-09-24
- **Trạng thái:** Design (đã duyệt hướng, chờ review spec)
- **Spec gốc:** `2026-09-24-dichvideo-local-no-saas-design.md` (§3.1 TtsProvider, §4 stage tts, §5 ComponentManager, §6 manifest)
- **Tiền đề:** M1 + M2 đã merge (`main` be1954f): `srt::{Segment, parse_srt, write_srt}`,
  `error::PipelineError`, `config::{data_dir, models_dir, projects_dir, AppConfig}`,
  `pipeline::{run_stt_pipeline, run_translate_stage}` → `subtitles/translated.<tgt>.srt`,
  `commands::{run_stt, run_translate, get_config, save_config}`, UI 2 khối.

## 1. Mục tiêu

Sau khi M2 tạo `subtitles/translated.vi.srt`, người dùng bấm **Lồng tiếng** → app sinh
`tts/segments/cue-XXXX.wav` cho từng cue + `tts/manifest.json`, có **cache** (chạy lại chỉ sinh cue
đã đổi text). Kèm theo: **ComponentManager** tự tải/verify/cài 8 artifact (ffmpeg, sherpa-onnx,
SenseVoice + tokens, silero-vad, piper, voice vi + config) — trả nợ kỹ thuật của M1 và là điều kiện để TTS chạy được.

**Thành công khi:** trên máy trắng, bấm "Tải bộ công cụ" → tải ~470MB, verify sha256, cài vào
`%APPDATA%\dichvideo-local\models\`; rồi chạy thật 1 clip ~15s: video → STT → dịch → TTS, ra đủ
số wav bằng số cue có text, manifest khớp, nghe được tiếng Việt. Chạy lại lần 2: 0 cue sinh mới
(toàn cache hit). Thiếu file / sai checksum / piper chết giữa chừng → lỗi tiếng Việt nêu rõ cue nào.

## 2. Quyết định đã chốt (từ brainstorming)

| Vấn đề | Quyết định |
|--------|-----------|
| Engine TTS của M3 | **Piper** (ONNX, 1 exe, không cần Python). **VieNeu hoãn** sang milestone sau — trait `TtsProvider` giữ nguyên khi thêm |
| Cấp phát component | **Tự tải cả 8 artifact** trong M3, có ghim sha256 |
| Nguồn sha256 | **Tải thật 1 lần** bằng binary phụ `pin_components` rồi ghim vào `components.json` trong repo |
| Cách chạy Piper | **1 tiến trình cho cả batch** qua `--json-input` (nạp model 1 lần); stdout in đường dẫn wav mỗi cue xong |
| Phạm vi cache | **Cục bộ trong project**, không có kho dùng chung toàn app |
| `length_scale` | Có trong cache_key **ngay từ M3** (mặc định `1.0`) dù M3 chưa chỉnh — để M4 ép timing không phá cache |
| Retime / ghép / mix | **Ngoài phạm vi M3** (là M4). M3 chỉ ghi `duration_ms` vào manifest |
| Nghiệm thu | **E2E thật** trên 1 clip ~15s |

## 3. Nguồn artifact (đã xác minh 2026-09-24 bằng GitHub/HF API)

| id | URL | Dạng | Kích thước | sha256 |
|----|-----|------|-----------|--------|
| `ffmpeg` | `github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip` | zip | ~80MB | ghim khi chạy `pin_components` |
| `sherpa` | `github.com/k2-fsa/sherpa-onnx/releases/download/v1.13.8/sherpa-onnx-v1.13.8-win-x64-static-MT-Release.tar.bz2` | tar.bz2 | ~60MB | ghim khi chạy `pin_components` |
| `sense-voice` | `huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/model.int8.onnx` | raw | 239,233,841 | `c71f0ce00bec95b07744e116345e33d8cbbe08cef896382cf907bf4b51a2cd51` |
| `sense-voice-tokens` | `…/resolve/main/tokens.txt` | raw | 315,894 | ghim khi chạy `pin_components` (không phải LFS) |
| `silero-vad` | `github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx` | raw | ~2MB | ghim khi chạy `pin_components` |
| `piper` | `github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip` | zip | ~20MB | ghim khi chạy `pin_components` |
| `piper-voice-vi` | `huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx` | raw | 63,201,294 | `ec7c89e2c85f4d1edc24b6120c18aaf1bda614f06b511567eb9c7c0de15e2dab` |
| `piper-voice-vi-cfg` | `…/vi_VN-vais1000-medium.onnx.json` | raw | 4,860 | ghim khi chạy `pin_components` |

Hai sha256 có sẵn lấy từ `lfs.oid` của HuggingFace API (LFS oid **chính là** sha256 nội dung file).
Chọn `model.int8.onnx` (239MB) thay vì `model.onnx` (937MB): giảm tải 4×, chất lượng đủ dùng.
Dùng tag GitHub bất biến thay cho `gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip` — URL đó
trỏ bản mới nhất nên sha256 đổi theo thời gian, **không ghim được**.

**Bố cục sau khi cài** (giữ nguyên đường dẫn M1 đang mong đợi, không phải sửa `resolve_engine_ctx`):

```
%APPDATA%\dichvideo-local\models\
  ffmpeg\ffmpeg.exe, ffprobe.exe
  sherpa\sherpa-onnx-vad-with-offline-asr.exe (+ .dll đi kèm nếu bản build cần)
  sherpa\sense-voice.onnx        ← model.int8.onnx đổi tên
  sherpa\tokens.txt
  sherpa\vad-model.onnx          ← silero_vad.onnx đổi tên
  piper\piper.exe (+ espeak-ng-data\, *.dll)
  piper\vi_VN-vais1000-medium.onnx (+ .onnx.json)
  .state\<id>.json               ← sổ ghi đã cài gì, sha256 nào
  .tmp\                          ← vùng tải/giải nén tạm, xoá sau khi xong
```

## 4. Module & interface (chính xác — plan bám theo)

### 4.1. `src-tauri/src/components.rs` (viết lại)

```rust
#[derive(Deserialize)] pub struct ComponentSpec {
    pub id: String, pub url: String, pub sha256: String, pub size: u64,
    pub archive: Archive,            // Zip | TarBz2 | Raw
    pub files: Vec<FileMap>,         // Raw ⇒ đúng 1 phần tử, `from` bỏ trống
}
#[derive(Deserialize)] pub struct FileMap { pub from: Option<String>, pub to: String }
pub enum Progress { Download { done: u64, total: u64 }, Extract, Done }

pub fn specs() -> Result<Vec<ComponentSpec>, PipelineError>;   // include_str!("../components.json")
pub fn is_installed(spec: &ComponentSpec, models: &Path) -> bool;
pub fn install_component(spec: &ComponentSpec, models: &Path, on: &mut dyn FnMut(Progress))
    -> Result<(), PipelineError>;
pub fn install_all(models: &Path, on: &mut dyn FnMut(&str, Progress)) -> Result<(), PipelineError>;
```

Luồng `install_component`:
1. `is_installed` (mọi `to` tồn tại **và** `.state/<id>.json` ghi đúng `sha256` hiện hành) ⇒ trả `Ok` ngay.
2. Tải **theo luồng** (`reqwest::blocking` + `Read` từng khối 64KB) vào `.tmp/<id>.part`, vừa ghi vừa
   cập nhật `Sha256`, gọi `on(Progress::Download)` tối đa ~10 lần/giây. **Không** nạp cả file vào RAM
   (`ensure_component` cũ dùng `.bytes()` — 239MB trong RAM là không chấp nhận được).
3. So sha256 ⇒ lệch: xoá `.part`, trả `ChecksumMismatch`.
4. Giải nén **chỉ những member cần** theo `files[].from` vào `.tmp/<id>/`, rồi `rename` sang đích;
   `Raw` thì `rename` thẳng `.part` → đích. Tạo thư mục cha nếu thiếu.
5. Ghi `.state/<id>.json` `{"sha256": "...", "files": ["..."]}`; xoá `.tmp/<id>*`.

`install_all` dừng ở component lỗi đầu tiên (không nuốt lỗi), các component đã cài trước đó giữ nguyên.

**Dependency mới:** `tar` + `bzip2` (giải `.tar.bz2` của sherpa-onnx — crate `zip` hiện có không đọc
được dạng này). Không thêm crate nào khác: streaming tải dùng `reqwest::blocking::Response: Read`
sẵn có, đọc wav header viết tay.

### 4.2. `src-tauri/src/bin/pin_components.rs` (công cụ dev, không vào app)

Chạy `cargo run --bin pin_components`: với mỗi spec trong `components.json`, tải về `.tmp`, in
`id, size, sha256`, và **liệt kê top-level entries của archive** để xác định đúng chuỗi `from`
(bố cục bên trong `.tar.bz2` của sherpa chưa biết trước khi tải). Ghi `components.pinned.json`
để người viết code chép giá trị vào `components.json` rồi commit.

### 4.3. `src-tauri/src/wav.rs` (mới)

```rust
pub fn duration_ms(path: &Path) -> Result<u64, PipelineError>;  // đọc header RIFF
```
Duyệt chunk đúng cách (bỏ qua `LIST`/`fact` nếu có), lấy `fmt ` → `sample_rate`, `channels`,
`bits_per_sample`; lấy kích thước chunk `data` → `ms = data_len * 1000 / (sample_rate * channels * bits/8)`.
**Không** giả định header 44 byte.

### 4.4. `src-tauri/src/tts/mod.rs` (mới)

```rust
pub struct TtsJob { pub index: usize, pub text: String, pub out: PathBuf, pub length_scale: f32 }

pub trait TtsProvider {
    fn id(&self) -> &'static str;
    fn sample_rate(&self) -> u32;
    /// Sinh wav cho từng job theo thứ tự. `on_done(index)` gọi sau mỗi cue ghi xong (để báo tiến độ).
    /// Hợp đồng: Ok(()) ⇒ mọi `job.out` đều tồn tại. Vi phạm ⇒ Err.
    fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError>;
}

pub fn cache_key(provider: &str, voice: &str, length_scale: f32, text: &str) -> String;
pub fn make_provider(id: &str, cfg: &TtsConfig, models: &Path) -> Result<Box<dyn TtsProvider>, PipelineError>;
```

`cache_key` = `sha256` hex của `format!("{provider}\u{1f}{voice}\u{1f}{length_scale:.3}\u{1f}{text}")`.
Dùng ký tự US (0x1F) làm ngăn cách để text không thể giả mạo ranh giới trường.

### 4.5. `src-tauri/src/tts/manifest.rs` (mới)

`tts/manifest.json`:
```json
{
  "version": 1,
  "provider": "piper",
  "voice": "vi_VN-vais1000-medium",
  "sample_rate": 22050,
  "segments": [
    { "index": 1, "start_ms": 0, "end_ms": 5212, "text": "Xin chào.",
      "audio_path": "segments/cue-0001.wav", "cache_key": "9f2c…",
      "length_scale": 1.0, "duration_ms": 1840 }
  ]
}
```
- `audio_path` **tương đối** so với `tts/` (project di chuyển được).
- Cue text rỗng ⇒ `audio_path: null`, `duration_ms: 0`, `cache_key: null`, **không** gọi TTS.
- `load(path) -> Option<Manifest>`: file thiếu/hỏng ⇒ `None` (coi như chưa có cache), không phải lỗi.

Schema bám §6 spec gốc (`{index,text,voice,audio_path,cache_key,duration_ms}`) — bỏ `provenance`
(dấu vết SaaS), thêm `start_ms/end_ms/length_scale/sample_rate` vì M4 cần.

### 4.6. `src-tauri/src/tts/piper.rs` (mới)

```rust
pub struct Piper { pub exe: PathBuf, pub model: PathBuf, pub sample_rate: u32 }
pub fn build_args(model: &Path) -> Vec<String>;      // ["-m", model, "--json-input"]
pub fn build_line(job: &TtsJob) -> String;           // JSON 1 dòng: {"text":..,"output_file":..}
```
- Spawn 1 lần với `stdin/stdout/stderr = piped`, cờ `CREATE_NO_WINDOW` (0x08000000) như `stt.rs`.
- Text gửi đi: thay mọi `\r\n`/`\n` bằng dấu cách (cue SRT nhiều dòng là **một** câu nói);
  `serde_json` lo escape dấu `"`.
- `length_scale` khác 1.0 ⇒ thêm `"length_scale"` vào chính dòng JSON đó (Piper nhận per-line).
- Đọc **từng dòng stdout** trong luồng riêng: mỗi dòng = đường dẫn wav vừa ghi ⇒ `on_done(index)`
  theo thứ tự. stderr đọc song song vào bộ đệm vòng (giữ 100 dòng cuối) để báo lỗi.
- Đóng stdin sau dòng cuối, `wait()`. Thoát mã ≠ 0, **hoặc** số dòng stdout < số job ⇒
  `EngineFailed { stage: format!("tts cue {}", first_missing_index), code, stderr }`.
- Không tìm thấy exe ⇒ `EngineMissing("piper")`.

### 4.7. `src-tauri/src/pipeline.rs` (thêm)

```rust
pub struct TtsResult { pub manifest_path: PathBuf, pub cue_count: usize,
                       pub generated: usize, pub cached: usize }

pub fn run_tts_stage(project_dir: &Path, p: &dyn TtsProvider, voice: &str,
                     length_scale: f32, tgt: &str) -> Result<TtsResult, PipelineError>;
```
1. Đọc `subtitles/translated.<tgt>.srt`; thiếu ⇒ `Io("Chưa có bản dịch — chạy Dịch trước (<path>)")`.
2. `mkdir -p tts/segments`.
3. Nạp manifest cũ (nếu có) → map `index -> (cache_key, audio_path)`.
4. Với mỗi cue: text rỗng ⇒ mục rỗng; ngược lại tính `cache_key`; trùng key cũ **và** file wav tồn
   tại ⇒ đếm `cached`, dùng lại; khác ⇒ thêm vào `jobs` (đường ra `tts/segments/cue-%04d.wav`).
5. `jobs` rỗng ⇒ bỏ qua bước spawn (không chạy engine).
6. Gọi `p.synthesize(&jobs, ...)`; xong đọc `wav::duration_ms` cho mọi cue có audio.
7. Ghi `tts/manifest.json` qua **tmp + rename** (như `run_translate_stage` đang làm) để không bao giờ
   để lại manifest dở.
8. Dọn wav mồ côi: file trong `tts/segments/` không nằm trong manifest mới ⇒ xoá.

### 4.8. `src-tauri/src/config.rs` (thêm)

```rust
pub struct AppConfig { pub translate: TranslateConfig, #[serde(default)] pub tts: TtsConfig }
pub struct TtsConfig { pub default_provider: String, pub voice: String, pub length_scale: f32 }
// mặc định: "piper", "vi_VN-vais1000-medium", 1.0
```

### 4.9. `src-tauri/src/commands.rs` + UI (thêm)

```rust
#[tauri::command] pub async fn ensure_components(app: tauri::AppHandle) -> Result<(), String>;
   // emit "component_progress" {id, phase, done, total} ; chạy trong spawn_blocking
#[tauri::command] pub async fn run_tts(project_dir: String, tgt: String) -> Result<TtsResultDto, String>;
```
`TtsResultDto { manifestPath, cueCount, generated, cached }`.

`App.tsx`: thêm nút **"Tải bộ công cụ"** (nghe event `component_progress`, hiện `id — xx%`) và nút
**"Lồng tiếng"** (bật khi đã có `projectDir`), hiện `sinh mới N / cache M`. UI đầy đủ vẫn để M5.

## 5. Luồng dữ liệu

```
subtitles/translated.vi.srt
      │ parse_srt
      ▼
  [Segment]  ──cache_key(provider,voice,length_scale,text)──►  so với manifest cũ
      │                                                              │
      │ cue đổi/mới                                         cue không đổi
      ▼                                                              │
  [TtsJob] ──► Piper (1 tiến trình, --json-input) ──► cue-XXXX.wav   │
      │              stdout: đường dẫn/ cue xong                      │
      ▼                                                              ▼
  wav::duration_ms  ─────────────────► tts/manifest.json ◄────── dùng lại
```

## 6. Xử lý lỗi

Không thêm biến thể `PipelineError` mới — 6 biến thể hiện có phủ đủ:

| Tình huống | Lỗi | Thông điệp người dùng thấy |
|---|---|---|
| Chưa cài piper | `EngineMissing("piper")` | "Không tìm thấy công cụ 'piper'…" → gợi bấm Tải bộ công cụ |
| File tải hỏng | `ChecksumMismatch` | "File tải về hỏng (sha256 mong đợi…)" |
| Piper chết giữa batch | `EngineFailed{stage:"tts cue 37"}` | "Bước 'tts cue 37' lỗi (mã …)" + 20 dòng stderr cuối |
| Chưa có bản dịch | `Io` | "Chưa có bản dịch — chạy Dịch trước (<path>)" |
| Mất mạng khi tải | `Io` | thông điệp lỗi mạng |
| wav hỏng/không đọc được header | `Io` | "wav không hợp lệ: <path>" |

Nguyên tắc giữ nguyên từ M1/M2: **không nuốt lỗi, không tự fallback provider**.

## 7. Kiểm thử

**Unit / tích hợp (luôn chạy):**
- `components_test`: parse `components.json`; `install_component` với `httpmock` — đủ 3 dạng
  `Raw`/`Zip`/`TarBz2`; sai sha256 ⇒ `ChecksumMismatch` **và không để lại file đích**; chạy lần 2 ⇒
  bỏ qua, không gọi mạng (khẳng định bằng `mock.assert_hits(1)`); callback tiến độ có được gọi.
- `wav_test`: duration của wav tự dựng, có chunk `LIST` chen trước `data`; file cụt ⇒ `Err`.
- `tts_cache_test`: `cache_key` ổn định; đổi text/voice/length_scale ⇒ đổi key; text có 0x1F không
  làm hai bộ tham số khác nhau đụng key.
- `tts_manifest_test`: ghi/đọc khứ hồi; cue rỗng ⇒ `audio_path: null`; manifest hỏng ⇒ `None`.
- `piper_test`: `build_args`; `build_line` escape `"`, gộp `\n` thành dấu cách, có/không `length_scale`.
- `pipeline_tts_test`: provider giả (`struct FakeTts` ghi wav rỗng hợp lệ) qua `run_tts_stage` —
  lần 1 sinh hết, lần 2 cache hết (`generated == 0`); sửa 1 cue ⇒ đúng 1 cue sinh lại; cue rỗng bỏ
  qua; wav mồ côi bị xoá; thiếu srt ⇒ `Io`.

**E2E (`#[ignore]`, bật bằng env — theo đúng lệ `e2e_stt_test`):**
- `e2e_components_test`: `DVL_E2E_DOWNLOAD=1` ⇒ tải & cài thật cả 8, khẳng định mọi đường dẫn tồn tại.
- `e2e_tts_test`: `DVL_E2E_CLIP=<video>` ⇒ STT → dịch → TTS; khẳng định số wav = số cue có text,
  mỗi wav `duration_ms > 0`, chạy lần 2 `generated == 0`.

Clip nghiệm thu: nếu bạn không có sẵn video ngắn tiếng Trung/Anh, tôi dựng bằng giọng SAPI tiếng Anh
của Windows + `ffmpeg` (nền đen 15s) — chạy offline, không phụ thuộc nguồn ngoài.

## 8. Phạm vi (rõ ràng cái KHÔNG làm ở M3)

Không: VieNeu/Python sidecar, ghép–mix–retime–export (M4), UI 5 màn (M5), tách nhạc nền (M6),
chọn giọng trong UI (M3 dùng 1 giọng mặc định trong config), đa luồng TTS (1 tiến trình là đủ),
kho cache dùng chung giữa các project, DPAPI cho key (M5).

## 9. Rủi ro

| Rủi ro | Giảm thiểu |
|--------|-----------|
| Bố cục bên trong `.tar.bz2` của sherpa chưa biết ⇒ `from` sai | `pin_components` in danh sách entry trước khi ghim; chỉnh `components.json` rồi mới code tiếp |
| Bản sherpa `static-MT-Release` có thể vẫn cần `.dll` đi kèm | Kiểm ngay ở E2E component; nếu thiếu thì thêm các `.dll` vào `files[]` |
| Piper 2023.11.14-2 đã cũ, giọng `vais1000` chỉ ở mức khá | Chấp nhận ở M3; VieNeu là bản nâng chất lượng ở milestone sau, trait không đổi |
| ffmpeg 9.0.2 mới hơn bản M1 từng thử | Cờ M1 dùng (`-map 0:a:0 -af aresample=…`) là cờ ổn định lâu năm; E2E STT sẽ bắt được nếu vỡ |
| Tải 470MB đứt giữa chừng | `.part` bị xoá, chạy lại từ đầu component đó; các component đã xong không tải lại |
| Mạng công ty chặn HF/GitHub | Đã thử `curl` tới cả hai nguồn ở máy này: **thông** |
| Piper sinh 22050 Hz, khác 16000 Hz của STT | Ghi `sample_rate` vào manifest; M4 resample khi mix |

## 10. Chia pha thực thi

Plan sẽ tách 2 pha tuần tự, mỗi pha tự đứng được:
- **Pha A — ComponentManager:** `components.json`, `install_component` (stream + verify + extract),
  `.state`, `pin_components`, command `ensure_components` + nút UI, **chạy tải thật để ghim sha256**.
- **Pha B — TTS:** `wav.rs`, `tts::{cache_key, manifest, TtsProvider, piper}`, `run_tts_stage`,
  command `run_tts` + nút UI, E2E trên clip thật.

Hết pha A là mốc kiểm: máy có đủ engine thật, E2E STT + dịch của M1/M2 lần đầu tiên chạy được thật.
