# M4 Phase A — Retime + Dub Track Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tính `length_scale` riêng cho từng cue để giọng dịch vừa khung thời gian phụ đề, sinh lại đúng những cue tràn, rồi ghép tất cả thành một dải audio `tts/dub.wav` dài bằng video.

**Architecture:** Bốn đơn vị tách rời — `retime.rs` là số học thuần trên (start, boundary, duration, scale); `ScalePlan` trong `tts/mod.rs` mang `length_scale` theo từng cue xuống `run_tts_stage`; `wav.rs` mọc thêm bộ đọc/ghi PCM16 mono; `compose.rs` cộng mẫu vào một bộ đệm im lặng. Không đơn vị nào gọi tiến trình con, nên toàn bộ phase này test được mà không cần ffmpeg hay Piper.

**Tech Stack:** Rust 2021, crate `app_lib` (`src-tauri/`), `serde`/`serde_json`, `tempfile` cho test. Không thêm dependency mới.

**Spec:** `docs/superpowers/specs/2026-09-25-dichvideo-local-m4-retime-compose-export-design.md`

## Global Constraints

- Nền tảng: Windows 11, shell PowerShell. `cargo` KHÔNG có sẵn trên PATH của shell mới — **mọi lệnh cargo phải mở đầu bằng** `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path";` (PowerShell) hoặc `export PATH="$HOME/.cargo/bin:$PATH"` (bash). Bỏ qua bước này thì lệnh báo "cargo: command not found" chứ không phải lỗi code.
- Mọi thông báo lỗi hướng tới người dùng viết **tiếng Việt**, theo giọng các thông báo sẵn có trong `src-tauri/src/error.rs`.
- Không thêm biến thể vào `enum PipelineError`. Lỗi mới dùng lại `PipelineError::Io(String)`.
- `GUARD_MS = 80`, `MIN_LENGTH_SCALE = 0.6` — giá trị chốt trong spec §3.
- `length_scale` **làm tròn 2 chữ số thập phân**. `tts::cache_key` định dạng nó bằng `"{:.3}"`, nên nhiễu float sẽ phá cache và bắt sinh lại toàn bộ ở mỗi lần chạy.
- Ranh giới thời gian của cue là `start_ms` của cue **kế tiếp**, không phải `end_ms` của chính nó. Cue cuối lấy `video_ms`.
- Chỉ tăng tốc, **không bao giờ kéo chậm** cue ngắn cho đầy khe thời gian.
- Test dùng `tempfile::tempdir()`, không được đụng `%APPDATA%` thật.
- Kết thúc mỗi task: `cargo test` phải xanh **và không có warning**. Kho hiện ở mốc **109 passed / 5 ignored** / 0 failed / 0 warnings (114 hàm `#[test]`, 5 trong số đó `#[ignore]`).
- Không push lên remote. Chỉ commit tại chỗ.

## Sai khác có chủ ý so với spec

Spec §3 phác `fit_scale(...) -> f32`. Plan này cho nó trả về `Fit { scale, capped }`.
Lý do: `RetimeResult.capped` ở spec §4 cần biết cue nào chạm trần mà vẫn tràn, và
suy ngược thông tin đó từ một `f32` đã bị chặn dưới là vừa rối vừa dễ sai. Tên hàm
giữ nguyên theo spec; chỉ kiểu trả về giàu hơn.

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `src-tauri/src/retime.rs` (tạo mới) | Số học khớp thời gian. Không I/O, không tiến trình con. |
| `src-tauri/src/compose.rs` (tạo mới) | Ghép các wav cue thành một dải liền mạch. |
| `src-tauri/src/wav.rs` (sửa) | Thêm `WavInfo`/`read_info`/`read_pcm16_mono`/`write_pcm16_mono`; `duration_ms` giữ nguyên chữ ký. |
| `src-tauri/src/tts/mod.rs` (sửa) | Thêm `ScalePlan`. |
| `src-tauri/src/pipeline.rs` (sửa) | `run_tts_stage` nhận `&ScalePlan`; thêm `run_retime_stage`. |
| `src-tauri/src/lib.rs` (sửa) | Khai báo `pub mod retime;` và `pub mod compose;`. |
| `src-tauri/src/commands.rs` (sửa) | Cập nhật chỗ gọi `run_tts_stage`. |
| `src-tauri/tests/tts_scale_plan_test.rs` (tạo mới) | Test `ScalePlan`. |
| `src-tauri/tests/retime_test.rs` (tạo mới) | Bảng giá trị khớp thời gian. |
| `src-tauri/tests/compose_test.rs` (tạo mới) | Test ghép dải audio. |
| `src-tauri/tests/pipeline_retime_test.rs` (tạo mới) | Test `run_retime_stage` đầu-cuối bằng provider giả. |
| `src-tauri/tests/wav_test.rs` (sửa) | Thêm test cho bộ đọc/ghi mới; 10 test cũ phải giữ nguyên và vẫn xanh. |
| `src-tauri/tests/pipeline_tts_test.rs` (sửa) | Cập nhật chỗ gọi; thêm test `length_scale` theo cue xuống tới provider. |
| `src-tauri/tests/e2e_tts_test.rs`, `e2e_tts_many_cues_test.rs` (sửa) | Cập nhật chỗ gọi. |

---

### Task 1: `ScalePlan` và mở rộng `run_tts_stage`

`run_tts_stage` hiện nhận **một** `length_scale: f32` cho cả lượt. M4 cần mỗi cue một giá trị riêng. Đây là thay đổi chữ ký của hàm đã merge ở M3 — mọi chỗ gọi (1 trong `commands.rs`, 14 trong test) phải đổi cùng lúc, nếu không kho không biên dịch được.

**Files:**
- Modify: `src-tauri/src/tts/mod.rs` (thêm `ScalePlan` sau `cache_key`)
- Modify: `src-tauri/src/pipeline.rs:132-270` (`run_tts_stage`)
- Modify: `src-tauri/src/commands.rs:167-173`
- Test: `src-tauri/tests/tts_scale_plan_test.rs` (tạo mới)
- Test: `src-tauri/tests/pipeline_tts_test.rs` (sửa)
- Test: `src-tauri/tests/e2e_tts_test.rs:44,62`, `src-tauri/tests/e2e_tts_many_cues_test.rs:72` (sửa)

**Interfaces:**
- Consumes: `crate::tts::TtsProvider`, `crate::tts::cache_key`, `crate::tts::manifest::{Manifest, SegmentEntry}` (đã có).
- Produces:
  - `app_lib::tts::ScalePlan` với `ScalePlan::uniform(base: f32) -> ScalePlan`, `ScalePlan::per_cue(base: f32, v: Vec<f32>) -> ScalePlan`, `ScalePlan::get(&self, index: usize) -> f32` (index đếm từ 1; ngoài phạm vi trả `base`).
  - `app_lib::pipeline::run_tts_stage(project_dir: &Path, p: &dyn TtsProvider, voice: &str, scales: &ScalePlan, tgt: &str) -> Result<TtsResult, PipelineError>`.

- [ ] **Step 1: Viết test thất bại cho `ScalePlan`**

Tạo `src-tauri/tests/tts_scale_plan_test.rs`:

```rust
use app_lib::tts::ScalePlan;

#[test]
fn uniform_tra_ve_base_cho_moi_index() {
    let p = ScalePlan::uniform(1.25);
    assert_eq!(p.get(1), 1.25);
    assert_eq!(p.get(999), 1.25);
}

#[test]
fn per_cue_dem_tu_1() {
    let p = ScalePlan::per_cue(1.0, vec![0.8, 0.9, 1.1]);
    assert_eq!(p.get(1), 0.8);
    assert_eq!(p.get(2), 0.9);
    assert_eq!(p.get(3), 1.1);
}

#[test]
fn per_cue_ngoai_pham_vi_tra_ve_base() {
    let p = ScalePlan::per_cue(1.0, vec![0.8]);
    assert_eq!(p.get(2), 1.0, "index vượt danh sách phải rơi về base");
    assert_eq!(p.get(0), 1.0, "manifest đếm từ 1, index 0 không hợp lệ");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test tts_scale_plan_test
```
Kỳ vọng: FAIL, "cannot find struct, variant or union type `ScalePlan`".

- [ ] **Step 3: Cài `ScalePlan`**

Thêm vào cuối `src-tauri/src/tts/mod.rs`:

```rust
/// `length_scale` cho từng cue. `index` đếm từ 1, khớp với `SegmentEntry::index`.
#[derive(Debug, Clone)]
pub struct ScalePlan {
    base: f32,
    per_cue: Vec<f32>,
}

impl ScalePlan {
    /// Mọi cue dùng chung một tốc độ.
    pub fn uniform(base: f32) -> Self {
        Self { base, per_cue: Vec::new() }
    }

    /// Tốc độ riêng theo thứ tự cue; `base` là giá trị dự phòng.
    pub fn per_cue(base: f32, v: Vec<f32>) -> Self {
        Self { base, per_cue: v }
    }

    /// Ngoài phạm vi — kể cả `index == 0` — trả về `base`.
    pub fn get(&self, index: usize) -> f32 {
        if index == 0 {
            return self.base;
        }
        self.per_cue.get(index - 1).copied().unwrap_or(self.base)
    }
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test tts_scale_plan_test
```
Kỳ vọng: 3 passed.

- [ ] **Step 5: Đổi chữ ký `run_tts_stage`**

Trong `src-tauri/src/pipeline.rs`, đổi dòng 132-138 từ:

```rust
pub fn run_tts_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    length_scale: f32,
    tgt: &str,
) -> Result<TtsResult, PipelineError> {
```

thành:

```rust
pub fn run_tts_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    scales: &ScalePlan,
    tgt: &str,
) -> Result<TtsResult, PipelineError> {
```

Sửa dòng `use` ở đầu khối TTS (dòng 121) thành:

```rust
use crate::tts::{self, manifest as tts_manifest, ScalePlan, TtsJob, TtsProvider};
```

Trong vòng lặp `for (i, s) in segs.iter().enumerate()`, ngay sau `let index = i + 1;`, chèn:

```rust
        let length_scale = scales.get(index);
```

Không đổi gì khác trong thân hàm — bốn chỗ đang dùng tên `length_scale` (nhánh cue rỗng, `cache_key`, `TtsJob`, hai `SegmentEntry`) nay đọc biến cục bộ mới.

- [ ] **Step 6: Cập nhật chỗ gọi trong `commands.rs`**

`src-tauri/src/commands.rs`, trong `run_tts`, đổi:

```rust
            &cfg.tts.voice,
            cfg.tts.length_scale,
            &tgt,
```

thành:

```rust
            &cfg.tts.voice,
            &crate::tts::ScalePlan::uniform(cfg.tts.length_scale),
            &tgt,
```

Hành vi của nút "Lồng tiếng" không đổi.

- [ ] **Step 7: Cập nhật chỗ gọi trong test**

Trong `src-tauri/tests/pipeline_tts_test.rs`, thêm `ScalePlan` vào dòng `use`:

```rust
use app_lib::tts::{ScalePlan, TtsJob, TtsProvider};
```

rồi thay mọi đối số `1.0,` ở vị trí thứ tư của `run_tts_stage` bằng `&ScalePlan::uniform(1.0),`. Có 12 chỗ ở các dòng 75, 100, 103, 114, 118, 130, 133, 143, 161, 166, 176, 188 — liệt kê lại bằng `grep -n run_tts_stage src-tauri/tests/pipeline_tts_test.rs` thay vì tin vào số dòng này, vì chúng sẽ trôi khi bạn sửa.

Trong `src-tauri/tests/e2e_tts_test.rs` (dòng 44, 62) và `src-tauri/tests/e2e_tts_many_cues_test.rs` (dòng 72), thay `tts_cfg.length_scale,` bằng `&app_lib::tts::ScalePlan::uniform(tts_cfg.length_scale),`.

- [ ] **Step 8: Biên dịch lại toàn kho**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: tất cả xanh, không warning. Nếu còn lỗi "this function takes 5 arguments" thì còn sót chỗ gọi — tìm bằng `grep -rn "run_tts_stage" src-tauri/`.

- [ ] **Step 9: Viết test chứng minh `length_scale` theo cue xuống tới provider**

Đây là test quan trọng nhất của task: không có nó, `ScalePlan` có thể bị bỏ qua hoàn toàn trong `run_tts_stage` mà mọi test khác vẫn xanh.

Trong `src-tauri/tests/pipeline_tts_test.rs`, thêm trường ghi nhận tốc độ vào `FakeTts`:

```rust
struct FakeTts {
    calls: RefCell<Vec<usize>>,
    scales: RefCell<Vec<(usize, f32)>>,
}
```

```rust
impl FakeTts {
    fn new() -> Self {
        FakeTts { calls: RefCell::new(Vec::new()), scales: RefCell::new(Vec::new()) }
    }
    fn generated(&self) -> Vec<usize> {
        self.calls.borrow().clone()
    }
    fn scales(&self) -> Vec<(usize, f32)> {
        self.scales.borrow().clone()
    }
}
```

Trong `synthesize`, ngay sau `self.calls.borrow_mut().push(j.index);` thêm:

```rust
            self.scales.borrow_mut().push((j.index, j.length_scale));
```

Rồi thêm test mới ở cuối file:

```rust
#[test]
fn per_cue_scale_xuong_toi_provider_va_vao_manifest() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(
        dir.path(),
        &[("Một", 0, 1000), ("Hai", 1000, 2000), ("Ba", 2000, 3000)],
    );

    let p = FakeTts::new();
    let plan = ScalePlan::per_cue(1.0, vec![0.7, 0.85]); // cue 3 rơi về base
    run_tts_stage(dir.path(), &p, "v", &plan, "vi").unwrap();

    assert_eq!(p.scales(), vec![(1, 0.7), (2, 0.85), (3, 1.0)]);

    let m: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string(dir.path().join("tts/manifest.json")).unwrap(),
    )
    .unwrap();
    let ls: Vec<f64> = m["segments"]
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["length_scale"].as_f64().unwrap())
        .collect();
    assert_eq!(ls, vec![0.7, 0.85, 1.0]);
}

#[test]
fn doi_scale_mot_cue_chi_sinh_lai_cue_do() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("Một", 0, 1000), ("Hai", 1000, 2000)]);

    let p1 = FakeTts::new();
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = FakeTts::new();
    let plan = ScalePlan::per_cue(1.0, vec![1.0, 0.8]);
    let r = run_tts_stage(dir.path(), &p2, "v", &plan, "vi").unwrap();

    assert_eq!(r.cached, 1, "cue 1 không đổi tốc độ nên phải dùng lại");
    assert_eq!(r.generated, 1);
    assert_eq!(p2.generated(), vec![2], "chỉ cue 2 được sinh lại");
}
```

- [ ] **Step 10: Chạy và xác nhận cả hai test mới xanh**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test pipeline_tts_test
```

Nếu `per_cue_scale_xuong_toi_provider_va_vao_manifest` xanh ngay lần đầu mà bạn chưa chèn `let length_scale = scales.get(index);` ở Step 5, thì test đang xanh vì lý do sai — kiểm lại.

- [ ] **Step 11: Commit**

```bash
git add src-tauri/src/tts/mod.rs src-tauri/src/pipeline.rs src-tauri/src/commands.rs src-tauri/tests/
git commit -m "feat(tts): ScalePlan cho length_scale theo từng cue"
```

---

### Task 2: `retime.rs` — số học khớp thời gian

Đơn vị thuần tính toán: cho biết cue bắt đầu ở đâu, ranh giới ở đâu, giọng đọc dài bao nhiêu và đang ở tốc độ nào, trả về tốc độ mới. Không chạm đĩa.

**Files:**
- Create: `src-tauri/src/retime.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod retime;`)
- Test: `src-tauri/tests/retime_test.rs`

**Interfaces:**
- Consumes: không có gì từ task khác.
- Produces:
  - `app_lib::retime::GUARD_MS: u64 = 80`, `app_lib::retime::MIN_LENGTH_SCALE: f32 = 0.6`
  - `app_lib::retime::FitOpts { pub guard_ms: u64, pub min_scale: f32 }` có `Default`
  - `app_lib::retime::Cue { pub start_ms: u64, pub boundary_ms: u64, pub duration_ms: u64, pub scale: f32 }`
  - `app_lib::retime::Fit { pub scale: f32, pub capped: bool }`
  - `app_lib::retime::quantize(x: f32) -> f32`
  - `app_lib::retime::boundaries(starts: &[u64], video_ms: u64) -> Vec<u64>`
  - `app_lib::retime::fit_scale(c: &Cue, o: &FitOpts) -> Fit`
  - `app_lib::retime::fit_scales(cues: &[Cue], o: &FitOpts) -> Vec<Fit>`

- [ ] **Step 1: Viết bảng test thất bại**

Tạo `src-tauri/tests/retime_test.rs`:

```rust
use app_lib::retime::{boundaries, fit_scale, fit_scales, Cue, FitOpts, MIN_LENGTH_SCALE};

fn cue(start_ms: u64, boundary_ms: u64, duration_ms: u64, scale: f32) -> Cue {
    Cue { start_ms, boundary_ms, duration_ms, scale }
}

#[test]
fn vua_khung_thi_giu_nguyen_toc_do() {
    // budget = 5000 - 0 - 80 = 4920; giọng dài 2000 ⇒ thừa chỗ
    let f = fit_scale(&cue(0, 5000, 2000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 1.0);
    assert!(!f.capped);
}

#[test]
fn khong_bao_gio_keo_cham_cue_ngan() {
    // giọng chỉ dài 1/10 khe — vẫn giữ 1.0, không giãn ra cho đầy
    let f = fit_scale(&cue(0, 10_000, 1000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 1.0);
}

#[test]
fn tran_thi_nhanh_lai_dung_ti_le() {
    // budget = 2000 - 0 - 80 = 1920; giọng dài 2400 ⇒ 1920/2400 = 0.80
    let f = fit_scale(&cue(0, 2000, 2400, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 0.8);
    assert!(!f.capped);
}

#[test]
fn ti_le_nhan_len_toc_do_dang_dung() {
    // đã ở 0.8 sẵn; 0.8 × 1920/2400 = 0.64
    let f = fit_scale(&cue(0, 2000, 2400, 0.8), &FitOpts::default());
    assert_eq!(f.scale, 0.64);
    assert!(!f.capped);
}

#[test]
fn cham_tran_thi_dung_lai_o_min_va_danh_dau_capped() {
    // budget = 920; giọng dài 3000 ⇒ cần 0.307, dưới trần 0.6
    let f = fit_scale(&cue(0, 1000, 3000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, MIN_LENGTH_SCALE);
    assert!(f.capped, "cue này vẫn tràn dù đã đọc nhanh hết cỡ");
}

#[test]
fn hai_cue_sat_nhau_hon_guard_thi_ve_min() {
    // boundary - start = 50 < guard 80 ⇒ budget 0
    let f = fit_scale(&cue(1000, 1050, 2000, 1.0), &FitOpts::default());
    assert_eq!(f.scale, MIN_LENGTH_SCALE);
    assert!(f.capped);
}

#[test]
fn cue_chua_do_duoc_do_dai_thi_giu_nguyen() {
    // duration_ms == 0 là cue rỗng lời hoặc chưa sinh audio — không suy diễn gì
    let f = fit_scale(&cue(0, 100, 0, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 1.0);
    assert!(!f.capped);
}

#[test]
fn lam_tron_2_chu_so() {
    // 1920/2430 = 0.7901234... ⇒ phải ra đúng 0.79, không phải 0.7901234
    let f = fit_scale(&cue(0, 2000, 2430, 1.0), &FitOpts::default());
    assert_eq!(f.scale, 0.79);
}

#[test]
fn boundary_la_start_cua_cue_ke_con_cue_cuoi_lay_do_dai_video() {
    assert_eq!(boundaries(&[0, 1000, 5000], 9000), vec![1000, 5000, 9000]);
}

#[test]
fn boundaries_voi_mot_cue_va_khong_cue() {
    assert_eq!(boundaries(&[0], 3000), vec![3000]);
    assert_eq!(boundaries(&[], 3000), Vec::<u64>::new());
}

#[test]
fn fit_scales_giu_dung_thu_tu() {
    let cues = vec![
        cue(0, 5000, 2000, 1.0),   // vừa
        cue(5000, 7000, 2400, 1.0), // tràn ⇒ 0.8
    ];
    let out = fit_scales(&cues, &FitOpts::default());
    assert_eq!(out.len(), 2);
    assert_eq!(out[0].scale, 1.0);
    assert_eq!(out[1].scale, 0.8);
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test retime_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::retime`".

- [ ] **Step 3: Cài `retime.rs`**

Tạo `src-tauri/src/retime.rs`:

```rust
//! Khớp giọng dịch vào khung thời gian phụ đề bằng cách chọn `length_scale`
//! cho từng cue. Thuần số học: không I/O, không tiến trình con.

/// Khoảng đệm giữa hai câu để chúng không dính vào nhau.
pub const GUARD_MS: u64 = 80;

/// Chặn dưới của `length_scale` (~1.67× tốc độ thường). Dưới ngưỡng này giọng
/// Piper bắt đầu méo, nghe khó chịu hơn là để cue tràn sang khoảng lặng.
pub const MIN_LENGTH_SCALE: f32 = 0.6;

#[derive(Debug, Clone, Copy)]
pub struct FitOpts {
    pub guard_ms: u64,
    pub min_scale: f32,
}

impl Default for FitOpts {
    fn default() -> Self {
        Self { guard_ms: GUARD_MS, min_scale: MIN_LENGTH_SCALE }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Cue {
    pub start_ms: u64,
    /// Mốc cue này không được vượt qua: `start_ms` của cue kế tiếp, hoặc độ dài
    /// video nếu là cue cuối. KHÔNG phải `end_ms` của chính nó — phụ đề thường
    /// kết thúc sớm hơn nhiều so với lúc người kế tiếp mở miệng.
    pub boundary_ms: u64,
    /// Độ dài WAV đã đo được khi sinh ở tốc độ `scale`.
    pub duration_ms: u64,
    pub scale: f32,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Fit {
    pub scale: f32,
    /// `true` khi cue chạm trần tốc độ mà vẫn không vừa khe.
    pub capped: bool,
}

/// Làm tròn 2 chữ số thập phân. `tts::cache_key` định dạng `length_scale` bằng
/// `"{:.3}"`, nên nhiễu float ở chữ số thứ 7 sẽ sinh khoá khác nhau giữa hai
/// lần chạy và bắt sinh lại toàn bộ giọng. Lượng tử hoá là bắt buộc.
pub fn quantize(x: f32) -> f32 {
    (x * 100.0).round() / 100.0
}

/// Mốc chặn của từng cue: `start_ms` của cue sau, cue cuối lấy `video_ms`.
pub fn boundaries(starts: &[u64], video_ms: u64) -> Vec<u64> {
    (0..starts.len())
        .map(|i| if i + 1 < starts.len() { starts[i + 1] } else { video_ms })
        .collect()
}

pub fn fit_scale(c: &Cue, o: &FitOpts) -> Fit {
    if c.duration_ms == 0 {
        return Fit { scale: quantize(c.scale), capped: false };
    }
    let budget = c
        .boundary_ms
        .saturating_sub(c.start_ms)
        .saturating_sub(o.guard_ms);
    if budget == 0 {
        return Fit { scale: quantize(o.min_scale), capped: true };
    }
    if c.duration_ms <= budget {
        return Fit { scale: quantize(c.scale), capped: false };
    }
    let needed = c.scale * budget as f32 / c.duration_ms as f32;
    if needed < o.min_scale {
        Fit { scale: quantize(o.min_scale), capped: true }
    } else {
        Fit { scale: quantize(needed), capped: false }
    }
}

pub fn fit_scales(cues: &[Cue], o: &FitOpts) -> Vec<Fit> {
    cues.iter().map(|c| fit_scale(c, o)).collect()
}
```

Thêm vào `src-tauri/src/lib.rs`, giữ thứ tự alphabet của khối `pub mod`:

```rust
pub mod retime;
```

(đặt giữa `pub mod pipeline;` và `pub mod srt;`)

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test retime_test
```
Kỳ vọng: 11 passed.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm đổi `quantize` thành `pub fn quantize(x: f32) -> f32 { x }` rồi chạy lại. `lam_tron_2_chu_so` PHẢI đỏ. Nếu nó vẫn xanh thì test không kiểm được gì — sửa test trước khi đi tiếp. Khôi phục `quantize` rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/retime.rs src-tauri/src/lib.rs src-tauri/tests/retime_test.rs
git commit -m "feat(retime): tính length_scale từng cue theo ranh giới cue kế"
```

---

### Task 3: `wav.rs` — đọc và ghi PCM16 mono

`compose.rs` cần lấy mẫu ra khỏi wav và ghi mẫu trở lại. `duration_ms` sẵn có đã tự duyệt chunk RIFF; tách phần duyệt đó ra dùng chung thay vì viết bộ duyệt thứ hai.

**Files:**
- Modify: `src-tauri/src/wav.rs` (viết lại toàn bộ, `duration_ms` giữ nguyên chữ ký và hành vi)
- Test: `src-tauri/tests/wav_test.rs` (thêm test, không sửa 10 test cũ)

**Interfaces:**
- Consumes: `crate::error::PipelineError`.
- Produces:
  - `app_lib::wav::WavInfo { pub sample_rate: u32, pub channels: u16, pub bits: u16, pub data_off: usize, pub data_len: usize }`
  - `app_lib::wav::read_info(path: &Path) -> Result<WavInfo, PipelineError>`
  - `app_lib::wav::duration_ms(path: &Path) -> Result<u64, PipelineError>` (không đổi)
  - `app_lib::wav::read_pcm16_mono(path: &Path) -> Result<(u32, Vec<i16>), PipelineError>`
  - `app_lib::wav::write_pcm16_mono(path: &Path, rate: u32, samples: &[i16]) -> Result<(), PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/wav_test.rs` (giữ nguyên helper `make_wav` và 10 test sẵn có):

```rust
use app_lib::wav::{read_info, read_pcm16_mono, write_pcm16_mono};

#[test]
fn read_info_khop_voi_header() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("a.wav");
    make_wav(&p, 22050, 1, 100, 16, false);
    let i = read_info(&p).unwrap();
    assert_eq!(i.sample_rate, 22050);
    assert_eq!(i.channels, 1);
    assert_eq!(i.bits, 16);
    assert_eq!(i.data_len, 200, "100 frame × 2 byte");
}

#[test]
fn read_info_bo_qua_chunk_la_truoc_data() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("b.wav");
    make_wav(&p, 16000, 1, 50, 16, true); // có chunk LIST chen vào
    let i = read_info(&p).unwrap();
    assert_eq!(i.sample_rate, 16000);
    assert_eq!(i.data_len, 100);
}

#[test]
fn ghi_roi_doc_lai_ra_dung_mau() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("rt.wav");
    let src: Vec<i16> = vec![0, 1, -1, 32767, -32768, 1234];
    write_pcm16_mono(&p, 22050, &src).unwrap();

    let (rate, got) = read_pcm16_mono(&p).unwrap();
    assert_eq!(rate, 22050);
    assert_eq!(got, src);
}

#[test]
fn ghi_roi_doc_lai_bang_duration_ms_cu() {
    // Bộ ghi phải tạo ra wav mà bộ duyệt chunk sẵn có đọc được
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("dur.wav");
    write_pcm16_mono(&p, 1000, &vec![0i16; 2500]).unwrap();
    assert_eq!(app_lib::wav::duration_ms(&p).unwrap(), 2500);
}

#[test]
fn tu_choi_stereo() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("st.wav");
    make_wav(&p, 22050, 2, 100, 16, false);
    let e = read_pcm16_mono(&p).unwrap_err();
    let msg = e.to_string();
    assert!(msg.contains("st.wav"), "lỗi phải nêu tên file: {msg}");
    assert!(msg.contains("mono"), "lỗi phải nói rõ cần mono: {msg}");
}

#[test]
fn tu_choi_24_bit() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("b24.wav");
    make_wav(&p, 22050, 1, 100, 24, false);
    let e = read_pcm16_mono(&p).unwrap_err();
    assert!(e.to_string().contains("16"), "lỗi phải nói rõ cần 16-bit");
}

#[test]
fn doc_file_rong_bao_loi_chu_khong_panic() {
    let d = tempfile::tempdir().unwrap();
    let p = d.path().join("empty.wav");
    std::fs::write(&p, b"").unwrap();
    assert!(read_pcm16_mono(&p).is_err());
    assert!(read_info(&p).is_err());
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test wav_test
```
Kỳ vọng: FAIL, "unresolved imports `app_lib::wav::read_info`".

- [ ] **Step 3: Viết lại `wav.rs`**

Thay toàn bộ nội dung `src-tauri/src/wav.rs`:

```rust
use crate::error::PipelineError;
use std::path::Path;

fn u16le(b: &[u8], at: usize) -> u16 {
    u16::from_le_bytes([b[at], b[at + 1]])
}

fn u32le(b: &[u8], at: usize) -> u32 {
    u32::from_le_bytes([b[at], b[at + 1], b[at + 2], b[at + 3]])
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct WavInfo {
    pub sample_rate: u32,
    pub channels: u16,
    pub bits: u16,
    /// Offset byte của thân chunk `data` trong file.
    pub data_off: usize,
    pub data_len: usize,
}

fn bad(path: &Path) -> PipelineError {
    PipelineError::Io(format!("wav không hợp lệ: {}", path.display()))
}

/// Duyệt chunk RIFF thật sự, không giả định header 44 byte.
fn parse(b: &[u8], path: &Path) -> Result<WavInfo, PipelineError> {
    if b.len() < 12 || &b[0..4] != b"RIFF" || &b[8..12] != b"WAVE" {
        return Err(bad(path));
    }

    let mut sample_rate: u32 = 0;
    let mut channels: u16 = 0;
    let mut bits: u16 = 0;
    let mut pos = 12usize;

    while pos + 8 <= b.len() {
        let id = &b[pos..pos + 4];
        let len = u32le(b, pos + 4) as usize;
        let body = pos + 8;
        if body + len > b.len() {
            return Err(bad(path));
        }
        if id == b"fmt " {
            if len < 16 {
                return Err(bad(path));
            }
            channels = u16le(b, body + 2);
            sample_rate = u32le(b, body + 4);
            bits = u16le(b, body + 14);
        } else if id == b"data" {
            if sample_rate == 0 || channels == 0 || bits == 0 {
                return Err(bad(path));
            }
            return Ok(WavInfo { sample_rate, channels, bits, data_off: body, data_len: len });
        }
        // chunk luôn căn chẵn 2 byte
        pos = body + len + (len % 2);
    }
    Err(bad(path))
}

fn read_all(path: &Path) -> Result<Vec<u8>, PipelineError> {
    std::fs::read(path)
        .map_err(|e| PipelineError::Io(format!("không đọc được wav {}: {e}", path.display())))
}

pub fn read_info(path: &Path) -> Result<WavInfo, PipelineError> {
    let b = read_all(path)?;
    parse(&b, path)
}

/// Độ dài (ms) của file WAV PCM.
pub fn duration_ms(path: &Path) -> Result<u64, PipelineError> {
    let i = read_info(path)?;
    let bytes_per_sec = i.sample_rate as u64 * i.channels as u64 * (i.bits as u64 / 8);
    if bytes_per_sec == 0 {
        return Err(bad(path));
    }
    Ok(i.data_len as u64 * 1000 / bytes_per_sec)
}

/// Đọc mẫu PCM 16-bit mono. Không tự downmix, không tự đổi tần số: Piper luôn
/// ra mono 16-bit, nên khác đi là dấu hiệu cache lẫn giữa hai lần cấu hình —
/// im lặng chuyển đổi chỉ giấu lỗi đi.
pub fn read_pcm16_mono(path: &Path) -> Result<(u32, Vec<i16>), PipelineError> {
    let b = read_all(path)?;
    let i = parse(&b, path)?;
    if i.channels != 1 {
        return Err(PipelineError::Io(format!(
            "{} có {} kênh, cần wav mono",
            path.display(),
            i.channels
        )));
    }
    if i.bits != 16 {
        return Err(PipelineError::Io(format!(
            "{} là wav {} bit, cần 16 bit",
            path.display(),
            i.bits
        )));
    }
    let end = i.data_off + (i.data_len - i.data_len % 2);
    let mut v = Vec::with_capacity((end - i.data_off) / 2);
    let mut k = i.data_off;
    while k + 2 <= end {
        v.push(i16::from_le_bytes([b[k], b[k + 1]]));
        k += 2;
    }
    Ok((i.sample_rate, v))
}

/// Ghi wav PCM 16-bit mono chuẩn 44-byte header.
pub fn write_pcm16_mono(path: &Path, rate: u32, samples: &[i16]) -> Result<(), PipelineError> {
    let data_len = samples
        .len()
        .checked_mul(2)
        .and_then(|n| u32::try_from(n).ok())
        .filter(|n| *n <= u32::MAX - 36)
        .ok_or_else(|| {
            PipelineError::Io(format!(
                "dải audio quá dài để ghi vào wav ({} mẫu) — định dạng RIFF giới hạn 4 GB",
                samples.len()
            ))
        })?;

    if let Some(d) = path.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }

    let mut b = Vec::with_capacity(44 + data_len as usize);
    b.extend_from_slice(b"RIFF");
    b.extend_from_slice(&(36 + data_len).to_le_bytes());
    b.extend_from_slice(b"WAVEfmt ");
    b.extend_from_slice(&16u32.to_le_bytes());
    b.extend_from_slice(&1u16.to_le_bytes()); // PCM
    b.extend_from_slice(&1u16.to_le_bytes()); // mono
    b.extend_from_slice(&rate.to_le_bytes());
    b.extend_from_slice(&(rate * 2).to_le_bytes()); // byte/giây
    b.extend_from_slice(&2u16.to_le_bytes()); // block align
    b.extend_from_slice(&16u16.to_le_bytes()); // bits
    b.extend_from_slice(b"data");
    b.extend_from_slice(&data_len.to_le_bytes());
    for s in samples {
        b.extend_from_slice(&s.to_le_bytes());
    }

    std::fs::write(path, b)
        .map_err(|e| PipelineError::Io(format!("không ghi được wav {}: {e}", path.display())))
}
```

- [ ] **Step 4: Chạy toàn bộ `wav_test`**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test wav_test
```
Kỳ vọng: 17 passed (10 cũ + 7 mới). **10 test cũ phải xanh nguyên** — đó là lưới an toàn cho việc tách bộ duyệt chunk. Một test cũ đỏ nghĩa là refactor đã đổi hành vi.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/wav.rs src-tauri/tests/wav_test.rs
git commit -m "feat(wav): read_info/read_pcm16_mono/write_pcm16_mono dùng chung bộ duyệt chunk"
```

---

### Task 4: `compose.rs` — ghép dải tiếng dịch

Cấp một bộ đệm im lặng dài bằng video rồi cộng mẫu của từng cue vào đúng offset. Không qua ffmpeg: một filtergraph `adelay`+`amix` với ~200 cue sẽ vượt giới hạn 32767 ký tự dòng lệnh của Windows.

**Files:**
- Create: `src-tauri/src/compose.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod compose;`)
- Test: `src-tauri/tests/compose_test.rs`

**Interfaces:**
- Consumes: `app_lib::wav::{read_pcm16_mono, write_pcm16_mono}` (Task 3); `app_lib::tts::manifest::{Manifest, SegmentEntry}` (đã có, mọi trường đều `pub`).
- Produces:
  - `app_lib::compose::DubStats { pub placed: usize, pub skipped: usize, pub truncated: usize, pub saturated: usize, pub total_ms: u64 }`
  - `app_lib::compose::build_dub_track(tts_dir: &Path, m: &Manifest, video_ms: u64, out: &Path) -> Result<DubStats, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/compose_test.rs`:

```rust
use app_lib::compose::build_dub_track;
use app_lib::tts::manifest::{Manifest, SegmentEntry};
use app_lib::wav::{read_pcm16_mono, write_pcm16_mono};
use std::path::Path;

/// Ghi 1 cue wav gồm `n` mẫu, mọi mẫu đều bằng `value`.
fn cue_wav(tts_dir: &Path, rel: &str, rate: u32, n: usize, value: i16) {
    let p = tts_dir.join(rel);
    write_pcm16_mono(&p, rate, &vec![value; n]).unwrap();
}

fn seg(index: usize, start_ms: u64, rel: Option<&str>) -> SegmentEntry {
    SegmentEntry {
        index,
        start_ms,
        end_ms: start_ms + 500,
        text: "x".into(),
        audio_path: rel.map(|s| s.to_string()),
        cache_key: rel.map(|_| "k".to_string()),
        length_scale: 1.0,
        duration_ms: 0,
    }
}

fn manifest(rate: u32, segments: Vec<SegmentEntry>) -> Manifest {
    Manifest { version: 1, provider: "fake".into(), voice: "v".into(), sample_rate: rate, segments }
}

#[test]
fn dat_dung_offset_va_do_dai_bang_video() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    // 1000 Hz cho dễ tính: 1 mẫu = 1 ms
    cue_wav(tts, "segments/cue-0001.wav", 1000, 100, 1000);
    cue_wav(tts, "segments/cue-0002.wav", 1000, 100, 2000);

    let m = manifest(
        1000,
        vec![
            seg(1, 0, Some("segments/cue-0001.wav")),
            seg(2, 500, Some("segments/cue-0002.wav")),
        ],
    );

    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 2000, &out).unwrap();

    assert_eq!(st.placed, 2);
    assert_eq!(st.skipped, 0);
    assert_eq!(st.truncated, 0);
    assert_eq!(st.saturated, 0);
    assert_eq!(st.total_ms, 2000);

    let (rate, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(rate, 1000);
    assert_eq!(s.len(), 2000, "dải phải dài đúng bằng video");
    assert_eq!(s[0], 1000, "cue 1 bắt đầu ở mẫu 0");
    assert_eq!(s[99], 1000);
    assert_eq!(s[100], 0, "hết cue 1 là im lặng");
    assert_eq!(s[499], 0);
    assert_eq!(s[500], 2000, "cue 2 bắt đầu ở mẫu 500");
    assert_eq!(s[599], 2000);
    assert_eq!(s[600], 0);
    assert_eq!(s[1999], 0);
}

#[test]
fn cue_khong_co_audio_thi_bo_qua() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0002.wav", 1000, 10, 5);

    let m = manifest(1000, vec![seg(1, 0, None), seg(2, 100, Some("segments/cue-0002.wav"))]);
    let st = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap();
    assert_eq!(st.placed, 1);
    assert_eq!(st.skipped, 0);
}

#[test]
fn offset_qua_cuoi_video_thi_skip() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0001.wav", 1000, 10, 7);

    let m = manifest(1000, vec![seg(1, 5000, Some("segments/cue-0001.wav"))]);
    let st = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap();
    assert_eq!(st.placed, 0);
    assert_eq!(st.skipped, 1);
}

#[test]
fn cue_vuot_cuoi_video_thi_cat_duoi() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0001.wav", 1000, 500, 9);

    let m = manifest(1000, vec![seg(1, 800, Some("segments/cue-0001.wav"))]);
    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 1000, &out).unwrap();

    assert_eq!(st.placed, 1);
    assert_eq!(st.truncated, 1);
    let (_, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(s.len(), 1000);
    assert_eq!(s[800], 9);
    assert_eq!(s[999], 9, "phần vừa trong video vẫn được giữ");
}

#[test]
fn hai_cue_chong_nhau_thi_cong_don_va_dem_bao_hoa() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    // 20000 + 20000 = 40000 > 32767 ⇒ bão hoà
    cue_wav(tts, "segments/cue-0001.wav", 1000, 100, 20000);
    cue_wav(tts, "segments/cue-0002.wav", 1000, 100, 20000);

    let m = manifest(
        1000,
        vec![
            seg(1, 0, Some("segments/cue-0001.wav")),
            seg(2, 50, Some("segments/cue-0002.wav")),
        ],
    );
    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 1000, &out).unwrap();

    assert_eq!(st.placed, 2);
    assert_eq!(st.saturated, 50, "50 mẫu chồng nhau đều chạm trần");

    let (_, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(s[0], 20000, "chưa chồng");
    assert_eq!(s[50], i16::MAX, "chồng ⇒ kẹp ở trần chứ không tràn số âm");
    assert_eq!(s[99], i16::MAX);
    assert_eq!(s[100], 20000, "hết phần chồng");
}

#[test]
fn lech_sample_rate_thi_bao_loi_chu_khong_ghep_bua() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    cue_wav(tts, "segments/cue-0001.wav", 16000, 100, 1);

    let m = manifest(22050, vec![seg(1, 0, Some("segments/cue-0001.wav"))]);
    let e = build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).unwrap_err();
    let msg = e.to_string();
    assert!(msg.contains("16000"), "lỗi phải nêu tần số thật: {msg}");
    assert!(msg.contains("22050"), "lỗi phải nêu tần số manifest: {msg}");
}

#[test]
fn thieu_file_cue_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    let m = manifest(1000, vec![seg(1, 0, Some("segments/khong-ton-tai.wav"))]);
    assert!(build_dub_track(tts, &m, 1000, &tts.join("dub.wav")).is_err());
}

#[test]
fn khong_co_cue_nao_van_ra_dai_im_lang_dung_do_dai() {
    let d = tempfile::tempdir().unwrap();
    let tts = d.path();
    let m = manifest(1000, vec![]);
    let out = tts.join("dub.wav");
    let st = build_dub_track(tts, &m, 1500, &out).unwrap();
    assert_eq!(st.placed, 0);
    let (_, s) = read_pcm16_mono(&out).unwrap();
    assert_eq!(s.len(), 1500);
    assert!(s.iter().all(|v| *v == 0));
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test compose_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::compose`".

- [ ] **Step 3: Cài `compose.rs`**

Tạo `src-tauri/src/compose.rs`:

```rust
//! Ghép các wav cue rời thành một dải audio liền mạch dài bằng video.
//!
//! Không dùng `filter_complex` của ffmpeg: video 10 phút có ~200 cue, tức ~200
//! input và một chuỗi filter dài hàng chục nghìn ký tự — vượt giới hạn 32767
//! ký tự của `CreateProcess` trên Windows, và khi hỏng thì ffmpeg chỉ báo một
//! dòng lỗi cú pháp không chỉ ra cue nào.

use crate::error::PipelineError;
use crate::tts::manifest::Manifest;
use crate::wav;
use std::path::Path;

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DubStats {
    /// Số cue đã đặt được vào dải.
    pub placed: usize,
    /// Cue bắt đầu sau khi video đã hết.
    pub skipped: usize,
    /// Cue bị cắt đuôi vì chạm cuối video.
    pub truncated: usize,
    /// Số mẫu chạm trần do hai cue chồng lên nhau.
    pub saturated: usize,
    pub total_ms: u64,
}

pub fn build_dub_track(
    tts_dir: &Path,
    m: &Manifest,
    video_ms: u64,
    out: &Path,
) -> Result<DubStats, PipelineError> {
    let rate = m.sample_rate;
    if rate == 0 {
        return Err(PipelineError::Io(
            "manifest giọng đọc thiếu sample_rate — xoá thư mục tts/ rồi chạy lại Lồng tiếng".into(),
        ));
    }

    // ceil để không cắt mất mili-giây cuối
    let n = ((video_ms as u128 * rate as u128).div_ceil(1000)) as usize;
    let mut buf = vec![0i16; n];
    let mut st = DubStats { total_ms: video_ms, ..Default::default() };

    for s in &m.segments {
        let rel = match &s.audio_path {
            Some(r) => r,
            None => continue,
        };
        let path = tts_dir.join(rel);
        let (r, samples) = wav::read_pcm16_mono(&path)?;
        if r != rate {
            return Err(PipelineError::Io(format!(
                "{} có tần số {r} Hz nhưng manifest ghi {rate} Hz — xoá thư mục tts/ rồi chạy lại Lồng tiếng",
                path.display()
            )));
        }

        let off = (s.start_ms as u128 * rate as u128 / 1000) as usize;
        if off >= n {
            st.skipped += 1;
            continue;
        }
        let take = samples.len().min(n - off);
        if take < samples.len() {
            st.truncated += 1;
        }
        for (i, v) in samples[..take].iter().enumerate() {
            let dst = &mut buf[off + i];
            let sum = *dst as i32 + *v as i32;
            let clamped = sum.clamp(i16::MIN as i32, i16::MAX as i32);
            if sum != clamped {
                st.saturated += 1;
            }
            *dst = clamped as i16;
        }
        st.placed += 1;
    }

    wav::write_pcm16_mono(out, rate, &buf)?;
    Ok(st)
}
```

Thêm vào `src-tauri/src/lib.rs`, giữ thứ tự alphabet (giữa `pub mod commands;` và `pub mod config;`):

```rust
pub mod compose;
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test compose_test
```
Kỳ vọng: 8 passed.

Nếu `div_ceil` báo lỗi "no method named `div_ceil`", toolchain cũ hơn 1.73 — thay bằng `((video_ms as u128 * rate as u128 + 999) / 1000) as usize`.

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm đổi `let off = ...` thành `let off = 0usize;` rồi chạy lại. `dat_dung_offset_va_do_dai_bang_video` PHẢI đỏ ở dòng `assert_eq!(s[500], 2000)`. Khôi phục rồi chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/compose.rs src-tauri/src/lib.rs src-tauri/tests/compose_test.rs
git commit -m "feat(compose): ghép wav cue thành dub track trong Rust"
```

---

### Task 5: `run_retime_stage` — nối retime vào pipeline

Đọc manifest của lượt TTS đầu, tính tốc độ mới cho từng cue, gọi lại `run_tts_stage` với `ScalePlan::per_cue`. Cue vừa khung sẵn được dùng lại từ cache; chỉ cue tràn mới sinh lại.

**Files:**
- Modify: `src-tauri/src/pipeline.rs` (thêm vào cuối file)
- Test: `src-tauri/tests/pipeline_retime_test.rs`

**Interfaces:**
- Consumes: `app_lib::retime::{boundaries, fit_scales, quantize, Cue, FitOpts}` (Task 2); `app_lib::tts::ScalePlan` và `run_tts_stage(.., &ScalePlan, ..)` (Task 1); `app_lib::tts::manifest::load` (đã có).
- Produces:
  - `app_lib::pipeline::RetimeResult { pub adjusted: usize, pub capped: usize, pub tts: TtsResult }`
  - `app_lib::pipeline::run_retime_stage(project_dir: &Path, p: &dyn TtsProvider, voice: &str, base_scale: f32, video_ms: u64, opts: &FitOpts, tgt: &str) -> Result<RetimeResult, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Tạo `src-tauri/tests/pipeline_retime_test.rs`:

```rust
use app_lib::error::PipelineError;
use app_lib::pipeline::{run_retime_stage, run_tts_stage};
use app_lib::retime::FitOpts;
use app_lib::tts::{ScalePlan, TtsJob, TtsProvider};
use std::cell::RefCell;
use std::path::Path;

/// Provider giả có độ dài phụ thuộc `length_scale`: mỗi cue dài
/// `base_ms[index-1] × length_scale`. Đó là cách duy nhất để kiểm rằng lượt 2
/// thật sự rút ngắn giọng chứ không chỉ ghi một con số khác vào manifest.
struct ScaledTts {
    base_ms: Vec<u64>,
    generated: RefCell<Vec<(usize, f32)>>,
}

impl ScaledTts {
    fn new(base_ms: Vec<u64>) -> Self {
        ScaledTts { base_ms, generated: RefCell::new(Vec::new()) }
    }
    fn generated(&self) -> Vec<(usize, f32)> {
        self.generated.borrow().clone()
    }
}

impl TtsProvider for ScaledTts {
    fn id(&self) -> &'static str { "scaled" }
    fn sample_rate(&self) -> u32 { 1000 } // 1 mẫu = 1 ms, dễ đối chiếu
    fn synthesize(&self, jobs: &[TtsJob], on_done: &mut dyn FnMut(usize)) -> Result<(), PipelineError> {
        for j in jobs {
            let base = self.base_ms[j.index - 1];
            let ms = (base as f32 * j.length_scale).round() as usize;
            app_lib::wav::write_pcm16_mono(&j.out, 1000, &vec![0i16; ms]).unwrap();
            self.generated.borrow_mut().push((j.index, j.length_scale));
            on_done(j.index);
        }
        Ok(())
    }
}

fn write_translated(dir: &Path, cues: &[(&str, u64, u64)]) {
    let sub = dir.join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let segs: Vec<app_lib::srt::Segment> = cues
        .iter()
        .map(|(t, a, b)| app_lib::srt::Segment { start_ms: *a, end_ms: *b, text: t.to_string() })
        .collect();
    std::fs::write(sub.join("translated.vi.srt"), app_lib::srt::write_srt(&segs)).unwrap();
}

fn manifest_of(dir: &Path) -> serde_json::Value {
    serde_json::from_str(&std::fs::read_to_string(dir.join("tts/manifest.json")).unwrap()).unwrap()
}

#[test]
fn chi_sinh_lai_cue_tran_va_ghi_toc_do_moi_vao_manifest() {
    let dir = tempfile::tempdir().unwrap();
    // cue 1 ở 0, cue 2 ở 5000; video dài 10000
    // cue 1: boundary 5000, budget 5000-0-80 = 4920, giọng gốc 6000 ⇒ 4920/6000 = 0.82
    // cue 2: boundary 10000, budget 4920, giọng gốc 2000 ⇒ vừa, giữ 1.0
    write_translated(dir.path(), &[("Câu dài", 0, 3000), ("Câu ngắn", 5000, 6000)]);

    let p1 = ScaledTts::new(vec![6000, 2000]);
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();
    let m1 = manifest_of(dir.path());
    assert_eq!(m1["segments"][0]["duration_ms"].as_u64().unwrap(), 6000);

    let p2 = ScaledTts::new(vec![6000, 2000]);
    let r = run_retime_stage(dir.path(), &p2, "v", 1.0, 10_000, &FitOpts::default(), "vi").unwrap();

    assert_eq!(r.adjusted, 1, "chỉ cue 1 đổi tốc độ");
    assert_eq!(r.capped, 0);
    assert_eq!(r.tts.generated, 1, "chỉ cue 1 được sinh lại");
    assert_eq!(r.tts.cached, 1, "cue 2 dùng lại wav cũ");
    assert_eq!(p2.generated(), vec![(1, 0.82)]);

    let m2 = manifest_of(dir.path());
    assert!((m2["segments"][0]["length_scale"].as_f64().unwrap() - 0.82).abs() < 1e-6);
    assert_eq!(m2["segments"][0]["duration_ms"].as_u64().unwrap(), 4920,
        "giọng mới phải vừa đúng ngân sách");
    assert!((m2["segments"][1]["length_scale"].as_f64().unwrap() - 1.0).abs() < 1e-6);
    assert_eq!(m2["segments"][1]["duration_ms"].as_u64().unwrap(), 2000);
}

#[test]
fn cue_cuoi_lay_do_dai_video_lam_ranh_gioi() {
    let dir = tempfile::tempdir().unwrap();
    // một cue duy nhất ở 0; video 3000 ⇒ budget 2920, giọng gốc 5840 ⇒ 0.5 ⇒ chạm trần 0.6
    write_translated(dir.path(), &[("Chỉ một câu", 0, 1000)]);

    let p1 = ScaledTts::new(vec![5840]);
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = ScaledTts::new(vec![5840]);
    let r = run_retime_stage(dir.path(), &p2, "v", 1.0, 3000, &FitOpts::default(), "vi").unwrap();

    assert_eq!(r.adjusted, 1);
    assert_eq!(r.capped, 1, "đọc nhanh hết cỡ vẫn không vừa");
    assert_eq!(p2.generated(), vec![(1, 0.6)]);
}

#[test]
fn khong_doi_gi_thi_khong_sinh_lai_cue_nao() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("A", 0, 1000), ("B", 5000, 6000)]);

    let p1 = ScaledTts::new(vec![1000, 1000]);
    run_tts_stage(dir.path(), &p1, "v", &ScalePlan::uniform(1.0), "vi").unwrap();

    let p2 = ScaledTts::new(vec![1000, 1000]);
    let r = run_retime_stage(dir.path(), &p2, "v", 1.0, 10_000, &FitOpts::default(), "vi").unwrap();

    assert_eq!(r.adjusted, 0);
    assert_eq!(r.capped, 0);
    assert_eq!(r.tts.generated, 0);
    assert_eq!(r.tts.cached, 2);
    assert!(p2.generated().is_empty());
}

#[test]
fn chua_chay_long_tieng_thi_bao_loi_ro_rang() {
    let dir = tempfile::tempdir().unwrap();
    write_translated(dir.path(), &[("A", 0, 1000)]);

    let p = ScaledTts::new(vec![1000]);
    let e = run_retime_stage(dir.path(), &p, "v", 1.0, 5000, &FitOpts::default(), "vi").unwrap_err();
    let msg = e.to_string();
    assert!(msg.contains("Lồng tiếng"), "thông báo phải chỉ ra bước còn thiếu: {msg}");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test pipeline_retime_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::pipeline::run_retime_stage`".

- [ ] **Step 3: Cài `run_retime_stage`**

Thêm vào cuối `src-tauri/src/pipeline.rs`:

```rust
use crate::retime::{self, FitOpts};

#[derive(Debug)]
pub struct RetimeResult {
    /// Số cue đổi `length_scale` so với lượt trước.
    pub adjusted: usize,
    /// Số cue đã đọc nhanh hết cỡ mà vẫn tràn sang cue sau.
    pub capped: usize,
    pub tts: TtsResult,
}

/// Lượt hai của TTS: đọc độ dài thật từ manifest lượt một, chọn `length_scale`
/// cho từng cue, rồi sinh lại đúng những cue tràn. `cache_key` đã băm
/// `length_scale` nên cue không đổi tốc độ được dùng lại nguyên.
pub fn run_retime_stage(
    project_dir: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    video_ms: u64,
    opts: &FitOpts,
    tgt: &str,
) -> Result<RetimeResult, PipelineError> {
    let manifest_path = project_dir.join("tts").join("manifest.json");
    let m = tts_manifest::load(&manifest_path).ok_or_else(|| {
        PipelineError::Io(format!(
            "Chưa có giọng đọc — chạy Lồng tiếng trước ({})",
            manifest_path.display()
        ))
    })?;

    let starts: Vec<u64> = m.segments.iter().map(|s| s.start_ms).collect();
    let bounds = retime::boundaries(&starts, video_ms);
    let cues: Vec<retime::Cue> = m
        .segments
        .iter()
        .zip(bounds.iter())
        .map(|(s, b)| retime::Cue {
            start_ms: s.start_ms,
            boundary_ms: *b,
            duration_ms: s.duration_ms,
            scale: s.length_scale,
        })
        .collect();

    let fits = retime::fit_scales(&cues, opts);
    let adjusted = fits
        .iter()
        .zip(cues.iter())
        .filter(|(f, c)| (f.scale - retime::quantize(c.scale)).abs() > 1e-6)
        .count();
    let capped = fits.iter().filter(|f| f.capped).count();

    let scales: Vec<f32> = fits.iter().map(|f| f.scale).collect();
    let plan = ScalePlan::per_cue(base_scale, scales);
    let tts = run_tts_stage(project_dir, p, voice, &plan, tgt)?;

    Ok(RetimeResult { adjusted, capped, tts })
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test pipeline_retime_test
```
Kỳ vọng: 4 passed.

- [ ] **Step 5: Chạy toàn bộ và soi warning**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: tất cả xanh, **0 warning**, 5 ignored (các test E2E có cổng môi trường). Số test tăng đúng 35 so với mốc M3 là 109, tức 144 passed: 3 (`ScalePlan`) + 2 (pipeline per-cue) + 11 (retime) + 7 (wav) + 8 (compose) + 4 (retime pipeline). Thiếu test nào so với con số này nghĩa là một bước ở trên chưa làm xong — đối chiếu từng file chứ đừng bỏ qua.

Nếu `cargo` báo warning "unused import" ở `pipeline.rs`, đó là do `use crate::retime::{self, FitOpts};` đặt trùng — gộp vào khối `use` sẵn có thay vì thêm dòng mới.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/pipeline.rs src-tauri/tests/pipeline_retime_test.rs
git commit -m "feat(pipeline): run_retime_stage sinh lại cue tràn với length_scale riêng"
```

---

## Nghiệm thu Phase A

Sau Task 5, một người có thể chạy thủ công: `run_stt` → `run_translate` → `run_tts` → `run_retime_stage` → `build_dub_track`, rồi mở `tts/dub.wav` bằng bất kỳ trình phát nào và nghe thấy giọng Việt rơi đúng chỗ, xen giữa là im lặng. Đó là mốc kiểm chứng thật của phase này — chưa cần ffmpeg, chưa cần video.

Phase B (`docs/superpowers/plans/2026-09-25-dichvideo-local-m4b-export.md`) nối phần còn lại: hỏi `ffprobe` độ dài video, trộn với tiếng gốc, mux ra mp4.
