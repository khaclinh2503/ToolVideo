# M10 — Sổ tay tên riêng và thuật ngữ

**Ngày:** 2026-10-01
**Trạng thái:** thiết kế

## 1. Vì sao làm

Phiên đo ngày 30/09 và 01/10 cho thấy sau khi đã sửa prompt và đã đổi model,
loại lỗi còn lại nhiều nhất và khó chịu nhất là **tên riêng**. Nó khó chịu vì
người xem nhận ra ngay, và vì nó không ngẫu nhiên — cùng một cái tên có thể ra
kiểu khác nhau ở hai chỗ.

Đo trên bản Gemma-3-12B chạy đủ 193 cue của dự án `5104ff60`:

| Tên gốc | Bản dịch | |
|---|---|---|
| `林燕` | Lâm Yến | Hán-Việt ✓ |
| `云庭` | Vân Đình | Hán-Việt ✓ |
| `球球` | Cầu Cầu | Hán-Việt ✓ |
| `小雨` | Tiểu Vũ | Hán-Việt ✓ |
| `灵公文` | **Ling Gongwen** | pinyin ✗ |

Bốn trên năm đúng, nhưng cái sai không sai nhẹ: nó **lẫn quy ước ngay trong một
phim**. Người xem thấy "Giáo sư Lâm Yến" ở cue 30 rồi "Ling Gongwen" ở cue 39.

Và đo riêng trên sáu tên chưa hề nằm trong prompt, mỗi tên 3 lần: `小花` (tên
con chó) ra "Hoa nhỏ" **3/3** — dịch nghĩa thay vì phiên âm — ở cả prompt cũ lẫn
prompt mới. Model không biết đâu là tên người, đâu là danh từ, và prompt không
dạy nó biết được.

### 1.1 Vì sao không sửa tiếp bằng prompt

Phiên 30/09–01/10 đã nhét quy tắc vào prompt **năm lần** cho một lỗi khác (xưng
hô bám item đầu lô) và trượt cả năm lần, kết quả đo y hệt nhau. Hai thứ thực sự
có tác dụng đều là **mã kiểm rồi sửa**:

* cue còn sót chữ Hán → gửi riêng cue đó đi sửa kèm mô tả lỗi (5 chữ sót còn 1)
* lô bị lệch hàng → dịch lại, vẫn lệch thì dừng hẳn

Mục này đi theo đúng lối đó: sổ tay **không chỉ** nhét vào prompt rồi mong model
nghe lời, mà **đối chiếu sau khi dịch** và sửa cue vi phạm.

## 2. Phạm vi

Ba lớp, dùng được độc lập nhưng thiết kế để chồng lên nhau.

### Lớp 1 — Sổ tay của dự án

Một bảng `tiếng gốc → tiếng Việt` thuộc về từng dự án. Người dùng thêm, sửa,
xoá. Khi dịch:

1. **Nhét vào prompt** những mục có mặt trong lô đang dịch (không nhét cả sổ,
   để khỏi phí token và khỏi loãng).
2. **Đối chiếu sau khi dịch**: cue nào có từ gốc trong sổ mà bản dịch không có
   từ đích tương ứng thì gửi đi sửa, kèm mô tả đúng chỗ sai.

Lớp này là thứ duy nhất **bắt buộc** được kết quả. Hai lớp sau chỉ lo đổ đầy sổ.

### Lớp 2 — Tự rút tên riêng trước khi dịch

Trước khi dịch cue nào, gửi **một** request duy nhất kèm toàn bộ phụ đề gốc,
yêu cầu liệt kê mọi tên riêng (người, vật nuôi, biệt danh, địa danh, thương
hiệu) và phiên âm Hán-Việt của chúng. Kết quả hiện lên một màn hình để người
dùng sửa, rồi đổ vào sổ tay của lớp 1.

Nhận diện tên riêng là việc model làm tốt khi được hỏi thẳng, và chỉ tốn một
request cho cả phim. Làm một lần cho cả phim nên mọi lô đều dùng chung một cách
gọi — đúng chỗ mà dịch theo lô đang hỏng.

### Lớp 3 — Bảng Hán-Việt làm ý kiến thứ hai

**Không** làm chuẩn, vì đã đo là không đủ tư cách. Nguồn khả dĩ duy nhất có giấy
phép rõ ràng là trường `kVietnamese` của Unihan (giấy phép Unicode, cho phép
phát hành lại kèm thông báo bản quyền), và nó có hai khuyết tật:

* **Thiếu 21%** số chữ Hán trong phim mẫu, kể cả sau khi quy chữ giản thể về
  phồn thể bằng `kTraditionalVariant` (143/697 chữ).
* Nó trộn **âm Nôm** với âm Hán-Việt: `燕` ra "én" chứ không phải "Yến", nên
  `林燕` thành "Lâm Én". `磊` ra "lối" chứ không phải "Lỗi".

Thử trên 8 tên: đúng hẳn 5, thiếu chữ 1, sai 2. Model thì đúng 4/5 trên phim
thật. Nên vai của bảng này là **đối chứng**: ở màn hình lớp 2, tên nào mà model
và bảng cho ra giống nhau thì để yên; tên nào lệch thì đánh dấu để người dùng
ngó trước. Lệch không có nghĩa là model sai — nghĩa là chỗ đó đáng nhìn.

## 3. Ngoài phạm vi

* **Dùng chung sổ giữa các dự án.** Phim bộ nhiều tập rõ ràng cần, nhưng để mục
  sau; lớp 2 đã làm cho việc gõ tay nhẹ đi nhiều.
* **Xưng hô, sắc thái, ai đang nói với ai.** Sổ tay không chữa được, đừng kỳ
  vọng. Xưng hô đã chữa bằng đổi model (7/8 ca so với 5/8).
* **Tự dò tên riêng bằng luật n-gram.** Đã cân nhắc và bỏ: không có bảng tần
  suất từ tiếng Trung trong app, mà model hỏi thẳng thì chính xác hơn hẳn.

## 4. Thiết kế

### 4.1 Lưu ở đâu

`<project>/glossary.json`, cạnh `project.json`:

```json
{
  "version": 1,
  "muc": [
    { "goc": "球球", "dich": "Cầu Cầu", "ghi_chu": "tên con chó" },
    { "goc": "爱回收严选", "dich": "Aihuishou Yanxuan", "ghi_chu": "thương hiệu" }
  ]
}
```

Thuộc dự án chứ không thuộc cấu hình chung, vì tên riêng là của từng phim.

### 4.2 Nhét vào prompt

Trong `translate_segments`, với mỗi lô, lọc ra những mục có `goc` xuất hiện
trong các câu của lô rồi gắn vào prompt hệ thống. Có trần số mục để một sổ tay
to không làm nổ prompt; vượt trần thì ưu tiên mục xuất hiện nhiều lần nhất
trong lô.

Việc này cần một đường để đưa thêm hướng dẫn vào provider. `TranslateProvider`
hiện không có, nên thêm một phương thức có mặc định rỗng — provider nào không
dùng LLM (`google_free`) bỏ qua được.

### 4.3 Đối chiếu và sửa

Sau khi lô dịch xong, với mỗi cue: nếu câu gốc chứa `goc` của một mục mà bản
dịch không chứa `dich` của mục đó → cue vi phạm. Gửi cue đó đi dịch lại kèm mô
tả lỗi ("bản dịch trước gọi 球球 sai; phải gọi là Cầu Cầu"), rồi **chỉ nhận khi
khá hơn** — số mục vi phạm giảm đi. Luật đơn điệu, giống hệt luật đã dùng cho
chữ Hán còn sót, nên một lần sửa hỏng không xoá mất bản dịch đang có.

Có trần số cue sửa mỗi lô, như `TOI_DA_DICH_LAI` hiện có.

#### Gộp đường sửa lỗi

Hiện có `dich_lai_cho_tron(text, con_sot, src, tgt)` chuyên cho chữ Hán sót.
Mục này cần đúng cơ chế đó với một mô tả lỗi khác, nên đổi thành một phương
thức chung nhận mô tả lỗi bằng lời, và chuyển chỗ gọi cũ sang dùng nó. Không
thêm cơ chế thứ hai song song.

### 4.4 Rút tên riêng

Một request, dùng chính `TranslateProvider` đang chọn, kèm toàn bộ câu gốc (phim
mẫu 193 cue ≈ 6 nghìn ký tự, thừa sức trong 16k context). Trả JSON danh sách
`{goc, dich, loai}`. Hỏng JSON thì bỏ qua, **không** làm chết bước dịch — đây là
tiện ích, không phải điều kiện.

### 4.5 Bảng Hán-Việt

Sinh từ `Unihan_Readings.txt` + `Unihan_Variants.txt` thành một bảng gọn nằm
trong repo, kèm thông báo bản quyền Unicode. Không tải lúc chạy: bảng chỉ vài
trăm KB, mà thêm một mục tải về là thêm một đường hỏng.

Dùng ở **một chỗ duy nhất**: màn hình lớp 2, để đánh dấu tên nào model và bảng
không khớp. Không tự sửa gì.

### 4.6 Giao diện

Bước 3 (Dịch) thêm một vùng "Sổ tay tên riêng": bảng sửa được, nút "Tự tìm tên
riêng" chạy lớp 2, và cột đánh dấu chỗ bảng Hán-Việt không đồng ý.

## 5. Rủi ro

* **Thay thế quá tay.** `goc` ngắn (một chữ) có thể khớp nhầm giữa câu. Giảm bằng
  cách chỉ đối chiếu, không tự thay chuỗi — việc sửa vẫn do model làm lại cả câu.
* **Sổ tay sai làm hỏng bản dịch tốt.** Luật đơn điệu (chỉ nhận khi vi phạm giảm)
  chặn được phần lớn; ngoài ra người dùng sửa được sổ.
* **Thêm request.** Lớp 2 thêm một request cho cả phim. Lớp 1 chỉ thêm request
  khi có vi phạm.
* **Tên riêng viết hoa giữa câu.** Đối chiếu phải không phân biệt hoa thường,
  nếu không "cầu cầu" đầu câu bị coi là vi phạm.

## 6. Cách biết là xong

Chạy lại đúng 193 cue của dự án `5104ff60` qua bài e2e đã có:

* `灵公文` ra Hán-Việt chứ không ra pinyin
* `小花` trong bộ thử sáu tên không còn ra "Hoa nhỏ"
* không cue nào rụng lời, không lô nào lệch hàng, không cue nào còn chữ Hán
* số request tăng thêm không quá một cho mỗi lô có vi phạm, cộng một cho cả phim
