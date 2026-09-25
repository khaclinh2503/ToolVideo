# M5 — Mô hình dự án + mở lại Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ghi `project.json` cho mỗi dự án, liệt kê và mở lại dự án cũ sau khi đóng app, và xoá dự án không còn cần.

**Architecture:** Một module `project.rs` thuần tự chứa giữ toàn bộ việc đọc/ghi siêu dữ liệu, suy trạng thái giai đoạn từ file trên đĩa, liệt kê bằng cách quét `projects/*/project.json`, và xoá có kiểm ràng buộc đường dẫn. Ba lệnh Tauri đồng bộ mỏng bọc lấy nó, các lệnh sẵn có chạm `updated_at` sau khi thành công, và `App.tsx` thêm một khối danh sách lên đầu màn hình.

**Tech Stack:** Rust 2021, crate `app_lib` (`src-tauri/`), `serde`/`serde_json`, `tempfile` cho test; React + TypeScript (`src/App.tsx`), `@tauri-apps/plugin-dialog` (đã là dependency). Không thêm dependency mới ở cả hai phía.

**Spec:** `docs/superpowers/specs/2026-09-25-dichvideo-local-m5-project-model-design.md`

## Global Constraints

- Nền tảng: Windows 11, shell PowerShell. `cargo` KHÔNG có sẵn trên PATH của shell mới — **mọi lệnh cargo phải mở đầu bằng** `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path";` (PowerShell) hoặc `export PATH="$HOME/.cargo/bin:$PATH"` (bash). Bỏ qua thì báo "cargo: command not found", không phải lỗi code.
- Mọi thông báo lỗi hướng tới người dùng viết **tiếng Việt**, theo giọng `src-tauri/src/error.rs`, dạng nêu đúng bước còn thiếu.
- Không thêm biến thể vào `enum PipelineError`. Lỗi mới dùng `PipelineError::Io(String)`.
- **`project.json` chỉ chứa thứ không suy ra được**: `video_path`, `src_lang`, `tgt_lang`, `created_at`, `updated_at`. Không ghi trạng thái giai đoạn, không ghi `revision`, không ghi authority, không ghi sổ artifact.
- **Trạng thái giai đoạn suy từ đĩa**, mỗi lần hỏi. Không cache, không lưu.
- Ghi file qua **tmp + rename**, theo đúng khuôn `tts::manifest::save`.
- `load` trả `None` khi thiếu file hoặc JSON hỏng — không phải lỗi.
- `update` khi không có meta ⇒ **không làm gì, trả `Ok(())`**. Một giai đoạn xử lý không được phép thất bại chỉ vì không cập nhật nổi dấu thời gian.
- `delete` chỉ chấp nhận **con trực tiếp** của `projects_root`, kiểm **sau** `canonicalize` cả hai phía.
- Test dùng `tempfile::tempdir()`, không đụng `%APPDATA%` thật. Test cần engine thật phải `#[ignore]` và có cổng biến môi trường.
- Kết thúc mỗi task: `cargo test` xanh, **0 warning**. Mốc hiện tại: **174 passed / 7 ignored / 0 failed / 0 warnings**.
- Không push lên remote. Chỉ commit tại chỗ.

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `src-tauri/src/project.rs` (tạo mới) | Siêu dữ liệu dự án: đọc/ghi, suy trạng thái, liệt kê, xoá. |
| `src-tauri/src/stt.rs` (sửa) | Thêm hằng `SRC_LANGS` — tập ngôn ngữ nguồn đã kiểm bằng engine thật. |
| `src-tauri/src/lib.rs` (sửa) | `pub mod project;` + đăng ký 4 lệnh mới. |
| `src-tauri/src/commands.rs` (sửa) | `ProjectSummaryDto`, `list_projects`/`open_project`/`delete_project`/`src_langs`; các lệnh sẵn có ghi/chạm meta. |
| `src/App.tsx` (sửa) | Khối "Dự án gần đây", ô chọn ngôn ngữ nguồn. |
| `src-tauri/tests/project_meta_test.rs` (tạo mới) | `load`/`save`/`update`. |
| `src-tauri/tests/project_list_test.rs` (tạo mới) | `status` + `list`. |
| `src-tauri/tests/project_delete_test.rs` (tạo mới) | Ràng buộc đường dẫn khi xoá. |
| `src-tauri/tests/e2e_src_lang_test.rs` (tạo mới) | Kiểm lại `SRC_LANGS` bằng engine thật, `#[ignore]`. |
| `src-tauri/tests/commands_test.rs` (sửa) | DTO camelCase. |

---

### Task 1: `project.rs` — đọc và ghi `project.json`

**Files:**
- Create: `src-tauri/src/project.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod project;`)
- Test: `src-tauri/tests/project_meta_test.rs`

**Interfaces:**
- Consumes: `crate::error::PipelineError` (đã có).
- Produces:
  - `app_lib::project::ProjectMeta { pub version: u32, pub video_path: String, pub src_lang: String, pub tgt_lang: String, pub created_at: u64, pub updated_at: u64 }`
  - `app_lib::project::meta_path(project_dir: &Path) -> PathBuf`
  - `app_lib::project::load(project_dir: &Path) -> Option<ProjectMeta>`
  - `app_lib::project::save(project_dir: &Path, m: &ProjectMeta) -> Result<(), PipelineError>`
  - `app_lib::project::update(project_dir: &Path, now_ms: u64, f: impl FnOnce(&mut ProjectMeta)) -> Result<(), PipelineError>`
  - `app_lib::project::now_ms() -> u64`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/project_meta_test.rs`:

```rust
use app_lib::project::{load, meta_path, save, update, ProjectMeta};
use std::path::Path;

fn meta(video: &str, tgt: &str, created: u64, updated: u64) -> ProjectMeta {
    ProjectMeta {
        version: 1,
        video_path: video.to_string(),
        src_lang: "zh".into(),
        tgt_lang: tgt.to_string(),
        created_at: created,
        updated_at: updated,
    }
}

#[test]
fn ghi_roi_doc_lai_ra_dung_meta() {
    let d = tempfile::tempdir().unwrap();
    let m = meta(r"E:\phim\clip.mp4", "vi", 1000, 2000);
    save(d.path(), &m).unwrap();
    assert_eq!(load(d.path()).unwrap(), m);
}

#[test]
fn meta_path_la_project_json_trong_thu_muc_du_an() {
    assert_eq!(
        meta_path(Path::new("/a/b")).file_name().unwrap(),
        "project.json"
    );
}

#[test]
fn thieu_file_tra_ve_none() {
    let d = tempfile::tempdir().unwrap();
    assert!(load(d.path()).is_none());
}

#[test]
fn json_hong_tra_ve_none_chu_khong_panic() {
    let d = tempfile::tempdir().unwrap();
    std::fs::write(meta_path(d.path()), "{ không phải json").unwrap();
    assert!(load(d.path()).is_none());
}

#[test]
fn save_khong_de_lai_file_tmp() {
    let d = tempfile::tempdir().unwrap();
    save(d.path(), &meta("v.mp4", "vi", 1, 1)).unwrap();
    let con: Vec<String> = std::fs::read_dir(d.path())
        .unwrap()
        .flatten()
        .map(|e| e.file_name().to_string_lossy().to_string())
        .collect();
    assert_eq!(con, vec!["project.json".to_string()], "còn sót file tạm: {con:?}");
}

#[test]
fn update_bump_updated_at_va_giu_created_at() {
    let d = tempfile::tempdir().unwrap();
    save(d.path(), &meta("v.mp4", "vi", 1000, 1000)).unwrap();

    update(d.path(), 5555, |m| m.tgt_lang = "en".into()).unwrap();

    let got = load(d.path()).unwrap();
    assert_eq!(got.created_at, 1000, "created_at phải giữ nguyên");
    assert_eq!(got.updated_at, 5555);
    assert_eq!(got.tgt_lang, "en");
    assert_eq!(got.video_path, "v.mp4", "các trường khác không được đụng tới");
}

#[test]
fn update_khi_chua_co_meta_thi_khong_lam_gi_va_khong_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    // Dự án tạo trước M5 không có project.json. Một giai đoạn xử lý không được
    // phép thất bại chỉ vì không cập nhật nổi dấu thời gian.
    update(d.path(), 9999, |m| m.tgt_lang = "en".into()).unwrap();
    assert!(load(d.path()).is_none(), "không được tự tạo meta");
    assert!(!meta_path(d.path()).exists());
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test project_meta_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::project`".

- [ ] **Step 3: Cài `project.rs`**

Tạo `src-tauri/src/project.rs`:

```rust
//! Siêu dữ liệu dự án: những gì không suy ra được từ các file trên đĩa.
//!
//! Chủ ý KHÔNG lưu ở đây: trạng thái từng giai đoạn (suy từ file, xem `status`),
//! `revision`, hệ "authority", sổ artifact. Ứng dụng gốc có cả ba, nhưng lý do
//! tài liệu tái dựng đưa ra cho chúng là undo/redo — thứ M5 chưa có.

use crate::error::PipelineError;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ProjectMeta {
    pub version: u32,
    /// Đường dẫn tuyệt đối tới video nguồn.
    pub video_path: String,
    /// Mã ngôn ngữ truyền cho `--sense-voice-language`.
    pub src_lang: String,
    pub tgt_lang: String,
    /// Epoch mili-giây. Dùng `u64` thay vì chuỗi ISO để khỏi thêm dependency
    /// ngày tháng; phía UI đã có sẵn `new Date(ms)`.
    pub created_at: u64,
    pub updated_at: u64,
}

pub fn meta_path(project_dir: &Path) -> PathBuf {
    project_dir.join("project.json")
}

/// Thiếu file hoặc JSON hỏng ⇒ `None`, không phải lỗi. Cùng quy ước với
/// `tts::manifest::load`: một dự án không đọc được chỉ đơn giản là không hiện
/// trong danh sách, chứ không làm hỏng cả lần liệt kê.
pub fn load(project_dir: &Path) -> Option<ProjectMeta> {
    let text = std::fs::read_to_string(meta_path(project_dir)).ok()?;
    serde_json::from_str(&text).ok()
}

/// Ghi qua tmp + rename để không bao giờ để lại file dở.
pub fn save(project_dir: &Path, m: &ProjectMeta) -> Result<(), PipelineError> {
    std::fs::create_dir_all(project_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let path = meta_path(project_dir);
    let json = serde_json::to_string_pretty(m).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, json).map_err(|e| PipelineError::Io(e.to_string()))?;
    std::fs::rename(&tmp, &path).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Tách riêng khỏi `update` để test ghim được thời gian.
pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Đọc, sửa, đặt `updated_at = now_ms`, ghi lại.
///
/// **Không có meta ⇒ không làm gì và trả `Ok(())`.** Dự án tạo trước M5 không có
/// `project.json`, và một giai đoạn xử lý không được phép thất bại chỉ vì không
/// cập nhật nổi một dấu thời gian.
pub fn update(
    project_dir: &Path,
    now_ms: u64,
    f: impl FnOnce(&mut ProjectMeta),
) -> Result<(), PipelineError> {
    let mut m = match load(project_dir) {
        Some(m) => m,
        None => return Ok(()),
    };
    f(&mut m);
    m.updated_at = now_ms;
    save(project_dir, &m)
}
```

Thêm vào `src-tauri/src/lib.rs`, giữ thứ tự alphabet (giữa `pub mod pipeline;` và `pub mod retime;`):

```rust
pub mod project;
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test project_meta_test
```
Kỳ vọng: 7 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm sửa `update` để nó đặt cả `m.created_at = now_ms;`. Test `update_bump_updated_at_va_giu_created_at` PHẢI đỏ ở dòng khẳng định `created_at == 1000`. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/project.rs src-tauri/src/lib.rs src-tauri/tests/project_meta_test.rs
git commit -m "feat(project): đọc/ghi project.json, update không làm gì khi chưa có meta"
```

---

### Task 2: Suy trạng thái giai đoạn và liệt kê dự án

**Files:**
- Modify: `src-tauri/src/project.rs` (thêm vào cuối)
- Test: `src-tauri/tests/project_list_test.rs`

**Interfaces:**
- Consumes: `app_lib::project::{ProjectMeta, load}` (Task 1).
- Produces:
  - `app_lib::project::ProjectStatus { pub has_stt: bool, pub has_translation: bool, pub has_tts: bool, pub has_export: bool, pub video_exists: bool }`
  - `app_lib::project::status(project_dir: &Path, m: &ProjectMeta) -> ProjectStatus`
  - `app_lib::project::ProjectSummary { pub project_dir: PathBuf, pub meta: ProjectMeta, pub status: ProjectStatus }`
  - `app_lib::project::list(projects_root: &Path) -> Vec<ProjectSummary>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/project_list_test.rs`:

```rust
use app_lib::project::{list, save, status, ProjectMeta};
use std::path::Path;

fn meta(video: &str, tgt: &str, updated: u64) -> ProjectMeta {
    ProjectMeta {
        version: 1,
        video_path: video.to_string(),
        src_lang: "zh".into(),
        tgt_lang: tgt.to_string(),
        created_at: 1,
        updated_at: updated,
    }
}

/// Tạo file rỗng kèm mọi thư mục cha.
fn touch(p: &Path) {
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, b"x").unwrap();
}

#[test]
fn du_an_trong_thi_moi_co_deu_false() {
    let d = tempfile::tempdir().unwrap();
    let m = meta("khong-ton-tai.mp4", "vi", 1);
    let s = status(d.path(), &m);
    assert!(!s.has_stt && !s.has_translation && !s.has_tts && !s.has_export);
    assert!(!s.video_exists);
}

#[test]
fn tung_co_bat_theo_dung_file_tuong_ung() {
    let d = tempfile::tempdir().unwrap();
    let m = meta("khong-ton-tai.mp4", "vi", 1);

    touch(&d.path().join("subtitles/source.srt"));
    assert!(status(d.path(), &m).has_stt);
    assert!(!status(d.path(), &m).has_translation);

    touch(&d.path().join("subtitles/translated.vi.srt"));
    assert!(status(d.path(), &m).has_translation);

    touch(&d.path().join("tts/manifest.json"));
    assert!(status(d.path(), &m).has_tts);

    touch(&d.path().join("output/final.mp4"));
    assert!(status(d.path(), &m).has_export);
}

#[test]
fn has_translation_theo_dung_tgt_lang_trong_meta() {
    let d = tempfile::tempdir().unwrap();
    touch(&d.path().join("subtitles/translated.vi.srt"));

    assert!(status(d.path(), &meta("v.mp4", "vi", 1)).has_translation);
    assert!(
        !status(d.path(), &meta("v.mp4", "en", 1)).has_translation,
        "đổi ngôn ngữ đích thì bản dịch cũ không còn tính là bản dịch của dự án"
    );
}

#[test]
fn video_exists_theo_duong_dan_that() {
    let d = tempfile::tempdir().unwrap();
    let v = d.path().join("clip.mp4");
    std::fs::write(&v, b"x").unwrap();

    assert!(status(d.path(), &meta(&v.display().to_string(), "vi", 1)).video_exists);
    assert!(!status(d.path(), &meta(r"E:\khong\co\clip.mp4", "vi", 1)).video_exists);
}

#[test]
fn list_bo_qua_thu_muc_khong_co_meta_va_meta_hong() {
    let root = tempfile::tempdir().unwrap();

    for (name, updated) in [("a", 300u64), ("b", 100), ("c", 200)] {
        let dir = root.path().join(name);
        save(&dir, &meta(&format!("{name}.mp4"), "vi", updated)).unwrap();
    }
    // thư mục do test E2E sinh ra: không bao giờ có project.json
    std::fs::create_dir_all(root.path().join("e2e-rac/audio")).unwrap();
    // meta hỏng
    let hong = root.path().join("hong");
    std::fs::create_dir_all(&hong).unwrap();
    std::fs::write(hong.join("project.json"), "{ vỡ").unwrap();

    let got = list(root.path());
    let names: Vec<String> = got
        .iter()
        .map(|s| s.project_dir.file_name().unwrap().to_string_lossy().to_string())
        .collect();
    assert_eq!(names, vec!["a", "c", "b"], "sắp xếp updated_at giảm dần: {names:?}");
}

#[test]
fn list_kem_status_cua_tung_du_an() {
    let root = tempfile::tempdir().unwrap();
    let dir = root.path().join("p1");
    save(&dir, &meta("v.mp4", "vi", 1)).unwrap();
    touch(&dir.join("subtitles/source.srt"));

    let got = list(root.path());
    assert_eq!(got.len(), 1);
    assert!(got[0].status.has_stt);
    assert!(!got[0].status.has_tts);
}

#[test]
fn list_tren_thu_muc_khong_ton_tai_tra_ve_rong() {
    let d = tempfile::tempdir().unwrap();
    assert!(list(&d.path().join("khong-co")).is_empty());
}

#[test]
fn list_bo_qua_file_le_o_cap_root() {
    let root = tempfile::tempdir().unwrap();
    std::fs::write(root.path().join("ghi-chu.txt"), b"x").unwrap();
    assert!(list(root.path()).is_empty());
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test project_list_test
```
Kỳ vọng: FAIL, "unresolved imports `app_lib::project::list`, `app_lib::project::status`".

- [ ] **Step 3: Cài `status` và `list`**

Thêm vào cuối `src-tauri/src/project.rs`:

```rust
/// Trạng thái từng giai đoạn, **suy từ file đang có trên đĩa** mỗi lần hỏi.
/// Không lưu vào `project.json`: một bản sao sẽ nói dối ngay khi người dùng xoá
/// tay thư mục `tts/`.
#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct ProjectStatus {
    pub has_stt: bool,
    pub has_translation: bool,
    pub has_tts: bool,
    pub has_export: bool,
    /// Video nguồn còn ở chỗ cũ không. Ổ cắm ngoài bị rút hay file bị chuyển là
    /// hỏng hóc dễ gặp nhất sau một thời gian dùng, và danh sách phải nói ra
    /// thay vì để người dùng bấm Xuất rồi mới thấy lỗi.
    pub video_exists: bool,
}

pub fn status(project_dir: &Path, m: &ProjectMeta) -> ProjectStatus {
    ProjectStatus {
        has_stt: project_dir.join("subtitles").join("source.srt").exists(),
        has_translation: project_dir
            .join("subtitles")
            .join(format!("translated.{}.srt", m.tgt_lang))
            .exists(),
        has_tts: project_dir.join("tts").join("manifest.json").exists(),
        has_export: project_dir.join("output").join("final.mp4").exists(),
        video_exists: Path::new(&m.video_path).exists(),
    }
}

#[derive(Clone, Debug)]
pub struct ProjectSummary {
    pub project_dir: PathBuf,
    pub meta: ProjectMeta,
    pub status: ProjectStatus,
}

/// Quét `projects_root`, bỏ qua mọi thư mục con không có `project.json` đọc được
/// — đó cũng chính là cách thư mục do test E2E sinh ra không lọt vào danh sách,
/// không cần danh sách loại trừ theo tên. Sắp xếp `updated_at` giảm dần.
pub fn list(projects_root: &Path) -> Vec<ProjectSummary> {
    let rd = match std::fs::read_dir(projects_root) {
        Ok(rd) => rd,
        Err(_) => return Vec::new(),
    };
    let mut out: Vec<ProjectSummary> = rd
        .flatten()
        .map(|e| e.path())
        .filter(|p| p.is_dir())
        .filter_map(|dir| {
            let meta = load(&dir)?;
            let st = status(&dir, &meta);
            Some(ProjectSummary { project_dir: dir, meta, status: st })
        })
        .collect();
    out.sort_by(|a, b| b.meta.updated_at.cmp(&a.meta.updated_at));
    out
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test project_list_test
```
Kỳ vọng: 8 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm đổi `out.sort_by(|a, b| b.meta.updated_at.cmp(&a.meta.updated_at));` thành `a.meta.updated_at.cmp(&b.meta.updated_at)` (tăng dần). Test `list_bo_qua_thu_muc_khong_co_meta_va_meta_hong` PHẢI đỏ với thứ tự `["b", "c", "a"]`. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/project.rs src-tauri/tests/project_list_test.rs
git commit -m "feat(project): suy trạng thái giai đoạn từ đĩa và liệt kê dự án"
```

---

### Task 3: Xoá dự án, có ràng buộc đường dẫn

Đây là hàm **duy nhất trong toàn bộ ứng dụng** gọi `remove_dir_all` lên dữ liệu người dùng. Ràng buộc phải được ghim bằng test chứ không bằng lời hứa.

**Files:**
- Modify: `src-tauri/src/project.rs` (thêm vào cuối)
- Test: `src-tauri/tests/project_delete_test.rs`

**Interfaces:**
- Consumes: không có gì từ task khác.
- Produces: `app_lib::project::delete(projects_root: &Path, project_dir: &Path) -> Result<(), PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/project_delete_test.rs`:

```rust
use app_lib::project::delete;
use std::path::Path;

fn mkdir(p: &Path) {
    std::fs::create_dir_all(p).unwrap();
    std::fs::write(p.join("giu-lai.txt"), b"x").unwrap();
}

#[test]
fn xoa_duoc_du_an_that() {
    let root = tempfile::tempdir().unwrap();
    let p = root.path().join("p1");
    mkdir(&p);
    mkdir(&p.join("tts/segments"));

    delete(root.path(), &p).unwrap();
    assert!(!p.exists(), "thư mục dự án phải biến mất");
    assert!(root.path().exists(), "thư mục gốc phải còn nguyên");
}

#[test]
fn tu_choi_xoa_chinh_thu_muc_goc() {
    let root = tempfile::tempdir().unwrap();
    mkdir(&root.path().join("p1"));

    let e = delete(root.path(), root.path()).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(root.path().exists(), "thư mục gốc VẪN PHẢI còn sau lời gọi bị từ chối");
    assert!(root.path().join("p1").exists());
}

#[test]
fn tu_choi_thu_muc_nam_ngoai_root() {
    let root = tempfile::tempdir().unwrap();
    let ngoai = tempfile::tempdir().unwrap();
    mkdir(&ngoai.path().join("quan-trong"));

    let e = delete(root.path(), &ngoai.path().join("quan-trong")).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(
        ngoai.path().join("quan-trong").exists(),
        "thư mục ngoài VẪN PHẢI còn sau lời gọi bị từ chối"
    );
}

#[test]
fn tu_choi_duong_dan_dung_hai_cham_de_thoat_ra_ngoai() {
    let root = tempfile::tempdir().unwrap();
    let ngoai = tempfile::tempdir().unwrap();
    mkdir(&ngoai.path().join("quan-trong"));
    mkdir(&root.path().join("p1"));

    // root/p1/../../<ngoai>/quan-trong — canonicalize sẽ rút gọn về đường dẫn thật
    let lach = root.path().join("p1").join("..").join("..")
        .join(ngoai.path().file_name().unwrap())
        .join("quan-trong");

    let e = delete(root.path(), &lach).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(
        ngoai.path().join("quan-trong").exists(),
        "thư mục ngoài VẪN PHẢI còn sau lời gọi bị từ chối"
    );
}

#[test]
fn tu_choi_thu_muc_chau_chu_khong_phai_con_truc_tiep() {
    let root = tempfile::tempdir().unwrap();
    let chau = root.path().join("p1").join("tts");
    mkdir(&chau);

    let e = delete(root.path(), &chau).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(chau.exists(), "thư mục cháu VẪN PHẢI còn sau lời gọi bị từ chối");
}

#[test]
fn du_an_khong_ton_tai_bao_loi_chu_khong_panic() {
    let root = tempfile::tempdir().unwrap();
    assert!(delete(root.path(), &root.path().join("khong-co")).is_err());
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test project_delete_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::project::delete`".

- [ ] **Step 3: Cài `delete`**

Thêm vào cuối `src-tauri/src/project.rs`:

```rust
/// Xoá cả thư mục dự án.
///
/// Đây là hàm duy nhất trong ứng dụng gọi `remove_dir_all` lên dữ liệu người
/// dùng. Mọi ràng buộc được kiểm **sau** `canonicalize` cả hai phía, để `..` và
/// symlink không lách qua được: chuỗi ký tự có thể nói dối, đường dẫn đã chuẩn
/// hoá thì không.
pub fn delete(projects_root: &Path, project_dir: &Path) -> Result<(), PipelineError> {
    let root = projects_root.canonicalize().map_err(|e| {
        PipelineError::Io(format!(
            "không đọc được thư mục dự án gốc {}: {e}",
            projects_root.display()
        ))
    })?;
    let dir = project_dir.canonicalize().map_err(|e| {
        PipelineError::Io(format!("không tìm thấy dự án {}: {e}", project_dir.display()))
    })?;

    let refuse = |d: &Path| {
        PipelineError::Io(format!(
            "Đường dẫn không nằm trong thư mục dự án — từ chối xoá ({})",
            d.display()
        ))
    };

    if !dir.is_dir() {
        return Err(refuse(&dir));
    }
    if dir == root {
        return Err(refuse(&dir));
    }
    if dir.parent() != Some(root.as_path()) {
        return Err(refuse(&dir));
    }

    std::fs::remove_dir_all(&dir)
        .map_err(|e| PipelineError::Io(format!("không xoá được {}: {e}", dir.display())))
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test project_delete_test
```
Kỳ vọng: 6 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Đây là bước quan trọng nhất của task. Tạm chuyển lời gọi `remove_dir_all` lên **trước** ba phép kiểm (ngay sau hai lần `canonicalize`), để hàm xoá xong rồi mới trả lỗi. Cả bốn test từ chối PHẢI đỏ ở dòng khẳng định "VẪN PHẢI còn". Nếu chúng vẫn xanh nghĩa là test chỉ kiểm `is_err()` và không che được gì. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/project.rs src-tauri/tests/project_delete_test.rs
git commit -m "feat(project): xoá dự án, chặn mọi đường dẫn ngoài thư mục gốc"
```

---

### Task 4: Tập ngôn ngữ nguồn hợp lệ — kiểm bằng engine thật

`src/App.tsx` đang gán cứng `lang: "zh"`, nghĩa là ứng dụng chỉ chạy được video tiếng Trung. M5 phải lưu `src_lang` dù sao, nên đây là lúc rẻ nhất để bỏ giá trị gán cứng.

**Tập giá trị hợp lệ phải quan sát được, không được đoán.** `--sense-voice-language` là cờ của sherpa-onnx và tài liệu rải rác. M4 đã trả giá một lần cho việc suy đoán hành vi mặc định của công cụ ngoài (`alimiter` bật sẵn `level`, lặng lẽ xoá đúng thứ vừa đặt).

**Files:**
- Modify: `src-tauri/src/stt.rs` (thêm hằng ở đầu file)
- Test: `src-tauri/tests/e2e_src_lang_test.rs`

**Interfaces:**
- Consumes: `app_lib::stt::build_args`, `app_lib::pipeline::run_stt_pipeline` (đã có).
- Produces: `app_lib::stt::SRC_LANGS: &[&str]`

- [ ] **Step 1: Chạy thăm dò từng ứng viên trên engine thật**

Test `e2e_stt_test` sẵn có đã đọc biến `DVL_E2E_LANG`, nên dùng luôn nó làm đầu dò — không phải viết mã dựng lệnh mới.

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:DVL_E2E_CLIP = "C:\Users\dokha\AppData\Local\Temp\claude\E--workspace-ToolVideo\e7009a41-7477-40f2-a60f-9ca24a67f87d\scratchpad\e2e-clip.mp4"
foreach ($l in @("auto","zh","en","ja","ko","yue","")) {
  $env:DVL_E2E_LANG = $l
  Write-Host "=== lang='$l' ==="
  cargo test --manifest-path src-tauri/Cargo.toml --test e2e_stt_test -- --ignored --nocapture 2>&1 | Select-String -Pattern "test result|error|Error|panicked|Invalid|invalid" | Select-Object -First 6
}
```

Điều đang kiểm là **engine có chấp nhận giá trị đó không**, không phải chất lượng nhận dạng. Clip là tiếng Anh, nên `zh`/`ja`/`ko`/`yue` sẽ cho ra chữ vô nghĩa mà vẫn chạy được — đó vẫn tính là chấp nhận. Chỉ coi là **bị từ chối** khi engine thoát với mã khác 0 hoặc in ra lỗi nhắc tới giá trị ngôn ngữ.

Ghi lại nguyên văn kết quả của từng giá trị vào báo cáo. Nếu **cả `auto` lẫn chuỗi rỗng đều bị từ chối**, dừng lại và báo NEEDS_CONTEXT — khi đó không có giá trị "tự nhận dạng" nào để làm mặc định, và việc chọn mặc định nào là quyết định của người chủ trì chứ không phải của bạn.

- [ ] **Step 2: Ghi hằng `SRC_LANGS` theo đúng những gì quan sát được**

Thêm vào đầu `src-tauri/src/stt.rs`, ngay sau khối `use`:

```rust
/// Các giá trị hợp lệ cho `--sense-voice-language`, **đã kiểm bằng cách chạy
/// engine thật** (xem `tests/e2e_src_lang_test.rs`). Đừng thêm giá trị vào đây
/// mà chưa chạy lại đầu dò đó: cờ này thuộc sherpa-onnx, không phải của ta, và
/// một giá trị bị từ chối chỉ lộ ra lúc chạy.
pub const SRC_LANGS: &[&str] = &[/* điền theo kết quả Step 1, giữ nguyên thứ tự ứng viên */];
```

Chỗ trống này là **cố ý**, không phải plan viết thiếu: giá trị đúng chỉ biết được
sau khi chạy engine ở Step 1, và nhiệm vụ của task này chính là đi đo nó. Quy tắc
điền đã nêu đủ chặt ở đoạn dưới, và test ở Step 3 sẽ đỏ nếu điền vào một giá trị
engine không nhận.

Chỉ đưa vào những giá trị đã **quan sát thấy chạy được** ở Step 1. Phần tử đầu tiên phải là giá trị tự nhận dạng nếu nó hợp lệ, ngược lại là `"zh"` để giữ nguyên hành vi hiện tại — phía UI sẽ lấy phần tử đầu làm mặc định.

- [ ] **Step 3: Viết test giữ cho lời khẳng định đó còn kiểm được**

Tạo `src-tauri/tests/e2e_src_lang_test.rs`:

```rust
//! Kiểm lại rằng mọi giá trị trong `stt::SRC_LANGS` vẫn được engine chấp nhận.
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_CLIP="<path.mp4>"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_src_lang_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ engine.

use app_lib::config::{models_dir, projects_dir};
use app_lib::pipeline::{run_stt_pipeline, EngineCtx};
use app_lib::stt::{SttModels, SRC_LANGS};
use std::path::Path;

#[test]
fn src_langs_deu_duoc_engine_chap_nhan() {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let m = models_dir();

    assert!(!SRC_LANGS.is_empty(), "SRC_LANGS rỗng — Step 2 chưa điền");

    for lang in SRC_LANGS {
        let ctx = EngineCtx {
            ffmpeg: m.join("ffmpeg").join("ffmpeg.exe"),
            sherpa: m.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"),
            models: SttModels {
                sense_voice: m.join("sherpa").join("sense-voice.onnx"),
                tokens: m.join("sherpa").join("tokens.txt"),
                vad: m.join("sherpa").join("vad-model.onnx"),
            },
        };
        let project = projects_dir().join(format!("e2e-srclang-{}-{}", lang, uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&project).unwrap();

        let r = run_stt_pipeline(&ctx, Path::new(&clip), &project, lang);
        println!("lang={lang:?} -> {:?}", r.as_ref().map(|x| x.cue_count));
        r.unwrap_or_else(|e| panic!("engine từ chối --sense-voice-language={lang}: {e}"));

        let _ = std::fs::remove_dir_all(&project);
    }
}
```

Chú ý: test này **không** khẳng định `cue_count > 0`. Clip chỉ có tiếng Anh, nên nhận dạng theo `ja` có thể ra 0 cue mà engine vẫn chạy bình thường — khẳng định số cue sẽ biến một test về "cờ có hợp lệ không" thành một test về chất lượng nhận dạng, và nó sẽ đỏ vì lý do sai.

- [ ] **Step 4: Kiểm biên dịch và trạng thái bỏ qua**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test e2e_src_lang_test
```
Kỳ vọng: biên dịch được, "0 passed; 1 ignored".

Chạy thật một lần để xác nhận hằng vừa điền là đúng:

```
$env:DVL_E2E_CLIP = "C:\Users\dokha\AppData\Local\Temp\claude\E--workspace-ToolVideo\e7009a41-7477-40f2-a60f-9ca24a67f87d\scratchpad\e2e-clip.mp4"
cargo test --manifest-path src-tauri/Cargo.toml --test e2e_src_lang_test -- --ignored --nocapture
```
Kỳ vọng: PASS. Ghi lại `cue_count` của từng ngôn ngữ vào báo cáo.

- [ ] **Step 5: Chạy toàn bộ, soi warning**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: 195 passed / **8** ignored / 0 warning (174 mốc + 7 + 8 + 6 từ ba task trước; task này chỉ thêm một test bị bỏ qua).

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/stt.rs src-tauri/tests/e2e_src_lang_test.rs
git commit -m "feat(stt): SRC_LANGS đã kiểm bằng engine thật, kèm test giữ cho kiểm được"
```

---

### Task 5: Lệnh Tauri và ghi meta trong các lệnh sẵn có

**Files:**
- Modify: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/lib.rs` (đăng ký 4 lệnh)
- Test: `src-tauri/tests/commands_test.rs`

**Interfaces:**
- Consumes: `app_lib::project::{delete, list, load, now_ms, save, status, ProjectMeta, ProjectSummary}` (Task 1–3); `app_lib::stt::SRC_LANGS` (Task 4); `app_lib::config::{load_config, projects_dir}` (đã có).
- Produces:
  - `app_lib::commands::ProjectSummaryDto { project_dir, video_path, video_name, src_lang, tgt_lang, updated_at, has_stt, has_translation, has_tts, has_export, video_exists }` (serialize camelCase)
  - `app_lib::commands::summary_to_dto(s: &ProjectSummary) -> ProjectSummaryDto`
  - Lệnh Tauri `list_projects`, `open_project`, `delete_project`, `src_langs`

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/commands_test.rs`:

```rust
#[test]
fn project_summary_dto_serialize_ra_camel_case() {
    let s = app_lib::project::ProjectSummary {
        project_dir: std::path::PathBuf::from(r"E:\du an\p1"),
        meta: app_lib::project::ProjectMeta {
            version: 1,
            video_path: r"E:\phim\clip.mp4".into(),
            src_lang: "zh".into(),
            tgt_lang: "vi".into(),
            created_at: 1,
            updated_at: 2,
        },
        status: app_lib::project::ProjectStatus {
            has_stt: true,
            has_translation: false,
            has_tts: false,
            has_export: false,
            video_exists: true,
        },
    };
    let j = serde_json::to_string(&app_lib::commands::summary_to_dto(&s)).unwrap();

    // Cặp đa từ mới phân biệt được rename_all; trường một từ thì không.
    assert!(j.contains("\"projectDir\""), "{j}");
    assert!(!j.contains("project_dir"), "{j}");
    assert!(j.contains("\"videoName\":\"clip.mp4\""), "{j}");
    assert!(j.contains("\"hasStt\":true"), "{j}");
    assert!(j.contains("\"videoExists\":true"), "{j}");
}

#[test]
fn video_name_roi_ve_ca_duong_dan_khi_khong_tach_duoc_ten_file() {
    let s = app_lib::project::ProjectSummary {
        project_dir: std::path::PathBuf::from("p"),
        meta: app_lib::project::ProjectMeta {
            version: 1,
            video_path: "".into(),
            src_lang: "zh".into(),
            tgt_lang: "vi".into(),
            created_at: 1,
            updated_at: 2,
        },
        status: app_lib::project::ProjectStatus {
            has_stt: false,
            has_translation: false,
            has_tts: false,
            has_export: false,
            video_exists: false,
        },
    };
    assert_eq!(app_lib::commands::summary_to_dto(&s).video_name, "");
}

#[test]
fn src_langs_khong_rong_va_co_gia_tri_mac_dinh_o_dau() {
    // UI lấy phần tử đầu làm mặc định cho ô chọn.
    assert!(!app_lib::stt::SRC_LANGS.is_empty());
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test commands_test
```
Kỳ vọng: FAIL, "cannot find function `summary_to_dto`".

- [ ] **Step 3: Thêm DTO và bốn lệnh**

Thêm vào cuối `src-tauri/src/commands.rs`:

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

pub fn summary_to_dto(s: &crate::project::ProjectSummary) -> ProjectSummaryDto {
    ProjectSummaryDto {
        project_dir: s.project_dir.display().to_string(),
        video_path: s.meta.video_path.clone(),
        video_name: Path::new(&s.meta.video_path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| s.meta.video_path.clone()),
        src_lang: s.meta.src_lang.clone(),
        tgt_lang: s.meta.tgt_lang.clone(),
        updated_at: s.meta.updated_at,
        has_stt: s.status.has_stt,
        has_translation: s.status.has_translation,
        has_tts: s.status.has_tts,
        has_export: s.status.has_export,
        video_exists: s.status.video_exists,
    }
}

#[tauri::command]
pub fn list_projects() -> Result<Vec<ProjectSummaryDto>, String> {
    Ok(crate::project::list(&projects_dir())
        .iter()
        .map(summary_to_dto)
        .collect())
}

#[tauri::command]
pub fn open_project(project_dir: String) -> Result<ProjectSummaryDto, String> {
    let dir = Path::new(&project_dir);
    let meta = crate::project::load(dir).ok_or_else(|| {
        format!(
            "Không đọc được dự án ({}) — thiếu hoặc hỏng project.json",
            dir.display()
        )
    })?;
    let status = crate::project::status(dir, &meta);
    Ok(summary_to_dto(&crate::project::ProjectSummary {
        project_dir: dir.to_path_buf(),
        meta,
        status,
    }))
}

#[tauri::command]
pub fn delete_project(project_dir: String) -> Result<(), String> {
    crate::project::delete(&projects_dir(), Path::new(&project_dir)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn src_langs() -> Vec<String> {
    crate::stt::SRC_LANGS.iter().map(|s| s.to_string()).collect()
}
```

Ba lệnh đầu để **đồng bộ, không `async`**: chúng chỉ đọc vài file JSON nhỏ hoặc xoá một thư mục, không gọi engine nào — giống `get_config`/`save_config` sẵn có.

- [ ] **Step 4: Ghi meta khi tạo dự án**

Trong `src-tauri/src/commands.rs`, hàm `run_stt`: ngay sau khi `run_stt_pipeline` trả về `result` và **trước** khi dựng `SttResultDto`, chèn:

```rust
        let cfg = crate::config::load_config();
        let now = crate::project::now_ms();
        crate::project::save(
            &project_dir,
            &crate::project::ProjectMeta {
                version: 1,
                video_path: video.display().to_string(),
                src_lang: lang.clone(),
                tgt_lang: cfg.translate.target_lang.clone(),
                created_at: now,
                updated_at: now,
            },
        )
        .map_err(|e| e.to_string())?;
```

Ghi **sau khi** STT thành công: một dự án không có phụ đề nguồn thì không có gì để mở lại.

- [ ] **Step 5: Chạm `updated_at` ở ba lệnh còn lại**

Thêm một hàm trợ giúp vào `src-tauri/src/commands.rs`, đặt ngay trên `list_projects`:

```rust
/// Chạm `updated_at` sau khi một giai đoạn chạy xong. Lỗi chỉ ghi ra stderr,
/// không làm hỏng kết quả của giai đoạn — cùng lý do với `project::update` khi
/// không có meta: không được để một dấu thời gian đánh đổ công việc thật.
fn touch_project(project_dir: &str, f: impl FnOnce(&mut crate::project::ProjectMeta)) {
    if let Err(e) = crate::project::update(
        Path::new(project_dir),
        crate::project::now_ms(),
        f,
    ) {
        eprintln!("không cập nhật được project.json: {e}");
    }
}
```

Rồi gọi nó ngay trước câu `Ok(...)` cuối cùng của từng lệnh:

- trong `run_translate`, sau khi có `r`:
  ```rust
        let tgt_luu = tgt.clone();
        touch_project(&project_dir, move |m| m.tgt_lang = tgt_luu);
  ```
- trong `run_tts`, sau khi có `r`:
  ```rust
        touch_project(&project_dir, |_| {});
  ```
- trong `run_export`, sau khi có `r`:
  ```rust
        touch_project(&project_dir, |_| {});
  ```

- [ ] **Step 6: Đăng ký bốn lệnh**

Trong `src-tauri/src/lib.rs`, thêm vào cuối `generate_handler![]`:

```rust
            commands::list_projects,
            commands::open_project,
            commands::delete_project,
            commands::src_langs,
```

Lệnh biên dịch được nhưng quên đăng ký thì chỉ chết lúc chạy, không test nào bắt — kiểm lại bằng `grep -n "list_projects\|open_project\|delete_project\|src_langs" src-tauri/src/lib.rs`, phải thấy đủ bốn dòng.

- [ ] **Step 7: Chạy toàn bộ, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: 198 passed / 8 ignored / 0 warning.

- [ ] **Step 8: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/src/lib.rs src-tauri/tests/commands_test.rs
git commit -m "feat(commands): list/open/delete_project, src_langs, ghi meta khi chạy giai đoạn"
```

---

### Task 6: Giao diện — danh sách dự án và ô chọn ngôn ngữ nguồn

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: lệnh `list_projects`, `open_project`, `delete_project`, `src_langs` (Task 5).
- Produces: không có gì cho task sau.

- [ ] **Step 1: Khai báo kiểu và state**

Thêm cạnh các interface khác ở đầu `src/App.tsx`:

```tsx
interface ProjectSummaryDto {
  projectDir: string; videoPath: string; videoName: string;
  srcLang: string; tgtLang: string; updatedAt: number;
  hasStt: boolean; hasTranslation: boolean; hasTts: boolean;
  hasExport: boolean; videoExists: boolean;
}
```

Thêm vào khối `useState` (khoảng dòng 28):

```tsx
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [srcLangs, setSrcLangs] = useState<string[]>([]);
  const [srcLang, setSrcLang] = useState("");
```

Đổi dòng `import { open } from "@tauri-apps/plugin-dialog";` thành:

```tsx
import { open, confirm } from "@tauri-apps/plugin-dialog";
```

- [ ] **Step 2: Nạp danh sách dự án và tập ngôn ngữ khi mở app**

Thêm sau `useEffect` nạp cấu hình:

```tsx
  async function refreshProjects() {
    try {
      setProjects(await invoke<ProjectSummaryDto[]>("list_projects"));
    } catch (e) {
      setStatus(`Lỗi đọc danh sách dự án: ${String(e)}`);
    }
  }

  useEffect(() => {
    refreshProjects();
    invoke<string[]>("src_langs").then((ls) => {
      setSrcLangs(ls);
      setSrcLang((cur) => cur || ls[0] || "zh");
    });
  }, []);
```

`setSrcLang((cur) => cur || ...)` chứ không đặt thẳng: nếu người dùng vừa Mở một dự án trước khi lệnh này trả về, ngôn ngữ của dự án đó không được ghi đè.

- [ ] **Step 3: Dùng `srcLang` thay cho giá trị gán cứng, và nạp lại danh sách**

Trong `onRun`, đổi lời gọi và thêm nạp lại:

```tsx
      const r = await invoke<SttResultDto>("run_stt", { videoPath: selected, lang: srcLang });
      setProjectDir(r.projectDir); setVideoPath(selected as string);
      setStatus(`STT xong: ${r.cueCount} cue → ${r.srtPath}`);
      await refreshProjects();
```

- [ ] **Step 4: Thêm hàm Mở và Xoá**

Thêm sau `onRun`:

```tsx
  async function onOpenProject(p: ProjectSummaryDto) {
    try {
      const d = await invoke<ProjectSummaryDto>("open_project", { projectDir: p.projectDir });
      setProjectDir(d.projectDir);
      setVideoPath(d.videoPath);
      setTgt(d.tgtLang);
      setSrcLang(d.srcLang);
      setStatus(
        d.videoExists
          ? `Đã mở dự án: ${d.videoName}`
          : `Đã mở dự án: ${d.videoName} — nhưng không tìm thấy video gốc, không xuất được.`,
      );
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    }
  }

  async function onDeleteProject(p: ProjectSummaryDto) {
    const ok = await confirm(
      `Xoá vĩnh viễn dự án của "${p.videoName}"?\nMọi file đã sinh (phụ đề, giọng đọc, video đã xuất) sẽ mất và không khôi phục được.`,
      { title: "Xoá dự án", kind: "warning" },
    );
    if (!ok) return;
    try {
      await invoke("delete_project", { projectDir: p.projectDir });
      // Nếu đang mở chính dự án vừa xoá thì phải xoá trạng thái đi, nếu không
      // các nút bên dưới vẫn bật và trỏ vào một thư mục không còn tồn tại.
      if (projectDir === p.projectDir) {
        setProjectDir("");
        setVideoPath("");
      }
      await refreshProjects();
      setStatus(`Đã xoá dự án: ${p.videoName}`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    }
  }
```

- [ ] **Step 5: Thêm khối giao diện**

Thay khối đầu tiên trong `return (...)` — từ `<h1>` tới dòng `{dl && ...}` — bằng:

```tsx
      <h1>DichVideo-Local</h1>

      <h2>Dự án gần đây</h2>
      {projects.length === 0 && (
        <p style={{ opacity: 0.7 }}>Chưa có dự án nào. Chạy STT trên một video để tạo.</p>
      )}
      {projects.map((p) => (
        <div className="row" key={p.projectDir}>
          <span style={{ flex: 1 }}>
            <b>{p.videoName}</b>
            {" · "}
            {new Date(p.updatedAt).toLocaleString()}
            {" · "}
            {[
              p.hasStt && "STT",
              p.hasTranslation && "Dịch",
              p.hasTts && "Lồng tiếng",
              p.hasExport && "Xuất",
            ]
              .filter(Boolean)
              .join(" · ") || "trống"}
            {!p.videoExists && (
              <span style={{ color: "#c00" }}> · ⚠ mất video gốc</span>
            )}
          </span>
          <button type="button" onClick={() => onOpenProject(p)} disabled={running}>Mở</button>
          <button type="button" onClick={() => onDeleteProject(p)} disabled={running}>Xoá</button>
        </div>
      ))}

      <h2>Chọn video</h2>
      <div className="row">
        <button type="button" onClick={onEnsure} disabled={running}>Tải bộ công cụ</button>
        <select
          value={srcLang}
          onChange={(e) => setSrcLang(e.target.value)}
          disabled={running}
          title="Ngôn ngữ nói trong video"
        >
          {srcLangs.map((l) => (
            <option key={l} value={l}>{l === "" ? "(tự nhận dạng)" : l}</option>
          ))}
        </select>
        <button type="button" onClick={onRun} disabled={running}>
          {running ? "Đang chạy..." : "Chạy STT"}
        </button>
      </div>
      {dl && <p style={{ opacity: 0.7 }}>{dl}</p>}
```

Giữ nguyên lối trình bày sẵn có: `<h2>` + `<div className="row">`, không thêm thư viện, không đổi CSS.

- [ ] **Step 6: Kiểm biên dịch**

```
npm run build
```
Kỳ vọng: build thành công, không lỗi TypeScript. Thiếu `node_modules` thì chạy `npm install` trước.

- [ ] **Step 7: Đọc lại diff, đối chiếu từng tên trên dây**

`npm run build` chỉ kiểm được những hình dạng do chính bạn khai báo, nên nó **không** bắt được tên tham số `invoke` sai hay tên trường DTO sai — đó là lỗi lúc chạy, hiện ra dưới dạng `undefined` hoặc một lỗi Tauri khó hiểu. Đọc lại diff và đối chiếu từng ký tự:

- tham số: `{ projectDir: p.projectDir }` cho cả `open_project` và `delete_project`; `{ videoPath: selected, lang: srcLang }` cho `run_stt`;
- tên lệnh: `list_projects`, `open_project`, `delete_project`, `src_langs`;
- 11 trường của `ProjectSummaryDto` đúng như khai báo ở Step 1.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx
git commit -m "feat(ui): danh sách dự án gần đây, mở/xoá, chọn ngôn ngữ nguồn"
```

---

## Nghiệm thu M5

Chạy thủ công — **không test nào che đường này** vì nó cần vòng đời tiến trình thật:

1. `npm run tauri dev`, chọn một video, chạy STT, Dịch, Lồng tiếng.
2. Đóng hẳn app.
3. Mở lại. Dự án phải nằm trong "Dự án gần đây" với đúng tên video, thời điểm, và các dấu hiệu STT/Dịch/Lồng tiếng.
4. Bấm Mở, rồi bấm Xuất video — phải chạy được ngay, không phải làm lại STT.
5. Bấm Xoá một dự án khác, xác nhận trong hộp thoại, và kiểm thư mục của nó đã biến mất khỏi `%APPDATA%\dichvideo-local\projects\`.
