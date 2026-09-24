# DichVideo-Local — Thiết kế app dịch/lồng tiếng video KHÔNG SaaS

- **Ngày:** 2026-09-24
- **Trạng thái:** Design (đã duyệt hướng, chờ review spec)
- **Nguồn tham chiếu:** `_recovery/KIEN_TRUC_TAI_DUNG.md` (phân tích ngược app gốc DichVideo 1.6.5)

## 1. Mục tiêu

Xây một app desktop Windows **độc lập hoàn toàn** để dịch & lồng tiếng video bằng AI, tái hiện
pipeline của DichVideo gốc nhưng **bỏ toàn bộ lớp SaaS** (đăng nhập, credits, license, job
authorization, watermark, thanh toán).

**Thành công khi:** nhập 1 video tiếng nước ngoài → app tự tạo phụ đề gốc → dịch sang tiếng Việt →
lồng tiếng → xuất video có phụ đề + tiếng Việt, chạy được **offline** (trừ bước dịch nếu chọn provider online),
không cần tài khoản/credits.

## 2. Nguyên tắc & phạm vi

### 2.1. Độc lập tuyệt đối
- **Không** đọc/gọi/copy bất kỳ file, binary, model nào của app DichVideo đã cài
  (`%LOCALAPPDATA%\dichvideo`, `Dich Video`, `com.dichvideo.app`).
- **Không** bẻ khoá `engine.dvpack`. Mọi engine/model lấy từ **nguồn mở public**.
- Thông tin từ phân tích ngược (lệnh, tham số, config mix) chỉ dùng làm **tài liệu tham chiếu thiết kế**.

### 2.2. Ngoài phạm vi (KHÔNG làm)
Web marketing, admin panel, thanh toán, license/multi-device, auth, watermark, OCR phụ đề cứng
(subtitle_ocr — để giai đoạn sau), hệ authority/ledger phức tạp của app gốc.

### 2.3. Stack
Tauri v2 + Rust backend + Web UI (TS/React hoặc Svelte) trên Windows x64. VieNeu-TTS chạy qua
Python sidecar (đóng gói bằng uv, giống app gốc).

## 3. Kiến trúc

```
┌───────────────────────────────────────────────┐
│  Web UI (Tauri)                                │
│  Import · Cue editor · Settings · Run · Export │
└───────────────┬───────────────────────────────┘
                │ tauri::invoke
┌───────────────▼───────────────────────────────┐
│  Rust core                                     │
│  Pipeline orchestrator (state machine + resume)│
│  ├─ EngineAdapter   (spawn process/onnx)       │
│  ├─ TranslateProvider (trait)                  │
│  ├─ TtsProvider       (trait)                  │
│  ├─ ProjectStore      (JSON trên đĩa)          │
│  └─ Config/Secrets    (key lưu local)          │
└───────────────┬───────────────────────────────┘
                │ spawn / lib call
   sherpa-onnx (STT+VAD) · separator · VieNeu(py) · piper · ffmpeg
```

### 3.1. Ranh giới module (mỗi cái test độc lập)
- **EngineAdapter**: bọc mọi tiến trình con (STT, separator, TTS local, ffmpeg). Đầu vào/ra là
  struct rõ ràng (đường dẫn file + tham số), không lộ chi tiết CLI ra ngoài.
- **TranslateProvider** (trait): `translate(segments, src, tgt, opts) -> translated_segments`.
  Impl: `OpenAiCompatible` (OpenAI/Gemini/bất kỳ base_url), `GoogleFree`, `DeepL`.
- **TtsProvider** (trait): `synthesize(cue{text, voice, timing}) -> wav_path`.
  Impl: `VieNeuLocal`, `Piper`, `ElevenLabs`, `MiniMax` (3 cái sau: key riêng, tuỳ chọn).
- **Pipeline orchestrator**: điều phối stage theo thứ tự, có checkpoint/resume, không biết chi tiết
  từng engine (chỉ gọi qua adapter/trait).
- **ProjectStore**: đọc/ghi project trên đĩa; **không** có server state.

## 4. Pipeline (bám lệnh thật đã bắt — xem `_recovery` mục 15)

Thứ tự: `extract_audio → [separate] → stt → translate → tts → retime → compose → export`.

| Stage | Cách làm (bản độc lập) | Tham số chốt |
|-------|------------------------|--------------|
| extract_audio | `ffmpeg -map 0:a:0 -vn -af aresample=16000:async=1000:first_pts=0 -acodec pcm_s16le -ar 16000 -ac 1` | 16kHz mono |
| separate (tuỳ chọn) | separator ONNX/Spleeter → vocals + accompaniment | strategy `separate_background` |
| stt | **sherpa-onnx offline** + SenseVoice + silero VAD | vad_threshold 0.25, min_silence 0.20, min_speech 0.10, max_speech 5, use_itn 1, provider cpu, threads 4 |
| translate | Provider chọn (LLM key / Google / DeepL) | batch ~58 seg, src auto, tgt vi |
| tts | Provider chọn (mặc định VieNeu, voice ví dụ `dv_vi_001` tương đương) | concurrency 4, cache theo text_hash |
| retime | Co giãn audio khớp timing phụ đề | maxAccelerate 2.0, syncVoiceTiming, avoidOverlap |
| compose | `ffmpeg` mix: giọng dịch + nền | volumeOriginal 0.18, volumeTranslated 3.0 |
| export | `ffmpeg` mux video + audio mới; burn sub (tuỳ chọn) `-vf subtitles/ass` | encoder cấu hình được |

> Lưu ý: `media-segmenter` của app gốc chính là **sherpa-onnx-offline** (cùng bộ cờ
> `--sense-voice-model --silero-vad-model`). Bản độc lập dùng sherpa-onnx chính thức → tham số 1:1.

## 5. Cấp engine & model (tải từ nguồn public, lần đầu)

| Thành phần | Nguồn | License |
|-----------|-------|---------|
| sherpa-onnx (bins/lib) | github.com/k2-fsa/sherpa-onnx (release) | Apache-2.0 |
| SenseVoice model (ONNX) | HuggingFace (sherpa-onnx sense-voice) | model license |
| silero-vad | github/silero-vad (onnx) | MIT |
| VieNeu-TTS + model | github.com/pnnbao97/VieNeu-TTS + HF `pnnbao-ump/VieNeu-TTS-v3-Turbo`, `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX` | Apache-2.0 |
| Piper (tuỳ chọn) | github.com/rhasspy/piper + piper-voices | MIT |
| separator (Spleeter 2stems / UVR onnx) | nguồn tương ứng | tương ứng |
| ffmpeg/ffprobe | ffmpeg.org / gyan.dev build | LGPL/GPL |

Có **ComponentManager** riêng của app mới: tải → verify sha256 → giải nén vào thư mục dữ liệu của
app mới (KHÔNG dùng chỗ của app gốc), ghi manifest. (Học mô hình component app gốc nhưng viết mới.)

## 6. Mô hình dữ liệu (local, đơn giản hoá)

Thư mục project của app mới (vd `%APPDATA%\dichvideo-local\projects\<id>\`):
```
project.json          # metadata: nguồn video, ngôn ngữ, provider đã chọn, trạng thái stage
source/               # video gốc (hoặc pin đường dẫn)
audio/source.wav      # 16kHz mono
subtitles/            # source.srt, source.aligned.srt, translated.vi.srt
tts/segments/*.wav    # audio từng cue
tts/manifest.json     # schema học từ native-tts-manifest: {index,text,voice,audio_path,cache_key,duration_ms}
output/               # video xuất
checkpoint.json       # stage_keys (hash) để resume — học từ native-resume-cache
```
**Bỏ** hệ authority/ledger/receipt phức tạp. Giữ **cache theo hash** (không render lại phần chưa đổi)
và **resume** (chạy tiếp sau khi ngắt) vì rẻ và hữu ích.

## 7. Cấu hình & khoá (lưu local)

Màn Settings, lưu ở file config local (khoá mã hoá bằng DPAPI như app gốc dùng cho ttssieure):
- **Dịch:** chọn provider mặc định + nhập key (OpenAI/Gemini base_url+key, DeepL key). Google gtx không cần key.
- **TTS:** chọn provider mặc định (VieNeu local) + key premium tuỳ chọn (ElevenLabs `xi-api-key`, MiniMax).
- **Ngôn ngữ:** nguồn (auto/zh/en/...), đích (vi mặc định).
- **Mix:** volumeOriginal 0.18, volumeTranslated 3.0, maxAccelerate 2.0 (mặc định như app gốc, chỉnh được).

## 8. UI (5 màn tối thiểu)

1. **Import** — chọn/kéo-thả video, chọn ngôn ngữ nguồn/đích, provider.
2. **Cue editor** — bảng phụ đề: sửa text gốc/dịch, chỉnh timing, nghe thử 1 cue TTS.
3. **Settings** — provider + key + tham số mix.
4. **Run** — bấm chạy, xem tiến độ **từng stage** (extract→…→export), log lỗi rõ ràng.
5. **Export** — chọn có burn sub / định dạng, xuất, mở thư mục kết quả.

## 9. Xử lý lỗi, resume, test

- **Lỗi:** mỗi stage trả `Result` có mã lỗi rõ (vd `stt_model_missing`, `translate_provider_unauthorized`);
  UI hiện nguyên nhân + cách sửa. Không nuốt lỗi.
- **Resume:** checkpoint sau mỗi stage; chạy lại thì bỏ qua stage đã xong (so hash input).
- **Test:**
  - Unit: mỗi TranslateProvider/TtsProvider (mock HTTP), EngineAdapter (giả lập binary).
  - Integration: 1 clip ngắn (~15s) chạy hết pipeline với VieNeu + Google dịch → so số cue, có file output.
  - TDD cho phần thuần logic (parse srt, batch dịch, retime, cache-key).

## 10. Milestone (thứ tự thực thi)

1. **M1 — Khung + STT** *(rủi ro cao nhất, làm trước)*: Tauri skeleton + tích hợp **sherpa-onnx**,
   tải SenseVoice+silero, chạy `extract_audio → stt` ra `source.srt` cho 1 clip. **Spike nhỏ đầu M1**
   để chốt cách nhúng sherpa-onnx (crate `sherpa-rs` vs spawn CLI vs C-API).
2. **M2 — Dịch đa provider**: TranslateProvider (Google free + OpenAI-compatible), batch, ra `translated.vi.srt`.
3. **M3 — TTS VieNeu local**: Python sidecar VieNeu, sinh `tts/segments/*.wav` + manifest + cache.
4. **M4 — Retime + compose + export**: khớp timing, mix (0.18/3.0), mux + burn sub ra video.
5. **M5 — UI hoàn chỉnh**: 5 màn + Settings/key + tiến độ.
6. **M6 (tuỳ chọn)**: tách nhạc nền, Piper, premium TTS (key riêng), OCR phụ đề cứng.

## 11. Rủi ro

| Rủi ro | Giảm thiểu |
|--------|-----------|
| Nhúng sherpa-onnx vào Rust | Spike đầu M1; fallback: spawn `sherpa-onnx` CLI chính thức |
| VieNeu chạy ngoài app gốc (python runtime, model path) | Dùng repo VieNeu-TTS gốc + uv standalone python; test riêng ở M3 |
| Retime/khớp timing (thuật toán tinh vi) | Bản đầu dùng cách đơn giản (accelerate audio theo tỉ lệ, cap 2.0); tinh chỉnh sau |
| Chất lượng dịch LLM vs Google | Cho chọn provider; mặc định Google free, nâng LLM khi có key |
| License model (SenseVoice/VieNeu) | Đa số Apache/MIT; ghi rõ nguồn + license trong app |

## 12. Câu hỏi mở (chốt khi làm plan)
- UI framework cụ thể (React vs Svelte) — đề xuất React + Vite (giống hệ sinh thái app gốc).
- Separator dùng Spleeter (python, nặng) hay UVR-onnx (nhẹ) — quyết ở M6.
