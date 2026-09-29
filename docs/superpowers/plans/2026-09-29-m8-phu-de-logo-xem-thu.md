# M8 — Kiểu chữ phụ đề, logo đóng dấu, xem thử trong app — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho người dùng chỉnh kiểu chữ phụ đề mà không phải tick burn-in, đóng dấu một file PNG lên video xuất ra, và xem thử phụ đề + logo ngay trong app trước khi chờ ffmpeg.

**Architecture:** Phía Rust thêm `WatermarkConfig` vào `AppConfig` và `Watermark` vào `ExportOpts`; `build_filter_complex` dựng chuỗi `overlay` bằng số pixel đã tính sẵn nên vẫn là hàm thuần, test được không cần ffmpeg. Phía UI tách Bước 6 thành hai tab (Phụ đề & Logo / Xuất video) và thêm một trình phát HTML vẽ phụ đề + logo đè lên `<video>`, lấy cue từ `list_cues` đã có.

**Tech Stack:** Rust + Tauri 2 (`protocol-asset`), React 19 + TypeScript, ffmpeg CLI (filter `subtitles`, `overlay`, `colorchannelmixer`), WebAudio.

**Spec:** `docs/superpowers/specs/2026-09-29-dichvideo-local-m8-phu-de-logo-xem-thu-design.md`

## Global Constraints

- Mọi trường mới trong `config.rs` phải có `#[serde(default = "…")]` trỏ tới một hàm trả đúng giá trị mặc định. **`#[serde(default)]` trần là SAI cho trường có mặc định khác zero**: nó dùng `Default` của *kiểu* (`u32` → 0, `f32` → 0.0, `String` → ""), không phải `impl Default` của struct. `size_pct` sẽ thành 0 và logo biến mất.
- `parse_config_or_default` (`config.rs:177-182`) nuốt mọi lỗi deserialize thành `AppConfig::default()`. Một trường sai kiểu ⇒ người dùng mất `api_key`, `base_url`, giọng đã chọn. Mọi task đụng config phải có test đọc lại một `config.json` kiểu cũ.
- Màu ASS đảo kênh (BGR) — dùng `ass_color()` có sẵn (`export.rs:344-359`), đừng tự format hex.
- Filtergraph chạy với `current_dir` = `<project>\subtitles` (`export.rs:96-101`). Đường dẫn tuyệt đối Windows trong filtergraph là hỏng; logo đi qua `-i` chứ không nhúng vào chuỗi filter.
- Bình luận code trong repo này viết bằng tiếng Việt và giải thích *vì sao*, không phải *cái gì*. Theo đúng lối đó.
- Test đặt ở `src-tauri/tests/<ten>_test.rs`, dùng `app_lib::` để import. Chạy: `cargo test --manifest-path src-tauri/Cargo.toml`.
- Frontend không có bộ test. UI kiểm bằng `npm run build` (tsc + vite) cộng test Rust đọc `App.tsx` theo đúng lối `tests/hang_so_ui_test.rs`.

## Review Focus

Năm lớp đầu vào spec ngụ ý nhưng không task nào tự nhiên chạm tới. Mỗi dòng đã được gắn test vào task sở hữu code.

1. **`config.json` kiểu cũ không có khoá `watermark`** — phải đọc được và giữ nguyên `api_key`/`voice`, không lùi về default toàn bộ. → Task 1, test `config_cu_khong_co_watermark_van_giu_nguyen_cau_hinh`.
2. **`enabled = true` nhưng `path` rỗng hoặc file đã bị xoá** — phải bỏ qua logo và xuất bình thường, không để ffmpeg chết với "No such file" mà UI hiện thành lỗi khó hiểu. → Task 3, test `logo_thieu_file_thi_xuat_nhu_khong_co_logo` + nhánh lọc ở Step 5.
3. **`size_pct` = 0 hoặc > 100, `opacity` ngoài 0..1, `margin_pct` đẩy logo ra khỏi khung** — phải kẹp về khoảng hợp lệ, không sinh `scale=0:-1` (ffmpeg lỗi) hay logo vô hình. → Task 2, test `gia_tri_vo_ly_bi_kep`.
4. **`corner` mang giá trị lạ** (người dùng sửa tay `config.json`, hoặc khoá thiếu nên thành `""`) — phải lùi về `br`, không panic, không làm hỏng cả config. → Task 2, test `goc_la_lui_ve_duoi_phai`.
5. **Video gốc là `.mkv`, hoặc đã bị xoá sau khi tạo dự án** — trình phát không được ra ô đen câm không lời giải thích. → Task 7, test `ui_bao_ro_mkv_khong_xem_thu_duoc` + kiểm tay ở Step 7 đường hỏng 1 và 2.

---

### Task 1: `WatermarkConfig` trong `AppConfig`

**Files:**
- Modify: `src-tauri/src/config.rs` (thêm struct sau `SubtitleConfig`, dòng ~84; thêm trường vào `AppConfig` dòng 29-42)
- Test: `src-tauri/tests/config_test.rs` (thêm vào cuối)

**Interfaces:**
- Consumes: không có.
- Produces: `app_lib::config::WatermarkConfig { enabled: bool, path: String, corner: String, size_pct: u32, opacity: f32, margin_pct: u32 }`, trường `AppConfig::watermark: WatermarkConfig`.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/config_test.rs`:

```rust
use app_lib::config::WatermarkConfig;

#[test]
fn watermark_mac_dinh_dung_spec() {
    let w = WatermarkConfig::default();
    assert!(!w.enabled);
    assert_eq!(w.path, "");
    assert_eq!(w.corner, "br");
    assert_eq!(w.size_pct, 12);
    assert_eq!(w.opacity, 0.85);
    assert_eq!(w.margin_pct, 3);
}

/// Config kiểu M7 không có khoá `watermark`. Phải đọc được VÀ giữ nguyên mọi
/// thứ khác — `parse_config_or_default` nuốt lỗi thành default toàn bộ, nên
/// một lỗi ở đây là người dùng mất sạch api_key mà không có thông báo nào.
#[test]
fn config_cu_khong_co_watermark_van_giu_nguyen_cau_hinh() {
    let cu = r#"{
        "translate": {
            "default_provider": "openai_compat",
            "target_lang": "vi",
            "openai": {
                "base_url": "https://integrate.api.nvidia.com/v1",
                "api_key": "nvapi-giu-lai-duoc",
                "model": "openai/gpt-oss-20b",
                "context": "phim"
            }
        },
        "subtitle": { "font": "Tahoma", "size": 30, "color": "#FFEE00",
                      "outline_color": "#000000", "outline": 3 },
        "tts": { "default_provider": "vieneu", "voice": "dv_vi_002", "length_scale": 1.0 },
        "compose": { "volume_original": 0.18, "volume_dub": 3.0, "guard_ms": 120,
                     "min_length_scale": 0.7, "crf": 20, "preset": "medium" }
    }"#;
    let c = app_lib::config::parse_config_or_default(cu);
    assert_eq!(c.translate.openai.api_key, "nvapi-giu-lai-duoc");
    assert_eq!(c.tts.voice, "dv_vi_002");
    assert_eq!(c.subtitle.font, "Tahoma");
    // Khoá thiếu ⇒ mặc định ĐẦY ĐỦ, không phải zero của kiểu.
    assert_eq!(c.watermark.size_pct, 12);
    assert_eq!(c.watermark.corner, "br");
    assert_eq!(c.watermark.opacity, 0.85);
    assert_eq!(c.watermark.margin_pct, 3);
}

/// Khoá `watermark` có nhưng THIẾU vài trường bên trong — cùng cái bẫy, một
/// tầng sâu hơn.
#[test]
fn watermark_thieu_truong_van_dung_mac_dinh_that() {
    let j = r#"{ "watermark": { "enabled": true, "path": "E:\\logo.png" } }"#;
    let c = app_lib::config::parse_config_or_default(j);
    assert!(c.watermark.enabled);
    assert_eq!(c.watermark.path, r"E:\logo.png");
    assert_eq!(c.watermark.size_pct, 12, "thiếu size_pct phải ra 12, không phải 0");
    assert_eq!(c.watermark.opacity, 0.85);
    assert_eq!(c.watermark.corner, "br");
}

#[test]
fn watermark_roundtrip_json() {
    let mut c = app_lib::config::AppConfig::default();
    c.watermark.enabled = true;
    c.watermark.path = r"E:\anh\logo kenh.png".into();
    c.watermark.corner = "tl".into();
    let s = serde_json::to_string(&c).unwrap();
    let back: app_lib::config::AppConfig = serde_json::from_str(&s).unwrap();
    assert!(back.watermark.enabled);
    assert_eq!(back.watermark.path, r"E:\anh\logo kenh.png");
    assert_eq!(back.watermark.corner, "tl");
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test config_test`
Expected: FAIL — `no WatermarkConfig in app_lib::config`.

- [ ] **Step 3: Cài đặt**

Thêm vào `src-tauri/src/config.rs`, ngay sau `impl Default for SubtitleConfig` (dòng ~84):

```rust
/// Logo đóng dấu lên video lúc xuất.
///
/// Mọi trường đều `#[serde(default = "…")]` trỏ tới hàm riêng chứ không phải
/// `#[serde(default)]` trần: serde lấy `Default` của KIỂU, nên `size_pct` thiếu
/// khoá sẽ thành 0 và ffmpeg nhận `scale=0:-1` — logo biến mất mà không báo gì.
/// `impl Default` của struct KHÔNG được serde dùng cho từng trường.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WatermarkConfig {
    #[serde(default)]
    pub enabled: bool,
    /// Đường dẫn file PNG. "" = chưa chọn.
    #[serde(default)]
    pub path: String,
    /// "tl" | "tr" | "bl" | "br". Là String chứ không phải enum: một giá trị lạ
    /// trong enum làm hỏng deserialize CẢ file config, mà hậu quả của việc đó
    /// (mất sạch cấu hình) nặng hơn nhiều so với việc logo đặt nhầm góc.
    #[serde(default = "wm_goc")]
    pub corner: String,
    /// Bề ngang logo, tính theo % bề ngang video.
    #[serde(default = "wm_size_pct")]
    pub size_pct: u32,
    /// 0.0–1.0.
    #[serde(default = "wm_opacity")]
    pub opacity: f32,
    /// Khoảng cách từ mép, tính theo % bề ngang video.
    #[serde(default = "wm_margin_pct")]
    pub margin_pct: u32,
}

fn wm_goc() -> String { "br".into() }
fn wm_size_pct() -> u32 { 12 }
fn wm_opacity() -> f32 { 0.85 }
fn wm_margin_pct() -> u32 { 3 }

impl Default for WatermarkConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            path: String::new(),
            corner: wm_goc(),
            size_pct: wm_size_pct(),
            opacity: wm_opacity(),
            margin_pct: wm_margin_pct(),
        }
    }
}
```

Thêm trường vào `AppConfig` (sau `compose`, dòng ~41):

```rust
    #[serde(default)]
    pub watermark: WatermarkConfig,
```

- [ ] **Step 4: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test config_test`
Expected: PASS, cả 4 test mới và toàn bộ test cũ.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/config.rs src-tauri/tests/config_test.rs
git commit -m "feat(config): thêm WatermarkConfig, mặc định thật cho từng trường"
```

---

### Task 2: `Watermark` + chuỗi filter `overlay`

**Files:**
- Modify: `src-tauri/src/export.rs` (thêm struct cạnh `SubStyle` dòng ~317; sửa `ExportOpts` dòng 103-116; viết lại `build_filter_complex` dòng 125-169)
- Modify: `src-tauri/tests/export_args_test.rs` (sửa helper `opts`, sửa 2 call site của `build_filter_complex` ở dòng 57 và 82)
- Test: `src-tauri/tests/export_args_test.rs`

**Interfaces:**
- Consumes: `app_lib::config::WatermarkConfig` (Task 1) — chỉ để biết tên trường; task này không import nó.
- Produces:
  - `app_lib::export::Goc` — enum `{ TrenTrai, TrenPhai, DuoiTrai, DuoiPhai }`, có `Goc::tu_chuoi(&str) -> Goc`.
  - `app_lib::export::Watermark { corner: Goc, logo_w_px: u32, margin_px: u32, opacity: f32 }`, có `Watermark::moi(corner: &str, video_w: u32, size_pct: u32, margin_pct: u32, opacity: f32) -> Watermark` (tự kẹp giá trị) và `Watermark::overlay_xy(&self) -> String`.
  - `ExportOpts.watermark: Option<Watermark>`.
  - Chữ ký mới: `build_filter_complex(o: &ExportOpts, co_srt_input: bool) -> String`.

- [ ] **Step 1: Sửa helper test cho biên dịch được với trường mới**

Trong `src-tauri/tests/export_args_test.rs`, sửa `opts` (dòng 22-34) thành:

```rust
fn opts(burn: bool, soft: bool, has_audio: bool) -> ExportOpts {
    ExportOpts {
        burn_subs: burn,
        soft_subs: soft,
        has_audio,
        volume_original: 0.18,
        volume_dub: 3.0,
        crf: 20,
        preset: "medium".into(),
        style: None,
        watermark: None,
    }
}
```

Và sửa hai call site thành `build_filter_complex(&opts(false, false, true), false)` (dòng 57) và `build_filter_complex(&opts(false, false, false), false)` (dòng 82).

- [ ] **Step 2: Viết test thất bại**

Thêm vào cuối `src-tauri/tests/export_args_test.rs`:

```rust
use app_lib::export::{Goc, Watermark};

fn wm(corner: &str) -> Watermark {
    // video 1920 rộng, 12% ⇒ 230px; lề 3% ⇒ 57px
    Watermark::moi(corner, 1920, 12, 3, 0.85)
}

#[test]
fn watermark_tinh_pixel_tu_phan_tram() {
    let w = wm("br");
    assert_eq!(w.logo_w_px, 230);
    assert_eq!(w.margin_px, 57);
    assert_eq!(w.opacity, 0.85);
}

#[test]
fn goc_la_lui_ve_duoi_phai() {
    assert_eq!(Goc::tu_chuoi("tl"), Goc::TrenTrai);
    assert_eq!(Goc::tu_chuoi("TR"), Goc::TrenPhai);
    assert_eq!(Goc::tu_chuoi("bl"), Goc::DuoiTrai);
    assert_eq!(Goc::tu_chuoi("br"), Goc::DuoiPhai);
    // Người dùng sửa tay config, hoặc khoá thiếu nên thành "".
    assert_eq!(Goc::tu_chuoi("xyz"), Goc::DuoiPhai);
    assert_eq!(Goc::tu_chuoi(""), Goc::DuoiPhai);
}

#[test]
fn toa_do_bon_goc() {
    assert_eq!(wm("tl").overlay_xy(), "57:57");
    assert_eq!(wm("tr").overlay_xy(), "main_w-overlay_w-57:57");
    assert_eq!(wm("bl").overlay_xy(), "57:main_h-overlay_h-57");
    assert_eq!(wm("br").overlay_xy(), "main_w-overlay_w-57:main_h-overlay_h-57");
}

/// Giá trị vô lý phải bị kẹp chứ không đẻ ra `scale=0:-1` (ffmpeg lỗi cứng)
/// hay logo đẩy hẳn ra ngoài khung hình.
#[test]
fn gia_tri_vo_ly_bi_kep() {
    assert_eq!(Watermark::moi("br", 1920, 0, 3, 0.85).logo_w_px, 19, "0% phải kẹp lên 1%");
    assert_eq!(Watermark::moi("br", 1920, 500, 3, 0.85).logo_w_px, 1920, "quá 100% kẹp về bề ngang video");
    assert_eq!(Watermark::moi("br", 1920, 12, 90, 0.85).margin_px, 768, "lề kẹp ở 40%");
    assert_eq!(Watermark::moi("br", 1920, 12, 3, 5.0).opacity, 1.0);
    assert_eq!(Watermark::moi("br", 1920, 12, 3, -2.0).opacity, 0.0);
    // Video bé xíu vẫn phải ra ít nhất 1px, không bao giờ 0.
    assert_eq!(Watermark::moi("br", 4, 12, 3, 0.85).logo_w_px, 1);
}

#[test]
fn filter_co_logo_khong_burn_in() {
    let mut o = opts(false, false, true);
    o.watermark = Some(wm("br"));
    let f = build_filter_complex(&o, false);
    // Không burn-in ⇒ logo ăn thẳng [0:v]; input logo là index 2.
    assert!(f.contains("[2:v]format=rgba,colorchannelmixer=aa=0.85,scale=230:-1[wm]"), "{f}");
    assert!(f.contains("[0:v][wm]overlay=main_w-overlay_w-57:main_h-overlay_h-57[v]"), "{f}");
    assert!(!f.contains("subtitles="), "không tick burn-in thì không được có filter subtitles: {f}");
}

#[test]
fn filter_co_ca_burn_in_lan_logo_noi_tiep_nhau() {
    let mut o = opts(true, false, true);
    o.watermark = Some(wm("tl"));
    let f = build_filter_complex(&o, false);
    assert!(f.contains(&format!("[0:v]subtitles={BURN_SRT_NAME}[vs]")), "{f}");
    assert!(f.contains("[vs][wm]overlay=57:57[v]"), "{f}");
    // Chỉ đúng MỘT nhãn [v] ở đầu ra cuối cùng.
    assert_eq!(f.matches("[v]").count(), 1, "{f}");
}

/// Chỉ số input của logo trượt khi có thêm input srt cho phụ đề bật/tắt được.
#[test]
fn chi_so_input_logo_truot_khi_co_soft_srt() {
    let mut o = opts(false, true, true);
    o.watermark = Some(wm("br"));
    let co_srt = build_filter_complex(&o, true);
    assert!(co_srt.contains("[3:v]format=rgba"), "có srt ⇒ logo là input 3: {co_srt}");
    let khong_srt = build_filter_complex(&o, false);
    assert!(khong_srt.contains("[2:v]format=rgba"), "không srt ⇒ logo là input 2: {khong_srt}");
}

#[test]
fn khong_co_logo_thi_filter_giu_nguyen_nhu_cu() {
    let f = build_filter_complex(&opts(true, false, true), false);
    assert!(f.contains(&format!("[0:v]subtitles={BURN_SRT_NAME}[v]")), "{f}");
    assert!(!f.contains("overlay"), "{f}");
    assert!(!f.contains("[wm]"), "{f}");
}
```

- [ ] **Step 3: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test export_args_test`
Expected: FAIL — `cannot find type Watermark in app_lib::export`.

- [ ] **Step 4: Thêm `Goc` và `Watermark`**

Thêm vào `src-tauri/src/export.rs`, ngay trước `impl Default for SubStyle` (dòng ~331):

```rust
/// Góc đặt logo trên khung hình.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Goc {
    TrenTrai,
    TrenPhai,
    DuoiTrai,
    DuoiPhai,
}

impl Goc {
    /// Giá trị lạ lùi về dưới-phải thay vì lỗi: `corner` trong config là String
    /// nên nó có thể mang bất cứ thứ gì người dùng gõ vào, và đặt nhầm góc thì
    /// nhìn là thấy, còn làm hỏng cả file config thì không.
    pub fn tu_chuoi(s: &str) -> Goc {
        match s.trim().to_ascii_lowercase().as_str() {
            "tl" => Goc::TrenTrai,
            "tr" => Goc::TrenPhai,
            "bl" => Goc::DuoiTrai,
            _ => Goc::DuoiPhai,
        }
    }
}

/// Logo đã quy ra pixel trên khung hình thật.
///
/// Quy đổi %→pixel làm ở đây chứ không nhét vào filtergraph, vì filter `scale`
/// đặt trên luồng logo không thấy được kích thước video (`main_w` chỉ tồn tại
/// trong ngữ cảnh của `overlay`). Có `scale2ref` làm được việc đó nhưng nó đã
/// bị đánh dấu loại bỏ ở ffmpeg mới. Tính sẵn bằng Rust cho chuỗi filter thành
/// hàm thuần, test được không cần chạy ffmpeg.
#[derive(Debug, Clone, PartialEq)]
pub struct Watermark {
    pub corner: Goc,
    pub logo_w_px: u32,
    pub margin_px: u32,
    pub opacity: f32,
}

impl Watermark {
    /// `video_w` là bề ngang video thật, lấy từ `probe_video_size`.
    ///
    /// Mọi giá trị bị kẹp: `scale=0:-1` làm ffmpeg lỗi cứng giữa chừng buổi
    /// xuất, còn lề quá lớn đẩy logo ra khỏi khung — cả hai đều là "người dùng
    /// gõ một con số" chứ không phải lỗi lập trình, nên xử lý chứ không panic.
    pub fn moi(corner: &str, video_w: u32, size_pct: u32, margin_pct: u32, opacity: f32) -> Watermark {
        let size_pct = size_pct.clamp(1, 100);
        let margin_pct = margin_pct.clamp(0, 40);
        let w = video_w.max(1);
        Watermark {
            corner: Goc::tu_chuoi(corner),
            logo_w_px: (w * size_pct / 100).max(1),
            margin_px: w * margin_pct / 100,
            opacity: opacity.clamp(0.0, 1.0),
        }
    }

    /// Phần `x:y` của filter `overlay`. Dùng biến `main_w`/`overlay_w` của
    /// ffmpeg cho hai góc phải/dưới để khỏi phải biết bề cao logo sau khi scale.
    pub fn overlay_xy(&self) -> String {
        let m = self.margin_px;
        match self.corner {
            Goc::TrenTrai => format!("{m}:{m}"),
            Goc::TrenPhai => format!("main_w-overlay_w-{m}:{m}"),
            Goc::DuoiTrai => format!("{m}:main_h-overlay_h-{m}"),
            Goc::DuoiPhai => format!("main_w-overlay_w-{m}:main_h-overlay_h-{m}"),
        }
    }
}
```

- [ ] **Step 5: Thêm trường vào `ExportOpts` và viết lại `build_filter_complex`**

Trong `ExportOpts` (`export.rs:103-116`), thêm sau `style`:

```rust
    /// Logo đóng dấu. `None` ⇒ không có nhánh overlay nào, giữ nguyên hành vi cũ.
    pub watermark: Option<Watermark>,
```

Thay toàn bộ phần đầu của `build_filter_complex` (khối `if o.burn_subs { … }`, dòng 128-133) bằng:

```rust
pub fn build_filter_complex(o: &ExportOpts, co_srt_input: bool) -> String {
    let mut parts: Vec<String> = Vec::new();

    // Nhánh video chỉ tồn tại khi có việc phải làm với hình. Cả burn-in lẫn
    // logo đều buộc mã hoá lại — xem chỗ chọn `-c:v` ở build_export_args.
    if o.burn_subs || o.watermark.is_some() {
        // Nhãn luồng video đang cầm, không có ngoặc vuông.
        let mut cur = "0:v".to_string();
        if o.burn_subs {
            // Nếu còn logo phía sau thì đây chưa phải đầu ra cuối cùng.
            let ra = if o.watermark.is_some() { "vs" } else { "v" };
            parts.push(format!(
                "[{cur}]{}[{ra}]",
                subtitles_filter(BURN_SRT_NAME, o.style.as_ref())
            ));
            cur = ra.to_string();
        }
        if let Some(w) = &o.watermark {
            // Input: 0 video, 1 dub.wav, 2 srt (chỉ khi soft-subs), rồi tới logo.
            let idx = if co_srt_input { 3 } else { 2 };
            // format=rgba TRƯỚC colorchannelmixer: PNG không có alpha thì kênh
            // aa không tồn tại và hệ số độ mờ bị bỏ qua im lặng.
            parts.push(format!(
                "[{idx}:v]format=rgba,colorchannelmixer=aa={},scale={}:-1[wm]",
                fmt_vol(w.opacity),
                w.logo_w_px
            ));
            parts.push(format!("[{cur}][wm]overlay={}[v]", w.overlay_xy()));
        }
    }

    if o.has_audio {
```

Phần audio từ `if o.has_audio {` trở xuống giữ nguyên không đổi.

Sửa call site trong `build_export_args` (`export.rs:192`):

```rust
    a.push(build_filter_complex(o, soft_srt.is_some()).into());
```

- [ ] **Step 6: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test export_args_test`
Expected: PASS, cả test mới và 2 test cũ đã sửa call site.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/export.rs src-tauri/tests/export_args_test.rs
git commit -m "feat(export): dựng nhánh overlay logo trong filtergraph"
```

---

### Task 3: `build_export_args` nhận logo, `probe_video_size`, nối vào pipeline

**Files:**
- Modify: `src-tauri/src/export.rs` (`build_export_args` dòng 175-229; thêm `probe_video_size` cạnh `probe_duration_ms` dòng ~58)
- Modify: `src-tauri/src/pipeline.rs` (`run_export_stage` dòng 437-533)
- Modify: `src-tauri/src/commands.rs` (`run_export` dòng 477-533)
- Test: `src-tauri/tests/export_args_test.rs`

**Interfaces:**
- Consumes: `Watermark`, `Goc`, `ExportOpts.watermark` (Task 2); `WatermarkConfig` (Task 1).
- Produces:
  - Chữ ký mới: `build_export_args(video: &Path, dub: &Path, srt: Option<&Path>, logo: Option<&Path>, out: &Path, o: &ExportOpts) -> Vec<OsString>`.
  - `app_lib::export::probe_video_size(ffprobe: &Path, video: &Path) -> Option<(u32, u32)>`.
  - `run_export_stage` nhận thêm tham số `watermark: &crate::config::WatermarkConfig`.

- [ ] **Step 1: Sửa helper test và viết test thất bại**

Trong `src-tauri/tests/export_args_test.rs`, sửa `args_of` (dòng 36-48) thành nhận thêm logo:

```rust
fn args_of(o: &ExportOpts, srt: Option<&Path>) -> Vec<String> {
    args_of_logo(o, srt, None)
}

fn args_of_logo(o: &ExportOpts, srt: Option<&Path>, logo: Option<&Path>) -> Vec<String> {
    build_export_args(
        Path::new(r"E:\phim\clip.mp4"),
        Path::new(r"E:\du an\tts\dub.wav"),
        srt,
        logo,
        Path::new(r"E:\du an\output\final.mp4"),
        o,
    )
    .into_iter()
    .map(|s| s.to_string_lossy().to_string())
    .collect()
}
```

Thêm test mới vào cuối file:

```rust
/// Không burn-in nhưng có logo ⇒ vẫn phải mã hoá lại. `-c:v copy` ở đây là
/// ffmpeg lỗi "filter output [v] not used", hoặc tệ hơn: xuất xong mà không có
/// logo và không ai biết.
#[test]
fn logo_bat_thi_khong_con_c_v_copy() {
    let mut o = opts(false, false, true);
    o.watermark = Some(wm("br"));
    let a = args_of_logo(&o, None, Some(Path::new(r"E:\anh\logo.png")));
    assert!(!a.contains(&"copy".to_string()), "{a:?}");
    assert!(a.contains(&"libx264".to_string()), "{a:?}");
    assert!(a.contains(&"-pix_fmt".to_string()), "{a:?}");
    // Phải map nhánh đã lọc, không phải luồng gốc.
    let i = a.iter().position(|s| s == "-map").unwrap();
    assert_eq!(a[i + 1], "[v]", "{a:?}");
}

#[test]
fn logo_duoc_them_lam_input_cuoi_cung() {
    let mut o = opts(false, false, true);
    o.watermark = Some(wm("br"));
    let a = args_of_logo(&o, None, Some(Path::new(r"E:\anh\logo.png")));
    let inputs: Vec<&String> = a
        .iter()
        .enumerate()
        .filter(|(i, s)| *s == "-i" && *i + 1 < a.len())
        .map(|(i, _)| &a[i + 1])
        .collect();
    assert_eq!(inputs.len(), 3, "{a:?}");
    assert_eq!(inputs[2], r"E:\anh\logo.png", "logo phải là input cuối: {a:?}");
}

#[test]
fn logo_dung_sau_srt_khi_co_soft_subs() {
    let mut o = opts(false, true, true);
    o.watermark = Some(wm("br"));
    let a = args_of_logo(
        &o,
        Some(Path::new(r"E:\du an\subtitles\translated.vi.srt")),
        Some(Path::new(r"E:\anh\logo.png")),
    );
    let inputs: Vec<&String> = a
        .iter()
        .enumerate()
        .filter(|(i, s)| *s == "-i" && *i + 1 < a.len())
        .map(|(i, _)| &a[i + 1])
        .collect();
    assert_eq!(inputs.len(), 4, "{a:?}");
    assert!(inputs[2].ends_with(".srt"), "{a:?}");
    assert_eq!(inputs[3], r"E:\anh\logo.png", "{a:?}");
    assert!(filter_arg(&a).contains("[3:v]format=rgba"), "{}", filter_arg(&a));
}

/// Bật logo nhưng không truyền được file (đã bị xoá, hoặc path rỗng): phải xuất
/// bình thường KHÔNG có logo, chứ không sinh args trỏ vào input không tồn tại.
#[test]
fn logo_thieu_file_thi_xuat_nhu_khong_co_logo() {
    let mut o = opts(false, false, true);
    o.watermark = None; // pipeline đã lọc bỏ vì file không đọc được
    let a = args_of_logo(&o, None, None);
    assert!(a.contains(&"copy".to_string()), "{a:?}");
    assert!(!filter_arg(&a).contains("overlay"), "{}", filter_arg(&a));
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test export_args_test`
Expected: FAIL — `build_export_args` nhận 5 tham số, đưa vào 6.

- [ ] **Step 3: Sửa `build_export_args`**

Trong `src-tauri/src/export.rs`, đổi chữ ký (dòng 175-181) và thêm input logo:

```rust
pub fn build_export_args(
    video: &Path,
    dub: &Path,
    srt: Option<&Path>,
    logo: Option<&Path>,
    out: &Path,
    o: &ExportOpts,
) -> Vec<OsString> {
```

Sau khối `if let Some(s) = soft_srt { … }` (dòng 190), thêm:

```rust
    // Logo LUÔN là input cuối cùng — chỉ số của nó trong filtergraph được tính
    // từ việc có srt hay không, xem build_filter_complex.
    if let Some(l) = logo {
        a.push("-i".into());
        a.push(l.into());
    }
```

Thay hai chỗ rẽ nhánh theo `burn_subs` (dòng 194-195 và 216-219). Ngay trước `a.push("-map".into())`, thêm:

```rust
    // Có bất cứ filter hình nào cũng buộc mã hoá lại: `-c:v copy` chép luồng
    // nén nguyên vẹn, không có chỗ nào để chèn phụ đề hay logo vào.
    let co_filter_video = o.burn_subs || o.watermark.is_some();
```

rồi đổi:

```rust
    a.push(OsString::from(if co_filter_video { "[v]" } else { "0:v:0" }));
```

và:

```rust
    if co_filter_video {
        a.push("-c:v".into());
        a.push("libx264".into());
        a.push("-preset".into());
        a.push(o.preset.as_str().into());
        a.push("-crf".into());
        a.push(o.crf.to_string().into());
        a.push("-pix_fmt".into());
        a.push("yuv420p".into());
    } else {
        a.push("-c:v".into());
        a.push("copy".into());
    }
```

- [ ] **Step 4: Thêm `probe_video_size`**

Trong `src-tauri/src/export.rs`, cạnh `probe_duration_ms` (~dòng 58-92), theo đúng lối hàm đó:

```rust
/// Bề ngang × bề cao video, hỏi ffprobe. `None` nếu không đọc được — chỗ gọi
/// phải coi đó là "không đặt được logo" chứ không phải lỗi xuất.
pub fn probe_video_size(ffprobe: &Path, video: &Path) -> Option<(u32, u32)> {
    let out = std::process::Command::new(ffprobe)
        .args([
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0",
        ])
        .arg(video)
        .output()
        .ok()?;
    let s = String::from_utf8_lossy(&out.stdout);
    let (w, h) = s.trim().split_once('x')?;
    let w: u32 = w.trim().parse().ok()?;
    let h: u32 = h.trim().parse().ok()?;
    if w == 0 || h == 0 { return None; }
    Some((w, h))
}
```

- [ ] **Step 5: Nối vào pipeline**

Trong `src-tauri/src/pipeline.rs`, `run_export_stage` (dòng 437-533): thêm tham số `watermark: &crate::config::WatermarkConfig`, và trong pha `encode`, trước khi dựng args:

```rust
    // Logo chỉ được thêm khi ĐỦ CẢ BA: bật, có đường dẫn, và file đọc được.
    // Thiếu bất cứ cái nào thì xuất bình thường không logo — một file bị xoá
    // sau khi chọn không đáng làm hỏng cả buổi xuất video.
    let logo_path: Option<std::path::PathBuf> = if watermark.enabled
        && !watermark.path.trim().is_empty()
    {
        let p = std::path::PathBuf::from(watermark.path.trim());
        if p.is_file() { Some(p) } else {
            eprintln!("bỏ qua logo: không đọc được {}", p.display());
            None
        }
    } else {
        None
    };

    let wm = logo_path.as_ref().and_then(|_| {
        let (w, _h) = crate::export::probe_video_size(ffprobe, video)?;
        Some(crate::export::Watermark::moi(
            &watermark.corner,
            w,
            watermark.size_pct,
            watermark.margin_pct,
            watermark.opacity,
        ))
    });
    // Không đo được kích thước video thì không đặt được logo — bỏ luôn cả input
    // để args không trỏ vào một file mà filtergraph không dùng.
    let logo_path = if wm.is_some() { logo_path } else { None };
```

Đưa `watermark: wm` vào `ExportOpts`, và truyền `logo_path.as_deref()` vào `build_export_args`.

Trong `src-tauri/src/commands.rs`, `run_export` (dòng 489-514), truyền thêm `&cfg.watermark` vào `run_export_stage`.

- [ ] **Step 6: Chạy toàn bộ test**

Run: `cargo test --manifest-path src-tauri/Cargo.toml`
Expected: PASS. Nếu `pipeline_test.rs` gọi `run_export_stage` thì sửa call site cho khớp tham số mới.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/export.rs src-tauri/src/pipeline.rs src-tauri/src/commands.rs src-tauri/tests/export_args_test.rs
git commit -m "feat(export): nối logo vào pipeline xuất, bỏ qua an toàn khi thiếu file"
```

---

### Task 4: Lệnh `cho_phep_xem` mở phạm vi asset

**Files:**
- Modify: `src-tauri/src/commands.rs` (thêm lệnh cạnh `preview_subtitle`)
- Modify: `src-tauri/src/lib.rs` (đăng ký lệnh, dòng 53-74)
- Test: `src-tauri/tests/commands_test.rs`

**Interfaces:**
- Consumes: không có.
- Produces: lệnh Tauri `cho_phep_xem(path: String) -> Result<(), String>`; hàm thuần `app_lib::commands::duong_dan_xem_duoc(path: &str) -> Result<std::path::PathBuf, String>`.

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/commands_test.rs`:

```rust
#[test]
fn duong_dan_xem_duoc_chi_nhan_file_that() {
    let d = tempfile::tempdir().unwrap();
    let f = d.path().join("clip.mp4");
    std::fs::write(&f, b"x").unwrap();

    let ok = app_lib::commands::duong_dan_xem_duoc(&f.display().to_string()).unwrap();
    assert_eq!(ok, f);

    // Thư mục không được: khai cả thư mục là mở rộng phạm vi ngoài ý định.
    assert!(app_lib::commands::duong_dan_xem_duoc(&d.path().display().to_string()).is_err());
    // File không tồn tại.
    assert!(app_lib::commands::duong_dan_xem_duoc(&d.path().join("khong-co.mp4").display().to_string()).is_err());
    // Rỗng.
    assert!(app_lib::commands::duong_dan_xem_duoc("   ").is_err());
}

/// KHÔNG canonicalize: trên Windows nó trả về dạng verbatim `\\?\E:\...`, còn
/// `convertFileSrc` bên UI dùng đường dẫn thường. Hai chuỗi khác nhau ⇒ scope
/// khai một đằng, trình duyệt xin một nẻo, và video câm lặng không phát.
#[test]
fn duong_dan_giu_nguyen_dang_khong_verbatim() {
    let d = tempfile::tempdir().unwrap();
    let f = d.path().join("clip.mp4");
    std::fs::write(&f, b"x").unwrap();
    let ok = app_lib::commands::duong_dan_xem_duoc(&f.display().to_string()).unwrap();
    assert!(!ok.display().to_string().starts_with(r"\\?\"), "{}", ok.display());
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test commands_test`
Expected: FAIL — `duong_dan_xem_duoc` không tồn tại.

- [ ] **Step 3: Cài đặt**

Trong `src-tauri/src/commands.rs`, thêm trước `preview_subtitle`:

```rust
/// Kiểm một đường dẫn trước khi khai vào phạm vi asset protocol.
///
/// Tách khỏi lệnh Tauri để test được không cần AppHandle.
pub fn duong_dan_xem_duoc(path: &str) -> Result<std::path::PathBuf, String> {
    let p = std::path::PathBuf::from(path.trim());
    if path.trim().is_empty() {
        return Err("đường dẫn rỗng".into());
    }
    if !p.is_file() {
        return Err(format!("không phải file đọc được: {}", p.display()));
    }
    Ok(p)
}

/// Cho webview đọc MỘT file cụ thể qua asset protocol.
///
/// Phạm vi mặc định chỉ có `projects/` và `demo/` (xem lib.rs). Video gốc nằm ở
/// chỗ người dùng chọn, còn logo thì ở đâu cũng được — không khai thì
/// `convertFileSrc` bị từ chối IM LẶNG và thẻ <video> ra ô đen, không lỗi,
/// không log. Đúng lớp bug đã làm nghe thử cue câm suốt từ M6.
///
/// Khai từng file một, không bao giờ khai thư mục.
#[tauri::command]
pub fn cho_phep_xem(app: tauri::AppHandle, path: String) -> Result<(), String> {
    use tauri::Manager;
    let p = duong_dan_xem_duoc(&path)?;
    app.asset_protocol_scope()
        .allow_file(&p)
        .map_err(|e| format!("không khai được phạm vi cho {}: {e}", p.display()))
}
```

Đăng ký trong `src-tauri/src/lib.rs`, thêm vào `generate_handler!` sau `commands::preview_subtitle`:

```rust
            commands::cho_phep_xem,
```

- [ ] **Step 4: Chạy test cho chắc là xanh**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test commands_test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/src/lib.rs src-tauri/tests/commands_test.rs
git commit -m "feat(xem-thu): lệnh cho_phep_xem mở phạm vi asset cho từng file"
```

---

### Task 5: Tách Bước 6 thành hai tab, bỏ chỗ giấu kiểu chữ

**Files:**
- Modify: `src/App.tsx` (`BUOC` dòng 62-69; khối `{tab === 6 && …}` dòng ~880-1013)
- Test: `src-tauri/tests/hang_so_ui_test.rs`

**Interfaces:**
- Consumes: state `tab`, `BUOC`, `sub`/`setSub`, `burnSubs`, `softSubs` đã có trong `App.tsx`.
- Produces: `BUOC` có 7 mục; tab 6 = "Phụ đề & Logo", tab 7 = "Xuất video".

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/hang_so_ui_test.rs`:

```rust
/// Bước 6 đã tách đôi. Test này giữ cho con số bước không trôi khỏi tài liệu và
/// khỏi chỗ nhảy tab tự động sau khi lồng tiếng.
#[test]
fn ui_co_bay_buoc_va_tach_phu_de_khoi_xuat() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains(r#"{ id: 6, ten: "Phụ đề & Logo" }"#), "thiếu tab 6");
    assert!(tsx.contains(r#"{ id: 7, ten: "Xuất video" }"#), "thiếu tab 7");
    assert!(tsx.contains("{tab === 7 && ("), "thiếu khối render tab 7");
}

/// Kiểu chữ không được nằm trong nhánh chỉ hiện khi tick burn-in nữa.
#[test]
fn ui_khong_con_giau_kieu_chu_sau_burn_in() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        !tsx.contains("{burnSubs && sub && ("),
        "khối kiểu chữ vẫn bị giấu sau tick burn-in"
    );
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: FAIL — thiếu tab 6/7.

- [ ] **Step 3: Sửa `BUOC`**

Trong `src/App.tsx` dòng 62-69:

```tsx
const BUOC = [
  { id: 1, ten: "Chọn video" },
  { id: 2, ten: "Lời thoại gốc" },
  { id: 3, ten: "Dịch phụ đề" },
  { id: 4, ten: "Sửa & nghe thử" },
  { id: 5, ten: "Lồng tiếng" },
  { id: 6, ten: "Phụ đề & Logo" },
  { id: 7, ten: "Xuất video" },
] as const;
```

`setTab(6)` sau khi lồng tiếng và `open_project` nhảy `hasTts ? 6` giữ nguyên — sau Bước 5 thì vào màn chỉnh phụ đề/logo là đúng mạch.

- [ ] **Step 4: Chia lại nội dung hai tab**

Tab 6 giữ: khối kiểu chữ (bỏ điều kiện `burnSubs &&`, chỉ còn `sub &&`), nút "Xem thử phụ đề", ảnh `subPreview`, dòng cảnh báo cỡ chữ lớn. Thêm cảnh báo mới ngay dưới tiêu đề khối kiểu chữ:

```tsx
{!burnSubs && (
  <p className="warn">
    Kiểu chữ dưới đây chỉ áp dụng khi bạn tick "Ghi phụ đề vào hình" ở Bước 7.
    Phụ đề bật/tắt được không mang kiểu chữ nào — trình phát của người xem tự
    quyết định font.
  </p>
)}
```

Và sửa nhãn cạnh nút "Xem thử phụ đề" cho khỏi hứa suông:

```tsx
<span className="muted">
  Dựng một khung hình thật của video để chấm kiểu chữ. Khung này chưa gồm
  logo — xem logo ở trình phát bên dưới.
</span>
```

Tab 7 (khối `{tab === 7 && (<section>…)}`) giữ: hai ô tick burn-in / phụ đề bật-tắt, chọn thư mục lưu, nút "Xuất video", `exportPhase`, khối `exported`.

- [ ] **Step 5: Chạy test và build**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: PASS.

Run: `npm run build`
Expected: PASS, không lỗi tsc.

- [ ] **Step 6: Kiểm bằng mắt**

Run: `npm run tauri dev`
Mở một dự án đã dịch. Khẳng định: thanh tab có 7 mục; tab 6 hiện khối kiểu chữ **mà không cần tick gì**; chưa tick burn-in thì có dòng cảnh báo vàng; tab 7 chỉ còn phần xuất.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src-tauri/tests/hang_so_ui_test.rs
git commit -m "feat(ui): tách Bước 6 thành Phụ đề & Logo và Xuất video, bỏ chỗ giấu kiểu chữ"
```

---

### Task 6: Giao diện chọn logo

**Files:**
- Modify: `src/App.tsx` (interface `AppConfig`; thêm khối logo vào tab 6)
- Modify: `src/App.css` (style khối logo)
- Test: `src-tauri/tests/hang_so_ui_test.rs`

**Interfaces:**
- Consumes: `WatermarkConfig` (Task 1) qua `get_config`/`save_config`; tab 6 (Task 5).
- Produces: `interface WatermarkConfig` trong `App.tsx`; `AppConfig.watermark`; `wm`/`setWm` theo đúng lối `sub`/`setSub` đã có.

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/hang_so_ui_test.rs`:

```rust
/// UI phải nói thẳng rằng bật logo là mã hoá lại video. Không burn-in thì xuất
/// dùng `-c:v copy` nên rất nhanh; có logo là mất đường đó, lâu ngang burn-in.
/// Không nói trước thì người dùng chờ 20 phút rồi mới hiểu ra.
#[test]
fn ui_canh_bao_logo_buoc_ma_hoa_lai() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains("mã hoá lại"), "thiếu cảnh báo bật logo là mã hoá lại video");
}

/// Mặc định của UI phải khớp Rust, nếu không người dùng thấy một con số mà
/// backend dùng một con số khác.
#[test]
fn ui_khai_dung_mac_dinh_watermark() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let w = app_lib::config::WatermarkConfig::default();
    assert!(tsx.contains(&format!("WM_SIZE_MAC_DINH = {}", w.size_pct)));
    assert!(tsx.contains(&format!("WM_MARGIN_MAC_DINH = {}", w.margin_pct)));
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: FAIL.

- [ ] **Step 3: Thêm kiểu và hằng số**

Trong `src/App.tsx`, cạnh `MAX_MOT_DONG` (dòng ~53):

```tsx
// Phải khớp config::WatermarkConfig bên Rust — có test hang_so_ui_test giữ.
const WM_SIZE_MAC_DINH = 12;
const WM_MARGIN_MAC_DINH = 3;

const WM_GOC = [
  { id: "tl", ten: "Trên trái" },
  { id: "tr", ten: "Trên phải" },
  { id: "bl", ten: "Dưới trái" },
  { id: "br", ten: "Dưới phải" },
];
```

Thêm interface cạnh `SubtitleConfig` (dòng ~14):

```tsx
interface WatermarkConfig {
  enabled: boolean; path: string; corner: string;
  size_pct: number; opacity: number; margin_pct: number;
}
```

và trường vào `AppConfig`:

```tsx
  watermark: WatermarkConfig;
```

Cạnh `sub`/`setSub` (dòng ~468):

```tsx
  const wm = cfg?.watermark;
  const setWm = (patch: Partial<WatermarkConfig>) =>
    cfg && setCfg({ ...cfg, watermark: { ...cfg.watermark, ...patch } });

  async function onPickLogo() {
    const f = await open({ filters: [{ name: "Ảnh", extensions: ["png"] }] });
    if (!f) return;
    // Khai phạm vi ngay để trình phát hiện được logo mà không phải lưu config.
    try { await invoke("cho_phep_xem", { path: f as string }); } catch { /* xem thử sẽ không hiện logo */ }
    setWm({ path: f as string, enabled: true });
  }
```

- [ ] **Step 4: Thêm khối giao diện vào tab 6**

```tsx
{wm && (
  <>
    <label>
      <input
        type="checkbox"
        checked={wm.enabled}
        onChange={(e) => setWm({ enabled: e.target.checked })}
        disabled={running}
      />
      Đóng dấu logo lên video
    </label>
    {wm.enabled && (
      <>
        <p className="warn">
          Bật logo thì video phải mã hoá lại toàn bộ — lâu ngang "Ghi phụ đề vào
          hình". Không bật thì xuất chỉ chép luồng hình nên nhanh hơn nhiều.
        </p>
        <div className="row">
          <button type="button" onClick={onPickLogo} disabled={running}>Chọn file PNG…</button>
          <span className="muted">{wm.path ? baseName(wm.path) : "chưa chọn"}</span>
          {wm.path && (
            <button type="button" onClick={() => setWm({ path: "" })} disabled={running}>Bỏ</button>
          )}
        </div>
        <div className="row">
          <label className="muted" htmlFor="wm-goc">Góc</label>
          <select id="wm-goc" value={wm.corner} onChange={(e) => setWm({ corner: e.target.value })} disabled={running}>
            {WM_GOC.map((g) => <option key={g.id} value={g.id}>{g.ten}</option>)}
          </select>

          <label className="muted" htmlFor="wm-size">Cỡ (% bề ngang)</label>
          <input
            id="wm-size" type="number" min={1} max={100} className="input-lang"
            value={wm.size_pct}
            onChange={(e) => setWm({ size_pct: Number(e.target.value) || WM_SIZE_MAC_DINH })}
            disabled={running}
          />

          <label className="muted" htmlFor="wm-margin">Lề (%)</label>
          <input
            id="wm-margin" type="number" min={0} max={40} className="input-lang"
            value={wm.margin_pct}
            onChange={(e) => setWm({ margin_pct: Number(e.target.value) || WM_MARGIN_MAC_DINH })}
            disabled={running}
          />

          <label className="muted" htmlFor="wm-opacity">Độ mờ</label>
          <input
            id="wm-opacity" type="range" min={0} max={100}
            value={Math.round(wm.opacity * 100)}
            onChange={(e) => setWm({ opacity: Number(e.target.value) / 100 })}
            disabled={running}
          />
          <span className="muted">{Math.round(wm.opacity * 100)}%</span>
        </div>
        <div className="row">
          <button type="button" onClick={onSaveCfg} disabled={running}>Lưu cấu hình</button>
          <span className="muted">Nhớ bấm lưu thì lúc xuất mới dùng thiết lập này.</span>
        </div>
      </>
    )}
  </>
)}
```

- [ ] **Step 5: Chạy test và build**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.css src-tauri/tests/hang_so_ui_test.rs
git commit -m "feat(ui): chọn logo, góc, cỡ, độ mờ ở tab Phụ đề & Logo"
```

---

### Task 7: Trình phát xem thử — video, phụ đề, logo

**Files:**
- Create: `src/XemThu.tsx`
- Modify: `src/App.tsx` (nhúng `<XemThu>` vào tab 6)
- Modify: `src/App.css` (style lớp phủ)
- Test: `src-tauri/tests/hang_so_ui_test.rs`

**Interfaces:**
- Consumes: `cho_phep_xem` (Task 4); `CueDto`, `SubtitleConfig`, `WatermarkConfig`, `convertFileSrc` từ `App.tsx`; `WM_GOC`.
- Produces: `export default function XemThu(props: XemThuProps)` với

```tsx
interface XemThuProps {
  videoPath: string;
  cues: CueDto[];
  sub: SubtitleConfig;
  wm: WatermarkConfig | undefined;
}
```

Tách file riêng vì `App.tsx` đã 1071 dòng; lớp phủ có logic quy đổi cỡ chữ và trạng thái phát riêng, gộp vào càng khó đọc.

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/hang_so_ui_test.rs`:

```rust
/// WebView2 là Chromium, không mở container Matroska. Phải nói rõ thay vì để
/// người dùng nhìn một ô đen câm lặng và tưởng app hỏng.
#[test]
fn ui_bao_ro_mkv_khong_xem_thu_duoc() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains(".mkv"), "phải nhận diện .mkv");
    assert!(tsx.contains("Xem thử phụ đề"), "phải chỉ sang nút khung hình ffmpeg");
}

/// Cỡ chữ ASS tính trên khung hình GỐC; trình phát hiện ở kích thước khác nên
/// phải quy đổi, nếu không phụ đề xem thử to nhỏ sai hẳn so với bản xuất.
#[test]
fn ui_quy_doi_co_chu_theo_ti_le_khung_hinh() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains("videoHeight"), "phải quy đổi theo videoHeight");
    assert!(tsx.contains("clientHeight"), "phải quy đổi theo clientHeight");
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: FAIL — không có `src/XemThu.tsx`.

- [ ] **Step 3: Viết `src/XemThu.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";

export interface CueDto {
  index: number; startMs: number; endMs: number; text: string;
  durationMs: number; audioPath: string | null; stale: boolean;
}
export interface SubtitleConfig {
  font: string; size: number; color: string;
  outline_color: string; outline: number;
}
export interface WatermarkConfig {
  enabled: boolean; path: string; corner: string;
  size_pct: number; opacity: number; margin_pct: number;
}

interface XemThuProps {
  videoPath: string;
  cues: CueDto[];
  sub: SubtitleConfig;
  wm: WatermarkConfig | undefined;
}

/** WebView2 dựng trên Chromium, và Chromium không mở container Matroska. */
function phatDuoc(p: string): boolean {
  return !p.toLowerCase().endsWith(".mkv");
}

/** Vị trí logo theo góc, khớp với `Watermark::overlay_xy` bên Rust. */
function viTriLogo(corner: string, marginPct: number): React.CSSProperties {
  // Lề tính theo % BỀ NGANG ở cả hai trục, đúng như bên Rust (margin_px dùng
  // chung cho x và y) — không đổi sang % chiều cao, sẽ lệch trên video 16:9.
  const m = `${marginPct}%`;
  switch (corner) {
    case "tl": return { left: m, top: m };
    case "tr": return { right: m, top: m };
    case "bl": return { left: m, bottom: m };
    default: return { right: m, bottom: m };
  }
}

export default function XemThu({ videoPath, cues, sub, wm }: XemThuProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tMs, setTMs] = useState(0);
  // Tỉ lệ khung hiển thị so với khung gốc, để quy đổi cỡ chữ.
  const [tiLe, setTiLe] = useState(1);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    if (!videoPath || !phatDuoc(videoPath)) return;
    // Phải khai phạm vi TRƯỚC khi gán src, nếu không lần nạp đầu bị từ chối im
    // lặng và thẻ video ra ô đen.
    invoke("cho_phep_xem", { path: videoPath })
      .then(() => setLoi(""))
      .catch((e) => setLoi(`Không mở được video để xem thử: ${String(e)}`));
  }, [videoPath]);

  useEffect(() => {
    if (!wm?.enabled || !wm.path) return;
    invoke("cho_phep_xem", { path: wm.path }).catch(() => { /* logo sẽ không hiện */ });
  }, [wm?.enabled, wm?.path]);

  function doTiLe() {
    const v = ref.current;
    if (!v || !v.videoHeight) return;
    setTiLe(v.clientHeight / v.videoHeight);
  }

  // Tính TRƯỚC mọi lệnh return sớm bên dưới. Task 8 treo thêm một useEffect ăn
  // theo `cue`, mà hook nằm sau một nhánh return là lỗi "rendered more hooks
  // than during the previous render" — React đếm hook theo thứ tự gọi, không
  // theo tên.
  const cue = cues.find((c) => c.startMs <= tMs && tMs < c.endMs);

  if (!videoPath) {
    return <p className="muted">Mở một dự án để xem thử.</p>;
  }
  if (!phatDuoc(videoPath)) {
    return (
      <p className="muted">
        Video .mkv không phát được trong app (khung xem của Windows không đọc
        định dạng này). Dùng nút "Xem thử phụ đề" ở trên để chấm kiểu chữ trên
        một khung hình thật; bản xuất ra vẫn bình thường.
      </p>
    );
  }
  if (loi) return <p className="warn">{loi}</p>;

  return (
    <div className="xem-thu">
      <video
        ref={ref}
        src={convertFileSrc(videoPath)}
        controls
        onLoadedMetadata={doTiLe}
        onResize={doTiLe}
        onTimeUpdate={(e) => setTMs(e.currentTarget.currentTime * 1000)}
        onError={() => setLoi("Không phát được video — file có thể đã bị xoá hoặc đổi tên.")}
      />
      {wm?.enabled && wm.path && (
        <img
          className="xem-thu-logo"
          src={convertFileSrc(wm.path)}
          alt=""
          style={{ ...viTriLogo(wm.corner, wm.margin_pct), width: `${wm.size_pct}%`, opacity: wm.opacity }}
        />
      )}
      {cue && (
        <div
          className="xem-thu-cap"
          style={{
            fontFamily: sub.font,
            // Cỡ chữ ASS tính trên khung hình gốc: FontSize=24 nghĩa là 24px
            // trên video 1080p, không phải 24px trên màn hình.
            fontSize: `${sub.size * tiLe}px`,
            color: sub.color,
            WebkitTextStrokeWidth: `${sub.outline * tiLe}px`,
            WebkitTextStrokeColor: sub.outline_color,
            paintOrder: "stroke fill",
          }}
        >
          {cue.text}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Style**

Thêm vào `src/App.css`:

```css
/* ---------- trình phát xem thử ---------- */

.xem-thu {
  position: relative;
  width: 100%;
  line-height: 0;
}

.xem-thu video {
  width: 100%;
  border-radius: var(--radius-ui);
  background: #000;
}

.xem-thu-logo {
  position: absolute;
  pointer-events: none;
}

/* Phụ đề đặt ở đáy giữa, giống mặc định của libass (Alignment=2). */
.xem-thu-cap {
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: 8%;
  text-align: center;
  line-height: 1.2;
  font-weight: 600;
  pointer-events: none;
  white-space: pre-wrap;
}
```

- [ ] **Step 5: Nhúng vào tab 6**

Trong `src/App.tsx`, import và đặt cuối tab 6:

```tsx
import XemThu from "./XemThu";
```

```tsx
<h3 className="muted">Xem thử</h3>
<div className="row">
  <button type="button" onClick={onLoadCues} disabled={running || !projectDir}>
    Nạp phụ đề để xem thử
  </button>
  <span className="muted">
    Lớp xem thử này vẽ bằng trình duyệt nên nét chữ và cách ngắt dòng lệch chút
    ít so với bản xuất — dùng để căn bố cục và thời điểm. Chấm kiểu chữ thì
    dùng nút "Xem thử phụ đề" ở trên.
  </span>
</div>
{sub && <XemThu videoPath={videoPath} cues={cues} sub={sub} wm={wm} />}
```

- [ ] **Step 6: Chạy test và build**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 7: Kiểm bằng mắt — gồm cả hai đường hỏng**

Run: `npm run tauri dev`

1. Mở dự án `.mp4` đã dịch, sang tab 6, bấm "Nạp phụ đề để xem thử". Video phát được, phụ đề hiện đúng câu theo thời gian, tua tới lui vẫn khớp.
2. Bật logo, chọn một PNG. Logo hiện đúng góc, đổi góc/cỡ/độ mờ thấy đổi ngay.
3. Đổi cỡ chữ ở khối kiểu chữ ⇒ phụ đề trong trình phát to nhỏ theo.
4. **Đường hỏng 1:** mở một dự án `.mkv` ⇒ hiện dòng giải thích, KHÔNG có ô đen.
5. **Đường hỏng 2:** đổi tên file video gốc rồi mở lại dự án ⇒ hiện thông báo file mất, không phải ô đen câm.

- [ ] **Step 8: Commit**

```bash
git add src/XemThu.tsx src/App.tsx src/App.css src-tauri/tests/hang_so_ui_test.rs
git commit -m "feat(xem-thu): trình phát video kèm phụ đề và logo vẽ đè"
```

---

### Task 8: Tiếng lồng trong trình phát

**Files:**
- Modify: `src/XemThu.tsx`
- Test: `src-tauri/tests/hang_so_ui_test.rs`

**Interfaces:**
- Consumes: `XemThu` (Task 7); `CueDto.audioPath` đã có từ `list_cues`.
- Produces: không có gì cho task sau — đây là task cuối.

- [ ] **Step 1: Viết test thất bại**

```rust
/// Tiếng lồng xem thử là bản CHƯA retime — pha retime lúc xuất mới ép từng cue
/// vừa khung của nó. Không nói rõ thì người dùng nghe thấy câu chồng lên nhau
/// và tưởng bản xuất cũng hỏng.
#[test]
fn ui_noi_ro_tieng_thu_chua_retime() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains("chưa khớp khung"), "thiếu ghi chú tiếng thử chưa retime");
}
```

- [ ] **Step 2: Chạy test cho chắc là đỏ**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: FAIL.

- [ ] **Step 3: Cài đặt**

Thêm vào `XemThu.tsx` — một thẻ `<audio>` dùng lại, đổi `src` khi sang cue mới.
**Đặt cả `useRef` lẫn `useEffect` này TRƯỚC các lệnh `return` sớm**, ngay dưới
dòng tính `cue` — hook nằm sau một nhánh return làm React lỗi "rendered more
hooks than during the previous render" ngay lần đầu mở một dự án `.mkv`:

```tsx
  const am = useRef<HTMLAudioElement>(null);
  const cueDangPhat = useRef<number>(-1);

  // Phát wav của cue đang chạy. Dùng MỘT thẻ audio đổi src thay vì hẹn giờ cả
  // dải: người dùng tua liên tục khi căn chỉnh, mà mọi lịch hẹn đều phải huỷ và
  // dựng lại sau mỗi lần tua — một thẻ theo cue hiện tại là đủ và không lệch.
  useEffect(() => {
    const a = am.current;
    const v = ref.current;
    if (!a || !v) return;
    const idx = cue?.index ?? -1;
    if (idx === cueDangPhat.current) return;
    cueDangPhat.current = idx;
    if (!cue?.audioPath || v.paused) { a.pause(); return; }
    a.src = convertFileSrc(cue.audioPath);
    // Vào giữa cue (do tua) thì phát từ đúng chỗ đó, không quay về đầu câu.
    a.currentTime = Math.max(0, (tMs - cue.startMs) / 1000);
    a.play().catch(() => { /* chưa có wav cho cue này */ });
  }, [cue?.index, cue?.audioPath]);
```

Trong JSX, thêm `<audio ref={am} />` và ghi chú:

```tsx
<audio ref={am} />
<p className="muted">
  Tiếng lồng nghe thử lấy từ file của từng câu, chưa khớp khung — câu nào đọc
  dài quá chỗ của nó sẽ chồng sang câu sau. Bản xuất thật có thêm bước ép vừa
  khung nên không bị.
</p>
```

Và cho video chạy ở âm lượng nền giống bản xuất:

```tsx
onLoadedMetadata={(e) => { doTiLe(); e.currentTarget.volume = 0.18; }}
```

- [ ] **Step 4: Chạy test và build**

Run: `cargo test --manifest-path src-tauri/Cargo.toml --test hang_so_ui_test`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Kiểm bằng mắt**

Run: `npm run tauri dev`
Mở dự án đã lồng tiếng, tab 6, nạp phụ đề, bấm phát. Nghe được giọng dịch nổi trên tiếng gốc nhỏ. Tua tới giữa một câu ⇒ giọng vào đúng chỗ đó, không quay về đầu câu. Bấm tạm dừng ⇒ giọng dừng theo.

- [ ] **Step 6: Chạy toàn bộ test**

Run: `cargo test --manifest-path src-tauri/Cargo.toml`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/XemThu.tsx src-tauri/tests/hang_so_ui_test.rs
git commit -m "feat(xem-thu): phát tiếng lồng theo cue trong trình phát"
```

---

## Ghi chú thiết kế đã chốt trong lúc lập kế hoạch

- **`#[serde(default)]` trần là không đủ.** Spec viết chung chung; thực tế serde dùng `Default` của *kiểu* chứ không phải `impl Default` của struct, nên `size_pct` sẽ thành 0. Kế hoạch dùng `#[serde(default = "wm_size_pct")]`. Đây là chỗ khác biệt duy nhất giữa kế hoạch và spec.
- **Khung hình `preview_subtitle` không kèm logo.** Thêm logo vào đó cần đổi `-vf` thành `-filter_complex` cộng một input nữa, trong khi trình phát đã hiện logo trực tiếp và chính xác hơn. UI nói rõ khung hình dùng để chấm kiểu chữ, logo xem ở trình phát (Task 5, Step 4).
- **Không `canonicalize` trong `cho_phep_xem`.** Trên Windows nó trả dạng verbatim `\\?\E:\…` còn `convertFileSrc` dùng đường dẫn thường — hai chuỗi lệch nhau thì scope khai một đằng, webview xin một nẻo, và lại đúng cái bug câm lặng của M6. Chỉ kiểm `is_file()` và khai từng file, không bao giờ khai thư mục.
