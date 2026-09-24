# Dich Video 1.6.5 — Tái dựng kiến trúc từ binary

> Tài liệu này được dựng lại bằng cách phân tích ngược file đã cài
> `C:\Users\CPU60287-Local\AppData\Local\Dich Video\dichvideo.exe` (không có source gốc).
> Nguồn dữ liệu: chuỗi ký tự nhúng trong exe (tên lệnh, mã lỗi, tên module, URL).
> **Đây KHÔNG phải source gốc** — là bản đồ luồng/kiến trúc suy ra để code lại.

## 0. Tóm tắt

- **Loại app:** Tauri v2 desktop (Windows x64). Frontend **Vue + Vite**, backend **Rust** (native).
- **Chức năng:** NLE (biên tập timeline) + pipeline **dịch & lồng tiếng video bằng AI**.
- **Tên nội bộ:** DichVideo. Nhà phát hành: dichvideo. Giấy phép: `LicenseRef-DichVideo-Proprietary`.
- **Backend phụ:** tự tải & cài runtime Python ML (Miniforge/conda + PyTorch), whisper.cpp, ffmpeg, các runtime TTS.

### Khôi phục được gì
| Phần | Trạng thái |
|------|-----------|
| Kiến trúc & luồng (tài liệu này) | ✅ Dựng lại được |
| Tên lệnh / mã lỗi / tên module | ✅ (xem `identifiers_by_subsystem.txt`) |
| Danh sách API/endpoint/engine | ✅ (mục 7) |
| Code Rust từng dòng | ❌ Mất vĩnh viễn |
| Source Vue gốc (.vue) | ❌ Chỉ có thể lấy bản minify khi chạy app (chưa làm) |

---

## 1. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────┐
│  Frontend (Vue + Vite, chạy trong WebView2)  │
│  UI timeline/NLE, quản lý project, cấu hình  │
└───────────────┬─────────────────────────────┘
                │ Tauri invoke() / events
┌───────────────▼─────────────────────────────┐
│  Backend Rust (dichvideo.exe)                │
│  - Quản lý project (snapshot/ledger/authority)│
│  - Điều phối pipeline "native_*"             │
│  - Quản lý component/runtime (tải & cài)     │
│  - Auth bridge (HTTP callback cục bộ)        │
└───────────────┬─────────────────────────────┘
                │ gọi tiến trình con / HTTP
┌───────────────▼─────────────────────────────┐
│  Công cụ ngoài:                              │
│  ffmpeg/ffprobe · whisper-cli.exe ·          │
│  dichvideo-aligner.exe · Python runtime      │
│  (whisperX/SoniTranslate/ctranslate2) ·      │
│  piper · vieneu-turbo · ONNX runtime         │
└──────────────────────────────────────────────┘
                │ HTTP
┌───────────────▼─────────────────────────────┐
│  Dịch vụ mạng: api.dichvideo.com (auth,      │
│  translate, update) · Google/DeepL/Libre/Bing│
│  · ElevenLabs/MiniMax/CapCut/ttssieure       │
└──────────────────────────────────────────────┘
```

---

## 2. Pipeline xử lý video (luồng chính)

Thứ tự các bước suy ra từ nhóm định danh `native_*` (mỗi bước là một "stage" trong Rust):

1. **Nhập nguồn** — chọn video (`select_video_file`), lấy thời lượng (`get_audio_duration`),
   probe media bằng ffmpeg (`ffmpeg_media_probe`, `native_export_audio_probe`).
2. **Tách/chuẩn bị audio** — `project_playback_audio`, tách nền/giọng (`project_audio_separation`,
   `native_audio_premix`, `separated_background` / `fixed_voice`). Có tách vocals khỏi nhạc nền.
3. **STT — nhận dạng lời thoại** (mục 4).
4. **Căn chỉnh thời gian** — `forced_alignment`, `subtitle_alignment` qua `dichvideo-aligner.exe`.
5. **(Tuỳ chọn) OCR phụ đề cứng** — `subtitle_ocr` trích phụ đề in sẵn trên video bằng ONNX OCR
   (`native_subtitle_ocr_*`, trích frame `rawvideo bgr24`).
6. **Dịch** (mục 6) → sinh phụ đề đã dịch (`translated_subtitle`, `srt/vtt/ass`).
7. **Tempo / Time-warp / Retime** — `project_tempo`, `native_time_warp`, `native_retime_ffmpeg` —
   co giãn thời lượng để audio lồng tiếng khớp khẩu hình/khung hình.
8. **TTS — lồng tiếng** (mục 5) → sinh audio theo từng cue (`voiceover_tts_chunks`, `tts_materials`).
9. **Trộn audio** — `export_audio_mix`, `update_audio_mix`, `ffmpeg_tts_composition` (mix giọng + nền).
10. **Preview** — render xem trước theo cue (`native_cue_preview_*`).
11. **Export** — `native_export` (bản `direct_copy` nhanh, hoặc `full_hybrid_filtered_export`),
    burn phụ đề (`burn_subtitles`, `ffmpeg_ass_subtitles`), rồi **verify** (`export_verify`,
    `verify_exported_media`). Kết quả: `final_export` / `translated_video` / `draft_video`.

---

## 3. Mô hình dữ liệu Project (quan trọng cho việc code lại)

App dùng mô hình **versioned, content-addressed, có "authority"** (nguồn chân lý). Đây là phần
phức tạp nhất — cần tái hiện cẩn thận:

- **Project manifest** — `project_manifest` (đọc/ghi/serialize/parse; `project.json`).
  Có versioning: `terminal_project_snapshot_v2/v3`, hash mismatch checks.
- **Artifact ledger** — `project_artifact_ledger_v2/v3`: sổ ghi mọi artifact sinh ra (audio, subtitle,
  video) kèm hash/receipt để cache & kiểm tra tính nhất quán.
- **Authority system** — mỗi phần (timing, visual, audio, caption) có một "authority" là bản gốc;
  mọi mutation phải khớp authority nếu không → `*_authority_mismatch` / `*_stale`.
- **Mutation / revision** — chỉnh sửa qua `project_*_mutation` có `revision`, kiểm tra stale
  (`*_mutation_stale`, `*_revision_invalid`) → tránh ghi đè dữ liệu cũ (optimistic concurrency).
- **Terminal project** — trạng thái "chốt" cuối để export (`terminal_project_*`).
- **NLE document** — `nle_document`, `nle_project`, `nle_preview_projection`, `nle_export_cue`:
  timeline biên tập phi tuyến, ánh xạ cue ↔ voice ↔ thời gian.
- **Quản lý file project:** `create_projects_root`, `read/write/replace_project_manifest`,
  `project_delete_queue` (xoá có hàng đợi + permit + authority).

> Gợi ý code lại: đây là kiến trúc kiểu event-sourcing/CQRS nhẹ. Có thể đơn giản hoá nếu không cần
> đầy đủ cache/receipt, nhưng phần **authority + revision** nên giữ để tránh hỏng dữ liệu khi undo/redo.

---

## 4. STT (nhận dạng giọng nói)

Hai "engine":

- **whisper.cpp** (mặc định/legacy): `whisper-cli.exe` + model `ggml-base.bin`
  (tải từ `huggingface.co/ggerganov/whisper.cpp`). Model: `whisper_cpp_small_q5` (đa ngữ),
  `whisper_cpp_smallenglish`. Tải bin từ `github.com/ggml-org/whisper.cpp/releases .../whisper-bin-x64.zip`.
- **vnext** (engine mới): sherpa-onnx **SenseVoice** (`sherpa_sensevoice_2024_int8`), chạy qua Python
  backend (SoniTranslate/whisperX), `ctranslate2` (có CUDA). Model: `stt_fast_model`, `stt_general`,
  `stt_multi_model`, `stt_en_model`. VAD: **silero** (`onnx silero_vad`).
- Ngôn ngữ hỗ trợ (suy từ chuỗi): `zh, ja, ko, yue, en, th, ru, fil, fr, de, pt, hi, auto`.
- Chunk hoá + fingerprint để cache: `native_stt_chunk_*`, `stt_chunk_fingerprint_v1`.

---

## 5. TTS (lồng tiếng) — nhiều provider

Điều phối qua `authorized_tts_route` / `native_tts_provider`. Các provider phát hiện được:

| Provider | Định danh / endpoint | Ghi chú |
|----------|----------------------|---------|
| **Piper** (native, offline) | `piper_native`, `piper_vi_normalizer`, `piper_phonemize`, ONNX | Có chuẩn hoá tiếng Việt |
| **vieneu-turbo** (riêng của Bạn) | `vieneu_turbo_*`, tải runtime từ `downloads.dichvideo.com/dependencies/vieneu/...` | TTS neural tiếng Việt tự train |
| **Edge/Bing TTS** | `edge_tts`, `tts_edge_bing`, `tts_edge_websocket`, `bing.com/tfettts` | Miễn phí qua websocket |
| **CapCut "viral" TTS** | `viral_tts_*`, `viral_voice_capcut`, `login.capcut.com`, `edit-api-sg.capcut.com` | Cần login CapCut (cookie) |
| **ttssieure** | `ttssieure_*`, `api.ttssieure.com` | Dịch vụ TTS VN, có catalog + key store |
| **ElevenLabs** | `eleven_multilingual_v2`, `voices_v3_nano/turbo` | Qua `api.genmax.io` |
| **MiniMax** | `minimax`, `speech-2.8-turbo` | Qua `api.genmax.io` |

- Chế độ: **native TTS** (offline: piper/vieneu) vs **server TTS** (`tts_server_provider`,
  `server_tts_degraded_local_edge_fallback` — server hỏng thì fallback về edge-tts).
- **Edited TTS**: chỉnh sửa lại đoạn lồng tiếng cụ thể (`edited_tts`, `direct_edited_tts_*`,
  `native_edited_tts_*`) — regenerate 1 cue mà không làm lại cả video.
- Resume: `tts_resume_manifest`, `tts_resumable_settings_v1`, `native_retry_tts_checkpoint` —
  chạy lại được sau khi ngắt giữa chừng.

---

## 6. Dịch thuật

Nhiều backend, chọn theo cấu hình (`server_translate` = qua api.dichvideo.com):

- **Google** `translate.googleapis.com/translate_a/single?client=gtx` (miễn phí)
- **DeepL** `api-free.deepl.com/v2/translate` (header `DeepL-Auth-Key`)
- **LibreTranslate** `libretranslate.de/translate`
- **Bing** `bing.com/translator`
- **LLM** OpenAI / Gemini (qua `api.dichvideo.com`) — dịch chất lượng cao
- **ctranslate2** (dịch offline bằng model, có CUDA)
- Batch: `translation_batch_manifest` + ước tính chi phí `estimated_cost_vnd`.

---

## 7. Dịch vụ mạng & endpoint

- **api.dichvideo.com** — auth, translate server, job authorization, `/app/update` (tự cập nhật).
- **downloads.dichvideo.com** — tải dependency:
  - ffmpeg 8.1.1 (`/dependencies/windows-x64/ffmpeg/8.1.1/...`)
  - vieneu runtime (`/dependencies/vieneu/windows-x64/1.0.0` và `1.1.0/vieneu-turbo-runtime-1.1.0.zip`)
- **gendownload.com** — `/api/extractsrc`, `/api/channel`, `/api/health` (tải video nguồn từ URL/kênh).
- **api.genmax.io** — proxy ElevenLabs/MiniMax TTS.
- **api.ttssieure.com** — TTS tiếng Việt.
- **CapCut** — `login.us.capcut.com`, `login-row.www.capcut.com`, `edit-api-sg.capcut.com`.
- Cài Python backend: Miniforge3 (conda-forge), PyPI + `download.pytorch.org/whl/cpu`
  (`torch==2.5.1+cpu`, `torchaudio==2.5.1+cpu`), clone `github.com/R3gm/whisperX` và
  `github.com/R3gm/SoniTranslate`.

---

## 8. Auth (đăng nhập desktop)

- **Desktop auth bridge**: mở một HTTP server cục bộ (`127.0.0.1:<port>`) làm callback OAuth
  (`desktop_auth_bridge_bind`, `desktop_auth_callback_*`, `desktop_auth_state`/`code`).
- Luồng: app mở trình duyệt đăng nhập trên web → web redirect về `127.0.0.1` kèm `code` + `state`
  → Rust nhận, đổi lấy token (`auth_token`), lưu lại.
- Có kiểm tra `state_mismatch`, giới hạn kích thước request (chống lạm dụng).
- Job cần token: `native_vnext_job_token_required`, `authorized_job`, watermark policy
  (`watermark_policy_required` — bản chưa trả phí có thể bị đóng dấu).
- ID thiết bị: `dichvideo device installation_id`.

---

## 9. Hệ thống Component / Runtime (tự cài backend)

App tự tải & cài các "component" (ffmpeg, whisper, python, vieneu, piper...):

- `managed_component` + `manifest` (sha256) + `receipt` (bằng chứng đã cài đúng).
- Trạng thái vòng đời: `component_install_start` → `download` → `verify` → `prepare` →
  `set_before_ready` → ready. Có lock chống cài trùng (`component_in_process_lock`).
- `engine_vnext` = engine ML thế hệ mới (install/uninstall/addon theo plan-task).
- `backend_source` = clone git + tạo venv (`backend_source_install`, `venv`, `git`).
- Sửa chữa: `component_public_repair_start`. Dọn cache: `cleanup_runtime_download_cache`.

---

## 10. Các hệ thống con khác (tham chiếu nhanh)

- **Preview theo cue**: `native_cue_preview_*` — render nhanh từng đoạn để nghe/xem thử.
- **Cache content-addressed**: `native_*_cache` với hash + receipt cho audio/subtitle/export
  (`export_cache_store`, `cue_export_audio_cache`) → không render lại phần chưa đổi.
- **Retime/Time-warp**: `native_retime_ffmpeg`, `render_units` — chia video thành đơn vị render,
  co giãn thời gian từng đoạn.
- **Import SRT**: `srt_import_*` (apply, retime, preview, snapshot).
- **Hiệu ứng cửa sổ Windows**: `apply_acrylic / blur / mica / tabbed`.
- **Updater**: `tauri_plugin_updater` + `api.dichvideo.com/app/update`.

---

## 11. Gợi ý dựng lại project (nếu cần)

Khung tối thiểu để tái tạo:

1. **Tauri v2 + Vue 3 + Vite** (`npm create tauri-app`, chọn Vue + TS).
2. Rust backend: chia module theo mục 2–9 ở trên (mỗi stage = 1 module + vài `#[tauri::command]`).
3. Tích hợp ffmpeg (sidecar), whisper.cpp (sidecar `whisper-cli.exe`), aligner.
4. Lớp provider TTS/Translate theo trait chung (mục 5, 6).
5. Mô hình project + authority/revision (mục 3) — làm trước, vì mọi thứ phụ thuộc.
6. Auth bridge OAuth callback cục bộ (mục 8).

> File `identifiers_by_subsystem.txt` (cùng thư mục) liệt kê 3452 định danh nội bộ theo 40 nhóm —
> dùng làm "từ điển" đối chiếu khi code lại từng lệnh.

---

## 12. Phần cài thêm & model tải về (dữ liệu thật trên máy)

Nguồn: thư mục dữ liệu `%LOCALAPPDATA%\dichvideo` (Windows không phân biệt hoa/thường nên
`dichvideo` = `DichVideo` = cùng một chỗ). Sau khi cài, app tải thêm **~1.9GB** gồm 3 nhóm:

### 12.1. `bin/` — ffmpeg (193 MB)
- `ffmpeg.exe` (96.8MB) + `ffprobe.exe` (96.6MB), bản 8.1.1.
- Nguồn tải: `downloads.dichvideo.com/dependencies/windows-x64/ffmpeg/8.1.1/...` (mirror của gyan.dev).

### 12.2. `components/piper-native` → **vieneu-turbo-runtime 1.1.0** (1.13 GB) — TTS tiếng Việt
- **Đây là model TTS riêng của Bạn.** `capability = tts.vi.vieneu_turbo`,
  `variant = windows-x64-cpu-onnx-fp32`, `delivery = public_https`.
- `archive_sha256 = c57b69aae2c076dfb04c537e05b6af060660a327416a7980282312617bf16ef8`
- `installed_size_bytes = 1,131,329,080` (~1.13GB), 8542 file (chủ yếu Python site-packages).
- **Nguồn gốc (theo `source-lock.json`):**
  - Repo: `github.com/pnnbao97/VieNeu-TTS` @ `3206ed9...`, SDK 3.6.4, license Apache-2.0
  - Build từ máy của Bạn: `D:\Auto\VieNeu-TTS-benchmark` (đường dẫn build gốc còn lưu lại!)
  - Python 3.11.15 (uv-managed standalone) đóng gói kèm
  - Models HuggingFace:
    - `pnnbao-ump/VieNeu-TTS-v3-Turbo` @ `8b7e9cf...` (subset: onnx_update + clone encoder & denoiser)
    - `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX` @ `ceff0d0...`
- **Các model ONNX chính:**
  | File | Dung lượng | Vai trò |
  |------|-----------|---------|
  | `vieneu-turbo/denoiser.onnx` | 40.7MB | Khử nhiễu |
  | `vieneu-turbo/speaker_encoder.onnx` | 27.0MB | Mã hoá giọng (voice clone) |
  | `onnx_update/vieneu_v3_heads.npz` | 49.8MB | Trọng số các head |
  | `onnx_update/vieneu_acoustic_cached.onnx` | ~ | Acoustic model |
  | `onnx_update/vieneu_backbone_shared.data` | ~42MB | Backbone LLM (TTS) |
  | `onnx_update/vieneu_decode_step.onnx` / `vieneu_prefill.onnx` | ~ | Giải mã autoregressive |
  | `moss-audio-tokenizer/*.onnx` (encode/decode) | ~42MB×2 | Audio codec tokenizer |
  | `python/.../sea_g2p/sea_g2p.bin` | 59.9MB | G2P (chữ→âm vị) tiếng Việt |

### 12.3. `runtimes/dichvideo-engine-vnext 0.1.0-alpha.10` (641 MB) — engine STT/OCR/tách nhạc
- File chính: `engine.dvpack` (649MB, định dạng gói riêng) — chứa toàn bộ model.
- `package_sha256 = af4a391128cb5fdf...`, `package_size_bytes = 477,899,952`.
- **Native workers** (không cần Python): `dichvideo-tts-worker.exe`, `media-core.exe`,
  `media-segmenter.exe`, `media-isolator.exe` + `onnxruntime.dll` (15.4MB).
- **Capabilities (engine-contract.json):**
  `stt_fast`, `stt_general`, `speech_activity` (VAD), `local_tts`,
  `subtitle_ocr_high_accuracy`, `audio.source_separation.spleeter_2stems_fp16`.
- **Model bên trong dvpack (required_assets):** stt_fast (model+tokens), stt_general (part a/b/c +
  tokens), speech_gate (VAD), text_normalizer_dictionary, subtitle_ocr (det + rec + dict),
  source_separation (vocals + background — Spleeter 2 stems).
- **`forbidden_models`** (engine vnext thay thế hẳn, không dùng nữa): `faster-whisper-large-v3/v2/small`,
  `pyannote`, `rvc`, `xtts`, `deep-translator`, `sonitranslate`.

### 12.4. Ghi chú luồng cài
- Có **2 thế hệ backend**: **legacy** (whisper.cpp + Python whisperX/SoniTranslate + Miniforge —
  tải riêng khi cần) và **vnext** (engine native gói sẵn, không cần Python nặng). Máy này đang
  dùng **vnext** → thư mục `models/` (whisper ggml) trống, Python backend legacy chưa cài.
- Mỗi component có bộ 3 file kiểm chứng: `component-manifest.json` (danh sách file + hash),
  `component-fingerprint.json` (sha256 gói + kích thước), `evidence/source-lock.json` (nguồn gốc).
  Luồng cài: tải archive → verify sha256 → giải nén → ghi fingerprint/receipt → set ready.
- Dữ liệu người dùng nằm ở `~\.dichvideo\` (projects, downloads video nguồn, cache, state, device).

---

## 13. Frontend thật (hút từ app đang chạy qua CDP)

> Đã hút 59 file từ app đang chạy → `_recovery\frontend_raw\` (bản gốc minify) và
> `_recovery\frontend_beautified\` (đã format cho dễ đọc). `ui_invoke_commands.txt` = chuỗi lệnh.

### 13.1. Công nghệ (đính chính)
- Frontend KHÔNG phải Vue mà là **Next.js (React)** — build tĩnh (`output: export`, turbopack),
  phục vụ qua `http://tauri.localhost/`. Dấu "vue" trong exe lúc đầu là trùng chuỗi.
- Cùng một codebase Next.js phục vụ **2 vai trò**: shell app desktop (`/app`) và **website marketing**
  (`/cong-cu/*`, `/blog`, `/pricing`...).

### 13.2. Kiến trúc gọi lệnh (quan trọng — khác dự đoán ban đầu)
Frontend **hầu như không dùng Tauri `invoke()` trực tiếp** (0 lệnh tìm thấy). Thay vào đó gọi qua HTTP:
- **HTTP nội bộ `http://127.0.0.1:<port>/v1/...`** — Rust chạy một web server cục bộ, frontend gọi
  vào đó (thay cho invoke). Đây là "API backend cục bộ".
- **API đám mây** — cho auth, credits, jobs, licensing.

### 13.3. Backend đám mây (dịch vụ mạng)
- **`api.dichvideo.com`** (origin thật: `dichvideo-api.gbcihl.easypanel.host` — host trên EasyPanel).
- **Supabase** `kfeopqhxagdkzhetpzkb.supabase.co` — auth (`/auth/v1/token`) + DB.
- **`api.genmax.io`** — proxy TTS (ElevenLabs/MiniMax).

### 13.4. Bản đồ API (65 endpoint rút từ bundle)
| Nhóm | Endpoint |
|------|----------|
| **Auth** | `/auth/login-code`, `/request-login-code`, `/password-login`, `/dev-login`, `/refresh`, `/logout`, `/supabase-bootstrap`, `/registration-policy`, `/public-account` |
| **Thiết bị / license** | `/devices/activate`, `/current`, `/heartbeat`, `/offline-lease`, `/release`, `/session`, `/switch`, `/license/status` |
| **Credits / thanh toán** | `/credits/balance`, `/dev-grant`, `/plans`, `/pricing`, `/buy`, `/payments/checkout`, `/payments/manual-order`, `/trial/claim` |
| **Jobs** (cầu nối native↔cloud) | `/jobs`, `/jobs/authorize-local`, `/jobs/local-preflight`, `/jobs/premium-voice-checks` |
| **Dịch / TTS server** | `/translation/segments`, `/translation/consistency/finalize`, `/tts/segments` |
| **Runtime** | `/runtime/server-config`, `/ready`, `/native-vnext/` |
| **Admin** | `/admin/dashboard/overview`, `/announcements`, `/inbox/summary`, `/jobs/archive`, `/jobs/reconcile-stale`, `/ops/status`, `/payments/pending`, `/plans` |
| **Trang web** | `/app`, `/cong-cu/dich-video`, `/cong-cu/long-tieng-ai`, `/cong-cu/phu-de-tu-dong`, `/blog`, `/faq`, `/so-sanh`, `/buy`, `/terms`, `/privacy`, `/dmca` |

### 13.5. Mô hình kinh doanh (suy từ API)
- **SaaS tính phí theo credits** + gói (plans/pricing), thanh toán (checkout + manual-order thủ công).
- **License gắn thiết bị**: activate/heartbeat/session/switch + **offline-lease** (dùng offline có hạn).
- **Job authorization**: mỗi lần xử lý (STT/TTS/export) native phải xin phép server
  (`authorize-local` + `local-preflight` + `premium-voice-checks` để check quota giọng premium)
  → trừ credits. Watermark cho bản chưa trả phí (mục 8).

### 13.6. File đã lưu
- `_recovery\frontend_raw\` — 59 file gốc (28KB HTML + 195KB CSS + 56 JS chunk minify).
- `_recovery\frontend_beautified\` — bản format dễ đọc (đọc flow UI ở đây).
- `_recovery\ui_invoke_commands.txt` — chuỗi lệnh/khoá phổ biến trong UI.
- `_recovery\frontend_raw\_manifest.json` — ánh xạ url ↔ file ↔ dung lượng.

> **Lưu ý:** đây là bản **đã minify** (turbopack) — chạy & đọc được logic, nhưng KHÔNG phải source
> `.tsx` gốc (mất tên component/biến/comment). Muốn source thật phải có lại project Next.js gốc.

---

## 14. Audit: app có dùng API AI bên ngoài để xử lý không?

**Kết luận: Lõi xử lý chạy 100% CỤC BỘ. API AI bên ngoài chỉ là đường PREMIUM tuỳ chọn (bị SaaS khoá).**

### 14.1. Xử lý cục bộ (KHÔNG cần internet/AI ngoài)
| Chức năng | Chạy bằng | Nơi |
|-----------|-----------|-----|
| STT (nhận dạng) | whisper.cpp + engine-vnext (SenseVoice ONNX) | Local |
| VAD, tách giọng/nhạc | speech_gate + Spleeter 2stems (ONNX) | Local |
| OCR phụ đề cứng | subtitle_ocr det/rec (ONNX) | Local |
| Căn chỉnh | dichvideo-aligner.exe | Local |
| TTS thường | **Piper** + **VieNeu-turbo** (ONNX) | Local |
| Dịch LLM | `OpenAI(api_key="local", base_url="http://127.0.0.1/v1")` | **Local** (endpoint OpenAI-compatible cục bộ) |

> Bằng chứng quan trọng: LLM dịch trỏ vào `http://127.0.0.1/v1` — tức chạy model cục bộ qua giao
> thức OpenAI-compatible, KHÔNG gọi OpenAI thật. **Không tìm thấy** host chính thức nào của
> OpenAI/Anthropic/Gemini trong exe lẫn frontend.

### 14.2. API bên ngoài (tuỳ chọn — phần lớn bị SaaS/credits khoá)
| Dịch vụ ngoài | Dùng cho | Kiểu | Ghi chú |
|---------------|----------|------|---------|
| Google gtx / Bing / LibreTranslate | Dịch nhanh | Free, không key | Gọi trực tiếp |
| DeepL | Dịch | Cần `DEEPL_API_KEY` (user tự nhập) | |
| **api.genmax.io** (ElevenLabs, MiniMax) | **TTS giọng premium** | AI trả phí, key giữ ở server | Header `xi-api-key`, gửi `job_token` — **khoá sau credits** |
| CapCut "viral" TTS | TTS | Cần login CapCut (cookie) | |
| ttssieure (`api.ttssieure.com`) | TTS tiếng Việt | Có api-key riêng | Dùng nhiều trong UI |
| edge-tts (Bing) | TTS free | Websocket Microsoft | Fallback khi server TTS lỗi |

### 14.3. Ý nghĩa cho bản bỏ SaaS
- **Bỏ được SaaS mà vẫn xử lý được** phần media: STT/OCR/tách nhạc/align/TTS local đều chạy độc lập.
- **Mất giọng TTS premium** (ElevenLabs/MiniMax/CapCut/ttssieure) — thay bằng Piper/VieNeu local
  hoặc để người dùng tự nhập key riêng.
- **⚠️ ĐÍNH CHÍNH (xem mục 15): bước DỊCH của engine vnext KHÔNG local** — nó gọi LLM `gpt-5.5`
  qua server của họ. Bỏ SaaS phải thay bằng: LLM key riêng (OpenAI/Gemini) HOẶC Google gtx/DeepL/Libre free.

---

## 15. Lệnh thật bắt được khi chạy app (spike capture)

> Bắt bằng monitor process (`_recovery\captured_cmds.log`) + artifact bền vững trong
> `%USERPROFILE%\Videos\dichvideo\native-vnext\<job_id>\`. Đây là 1 run thật: video Trung (zh)→Việt.

### 15.1. Chuỗi pipeline thực tế (từ `native-resume-cache.json` stage_keys)
```
extract_audio → prepare → stt → subtitles → translation → tts
→ tts_forced_alignment → compose_audio → retime → export
```

### 15.2. Lệnh chính xác từng bước
**1. Probe:**
```
ffprobe -v quiet -print_format json -show_format -show_streams <video>
ffprobe -v error -select_streams a:0 -show_entries stream=codec_type,codec_name,channels,sample_rate,... -of json <source.mp4>
```
**2. Tách audio cho STT (16kHz mono):**
```
ffmpeg -i <source.mp4> -map 0:a:0 -vn -af aresample=16000:async=1000:first_pts=0 \
  -acodec pcm_s16le -ar 16000 -ac 1 -y <job>/audio/source.wav
```
**3. STT (media-segmenter = sherpa-onnx SenseVoice + silero VAD):**
```
media-segmenter.exe --silero-vad-model=vad-model.onnx --silero-vad-threshold=0.25 \
  --silero-vad-min-silence-duration=0.20 --silero-vad-min-speech-duration=0.10 \
  --silero-vad-max-speech-duration=5 --tokens=tokens.txt \
  --sense-voice-model=sense-model.onnx --sense-voice-language=zh --sense-voice-use-itn=1 \
  --provider=cpu --num-threads=4 input.wav
```
> Model (`vad-model.onnx`, `tokens.txt`, `sense-model.onnx`) được **giải nén từ `engine.dvpack` ra
> thư mục temp lúc chạy, xoá ngay sau đó**. Muốn dùng lại phải tự trích từ dvpack.

**4. Dịch — ⚠️ AI NGOÀI qua server** (`translation-batch-manifest.json`):
```
model: "gpt-5.5"   route: "server_exact_dialogue_v1"   proxy_route: "provider_pool"
target_language: "vi"   batch 58 seg/lần   usage: input_tokens ~6800, cost_vnd 0 (ẩn trong credits)
→ endpoint: api.dichvideo.com/translation/segments
```
**5. TTS — LOCAL** (`tts/native-tts-manifest.json`):
```
provider_id: "vieneu_native"   voice: "dv_vi_001"
mỗi segment: {index, text, audio_path cue-XXXX.wav, cache_key, duration_ms, provenance}
→ chạy qua python runtime của vieneu (KHÔNG qua dichvideo-tts-worker.exe;
   worker đó dành cho piper/provider khác)
```

### 15.3. Cấu hình pipeline (từ `native-performance-trace.json` → `soni_compatibility`)
| Tham số | Giá trị |
|---------|---------|
| originalAudioStrategy | `separate_background` (tách nhạc nền) |
| volumeOriginalAudio / volumeTranslatedAudio | 0.18 / 3.0 |
| maxAccelerateAudio | 2.0 (tăng tốc audio để khớp timing) |
| syncVoiceTiming / avoidOverlap / accelerationRateRegulation | true |
| displaySubtitleTiming | `source_timing` |
| resource: stt/tts/translation/ffmpeg threads | 4/4/4/4; profile `fast` |
| watermark | `authorization_watermark_required: true` (SaaS đóng dấu bản chưa trả phí) |

### 15.4. Chưa bắt được (nhưng đã biết CLI từ strings — mục spike trước)
- `media-isolator.exe` (tách nhạc): `--input-wav --output-vocals-wav --output-accompaniment-wav --spleeter-vocals --spleeter-accompaniment --uvr-model`
- `ffmpeg` burn sub/export: chưa chạy (user không export). Dùng `-vf subtitles/ass` + mux audio.

### 15.5. Kết luận spike
Đủ dữ liệu để thiết kế lớp điều phối. Việc còn phải làm ở khâu thiết kế:
1. **Trích model từ `engine.dvpack`** (STT/VAD/OCR/separation) — vì runtime xoá temp.
2. **Thay bước dịch** (gpt-5.5 qua server) bằng LLM key riêng hoặc Google/DeepL.
3. Tận dụng trực tiếp: `media-segmenter` (STT), vieneu runtime (TTS), ffmpeg, `media-isolator`.

