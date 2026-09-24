# DichVideo-Local M2 — Dịch đa provider (thiết kế)

- **Ngày:** 2026-09-24
- **Trạng thái:** Design (đã duyệt hướng, chờ review spec)
- **Spec gốc:** `2026-09-24-dichvideo-local-no-saas-design.md` (§3.1 TranslateProvider, §4 stage translate, §7 config)
- **Tiền đề:** M1 đã merge (`main` 9ee4727): `srt::{Segment, write_srt}`, `error::PipelineError`,
  `config::{data_dir, models_dir, projects_dir}`, `pipeline::run_stt_pipeline` → `subtitles/source.srt`,
  `commands::run_stt` + `SttResultDto`, UI 1 nút.

## 1. Mục tiêu

Sau khi M1 tạo `subtitles/source.srt`, người dùng chọn provider và bấm **Dịch** → app tạo
`subtitles/translated.<tgt>.srt` với **cùng số cue, cùng timing** (1:1), bằng:
- **Google free** (gtx, không cần key) — mặc định, hoặc
- **LLM OpenAI-compatible** (base_url + api_key + model) — khi người dùng nhập key.

**Thành công khi:** trên `source.srt` 3 cue tiếng Trung của M1, Google free trả `translated.vi.srt` 3 cue
tiếng Việt; với key hợp lệ, provider LLM cũng làm được; lỗi (401/429/JSON hỏng) hiện thông điệp tiếng
Việt rõ trên UI, không crash, không fallback âm thầm.

## 2. Quyết định đã chốt (từ brainstorming)

| Vấn đề | Quyết định |
|--------|-----------|
| Kết nối LLM | **1 impl OpenAI-compatible** (`{base_url}/chat/completions`) — dùng cho OpenAI, Gemini (endpoint OpenAI-compat), Groq, OpenRouter, Ollama/llama.cpp local |
| Mặc định / fallback | **Google free mặc định**; LLM khi có key; **không tự fallback** khi LLM lỗi |
| Lưu key | **`config.json` plaintext** tại `data_dir()/config.json` (M2); **DPAPI ở M5** cùng Settings UI |
| UI M2 | Command + **nút "Dịch" tối thiểu** trong `App.tsx` (dropdown provider, ô base_url/api_key/model, ngôn ngữ đích) |
| Segment | **1:1** source↔translated, không tách/gộp (retime ở M4 xử lý độ dài) |
| DeepL | **Hoãn** (M6) |

## 3. Module & interface (chính xác — plan bám theo)

```
src-tauri/src/translate/mod.rs
  pub trait TranslateProvider {
      fn id(&self) -> &'static str;                       // "google_free" | "openai_compat"
      fn batch_size(&self) -> usize;                      // google_free = 20, openai_compat = 40
      fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str) -> Result<Vec<String>, PipelineError>;
      // Hợp đồng: Ok(v) ⇒ v.len() == texts.len(), cùng thứ tự. Vi phạm ⇒ Err(ProviderError).
  }
  pub fn translate_segments(p: &dyn TranslateProvider, segs: &[Segment], src: &str, tgt: &str)
      -> Result<Vec<Segment>, PipelineError>;
      // chunk theo p.batch_size(), giữ start_ms/end_ms, thay text; rỗng → Ok(vec![]) không gọi mạng.
  pub fn make_provider(id: &str, cfg: &TranslateConfig) -> Result<Box<dyn TranslateProvider>, PipelineError>;
      // "openai_compat" thiếu api_key/base_url/model ⇒ Err(ProviderError{msg:"thiếu cấu hình ..."})

src-tauri/src/translate/google_free.rs
  pub struct GoogleFree { pub endpoint: String }  // mặc định "https://translate.googleapis.com/translate_a/single"
  // GET {endpoint}?client=gtx&sl={src}&tl={tgt}&dt=t&q={text}  — 1 request / 1 text (đơn giản, chắc);
  // "auto" cho src được phép. Parse: JSON [[["dịch","gốc",...],...],...] → nối phần [0][i][0].
  // Không phải JSON mảng như mong đợi ⇒ ProviderError{status:200, msg: 200 ký tự đầu body}.

src-tauri/src/translate/openai_compat.rs
  pub struct OpenAiCompat { pub base_url: String, pub api_key: String, pub model: String }
  // POST {base_url}/chat/completions, header Authorization: Bearer {api_key}
  // body: { model, temperature: 0.2, response_format: {type:"json_object"},
  //         messages: [ {role:"system", content: SYSTEM_PROMPT}, {role:"user", content: JSON {"src","tgt","items":[{"i":0,"text":"..."}]}} ] }
  // SYSTEM_PROMPT (verbatim): "Bạn là dịch giả phụ đề. Dịch từng item sang ngôn ngữ đích, giữ nguyên số lượng và thứ tự,
  //   không thêm giải thích. Trả về JSON đúng dạng {\"items\":[{\"i\":<số>,\"text\":\"<bản dịch>\"}]}."
  // Parse choices[0].message.content → JSON {items:[{i,text}]}; sắp theo i; thiếu/dư/i lệch ⇒ retry đúng 1 lần ⇒ vẫn sai ⇒ ProviderError.

src-tauri/src/srt.rs
  + pub fn parse_srt(text: &str) -> Result<Vec<Segment>, PipelineError>
    // chấp nhận CRLF/LF, BOM, "HH:MM:SS,mmm --> HH:MM:SS,mmm", text nhiều dòng (nối bằng "\n"), bỏ block hỏng? KHÔNG:
    // block hỏng ⇒ Err(EngineFailed{stage:"srt_parse", code:0, stderr: block}). Roundtrip write_srt(parse_srt(x)) == x (CRLF).

src-tauri/src/config.rs
  + #[derive(Serialize, Deserialize, Default, Clone)] pub struct AppConfig { pub translate: TranslateConfig }
  + pub struct TranslateConfig { pub default_provider: String /* "google_free" */, pub target_lang: String /* "vi" */,
                                 pub openai: OpenAiConfig }
  + pub struct OpenAiConfig { pub base_url: String /* "https://api.openai.com/v1" */, pub api_key: String, pub model: String /* "gpt-4o-mini" */ }
  + pub fn config_path() -> PathBuf            // data_dir()/config.json
  + pub fn load_config() -> AppConfig           // thiếu file/JSON hỏng ⇒ Default (không panic), ghi log
  + pub fn save_config(&AppConfig) -> Result<(), PipelineError>   // tạo dir, ghi pretty JSON

src-tauri/src/error.rs
  + PipelineError::ProviderError { provider: String, status: Option<u16>, msg: String }   // code() = "provider_error"
    Display: "[provider_error] {provider}: {msg}" với msg đã Việt hoá theo status:
      401/403 → "API key sai hoặc không có quyền"; 429 → "Quá giới hạn gọi API, thử lại sau";
      5xx → "Dịch vụ lỗi phía server ({status})"; timeout → "Hết thời gian chờ"; khác → msg gốc (cắt 200 ký tự).

src-tauri/src/pipeline.rs
  + pub struct TranslateResult { pub srt_path: PathBuf, pub cue_count: usize }
  + pub fn run_translate_stage(project_dir: &Path, p: &dyn TranslateProvider, src: &str, tgt: &str)
      -> Result<TranslateResult, PipelineError>
    // đọc project_dir/subtitles/source.srt (thiếu ⇒ Io("Chưa có source.srt — chạy STT trước"));
    // translate_segments → write_srt → project_dir/subtitles/translated.{tgt}.srt

src-tauri/src/commands.rs
  SttResultDto      + pub project_dir: String                     // camelCase: projectDir
  + TranslateResultDto { srt_path: String, cue_count: usize }     // camelCase
  + #[tauri::command] run_translate(project_dir: String, provider: String, src: String, tgt: String)
        -> Result<TranslateResultDto, String>      // e.to_string(); blocking → tauri::async_runtime::spawn_blocking
  + #[tauri::command] get_config() -> AppConfig
  + #[tauri::command] save_config(cfg: AppConfig) -> Result<(), String>

src/App.tsx
  Sau khi STT xong: chọn provider (google_free | openai_compat), khi openai_compat hiện 3 ô base_url/api_key/model
  (nạp từ get_config, nút "Lưu" gọi save_config), ô ngôn ngữ đích (mặc định "vi"), src = "auto" cho Google /
  = ngôn ngữ STT cho LLM, nút "Dịch" → hiện cueCount + srtPath hoặc lỗi.
```

## 4. Luồng dữ liệu

`source.srt → parse_srt → [Segment] → chunk(batch_size) → provider.translate_batch → ghép theo thứ tự
→ [Segment với text mới, timing cũ] → write_srt → translated.<tgt>.srt`

Ngôn ngữ nguồn: Google nhận `auto`; LLM nhận mã ngôn ngữ STT (vd `zh`) để prompt rõ.

## 5. Xử lý lỗi (không nuốt lỗi)

| Tình huống | Hành vi |
|-----------|---------|
| HTTP ≠ 2xx | `ProviderError{status}` + thông điệp Việt theo bảng ở §3 |
| Timeout (30s/request) | `ProviderError{status:None, msg:"Hết thời gian chờ"}` |
| LLM trả JSON hỏng / sai số item / i lệch | retry **đúng 1 lần**, vẫn sai ⇒ `ProviderError` kèm 200 ký tự content |
| Google body không đúng dạng | `ProviderError{status:200}` kèm 200 ký tự body |
| `source.srt` thiếu | `Io("Chưa có source.srt — chạy STT trước")` |
| `source.srt` hỏng | `EngineFailed{stage:"srt_parse"}` |
| `openai_compat` thiếu key/url/model | `ProviderError` trước khi gọi mạng |
| 0 cue | `Ok(cue_count=0)`, ghi srt rỗng, không gọi mạng |

## 6. Test

**Unit (không mạng, `httpmock` dev-dep):**
- `parse_srt`: CRLF/LF, BOM, CJK, text 2 dòng, rỗng→rỗng, block hỏng→Err `srt_parse`; roundtrip với `write_srt`.
- `translate_segments` với provider giả (trait impl trong test): chunk đúng số batch, ghép đúng thứ tự, timing giữ nguyên, rỗng không gọi.
- `GoogleFree`: 200 hợp lệ → text; 200 body lạ → ProviderError; 429 → ProviderError status 429.
- `OpenAiCompat`: 200 hợp lệ; 401 → ProviderError 401 + Display có "API key"; sai số item lần 1 đúng lần 2 → Ok (đúng 2 request); sai cả 2 lần → Err; JSON hỏng → Err; kiểm tra header Bearer + body có `response_format`.
- `config`: save→load roundtrip; file thiếu → Default; JSON hỏng → Default.
- `error`: Display của ProviderError cho 401/429/5xx/None.
- DTO: `TranslateResultDto` camelCase; `SttResultDto` có `projectDir`.

**E2E `#[ignore]`** (`DVL_E2E_PROJECT=<project_dir có source.srt>`): Google free → `translated.vi.srt` có đúng số cue
như source, in ra nội dung.

## 7. Ràng buộc toàn cục (kế thừa + mới)

- Windows x64, Tauri v2, crate `app_lib`; độc lập tuyệt đối với app cũ.
- `reqwest` blocking hoặc async — nhưng command phải không chặn runtime Tauri (`spawn_blocking`).
- Timeout mỗi request 30s. User-Agent "DichVideo-Local/0.1".
- Không log api_key (kể cả Debug của config: `OpenAiConfig` tự impl Debug che key).
- Output SRT: CRLF, `HH:MM:SS,mmm` (như M1).

## 8. Milestone tasks (gợi ý cho plan)

1. `parse_srt` + tests (thuần logic)
2. `ProviderError` + Display + `AppConfig` load/save + tests
3. trait + `translate_segments` + fake provider tests
4. `GoogleFree` + httpmock tests
5. `OpenAiCompat` + httpmock tests (retry)
6. `run_translate_stage` + tests
7. commands (`run_translate`, `get_config`, `save_config`), DTO `projectDir`, UI "Dịch"; E2E ignored

## 9. Ngoài phạm vi M2

DeepL, DPAPI, progress theo batch (Tauri event), tách/gộp cue, glossary/nhất quán nhân vật, Settings UI đầy đủ (M5),
dịch lại từng cue riêng lẻ (cue editor, M5).
