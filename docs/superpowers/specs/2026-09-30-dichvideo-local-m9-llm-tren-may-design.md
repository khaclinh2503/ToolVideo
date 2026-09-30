# M9 — Dịch bằng LLM chạy trên máy (llama.cpp + Qwen3-14B)

**Ngày:** 2026-09-30
**Trạng thái:** thiết kế, chờ duyệt

## 1. Vì sao làm

App tên là DichVideo-**Local** và đã chạy offline hoàn toàn ở mọi bước trừ một:
dịch. Hai nhà cung cấp hiện có đều phải ra mạng — Google miễn phí, hoặc một
endpoint tương thích-OpenAI với key riêng của người dùng. Nghĩa là nội dung phụ
đề rời khỏi máy, và chất lượng phụ thuộc vào một dịch vụ có thể đổi giá, đổi
model, hoặc chết.

Mục này đóng nốt lỗ hổng đó: nhúng `llama.cpp` và một model vào bộ công cụ, để
dịch chạy ngay trên GPU của máy.

## 2. Đã đo thật, không phỏng đoán

Toàn bộ số dưới đây đo trên máy đích (RTX 5060 Ti 16GB, i5-14400F, 32GB RAM),
chạy 40 cue tiếng Trung thật từ dự án `5104ff60` qua **đúng** request mà
`openai_compat.rs` gửi — cùng prompt hệ thống, cùng hướng dẫn ngữ cảnh "phim",
`temperature 0.2`, `max_tokens 4096`, `response_format json_object`, và cả hai
khoá tắt suy luận.

| | Qwen3-14B Q5_K_M | Gemma-3-12B Q5_K_M | gpt-oss-20b (cloud, số M7) |
|---|---|---|---|
| Thời gian / 40 cue | 34,3 s | 31,6 s | 28 s |
| JSON hợp lệ | 4/4 lượt | 4/4 lượt | — |
| VRAM | 13,5 / 16,3 GB | ~11 GB | — |
| Dung lượng | 9,8 GB | 7,9 GB | — |

**Chọn Qwen3-14B Q5_K_M.** Với prompt chặt, nó thắng Gemma ở hai chỗ chẩn đoán
được: `鞋底` dịch đúng "đế giày" (Gemma ra "bàn chân"), và `他` giữ đúng ngôi thứ
ba "anh ấy" (Gemma đổi thành ngôi thứ hai). Nó cũng là model gốc Trung Quốc nên
hiểu tiếng Trung chắc hơn — đúng cặp ngôn ngữ chính của app.

### 2.1 Ràng buộc quyết định không nằm ở điểm benchmark

`openai_compat` gửi lô 40 cue và bắt model trả **JSON đúng 40 mục, chỉ số liên
tục từ 0**. Sai một mục là hỏng cả lô. Không bài xếp hạng model nào đo thứ này,
mà nó mới là thứ quyết định model có dùng được hay không. Cả hai model đều đạt
4/4 lượt — đây là lý do việc nhúng khả thi, chứ không phải điểm dịch.

### 2.2 Phát hiện ngoài phạm vi mục này, nhưng phải ghi lại

Phần lớn lỗi dịch quan sát được **là lỗi prompt, không phải lỗi model**. Prompt
hiện tại chỉ nói "giữ đúng sắc thái và xưng hô" — quá mơ hồ. Thêm quy tắc cụ thể
(chốt một cặp xưng hô và giữ đến cuối; `我` là người nói, không hoán ngôi; `姐` là
chị, `姐夫` là anh rể; dịch đủ mọi vế) sửa được hàng loạt lỗi ở **cả hai** model,
chỉ tốn ~0,6 giây:

| Lỗi | Prompt cũ | Prompt chặt |
|---|---|---|
| Qwen `姐夫` | "Chú rể" | "Anh rể" |
| Qwen `我花12000买的` | "anh mua" (đảo ngôi) | "em mua" |
| Qwen `回家看见他…` | bỏ mất cả vế | dịch đủ, `他` → "anh ấy" |
| Gemma `你去找` | "Mày đi tìm" | "Anh đi tìm" |

Việc sửa prompt có lợi cho **mọi** nhà cung cấp kể cả cloud, nên nó là một mục
riêng, không gộp vào đây.

**Đã làm, ngày 2026-09-30.** Xem `QUY_TAC_DICH` trong `openai_compat.rs` — chú
thích ở đó ghi số đo 4 lần chạy mỗi prompt kèm cả phần KHÔNG sửa được.
Hai điều rút ra đáng nhớ hơn bảng trên:

* Quy tắc suông không ăn thua, **phải có ví dụ cụ thể**. "Giữ nguyên phiên âm"
  không sửa được `球球`; nói rõ "phiên âm Hán-Việt, `球球` là Cầu Cầu chứ không
  phải Bóng bóng" thì 0/4 ⇒ 4/4.
* Một lần đo là vô nghĩa. Ở `temperature 0.2` cùng một prompt cho kết quả khác
  nhau giữa các lần; có tiêu chí lên 4/4 rồi lần sau xuống 1/4. Mọi kết luận
  trong mục này đều từ nhiều lần chạy.

Và một cái bẫy đã sập một lần: hằng prompt có dấu nháy **chưa escape** thì file
không biên dịch được, nhưng bộ đo bằng Python vẫn chạy và âm thầm cắt cụt chuỗi
— mấy vòng đo sau đó dùng prompt thiếu hẳn đoạn cuối mà không ai biết. Chạy
`cargo test` TRƯỚC mỗi vòng đo, không phải sau.

Hai lỗi **cả hai model đều chưa qua** kể cả với prompt chặt, và mục này KHÔNG
giải quyết: tên riêng bị dịch nghĩa (`球球` tên con chó → "Bóng bóng"), và `干`
là tiếng chửi thì dịch nhẹ hều ("Chán"/"Làm").

## 3. Phạm vi

Người dùng đã chốt ba điều, và chúng cắt bỏ phần lớn độ phức tạp:

1. **Chỉ chạy trên máy này** (RTX 5060 Ti 16GB). ⇒ KHÔNG làm: dự phòng CPU,
   nhiều bản CUDA cho GPU đời cũ, hạ cấp lượng tử cho card ít VRAM, dò GPU lúc
   chạy.
2. **Tắt server sau khi dịch xong.** ⇒ KHÔNG làm: server sống suốt phiên, bộ đếm
   nhàn rỗi.
3. **Gộp vào bộ công cụ bắt buộc.** ⇒ KHÔNG làm: tải theo yêu cầu, giao diện hỏi
   riêng.

Bộ công cụ từ ~1,1 GB lên ~11,5 GB. Đây là đánh đổi người dùng đã chấp nhận.

Cũng không làm: đổi `SYSTEM_PROMPT` (mục riêng, xem 2.2), sửa hai lỗi tên
riêng/tiếng chửi, hay chọn model khác lúc chạy.

## 4. Hiện trạng cần biết trước khi sửa

### 4.1 Mọi tiến trình hiện nay đều chạy-rồi-tắt

`ffmpeg`, `ffprobe`, `piper`, `yt-dlp`, `python` (VieNeu) đều theo khuôn: dựng
`Command`, `spawn()`, đẩy dữ liệu qua stdin/stdout, chờ kết thúc. Không có tiến
trình nào sống lâu hơn một lệnh.

`llama-server` là **HTTP server chạy dài**, nạp model mất 10–20 giây. Đây là thứ
đầu tiên thuộc loại này trong app, nên không có khuôn sẵn để chép. Phần lớn rủi
ro của mục này nằm ở đây, không nằm ở chất lượng dịch.

### 4.2 `/health` trả 200 TRƯỚC khi model nạp xong

Đo thật khi dựng máy đo: `curl /health` trả 200 ngay sau khi tiến trình lên,
nhưng `POST /v1/chat/completions` lúc đó trả **503 Service Unavailable** vì model
còn đang nạp. Chờ theo `/health` là chờ hụt, và biểu hiện thành một lỗi 503 khó
hiểu giữa lúc dịch.

⇒ Điều kiện sẵn sàng phải là **một lời gọi hoàn thành thật trả 200**, không phải
`/health`. Đây là điều kiện chấp nhận, không phải lời khuyên.

### 4.3 Tiến trình con phải ẩn cửa sổ console

Mọi chỗ `spawn` trên Windows trong repo đều đặt `creation_flags(0x08000000)`
(`CREATE_NO_WINDOW`). Thiếu nó thì mỗi lần dịch là một cửa sổ đen nháy lên.

### 4.4 `target_for` không khai được "cả gói zip"

`components::target_for` (`components.rs:158-173`) chỉ khớp hai dạng: `from` là
tên file lẻ đúng nguyên văn, hoặc `from` kết bằng `/` thì coi là cây con và cắt
tiền tố đó đi.

Gói `llama.cpp` để **55 file ngay gốc zip**, không có thư mục bọc. Không tiền tố
nào khớp được, nên không có cách nào khai "lấy cả gói" bằng cơ chế hiện tại.

Hai đường đi, xem mục 5.2.

## 5. Thiết kế

### 5.1 Component mới

Ba mục thêm vào `components.json`, ghim sha256 bằng `cargo run --bin pin_components`
như mọi component khác:

| id | Nguồn | Cỡ | Ghi chú |
|---|---|---|---|
| `llama-bin` | `ggml-org/llama.cpp` release `b11256`, `llama-b11256-bin-win-cuda-13.4-x64.zip` | 146 MB | `llama-server.exe` + DLL |
| `llama-cudart` | cùng release, `cudart-llama-bin-win-cuda-13.4-x64.zip` | 403 MB | Thư viện CUDA runtime |
| `qwen3-14b` | `Qwen/Qwen3-14B-GGUF`, `Qwen3-14B-Q5_K_M.gguf` | 10 514 569 568 byte | `archive: raw` |

**Phải là bản CUDA 13.4, không phải 12.4.** RTX 5060 Ti là kiến trúc Blackwell
(sm_120); bản 12.4 không biên dịch cho kiến trúc này và sẽ không chạy. Đã xác
minh: bản 13.4 nhận đúng GPU — `CUDA0: NVIDIA GeForce RTX 5060 Ti (16310 MiB,
15158 MiB free)`.

Đích đặt file: `models/llm/bin/` và `models/llm/gguf/`. Hiện đã có sẵn ở đó từ
lúc đo, đúng chỗ component sẽ ở.

### 5.2 Khai file trong zip: lấy cả gói

**Đã chốt: mở rộng `FileMap` để lấy trọn archive**, không liệt kê từng file.

Thêm một nghĩa mới cho `from` — chuỗi `"**"` — nghĩa là mọi entry của archive đổ
vào thư mục `to`. Sửa `target_for` (`components.rs:158-173`) thêm đúng một nhánh
cho dạng này.

Lý do chọn hướng này thay vì khai tay 34 file cần (`llama-server.exe` + 33 DLL):
33 DLL là một bộ runtime không tách rời được, liệt kê từng cái không cho thêm sự
an toàn nào mà lại mục ruỗng theo mỗi lần nâng bản llama.cpp khi bộ DLL đổi. Lấy
cả gói cũng kéo theo 20 exe không dùng (`llama-cli`, `llama-bench`…) — chấp nhận,
vì chúng chỉ chiếm chỗ đĩa chứ không ảnh hưởng gì, và tổng gói 146 MB là nhỏ so
với model 9,8 GB nằm cạnh nó.

**Cái giá phải trả, và phải làm cẩn thận vì nó là code dùng chung cho MỌI
component:**

- Tên entry giờ đi thẳng từ archive vào đường dẫn đích mà không qua một `from`
  do người viết spec kiểm soát. `safe_join` phải chặn được `../` và đường dẫn
  tuyệt đối trong tên entry. Đây là điều kiện chấp nhận, có test riêng (mục 7).
- Kiểm "đã lấy được gì chưa" ở cuối `place_files` hiện dựa vào `from` kết bằng
  `/`. Nhánh `"**"` cần luật riêng: lấy được **ít nhất một** file, nếu không thì
  báo lỗi to tiếng như các dạng khác.

### 5.3 Vòng đời server

Một kiểu `LlamaServer` mới, giữ `std::process::Child`:

- `khoi_dong()` — spawn `llama-server.exe` với tham số đã đo:
  `-ngl 99 -c 16384 -fa on --jinja --reasoning-budget 0 --host 127.0.0.1 --port <p>`,
  kèm `CREATE_NO_WINDOW`.
- `cho_san_sang()` — lặp gọi `POST /v1/chat/completions` với `max_tokens: 1` cho
  tới khi trả 200, hoặc quá hạn thì lỗi. **Không** dùng `/health` (mục 4.2).
- `impl Drop` — `kill()` tiến trình con. Đây là thứ giữ cho server không sống sót
  sau khi dịch xong hoặc sau một lỗi giữa chừng.

`-ngl 99` đẩy toàn bộ layer lên GPU. Trên máy này đo được 13,5/16,3 GB — vừa, còn
dư ~2,8 GB. Con số này chỉ đúng cho đúng cặp (model này, ngữ cảnh 16384); đổi bất
kỳ cái nào cũng phải đo lại.

**Cổng.** Đóng cứng một cổng là rủi ro: cổng có thể đang bận. Xin cổng trống từ hệ
điều hành (bind `127.0.0.1:0`, đọc cổng thật, nhả ra, truyền cho `llama-server`).
Có khe hở tranh chấp giữa lúc nhả và lúc server bind, nhưng nhỏ hơn nhiều so với
đóng cứng, và `cho_san_sang()` sẽ bắt được nếu hỏng.

**Chỉ nghe `127.0.0.1`**, không phải `0.0.0.0` — không có lý do gì để model dịch
của người dùng mở ra mạng LAN.

### 5.4 Nhà cung cấp dịch

Thêm `default_provider: "llm_tren_may"` vào danh sách, hiện trên giao diện là
"LLM trên máy (không cần mạng)".

Nó **không** cần một `TranslateProvider` mới: giao thức đã là tương thích-OpenAI.
Đường chạy là dựng `LlamaServer`, chờ sẵn sàng, rồi dùng lại `OpenAiCompat` với
`base_url` trỏ vào cổng vừa cấp, `api_key` bỏ trống, `model` là tên bất kỳ
(`llama-server` bỏ qua trường này khi chỉ nạp một model).

Dùng lại `OpenAiCompat` có một lợi ích thật, không chỉ là tiết kiệm code: mọi thứ
khó đã nằm sẵn trong đó — lọc khối JSON khi model chèn phần suy nghĩ, kiểm đủ số
item, thử lại một lần khi lỗi nội dung, và hai khoá tắt suy luận. Viết lại là
chép lại từng cái bẫy đó.

### 5.5 Thời gian chờ

`translate/mod.rs` dùng `CHO_LLM` cho hạn chờ HTTP. Lô 40 cue đo được 34,3 giây
với model đã nạp sẵn. Nhưng lần dịch đầu còn cộng thêm thời gian nạp model.

⇒ Thời gian nạp phải nằm trong `cho_san_sang()` với hạn chờ riêng, **trước** khi
có request dịch nào. Như vậy `CHO_LLM` vẫn chỉ đo đúng một lô, và một model nạp
chậm không bị báo nhầm thành "dịch quá lâu".

## 6. Cái có thể hỏng, và cách biết

| Hỏng | Biểu hiện nếu không xử lý | Xử lý |
|---|---|---|
| Không có GPU NVIDIA / driver cũ | `llama-server` chết lúc khởi động | `khoi_dong()` đọc stderr của tiến trình con và đưa vào thông báo lỗi, thay vì chỉ "spawn thất bại" |
| Cổng bị chiếm | Server chết im, `cho_san_sang()` hết giờ | Xin cổng trống từ OS (5.3) |
| App tắt đột ngột giữa lúc dịch | `llama-server` mồ côi giữ 13,5 GB VRAM | `impl Drop` gọi `kill()`; chấp nhận là khi app bị `kill -9` thì vẫn mồ côi — xem 6.1 |
| Model tải thiếu | GGUF hỏng, server chết | sha256 của `components` đã bắt sẵn |
| VRAM đang bị việc khác chiếm | Nạp chậm khủng khiếp do tràn sang RAM | Không xử lý; ghi vào thông báo để người dùng biết nhìn đâu |

### 6.1 Tiến trình mồ côi — nói thẳng giới hạn

`impl Drop` chạy khi app thoát bình thường hoặc khi lỗi làm rớt biến. Nó **không**
chạy khi tiến trình app bị kết thúc cứng. Trường hợp đó `llama-server` sống tiếp
và giữ 13,5 GB VRAM cho tới khi người dùng tự tắt.

Có cách chặn triệt để (Job Object trên Windows, gắn tiến trình con vào vòng đời
tiến trình cha) nhưng nó kéo thêm phụ thuộc winapi và một lớp nữa phải test.
**Mục này không làm**, ghi lại đây để lần sau khỏi tưởng đã xử lý. Nếu thực tế
gặp nhiều thì làm sau.

## 7. Kiểm thử

| Việc | Cách kiểm |
|---|---|
| `from: "**"` lấy đủ cả gói | Test: `place_files` trên một zip dựng tay có nhiều file ở gốc, khẳng định ra đủ từng file |
| `from: "**"` không cho path traversal | Test: entry tên `../../evil.dll` và entry đường dẫn tuyệt đối đều bị `safe_join` chặn |
| `from: "**"` trên archive rỗng báo lỗi | Test: zip không có entry nào ⇒ `place_files` trả lỗi, không âm thầm báo thành công |
| Dạng `from` cũ không đổi hành vi | Test: component kiểu ffmpeg (file lẻ) và kiểu cây con vẫn ra đúng như trước |
| Sẵn sàng tính theo lời gọi thật | Test: server giả trả 200 ở `/health` nhưng 503 ở `/v1/chat/completions` ⇒ `cho_san_sang()` phải KHÔNG báo sẵn sàng |
| `Drop` giết tiến trình | Test: dựng `LlamaServer` trong scope, thoát scope, khẳng định pid đã chết |
| Cổng trống | Test: xin hai cổng liên tiếp, khẳng định khác nhau và đều bind được |
| Dịch thật đầu-cuối | Test e2e có cổng môi trường (như `DVL_E2E_WATERMARK` của M8): chạy 40 cue thật, khẳng định đủ 40 dòng trả về, không rỗng |

Bốn hàng đầu là test thuần, không cần model. Hàng cuối cần model 9,8 GB nên phải
gắn cổng môi trường, và **phải hỏng to tiếng khi cổng không bật** chứ không lặng
lẽ báo xanh — đúng khuôn `e2e_export_test` hiện có.

## 8. Thứ tự làm

1. `FileMap` nhận "cả gói" + test path traversal. (Code dùng chung, rủi ro cao
   nhất, làm trước và chốt bằng test.)
2. Ba component vào `components.json`, ghim sha256, cài thật một lần.
3. `LlamaServer`: khởi động, chờ sẵn sàng theo lời gọi thật, `Drop` giết tiến
   trình. Test với server giả.
4. Nối vào `translate`: nhà cung cấp mới, dùng lại `OpenAiCompat`.
5. Giao diện: thêm lựa chọn, kèm ghi chú đã đo (34 s mỗi 40 cue, 13,5 GB VRAM).
6. Test e2e có cổng môi trường.

Bước 1 độc lập và là chỗ dễ làm hỏng component khác nhất, nên xong hẳn rồi mới
đụng phần còn lại.
