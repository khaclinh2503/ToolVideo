# M7 — Giọng lồng tiếng VieNeu-TTS

**Ngày:** 2026-09-26
**Trạng thái:** thiết kế, chờ duyệt

## 1. Vì sao làm

Hiện app chỉ có đúng một giọng: `vi_VN-vais1000-medium` của Piper, 22 kHz. Người
dùng muốn chọn người lồng tiếng.

Kho giọng Piper tiếng Việt công khai chỉ có ba model, và hai trong số đó kém hơn
hẳn cái đang dùng:

| Model | Số giọng | Tần số | Chất lượng |
|---|---|---|---|
| `vais1000` (đang dùng) | 1 | 22050 Hz | medium |
| `25hours_single` | 1 | 16000 Hz | low |
| `vivos` | 65 | 16000 Hz | x_low |

Thêm chúng vào chỉ tạo ra ảo giác nhiều lựa chọn. Đường đúng là đổi engine.

## 2. App gốc đã làm gì

Tài liệu tái dựng (`_recovery/KIEN_TRUC_TAI_DUNG.md`) nói rõ:

```
190: App tự tải & cài các "component" (ffmpeg, whisper, python, vieneu, piper...)
243: installed_size_bytes ≈ 1.13 GB, 8542 file (chủ yếu Python site-packages)
247: Python 3.11.15 (uv-managed standalone) đóng gói kèm
261: python/.../sea_g2p/sea_g2p.bin — 59.9 MB — G2P (chữ→âm vị) tiếng Việt
418: provider_id: "vieneu_native"   voice: "dv_vi_001"
```

Và frontend của app gốc (`_recovery/frontend_beautified/…0iyjkzu_mf1-l.js`) khai
đúng bốn giọng, provider `piper_native`:

| id | Nhãn | Giới | Mô tả |
|---|---|---|---|
| `dv_vi_001` | Ngọc Huyền | nữ | tự nhiên, truyền cảm, hợp thuyết minh và kể chuyện |
| `dv_vi_002` | Mạnh Dũng | nam | rõ chữ, vững giọng, hợp tin tức và thuyết minh |
| `dv_vi_003` | Minh Khang | nam | trẻ, sáng giọng, hợp review |
| `dv_vi_004` | Minh Quang | nam | ấm, cân bằng, hợp video dài |

**"Ngọc Huyền" và "Mạnh Dũng" là tên giọng preset có sẵn của VieNeu-TTS.** Bốn
giọng "riêng" của app gốc chỉ là đổi tên giọng preset. Ta lấy được y hệt và nhiều
hơn.

## 3. Thứ sẽ có

VieNeu-TTS v3 Turbo (`pnnbao-ump/VieNeu-TTS-v3-Turbo`, Apache-2.0):

- **25 giọng dựng sẵn**, ba miền Bắc/Trung/Nam, cả hai giới
- **48 kHz** (Piper 22 kHz)
- Chuyển ngữ Anh–Việt trong cùng câu
- Chỉ dẫn sắc thái trong câu (`[cười]`, `[hắng giọng]`) và `style=`
- Nhân bản giọng từ mẫu ghi âm

Tốc độ CPU: RTF ≈ 0.5 (fp32). Chậm hơn Piper rõ rệt nhưng vẫn nhanh hơn thời gian
thực — một video 10 phút mất khoảng 5 phút lồng tiếng.

## 4. Vì sao phải kèm Python

Không tránh được, và lý do không nằm ở chỗ ta lười:

1. Bộ ONNX bị **tách thành nhiều đồ thị** (`vieneu_prefill.onnx`,
   `vieneu_decode_step.onnx`, `vieneu_acoustic_cached.onnx`, `vieneu_v3_heads.npz`).
   Vòng lặp sinh token, quản lý KV cache và lấy mẫu nằm trong mã Python chứ không
   nằm trong model.
2. **`sea-g2p`** — bộ chuyển chữ sang âm vị tiếng Việt, 60 MB, là thư viện Python.
   Không có nó thì đọc sai ngay từ đầu. Viết lại bằng Rust nghĩa là dựng lại một
   hệ G2P tiếng Việt — không đáng và nhiều rủi ro hơn hẳn phần suy diễn.

Cái giá — **số đo thật, không phải ước lượng**: wheel tải về 206 MB nhưng cài
xong trên đĩa **775 MB**, cộng model fp32 435 MB là khoảng **1.2 GB**. Ước lượng
300–500 MB ban đầu trong bản nháp spec này là sai và đã được sửa sau khi Task 2
đo bằng `du -sh`. Con số 1.2 GB khớp với 1.13 GB của app gốc, nên đây là cái giá
thật của engine chứ không phải ta làm gì thừa.

Người dùng đã chấp thuận sau khi biết con số thật, và **đã chọn bản fp32** thay
vì int8 (tiết kiệm 277 MB nhưng cần CPU có AVX-VNNI): lỗi int8 trên CPU cũ là
tiếng méo âm thầm chứ không báo lỗi.

Một phần đáng kể của 775 MB là `gradio`/`fastapi`/`uvicorn`/`pandas`/`scikit-learn`
— bộ web UI và API server mà cầu nối không bao giờ chạm. Cắt đi tiết kiệm ~203 MB
nhưng phải dùng `--no-deps` rồi tự liệt kê lõi. **Không cắt**: tự cắt nghĩa là
nhận lấy bài toán giải phụ thuộc mà tác giả SDK đã giải, và một import gián tiếp
bị thiếu sẽ nổ giữa lúc lồng tiếng chứ không nổ lúc cài.

## 5. Kiến trúc

Giữ nguyên mọi thứ đang chạy. VieNeu vào như một `TtsProvider` thứ hai.

```
  cues::preview ─┐
                 ├──► Box<dyn TtsProvider> ──┬──► Piper      → piper.exe
  run_tts_stage ─┘                           └──► VieNeu     → python.exe + cầu nối
```

### 5.1 Thành phần mới

Ba mục thêm vào `components.json`, pin sha256 như mọi mục khác:

| id | Nguồn | Ước lượng |
|---|---|---|
| `python` | python-build-standalone, bản `install_only` cho `x86_64-pc-windows-msvc` | ~30 MB |
| `vieneu-model` | ONNX **fp32** (`onnx_update/`) từ `pnnbao-ump/VieNeu-TTS-v3-Turbo` | ~435 MB |
| `vieneu-speaker-encoder` | `speaker_encoder.onnx` (cần cho nhân bản giọng) | 27 MB |

Gói Python (`vieneu`, `onnxruntime`, `sea-g2p`, …) **không** tải qua cơ chế một
file — chúng là cả cây thư mục. Thay vào đó: sau khi đặt xong `python`, chạy

```
python -m pip install --require-hashes -r vieneu-requirements.txt --target <models>/vieneu/site-packages
```

`vieneu-requirements.txt` được commit vào repo, mỗi dòng kèm `--hash=sha256:…`.
`pip` từ chối cài bất cứ thứ gì không khớp hash, nên nguyên tắc "pin mọi thứ tải
về" của dự án vẫn được giữ, chỉ là do pip thi hành thay vì `components.rs`.

`is_installed` cho bước này kiểm sự tồn tại của một file mốc trong
`site-packages` cộng sổ `.state` như các thành phần khác.

**Ruling:** không dùng `uv` dù app gốc dùng. Thêm một binary nữa chỉ để cài gói
là thêm một thứ phải pin và phải tin, trong khi `pip` đã nằm sẵn trong bản
python-build-standalone và `--require-hashes` cho đúng mức đảm bảo cần thiết.

### 5.1b Dữ kiện đã kiểm từ SDK thật

Đọc `models/vieneu/site-packages/vieneu/v3turbo.py` ngày 2026-09-26, bản
`vieneu 3.8.3`:

| Dữ kiện | Hệ quả |
|---|---|
| `__init__` có `onnx_dir: Optional[str]` | Trỏ được vào thư mục ONNX cục bộ ⇒ **pin được model**, không để SDK tự tải |
| `precision="fp32"` ⇒ subfolder `onnx_update` | Pin đúng `onnx_update`, **không phải** `onnx`. `int8` ⇒ `onnx_int8` |
| Không có `infer_to_file` | Cầu nối tự ghi WAV bằng `soundfile` (đã nằm trong 79 gói đã pin) |
| `infer()` có `apply_watermark: bool = True` | **Giữ nguyên bật.** Xem mục 5.2b |
| `self.sample_rate = 48_000` | Khớp mục 6 |

### 5.2 Cầu nối Python

Một script **do chúng ta viết và commit vào repo**, `src-tauri/python/vieneu_bridge.py`,
không lấy từ bên ngoài. Giao thức bắt chước đúng `--json-input` của Piper để tầng
trên không phải biết mình đang gọi engine nào:

- đọc stdin, mỗi dòng một JSON: `{"text": "...", "output_file": "...", "voice": "...", "length_scale": 1.0}`
- tổng hợp, ghi WAV, in một dòng đường dẫn ra stdout rồi `flush`
- lỗi của một dòng: in ra stderr, thoát khác 0

Mô hình được nạp **một lần** cho cả batch — đây là lý do chính phải dùng giao
thức dòng thay vì gọi một tiến trình mỗi cue: nạp model mất vài giây.

`HF_HOME` được trỏ vào `<models>/vieneu/cache` để thư viện không tải model vào
`%USERPROFILE%\.cache` ngoài tầm kiểm soát của app.

### 5.2b Thuỷ vân

`infer()` nhúng thuỷ vân vào audio sinh ra, mặc định bật. **Giữ nguyên bật.**

Dự án này cố ý loại bỏ watermark của app gốc, nhưng hai thứ khác hẳn nhau: cái
kia là watermark **thương hiệu** dán lên sản phẩm của người dùng, còn cái này là
dấu nhận biết **giọng do AI tạo**. Tắt đi nghĩa là chủ động làm cho giọng tổng
hợp không phân biệt được với người thật — không phải mặc định ta nên chọn thay
cho người dùng.

Nếu người dùng chủ động yêu cầu tắt cho video của chính họ thì đó là quyết định
của họ, nhưng phải do họ nói ra, và khi đó mới thêm một mục cấu hình.

### 5.3 Provider Rust

`src-tauri/src/tts/vieneu.rs`, cài `TtsProvider`:

- `id() -> "vieneu"`
- `sample_rate() -> 48000`
- `synthesize(jobs, on_done)` — spawn `python.exe vieneu_bridge.py`, đẩy JSON dòng,
  đọc stdout đếm tiến độ

Dùng lại nguyên khuôn ba luồng song song của `tts/piper.rs` (stdin luồng riêng,
stdout luồng gọi, stderr luồng riêng, đọc theo byte rồi decode lossy). Khuôn đó
đã trả giá để có và lý do vẫn nguyên vẹn ở đây.

`CREATE_NO_WINDOW` trên mọi lần spawn.

### 5.4 Tốc độ đọc

**Đã kiểm mã SDK thật (2026-09-26, vieneu 3.8.3):** `V3TurboVieNeuTTS.infer()`
**không có tham số tốc độ nào**. Đã grep `speed` / `tempo` / `length_scale` /
`rate` trong cả `v3turbo.py` lẫn `base.py` — không có. VieNeu không ép được tốc
độ ở tầng engine.

**Quyết định:** ép tốc độ bằng **hậu xử lý `ffmpeg atempo`** trên WAV đã sinh,
không phải bằng tham số engine.

Cách này tốt hơn đường của Piper chứ không phải giải pháp chữa cháy:

- `atempo` là phép số học xác định và đo được, nên **không thể** rơi vào kiểu lỗi
  "engine nhận tham số rồi lặng lẽ bỏ qua" đã làm tính năng ép tốc độ thành no-op
  suốt từ M3 tới khi phát hiện ở M6.
- `atempo` giữ nguyên cao độ, đúng thứ cần khi nén lời nói cho vừa khung.
- `MIN_LENGTH_SCALE = 0.6` nằm gọn trong dải hợp lệ một tầng của `atempo`
  (0.5–2.0), nên không phải nối chuỗi filter.

Quy đổi: `length_scale` của Piper là **hệ số kéo dài** (0.6 = đọc nhanh hơn), còn
`atempo` là **hệ số tốc độ** (2.0 = nhanh gấp đôi). Nên `atempo = 1 / length_scale`.
Đây là chỗ rất dễ đảo ngược — phải có test bắt đúng chiều.

**Bắt buộc:** phải có một test E2E chứng minh engine thật sự đọc nhanh hơn khi
giảm tốc độ — đúng loại test mà M6 phát hiện là thiếu và vì thế toàn bộ tính năng
ép tốc độ đã là no-op suốt từ M3. Ngưỡng dùng cùng lập luận: đo nhiễu thật, đặt
ngưỡng giữa "hiệu ứng thật" và "nhiễu".

## 6. Chỗ nguy hiểm: tần số mẫu

`compose.rs:58` so tần số từng WAV với `manifest.sample_rate` và **báo lỗi nếu
lệch**. Piper 22050 Hz, VieNeu 48000 Hz.

Hệ quả phải xử lý:

1. **Đổi giọng rồi chạy lại "Lồng tiếng"** — an toàn. `voice` và `provider` đều
   nằm trong `tts::cache_key`, nên mọi cue sinh lại và manifest ghi tần số mới.
2. **Đổi giọng rồi bấm "Nghe thử" một cue** — **nguy hiểm**. `cues::preview` sẽ
   ghi một WAV 48 kHz vào một manifest ghi 22050 Hz. Lỗi chỉ lộ ra lúc Xuất, khi
   `compose` từ chối.

**Quyết định:** `cues::preview` phải kiểm tần số của provider so với
`manifest.sample_rate` **trước khi gọi engine**, và từ chối bằng lỗi tiếng Việt
gọi tên bước còn thiếu:

> "Giọng đọc đã đổi (48000 Hz so với 22050 Hz trong bản lồng tiếng hiện có) — chạy lại Lồng tiếng trước"

Chặn sớm ở đúng điểm vào, cùng triết lý đã dùng cho dòng trống ở M6. Sai thì
người dùng phải lồng tiếng lại cả dự án khi đổi giọng — mà đó đúng là việc cần làm.

Ngoài ra `preview` hiện **không** cập nhật header manifest (đã ghi nợ ở M6 review).
Với một tần số thì vô hại; giờ thì không. Kiểm tần số ở trên biến món nợ đó thành
vô hại vĩnh viễn, vì hai giá trị không bao giờ còn lệch nhau được nữa.

## 7. Cấu hình và giao diện

`TtsConfig` thêm:

```rust
pub default_provider: String,  // đã có: "piper" | "vieneu"
pub voice: String,             // đã có, nhưng nay phụ thuộc provider
```

Giọng là **tên tiếng Việt** với VieNeu (`"Hải Đăng"`) và **tên model** với Piper
(`"vi_VN-vais1000-medium"`). Hai không gian tên khác nhau, nên đổi provider phải
đặt lại `voice` về mặc định của provider đó thay vì mang theo giá trị vô nghĩa.

Lệnh mới `tts_voices(provider)` trả danh sách `{id, label, gender, region, note}`
để giao diện không tự bịa danh sách — cùng cách đã làm với ngữ cảnh dịch ở #3.

Danh sách giọng VieNeu khai trong Rust, lấy từ `list_preset_voices()` của SDK
**một lần lúc phát triển** rồi commit, kèm ghi chú phiên bản SDK đã đọc. Không
gọi Python chỉ để liệt kê giọng: chậm (nạp model) và làm màn hình phụ thuộc vào
việc đã cài xong Python hay chưa.

Giao diện Bước 5:

```
Nhà cung cấp [VieNeu ▾]   Giọng [Hải Đăng ▾]   [Lồng tiếng]
```

Nghe thử từng cue đã có sẵn từ M6, không phải làm gì thêm.

## 8. Thông báo lỗi

Theo đúng quy ước "gọi tên bước còn thiếu" của dự án:

| Tình huống | Thông báo |
|---|---|
| Chưa cài Python/vieneu | "Chưa cài bộ giọng VieNeu — bấm Tải bộ công cụ trước" |
| Python chết khi tổng hợp | `EngineFailed { stage: "tts cue N" }` kèm 100 dòng stderr cuối |
| Đổi giọng nhưng chưa lồng tiếng lại | mục 6 ở trên |
| Giọng không có trong danh sách | "Không có giọng '<tên>' — chọn lại trong danh sách" |

Không thêm biến thể mới vào `PipelineError` (giữ đúng 6).

## 9. Kiểm thử

Hàm thuần, chạy không cần engine:

- dựng dòng JSON cho cầu nối: văn bản nhiều dòng bị gộp, dấu nháy được escape
- gom job theo tốc độ, giữ `index` gốc
- tra giọng theo tên, tên lạ thì báo lỗi rõ
- `preview` từ chối khi tần số lệch, **và không gọi engine** (dùng provider giả
  đếm số lần gọi — cùng khuôn đã dùng ở M6)

Phụ thuộc engine, `#[ignore]` + cổng biến môi trường + tự dọn:

- tổng hợp một câu, WAV ra đúng 48 kHz và dài hơn 0
- **tốc độ thật sự có tác dụng** (mục 5.4)
- hai giọng khác nhau cho ra hai WAV khác nhau (bắt được lỗi "voice bị bỏ qua",
  đúng loại lỗi đã xảy ra với `length_scale` của Piper)

## 10. Ngoài phạm vi

- Nhân bản giọng từ mẫu ghi âm. Model và `speaker_encoder.onnx` sẽ được tải sẵn
  để không phải tải lại sau, nhưng giao diện nhân bản để milestone sau.
- Chạy GPU. Chỉ đường CPU/ONNX.
- Chỉ dẫn sắc thái (`[cười]`) và `style=`. Engine hỗ trợ, nhưng phơi ra giao diện
  là một tính năng riêng.
- Gỡ Piper. Giữ nguyên làm lựa chọn nhẹ và nhanh.

## 11. Rủi ro đã biết

| Rủi ro | Xử lý |
|---|---|
| int8 cần CPU có VNNI, CPU cũ cho ra tiếng méo | Mặc định fp32 (chậm hơn, an toàn). Chỉ dùng int8 nếu đo được trên máy thật. |
| Cài pip lúc chạy có thể hỏng giữa chừng | `--require-hashes`, cài vào thư mục tạm rồi đổi tên — cùng khuôn tmp+rename đã dùng ở M6 |
| Dung lượng tải lớn, người dùng bỏ giữa chừng | Tiến độ theo từng thành phần đã có sẵn; Piper vẫn dùng được trong lúc chưa tải xong |
| SDK đổi API giữa các bản | Pin đúng một phiên bản `vieneu` trong requirements, ghi số bản vào comment của cầu nối |
