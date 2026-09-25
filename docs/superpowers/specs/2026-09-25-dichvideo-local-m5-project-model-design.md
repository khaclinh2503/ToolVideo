# M5 — Mô hình dự án + mở lại (DichVideo-Local)

Ngày: 2026-09-25
Trạng thái: thiết kế đã được duyệt, chờ viết plan
Tiền đề: M4 đã xong (retime + compose + export), `cargo test` 174 passed / 7 ignored / 0 warning.

## 1. Mục tiêu

Hiện tại đóng app là mất dự án. Đường dẫn video nguồn chỉ tồn tại trong một biến
React; thư mục dự án mang tên UUID và không ghi lại nó thuộc về video nào. Hệ quả
đã thấy bằng chứng cụ thể: lỗi Critical của M4 — sau khi STT thành công với video
A rồi STT hỏng với video B, ứng dụng ghép giọng của A lên hình của B và báo thành
công. Bản vá M4 giữ bất biến đó trong bộ nhớ trình duyệt, và bộ nhớ thì mất khi
đóng app.

M5 làm ba việc:

1. Ghi `project.json` cho mỗi dự án, chứa đúng những gì không suy ra được từ đĩa.
2. Liệt kê và mở lại dự án cũ.
3. Xoá dự án không còn cần, vì mỗi dự án để lại `tts/dub.wav` cỡ 159 MB mỗi giờ
   video và hiện không có cách nào thu hồi ngoài việc vào `%APPDATA%` xoá tay.

Tiêu chí nghiệm thu: mở app, chọn một dự án cũ trong danh sách, bấm Xuất video và
ra đúng file của dự án đó — không phải chạy lại STT.

## 2. Vì sao quét thư mục chứ không dùng file chỉ mục

Đường thay thế là một `projects/index.json` liệt kê mọi dự án, cho tốc độ liệt kê
không phụ thuộc số dự án.

Nhưng chỉ mục là **nguồn sự thật thứ hai phải đồng bộ với nguồn thứ nhất**, và chế
độ hỏng kinh điển của nó là trôi khỏi thực tế: thư mục người dùng đã xoá tay vẫn
nằm trong danh sách, hoặc dự án có thật lại không hiện ra. Mỗi lần ghi phải sửa hai
chỗ, và mỗi lần ghi hỏng giữa chừng để lại hai chỗ mâu thuẫn.

Quét `projects/*/project.json` chỉ có một nguồn sự thật. Ở quy mô thật của ứng dụng
này — vài chục dự án trên một máy để bàn — đọc vài chục file JSON nhỏ là chi phí
không đáng kể, và đổi lại là không bao giờ phải viết code hoà giải hai nguồn.

Đây cũng là nguyên tắc đã dùng để phán quyết một finding của M4: trạng thái trên
đĩa là sự thật, không nhân bản nó vào nơi khác.

## 3. `project.json`

Đặt tại `<project_dir>/project.json`.

```rust
// src-tauri/src/project.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ProjectMeta {
    pub version: u32,        // 1
    /// Đường dẫn tuyệt đối tới video nguồn.
    pub video_path: String,
    /// Mã ngôn ngữ truyền cho `--sense-voice-language`.
    pub src_lang: String,
    pub tgt_lang: String,
    /// Epoch mili-giây. Dùng u64 thay vì chuỗi ISO để không phải thêm dependency
    /// ngày tháng; phía UI đã có `new Date(ms)`.
    pub created_at: u64,
    pub updated_at: u64,
}
```

### Cái gì KHÔNG nằm trong file này

Không ghi trạng thái giai đoạn (đã STT chưa, đã dịch chưa…). Đó là thứ **suy ra
được** từ những file đang nằm trên đĩa, và lưu thêm một bản sao nghĩa là tạo ra
hai nguồn sự thật có thể lệch nhau — người dùng xoá tay `tts/` thì bản sao sẽ nói
dối. Xem §4.

Không ghi `revision`, không ghi hệ "authority" từng mặt, không ghi sổ artifact có
hash — dù mô hình của ứng dụng gốc (`_recovery/KIEN_TRUC_TAI_DUNG.md` §3) có cả
ba. Lý do tài liệu đó đưa ra cho việc giữ authority + revision là "để tránh hỏng
dữ liệu khi undo/redo"; M5 không có undo/redo và không có đường nào để hai tiến
trình sửa cùng một dự án. Thêm chúng lúc chức năng sửa từng cue tới, khi tranh
chấp mới trở thành có thật.

### Giao diện

```rust
pub fn meta_path(project_dir: &Path) -> PathBuf;

/// `None` khi thiếu file hoặc JSON hỏng — không phải lỗi. Cùng quy ước với
/// `tts::manifest::load`: một dự án không đọc được chỉ đơn giản là không hiện
/// trong danh sách, chứ không làm hỏng cả lần liệt kê.
pub fn load(project_dir: &Path) -> Option<ProjectMeta>;

/// Ghi qua tmp + rename để không bao giờ để lại file dở.
pub fn save(project_dir: &Path, m: &ProjectMeta) -> Result<(), PipelineError>;

/// Đọc, sửa, đặt `updated_at = now_ms`, ghi lại.
/// **Không có meta ⇒ không làm gì và trả `Ok(())`.** Một giai đoạn xử lý không
/// được phép thất bại chỉ vì không cập nhật nổi một dấu thời gian.
pub fn update(
    project_dir: &Path,
    now_ms: u64,
    f: impl FnOnce(&mut ProjectMeta),
) -> Result<(), PipelineError>;

/// Tách riêng để test ghim được thời gian.
pub fn now_ms() -> u64;
```

## 4. Trạng thái giai đoạn suy từ đĩa

```rust
#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct ProjectStatus {
    pub has_stt: bool,          // subtitles/source.srt
    pub has_translation: bool,  // subtitles/translated.<tgt_lang>.srt
    pub has_tts: bool,          // tts/manifest.json
    pub has_export: bool,       // output/final.mp4
    /// Video nguồn còn ở chỗ cũ không. Ổ cắm ngoài bị rút, file bị chuyển — đây
    /// là hỏng hóc dễ gặp nhất sau khi dùng công cụ một thời gian, và danh sách
    /// phải nói ra thay vì để người dùng bấm Xuất rồi mới thấy lỗi.
    pub video_exists: bool,
}

pub fn status(project_dir: &Path, m: &ProjectMeta) -> ProjectStatus;
```

`has_translation` phụ thuộc `tgt_lang` trong meta: đổi ngôn ngữ đích thì bản dịch
cũ không còn tính là bản dịch của dự án nữa, đúng như `run_tts_stage` vốn đã tìm
`translated.<tgt>.srt` theo `tgt` được truyền vào.

## 5. Liệt kê và xoá

```rust
#[derive(Clone, Debug)]
pub struct ProjectSummary {
    pub project_dir: PathBuf,
    pub meta: ProjectMeta,
    pub status: ProjectStatus,
}

/// Quét `projects_root`, bỏ qua mọi thư mục con không có `project.json` đọc được.
/// Sắp xếp `updated_at` giảm dần. Nhận root làm tham số để test dùng tempdir.
pub fn list(projects_root: &Path) -> Vec<ProjectSummary>;
```

Việc bỏ qua thư mục không có meta cũng chính là cách **rác E2E tự động không lọt
vào danh sách**: các thư mục `e2e-*` do test sinh ra chưa bao giờ có `project.json`.
Không cần danh sách loại trừ theo tên.

### Xoá — thao tác không hoàn tác được

```rust
/// Xoá cả thư mục dự án. Từ chối mọi đường dẫn không phải con trực tiếp của
/// `projects_root`.
pub fn delete(projects_root: &Path, project_dir: &Path) -> Result<(), PipelineError>;
```

Ràng buộc an toàn, kiểm **sau khi** `canonicalize` cả hai phía (để `..` và symlink
không lách qua được):

- `project_dir` phải tồn tại và là thư mục;
- cha trực tiếp của `project_dir` phải đúng bằng `projects_root`;
- `project_dir` không được bằng chính `projects_root`.

Vi phạm bất kỳ điều nào ⇒ `PipelineError::Io` với thông báo tiếng Việt, và **không
xoá gì cả**. Đây là hàm duy nhất trong toàn bộ ứng dụng gọi `remove_dir_all` trên
dữ liệu người dùng; ràng buộc phải được ghim bằng test chứ không bằng lời hứa.

UI phải hỏi xác nhận trước khi gọi (§9).

## 6. Ghi `project.json` ở đâu trong pipeline

Viết ở tầng **lệnh** (`commands.rs`), không viết trong `pipeline.rs`. Các hàm
`run_*_stage` là tầng engine, chỉ biết về file và tiến trình con; cho chúng biết
về siêu dữ liệu dự án sẽ trộn hai tầng vốn đang tách sạch.

| Lệnh | Làm gì với meta |
|---|---|
| `run_stt` | Tạo mới: `video_path`, `src_lang` (tham số `lang`), `tgt_lang` (lấy `cfg.translate.target_lang`), `created_at = updated_at = now`. Ghi **sau khi** STT thành công. |
| `run_translate` | `update`: đặt `tgt_lang` theo tham số, chạm `updated_at`. |
| `run_tts` | `update`: chỉ chạm `updated_at`. |
| `run_export` | `update`: chỉ chạm `updated_at`. |

Dự án tạo từ M1–M4 không có `project.json` nên sẽ không hiện trong danh sách.
**Không viết code migration** — chúng là sản phẩm phụ của test, không phải công
việc thật của người dùng.

## 7. Ngôn ngữ nguồn cho chọn

`src/App.tsx` đang gán cứng `lang: "zh"`, nghĩa là ứng dụng chỉ chạy được video
tiếng Trung. M5 phải lưu `src_lang` dù sao, nên đây là lúc rẻ nhất để bỏ giá trị
gán cứng đó.

**Tập giá trị hợp lệ phải kiểm bằng cách chạy thật, không được đoán.**
`--sense-voice-language` là cờ của sherpa-onnx và tài liệu rải rác; M4 đã có một
lần trả giá cho việc suy đoán hành vi mặc định của một công cụ ngoài
(`alimiter` có `level` bật sẵn). Plan phải có một bước chạy engine thật với từng
giá trị ứng viên trên một clip ngắn và ghi lại kết quả:

- ứng viên: `auto`, `zh`, `en`, `ja`, `ko`, `yue`;
- giá trị nào engine từ chối thì **không** đưa vào ô chọn;
- nếu `auto` bị từ chối, thử chuỗi rỗng `--sense-voice-language=` và ghi lại kết quả.

Ô chọn chỉ liệt kê những giá trị đã quan sát thấy chạy được. Mặc định là giá trị
nhận dạng tự động nếu nó hợp lệ, ngược lại là `zh` để giữ nguyên hành vi hiện tại.

## 8. Lệnh Tauri

```rust
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummaryDto {
    pub project_dir: String,
    pub video_path: String,
    /// Tên file, để hiển thị — đường dẫn đầy đủ quá dài cho một dòng danh sách.
    pub video_name: String,
    pub src_lang: String,
    pub tgt_lang: String,
    pub updated_at: u64,
    pub has_stt: bool,
    pub has_translation: bool,
    pub has_tts: bool,
    pub has_export: bool,
    pub video_exists: bool,
}

#[tauri::command] pub fn list_projects() -> Result<Vec<ProjectSummaryDto>, String>;
#[tauri::command] pub fn open_project(project_dir: String) -> Result<ProjectSummaryDto, String>;
#[tauri::command] pub fn delete_project(project_dir: String) -> Result<(), String>;
```

`open_project` trả về đúng kiểu DTO của danh sách — không cần kiểu "chi tiết"
riêng, vì phần UI cần nạp lại đã nằm đủ trong đó.

Cả ba đều đồng bộ (không `async`): chúng chỉ đọc vài file JSON nhỏ hoặc xoá một
thư mục, không gọi engine nào. `get_config`/`save_config` sẵn có cũng đồng bộ.

Nhớ đăng ký cả ba trong `generate_handler![]`.

## 9. Giao diện

Thêm một khối lên **đầu** màn hình hiện có, trên khối "Chọn video":

```
Dự án gần đây
  clip.mp4 · 25/09/2026 11:39 · [STT] [Dịch] [Lồng tiếng] [Xuất]    [Mở] [Xoá]
  phim2.mkv · 24/09/2026 20:02 · [STT] [Dịch]          ⚠ mất video  [Mở] [Xoá]
```

- Nạp danh sách bằng `list_projects` khi mở app, và nạp lại sau mỗi lần STT
  thành công hoặc xoá.
- **Mở**: gọi `open_project`, rồi đặt `projectDir`, `videoPath`, `tgt`, `srcLang`
  từ kết quả. Các khối giai đoạn bên dưới tự bật theo như hiện nay.
- **Xoá**: hỏi xác nhận bằng `confirm` của `@tauri-apps/plugin-dialog` (plugin đã
  là dependency sẵn, đang dùng cho hộp chọn file). Không dùng `window.confirm`.
  Câu hỏi phải nêu tên video và nói rõ là xoá vĩnh viễn.
- `video_exists == false`: hiện cảnh báo trên dòng đó và **vẫn cho Mở** — người
  dùng có thể muốn xem lại phụ đề đã dịch. Nút Xuất video sẽ tự báo lỗi tiếng Việt
  sẵn có ("Không tìm thấy video gốc — chọn lại video rồi xuất").
- Ô chọn ngôn ngữ nguồn đặt cạnh nút chọn video, giá trị theo §7.

Giữ đúng lối trình bày hiện tại: `<h2>` + `<div className="row">`, không thêm thư
viện, không đổi CSS.

## 10. Lỗi

Không thêm biến thể `PipelineError` nào.

| Tình huống | Xử lý |
|---|---|
| `project.json` thiếu hoặc hỏng | `load` trả `None`; dự án không hiện trong danh sách. Không phải lỗi. |
| `open_project` trên thư mục không có meta | `Io("Không đọc được dự án ({}) — thiếu hoặc hỏng project.json")` |
| `delete_project` với đường dẫn ngoài `projects_root` | `Io("Đường dẫn không nằm trong thư mục dự án — từ chối xoá ({})")`, không xoá gì |
| Không tạo được `projects_root` | `Io` từ `create_dir_all` |
| `update` khi không có meta | `Ok(())`, không làm gì — xem §3 |

## 11. Test

**Đơn vị (`project.rs`)** — `load`/`save` khứ hồi; thiếu file ⇒ `None`; JSON hỏng
⇒ `None`; `save` ghi qua tmp rồi rename (kiểm không còn file `.tmp` sót lại);
`update` bump `updated_at` và giữ nguyên `created_at`; `update` trên thư mục không
có meta trả `Ok(())` và không tạo file.

**Đơn vị (`status`)** — dựng thư mục tạm với các tổ hợp file khác nhau và khẳng
định từng cờ; `has_translation` theo đúng `tgt_lang` (có `translated.vi.srt` nhưng
meta ghi `tgt_lang = "en"` ⇒ `false`); `video_exists` cho cả hai trường hợp.

**Đơn vị (`list`)** — root tạm chứa ba dự án hợp lệ, một thư mục không có
`project.json`, và một thư mục có `project.json` hỏng ⇒ đúng ba mục, sắp xếp
`updated_at` giảm dần.

**Đơn vị (`delete`)** — xoá được dự án thật; **từ chối** `projects_root` chính nó;
**từ chối** thư mục nằm ngoài root; **từ chối** đường dẫn dùng `..` để trỏ ra
ngoài rồi vòng lại. Mỗi ca từ chối phải khẳng định thư mục đích **vẫn còn tồn tại**
sau lời gọi — một test chỉ kiểm `is_err()` sẽ xanh cả khi hàm đã xoá rồi mới báo lỗi.

**Đơn vị (`commands`)** — `ProjectSummaryDto` serialize ra camelCase, kiểm bằng
cặp đa từ `project_dir`/`projectDir` (trường một từ không phân biệt được
`rename_all` — bài học từ M4).

**Thủ công, không tự động hoá được** — mở app, tạo một dự án, đóng app, mở lại,
bấm Mở, xác nhận Xuất video chạy mà không phải làm lại STT. Không có test nào che
đường này vì nó cần vòng đời tiến trình thật.

Mọi test dùng `tempfile::tempdir()`, không đụng `%APPDATA%` thật.

## 12. Ngoài phạm vi M5

- `revision`/authority/sổ artifact (xem §3).
- Sửa từng cue bằng tay, nghe thử từng cue, import SRT.
- Đổi tên dự án, đổi thư mục gốc chứa dự án.
- Undo/redo.
- Dọn tự động dự án cũ theo tuổi hoặc theo dung lượng.
- Migration cho dự án tạo trước M5.
- Phần trăm tiến độ khi encode (vẫn là món hoãn từ M4).

## 13. Chia phase

Một plan duy nhất, không chia phase: `project.rs` là một module thuần tự chứa, và
phần lệnh + UI bám ngay sau nó. Khối lượng nhỏ hơn hẳn M4 phase A.

Nhưng **bước kiểm `--sense-voice-language` ở §7 phải nằm ở task riêng và chạy
trước task UI**, vì kết quả của nó quyết định nội dung ô chọn. Nếu engine từ chối
cả `auto` lẫn chuỗi rỗng thì đó là một trong những lý do được phép dừng lại hỏi
người dùng, chứ không tự chọn thay.
