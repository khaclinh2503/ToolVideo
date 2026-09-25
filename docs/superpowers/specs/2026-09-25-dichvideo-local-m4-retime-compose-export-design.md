# M4 — Retime + Compose + Export (DichVideo-Local)

Ngày: 2026-09-25
Trạng thái: thiết kế đã được duyệt, chờ viết plan
Tiền đề: M3 đã xong (ComponentManager + TTS Piper), `cargo test` 107 pass / 5 ignored.

## 1. Mục tiêu

Biến các file WAV rời của M3 thành **một video hoàn chỉnh có lồng tiếng**:

1. **Retime** — ép giọng dịch của mỗi cue vừa khung thời gian phụ đề, bằng cách
   sinh lại cue đó với `length_scale` riêng (đọc nhanh hơn), không kéo giãn hậu kỳ.
2. **Compose** — ghép các cue thành một dải audio liền mạch `tts/dub.wav`.
3. **Export** — trộn tiếng gốc với tiếng dịch, mux vào video, kèm tuỳ chọn ghi
   phụ đề chết vào khung hình.

Tiêu chí nghiệm thu: chạy thật trên một clip, ra file `.mp4` mở được, nghe thấy
tiếng Việt đúng chỗ, tiếng gốc còn nghe được ở nền, đỉnh âm không vượt 0 dBFS.

## 2. Vì sao retime bằng `length_scale` chứ không phải `atempo`

Piper nhận `length_scale` cho từng câu: nhân độ dài mỗi phoneme. Giảm
`length_scale` là **tổng hợp lại giọng với nhịp nhanh hơn** — cao độ giữ nguyên,
formant giữ nguyên, nghe như người nói nhanh.

`atempo` của ffmpeg kéo giãn tín hiệu đã sinh bằng phase vocoder; ở tỉ lệ dưới
0.8 nó để lại tiếng rè kim loại đặc trưng, nghe rõ trên phụ âm tiếng Việt.

`cache_key` của M3 đã băm cả `length_scale`, nên pass 2 chỉ sinh lại đúng những
cue đổi tốc độ. Cue vừa khung ngay từ đầu không tốn thêm một giây nào.

### Luồng hai lượt

```
lượt 1: run_tts_stage(ScalePlan::uniform(1.0))  -> manifest có duration_ms thật
        |
        v
      fit_scales(start, boundary, duration, scale) -> Vec<f32> mỗi cue
        |
        v
lượt 2: run_tts_stage(ScalePlan::per_cue(...))   -> chỉ cue tràn được sinh lại
```

## 3. Quy tắc khớp thời gian

Ranh giới thật của một cue **không phải `end_ms` của nó** mà là `start_ms` của
cue kế tiếp. Phụ đề thường để `end_ms` sớm hơn nhiều so với lúc người kế tiếp
mở miệng; ép giọng vào `end_ms` sẽ bắt đọc nhanh vô cớ trong khi phía sau là
khoảng lặng bỏ không.

```
cue i:      [start_i ........ end_i]        (khoảng lặng)        [start_{i+1}
giọng dịch: |<---------- được phép dùng tới đây --------->|guard|
```

- `boundary_i = start_{i+1}` với mọi cue trừ cue cuối; cue cuối lấy
  `boundary = video_ms` (độ dài video theo `ffprobe`).
- `budget_i = boundary_i - start_i - GUARD_MS`, `GUARD_MS = 80` để hai câu
  không dính vào nhau.
- `duration_i <= budget_i` → giữ nguyên `length_scale`. **Không kéo chậm** cue
  ngắn cho đầy khe: giọng đọc chậm bất thường khó chịu hơn là im lặng.
- `duration_i > budget_i` → `scale_mới = scale_cũ × budget_i / duration_i`.
- Chặn dưới `MIN_LENGTH_SCALE = 0.6` (nhanh tối đa ~1.67×). Chạm trần thì cue
  vẫn tràn; phần tràn sẽ chồng lên cue sau (xem §5) và được đếm vào thống kê.
- `budget_i <= 0` (hai cue sát nhau) → trả thẳng `MIN_LENGTH_SCALE`.
- `duration_i == 0` (cue rỗng, chưa đo) → giữ nguyên `scale_cũ`.
- **Làm tròn 2 chữ số thập phân.** `cache_key` băm `length_scale` theo byte, nên
  nhiễu float ở chữ số thứ 7 sẽ làm hỏng cache và bắt sinh lại toàn bộ ở mỗi
  lần chạy. Lượng tử hoá là bắt buộc, không phải trang trí.

### Giao diện

```rust
// src-tauri/src/retime.rs
pub struct FitOpts { pub guard_ms: u64, pub min_scale: f32 }   // 80, 0.6
impl Default for FitOpts { ... }

pub struct Cue {
    pub start_ms: u64,
    pub boundary_ms: u64,
    pub duration_ms: u64,   // độ dài WAV đã đo được
    pub scale: f32,         // length_scale đã dùng khi sinh ra duration_ms
}

pub fn boundaries(starts: &[u64], video_ms: u64) -> Vec<u64>;
pub fn fit_scale(c: &Cue, o: &FitOpts) -> f32;
pub fn fit_scales(cues: &[Cue], o: &FitOpts) -> Vec<f32>;
```

Thuần số học, không chạm đĩa, không gọi tiến trình con — test được bằng bảng giá trị.

## 4. Mở rộng `run_tts_stage`: `length_scale` theo từng cue

`run_tts_stage` hiện nhận **một** `length_scale: f32` cho cả lượt. Đây là thay
đổi giao diện của hàm đã merge ở M3, không phải code mới — final review của
phase B đã ghi trước điểm này.

```rust
// src-tauri/src/tts/mod.rs
pub struct ScalePlan { base: f32, per_cue: Vec<f32> }

impl ScalePlan {
    pub fn uniform(base: f32) -> Self;
    pub fn per_cue(base: f32, v: Vec<f32>) -> Self;
    /// `index` đếm từ 1 như manifest. Ngoài phạm vi -> `base`.
    pub fn get(&self, index: usize) -> f32;
}
```

```rust
pub fn run_tts_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    scales: &ScalePlan,      // was: length_scale: f32
    tgt: &str,
) -> Result<TtsResult, PipelineError>;
```

Bên trong, mọi chỗ đang dùng `length_scale` đổi sang `scales.get(index)`, kể cả
nhánh cue rỗng. `commands::run_tts` truyền `ScalePlan::uniform(cfg.tts.length_scale)`
— hành vi của nút "Lồng tiếng" không đổi.

Hàm mới trong `pipeline.rs`:

```rust
pub struct RetimeResult {
    pub adjusted: usize,      // số cue đổi length_scale
    pub capped: usize,        // số cue chạm MIN_LENGTH_SCALE mà vẫn tràn
    pub tts: TtsResult,       // kết quả lượt 2
}

pub fn run_retime_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    video_ms: u64,
    opts: &FitOpts,
    tgt: &str,
) -> Result<RetimeResult, PipelineError>;
```

Đọc `tts/manifest.json` của lượt 1, tính scale, gọi lại `run_tts_stage`. Không
có manifest → lỗi Io với thông báo "Chưa có giọng đọc — chạy Lồng tiếng trước".

## 5. Ghép dải tiếng dịch trong Rust, không qua `filter_complex`

Đường thay thế là dựng một filtergraph `adelay`+`amix` cho từng cue. Với video
10 phút (~200 cue) đó là ~200 input và một chuỗi filter dài hàng chục nghìn ký
tự — vượt giới hạn 32767 ký tự của `CreateProcess` trên Windows, và khi hỏng thì
ffmpeg chỉ báo một dòng lỗi cú pháp không chỉ ra cue nào.

Ghép trong Rust là số học thuần: cấp một bộ đệm im lặng dài bằng video rồi cộng
mẫu của từng cue vào đúng offset. Test được bằng WAV tự dựng, và ffmpeg chỉ còn
đúng một lần gọi duy nhất ở §6.

### Mở rộng `wav.rs`

`duration_ms` hiện tự duyệt chunk RIFF. Tách phần duyệt ra dùng chung:

```rust
pub struct WavInfo {
    pub sample_rate: u32,
    pub channels: u16,
    pub bits: u16,
    pub data_off: usize,
    pub data_len: usize,
}

pub fn read_info(path: &Path) -> Result<WavInfo, PipelineError>;
pub fn duration_ms(path: &Path) -> Result<u64, PipelineError>;  // giữ nguyên chữ ký
pub fn read_pcm16_mono(path: &Path) -> Result<(u32, Vec<i16>), PipelineError>;
pub fn write_pcm16_mono(path: &Path, rate: u32, samples: &[i16]) -> Result<(), PipelineError>;
```

`read_pcm16_mono` **báo lỗi** nếu `channels != 1` hoặc `bits != 16`, kèm thông
báo tiếng Việt nêu rõ file nào. Không tự downmix, không tự chuyển mẫu: Piper
luôn ra mono 16-bit, nên bất kỳ khác biệt nào cũng là dấu hiệu cache lẫn lộn
giữa hai lần cấu hình — im lặng chuyển đổi là giấu lỗi.

### `compose.rs`

```rust
pub struct DubStats {
    pub placed: usize,
    pub skipped: usize,       // offset nằm ngoài độ dài video
    pub truncated: usize,     // cue bị cắt đuôi ở cuối video
    pub saturated: usize,     // số mẫu bị bão hoà do hai cue chồng nhau
    pub total_ms: u64,
}

pub fn build_dub_track(
    tts_dir: &Path,
    m: &Manifest,
    video_ms: u64,
    out: &Path,
) -> Result<DubStats, PipelineError>;
```

- `rate = m.sample_rate`; độ dài đệm `n = ceil(video_ms × rate / 1000)` mẫu `i16`.
- Mỗi cue có `audio_path`: đọc, **đối chiếu sample rate với `m.sample_rate`**,
  lệch thì trả lỗi chứ không ghép bừa (ghép sai rate cho ra giọng chipmunk mà
  không có dấu hiệu nào khác).
- `offset = start_ms × rate / 1000`; cộng bằng `saturating_add` và đếm số mẫu
  chạm trần. Sau retime hiếm khi chồng, nhưng cue chạm `MIN_LENGTH_SCALE` vẫn
  có thể lấn sang cue sau.
- Bộ nhớ: 2 byte/mẫu. Video 1 giờ ở 22050 Hz ≈ 159 MB. Chấp nhận được trên
  desktop; không đặt trần nhân tạo.

## 6. Trộn và xuất

Một lần gọi ffmpeg duy nhất cho cả trộn, mux và (nếu chọn) burn.

### Âm lượng

Từ ứng dụng gốc: tiếng nền ×0.18, tiếng dịch ×3.0. Cả hai vào `config.json`.

**`amix` mặc định `normalize=1`** — nó chia lại biên độ theo số input và xoá sạch
tỉ lệ vừa đặt. Bắt buộc `normalize=0`.

Hệ số 3.0 trên một giọng Piper vốn đã gần full-scale sẽ cắt đỉnh thô. Chuỗi
filter kết thúc bằng `alimiter=limit=0.98` để chặn. Plan phải kiểm
`ffmpeg -filters` có `alimiter` trước khi dựa vào nó.

### Chuỗi filter

Có tiếng gốc, không burn:
```
[0:a]volume=0.18[bg];[1:a]volume=3.0[vo];
[bg][vo]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0[mx];
[mx]alimiter=limit=0.98[aout]
```

`duration=longest` chứ không phải `first`: dải tiếng dịch (`[1:a]`) được dựng
dài đúng bằng thời lượng container (`video_ms`), trong khi tiếng gốc (`[0:a]`)
có thể ngắn hơn hình — ăn theo `first` sẽ cắt cụt đuôi dải tiếng dịch bất cứ
khi nào luồng tiếng gốc ngắn hơn hình.

Có burn: thêm `[0:v]subtitles=burn.srt[v]` và `-map "[v]"`.

Video **không có luồng audio**: bỏ nhánh `[0:a]`, dùng `[1:a]volume=1.0[mx]`.
Hệ số 3.0 chỉ có nghĩa khi đứng cạnh nền 0.18. Phát hiện bằng `ffprobe` trước.

### Đường dẫn phụ đề: chạy ffmpeg trong thư mục chứa file

Escape đường dẫn cho filter `subtitles` trên Windows là chỗ kinh điển gây lỗi:
dấu hai chấm ổ đĩa kết thúc tham số filter, dấu gạch ngược bị nuốt, còn `[ ] , ;`
trong tên thư mục thì phá luôn filtergraph. Tên người dùng có dấu tiếng Việt
làm mọi thứ tệ hơn.

Cách chắc chắn nhất là **không đưa đường dẫn vào filtergraph**: chép
`translated.<tgt>.srt` sang `subtitles/burn.srt`, đặt `Command::current_dir` là
thư mục `subtitles/`, rồi truyền đúng `subtitles=burn.srt`. Tên ASCII, không ổ
đĩa, không gạch ngược. Đường dẫn video vào/ra vẫn truyền tuyệt đối qua argv
bình thường — chỉ filtergraph mới có vấn đề parser.

Có một test khẳng định chuỗi `-filter_complex` **không chứa ký tự `\` nào** —
đó là cái chặn việc ai đó sau này "sửa cho gọn" bằng cách nhét đường dẫn tuyệt
đối vào lại.

### Tham số mã hoá

- Không burn: `-c:v copy` — video không bị mã hoá lại, xuất trong vài giây.
- Burn: `-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p`.
- Audio luôn `-c:a aac -b:a 192k`; container `-movflags +faststart`.
- Phụ đề mềm (chỉ khi không burn và người dùng chọn): input thứ ba là file srt,
  `-c:s mov_text -metadata:s:s:0 language=vie`.

### Giao diện

```rust
// src-tauri/src/export.rs
pub struct ExportOpts {
    pub burn_subs: bool,
    pub soft_subs: bool,
    pub has_audio: bool,
    pub volume_original: f32,
    pub volume_dub: f32,
    pub crf: u32,
    pub preset: String,
}

pub fn build_filter_complex(o: &ExportOpts) -> String;
pub fn build_export_args(video: &Path, dub: &Path, srt: Option<&Path>, out: &Path, o: &ExportOpts) -> Vec<OsString>;
pub fn run_export(ffmpeg: &Path, work_dir: &Path, args: &[OsString]) -> Result<(), PipelineError>;

pub fn probe_duration_ms(ffprobe: &Path, video: &Path) -> Result<u64, PipelineError>;
pub fn probe_has_audio(ffprobe: &Path, video: &Path) -> Result<bool, PipelineError>;
```

`build_filter_complex` và `build_export_args` là hàm thuần trên chuỗi — bốn tổ
hợp (burn × có tiếng gốc) test được không cần ffmpeg.

`ffprobe.exe` đã nằm trong component `ffmpeg` của M3, không phải tải thêm gì.

## 7. Lỗi

Không thêm biến thể `PipelineError` nào. Dùng lại:

| Tình huống | Lỗi |
|---|---|
| Chưa có `tts/manifest.json` | `Io("Chưa có giọng đọc — chạy Lồng tiếng trước (…)")` |
| Cue WAV lệch sample rate với manifest | `Io("… có tần số 16000 Hz, manifest ghi 22050 Hz …")` |
| Cue WAV không phải mono 16-bit | `Io(…)` |
| `ffprobe` không phân tích được video | `EngineFailed { stage: "ffprobe", … }` |
| ffmpeg xuất lỗi | `EngineFailed { stage: "export", … }` |
| Thiếu `ffmpeg.exe`/`ffprobe.exe` | `EngineMissing` (qua `require_path` sẵn có) |

`ffmpeg::classify_ffmpeg_failure` đang gán cứng `stage: "extract_audio"`. Đổi
thành tham số `stage: &str` và cập nhật chỗ gọi hiện tại — nếu không, lỗi khi
xuất sẽ hiện ra cho người dùng là lỗi bước tách audio.

## 8. Lệnh Tauri và UI

```rust
#[derive(serde::Serialize)] #[serde(rename_all = "camelCase")]
pub struct ExportResultDto {
    pub output_path: String,
    pub adjusted: usize,
    pub capped: usize,
    pub placed: usize,
    pub truncated: usize,
    pub saturated: usize,
}

#[tauri::command]
pub async fn run_export(
    app: tauri::AppHandle,
    project_dir: String,
    video_path: String,
    tgt: String,
    burn_subs: bool,
    soft_subs: bool,
) -> Result<ExportResultDto, String>;
```

Điều kiện trước: dự án đã chạy xong "Lồng tiếng", tức `tts/manifest.json` tồn
tại. `run_export` **không** tự chạy TTS lượt đầu — nó chỉ retime lượt hai. Thiếu
manifest thì báo lỗi ở §7 chứ không âm thầm sinh cả bộ giọng.

Chạy trong `spawn_blocking`, phát sự kiện `export_progress` với
`{ phase: "retime" | "dub" | "encode" | "done" }`. **Không có phần trăm trong
lúc encode** — sẽ cần parse `-progress pipe:1`, để dành M5.

`video_path` truyền từ UI, giống `run_stt`. Dự án hiện không lưu đường dẫn video
gốc ở đâu cả; thêm file metadata là việc của tính năng "mở lại dự án" (M5). Hệ
quả đã biết: đóng app rồi mở lại thì phải chọn lại video. Ghi rõ ở §11.

Đầu ra: `<project_dir>/output/final.mp4`.

UI (`src/App.tsx`): một nút "Xuất video" cạnh nút "Lồng tiếng", kèm hai ô chọn
"Ghi phụ đề vào hình (burn-in)" và "Kèm phụ đề bật/tắt được". Chọn burn thì ô
phụ đề mềm bị vô hiệu hoá — mp4 chứa cả hai chỉ gây rối. Listener
`export_progress` hiển thị tên bước, dọn bằng `un.then(f => f())` như listener
`component_progress` của M3.

## 9. Cấu hình

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComposeConfig {
    pub volume_original: f32,    // 0.18
    pub volume_dub: f32,         // 3.0
    pub guard_ms: u64,           // 80
    pub min_length_scale: f32,   // 0.6
    pub crf: u32,                // 20
    pub preset: String,          // "medium"
}
```

Gắn vào `AppConfig` với `#[serde(default)]` — config.json cũ vẫn đọc được.

## 10. Test

**Đơn vị (`retime`)** — bảng giá trị: vừa khung giữ nguyên; tràn thì scale đúng
tỉ lệ; chạm trần 0.6; budget âm; `duration_ms == 0`; lượng tử hoá 2 chữ số;
`boundaries()` lấy `start` cue kế và `video_ms` cho cue cuối.

**Đơn vị (`wav`)** — `read_pcm16_mono` từ chối stereo và 24-bit; ghi rồi đọc lại
ra đúng mẫu; `read_info` khớp với `duration_ms` trên các fixture sẵn có.

**Đơn vị (`compose`)** — ba WAV tự dựng đặt ở offset đã biết, kiểm giá trị mẫu
đúng tại biên; lệch sample rate ra lỗi; offset quá cuối video → `skipped`; cue
chồng nhau → `saturated` đếm đúng.

**Đơn vị (`export`)** — bốn tổ hợp `build_export_args`; khẳng định có
`normalize=0`; nhánh không burn có `-c:v copy`, nhánh burn có `libx264`;
`subtitles=burn.srt` nguyên văn; `-filter_complex` không chứa ký tự `\`.

**E2E (`#[ignore]`, cổng `DVL_E2E_CLIP`)** — chạy trọn stt → dịch → tts → xuất,
cả hai nhánh burn và không burn. Kiểm bằng `ffprobe`: đúng số luồng, thời lượng
lệch dưới 0.5 s so với nguồn, và `astats` cho `max_volume <= 0 dBFS`.

Mọi test dùng `tempfile`, không đụng `%APPDATA%` thật.

## 11. Ngoài phạm vi M4

- Sửa từng cue bằng tay (đổi text/timing/tốc độ riêng lẻ).
- Tách nhạc nền khỏi lời thoại để ducking thông minh.
- Chuẩn hoá độ ồn theo LUFS.
- Khớp khẩu hình.
- Phần trăm tiến độ trong lúc encode.
- Mở lại dự án sau khi đóng app (đường dẫn video đến từ state của UI).
- Kéo chậm cue ngắn cho đầy khe thời gian.

## 12. Chia phase

**Phase A — retime + dub track.** `ScalePlan` và việc mở rộng `run_tts_stage`;
`retime.rs`; mở rộng `wav.rs`; `compose.rs`; `run_retime_stage`. Toàn bộ là
Rust thuần, test được không cần ffmpeg.

**Phase B — export.** `probe_*`; `build_filter_complex`/`build_export_args`;
`run_export`; đổi chữ ký `classify_ffmpeg_failure`; `ComposeConfig`; lệnh Tauri;
UI; E2E.

Phase A xong là đã có `tts/dub.wav` nghe thử được bằng bất kỳ trình phát nào —
một mốc kiểm chứng thật, không phải chia cho có.
