# M7 — Giọng lồng tiếng VieNeu-TTS: Kế hoạch thực hiện

> **Cho người thực thi:** BẮT BUỘC dùng sub-skill superpowers:subagent-driven-development để làm theo từng task. Các bước dùng cú pháp checkbox (`- [ ]`).

**Mục tiêu:** Thay engine lồng tiếng một-giọng (Piper) bằng VieNeu-TTS 25 giọng, 48 kHz, chạy hoàn toàn cục bộ qua một Python standalone đóng gói kèm.

**Kiến trúc:** VieNeu vào như một `TtsProvider` thứ hai bên cạnh `Piper`. Một cầu nối Python do ta viết đọc JSON theo dòng từ stdin và ghi WAV — cùng giao thức `--json-input` của Piper, nên `run_tts_stage` và `cues::preview` không phải đổi. Python và model tải qua hệ thống thành phần sẵn có, pin sha256.

**Công nghệ:** Rust (`app_lib`), Tauri v2, React, Python 3.11 standalone, ONNX Runtime, VieNeu-TTS v3 Turbo.

**Spec:** `docs/superpowers/specs/2026-09-26-dichvideo-local-m7-vieneu-tts-design.md`

## Ràng buộc toàn cục

- Mọi mã, bình luận, chuỗi hiển thị, commit message và báo cáo bằng **tiếng Việt**.
- `PipelineError` có đúng **6 biến thể**; không thêm biến thể mới.
- Chuỗi lỗi cho người dùng theo quy ước **gọi tên bước còn thiếu** (ví dụ: "Chưa có bản dịch — chạy Dịch trước").
- Test **không bao giờ** chạm `%APPDATA%` thật; dùng `tempfile::tempdir()`. Ngoại lệ duy nhất: test phụ thuộc engine, phải `#[ignore]` + cổng bằng biến môi trường + **tự dọn thư mục nó tạo**.
- Windows: mọi lần spawn tiến trình con phải có `CREATE_NO_WINDOW` (`creation_flags(0x08000000)`).
- **Không chạy bất cứ thứ gì ở nền.** Chạy foreground và chờ.
- Không thêm crate mới vào cây phụ thuộc. `flate2` đã có sẵn (qua `zip`) nên đưa nó thành phụ thuộc trực tiếp là hợp lệ.
- Mốc test trước khi bắt đầu: **258 passed / 0 failed / 10 ignored / 0 warning**.

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `src-tauri/src/components.rs` | thêm `Archive::TarGz` |
| `src-tauri/components.json` | thêm `python`, `vieneu-model`, `vieneu-speaker-encoder` |
| `src-tauri/vieneu-requirements.txt` | gói Python, pin `--hash=sha256:` |
| `src-tauri/src/pyenv.rs` | cài gói Python vào `<models>/vieneu/site-packages` |
| `src-tauri/python/vieneu_bridge.py` | cầu nối JSON-dòng |
| `src-tauri/src/tts/vieneu.rs` | `TtsProvider` cho VieNeu + danh sách 25 giọng |
| `src-tauri/src/tts/mod.rs` | `make_provider` nhận `"vieneu"` |
| `src-tauri/src/cues.rs` | chặn lệch tần số trong `preview` |
| `src-tauri/src/commands.rs` | lệnh `tts_voices` |
| `src/App.tsx` | chọn nhà cung cấp + chọn giọng |

---

### Task 1: `Archive::TarGz` và thành phần `python`

**Files:**
- Modify: `src-tauri/src/components.rs`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/components.json`
- Test: `src-tauri/tests/components_test.rs`

**Interfaces:**
- Produces: `Archive::TarGz` đọc được `.tar.gz`; thành phần id `"python"` đặt `python/python.exe`.

- [ ] **Bước 1: Viết test đỏ**

Thêm vào `src-tauri/tests/components_test.rs`:

```rust
#[test]
fn giai_nen_duoc_tar_gz() {
    use app_lib::components::{place_files, Archive, FileMap};
    // Dựng một .tar.gz ngay trong test: không phụ thuộc mạng, và chứng minh
    // đúng cái định dạng mà python-build-standalone phát hành.
    let d = tempfile::tempdir().unwrap();
    let tgz = d.path().join("x.tar.gz");
    {
        let f = std::fs::File::create(&tgz).unwrap();
        let enc = flate2::write::GzEncoder::new(f, flate2::Compression::fast());
        let mut tar = tar::Builder::new(enc);
        let mut h = tar::Header::new_gnu();
        h.set_size(5);
        h.set_mode(0o644);
        h.set_cksum();
        tar.append_data(&mut h, "python/python.exe", &b"hello"[..]).unwrap();
        tar.into_inner().unwrap().finish().unwrap();
    }
    let models = d.path().join("models");
    place_files(
        &tgz,
        Archive::TarGz,
        &[FileMap { from: Some("python/python.exe".into()), to: "python/python.exe".into() }],
        &models,
    )
    .unwrap();
    assert_eq!(std::fs::read(models.join("python/python.exe")).unwrap(), b"hello");
}
```

- [ ] **Bước 2: Chạy để thấy đỏ**

`cargo test --manifest-path src-tauri/Cargo.toml --test components_test giai_nen_duoc_tar_gz`
Dự kiến: không biên dịch được, `no variant named TarGz`.

- [ ] **Bước 3: Thêm biến thể và nhánh giải nén**

Trong `src-tauri/Cargo.toml`, phần `[dependencies]`, thêm:

```toml
flate2 = "1"
```

(Đã có sẵn trong `Cargo.lock` qua `zip` — đây chỉ là đưa lên thành phụ thuộc trực tiếp, không kéo crate mới vào cây.)

Trong `components.rs`, thêm biến thể:

```rust
    #[serde(rename = "tar.gz")]
    TarGz,
```

Trong `place_files`, nhánh `TarGz` dựng `tar::Archive` trên `flate2::read::GzDecoder` — **dùng lại nguyên logic chọn file của nhánh `TarBz2`**, chỉ khác lớp giải nén. Không viết lại phần duyệt entry, phần `safe_join` chống path traversal, hay phần xử lý `from` kết bằng `/`.

- [ ] **Bước 4: Chạy lại, phải xanh**

- [ ] **Bước 5: Thêm thành phần `python` vào `components.json`**

Chèn trước mục `yt-dlp`, giữ đúng kiểu định dạng gọn một dòng của `files`:

```json
  {
    "id": "python",
    "url": "https://github.com/astral-sh/python-build-standalone/releases/download/20260924/cpython-3.11.16%2B20260924-x86_64-pc-windows-msvc-install_only.tar.gz",
    "sha256": "0dc3a404d4d6501f3b8f99d58354410a0b1699dd5c21070778a594db02070dd3",
    "size": 48197230,
    "archive": "tar.gz",
    "files": [{ "from": "python/", "to": "python" }]
  },
```

Hash này đã được đối chiếu với `SHA256SUMS` do astral-sh công bố trong cùng release, không phải tự tính một phía.

- [ ] **Bước 6: Cập nhật bản kiểm kê**

`components_test.rs` có test đếm số artifact. Đổi `9` thành `10` và thêm `"python"` vào danh sách id. Con số đó là bản kiểm kê **có chủ ý** — nó buộc người thêm artifact phải khai báo rõ ràng; đừng đổi nó thành `specs().len()`.

- [ ] **Bước 7: Chạy toàn bộ và commit**

Dự kiến: 258 + 1 = **259 passed**.

---

### Task 2: Cài gói Python có kiểm hash

**Files:**
- Create: `src-tauri/vieneu-requirements.txt`
- Create: `src-tauri/src/pyenv.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod pyenv;`)
- Test: `src-tauri/tests/pyenv_test.rs`

**Interfaces:**
- Produces: `pyenv::build_pip_args(req: &Path, target: &Path) -> Vec<String>`, `pyenv::site_packages(models: &Path) -> PathBuf`, `pyenv::is_installed(models: &Path) -> bool`, `pyenv::install(models: &Path, on_line: &mut dyn FnMut(&str)) -> Result<(), PipelineError>`

- [ ] **Bước 1: Sinh file requirements có hash**

Chạy trên máy phát triển, foreground:

```
<models>/python/python.exe -m pip download vieneu==<bản mới nhất> -d <tmp> --only-binary :all:
<models>/python/python.exe -m pip hash <tmp>/*.whl
```

Ghi kết quả vào `src-tauri/vieneu-requirements.txt` theo dạng:

```
vieneu==3.7.1 \
    --hash=sha256:<...>
onnxruntime==<...> \
    --hash=sha256:<...>
```

**Ghi vào báo cáo số bản thật đã pin.** Nếu một gói không có wheel cho Windows x64 / CPython 3.11, dừng lại và báo — đừng đổi sang `--no-binary`, vì khi đó phải biên dịch và không còn tất định nữa.

- [ ] **Bước 2: Viết test đỏ cho phần thuần**

```rust
use app_lib::pyenv::{build_pip_args, site_packages};
use std::path::Path;

#[test]
fn pip_bat_buoc_kiem_hash() {
    let a = build_pip_args(Path::new("C:/r.txt"), Path::new("C:/sp"));
    assert!(a.contains(&"--require-hashes".to_string()),
        "thiếu cờ này thì pip cài bất cứ thứ gì nó tải được: {a:?}");
}

#[test]
fn pip_cai_vao_dung_thu_muc_va_khong_dung_moi_truong_nguoi_dung() {
    let a = build_pip_args(Path::new("C:/r.txt"), Path::new("C:/sp"));
    let i = a.iter().position(|s| s == "--target").expect("phải có --target");
    assert_eq!(a[i + 1], "C:/sp");
    // Không được đụng tới gói đã cài sẵn ngoài hệ thống, và không được đọc
    // cấu hình pip của người dùng — cả hai đều phá tính tất định.
    assert!(a.contains(&"--isolated".to_string()), "{a:?}");
    assert!(a.contains(&"--no-cache-dir".to_string()), "{a:?}");
}

#[test]
fn site_packages_nam_trong_thu_muc_models() {
    let p = site_packages(Path::new("C:/m"));
    assert!(p.starts_with("C:/m"), "{}", p.display());
}
```

- [ ] **Bước 3: Chạy để thấy đỏ** — `unresolved import app_lib::pyenv`.

- [ ] **Bước 4: Cài đặt**

```rust
//! Cài các gói Python cho VieNeu vào một thư mục riêng trong `models/`.
//!
//! Không dùng venv: chỉ cần một cây `site-packages` rồi đặt `PYTHONPATH` khi
//! gọi. Ít thứ có thể hỏng hơn, và không phụ thuộc vào `python -m venv` vốn cần
//! ghi vào chỗ khác.

use crate::error::PipelineError;
use std::path::{Path, PathBuf};

pub fn site_packages(models: &Path) -> PathBuf {
    models.join("vieneu").join("site-packages")
}

pub fn build_pip_args(req: &Path, target: &Path) -> Vec<String> {
    vec![
        "-m".into(), "pip".into(), "install".into(),
        // Từ chối mọi gói không khớp hash đã pin trong repo.
        "--require-hashes".into(),
        // Bỏ qua cấu hình pip và biến môi trường của máy người dùng.
        "--isolated".into(),
        "--no-cache-dir".into(),
        "--no-warn-script-location".into(),
        "--target".into(), target.display().to_string(),
        "-r".into(), req.display().to_string(),
    ]
}
```

`install()` chạy `python.exe` với các tham số trên, `CREATE_NO_WINDOW`, đọc stdout theo dòng và gọi `on_line` để báo tiến độ. Cài vào **thư mục tạm cạnh đích rồi `rename`** — cùng khuôn tmp+rename đã dùng ở M6, để một lần cài hỏng giữa chừng không để lại cây gói nửa vời mà `is_installed` lại tưởng là xong.

`is_installed(models)` kiểm sự tồn tại của `site_packages(models)/vieneu/__init__.py`.

- [ ] **Bước 5: Chạy lại, phải xanh. Commit.**

---

### Task 3: Cầu nối Python

**Files:**
- Create: `src-tauri/python/vieneu_bridge.py`
- Test: `src-tauri/tests/e2e_vieneu_bridge_test.rs` (`#[ignore]`)

**Interfaces:**
- Produces: hợp đồng stdin/stdout mà Task 4 dựa vào.

- [ ] **Bước 1: Viết cầu nối**

```python
"""Cầu nối VieNeu-TTS cho DichVideo-Local.

Giao thức giống hệt `piper.exe --json-input` để tầng Rust không phải biết
mình đang gọi engine nào:

  stdin : mỗi dòng một JSON
          {"text": "...", "output_file": "...", "voice": "Mai Anh"}
  stdout: mỗi job xong in một dòng là đường dẫn file đã ghi, rồi flush
  stderr: log và lỗi
  mã thoát khác 0 nếu có bất kỳ job nào hỏng

Mô hình nạp MỘT LẦN cho cả batch — đây là lý do phải dùng giao thức dòng
thay vì gọi một tiến trình mỗi cue.

Pin theo SDK vieneu <bản đã pin trong vieneu-requirements.txt>.
"""
import json, sys, os

def main() -> int:
    os.environ.setdefault("HF_HOME", os.environ.get("DVL_HF_HOME", ""))
    from vieneu import Vieneu

    tts = Vieneu(backend="onnx")          # CPU, torch-free
    loi = 0
    for dong in sys.stdin:
        dong = dong.strip()
        if not dong:
            continue
        try:
            job = json.loads(dong)
            tts.infer_to_file(
                job["text"],
                job["output_file"],
                voice=job.get("voice"),
                speed=job.get("speed", 1.0),
            )
            print(job["output_file"], flush=True)
        except Exception as e:                      # noqa: BLE001
            print(f"loi: {e}", file=sys.stderr, flush=True)
            loi = 1
    return loi

if __name__ == "__main__":
    sys.exit(main())
```

**Lưu ý cho người cài đặt:** tên hàm ghi file và tên tham số tốc độ phải được **đối chiếu với SDK thật** (`help(Vieneu)`), không chép mù đoạn trên. Nếu SDK không có `infer_to_file`, dùng `infer()` rồi ghi WAV bằng `soundfile`. Nếu SDK không nhận tốc độ theo từng câu, **gom job theo tốc độ** như `Piper::synthesize` và ghi rõ trong báo cáo.

- [ ] **Bước 2: E2E thật, `#[ignore]`, cổng `DVL_E2E_VIENEU=1`**

Tổng hợp một câu, khẳng định file WAV tồn tại, đọc được bằng `wav::read_info`, và `sample_rate == 48000`. Tự dọn `tempdir`.

- [ ] **Bước 3: Chạy thật một lần, báo số đo. Commit.**

Nếu đỏ: báo lệnh và lỗi nguyên văn rồi dừng. **Không làm yếu assertion để cho qua.**

---

### Task 4: Provider `VieNeu` trong Rust

**Files:**
- Create: `src-tauri/src/tts/vieneu.rs`
- Modify: `src-tauri/src/tts/mod.rs`
- Test: `src-tauri/tests/vieneu_test.rs`

**Interfaces:**
- Consumes: `TtsProvider`, `TtsJob`; `pyenv::site_packages`
- Produces: `VieNeu { python: PathBuf, bridge: PathBuf, site_packages: PathBuf, hf_home: PathBuf, voice: String }`, `build_line(&TtsJob, voice) -> String`, `group_by_speed(&[TtsJob]) -> Vec<(f32, Vec<TtsJob>)>`

- [ ] **Bước 1: Test đỏ**

```rust
#[test]
fn dong_json_gop_xuong_dong_va_mang_ten_giong() {
    let l = build_line(&job(1, "dòng một\r\ndòng \"hai\"", 1.0), "Mai Anh");
    assert!(!l.contains('\n'), "dòng gửi stdin không được chứa xuống dòng");
    let v: serde_json::Value = serde_json::from_str(&l).unwrap();
    assert_eq!(v["text"], "dòng một dòng \"hai\"");
    assert_eq!(v["voice"], "Mai Anh");
}

#[test]
fn thieu_python_bao_engine_missing() {
    let p = VieNeu { python: "khong-ton-tai.exe".into(), /* … */ };
    let err = p.synthesize(&[job(1, "a", 1.0)], &mut |_| {}).unwrap_err();
    assert_eq!(err.code(), "engine_missing", "nhận: {err}");
}

#[test]
fn khong_co_job_thi_khong_spawn() {
    // exe không tồn tại mà vẫn Ok ⇒ chứng minh là không spawn.
    let p = VieNeu { python: "khong-ton-tai.exe".into(), /* … */ };
    p.synthesize(&[], &mut |_| {}).unwrap();
}

#[test]
fn sample_rate_la_48000() {
    assert_eq!(VieNeu { /* … */ }.sample_rate(), 48000);
}
```

- [ ] **Bước 2: Chạy để thấy đỏ.**

- [ ] **Bước 3: Cài đặt**

**Di chuyển nguyên khối** phần ba luồng song song từ `tts/piper.rs` (stdin luồng riêng, stdout luồng gọi, stderr luồng riêng, đọc theo byte rồi decode lossy). Khối đó có comment dài giải thích vì sao — nó tránh treo ống nặc danh 4 KB trên Windows và tránh chết vì byte không phải UTF-8 trong đường dẫn. Đừng viết lại.

Môi trường cho tiến trình con:
- `PYTHONPATH` = `site_packages`
- `HF_HOME` = `<models>/vieneu/cache` (để thư viện không tải model vào `%USERPROFILE%\.cache` ngoài tầm kiểm soát)
- `PYTHONIOENCODING=utf-8` — **bắt buộc**: văn bản tiếng Việt đi qua stdin/stdout, mặc định Windows dùng codepage hệ thống và sẽ làm hỏng dấu.

`on_done` nhận **`job.index` gốc**, không phải số thứ tự trong nhóm.

- [ ] **Bước 4: Chạy lại, xanh. Commit.**

---

### Task 5: Danh sách 25 giọng và lệnh `tts_voices`

**Files:**
- Modify: `src-tauri/src/tts/vieneu.rs`
- Modify: `src-tauri/src/commands.rs`, `src-tauri/src/lib.rs`
- Test: `src-tauri/tests/vieneu_test.rs`

- [ ] **Bước 1: Khai danh sách**

Trong `vieneu.rs`, `pub const VOICES: &[Voice]` với `Voice { id, ten, gioi, mien, phong_cach, khuyen_dung }`. Đọc từ `gguf/voices/manifest.json` của model repo ngày 2026-09-26; mặc định là `minh_quan_pro`. Đủ 25 mục:

> **ĐÃ SỬA 2026-09-26 sau khi chạy SDK thật.** Bảng cũ lấy từ
> `gguf/voices/manifest.json` trên HuggingFace và **sai hai lần**:
> (1) SDK **không** nhận id dạng slug (`mai_anh`) — truyền vào là lỗi
> `Voice 'mai_anh' not found`; nó chỉ nhận **tên hiển thị có dấu**;
> (2) bộ giọng của đường GGUF **khác** bộ của đường ONNX/Python — manifest có
> `Anh Khôi`, `Minh Quân Pro`, `Mạnh Dũng` mà SDK không có, còn SDK có
> `Thiện Minh` và `Quốc Tuấn` mà manifest không có.
>
> Nguồn sự thật là `list_preset_voices()` của SDK đã cài, không phải
> HuggingFace. Bảng dưới đây lấy từ đó.
>
> Lưu ý: `Mạnh Dũng` — một trong hai tên khớp app gốc — **không dùng được**.
> Chỉ còn `Ngọc Huyền`.

| tên (giá trị truyền cho `voice=`) | giới | miền | phong cách | ⭐ |
|---|---|---|---|---|
| `Adam bựa` | Nam | Bắc | tự nhiên | ⭐ |
| `Trúc Ly` | Nữ | Bắc | tự nhiên | ⭐ |
| `Thiện Minh` | Nam | Bắc | kể chuyện | ⭐ |
| `Mai Anh` | Nữ | Bắc | tin tức | ⭐ |
| `Hải Đăng` | Nam | Bắc | tự nhiên | ⭐ |
| `Thùy Dung` | Nữ | Nam | tin tức | ⭐ |
| `Thiền Tâm Đức` | Nam | Bắc | kể chuyện | ⭐ |
| `Ngọc Huyền` | Nữ | Bắc | tự nhiên | ⭐ |
| `Quang Sơn` | Nam | Trung | tự nhiên | ⭐ |
| `Ngọc Trân` | Nữ | Trung | tự nhiên | ⭐ |
| `Minh Đức` | Nam | Bắc | tin tức |  |
| `Phạm Tuyên` | Nam | Bắc | tự nhiên |  |
| `Thái Sơn` | Nam | Nam | kể chuyện |  |
| `Xuân Vĩnh` | Nam | Bắc | tự nhiên |  |
| `Thanh Bình` | Nam | Bắc | kể chuyện |  |
| `Ngọc Linh` | Nữ | Bắc | kể chuyện |  |
| `Đoan Trang` | Nữ | Bắc | tự nhiên |  |
| `Thục Đoan` | Nữ | Nam | kể chuyện |  |
| `Minh Triết` | Nam | Nam | tin tức |  |
| `Mỹ Duyên` | Nữ | Nam | đọc truyện |  |
| `Quỳnh Anh` | Nữ | Bắc | đọc truyện |  |
| `Đức Trí` | Nam | Nam | đọc truyện |  |
| `Kim Thanh` | Nữ | Nam | đọc truyện |  |
| `Adam` | Nam | Nam | tự nhiên |  |
| `Quốc Tuấn` | Nam | Bắc | tự nhiên |  |

- [ ] **Bước 2: Test**

```rust
#[test]
fn du_25_giong_khong_trung_id() { /* len == 25, dedup id giữ nguyên độ dài */ }

#[test]
fn giong_mac_dinh_nam_trong_danh_sach() {
    assert!(VOICES.iter().any(|v| v.id == GIONG_MAC_DINH));
}

#[test]
fn ten_giong_la_bao_loi_ro_rang() {
    let err = tra_giong("khong_co_giong_nay").unwrap_err();
    assert!(err.to_string().contains("chọn lại"), "nhận: {err}");
}

#[test]
fn co_du_ba_mien() {
    for m in ["Bắc", "Trung", "Nam"] {
        assert!(VOICES.iter().any(|v| v.mien == m), "thiếu miền {m}");
    }
}
```

- [ ] **Bước 3: Lệnh `tts_voices(provider: String) -> Vec<VoiceDto>`**

Trả danh sách VieNeu khi `provider == "vieneu"`, và một mục duy nhất `vi_VN-vais1000-medium` khi `"piper"`. Đăng ký trong `generate_handler![]`.

- [ ] **Bước 4: Chạy, commit.**

---

### Task 6: Chặn lệch tần số trong `cues::preview`

**Files:**
- Modify: `src-tauri/src/cues.rs`
- Test: `src-tauri/tests/cues_preview_test.rs`

Đây là chỗ nguy hiểm đã nêu ở mục 6 của spec.

- [ ] **Bước 1: Test đỏ**

```rust
#[test]
fn doi_giong_khac_tan_so_thi_tu_choi_truoc_khi_goi_engine() {
    // Manifest ghi 22050 (đã lồng tiếng bằng Piper), provider giả báo 48000.
    // Nếu cho chạy, wav 48 kHz sẽ nằm dưới manifest 22 kHz và chỉ vỡ lúc Xuất.
    let (d, p) = dung_fixture_manifest_22050_voi_provider_48000();
    let err = preview(&d, &p, "Mai Anh", 1.0, "vi", 1, None, &FitOpts::default()).unwrap_err();
    assert!(err.to_string().contains("chạy lại Lồng tiếng"), "nhận: {err}");
    assert!(err.to_string().contains("48000"), "phải nói rõ hai con số: {err}");
    assert!(p.calls().is_empty(), "không được gọi engine rồi mới từ chối");
    // wav cũ còn nguyên
    assert_eq!(std::fs::read(&wav_cu).unwrap(), noi_dung_cu);
}
```

- [ ] **Bước 2: Chạy để thấy đỏ** (hiện tại nó sẽ tổng hợp bình thường).

- [ ] **Bước 3: Thêm guard ngay sau khi nạp manifest, TRƯỚC mọi thao tác đĩa hay engine**

```rust
    if m.sample_rate != p.sample_rate() {
        return Err(PipelineError::Io(format!(
            "Giọng đọc đã đổi ({} Hz so với {} Hz trong bản lồng tiếng hiện có) — chạy lại Lồng tiếng trước",
            p.sample_rate(),
            m.sample_rate
        )));
    }
```

- [ ] **Bước 4: Kiểm đột biến**

Xoá guard ⇒ test trên phải **đỏ**. Dán bằng chứng RED vào báo cáo rồi khôi phục.

- [ ] **Bước 5: Chạy toàn bộ, commit.**

---

### Task 7: Cấu hình và giao diện

**Files:**
- Modify: `src-tauri/src/config.rs`, `src-tauri/src/tts/mod.rs`
- Modify: `src/App.tsx`

- [ ] **Bước 1: `make_provider` nhận `"vieneu"`**

Dựng `VieNeu` từ `models_dir()`. Thiếu Python hoặc thiếu gói ⇒ lỗi
"Chưa cài bộ giọng VieNeu — bấm Tải bộ công cụ trước".

- [ ] **Bước 2: Đổi nhà cung cấp phải đặt lại giọng**

Giọng VieNeu (`"Mai Anh"`) và giọng Piper (`"vi_VN-vais1000-medium"`) là hai không gian tên khác nhau. Khi người dùng đổi nhà cung cấp, đặt `voice` về mặc định của nhà cung cấp mới thay vì mang theo một giá trị vô nghĩa.

- [ ] **Bước 3: Giao diện Bước 5**

```
Nhà cung cấp [VieNeu ▾]   Giọng [⭐ Mai Anh — Nữ · Bắc · tin tức ▾]   [Lồng tiếng]
```

Danh sách giọng nạp qua `tts_voices(provider)`, nạp lại mỗi khi đổi nhà cung cấp. Giọng ⭐ xếp lên đầu.

- [ ] **Bước 4: `npx tsc --noEmit`, chạy `npm run tauri dev` một lần xác nhận app lên sạch, commit.**

---

### Task 8: E2E chứng minh engine thật sự nghe lệnh

**Files:**
- Create: `src-tauri/tests/e2e_vieneu_test.rs` (`#[ignore]`, cổng `DVL_E2E_VIENEU=1`)

Đây là task quan trọng nhất của cả plan. M6 đã phát hiện `length_scale` của Piper **chưa bao giờ có tác dụng** suốt từ M3, vì test đơn vị chỉ khẳng định thứ ta gửi đi chứ không khẳng định thứ engine làm. Không lặp lại sai lầm đó.

- [ ] **Bước 1: Tốc độ có tác dụng thật**

Tổng hợp cùng một câu ở tốc độ nền và ở tốc độ nhanh. Trước khi đặt ngưỡng, **đo nhiễu thật**: tổng hợp cùng một câu **ba lần ở cùng tốc độ** rồi lấy độ lệch lớn nhất. Đặt ngưỡng nằm giữa hiệu ứng thật và mức nhiễu đó, và **ghi cả ba con số vào comment** kèm ngày đo — đúng cách đã làm cho Piper ở M6.

- [ ] **Bước 2: Chọn giọng có tác dụng thật**

Tổng hợp cùng một câu bằng hai giọng khác giới (`Mai Anh` nữ và `Hải Đăng` nam — **không** dùng `Mạnh Dũng`, giọng đó không có trong SDK), khẳng định hai file **khác nhau** theo sha256. Đây là test bắt được lỗi "tham số voice bị engine bỏ qua" — đúng loại lỗi đã xảy ra với `length_scale`.

- [ ] **Bước 3: Tần số đúng 48000**

- [ ] **Bước 4: Chạy thật một lần, báo đủ số đo, tự dọn tempdir, commit.**

---

## Tự soát

- **Phủ spec:** mục 5.1 → Task 1-2; 5.2 → Task 3; 5.3 → Task 4; 5.4 → Task 8; mục 6 → Task 6; mục 7 → Task 5, 7; mục 9 → rải khắp.
- **Không có chỗ trống:** hai chỗ duy nhất chưa có giá trị tuyệt đối là số bản `vieneu` trong requirements (Task 2 Bước 1 sinh ra và bắt ghi vào báo cáo) và tên hàm chính xác của SDK (Task 3 bắt đối chiếu với `help(Vieneu)` thay vì chép mù). Cả hai đều là "đi tra rồi ghi lại", không phải "để sau".
- **Nhất quán kiểu:** `sample_rate()` trả `u32` ở cả hai provider; `Voice.id` là `&'static str` khớp tham số `voice` của cầu nối.
