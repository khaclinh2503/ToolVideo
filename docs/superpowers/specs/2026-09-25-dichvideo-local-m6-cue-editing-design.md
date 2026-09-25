# M6 — Sửa từng cue + nghe thử (DichVideo-Local)

Ngày: 2026-09-25
Trạng thái: thiết kế đã được duyệt, chờ viết plan
Tiền đề: M5 đã xong (mô hình dự án + mở lại), `cargo test` 202 passed / 8 ignored / 0 warning.

## 1. Mục tiêu

Hôm nay một câu dịch sai hay một cue lệch nhịp buộc người dùng chạy lại cả một
giai đoạn. M6 cho sửa đúng câu đó, nghe thử riêng nó, rồi xuất — phần còn lại
của bản lồng tiếng không bị đụng tới.

Tiêu chí nghiệm thu: mở một dự án đã lồng tiếng, sửa text của một cue, bấm Nghe
thử và nghe đúng câu mới, rồi bấm Xuất video mà không phải chạy lại Lồng tiếng
cho cả dự án.

## 2. Phần lớn máy móc đã có sẵn

`tts::cache_key` băm cả text của cue, nên sửa một câu tự động chỉ vô hiệu hoá
cache của đúng câu đó; `run_tts_stage` từ M3 đã dùng lại mọi cue không đổi. M6
không phải dựng cơ chế "chỉ làm lại phần đã đổi" — nó đã chạy từ hai milestone
trước.

Thứ M6 phải thêm là: đọc danh sách cue ra để hiển thị, ghi một cue đã sửa trở
lại, và tổng hợp lại đúng một cue.

## 3. Nguồn sự thật vẫn là file SRT

Sửa một cue là ghi lại `subtitles/translated.<tgt>.srt`, qua tmp + rename.

Đường thay thế là một lớp `cues.json` đè lên SRT. Đó đúng là cái bẫy hai nguồn
sự thật đã bị từ chối ở M5 §2 và §3: cả pipeline — `run_tts_stage`,
`run_retime_stage`, `prepare_burn_srt`, nhánh phụ đề mềm khi xuất — đều đọc file
SRT, nên một lớp đè sẽ phải được hoà giải ở năm chỗ, và chỗ nào quên là chỗ đó
âm thầm dùng bản cũ.

`srt::parse_srt` nối các dòng trong một cue bằng `\n` và `srt::write_srt` ghi
lại nguyên văn, nên text nhiều dòng đi vòng qua được. Ô nhập phải là `textarea`
chứ không phải `input`, nếu không người dùng không sửa nổi cue nhiều dòng.

## 4. Nghe thử chính là sinh lại

Bấm Nghe thử trên một cue vừa sửa thì nó **tổng hợp lại cue đó, ghi đè wav thật
ở `tts/segments/cue-NNNN.wav`, cập nhật entry tương ứng trong manifest**, rồi
phát. Không có bản render tạm nào bị vứt đi.

Hệ quả quan trọng: manifest và SRT khớp lại ngay sau khi nghe thử, nên **guard
chống lệch phụ đề của M4 giữ nguyên ý nghĩa ban đầu** và không phải sửa. Nó vẫn
chỉ báo động khi SRT bị đổi sau lưng manifest — chỉ là bây giờ "sau lưng" nghĩa
là sửa rồi không nghe thử.

Người dùng sửa mà bỏ qua nghe thử thì lúc xuất, guard báo "Phụ đề đã thay đổi
sau khi lồng tiếng — chạy lại Lồng tiếng trước khi xuất", và nút Lồng tiếng sẵn
có sinh lại đúng những cue đã đổi nhờ cache. Đường dự phòng đã tồn tại và đã
đúng; M6 không thêm gì cho nó.

### Nghe thử phải khớp với thứ sẽ ship

Nếu nghe thử phát ở tốc độ đang lưu trong khi lúc xuất retime ép nhanh lên 0.7,
người dùng nghe một thứ và nhận một thứ khác. Một chức năng nghe thử nói dối thì
gần như không đáng có.

Nên `preview` tính ngân sách thời gian đúng theo quy tắc của `retime` (spec M4
§3): ranh giới là `start_ms` của cue kế tiếp. Quy trình y hệt lượt hai của
`run_retime_stage`, thu nhỏ còn một cue:

1. Tổng hợp ở `base_scale`, đo độ dài thật.
2. `retime::fit_scale` trên ngân sách đó.
3. Tốc độ mới khác tốc độ vừa dùng thì tổng hợp lại lần nữa.

Cue cuối cần độ dài video, lấy qua `ffprobe`. **Video nguồn đã mất thì cue cuối
nghe thử không ràng buộc** — trả về cờ `unconstrained` và giao diện nói rõ, chứ
không lặng lẽ phát một tốc độ có thể khác lúc xuất.

### Vì sao không gọi thẳng `run_retime_stage`

Nó sẽ gọn hơn nhiều, nhưng không chạy được: guard ở `pipeline.rs` so manifest
với SRT **trước** khi làm gì cả, và sau một lần sửa thì hai bên lệch nhau đúng
theo thiết kế. Gọi nó sẽ nhận về chính thông báo lỗi mà M6 sinh ra để tránh.

Đường một-cue cũng đúng về mặt ngữ nghĩa: nghe thử sửa đúng cue được hỏi, không
âm thầm sinh lại cue khác.

### Sửa thời điểm thì cue hàng xóm ra sao

`start_ms` của một cue là ranh giới ngân sách của cue **liền trước**, nên sửa
thời điểm cue 5 có thể làm cue 4 cần tốc độ khác. Nghe thử cue 5 không sửa cue
4 — và không cần: sau khi cue 5 hết lệch, guard cho qua, và `run_retime_stage`
lúc xuất tính lại toàn bộ rồi sinh lại những cue cần đổi.

Ngược lại, tốc độ của cue 5 ổn định qua hai lượt: ngân sách của nó chỉ phụ thuộc
`start_ms` của chính nó và của cue 6, không phụ thuộc cue 4 dài bao nhiêu. Nên
nghe thử xong, lúc xuất cue 5 không bị tổng hợp lại lần nữa.

## 5. Giao diện lập trình

Module mới `src-tauri/src/cues.rs`.

```rust
pub struct CueView {
    /// Số thứ tự trong SRT, đếm từ 1.
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    /// Độ dài giọng đọc đã sinh (ms); 0 khi chưa có.
    pub duration_ms: u64,
    /// Đường dẫn tuyệt đối tới wav; `None` khi chưa sinh.
    pub audio_path: Option<PathBuf>,
    /// Manifest ghi `text` hoặc `start_ms` khác SRT ⇒ giọng đọc đang lệch.
    pub stale: bool,
}

pub fn list(project_dir: &Path, tgt: &str) -> Result<Vec<CueView>, PipelineError>;

/// Ghi một cue trở lại SRT, giữ nguyên mọi cue khác. tmp + rename.
pub fn save(
    project_dir: &Path,
    tgt: &str,
    index: usize,
    text: &str,
    start_ms: u64,
    end_ms: u64,
) -> Result<(), PipelineError>;

pub struct PreviewResult {
    pub audio_path: PathBuf,
    pub duration_ms: u64,
    pub length_scale: f32,
    /// Cue cuối và không lấy được độ dài video ⇒ tổng hợp không ràng buộc.
    pub unconstrained: bool,
}

pub fn preview(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    tgt: &str,
    index: usize,
    video_ms: Option<u64>,
    opts: &FitOpts,
) -> Result<PreviewResult, PipelineError>;
```

`stale` so cả `text` lẫn `start_ms`, đúng những trường mà guard của
`run_retime_stage` so — để dấu hiệu trên màn hình và lỗi lúc xuất không bao giờ
mâu thuẫn nhau.

`list` **không đòi phải có manifest**: dự án mới dịch xong mà chưa lồng tiếng
vẫn phải xem và sửa được. Thiếu manifest, hoặc manifest thiếu entry cho một cue,
thì cue đó có `duration_ms = 0`, `audio_path = None` và `stale = true`. Chỉ
`preview` mới đòi manifest, vì nó phải cập nhật vào đó.

`save` kiểm `start_ms < end_ms` và `index` trong phạm vi; sai thì trả
`PipelineError::Io` với thông báo tiếng Việt và **không ghi gì**. Cho phép chồng
lấn với cue kề: `retime` và `compose` đã có đường xử lý chồng lấn (`saturated`
trong `DubStats`), và cấm chồng lấn sẽ chặn những ca cắt phụ đề hợp lệ.

## 6. Lệnh Tauri

```rust
#[derive(serde::Serialize)] #[serde(rename_all = "camelCase")]
pub struct CueDto {
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    pub duration_ms: u64,
    pub audio_path: Option<String>,
    pub stale: bool,
}

#[derive(serde::Serialize)] #[serde(rename_all = "camelCase")]
pub struct PreviewDto {
    pub audio_path: String,
    pub duration_ms: u64,
    pub length_scale: f32,
    pub unconstrained: bool,
}

#[tauri::command] pub fn list_cues(project_dir: String, tgt: String) -> Result<Vec<CueDto>, String>;
#[tauri::command] pub fn save_cue(project_dir: String, tgt: String, index: usize, text: String, start_ms: u64, end_ms: u64) -> Result<(), String>;
#[tauri::command] pub async fn preview_cue(project_dir: String, tgt: String, index: usize) -> Result<PreviewDto, String>;
```

`list_cues` và `save_cue` đồng bộ — chúng đọc/ghi một file text nhỏ. `preview_cue`
chạy Piper nên phải `async` + `spawn_blocking`, theo khuôn `run_tts` sẵn có.

`preview_cue` tự lấy provider từ config, lấy `video_path` từ `project.json` và
gọi `export::probe_duration_ms`; video mất thì truyền `video_ms = None`.

Nhớ đăng ký cả ba trong `generate_handler![]`.

## 7. Phát tiếng trong webview

Bật asset protocol trong `src-tauri/tauri.conf.json` với scope **giới hạn đúng
thư mục dự án**, rồi `convertFileSrc` đường dẫn wav vào một thẻ `<audio>`.

**Cú pháp và phạm vi của scope phải kiểm bằng cách phát thật một cue, không
được khẳng định suông.** Milestone M4 đã trả giá hai lần cho việc suy đoán hành
vi mặc định của công cụ ngoài (`amix` tự chuẩn hoá, `alimiter` tự nâng mức), và
M5 phát hiện script thăm dò của chính plan không kiểm được thứ nó tưởng. Plan
phải có một bước chạy app và phát một cue, ghi lại kết quả; scope không cho qua
thì sửa scope rồi phát lại cho tới khi nghe được.

Một lưu ý cho người viết plan: bật asset protocol là mở cho webview đọc file
trong scope. Scope phải ôm đúng `projects/`, không rộng hơn.

## 8. Giao diện

Khối mới "Sửa phụ đề", đặt dưới khối Dịch và trên khối Lồng tiếng:

```
Sửa phụ đề                                     [Nạp danh sách]
  12  [00:01:23,450] [00:01:26,100]  [ Chào mừng bạn đến với... ]  [Lưu] [Nghe thử]
  13  [00:01:26,800] [00:01:29,200]  [ Hôm nay chúng ta sẽ...   ]  ⚠ chưa nghe lại  [Lưu] [Nghe thử]
```

- Nạp bằng `list_cues`; nạp lại sau mỗi lần `save_cue` hoặc `preview_cue` thành
  công, để `stale` và `durationMs` trên màn hình luôn là số thật.
- Ô text là `textarea` (§3).
- Thời điểm hiển thị và nhập ở dạng `HH:MM:SS,mmm` — cùng định dạng SRT mà người
  dùng đã quen; chuyển đổi hai chiều ở phía TypeScript.
- `stale` hiện dấu "⚠ chưa nghe lại" trên dòng đó.
- Nghe thử phát qua một thẻ `<audio>` dùng chung, `src` đặt theo cue vừa bấm.
  `unconstrained` thì kèm chú thích rằng tốc độ có thể khác lúc xuất vì không
  tìm thấy video nguồn.
- Cả hai nút khoá theo `running` như mọi handler khác trong file.

Giữ đúng lối trình bày hiện có: `<h2>` + `<div className="row">`, không thêm thư
viện, không đổi CSS.

## 9. Lỗi

Không thêm biến thể `PipelineError` nào.

| Tình huống | Xử lý |
|---|---|
| Chưa có `translated.<tgt>.srt` | `Io("Chưa có bản dịch — chạy Dịch trước (…)")` |
| `index` ngoài phạm vi | `Io("Không có cue số N (bản dịch có M cue)")` |
| `start_ms >= end_ms` | `Io("Thời điểm bắt đầu phải nhỏ hơn thời điểm kết thúc")`, không ghi gì |
| Chưa có manifest lúc nghe thử | `Io("Chưa có giọng đọc — chạy Lồng tiếng trước")` |
| Piper lỗi | `EngineFailed` sẵn có từ provider |
| Video nguồn mất | Không phải lỗi: `unconstrained = true` |

## 10. Test

**Đơn vị (`cues::list`)** — ghép SRT với manifest: `duration_ms` và `audio_path`
lấy đúng entry; cue chưa sinh giọng có `audio_path = None`; `stale` bật khi text
lệch, bật khi `start_ms` lệch, tắt khi cả hai khớp; SRT dài hơn manifest thì cue
thừa là `stale`.

**Đơn vị (`cues::save`)** — sửa cue giữa danh sách chỉ đổi đúng cue đó, các cue
khác giữ nguyên từng ký tự; text nhiều dòng đi vòng qua được; `start >= end` bị
từ chối **và file không đổi**; `index` ngoài phạm vi bị từ chối và file không
đổi; không sót file `.tmp`.

**Đơn vị (`cues::preview`)** với provider giả có độ dài phụ thuộc `length_scale`
(khuôn `ScaledTts` của M4) — cue tràn ngân sách thì tốc độ trả về đúng tỉ lệ
`retime` tính; cue vừa khung thì chỉ tổng hợp một lần; **sau khi nghe thử,
manifest khớp SRT ở cue đó** (đây là test đắt giá nhất: nó ghim chính lời hứa ở
§4); cue cuối với `video_ms = None` trả `unconstrained = true`.

**E2E (`#[ignore]`, cổng `DVL_E2E_CLIP`)** — trên dự án thật: sửa text một cue,
nghe thử, khẳng định wav của cue đó đổi nội dung và các wav khác không đổi
(so sha256 trước/sau), rồi xuất thành công không cần chạy lại Lồng tiếng.

**Thủ công, không tự động hoá được** — bấm Nghe thử trong app và thật sự nghe
thấy câu mới. Không test nào che được việc asset protocol có phát được hay không.

Mọi test dùng `tempfile::tempdir()`, không đụng `%APPDATA%` thật.

## 11. Ngoài phạm vi M6

- `revision`/authority/sổ artifact — vẫn chưa có undo/redo và vẫn không có sửa
  đồng thời; lý do hoãn ở M5 §3 chưa đổi.
- Thêm cue, xoá cue, gộp hai cue, tách một cue.
- Sửa `length_scale` bằng tay cho từng cue — `retime` tự tính và đã có test ghim
  tính hội tụ.
- Sửa phụ đề nguồn (`source.srt`); M6 chỉ sửa bản dịch.
- Hoàn tác từng bước.
- Nghe thử một đoạn video (chỉ nghe tiếng, không dựng hình).
