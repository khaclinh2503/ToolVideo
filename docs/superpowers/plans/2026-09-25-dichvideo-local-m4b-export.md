# M4 Phase B — Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trộn dải tiếng dịch với tiếng gốc rồi mux vào video, cho chọn giữa xuất nhanh kèm phụ đề bật/tắt được và xuất có phụ đề ghi chết vào khung hình.

**Architecture:** `export.rs` tách làm hai nửa — nửa dựng chuỗi tham số là hàm thuần trên chuỗi, test được không cần ffmpeg; nửa chạy tiến trình con chỉ gọi đúng một lần ffmpeg cho cả trộn, mux và burn. `pipeline::run_export_stage` nối retime (Phase A) → dub track (Phase A) → ffmpeg. Đường dẫn phụ đề không bao giờ vào filtergraph: ffmpeg chạy với `current_dir` đặt ở thư mục chứa `burn.srt`.

**Tech Stack:** Rust 2021, crate `app_lib` (`src-tauri/`), Tauri v2 (`spawn_blocking` + `Emitter`), React + TypeScript (`src/App.tsx`), `ffmpeg.exe`/`ffprobe.exe` đã cài sẵn bởi ComponentManager của M3. Không thêm dependency mới.

**Spec:** `docs/superpowers/specs/2026-09-25-dichvideo-local-m4-retime-compose-export-design.md`

**Phase trước:** `docs/superpowers/plans/2026-09-25-dichvideo-local-m4a-retime-compose.md` — phải xong trước; plan này dùng `retime::FitOpts`, `pipeline::run_retime_stage`, `compose::build_dub_track`, `wav::write_pcm16_mono`.

## Global Constraints

- Nền tảng: Windows 11, shell PowerShell. `cargo` KHÔNG có sẵn trên PATH của shell mới — **mọi lệnh cargo phải mở đầu bằng** `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path";` (PowerShell) hoặc `export PATH="$HOME/.cargo/bin:$PATH"` (bash).
- Mọi thông báo lỗi hướng tới người dùng viết **tiếng Việt**, theo giọng các thông báo sẵn có trong `src-tauri/src/error.rs`.
- Không thêm biến thể vào `enum PipelineError`.
- **`amix` phải có `normalize=0`.** Mặc định `normalize=1` chia lại biên độ theo số input và xoá sạch tỉ lệ âm lượng vừa đặt.
- Âm lượng mặc định: tiếng gốc `0.18`, tiếng dịch `3.0` (lấy từ ứng dụng gốc).
- **Filtergraph không bao giờ chứa đường dẫn tuyệt đối.** Trên Windows, dấu hai chấm ổ đĩa kết thúc tham số filter, dấu gạch ngược bị nuốt, và `[ ] , ;` trong tên thư mục phá luôn graph. Phụ đề burn đi qua `current_dir` + tên tương đối `burn.srt`.
- Mọi tiến trình con phải đặt `creation_flags(0x08000000)` (`CREATE_NO_WINDOW`) trên Windows — nếu không, mỗi lần xuất sẽ nháy một cửa sổ console đen.
- Test dùng `tempfile::tempdir()`, không đụng `%APPDATA%` thật. Test cần ffmpeg thật phải `#[ignore]` và có cổng biến môi trường.
- Kết thúc mỗi task: `cargo test` xanh, **0 warning**.
- Không push lên remote.

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `src-tauri/src/export.rs` (tạo mới) | Hỏi `ffprobe`; dựng filtergraph và argv; chạy ffmpeg. |
| `src-tauri/src/ffmpeg.rs` (sửa) | `classify_ffmpeg_failure` nhận `stage` làm tham số. |
| `src-tauri/src/pipeline.rs` (sửa) | `run_export_stage` nối retime → dub → ffmpeg. |
| `src-tauri/src/config.rs` (sửa) | `ComposeConfig`. |
| `src-tauri/src/commands.rs` (sửa) | Lệnh Tauri `run_export` + sự kiện tiến độ. |
| `src-tauri/src/lib.rs` (sửa) | `pub mod export;` + đăng ký lệnh. |
| `src/App.tsx` (sửa) | Nút "Xuất video" + hai ô chọn phụ đề + lắng nghe `export_progress`. |
| `src-tauri/tests/ffmpeg_test.rs` (sửa) | Cập nhật 2 test theo chữ ký mới. |
| `src-tauri/tests/export_args_test.rs` (tạo mới) | Bốn tổ hợp argv + bất biến của filtergraph. |
| `src-tauri/tests/config_test.rs` (sửa) | `ComposeConfig` mặc định và tương thích ngược. |
| `src-tauri/tests/e2e_export_test.rs` (tạo mới) | Chạy thật trên clip, kiểm bằng `ffprobe`. |

---

### Task 1: `ffprobe` và phân loại lỗi có tên bước

`classify_ffmpeg_failure` đang gán cứng `stage: "extract_audio"`. Nếu để nguyên, lỗi lúc xuất video sẽ hiện ra cho người dùng là lỗi bước tách âm thanh — sai bước, sai hướng khắc phục.

**Files:**
- Modify: `src-tauri/src/ffmpeg.rs:5-16` (`classify_ffmpeg_failure`), `src-tauri/src/ffmpeg.rs:46` (chỗ gọi)
- Create: `src-tauri/src/export.rs`
- Modify: `src-tauri/src/lib.rs` (thêm `pub mod export;`)
- Test: `src-tauri/tests/ffmpeg_test.rs` (sửa 2 test)
- Test: `src-tauri/tests/export_args_test.rs` (tạo mới, phần `parse_duration_ms`)

**Interfaces:**
- Consumes: `crate::error::PipelineError`.
- Produces:
  - `app_lib::ffmpeg::classify_ffmpeg_failure(stage: &str, code: i32, stderr: &str) -> PipelineError`
  - `app_lib::export::parse_duration_ms(s: &str) -> Option<u64>`
  - `app_lib::export::probe_duration_ms(ffprobe: &Path, video: &Path) -> Result<u64, PipelineError>`
  - `app_lib::export::probe_has_audio(ffprobe: &Path, video: &Path) -> Result<bool, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Sửa `src-tauri/tests/ffmpeg_test.rs` — hai test gọi `classify_ffmpeg_failure` nay truyền thêm `stage`:

```rust
#[test]
fn classify_no_audio_stream() {
    let stderr = "Stream map '0:a:0' matches no streams.\nTo ignore this, add the -ignore_unknown option.";
    let err = classify_ffmpeg_failure("extract_audio", 1, stderr);
    assert!(matches!(err, PipelineError::NoAudioStream));
}

#[test]
fn classify_other_failure_as_engine_failed() {
    let stderr = "Unknown encoder 'foo'";
    let err = classify_ffmpeg_failure("extract_audio", 2, stderr);
    match err {
        PipelineError::EngineFailed { stage, code, stderr } => {
            assert_eq!(stage, "extract_audio");
            assert_eq!(code, 2);
            assert!(stderr.contains("Unknown encoder"));
        }
        _ => panic!("expected EngineFailed"),
    }
}

#[test]
fn stage_di_theo_tham_so_chu_khong_gan_cung() {
    let err = classify_ffmpeg_failure("export", 3, "Conversion failed!");
    match err {
        PipelineError::EngineFailed { stage, .. } => assert_eq!(stage, "export"),
        _ => panic!("expected EngineFailed"),
    }
}
```

Tạo `src-tauri/tests/export_args_test.rs`:

```rust
use app_lib::export::parse_duration_ms;

#[test]
fn doc_thoi_luong_ffprobe() {
    assert_eq!(parse_duration_ms("12.345"), Some(12_345));
    assert_eq!(parse_duration_ms("  7.0\n"), Some(7_000));
    assert_eq!(parse_duration_ms("0.001"), Some(1));
}

#[test]
fn thoi_luong_khong_doc_duoc_tra_ve_none() {
    assert_eq!(parse_duration_ms("N/A"), None);
    assert_eq!(parse_duration_ms(""), None);
    assert_eq!(parse_duration_ms("-1"), None);
    assert_eq!(parse_duration_ms("0"), None);
    assert_eq!(parse_duration_ms("inf"), None);
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test ffmpeg_test --test export_args_test
```
Kỳ vọng: FAIL — "this function takes 2 arguments but 3 were supplied" và "unresolved import `app_lib::export`".

- [ ] **Step 3: Đổi `classify_ffmpeg_failure`**

`src-tauri/src/ffmpeg.rs`, đổi:

```rust
pub fn classify_ffmpeg_failure(stage: &str, code: i32, stderr: &str) -> PipelineError {
    if stderr.contains("does not contain any stream") || stderr.contains("matches no streams") {
        PipelineError::NoAudioStream
    } else {
        PipelineError::EngineFailed {
            stage: stage.to_string(),
            code,
            stderr: stderr.to_string(),
        }
    }
}
```

và chỗ gọi ở cuối `extract_audio`:

```rust
    Err(classify_ffmpeg_failure("extract_audio", out.status.code().unwrap_or(-1), &stderr))
```

Tìm chỗ gọi nào còn sót bằng `grep -rn "classify_ffmpeg_failure" src-tauri/`.

- [ ] **Step 4: Tạo `export.rs` với phần `ffprobe`**

Tạo `src-tauri/src/export.rs`:

```rust
//! Trộn tiếng gốc với dải tiếng dịch rồi mux vào video.
//!
//! Chia làm hai nửa: `build_*` là hàm thuần trên chuỗi (test được không cần
//! ffmpeg), `run_export`/`probe_*` gọi tiến trình con.

use crate::error::PipelineError;
use std::path::Path;
use std::process::Command;

/// Ẩn cửa sổ console của tiến trình con trên Windows.
fn no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    #[cfg(not(windows))]
    let _ = cmd;
}

fn run_ffprobe(ffprobe: &Path, args: &[&str], video: &Path) -> Result<String, PipelineError> {
    let mut cmd = Command::new(ffprobe);
    cmd.args(args).arg(video);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffprobe".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "ffprobe".into(),
            code: out.status.code().unwrap_or(-1),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        });
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
}

/// `ffprobe` in ra thời lượng dạng giây thập phân, hoặc `N/A` với container
/// không khai báo. Hàm thuần để test được mà không cần ffprobe thật.
pub fn parse_duration_ms(s: &str) -> Option<u64> {
    let v: f64 = s.trim().parse().ok()?;
    if !v.is_finite() || v <= 0.0 {
        return None;
    }
    Some((v * 1000.0).round() as u64)
}

pub fn probe_duration_ms(ffprobe: &Path, video: &Path) -> Result<u64, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
        ],
        video,
    )?;
    parse_duration_ms(&s).ok_or_else(|| PipelineError::EngineFailed {
        stage: "ffprobe".into(),
        code: 0,
        stderr: format!(
            "Không đọc được thời lượng của {} (ffprobe trả về '{s}')",
            video.display()
        ),
    })
}

/// Video câm là chuyện bình thường (màn hình quay, slide). Không có tiếng gốc
/// thì nhánh `[0:a]` của filtergraph sẽ làm ffmpeg chết ngay, nên phải hỏi trước.
pub fn probe_has_audio(ffprobe: &Path, video: &Path) -> Result<bool, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
        ],
        video,
    )?;
    Ok(!s.trim().is_empty())
}
```

Thêm vào `src-tauri/src/lib.rs`, giữ thứ tự alphabet (giữa `pub mod error;` và `pub mod ffmpeg;`):

```rust
pub mod export;
```

- [ ] **Step 5: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: tất cả xanh, 0 warning (thêm 3 test: 1 trong `ffmpeg_test`, 2 trong `export_args_test`).

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/ffmpeg.rs src-tauri/src/export.rs src-tauri/src/lib.rs src-tauri/tests/ffmpeg_test.rs src-tauri/tests/export_args_test.rs
git commit -m "feat(export): ffprobe thời lượng/luồng audio; classify lỗi theo tên bước"
```

---

### Task 2: Dựng filtergraph và chuỗi tham số ffmpeg

Toàn bộ quyết định về âm lượng, phụ đề và codec nằm ở đây, dưới dạng hàm thuần trên chuỗi. Bốn tổ hợp (burn × có tiếng gốc) kiểm được hết mà không chạy ffmpeg lần nào.

**Files:**
- Modify: `src-tauri/src/export.rs` (thêm vào cuối)
- Test: `src-tauri/tests/export_args_test.rs` (thêm)

**Interfaces:**
- Consumes: `app_lib::export::parse_duration_ms` (Task 1).
- Produces:
  - `app_lib::export::BURN_SRT_NAME: &str = "burn.srt"`
  - `app_lib::export::ExportOpts { pub burn_subs: bool, pub soft_subs: bool, pub has_audio: bool, pub volume_original: f32, pub volume_dub: f32, pub crf: u32, pub preset: String }`
  - `app_lib::export::build_filter_complex(o: &ExportOpts) -> String`
  - `app_lib::export::build_export_args(video: &Path, dub: &Path, srt: Option<&Path>, out: &Path, o: &ExportOpts) -> Vec<OsString>`

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/export_args_test.rs`:

```rust
use app_lib::export::{build_export_args, build_filter_complex, ExportOpts, BURN_SRT_NAME};
use std::path::Path;

fn opts(burn: bool, soft: bool, has_audio: bool) -> ExportOpts {
    ExportOpts {
        burn_subs: burn,
        soft_subs: soft,
        has_audio,
        volume_original: 0.18,
        volume_dub: 3.0,
        crf: 20,
        preset: "medium".into(),
    }
}

fn args_of(o: &ExportOpts, srt: Option<&Path>) -> Vec<String> {
    build_export_args(
        Path::new(r"E:\phim\clip.mp4"),
        Path::new(r"E:\du an\tts\dub.wav"),
        srt,
        Path::new(r"E:\du an\output\final.mp4"),
        o,
    )
    .into_iter()
    .map(|s| s.to_string_lossy().to_string())
    .collect()
}

fn filter_arg(a: &[String]) -> String {
    let i = a.iter().position(|s| s == "-filter_complex").expect("thiếu -filter_complex");
    a[i + 1].clone()
}

#[test]
fn amix_phai_tat_normalize() {
    // Mặc định amix normalize=1 chia lại biên độ theo số input và xoá sạch
    // tỉ lệ 0.18/3.0. Đây là bất biến quan trọng nhất của cả module.
    let f = build_filter_complex(&opts(false, false, true));
    assert!(f.contains("normalize=0"), "filtergraph: {f}");
    assert!(f.contains("volume=0.18"), "filtergraph: {f}");
    assert!(f.contains("volume=3"), "filtergraph: {f}");
    assert!(f.contains("alimiter"), "phải chặn đỉnh sau khi nhân 3.0: {f}");
}

#[test]
fn khong_co_tieng_goc_thi_khong_nhan_3_lan() {
    // Hệ số 3.0 chỉ có nghĩa khi đứng cạnh nền 0.18; đứng một mình nó chỉ làm vỡ tiếng.
    let f = build_filter_complex(&opts(false, false, false));
    assert!(!f.contains("[0:a]"), "video câm không có luồng audio để lấy: {f}");
    assert!(!f.contains("amix"), "một nguồn thì không trộn: {f}");
    assert!(f.contains("volume=1"), "filtergraph: {f}");
    assert!(f.contains("alimiter"), "filtergraph: {f}");
}

#[test]
fn filtergraph_khong_bao_gio_chua_duong_dan_tuyet_doi() {
    // Chặn việc "sửa cho gọn" bằng cách nhét đường dẫn tuyệt đối vào filtergraph:
    // dấu hai chấm ổ đĩa kết thúc tham số filter, dấu gạch ngược bị nuốt.
    for (burn, audio) in [(true, true), (true, false), (false, true), (false, false)] {
        let a = args_of(&opts(burn, false, audio), None);
        let f = filter_arg(&a);
        assert!(!f.contains('\\'), "filtergraph có dấu gạch ngược: {f}");
        assert!(!f.contains(":\\"), "filtergraph có ổ đĩa: {f}");
        assert!(!f.contains("E:"), "filtergraph có đường dẫn tuyệt đối: {f}");
    }
}

#[test]
fn burn_dung_ten_tuong_doi_va_ma_hoa_lai_video() {
    let a = args_of(&opts(true, false, true), None);
    let f = filter_arg(&a);
    assert!(f.contains(&format!("subtitles={BURN_SRT_NAME}")), "filtergraph: {f}");
    assert!(f.contains("[0:v]"), "filtergraph: {f}");

    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "libx264"));
    assert!(a.windows(2).any(|w| w[0] == "-crf" && w[1] == "20"));
    assert!(a.windows(2).any(|w| w[0] == "-preset" && w[1] == "medium"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "[v]"));
    assert!(!a.iter().any(|s| s == "copy"), "burn thì không thể copy luồng video");
}

#[test]
fn khong_burn_thi_copy_luong_video() {
    let a = args_of(&opts(false, false, true), None);
    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "copy"));
    assert!(!a.iter().any(|s| s == "libx264"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "0:v:0"));
    assert!(!filter_arg(&a).contains("subtitles"));
}

#[test]
fn phu_de_mem_them_input_thu_ba_va_mov_text() {
    let srt = Path::new(r"E:\du an\subtitles\translated.vi.srt");
    let a = args_of(&opts(false, true, true), Some(srt));
    assert_eq!(a.iter().filter(|s| *s == "-i").count(), 3, "video + dub + srt");
    assert!(a.windows(2).any(|w| w[0] == "-c:s" && w[1] == "mov_text"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "2:0"));
    assert!(a.iter().any(|s| s == "language=vie"));
    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "copy"));
    // đường dẫn srt đi qua argv, không qua filtergraph
    assert!(a.iter().any(|s| s.contains("translated.vi.srt")));
    assert!(!filter_arg(&a).contains("translated"));
}

#[test]
fn burn_thi_bo_qua_phu_de_mem() {
    // mp4 vừa burn vừa kèm track phụ đề chỉ gây rối cho người xem
    let srt = Path::new(r"E:\du an\subtitles\translated.vi.srt");
    let a = args_of(&opts(true, true, true), Some(srt));
    assert_eq!(a.iter().filter(|s| *s == "-i").count(), 2, "không thêm input srt");
    assert!(!a.iter().any(|s| s == "mov_text"));
}

#[test]
fn luon_ket_bang_duong_dan_dau_ra_va_co_faststart() {
    let a = args_of(&opts(false, false, true), None);
    assert_eq!(a.last().unwrap(), r"E:\du an\output\final.mp4");
    assert!(a.windows(2).any(|w| w[0] == "-movflags" && w[1] == "+faststart"));
    assert!(a.windows(2).any(|w| w[0] == "-c:a" && w[1] == "aac"));
    assert!(a.contains(&"-y".to_string()), "phải ghi đè file cũ, không treo chờ trả lời");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test export_args_test
```
Kỳ vọng: FAIL, "unresolved imports `app_lib::export::build_export_args`".

- [ ] **Step 3: Cài phần dựng tham số**

Thêm vào cuối `src-tauri/src/export.rs`:

```rust
use std::ffi::OsString;

/// Tên file phụ đề dùng trong filtergraph. Luôn là tên ASCII **tương đối**:
/// ffmpeg chạy với `current_dir` đặt ở thư mục chứa nó, nên filtergraph không
/// bao giờ phải mang đường dẫn tuyệt đối. Trên Windows, dấu hai chấm ổ đĩa kết
/// thúc tham số filter, dấu gạch ngược bị nuốt, và `[ ] , ;` trong tên thư mục
/// phá luôn graph — tên người dùng có dấu tiếng Việt làm mọi thứ tệ hơn.
pub const BURN_SRT_NAME: &str = "burn.srt";

#[derive(Debug, Clone)]
pub struct ExportOpts {
    pub burn_subs: bool,
    /// Chỉ có tác dụng khi `burn_subs == false`.
    pub soft_subs: bool,
    pub has_audio: bool,
    pub volume_original: f32,
    pub volume_dub: f32,
    pub crf: u32,
    pub preset: String,
}

/// `0.18` chứ không phải `0.180`; `3` chứ không phải `3.000`.
fn fmt_vol(v: f32) -> String {
    let s = format!("{v:.3}");
    let s = s.trim_end_matches('0');
    s.trim_end_matches('.').to_string()
}

pub fn build_filter_complex(o: &ExportOpts) -> String {
    let mut parts: Vec<String> = Vec::new();

    if o.burn_subs {
        parts.push(format!("[0:v]subtitles={BURN_SRT_NAME}[v]"));
    }

    if o.has_audio {
        parts.push(format!("[0:a]volume={}[bg]", fmt_vol(o.volume_original)));
        parts.push(format!("[1:a]volume={}[vo]", fmt_vol(o.volume_dub)));
        // normalize=0 bắt buộc: mặc định amix chia lại biên độ theo số input,
        // xoá sạch tỉ lệ vừa đặt ở hai dòng trên.
        parts.push(
            "[bg][vo]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mx]".into(),
        );
    } else {
        // Video câm: hệ số nhân 3.0 vô nghĩa vì không có nền nào để nổi lên trên.
        parts.push("[1:a]volume=1[mx]".into());
    }

    // Nhân 3.0 lên một giọng Piper vốn gần full-scale sẽ cắt đỉnh thô; limiter
    // giữ đỉnh dưới 0 dBFS.
    parts.push("[mx]alimiter=limit=0.98[aout]".into());
    parts.join(";")
}

pub fn build_export_args(
    video: &Path,
    dub: &Path,
    srt: Option<&Path>,
    out: &Path,
    o: &ExportOpts,
) -> Vec<OsString> {
    let soft = o.soft_subs && !o.burn_subs;
    let soft_srt = if soft { srt } else { None };

    let mut a: Vec<OsString> = vec!["-hide_banner".into(), "-y".into()];
    a.push("-i".into());
    a.push(video.into());
    a.push("-i".into());
    a.push(dub.into());
    if let Some(s) = soft_srt {
        a.push("-i".into());
        a.push(s.into());
    }

    a.push("-filter_complex".into());
    a.push(build_filter_complex(o).into());

    a.push("-map".into());
    a.push(OsString::from(if o.burn_subs { "[v]" } else { "0:v:0" }));
    a.push("-map".into());
    a.push("[aout]".into());
    if soft_srt.is_some() {
        a.push("-map".into());
        a.push("2:0".into());
        a.push("-c:s".into());
        a.push("mov_text".into());
        a.push("-metadata:s:s:0".into());
        a.push("language=vie".into());
    }

    if o.burn_subs {
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

    a.push("-c:a".into());
    a.push("aac".into());
    a.push("-b:a".into());
    a.push("192k".into());
    a.push("-movflags".into());
    a.push("+faststart".into());
    a.push(out.into());
    a
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test export_args_test
```
Kỳ vọng: 10 passed (2 của Task 1 + 8 mới).

- [ ] **Step 5: Kiểm test không xanh vì lý do sai**

Tạm bỏ `:normalize=0` khỏi chuỗi `amix`. `amix_phai_tat_normalize` PHẢI đỏ. Khôi phục rồi chạy lại cho xanh.

Tiếp đó tạm đổi `parts.push(format!("[0:v]subtitles={BURN_SRT_NAME}[v]"));` thành đường dẫn tuyệt đối `format!("[0:v]subtitles={}[v]", r"E:\du an\subtitles\burn.srt")`. `filtergraph_khong_bao_gio_chua_duong_dan_tuyet_doi` PHẢI đỏ. Khôi phục.

- [ ] **Step 6: Xác nhận ffmpeg đã cài có `alimiter`**

```
& "$env:APPDATA\dichvideo-local\models\ffmpeg\ffmpeg.exe" -hide_banner -filters | Select-String alimiter
```
Kỳ vọng: in ra một dòng chứa `alimiter`. Nếu KHÔNG có, dừng lại và báo — bản ffmpeg đang cài là build rút gọn, và `build_filter_complex` phải bỏ nhánh limiter (đổi `[mx]alimiter=limit=0.98[aout]` thành `[mx]anull[aout]`), đồng thời sửa test tương ứng. Đừng đoán: chạy lệnh và đọc kết quả.

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/export.rs src-tauri/tests/export_args_test.rs
git commit -m "feat(export): dựng filtergraph trộn 0.18/3.0 và argv cho hai nhánh xuất"
```

---

### Task 3: `ComposeConfig`

**Files:**
- Modify: `src-tauri/src/config.rs`
- Test: `src-tauri/tests/config_test.rs`

**Interfaces:**
- Consumes: không có gì từ task khác.
- Produces:
  - `app_lib::config::ComposeConfig { pub volume_original: f32, pub volume_dub: f32, pub guard_ms: u64, pub min_length_scale: f32, pub crf: u32, pub preset: String }` có `Default`
  - `AppConfig.compose: ComposeConfig` (`#[serde(default)]`)

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/config_test.rs`:

```rust
#[test]
fn compose_mac_dinh_dung_gia_tri_cua_ung_dung_goc() {
    let c = app_lib::config::ComposeConfig::default();
    assert_eq!(c.volume_original, 0.18);
    assert_eq!(c.volume_dub, 3.0);
    assert_eq!(c.guard_ms, 80);
    assert_eq!(c.min_length_scale, 0.6);
    assert_eq!(c.crf, 20);
    assert_eq!(c.preset, "medium");
}

#[test]
fn config_json_cu_khong_co_compose_van_doc_duoc() {
    // config.json viết ra từ M2/M3 không có khoá "compose"
    let cfg = app_lib::config::parse_config_or_default(
        r#"{"translate":{"default_provider":"google_free","target_lang":"vi"}}"#,
    );
    assert_eq!(cfg.compose.volume_dub, 3.0);
    assert_eq!(cfg.translate.target_lang, "vi");
}

#[test]
fn compose_doc_duoc_gia_tri_nguoi_dung_sua() {
    let cfg = app_lib::config::parse_config_or_default(
        r#"{"compose":{"volume_original":0.3,"volume_dub":2.0,"guard_ms":120,"min_length_scale":0.7,"crf":18,"preset":"slow"}}"#,
    );
    assert_eq!(cfg.compose.volume_original, 0.3);
    assert_eq!(cfg.compose.guard_ms, 120);
    assert_eq!(cfg.compose.preset, "slow");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test config_test
```
Kỳ vọng: FAIL, "cannot find type `ComposeConfig`".

- [ ] **Step 3: Cài `ComposeConfig`**

`src-tauri/src/config.rs`, thêm trường vào `AppConfig`:

```rust
#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct AppConfig {
    #[serde(default)]
    pub translate: TranslateConfig,
    #[serde(default)]
    pub tts: TtsConfig,
    #[serde(default)]
    pub compose: ComposeConfig,
}
```

và thêm sau `TtsConfig`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComposeConfig {
    /// Âm lượng tiếng gốc khi trộn (giữ ở nền).
    pub volume_original: f32,
    /// Âm lượng giọng dịch.
    pub volume_dub: f32,
    /// Khoảng đệm giữa hai câu, mili-giây.
    pub guard_ms: u64,
    /// Chặn dưới của `length_scale` khi ép giọng vừa khung.
    pub min_length_scale: f32,
    pub crf: u32,
    pub preset: String,
}

impl Default for ComposeConfig {
    fn default() -> Self {
        Self {
            volume_original: 0.18,
            volume_dub: 3.0,
            guard_ms: crate::retime::GUARD_MS,
            min_length_scale: crate::retime::MIN_LENGTH_SCALE,
            crf: 20,
            preset: "medium".into(),
        }
    }
}
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test config_test
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/config.rs src-tauri/tests/config_test.rs
git commit -m "feat(config): ComposeConfig âm lượng/guard/crf, tương thích config cũ"
```

---

### Task 4: `run_export_stage` — nối retime → dub → ffmpeg

**Files:**
- Modify: `src-tauri/src/export.rs` (thêm `run_export`)
- Modify: `src-tauri/src/pipeline.rs` (thêm `run_export_stage`)
- Test: `src-tauri/tests/export_args_test.rs` (thêm test chuẩn bị `burn.srt`)

**Interfaces:**
- Consumes: `app_lib::export::{build_export_args, probe_duration_ms, probe_has_audio, ExportOpts, BURN_SRT_NAME}` (Task 1, 2); `app_lib::config::ComposeConfig` (Task 3); `app_lib::pipeline::run_retime_stage`, `app_lib::compose::build_dub_track`, `app_lib::retime::FitOpts` (Phase A); `app_lib::ffmpeg::classify_ffmpeg_failure` (Task 1).
- Produces:
  - `app_lib::export::run_export(ffmpeg: &Path, work_dir: &Path, args: &[OsString]) -> Result<(), PipelineError>`
  - `app_lib::export::prepare_burn_srt(subtitles_dir: &Path, translated: &Path) -> Result<PathBuf, PipelineError>`
  - `app_lib::pipeline::ExportResult { pub output_path: PathBuf, pub retime: RetimeResult, pub dub: DubStats }`
  - `app_lib::pipeline::run_export_stage(project_dir: &Path, ffmpeg: &Path, ffprobe: &Path, video: &Path, p: &dyn TtsProvider, voice: &str, base_scale: f32, tgt: &str, cfg: &ComposeConfig, burn_subs: bool, soft_subs: bool, on_phase: &mut dyn FnMut(&str)) -> Result<ExportResult, PipelineError>`

- [ ] **Step 1: Viết test thất bại**

Thêm vào `src-tauri/tests/export_args_test.rs`:

```rust
use app_lib::export::prepare_burn_srt;

#[test]
fn burn_srt_duoc_chep_sang_ten_ascii_canh_ban_dich() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let src = sub.join("translated.vi.srt");
    std::fs::write(&src, "1\r\n00:00:00,000 --> 00:00:01,000\r\nXin chào\r\n\r\n").unwrap();

    let burn = prepare_burn_srt(&sub, &src).unwrap();

    assert_eq!(burn.file_name().unwrap(), "burn.srt");
    assert_eq!(burn.parent().unwrap(), sub);
    assert_eq!(std::fs::read_to_string(&burn).unwrap(), std::fs::read_to_string(&src).unwrap());
}

#[test]
fn burn_srt_ghi_de_ban_cu() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("burn.srt"), "rác cũ").unwrap();
    let src = sub.join("translated.vi.srt");
    std::fs::write(&src, "mới").unwrap();

    let burn = prepare_burn_srt(&sub, &src).unwrap();
    assert_eq!(std::fs::read_to_string(&burn).unwrap(), "mới");
}

#[test]
fn thieu_ban_dich_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let e = prepare_burn_srt(&sub, &sub.join("khong-co.srt")).unwrap_err();
    assert!(e.to_string().contains("Dịch"), "thông báo phải chỉ ra bước còn thiếu: {e}");
}

#[test]
fn thieu_ffmpeg_tra_ve_engine_missing() {
    let d = tempfile::tempdir().unwrap();
    let e = app_lib::export::run_export(
        Path::new("khong_co_ffmpeg.exe"),
        d.path(),
        &[std::ffi::OsString::from("-version")],
    )
    .unwrap_err();
    assert!(matches!(e, app_lib::error::PipelineError::EngineMissing(_)));
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test export_args_test
```
Kỳ vọng: FAIL, "unresolved import `app_lib::export::prepare_burn_srt`".

- [ ] **Step 3: Cài `run_export` và `prepare_burn_srt`**

Thêm vào cuối `src-tauri/src/export.rs`:

```rust
use std::path::PathBuf;

/// Chép bản dịch sang `burn.srt` cạnh nó. Trả về đường dẫn tuyệt đối, nhưng
/// filtergraph chỉ dùng tên `BURN_SRT_NAME` — xem chú thích ở hằng số đó.
pub fn prepare_burn_srt(subtitles_dir: &Path, translated: &Path) -> Result<PathBuf, PipelineError> {
    let text = std::fs::read(translated).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            translated.display()
        ))
    })?;
    std::fs::create_dir_all(subtitles_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let dst = subtitles_dir.join(BURN_SRT_NAME);
    std::fs::write(&dst, text)
        .map_err(|e| PipelineError::Io(format!("không ghi được {}: {e}", dst.display())))?;
    Ok(dst)
}

/// Chạy ffmpeg với thư mục làm việc đặt ở `work_dir` — đó là cách filtergraph
/// tham chiếu `burn.srt` bằng tên tương đối mà không phải escape đường dẫn.
pub fn run_export(ffmpeg: &Path, work_dir: &Path, args: &[OsString]) -> Result<(), PipelineError> {
    let mut cmd = Command::new(ffmpeg);
    cmd.current_dir(work_dir).args(args);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffmpeg".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if out.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    Err(crate::ffmpeg::classify_ffmpeg_failure(
        "export",
        out.status.code().unwrap_or(-1),
        &stderr,
    ))
}
```

- [ ] **Step 4: Cài `run_export_stage`**

Thêm vào cuối `src-tauri/src/pipeline.rs`:

```rust
use crate::compose::{self, DubStats};
use crate::config::ComposeConfig;
use crate::export;

#[derive(Debug)]
pub struct ExportResult {
    pub output_path: PathBuf,
    pub retime: RetimeResult,
    pub dub: DubStats,
}

/// Điều kiện trước: đã chạy Lồng tiếng (có `tts/manifest.json`). Hàm này KHÔNG
/// tự chạy lượt TTS đầu — người dùng bấm "Xuất video" không nên bất ngờ chờ
/// vài phút sinh cả bộ giọng.
#[allow(clippy::too_many_arguments)]
pub fn run_export_stage(
    project_dir: &Path,
    ffmpeg: &Path,
    ffprobe: &Path,
    video: &Path,
    p: &dyn TtsProvider,
    voice: &str,
    base_scale: f32,
    tgt: &str,
    cfg: &ComposeConfig,
    burn_subs: bool,
    soft_subs: bool,
    on_phase: &mut dyn FnMut(&str),
) -> Result<ExportResult, PipelineError> {
    let video_ms = export::probe_duration_ms(ffprobe, video)?;
    let has_audio = export::probe_has_audio(ffprobe, video)?;

    on_phase("retime");
    let fopts = FitOpts { guard_ms: cfg.guard_ms, min_scale: cfg.min_length_scale };
    let retimed = run_retime_stage(project_dir, p, voice, base_scale, video_ms, &fopts, tgt)?;

    on_phase("dub");
    let tts_dir = project_dir.join("tts");
    let m = tts_manifest::load(&retimed.tts.manifest_path).ok_or_else(|| {
        PipelineError::Io(format!(
            "không đọc lại được manifest vừa ghi ({})",
            retimed.tts.manifest_path.display()
        ))
    })?;
    let dub_path = tts_dir.join("dub.wav");
    let dub = compose::build_dub_track(&tts_dir, &m, video_ms, &dub_path)?;

    on_phase("encode");
    let sub_dir = project_dir.join("subtitles");
    let translated = sub_dir.join(format!("translated.{tgt}.srt"));
    if burn_subs {
        export::prepare_burn_srt(&sub_dir, &translated)?;
    }

    let out_dir = project_dir.join("output");
    std::fs::create_dir_all(&out_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let output_path = out_dir.join("final.mp4");

    let eopts = export::ExportOpts {
        burn_subs,
        soft_subs,
        has_audio,
        volume_original: cfg.volume_original,
        volume_dub: cfg.volume_dub,
        crf: cfg.crf,
        preset: cfg.preset.clone(),
    };
    let args = export::build_export_args(
        video,
        &dub_path,
        if soft_subs && !burn_subs { Some(translated.as_path()) } else { None },
        &output_path,
        &eopts,
    );
    export::run_export(ffmpeg, &sub_dir, &args)?;

    on_phase("done");
    Ok(ExportResult { output_path, retime: retimed, dub })
}
```

Lưu ý: `sub_dir` phải tồn tại trước khi dùng làm `current_dir` — nó luôn có vì `run_translate_stage` đã tạo, nhưng khi `burn_subs == false` thì `prepare_burn_srt` không chạy. Thêm ngay trước `export::run_export`:

```rust
    std::fs::create_dir_all(&sub_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
```

- [ ] **Step 5: Chạy toàn bộ, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```
Kỳ vọng: tất cả xanh, 0 warning.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/export.rs src-tauri/src/pipeline.rs src-tauri/tests/export_args_test.rs
git commit -m "feat(pipeline): run_export_stage nối retime, dub track và ffmpeg"
```

---

### Task 5: Lệnh Tauri `run_export`

**Files:**
- Modify: `src-tauri/src/commands.rs` (thêm vào cuối)
- Modify: `src-tauri/src/lib.rs` (đăng ký lệnh)
- Test: `src-tauri/tests/commands_test.rs` (thêm)

**Interfaces:**
- Consumes: `app_lib::pipeline::run_export_stage` (Task 4); `app_lib::config::{load_config, models_dir}`; `app_lib::tts::make_provider`.
- Produces:
  - `app_lib::commands::ExportProgressEvent { pub phase: String }` (serialize camelCase), phát qua kênh `export_progress`
  - Lệnh Tauri `run_export(app, projectDir, videoPath, tgt, burnSubs, softSubs) -> ExportResultDto`
  - `ExportResultDto { outputPath, adjusted, capped, placed, truncated, saturated }`

- [ ] **Step 1: Viết test thất bại**

`commands_test.rs` không dựng được `AppHandle` nên không gọi trực tiếp lệnh Tauri. Thay vào đó kiểm hai thứ kiểm được: DTO serialize ra camelCase, và `resolve_engine_ctx` tìm đúng `ffprobe.exe`.

Thêm vào `src-tauri/tests/commands_test.rs`:

```rust
#[test]
fn export_dto_serialize_ra_camel_case() {
    let dto = app_lib::commands::ExportResultDto {
        output_path: r"E:\du an\output\final.mp4".into(),
        adjusted: 3,
        capped: 1,
        placed: 42,
        truncated: 0,
        saturated: 0,
    };
    let j = serde_json::to_string(&dto).unwrap();
    assert!(j.contains("\"outputPath\""), "UI đọc camelCase: {j}");
    assert!(!j.contains("output_path"), "{j}");
}

#[test]
fn export_progress_event_serialize_ra_camel_case() {
    let ev = app_lib::commands::ExportProgressEvent { phase: "retime".into() };
    let j = serde_json::to_string(&ev).unwrap();
    assert!(j.contains("\"phase\":\"retime\""), "{j}");
}
```

- [ ] **Step 2: Chạy để xác nhận thất bại**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test commands_test
```
Kỳ vọng: FAIL, "cannot find type `ExportResultDto`".

- [ ] **Step 3: Cài lệnh**

Thêm vào cuối `src-tauri/src/commands.rs`:

```rust
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResultDto {
    pub output_path: String,
    /// Số cue phải đọc nhanh hơn để vừa khung.
    pub adjusted: usize,
    /// Số cue đọc nhanh hết cỡ mà vẫn tràn.
    pub capped: usize,
    pub placed: usize,
    pub truncated: usize,
    pub saturated: usize,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportProgressEvent {
    /// "retime" | "dub" | "encode" | "done"
    pub phase: String,
}

#[tauri::command]
pub async fn run_export(
    app: tauri::AppHandle,
    project_dir: String,
    video_path: String,
    tgt: String,
    burn_subs: bool,
    soft_subs: bool,
) -> Result<ExportResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<ExportResultDto, String> {
        use tauri::Emitter;
        let cfg = crate::config::load_config();
        let md = models_dir();
        let ffmpeg = require_path(md.join("ffmpeg").join("ffmpeg.exe"))?;
        let ffprobe = require_path(md.join("ffmpeg").join("ffprobe.exe"))?;
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &md)
            .map_err(|e| e.to_string())?;

        let r = crate::pipeline::run_export_stage(
            Path::new(&project_dir),
            &ffmpeg,
            &ffprobe,
            Path::new(&video_path),
            p.as_ref(),
            &cfg.tts.voice,
            cfg.tts.length_scale,
            &tgt,
            &cfg.compose,
            burn_subs,
            soft_subs,
            &mut |phase| {
                let _ = app.emit("export_progress", ExportProgressEvent { phase: phase.to_string() });
            },
        )
        .map_err(|e| e.to_string())?;

        Ok(ExportResultDto {
            output_path: r.output_path.display().to_string(),
            adjusted: r.retime.adjusted,
            capped: r.retime.capped,
            placed: r.dub.placed,
            truncated: r.dub.truncated,
            saturated: r.dub.saturated,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}
```

Đăng ký trong `src-tauri/src/lib.rs`, thêm vào cuối `generate_handler![]`:

```rust
            commands::run_export,
```

- [ ] **Step 4: Chạy lại, phải PASS**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/src/lib.rs src-tauri/tests/commands_test.rs
git commit -m "feat(commands): lệnh run_export + sự kiện export_progress"
```

---

### Task 6: Giao diện xuất video

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: lệnh Tauri `run_export` và kênh sự kiện `export_progress` (Task 5).
- Produces: không có gì cho task sau.

- [ ] **Step 1: Ghi nhớ đường dẫn video đã chọn**

`onRun` hiện chọn video rồi quên đường dẫn ngay sau khi gọi `run_stt`; lệnh xuất cần lại nó. Thêm state cạnh các state khác (khoảng dòng 20):

```tsx
  const [videoPath, setVideoPath] = useState("");
  const [burnSubs, setBurnSubs] = useState(false);
  const [softSubs, setSoftSubs] = useState(true);
  const [exportPhase, setExportPhase] = useState("");
```

và trong `onRun`, ngay sau `if (!selected) return;`:

```tsx
    setVideoPath(selected as string);
```

- [ ] **Step 2: Khai báo kiểu và lắng nghe tiến độ**

Thêm cạnh các interface khác ở đầu file:

```tsx
interface ExportResultDto {
  outputPath: string; adjusted: number; capped: number;
  placed: number; truncated: number; saturated: number;
}
```

Thêm một `useEffect` ngay sau effect `component_progress`, theo đúng khuôn dọn listener của nó:

```tsx
  useEffect(() => {
    const un = listen<{ phase: string }>("export_progress", (e) => {
      const ten: Record<string, string> = {
        retime: "Đang khớp giọng vào phụ đề...",
        dub: "Đang ghép dải tiếng dịch...",
        encode: "Đang xuất video...",
        done: "",
      };
      setExportPhase(ten[e.payload.phase] ?? e.payload.phase);
    });
    return () => { un.then((f) => f()); };
  }, []);
```

- [ ] **Step 3: Thêm hàm gọi lệnh**

Thêm sau `onTts`:

```tsx
  async function onExport() {
    setRunning(true); setStatus("Đang xuất video...");
    try {
      const r = await invoke<ExportResultDto>("run_export", {
        projectDir, videoPath, tgt, burnSubs, softSubs,
      });
      const canhBao = r.capped > 0
        ? ` (${r.capped} câu phải đọc nhanh hết cỡ mà vẫn tràn)`
        : "";
      setStatus(`Xuất xong: ${r.outputPath} — ${r.placed} câu lồng tiếng${canhBao}`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false); setExportPhase("");
    }
  }
```

- [ ] **Step 4: Thêm khối giao diện**

Thêm sau khối `<h2>Lồng tiếng</h2>` (khoảng dòng 125-128):

```tsx
      <h2>Xuất video</h2>
      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={burnSubs}
            onChange={(e) => setBurnSubs(e.target.checked)}
          />
          Ghi phụ đề vào hình (burn-in, phải mã hoá lại video nên lâu hơn nhiều)
        </label>
      </div>
      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={softSubs}
            disabled={burnSubs}
            onChange={(e) => setSoftSubs(e.target.checked)}
          />
          Kèm phụ đề bật/tắt được
        </label>
      </div>
      <div className="row">
        <button
          type="button"
          onClick={onExport}
          disabled={running || !projectDir || !videoPath}
        >
          Xuất video
        </button>
        {exportPhase && <span>{exportPhase}</span>}
      </div>
```

Ô "Kèm phụ đề bật/tắt được" bị vô hiệu hoá khi chọn burn: mp4 vừa có phụ đề ghi chết vừa có track phụ đề chỉ gây rối cho người xem.

- [ ] **Step 5: Kiểm biên dịch TypeScript**

```
npm run build
```
Kỳ vọng: build thành công, không lỗi type. Nếu `npm` báo thiếu `node_modules`, chạy `npm install` trước.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat(ui): nút Xuất video với lựa chọn burn-in hoặc phụ đề mềm"
```

---

### Task 7: E2E trên clip thật

Đây là bước duy nhất chứng minh chuỗi tham số ffmpeg thật sự chạy được. Mọi test trước chỉ kiểm chuỗi ký tự.

**Files:**
- Create: `src-tauri/tests/e2e_export_test.rs`

**Interfaces:**
- Consumes: toàn bộ chuỗi `run_stt_pipeline` → `run_translate_stage` → `run_tts_stage` → `run_export_stage`.
- Produces: không có gì cho task sau.

- [ ] **Step 1: Viết test E2E**

Tạo `src-tauri/tests/e2e_export_test.rs`:

```rust
//! E2E: video → STT → dịch → TTS → xuất mp4 trên engine thật. Bỏ qua mặc định:
//!   $env:DVL_E2E_CLIP="E:\path\clip.mp4"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test -- --ignored --nocapture
//! Yêu cầu đã chạy ensure_components để có đủ ffmpeg/ffprobe/sherpa/piper.

use app_lib::config::{load_config, models_dir, projects_dir};
use app_lib::pipeline::{
    run_export_stage, run_stt_pipeline, run_translate_stage, run_tts_stage, EngineCtx,
};
use app_lib::stt::SttModels;
use app_lib::tts::ScalePlan;
use std::path::Path;
use std::process::Command;

fn ffprobe_ra(ffprobe: &Path, args: &[&str], file: &Path) -> String {
    let out = Command::new(ffprobe).args(args).arg(file).output().unwrap();
    assert!(out.status.success(), "ffprobe lỗi: {}", String::from_utf8_lossy(&out.stderr));
    String::from_utf8_lossy(&out.stdout).trim().to_string()
}

/// Đỉnh âm của file, dBFS. `astats` in ra `Peak level dB: -3.21`.
fn dinh_am_dbfs(ffmpeg: &Path, file: &Path) -> f64 {
    let out = Command::new(ffmpeg)
        .args(["-hide_banner", "-nostats", "-i"])
        .arg(file)
        .args(["-af", "astats=measure_overall=Peak_level:measure_perchannel=none", "-f", "null", "-"])
        .output()
        .unwrap();
    let err = String::from_utf8_lossy(&out.stderr).to_string();
    for line in err.lines() {
        if let Some(v) = line.split("Peak level dB:").nth(1) {
            if let Ok(x) = v.trim().parse::<f64>() {
                return x;
            }
        }
    }
    panic!("không tìm thấy 'Peak level dB' trong đầu ra astats:\n{err}");
}

fn chay(burn: bool, soft: bool, ten: &str) {
    let clip = std::env::var("DVL_E2E_CLIP").expect("set DVL_E2E_CLIP=<video path>");
    let lang = std::env::var("DVL_E2E_LANG").unwrap_or_else(|_| "zh".into());
    let m = models_dir();
    let ffmpeg = m.join("ffmpeg").join("ffmpeg.exe");
    let ffprobe = m.join("ffmpeg").join("ffprobe.exe");

    let ctx = EngineCtx {
        ffmpeg: ffmpeg.clone(),
        sherpa: m.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"),
        models: SttModels {
            sense_voice: m.join("sherpa").join("sense-voice.onnx"),
            tokens: m.join("sherpa").join("tokens.txt"),
            vad: m.join("sherpa").join("vad-model.onnx"),
        },
    };

    let project = projects_dir().join(format!("e2e-export-{ten}-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&project).unwrap();
    println!("dự án: {}", project.display());

    let stt = run_stt_pipeline(&ctx, Path::new(&clip), &project, &lang)
        .unwrap_or_else(|e| panic!("STT lỗi: {e}"));
    assert!(stt.cue_count > 0);

    let cfg = load_config();
    let tp = app_lib::translate::make_provider("google_free", &cfg.translate).unwrap();
    run_translate_stage(&project, tp.as_ref(), "auto", "vi")
        .unwrap_or_else(|e| panic!("Dịch lỗi: {e}"));

    let p = app_lib::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &m)
        .unwrap_or_else(|e| panic!("provider TTS lỗi: {e}"));
    run_tts_stage(&project, p.as_ref(), &cfg.tts.voice, &ScalePlan::uniform(cfg.tts.length_scale), "vi")
        .unwrap_or_else(|e| panic!("TTS lỗi: {e}"));

    let t0 = std::time::Instant::now();
    let r = run_export_stage(
        &project, &ffmpeg, &ffprobe, Path::new(&clip),
        p.as_ref(), &cfg.tts.voice, cfg.tts.length_scale, "vi",
        &cfg.compose, burn, soft,
        &mut |ph| println!("  [{ph}] {:.1}s", t0.elapsed().as_secs_f32()),
    )
    .unwrap_or_else(|e| panic!("Xuất lỗi: {e}"));

    println!(
        "xong {:.1}s — {} câu, {} câu nhanh lại, {} câu chạm trần, {} mẫu bão hoà",
        t0.elapsed().as_secs_f32(), r.dub.placed, r.retime.adjusted, r.retime.capped, r.dub.saturated
    );

    let out = &r.output_path;
    assert!(out.exists(), "không có file đầu ra");
    assert!(std::fs::metadata(out).unwrap().len() > 10_000, "file đầu ra quá nhỏ");

    // Thời lượng lệch dưới 0.5 s so với nguồn
    let d_src: f64 = ffprobe_ra(&ffprobe, &["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1"], Path::new(&clip)).parse().unwrap();
    let d_out: f64 = ffprobe_ra(&ffprobe, &["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1"], out).parse().unwrap();
    assert!((d_src - d_out).abs() < 0.5, "thời lượng lệch: nguồn {d_src}s, xuất {d_out}s");

    // Đúng số luồng
    let kinds = ffprobe_ra(&ffprobe, &["-v","error","-show_entries","stream=codec_type","-of","csv=p=0"], out);
    println!("luồng: {kinds:?}");
    assert!(kinds.contains("video"));
    assert!(kinds.contains("audio"));
    if soft && !burn {
        assert!(kinds.contains("subtitle"), "chọn phụ đề mềm mà không có luồng subtitle");
    }
    if burn {
        assert!(!kinds.contains("subtitle"), "burn thì không kèm luồng subtitle");
    }

    // Không vỡ tiếng
    let peak = dinh_am_dbfs(&ffmpeg, out);
    println!("đỉnh âm: {peak} dBFS");
    assert!(peak <= 0.0, "âm thanh bị cắt đỉnh: {peak} dBFS");
}

#[test]
#[ignore]
fn e2e_xuat_nhanh_kem_phu_de_mem() {
    chay(false, true, "soft");
}

#[test]
#[ignore]
fn e2e_xuat_burn_phu_de() {
    chay(true, false, "burn");
}
```

- [ ] **Step 2: Kiểm biên dịch (chưa chạy)**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test
```
Kỳ vọng: biên dịch được, "0 passed; 2 ignored".

- [ ] **Step 3: Chạy thật nhánh phụ đề mềm**

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:DVL_E2E_CLIP = "<đường dẫn clip mp4 có tiếng nói>"
cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test e2e_xuat_nhanh_kem_phu_de_mem -- --ignored --nocapture
```
Kỳ vọng: PASS. `-c:v copy` nên bước encode chỉ vài giây. Ghi lại vào báo cáo: thời gian từng bước, số câu, số câu chạm trần, đỉnh âm dBFS.

- [ ] **Step 4: Chạy thật nhánh burn**

```
cargo test --manifest-path src-tauri/Cargo.toml --test e2e_export_test e2e_xuat_burn_phu_de -- --ignored --nocapture
```
Kỳ vọng: PASS. Lâu hơn nhiều vì mã hoá lại video. Nếu lỗi `No such filter: 'subtitles'` thì bản ffmpeg cài sẵn thiếu libass — dừng lại và báo, đừng tự đổi sang cách khác.

- [ ] **Step 5: Mở file và xem thử**

Mở `<project>/output/final.mp4` bằng trình phát. Xác nhận bằng mắt và tai: giọng Việt rơi đúng lúc người trong video nói, tiếng gốc còn nghe được ở nền, và (nhánh burn) phụ đề hiện trên hình. Ghi nhận xét vào báo cáo — đây là điều `ffprobe` không kiểm được.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/tests/e2e_export_test.rs
git commit -m "test(e2e): xuất video thật cho cả hai nhánh phụ đề"
```

---

## Nghiệm thu M4

Sau Task 7, mở app, chọn một video, bấm lần lượt STT → Dịch → Lồng tiếng → Xuất video, ra `output/final.mp4` xem được: giọng Việt khớp thời điểm người nói, tiếng gốc ở nền, phụ đề theo đúng lựa chọn. `cargo test` xanh, 0 warning, và các test E2E có cổng môi trường vẫn `ignored` trong lượt chạy thường.
