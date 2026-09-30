# M9 — Dịch bằng LLM chạy trên máy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhúng `llama.cpp` + Qwen3-14B vào bộ công cụ để dịch phụ đề chạy hoàn toàn trên GPU của máy, không cần mạng.

**Architecture:** Ba component mới tải về như ffmpeg/VieNeu. Một kiểu `LlamaServer` quản vòng đời tiến trình `llama-server.exe` (khởi động → chờ sẵn sàng → `Drop` giết). Provider mới **sở hữu** server làm một trường và ủy quyền dịch cho `OpenAiCompat` sẵn có, nên `Box<dyn TranslateProvider>` bị thả lúc dịch xong là server tự chết — không phải sửa `run_translate_stage` hay `commands.rs` một dòng nào.

**Tech Stack:** Rust + Tauri 2, `llama.cpp` build b11256 (CUDA 13.4 x64), Qwen3-14B-Q5_K_M GGUF, `reqwest` blocking, `httpmock` (dev), React 19 + TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-30-dichvideo-local-m9-llm-tren-may-design.md`

## Global Constraints

- **Phải là bản CUDA 13.4, không phải 12.4.** RTX 5060 Ti là Blackwell (sm_120); bản 12.4 không biên dịch cho kiến trúc này. Đã xác minh bản 13.4 nhận đúng GPU: `CUDA0: NVIDIA GeForce RTX 5060 Ti (16310 MiB, 15158 MiB free)`.
- **Điều kiện sẵn sàng của server phải là một lời gọi hoàn thành thật trả 200, KHÔNG phải `/health`.** Đo thật: `/health` trả 200 ngay khi tiến trình lên, nhưng `POST /v1/chat/completions` lúc đó trả **503** vì model còn nạp. Chờ theo `/health` là chờ hụt và biểu hiện thành lỗi 503 khó hiểu giữa lúc dịch.
- **Mọi `spawn` trên Windows phải đặt `creation_flags(0x08000000)`** (`CREATE_NO_WINDOW`). Thiếu nó là mỗi lần dịch một cửa sổ đen nháy lên. Khuôn có sẵn ở `tts/vieneu.rs:408-412`.
- **Server chỉ nghe `127.0.0.1`**, không bao giờ `0.0.0.0`.
- Tham số `llama-server` đã đo thật, dùng đúng bộ này: `-ngl 99 -c 16384 -fa on --jinja --reasoning-budget 0 --host 127.0.0.1 --port <p>`. Đổi bất kỳ cái nào cũng phải đo lại VRAM (hiện 13,5/16,3 GB).
- Comment trong repo viết tiếng Việt và giải thích *vì sao*, không phải *cái gì*. Comment nói sai sự thật là một lỗi, không phải chuyện nhỏ.
- Test đặt ở `src-tauri/tests/<ten>_test.rs`, import qua `app_lib::`. Chạy: `cargo test --manifest-path src-tauri/Cargo.toml`.
- Chạy MỌI lệnh ở foreground. Không `run_in_background`, không monitor.
- Phạm vi đã chốt: **chỉ máy này**. KHÔNG làm dự phòng CPU, nhiều bản CUDA, hay hạ cấp lượng tử.

## Review Focus

Năm lớp đầu vào spec ngụ ý nhưng không task nào tự nhiên chạm tới. Mỗi dòng đã gắn test vào task sở hữu code.

1. **Entry trong zip mang đường dẫn độc** (`../../evil.dll`, đường dẫn tuyệt đối) — với `from: "**"` tên entry đi thẳng từ archive vào đường dẫn đích, không qua một `from` do người viết spec kiểm soát. → Task 1, test `sao_ca_goi_chan_duong_dan_doc`.
2. **Archive rỗng hoặc không có entry nào khớp** — phải báo lỗi to tiếng, không âm thầm ghi sổ "đã cài" rồi để app chết lúc chạy. → Task 1, test `sao_ca_goi_rong_thi_bao_loi`.
3. **Các dạng `from` cũ bị đổi hành vi** — `target_for` là code dùng chung; sửa hỏng là ffmpeg và VieNeu chết theo mà lỗi hiện ở chỗ khác hẳn. → Task 1, test `cac_dang_from_cu_khong_doi`.
4. **Thiếu engine hoặc thiếu model** — lỗi phải chỉ thẳng người dùng đi tải bộ công cụ, không phải một lỗi io trần trụi. → Task 3, test `thieu_engine_hoac_model_thi_chi_di_tai_bo_cong_cu`.
5. **Server lên nhưng không bao giờ nạp xong** — phải hết giờ và báo rõ, không treo app vô hạn. → Task 3, test `khong_bao_gio_san_sang_thi_het_gio`.

---

### Task 1: `from: "**"` — lấy trọn archive

**Files:**
- Modify: `src-tauri/src/components.rs` (`target_for` dòng 156-173; vòng kiểm cuối `place_files` dòng 256-270)
- Test: `src-tauri/tests/components_test.rs` (nối vào cuối)

**Interfaces:**
- Consumes: không có.
- Produces: `FileMap { from: Some("**"), to: "thu/muc" }` nghĩa là mọi entry của archive đổ vào `thu/muc`, giữ nguyên tên entry.

- [ ] **Step 1: Viết test thất bại**

Nối vào cuối `src-tauri/tests/components_test.rs`. File này đã có sẵn helper `spec(id, archive, files)` và `make_zip(path, entries)` — dùng lại, đừng viết mới.

```rust
/// `from: "**"` lấy trọn gói. Cần cho llama.cpp: 55 file nằm ngay gốc zip,
/// không có thư mục bọc nên không tiền tố nào khớp được.
#[test]
fn sao_ca_goi_lay_du_moi_file() {
    let d = tempfile::tempdir().unwrap();
    let zip = d.path().join("g.zip");
    make_zip(&zip, &[
        ("llama-server.exe", b"A"),
        ("ggml.dll", b"B"),
        ("cudart64_13.dll", b"C"),
    ]);
    let s = spec("llama-bin", Archive::Zip, vec![(Some("**"), "llm/bin")]);
    let models = d.path().join("models");
    let ra = app_lib::components::place_files(&zip, &s, &models).unwrap();
    assert_eq!(ra.len(), 3, "{ra:?}");
    for f in ["llama-server.exe", "ggml.dll", "cudart64_13.dll"] {
        assert!(models.join("llm/bin").join(f).is_file(), "thiếu {f}");
    }
}

/// Tên entry đi THẲNG từ archive vào đường dẫn đích, không qua một `from` do
/// người viết spec kiểm soát — nên đây là chỗ duy nhất trong hệ component mà
/// kẻ dựng archive tự chọn được đường dẫn ghi ra.
#[test]
fn sao_ca_goi_chan_duong_dan_doc() {
    let d = tempfile::tempdir().unwrap();
    let models = d.path().join("models");

    for (ten, entry) in [
        ("leo", "../../evil.dll"),
        ("tuyet_doi", "/etc/evil.dll"),
        ("o_dia", "C:/Windows/evil.dll"),
    ] {
        let zip = d.path().join(format!("{ten}.zip"));
        make_zip(&zip, &[(entry, b"X")]);
        let s = spec("doc", Archive::Zip, vec![(Some("**"), "llm/bin")]);
        let r = app_lib::components::place_files(&zip, &s, &models);
        assert!(r.is_err(), "entry '{entry}' phải bị chặn");
    }
    assert!(!d.path().join("evil.dll").exists());
}

/// Archive không có entry nào ⇒ lỗi to tiếng. Nếu im lặng báo thành công thì
/// `.state` ghi "đã cài" và app chết lúc chạy, xa chỗ gây lỗi.
#[test]
fn sao_ca_goi_rong_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let zip = d.path().join("rong.zip");
    make_zip(&zip, &[]);
    let s = spec("rong", Archive::Zip, vec![(Some("**"), "llm/bin")]);
    let r = app_lib::components::place_files(&zip, &s, &d.path().join("models"));
    assert!(r.is_err(), "gói rỗng phải báo lỗi");
}

/// `target_for` dùng chung cho MỌI component. Sửa hỏng là ffmpeg và VieNeu
/// chết theo, mà lỗi lại hiện ở chỗ khác hẳn.
#[test]
fn cac_dang_from_cu_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    let models = d.path().join("models");

    // Dạng file lẻ, đúng kiểu ffmpeg đang khai.
    let z1 = d.path().join("le.zip");
    make_zip(&z1, &[("build/bin/ffmpeg.exe", b"F"), ("build/bin/bo_qua.txt", b"X")]);
    let s1 = spec("le", Archive::Zip, vec![(Some("build/bin/ffmpeg.exe"), "ffmpeg/ffmpeg.exe")]);
    let r1 = app_lib::components::place_files(&z1, &s1, &models).unwrap();
    assert_eq!(r1, vec!["ffmpeg/ffmpeg.exe".to_string()]);
    assert!(!models.join("ffmpeg/bo_qua.txt").exists(), "file không khai không được chép");

    // Dạng cây con.
    let z2 = d.path().join("cay.zip");
    make_zip(&z2, &[("pkg/a.txt", b"A"), ("pkg/sub/b.txt", b"B"), ("ngoai.txt", b"N")]);
    let s2 = spec("cay", Archive::Zip, vec![(Some("pkg/"), "dich")]);
    let mut r2 = app_lib::components::place_files(&z2, &s2, &models).unwrap();
    r2.sort();
    assert_eq!(r2, vec!["dich/a.txt".to_string(), "dich/sub/b.txt".to_string()]);
    assert!(!models.join("dich/ngoai.txt").exists());
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test components_test`
Expected: FAIL — `sao_ca_goi_lay_du_moi_file` trả 0 file vì `target_for` chưa biết `"**"`.

- [ ] **Step 3: Thêm nhánh vào `target_for`**

Trong `src-tauri/src/components.rs`, sửa `target_for` (dòng 156-173). Nhánh `"**"` phải đứng TRƯỚC hai nhánh kia — nó không kết bằng `/` nên sẽ rơi xuống so sánh bằng và không bao giờ khớp:

```rust
/// Đích tương ứng cho một entry trong archive, hoặc `None` nếu entry không được khai báo.
/// `from = "**"`  ⇒ trọn gói: đích = `to` + nguyên tên entry.
/// `from` kết bằng '/' ⇒ cây con: đích = `to` + phần đuôi sau tiền tố.
fn target_for(files: &[FileMap], entry: &str) -> Option<String> {
    for f in files {
        let Some(from) = f.from.as_deref() else { continue };
        if from == "**" {
            // Tên entry vào thẳng đường dẫn đích mà không qua chuỗi `from` do
            // người viết spec kiểm soát — `safe_join` trong `write_member` là
            // thứ DUY NHẤT chặn `../` và đường dẫn tuyệt đối ở đây.
            return Some(format!("{}/{}", f.to.trim_end_matches('/'), entry));
        }
        if let Some(prefix) = from.strip_suffix('/') {
            let prefix = format!("{prefix}/");
            if let Some(rest) = entry.strip_prefix(&prefix) {
                if !rest.is_empty() {
                    return Some(format!("{}/{}", f.to.trim_end_matches('/'), rest));
                }
            }
        } else if entry == from {
            return Some(f.to.clone());
        }
    }
    None
}
```

- [ ] **Step 4: Thêm luật kiểm cho `"**"` ở cuối `place_files`**

Vòng kiểm cuối `place_files` (dòng ~256-270) hiện chỉ biết hai dạng. Sửa thành:

```rust
    // Mọi `from` là file lẻ đều phải tìm thấy; cây con và trọn gói phải chép
    // được ít nhất 1 file.
    for f in &spec.files {
        let Some(from) = f.from.as_deref() else { continue };
        let duoi_to = format!("{}/", f.to.trim_end_matches('/'));
        let found = if from == "**" || from.ends_with('/') {
            written.iter().any(|w| w.starts_with(&duoi_to))
        } else {
            written.iter().any(|w| w == &f.to)
        };
        if !found {
            return Err(PipelineError::Io(format!(
                "gói '{}' thiếu '{from}' — bố cục archive đã đổi, cập nhật components.json",
                spec.id
            )));
        }
    }
```

- [ ] **Step 5: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test components_test`
Expected: PASS, cả 4 test mới và toàn bộ test cũ của file.

- [ ] **Step 6: Chạy toàn bộ suite**

Run: `cargo test --manifest-path src-tauri/Cargo.toml`
Expected: PASS. Các `e2e_*` vẫn `#[ignore]` như trước.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/components.rs src-tauri/tests/components_test.rs
git commit -m "feat(components): khai from=\"**\" để lấy trọn archive"
```

---

### Task 2: Ba component mới

**Files:**
- Modify: `src-tauri/components.json`
- Test: `src-tauri/tests/components_test.rs`

**Interfaces:**
- Consumes: `from: "**"` (Task 1).
- Produces: sau khi cài, có `models/llm/bin/llama-server.exe` và `models/llm/gguf/Qwen3-14B-Q5_K_M.gguf`.

- [ ] **Step 1: Viết test thất bại**

`components_test.rs` đã có `manifest_liet_ke_du_moi_artifact_va_dung_hinh_dang` và `manifest_installs_to_paths_m1_expects`. Nối thêm:

```rust
/// Ba component của M9 phải có mặt, ghim sha256, và đổ vào đúng chỗ mà
/// `LlamaServer` sẽ đi tìm.
#[test]
fn manifest_co_du_bo_llm_tren_may() {
    let ss = app_lib::components::specs().unwrap();
    let lay = |id: &str| ss.iter().find(|s| s.id == id)
        .unwrap_or_else(|| panic!("thiếu component '{id}'"));

    for id in ["llama-bin", "llama-cudart", "qwen3-14b"] {
        let s = lay(id);
        assert!(!s.sha256.trim().is_empty(), "'{id}' chưa ghim sha256");
        assert!(s.size > 0, "'{id}' chưa ghi size");
    }

    // Hai gói zip lấy trọn, cùng đổ vào một thư mục: llama-server.exe cần các
    // DLL của cudart nằm CẠNH nó thì Windows mới nạp được.
    for id in ["llama-bin", "llama-cudart"] {
        let s = lay(id);
        assert_eq!(s.files.len(), 1, "'{id}' chỉ cần một khai trọn gói");
        assert_eq!(s.files[0].from.as_deref(), Some("**"), "'{id}' phải khai from=\"**\"");
        assert_eq!(s.files[0].to, "llm/bin", "'{id}' phải đổ vào llm/bin");
    }

    let g = lay("qwen3-14b");
    assert_eq!(g.files[0].to, "llm/gguf/Qwen3-14B-Q5_K_M.gguf");
}

/// Bản CUDA phải là 13.4. RTX 50-series là Blackwell (sm_120); bản 12.4 không
/// biên dịch cho kiến trúc này và server sẽ không chạy nổi.
#[test]
fn llama_dung_ban_cuda_13() {
    let ss = app_lib::components::specs().unwrap();
    for id in ["llama-bin", "llama-cudart"] {
        let s = ss.iter().find(|s| s.id == id).unwrap();
        assert!(s.url.contains("cuda-13"), "'{id}' phải là bản CUDA 13.x, đang là: {}", s.url);
        assert!(!s.url.contains("cuda-12"), "'{id}' không được dùng bản CUDA 12.x");
    }
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test components_test`
Expected: FAIL — `thiếu component 'llama-bin'`.

- [ ] **Step 3: Thêm ba mục vào `components.json`**

Đặt `sha256` là chuỗi rỗng và `size` là `0` trước, Step 4 sẽ điền:

```json
  {
    "id": "llama-bin",
    "url": "https://github.com/ggml-org/llama.cpp/releases/download/b11256/llama-b11256-bin-win-cuda-13.4-x64.zip",
    "sha256": "",
    "size": 0,
    "archive": "zip",
    "files": [{ "from": "**", "to": "llm/bin" }]
  },
  {
    "id": "llama-cudart",
    "url": "https://github.com/ggml-org/llama.cpp/releases/download/b11256/cudart-llama-bin-win-cuda-13.4-x64.zip",
    "sha256": "",
    "size": 0,
    "archive": "zip",
    "files": [{ "from": "**", "to": "llm/bin" }]
  },
  {
    "id": "qwen3-14b",
    "url": "https://huggingface.co/Qwen/Qwen3-14B-GGUF/resolve/main/Qwen3-14B-Q5_K_M.gguf",
    "sha256": "",
    "size": 0,
    "archive": "raw",
    "files": [{ "from": null, "to": "llm/gguf/Qwen3-14B-Q5_K_M.gguf" }]
  }
```

Hai gói zip cùng đổ vào `llm/bin`: `llama-server.exe` cần `cudart64_13.dll`, `cublas64_13.dll`, `cublasLt64_13.dll` nằm **cạnh** nó thì Windows mới nạp được.

- [ ] **Step 4: Ghim sha256 và size thật**

Run: `cd src-tauri && cargo run --bin pin_components`

Công cụ tải từng artifact, in sha256 + size thật. Chép ba giá trị vào `components.json`. Riêng `qwen3-14b` là 9,8 GB nên bước này mất vài phút — chạy foreground và chờ.

Kích thước đã biết để đối chiếu: `qwen3-14b` phải ra đúng **10 514 569 568** byte. Lệch là tải hỏng, đừng ghim.

- [ ] **Step 5: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test components_test`
Expected: PASS.

- [ ] **Step 6: Cài thật một lần và kiểm bằng mắt**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test e2e_components_test -- --ignored --nocapture`

Hoặc nếu test đó không cài được bộ mới, mở app và bấm "Tải bộ công cụ". Sau đó khẳng định:

```bash
ls "$APPDATA/dichvideo-local/models/llm/bin/llama-server.exe"
ls "$APPDATA/dichvideo-local/models/llm/gguf/Qwen3-14B-Q5_K_M.gguf"
"$APPDATA/dichvideo-local/models/llm/bin/llama-server.exe" --list-devices
```

Lệnh cuối phải in ra `CUDA0: NVIDIA GeForce RTX 5060 Ti`. Nếu nó không thấy CUDA thì hai gói chưa nằm chung thư mục.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/components.json src-tauri/tests/components_test.rs
git commit -m "feat(components): thêm llama.cpp CUDA 13.4 và Qwen3-14B vào bộ công cụ"
```

---

### Task 3: `LlamaServer` — vòng đời tiến trình

**Files:**
- Create: `src-tauri/src/translate/llama_server.rs`
- Modify: `src-tauri/src/translate/mod.rs` (thêm `pub mod llama_server;`)
- Test: `src-tauri/tests/llama_server_test.rs`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `app_lib::translate::llama_server::LlamaServer` với `pub fn khoi_dong(exe: &Path, gguf: &Path) -> Result<LlamaServer, PipelineError>`, `pub fn base_url(&self) -> String` (dạng `http://127.0.0.1:<port>/v1`), và `impl Drop`.
  - `pub fn cho_san_sang(base_url: &str, han: Duration) -> Result<(), PipelineError>` — hàm tự do, tách khỏi struct để test được bằng server giả không cần model.
  - `pub fn cong_trong() -> Result<u16, PipelineError>`.

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/llama_server_test.rs`. Dùng `httpmock` đã có sẵn trong dev-dependencies:

```rust
use app_lib::translate::llama_server::{cho_san_sang, cong_trong, LlamaServer};
use std::time::Duration;

/// `/health` trả 200 NGAY khi tiến trình lên, nhưng lúc đó model còn đang nạp
/// và lời gọi dịch thật ăn 503. Đo thật khi dựng máy đo M9. Chờ theo `/health`
/// là chờ hụt, và biểu hiện thành một lỗi 503 khó hiểu giữa lúc dịch.
#[test]
fn san_sang_tinh_theo_loi_goi_that_khong_theo_health() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| { w.path("/health"); t.status(200).body("{}"); });
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(503).body("loading model");
    });
    let r = cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_millis(600));
    assert!(r.is_err(), "503 ở /v1/chat/completions thì KHÔNG được coi là sẵn sàng");
}

#[test]
fn san_sang_khi_loi_goi_that_tra_200() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(200).body(r#"{"choices":[{"message":{"content":"x"}}]}"#);
    });
    cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_secs(5)).unwrap();
}

/// Server lên nhưng không bao giờ nạp xong ⇒ phải hết giờ và báo rõ, không
/// treo app vô hạn.
#[test]
fn khong_bao_gio_san_sang_thi_het_gio() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(503);
    });
    let t0 = std::time::Instant::now();
    let r = cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_millis(800));
    assert!(r.is_err());
    assert!(t0.elapsed() < Duration::from_secs(5), "phải bỏ cuộc gần đúng hạn, không treo");
    let msg = format!("{}", r.unwrap_err());
    assert!(msg.contains("nạp") || msg.contains("sẵn sàng"), "thông báo phải nói rõ: {msg}");
}

/// Đóng cứng một cổng là rủi ro vì cổng có thể đang bận.
#[test]
fn cong_trong_khac_nhau_va_bind_duoc() {
    let a = cong_trong().unwrap();
    let b = cong_trong().unwrap();
    assert_ne!(a, 0);
    assert_ne!(b, 0);
    std::net::TcpListener::bind(("127.0.0.1", a)).expect("cổng phải bind được");
}

/// Thiếu engine hoặc thiếu model ⇒ lỗi phải chỉ thẳng người dùng đi tải bộ công
/// cụ, không phải một lỗi io trần trụi mà họ không biết nhìn đâu.
///
/// LƯU Ý: test này KHÔNG chạm tới nhánh đọc stderr — `khoi_dong` trả về trước
/// khi spawn. Nhánh stderr chỉ chạy khi một `llama-server.exe` CÓ THẬT chết lúc
/// nạp (thiếu DLL, driver cũ, GGUF hỏng), nên nó nằm ngoài tầm test thuần; xem
/// ghi chú cuối kế hoạch.
#[test]
fn thieu_engine_hoac_model_thi_chi_di_tai_bo_cong_cu() {
    let d = tempfile::tempdir().unwrap();

    // Thiếu exe.
    let gguf = d.path().join("k.gguf");
    std::fs::write(&gguf, b"x").unwrap();
    let r = LlamaServer::khoi_dong(&d.path().join("khong-co.exe"), &gguf);
    let msg = format!("{}", r.err().expect("thiếu exe phải lỗi"));
    assert!(msg.contains("bộ công cụ"), "phải chỉ đi tải, đang là: {msg}");

    // Thiếu model.
    let exe = d.path().join("co.exe");
    std::fs::write(&exe, b"x").unwrap();
    let r2 = LlamaServer::khoi_dong(&exe, &d.path().join("khong-co.gguf"));
    let msg2 = format!("{}", r2.err().expect("thiếu model phải lỗi"));
    assert!(msg2.contains("bộ công cụ"), "phải chỉ đi tải, đang là: {msg2}");
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test llama_server_test`
Expected: FAIL — không có module `llama_server`.

- [ ] **Step 3: Viết `llama_server.rs`**

```rust
//! Vòng đời tiến trình `llama-server.exe`.
//!
//! Đây là thứ ĐẦU TIÊN trong app sống lâu hơn một lệnh. Mọi engine khác
//! (ffmpeg, piper, python của VieNeu) đều chạy-rồi-tắt trong một lời gọi, nên
//! không có khuôn sẵn để chép — phần lớn rủi ro của M9 nằm ở file này chứ không
//! ở chất lượng dịch.

use crate::error::PipelineError;
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

fn perr(msg: impl Into<String>) -> PipelineError {
    PipelineError::ProviderError {
        provider: "llm_tren_may".into(),
        status: None,
        msg: msg.into(),
    }
}

/// Xin một cổng trống từ hệ điều hành: bind cổng 0, đọc cổng thật, rồi nhả ra.
///
/// Có khe hở tranh chấp giữa lúc nhả và lúc `llama-server` bind, nhưng nhỏ hơn
/// nhiều so với đóng cứng một cổng có thể đang bận — và `cho_san_sang` sẽ bắt
/// được nếu hỏng.
pub fn cong_trong() -> Result<u16, PipelineError> {
    let l = std::net::TcpListener::bind(("127.0.0.1", 0))
        .map_err(|e| perr(format!("không xin được cổng trống: {e}")))?;
    let p = l.local_addr().map_err(|e| perr(e.to_string()))?.port();
    drop(l);
    Ok(p)
}

/// Chờ tới khi server dịch được THẬT.
///
/// KHÔNG dùng `/health`: nó trả 200 ngay khi tiến trình lên, trong khi model
/// còn đang nạp và `POST /v1/chat/completions` lúc đó trả 503. Đo thật khi dựng
/// máy đo M9. Chờ theo `/health` là chờ hụt và lỗi 503 rơi vào giữa lô dịch.
pub fn cho_san_sang(base_url: &str, han: Duration) -> Result<(), PipelineError> {
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let than = serde_json::json!({
        "messages": [{"role": "user", "content": "x"}],
        "max_tokens": 1
    });
    let khach = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| perr(e.to_string()))?;

    let het = Instant::now() + han;
    let mut cuoi = String::from("chưa gọi được lần nào");
    while Instant::now() < het {
        match khach.post(&url).json(&than).send() {
            Ok(r) if r.status().is_success() => return Ok(()),
            Ok(r) => cuoi = format!("HTTP {}", r.status().as_u16()),
            Err(e) => cuoi = e.to_string(),
        }
        std::thread::sleep(Duration::from_millis(300));
    }
    Err(perr(format!(
        "model chưa nạp xong sau {} giây, chưa sẵn sàng dịch (lần cuối: {cuoi})",
        han.as_secs()
    )))
}

pub struct LlamaServer {
    child: Child,
    port: u16,
}

impl LlamaServer {
    /// Tham số đã ĐO THẬT trên RTX 5060 Ti 16GB: 13,5/16,3 GB VRAM, 34,3 giây
    /// mỗi lô 40 cue. Đổi bất kỳ cờ nào — nhất là `-ngl` hay `-c` — đều phải đo
    /// lại VRAM, vì tràn sang RAM làm tốc độ sụp hàng chục lần.
    pub fn khoi_dong(exe: &Path, gguf: &Path) -> Result<LlamaServer, PipelineError> {
        if !exe.is_file() {
            return Err(perr(format!(
                "chưa có llama-server ở {} — tải bộ công cụ trước",
                exe.display()
            )));
        }
        if !gguf.is_file() {
            return Err(perr(format!(
                "chưa có model llm ở {} — tải bộ công cụ trước",
                gguf.display()
            )));
        }
        let port = cong_trong()?;
        let mut cmd = Command::new(exe);
        cmd.arg("-m").arg(gguf)
            .args(["-ngl", "99", "-c", "16384", "-fa", "on"])
            .arg("--jinja")
            .args(["--reasoning-budget", "0"])
            // Chỉ nghe loopback: không có lý do gì để model dịch của người dùng
            // mở ra mạng LAN.
            .args(["--host", "127.0.0.1"])
            .args(["--port", &port.to_string()])
            .stdout(Stdio::null())
            .stderr(Stdio::piped());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            // CREATE_NO_WINDOW — thiếu nó là mỗi lần dịch một cửa sổ đen nháy lên.
            cmd.creation_flags(0x08000000);
        }
        let child = cmd.spawn().map_err(|e| {
            perr(format!("không chạy được llama-server ({}): {e}", exe.display()))
        })?;
        Ok(LlamaServer { child, port })
    }

    pub fn base_url(&self) -> String {
        format!("http://127.0.0.1:{}/v1", self.port)
    }

    /// Đọc stderr của tiến trình đã chết, để thông báo lỗi nói được *vì sao*
    /// thay vì chỉ "không sẵn sàng".
    pub fn ly_do_chet(&mut self) -> String {
        use std::io::Read;
        let mut s = String::new();
        if let Some(mut e) = self.child.stderr.take() {
            let _ = e.read_to_string(&mut s);
        }
        s.lines().rev().take(5).collect::<Vec<_>>().join(" | ")
    }
}

impl Drop for LlamaServer {
    /// Giết server khi provider bị thả — tức ngay sau khi dịch xong, hoặc khi
    /// một lỗi giữa chừng làm rớt biến. Đây là thứ trả lại 13,5 GB VRAM.
    ///
    /// GIỚI HẠN ĐÃ BIẾT: `Drop` không chạy khi tiến trình app bị kết thúc cứng;
    /// khi đó `llama-server` sống tiếp và giữ VRAM cho tới khi người dùng tự
    /// tắt. Chặn triệt để cần Job Object của Windows — xem spec §6.1, cố ý
    /// không làm trong M9.
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
```

Thêm vào `src-tauri/src/translate/mod.rs`, cạnh hai `pub mod` sẵn có:

```rust
pub mod llama_server;
```

- [ ] **Step 4: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test llama_server_test`
Expected: PASS, cả 5 test.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/translate/llama_server.rs src-tauri/src/translate/mod.rs src-tauri/tests/llama_server_test.rs
git commit -m "feat(dich): LlamaServer quản vòng đời llama-server.exe"
```

---

### Task 4: Nhà cung cấp `llm_tren_may`

**Files:**
- Create: `src-tauri/src/translate/llm_tren_may.rs`
- Modify: `src-tauri/src/translate/mod.rs` (`pub mod`; `make_provider` dòng 126-153)
- Modify: `src-tauri/src/commands.rs:97` (call site)
- Modify: `src-tauri/tests/e2e_cue_edit_test.rs:45`, `src-tauri/tests/e2e_export_test.rs:68`, `src-tauri/tests/e2e_tts_test.rs:36` (call site)
- Test: `src-tauri/tests/llm_tren_may_test.rs`

**Interfaces:**
- Consumes: `LlamaServer::khoi_dong`, `LlamaServer::base_url`, `LlamaServer::ly_do_chet`, `cho_san_sang` (Task 3); `openai_compat::OpenAiCompat` sẵn có.
- Produces:
  - `app_lib::translate::llm_tren_may::LlmTrenMay` — `impl TranslateProvider`, `id() == "llm_tren_may"`.
  - Chữ ký mới: `translate::make_provider(id: &str, cfg: &TranslateConfig, models: &Path) -> Result<Box<dyn TranslateProvider>, PipelineError>`.

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/llm_tren_may_test.rs`:

```rust
use app_lib::translate::TranslateProvider;

/// Provider phải SỞ HỮU server: `Box<dyn TranslateProvider>` bị thả lúc dịch
/// xong là `Drop` của LlamaServer giết tiến trình và trả lại VRAM. Nếu server
/// nằm ngoài, `run_translate_stage` và `commands.rs` đều phải sửa để tắt nó —
/// và ai đó sẽ quên ở một trong hai đường lỗi.
#[test]
fn lo_khong_tim_thay_engine_thi_bao_ro_phai_tai_bo_cong_cu() {
    let d = tempfile::tempdir().unwrap();
    let cfg = app_lib::config::TranslateConfig::default();
    let r = app_lib::translate::make_provider("llm_tren_may", &cfg, d.path());
    assert!(r.is_err());
    let msg = format!("{}", r.unwrap_err());
    assert!(msg.contains("bộ công cụ"), "phải chỉ người dùng đi tải, đang là: {msg}");
}

#[test]
fn id_provider_dung_ten() {
    // Không dựng được provider thật mà không có model 9,8 GB, nên chỉ chốt
    // rằng tên id khớp với thứ config và giao diện dùng.
    assert_eq!(app_lib::translate::llm_tren_may::ID, "llm_tren_may");
}

/// Các provider cũ không được đổi hành vi khi thêm tham số `models`.
#[test]
fn provider_cu_van_dung_duoc() {
    let d = tempfile::tempdir().unwrap();
    let cfg = app_lib::config::TranslateConfig::default();
    let p = app_lib::translate::make_provider("google_free", &cfg, d.path()).unwrap();
    assert_eq!(p.id(), "google_free");

    let mut c2 = cfg.clone();
    c2.openai.api_key = "k".into();
    c2.openai.base_url = "http://x/v1".into();
    c2.openai.model = "m".into();
    let p2 = app_lib::translate::make_provider("openai_compat", &c2, d.path()).unwrap();
    assert_eq!(p2.id(), "openai_compat");
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test llm_tren_may_test`
Expected: FAIL — `make_provider` nhận 2 tham số, đưa vào 3.

- [ ] **Step 3: Viết `llm_tren_may.rs`**

```rust
//! Nhà cung cấp dịch chạy trên máy: `llama-server` + Qwen3-14B.
//!
//! Provider SỞ HỮU server làm một trường. Nhờ vậy `Box<dyn TranslateProvider>`
//! bị thả lúc dịch xong là `Drop` của `LlamaServer` giết tiến trình và trả lại
//! 13,5 GB VRAM — không phải sửa `run_translate_stage` hay `commands.rs`, và
//! không có đường lỗi nào quên tắt server.

use super::llama_server::{cho_san_sang, LlamaServer};
use super::openai_compat::OpenAiCompat;
use super::TranslateProvider;
use crate::error::PipelineError;
use std::path::Path;
use std::time::Duration;

pub const ID: &str = "llm_tren_may";

/// Nạp 9,8 GB lên VRAM mất khoảng 15 giây trên máy đích. 180 giây là rộng rãi
/// cho cả trường hợp đĩa chậm hoặc VRAM đang bị việc khác chiếm, mà vẫn không
/// treo app cả buổi nếu server hỏng hẳn.
const CHO_NAP: Duration = Duration::from_secs(180);

pub struct LlmTrenMay {
    // Thứ tự khai báo có ý nghĩa: Rust thả trường theo đúng thứ tự này, nên
    // `inner` (chỉ là cấu hình, không giữ tài nguyên) đi trước, `server` sau.
    inner: OpenAiCompat,
    #[allow(dead_code)]
    server: LlamaServer,
}

impl LlmTrenMay {
    pub fn khoi_dong(models: &Path, context: String) -> Result<LlmTrenMay, PipelineError> {
        let exe = models.join("llm").join("bin").join("llama-server.exe");
        let gguf = models.join("llm").join("gguf").join("Qwen3-14B-Q5_K_M.gguf");
        let mut server = LlamaServer::khoi_dong(&exe, &gguf)?;
        let base = server.base_url();
        if let Err(e) = cho_san_sang(&base, CHO_NAP) {
            // Đọc stderr của tiến trình để nói được *vì sao* — thiếu DLL, driver
            // cũ, GGUF hỏng đều hiện ở đây, còn nếu không đọc thì người dùng chỉ
            // thấy "chưa sẵn sàng" và không biết nhìn đâu.
            let ly_do = server.ly_do_chet();
            return Err(PipelineError::ProviderError {
                provider: ID.into(),
                status: None,
                msg: if ly_do.trim().is_empty() {
                    format!("{e}")
                } else {
                    format!("{e} — llama-server nói: {ly_do}")
                },
            });
        }
        Ok(LlmTrenMay {
            inner: OpenAiCompat {
                base_url: base,
                // llama-server không kiểm token; gửi rỗng cho khỏi giả vờ có key.
                api_key: String::new(),
                // Chỉ nạp đúng một model nên nó bỏ qua trường này.
                model: "local".into(),
                context,
            },
            server,
        })
    }
}

impl TranslateProvider for LlmTrenMay {
    fn id(&self) -> &'static str {
        ID
    }
    fn batch_size(&self) -> usize {
        self.inner.batch_size()
    }
    fn translate_batch(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
    ) -> Result<Vec<String>, PipelineError> {
        self.inner.translate_batch(texts, src, tgt)
    }
}
```

- [ ] **Step 4: Sửa `make_provider`**

Trong `src-tauri/src/translate/mod.rs`, thêm `pub mod llm_tren_may;` rồi đổi chữ ký và thêm nhánh:

```rust
pub fn make_provider(
    id: &str,
    cfg: &TranslateConfig,
    models: &std::path::Path,
) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    match id {
        "google_free" => Ok(Box::new(google_free::GoogleFree::new())),
        llm_tren_may::ID => Ok(Box::new(llm_tren_may::LlmTrenMay::khoi_dong(
            models,
            cfg.openai.context.clone(),
        )?)),
        "openai_compat" => {
```

phần `openai_compat` và nhánh `_` giữ nguyên không đổi.

Ngữ cảnh dịch dùng lại `cfg.openai.context` chứ không thêm trường config mới: nó là lựa chọn "thể loại video", không phải thuộc tính của nhà cung cấp, và tách ra sẽ có hai chỗ để lệch nhau.

- [ ] **Step 5: Sửa bốn call site**

- `src-tauri/src/commands.rs:97` → `crate::translate::make_provider(&provider, &cfg.translate, &models_dir())`
- `src-tauri/tests/e2e_cue_edit_test.rs:45`, `e2e_export_test.rs:68`, `e2e_tts_test.rs:36` → thêm tham số thứ ba. Ba test này đều dùng `"google_free"` nên truyền `&m` (biến models đã có sẵn trong cả ba), hoặc `std::path::Path::new(".")` nếu chưa có.

- [ ] **Step 6: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test llm_tren_may_test`
Expected: PASS.

Run: `cargo test --manifest-path src-tauri/Cargo.toml`
Expected: PASS, không còn lỗi biên dịch ở call site nào.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/translate/ src-tauri/src/commands.rs src-tauri/tests/
git commit -m "feat(dich): nhà cung cấp llm_tren_may, server chết theo provider"
```

---

### Task 5: Giao diện

**Files:**
- Modify: `src/App.tsx` (ô chọn nhà cung cấp, quanh dòng 700)
- Test: `src-tauri/tests/hang_so_ui_test.rs`

**Interfaces:**
- Consumes: `llm_tren_may::ID` (Task 4).
- Produces: người dùng chọn được "LLM trên máy" ở Bước 3.

- [ ] **Step 1: Viết test thất bại**

Nối vào `src-tauri/tests/hang_so_ui_test.rs`:

```rust
/// Mã nhà cung cấp trên giao diện phải khớp Rust; lệch là người dùng chọn xong
/// và nhận "provider chưa hỗ trợ".
#[test]
fn ui_khai_dung_ma_llm_tren_may() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let ma = app_lib::translate::llm_tren_may::ID;
    assert!(
        tsx.contains(&format!("value=\"{ma}\"")),
        "App.tsx phải có <option value=\"{ma}\">"
    );
}

/// Người dùng phải biết lần dịch đầu chờ lâu hơn vì nạp model, nếu không họ
/// tưởng app treo và bấm lại.
#[test]
fn ui_noi_ro_lan_dau_phai_nap_model() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains("nạp model"), "thiếu ghi chú lần đầu phải nạp model");
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: FAIL.

- [ ] **Step 3: Thêm lựa chọn vào giao diện**

Trong `src/App.tsx`, ô `<select value={provider} …>` ở Bước 3, thêm mục thứ ba:

```tsx
<option value="llm_tren_may">LLM trên máy (không cần mạng)</option>
```

Và ngay dưới hàng đó, một ghi chú chỉ hiện khi chọn nó:

```tsx
{provider === "llm_tren_may" && (
  <p className="muted">
    Dịch chạy hẳn trên GPU của máy, không gửi gì ra mạng. Đo thật trên máy này:
    khoảng 34 giây mỗi 40 câu, chiếm 13,5 GB VRAM. Lần dịch đầu chờ thêm khoảng
    15 giây để nạp model; xong là tự tắt để trả lại VRAM.
  </p>
)}
```

- [ ] **Step 4: Chạy test và build**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src-tauri/tests/hang_so_ui_test.rs
git commit -m "feat(ui): chọn LLM trên máy ở Bước 3, kèm số đo thật"
```

---

### Task 6: Test đầu-cuối với model thật

**Files:**
- Create: `src-tauri/tests/e2e_llm_tren_may_test.rs`

**Interfaces:**
- Consumes: mọi thứ từ Task 1-5.
- Produces: không có; đây là test cuối.

- [ ] **Step 1: Viết test**

Test này cần model 9,8 GB nên phải gắn cổng môi trường, và **phải hỏng to tiếng khi cổng không bật** chứ không lặng lẽ báo xanh — đúng khuôn `e2e_export_test.rs` đang dùng cho `DVL_E2E_WATERMARK`. Đọc file đó trước để chép đúng khuôn.

```rust
//! Chạy nhánh dịch trên máy qua llama-server THẬT.
//!
//! Bật bằng: DVL_E2E_LLM=1 cargo test --test e2e_llm_tren_may_test -- --ignored --nocapture
//!
//! Cần bộ công cụ đã cài (llama-server.exe + Qwen3-14B-Q5_K_M.gguf) và một GPU
//! đủ 14 GB VRAM trống.

use app_lib::translate::TranslateProvider;

fn bat() {
    assert_eq!(
        std::env::var("DVL_E2E_LLM").unwrap_or_default(),
        "1",
        "đặt DVL_E2E_LLM=1 để chạy test này"
    );
}

#[test]
#[ignore]
fn dich_that_40_cue_tra_du_va_khong_rong() {
    bat();
    let models = app_lib::config::models_dir();
    let cfg = app_lib::config::load_config().translate;
    let p = app_lib::translate::make_provider("llm_tren_may", &cfg, &models)
        .expect("khởi động được llm_tren_may");

    // 40 cue tiếng Trung, đúng cỡ lô mà openai_compat gửi.
    let cau: Vec<String> = (0..40).map(|i| format!("这是第{i}句话。")).collect();
    let texts: Vec<&str> = cau.iter().map(|s| s.as_str()).collect();

    let t0 = std::time::Instant::now();
    let ra = p.translate_batch(&texts, "zh", "vi").expect("dịch được");
    let giay = t0.elapsed().as_secs_f32();

    assert_eq!(ra.len(), 40, "phải trả đúng 40 item");
    for (i, s) in ra.iter().enumerate() {
        assert!(!s.trim().is_empty(), "item {i} rỗng");
    }
    println!("40 cue trong {giay:.1}s");
}

/// Server phải chết khi provider bị thả — đây là thứ trả lại 13,5 GB VRAM.
#[test]
#[ignore]
fn tha_provider_thi_server_chet() {
    bat();
    let models = app_lib::config::models_dir();
    let cfg = app_lib::config::load_config().translate;
    {
        let _p = app_lib::translate::make_provider("llm_tren_may", &cfg, &models).unwrap();
    }
    std::thread::sleep(std::time::Duration::from_secs(2));
    let ra = std::process::Command::new("tasklist")
        .args(["/FI", "IMAGENAME eq llama-server.exe"])
        .output()
        .expect("chạy được tasklist");
    let s = String::from_utf8_lossy(&ra.stdout);
    assert!(
        !s.contains("llama-server.exe"),
        "llama-server còn sống sau khi provider bị thả:\n{s}"
    );
}
```

- [ ] **Step 2: Chạy test thật**

Run:
```bash
DVL_E2E_LLM=1 cargo test --manifest-path src-tauri/Cargo.toml --test e2e_llm_tren_may_test -- --ignored --nocapture
```
Expected: PASS, và in ra thời gian gần 34 giây.

Nếu nó báo `0 tests run` thì cổng `--ignored` chưa đúng — sửa cho tới khi test **thật sự chạy**, đừng coi 0 test là xanh.

- [ ] **Step 3: Chứng minh test có răng**

Tạm sửa `assert_eq!(ra.len(), 40)` thành `41`, chạy lại, khẳng định nó ĐỎ, rồi hoàn lại và chạy lại cho xanh. Ghi cả hai kết quả vào báo cáo.

- [ ] **Step 4: Chạy toàn bộ suite**

Run: `cargo test --manifest-path src-tauri/Cargo.toml`
Expected: PASS. Hai test mới nằm trong nhóm `#[ignore]` nên không chạy, đúng như các `e2e_*` khác.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/tests/e2e_llm_tren_may_test.rs
git commit -m "test(e2e): dịch thật qua llama-server, và server chết theo provider"
```

---

## Ghi chú đã chốt trong lúc lập kế hoạch

- **Provider sở hữu server** là quyết định trung tâm. Nó khiến `run_translate_stage` và `commands.rs` không phải sửa gì cho việc tắt server, và không có đường lỗi nào quên tắt. Đổi lại, `make_provider` giờ chặn ~15 giây khi dựng provider local — chấp nhận được vì nó đã nằm trong `spawn_blocking` (`commands.rs:95`).
- **Thời gian nạp nằm trong `cho_san_sang`, không trong `CHO_LLM`.** Nhờ vậy `CHO_LLM` (240 giây) vẫn chỉ đo đúng một lô dịch, và một model nạp chậm không bị báo nhầm thành "dịch quá lâu".
- **`safe_join` đã chặn sẵn** `..`, `/` đầu và `:` (`components.rs:141-146`), nên nhánh `"**"` thừa hưởng bảo vệ đó. Test ở Task 1 là để ghim lại, không phải để thêm bảo vệ mới.
- **Không thêm trường config mới** cho ngữ cảnh dịch: dùng lại `cfg.openai.context` vì nó là lựa chọn thể loại video, không phải thuộc tính của nhà cung cấp.

## Hai chỗ kế hoạch này KHÔNG phủ được bằng test tự động

Ghi ra đây để người thực thi và người duyệt biết, thay vì tưởng đã kín.

- **Nhánh đọc stderr khi `llama-server` chết lúc nạp.** Nó chỉ chạy khi có một
  `llama-server.exe` thật chết giữa chừng (thiếu DLL, driver cũ, GGUF hỏng đúng
  kiểu). Không dựng được tình huống đó bằng test thuần, và test e2e thì dùng bộ
  file lành. Nhánh này vẫn đáng giữ vì nó là thứ duy nhất nói được *vì sao*, chỉ
  là chưa có gì chặn nó mục ruỗng. Kiểm bằng tay một lần: đổi tên
  `cudart64_13.dll` đi rồi thử dịch, phải thấy thông báo nêu được lý do.
- **`Drop` giết tiến trình** chỉ được kiểm trong `e2e_llm_tren_may_test`, mà test
  đó `#[ignore]` nên không chạy tự động. Nghĩa là một thay đổi làm hỏng `Drop`
  sẽ lọt qua suite thường, và hậu quả là 13,5 GB VRAM bị giữ lại sau mỗi lần
  dịch. Nếu muốn chặn tự động thì phải tách `LlamaServer` ra khỏi `llama-server`
  cụ thể (cho nhận đường dẫn exe bất kỳ) rồi test bằng một tiến trình giả sống
  lâu — cân nhắc nếu `Drop` từng hỏng thật.
