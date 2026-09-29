# M8 — Kiểu chữ phụ đề, logo đóng dấu, và xem thử ngay trong app

**Ngày:** 2026-09-29
**Trạng thái:** thiết kế, chờ duyệt

## 1. Vì sao làm

Người dùng nói đúng ba câu: *"Tôi chưa thấy màn hình để chỉnh sửa phụ đề, logo…,
cần có cách để preview video nữa."* Ba vấn đề khác nhau:

1. **Kiểu chữ phụ đề đang bị giấu.** Phần Font/Cỡ/Màu chữ/Màu viền/Dày viền đã
   tồn tại từ M7 nhưng nằm trong `{burnSubs && sub && (…)}` — không tick "Ghi phụ
   đề vào hình" thì không ai thấy nó. Người dùng đi hết quy trình mà không biết
   app có chỉnh được kiểu chữ.
2. **Logo chưa từng tồn tại.** Không có `overlay`, `drawtext`, hay `movie=` nào
   trong `src-tauri`. `ExportOpts` không có trường nào cho việc này.
3. **Không xem được kết quả trước khi xuất.** Chỉ có `preview_subtitle` dựng một
   khung hình JPG tĩnh. Muốn biết phụ đề chạy có khớp không, logo đặt có che mặt
   diễn viên không, thì phải xuất cả phim rồi mở bằng trình phát ngoài.

## 2. Hiện trạng cần biết trước khi sửa

Ba chi tiết định hình toàn bộ thiết kế này. Bỏ qua cái nào cũng ra một bản làm
hỏng.

### 2.1 `force_style` không mang được vị trí

`build_force_style()` (`src-tauri/src/export.rs:362-371`) sinh đúng sáu khoá:

```
FontName={font},FontSize={size},PrimaryColour={ass},OutlineColour={ass},Outline={n},BorderStyle=1
```

Không có `Alignment`, `MarginV`, `MarginL/R`, `PlayResX/Y`, `Bold`, `Shadow`.
Spec này **không** thêm chúng — phạm vi là hiện phần đã có ra, không phải mở rộng
kiểu chữ. Ghi lại ở đây để lần sau khỏi tưởng đã có.

### 2.2 Asset protocol không mở video gốc

`lib.rs:41-48` chỉ khai hai thư mục:

```rust
for d in [data.join("projects"), data.join("demo")] {
    scope.allow_directory(&d, true)
}
```

Video gốc nằm ở chỗ người dùng chọn (`E:\phim\x.mp4`), ngoài phạm vi. Gọi
`convertFileSrc(videoPath)` sẽ **bị từ chối im lặng** — thẻ `<video>` ra ô đen,
không lỗi, không log. Đây đúng là lớp lỗi mà chú thích dài ở `lib.rs:25-39` đã
cảnh báo (bug nghe thử cue câm suốt từ M6).

⇒ Trình phát bắt buộc phải kèm `scope.allow_file(video_path)`, nếu không tính
năng này chết im.

### 2.3 Thêm trường vào `SubtitleConfig` có thể xoá sạch cấu hình người dùng

`SubtitleConfig` (`config.rs:64-71`) **không** có `#[serde(default)]` trên từng
trường, còn `parse_config_or_default` (`config.rs:177-182`) nuốt mọi lỗi
deserialize thành `AppConfig::default()`. Nghĩa là một trường thiếu trong
`config.json` cũ không chỉ mất trường đó — nó làm hỏng cả file và người dùng mất
toàn bộ base_url, api_key, giọng đã chọn.

⇒ **Mọi trường mới trong spec này bắt buộc mang `#[serde(default)]`.** Đây là
điều kiện chấp nhận, không phải lời khuyên.

## 3. Phạm vi

Làm:

- Đưa phần kiểu chữ phụ đề ra khỏi chỗ giấu.
- Logo: đóng dấu một file PNG lên video xuất ra (góc, cỡ, độ mờ).
- Trình phát trong app: video gốc + phụ đề vẽ đè + logo đúng chỗ + tiếng lồng.

Không làm (đã cân nhắc và bỏ):

- Vị trí/căn lề phụ đề (mục 2.1).
- Watermark chữ — người dùng chọn "đóng dấu ảnh".
- Xuất thử một đoạn ngắn bằng ffmpeg — người dùng chọn phát thử trong app.
- Remux `.mkv` sang `.mp4` để phát — xem mục 6.3.

## 4. Chia lại tab: 6 → 7

Bước 6 hiện ôm ba việc khác loại: chỉnh kiểu chữ, chọn burn/soft, chọn thư mục và
xuất. Tách đôi:

| Tab | Tên | Nội dung |
|---|---|---|
| 6 | Phụ đề & Logo | Kiểu chữ, logo, trình phát xem thử, nút "Xem thử phụ đề" (khung ffmpeg) |
| 7 | Xuất video | Tick burn-in / phụ đề bật-tắt, thư mục lưu, nút Xuất, kết quả |

`BUOC` trong `src/App.tsx` thêm một mục. Các chỗ `setTab(6)` sau khi lồng tiếng
giữ nguyên số 6 — sau Bước 5 thì đúng là nên vào màn chỉnh phụ đề/logo trước khi
xuất. `open_project` nhảy tới bước còn dở: `hasTts ? 6 : …` cũng giữ nguyên, vì 6
giờ là màn chỉnh, đi tiếp sang 7 là một cú bấm.

### 4.1 Nói thật về chuyện kiểu chữ chỉ ăn khi burn-in

Hiện app im lặng về việc này. Phụ đề bật/tắt được xuất dưới dạng `mov_text`
(`export.rs:207-212`) — **không mang style nào cả**; trình phát của người xem tự
quyết định font. Bỏ chỗ giấu đi mà không nói rõ thì người dùng chỉnh cả buổi rồi
xuất soft-subs và không hiểu vì sao không đổi gì.

⇒ Khối kiểu chữ luôn hiện, kèm một dòng cảnh báo hiện **khi và chỉ khi**
`burnSubs === false`: kiểu chữ này chỉ áp dụng nếu ghi phụ đề vào hình ở Bước 7.

## 5. Logo

### 5.1 Config

Thêm vào `AppConfig` một nhóm cấp 1 `watermark` (`#[serde(default)]` như các nhóm
khác ở `config.rs:29-42`):

```rust
#[derive(Serialize, Deserialize, Clone)]
pub struct WatermarkConfig {
    #[serde(default)] pub enabled: bool,
    #[serde(default)] pub path: String,        // "" = chưa chọn
    #[serde(default)] pub corner: String,      // "tl" | "tr" | "bl" | "br"
    #[serde(default)] pub size_pct: u32,       // % chiều rộng video, mặc định 12
    #[serde(default)] pub opacity: f32,        // 0.0–1.0, mặc định 0.85
    #[serde(default)] pub margin_pct: u32,     // % chiều rộng video, mặc định 3
}
```

`corner` là chuỗi chứ không phải enum để `#[serde(default)]` cho ra `""`; hàm
dựng filter coi mọi giá trị lạ là `"br"`. Lý do: một enum sai giá trị sẽ làm hỏng
deserialize cả file config (mục 2.3).

### 5.2 Filter

`ExportOpts` (`export.rs:103-116`) thêm `watermark: Option<Watermark>`.

Chỗ khó nằm ở chỉ số input. Hiện có: `0` = video, `1` = `dub.wav`, và `2` = srt
chỉ khi `soft_subs && !burn_subs` (`export.rs:171-229`). Logo là `-i <png>` thêm
vào **cuối**, nên chỉ số của nó là `2` hoặc `3` tuỳ có srt hay không. Phải tính,
không được đóng cứng.

```
# nhánh video (chỉ dựng khi burn_subs || watermark)
[0:v]subtitles=burn.srt:force_style='…'[vs]        # chỉ khi burn_subs
[<i>:v]format=rgba,colorchannelmixer=aa=<opacity>,scale=<W*size_pct/100>:-1[wm]
[vs][wm]overlay=<x>:<y>[v]
```

Toạ độ theo góc, với `m = W*margin_pct/100`:

| corner | x | y |
|---|---|---|
| tl | `m` | `m` |
| tr | `W-w-m` | `m` |
| bl | `m` | `H-h-m` |
| br | `W-w-m` | `H-h-m` |

Dùng biến `main_w`/`overlay_w` của ffmpeg thay vì số cứng, để không phải probe
kích thước video.

### 5.3 Hệ quả phải nói với người dùng

`build_export_args` hiện chọn `-c:v copy` khi `!burn_subs` (`export.rs:216-219`)
và `-map 0:v:0` thay vì `-map [v]` (`export.rs:194-195`). Cả hai đang rẽ nhánh
thuần theo `burn_subs`. Bật logo mà không sửa hai chỗ này thì ffmpeg lỗi "filter
output [v] not used" hoặc bỏ qua logo.

⇒ Điều kiện đổi thành `co_filter_video = burn_subs || watermark_bat`.

Và vì `-c:v copy` không còn dùng được: **bật logo là phải mã hoá lại toàn bộ
video**, lâu ngang burn-in. UI phải nói thẳng câu này ngay cạnh ô bật logo, không
để người dùng tự phát hiện sau 20 phút chờ.

### 5.4 File logo nằm ngoài phạm vi asset

Để xem thử được logo trong trình phát, file PNG người dùng chọn cũng cần
`scope.allow_file`. Cùng cơ chế mục 6.1.

## 6. Trình phát xem thử

### 6.1 Mở phạm vi asset

Thêm một lệnh `cho_phep_xem(path: String)` gọi `app.asset_protocol_scope()
.allow_file(&path)`, hoặc gọi thẳng trong `open_project` / `run_stt` cho
`video_path` và trong `save_config` cho `watermark.path`.

Chọn: **một lệnh riêng `cho_phep_xem`**, gọi từ frontend khi mở tab 6. Lý do là
`save_config` không nên đổi trạng thái bảo mật, và người dùng có thể đổi logo
nhiều lần trong một phiên mà không lưu config.

Kiểm tra: đường dẫn phải `canonicalize` được và là file, để không khai bừa cả ổ
đĩa.

### 6.2 Lớp vẽ

```
<div class="xem-thu">            position: relative, aspect-ratio theo video
  <video src={convertFileSrc(videoPath)} controls />
  <img class="wm" src={convertFileSrc(logo)} />     absolute, theo corner
  <div class="cap">{cue đang chạy}</div>            absolute, đáy giữa
</div>
```

Phụ đề lấy từ `cues` mà `list_cues` đã trả (đã có sẵn ở Bước 4, không cần lệnh
mới). Cue đang chạy = cue có `startMs <= t*1000 < endMs`, cập nhật theo sự kiện
`timeupdate`.

**Quy đổi cỡ chữ.** libass không thấy `PlayResX/Y` nên lấy độ phân giải video
thật làm hệ quy chiếu: `FontSize=24` nghĩa là 24px trên khung gốc. Trình phát
hiển thị ở kích thước khác, nên CSS phải là:

```
fontSize = sub.size * (videoElement.clientHeight / videoElement.videoHeight)
```

Viền vẽ bằng `-webkit-text-stroke: <outline>px <outline_color>` cộng
`paint-order: stroke fill` để viền không ăn vào nét chữ.

**Nói rõ mức chính xác.** Lớp HTML này không phải libass: kerning, ngắt dòng, và
hình dáng viền sẽ lệch chút ít. Nó dùng để căn *bố cục và thời điểm*. Nút "Xem
thử phụ đề" (khung hình ffmpeg, đã có) vẫn giữ nguyên và là nguồn chính xác về
kiểu chữ. Hai thứ bổ sung nhau, UI phải nói rõ cái nào dùng để làm gì.

### 6.3 `.mkv` không phát được

WebView2 là Chromium, không mở container Matroska. Với video `.mkv`: ẩn trình
phát, hiện một dòng giải thích và chỉ sang nút "Xem thử phụ đề".

Đã cân nhắc remux ngầm sang `.mp4` (`-c copy`, nhanh) và bỏ: tốn thêm dung lượng
bằng cả video trong thư mục dự án, thêm một lệnh Rust, thêm một file phải dọn khi
xoá dự án — quá nhiều cho một định dạng ít gặp. Báo thật rẻ hơn và không hứa
suông.

### 6.4 Tiếng lồng

Phát các file `tts/segments/cue-NNNN.wav` đã có sau Bước 5, hẹn giờ theo
`video.currentTime`. Không đụng backend.

**Giới hạn phải ghi lên UI:** đây là bản **chưa retime**. Pha `retime`
(`pipeline.rs:344-420`) chạy lúc xuất mới ép từng cue vừa khung của nó, nên trong
bản xem thử một câu đọc dài quá khung sẽ chồng sang cue sau, còn bản xuất thật thì
không. Dùng để nghe giọng và kiểm khớp thô, không phải để chấm bản cuối.

Đã cân nhắc thêm lệnh dựng `dub.wav` chuẩn và bỏ: nó chạy lại toàn bộ TTS với
`ScalePlan::per_cue`, mất vài phút — đúng bằng thứ mà "xem thử tức thì" sinh ra để
tránh.

Xử lý: một `AudioContext` với các `AudioBufferSourceNode` hẹn trước, huỷ và hẹn
lại mỗi khi `seeking`/`pause`. Tiếng gốc của video để ở mức `compose.volume_original`
cho giống bản xuất.

## 7. Kiểm thử

| Việc | Cách kiểm |
|---|---|
| Config cũ không mất khi thêm `watermark` | Test Rust: deserialize một `config.json` M7 không có khoá `watermark`, khẳng định `translate.openai.api_key` còn nguyên |
| `corner` giá trị lạ không làm hỏng config | Test: `"corner": "xyz"` vẫn parse được, filter dùng `br` |
| Chỉ số input logo khi có/không soft-subs | Test `build_export_args`: khẳng định chuỗi filter trỏ đúng `[2:v]` và `[3:v]` trong hai trường hợp |
| Logo bật ⇒ không còn `-c:v copy` | Test: `burn_subs=false, watermark=Some(_)` ⇒ args chứa `libx264`, không chứa `copy` |
| Toạ độ bốn góc | Test bốn trường hợp của `overlay=` |
| Trình phát không chết khi thiếu file | Video mất / logo bị xoá ⇒ hiện thông báo, không ô đen câm |
| `.mkv` | Mở dự án `.mkv` ⇒ hiện dòng giải thích, không dựng `<video>` |

Bốn hàng đầu là test thuần hàm trên `build_export_args`/`build_filter_complex`,
không cần chạy ffmpeg. Ba hàng cuối kiểm bằng tay trên app thật.

## 8. Thứ tự làm

1. `WatermarkConfig` + test config cũ không mất (mục 2.3 là rủi ro cao nhất, làm
   trước và chốt bằng test).
2. `build_filter_complex` + `build_export_args` cho logo + test chỉ số input,
   toạ độ, codec.
3. UI: tách tab 6/7, bỏ chỗ giấu kiểu chữ, thêm khối logo + cảnh báo mã hoá lại.
4. Lệnh `cho_phep_xem` + trình phát video/phụ đề/logo.
5. Tiếng lồng theo cue trong trình phát.

Bước 1–2 độc lập với 3–5 và là chỗ dễ làm hỏng dữ liệu người dùng nhất, nên xong
hẳn rồi mới đụng UI.
