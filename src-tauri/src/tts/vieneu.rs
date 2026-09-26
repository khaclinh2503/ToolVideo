//! Provider `VieNeu` (M7): gọi `python/vieneu_bridge.py` làm tiến trình con,
//! theo đúng giao thức dòng JSON đã chốt ở Task 3
//! (`src-tauri/python/vieneu_bridge.py`, đọc chính file đó — không phải kế
//! hoạch — nếu cần đối chiếu hợp đồng).
//!
//! Tốc độ đọc KHÔNG đi qua cầu nối: VieNeu-TTS không có tham số
//! `length_scale`/`speed` nào trong `infer()` của SDK (đã grep xác nhận rỗng
//! trong `vieneu/v3turbo.py` và `vieneu/base.py` — xem docstring của
//! `vieneu_bridge.py`). Đừng lặng lẽ thêm lại khoá "length_scale"/"speed" vào
//! JSON gửi cho cầu nối — cầu nối không có gì để làm với khoá đó.
//!
//! Thay vào đó `synthesize` **hậu xử lý bằng ffmpeg `atempo`** sau khi cầu nối
//! ghi xong WAV — xem `ep_toc_do` bên dưới. Cách này còn chắc hơn đường của
//! Piper: `atempo` là phép biến đổi số học xác định trên một file có sẵn, nên
//! không thể rơi vào kiểu lỗi "engine nhận tham số rồi lặng lẽ bỏ qua" từng
//! làm `--length_scale` của Piper thành no-op suốt từ M3 tới khi phát hiện ở M6.

use crate::{
    error::PipelineError,
    tts::{procio::run_line_protocol, TtsJob, TtsProvider},
};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

/// Nội dung `vieneu_bridge.py`, nhúng thẳng vào binary lúc biên dịch — cùng
/// lý do với `pyenv::REQUIREMENTS`: bản đóng gói (`tauri build`) không có cây
/// nguồn `src-tauri/python/` trên máy người dùng, nên không thể đọc file này
/// từ đĩa theo đường dẫn tương đối lúc chạy. Nhúng vào binary rồi ghi ra đĩa
/// ở `ensure_bridge_script` mỗi lần khởi tạo provider — luôn khớp bản binary
/// đang chạy, không thể kẹt lại một bản cầu nối cũ sau khi nâng cấp app.
pub const BRIDGE_SCRIPT: &str = include_str!("../../python/vieneu_bridge.py");

/// Ghi `BRIDGE_SCRIPT` ra `<models>/vieneu/vieneu_bridge.py`; bỏ qua nếu nội
/// dung trên đĩa đã khớp (tránh ghi lại không cần thiết mỗi lần gọi). Trả về
/// đường dẫn đã ghi.
pub fn ensure_bridge_script(models: &Path) -> Result<PathBuf, PipelineError> {
    let dir = models.join("vieneu");
    std::fs::create_dir_all(&dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let path = dir.join("vieneu_bridge.py");
    let da_khop = std::fs::read_to_string(&path).map(|s| s == BRIDGE_SCRIPT).unwrap_or(false);
    if !da_khop {
        std::fs::write(&path, BRIDGE_SCRIPT).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    Ok(path)
}


/// Một giọng dựng sẵn của VieNeu-TTS.
///
/// `ten` là **giá trị truyền thẳng cho `voice=`** của SDK — tên hiển thị có
/// dấu, KHÔNG phải slug. Truyền slug (`mai_anh`) vào là SDK báo
/// `Voice 'mai_anh' not found`; đã gặp thật khi chạy thử.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Voice {
    pub ten: &'static str,
    pub gioi: &'static str,
    pub mien: &'static str,
    pub phong_cach: &'static str,
    /// Tác giả SDK khuyên dùng — giao diện xếp nhóm này lên đầu.
    pub khuyen_dung: bool,
}

/// Giọng mặc định khi người dùng chưa chọn. Nằm trong nhóm khuyên dùng.
pub const GIONG_MAC_DINH: &str = "Hải Đăng";

/// 25 giọng dựng sẵn, lấy từ `list_preset_voices()` của SDK đã cài
/// (`vieneu 3.8.3`, đọc ngày 2026-09-26) và **sinh máy** từ kết quả đó —
/// không chép tay, vì 25 tên tiếng Việt có dấu chép tay là chắc chắn sai ít
/// nhất một chỗ, mà sai tên thì chỉ lộ ra lúc chạy.
///
/// KHÔNG lấy từ `gguf/voices/manifest.json` trên HuggingFace: bộ giọng đường
/// GGUF khác bộ đường ONNX/Python. Manifest có `Anh Khôi`, `Minh Quân Pro`,
/// `Mạnh Dũng` mà SDK không có; SDK có `Thiện Minh` và `Quốc Tuấn` mà manifest
/// không có.
pub const VOICES: &[Voice] = &[
    Voice { ten: "Adam bựa", gioi: "Nam", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: true },
    Voice { ten: "Trúc Ly", gioi: "Nữ", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: true },
    Voice { ten: "Thiện Minh", gioi: "Nam", mien: "Bắc", phong_cach: "kể chuyện", khuyen_dung: true },
    Voice { ten: "Mai Anh", gioi: "Nữ", mien: "Bắc", phong_cach: "tin tức", khuyen_dung: true },
    Voice { ten: "Hải Đăng", gioi: "Nam", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: true },
    Voice { ten: "Thùy Dung", gioi: "Nữ", mien: "Nam", phong_cach: "tin tức", khuyen_dung: true },
    Voice { ten: "Thiền Tâm Đức", gioi: "Nam", mien: "Bắc", phong_cach: "kể chuyện", khuyen_dung: true },
    Voice { ten: "Ngọc Huyền", gioi: "Nữ", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: true },
    Voice { ten: "Quang Sơn", gioi: "Nam", mien: "Trung", phong_cach: "tự nhiên", khuyen_dung: true },
    Voice { ten: "Ngọc Trân", gioi: "Nữ", mien: "Trung", phong_cach: "tự nhiên", khuyen_dung: true },
    Voice { ten: "Minh Đức", gioi: "Nam", mien: "Bắc", phong_cach: "tin tức", khuyen_dung: false },
    Voice { ten: "Phạm Tuyên", gioi: "Nam", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: false },
    Voice { ten: "Thái Sơn", gioi: "Nam", mien: "Nam", phong_cach: "kể chuyện", khuyen_dung: false },
    Voice { ten: "Xuân Vĩnh", gioi: "Nam", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: false },
    Voice { ten: "Thanh Bình", gioi: "Nam", mien: "Bắc", phong_cach: "kể chuyện", khuyen_dung: false },
    Voice { ten: "Ngọc Linh", gioi: "Nữ", mien: "Bắc", phong_cach: "kể chuyện", khuyen_dung: false },
    Voice { ten: "Đoan Trang", gioi: "Nữ", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: false },
    Voice { ten: "Thục Đoan", gioi: "Nữ", mien: "Nam", phong_cach: "kể chuyện", khuyen_dung: false },
    Voice { ten: "Minh Triết", gioi: "Nam", mien: "Nam", phong_cach: "tin tức", khuyen_dung: false },
    Voice { ten: "Mỹ Duyên", gioi: "Nữ", mien: "Nam", phong_cach: "đọc truyện", khuyen_dung: false },
    Voice { ten: "Quỳnh Anh", gioi: "Nữ", mien: "Bắc", phong_cach: "đọc truyện", khuyen_dung: false },
    Voice { ten: "Đức Trí", gioi: "Nam", mien: "Nam", phong_cach: "đọc truyện", khuyen_dung: false },
    Voice { ten: "Kim Thanh", gioi: "Nữ", mien: "Nam", phong_cach: "đọc truyện", khuyen_dung: false },
    Voice { ten: "Adam", gioi: "Nam", mien: "Nam", phong_cach: "tự nhiên", khuyen_dung: false },
    Voice { ten: "Quốc Tuấn", gioi: "Nam", mien: "Bắc", phong_cach: "tự nhiên", khuyen_dung: false },
];

/// Tra một giọng theo tên. Tên lạ ⇒ lỗi tiếng Việt chỉ rõ phải làm gì, thay vì
/// để SDK báo `Voice not found` giữa lúc lồng tiếng.
pub fn tra_giong(ten: &str) -> Result<&'static Voice, PipelineError> {
    VOICES.iter().find(|v| v.ten == ten.trim()).ok_or_else(|| {
        PipelineError::Io(format!(
            "Không có giọng '{}' — chọn lại trong danh sách",
            ten.trim()
        ))
    })
}

/// Provider VieNeu-TTS.
pub struct VieNeu {
    pub python: PathBuf,
    pub bridge: PathBuf,
    pub site_packages: PathBuf,
    pub hf_home: PathBuf,
    pub voice: String,
    /// `<models>/vieneu` — thư mục gốc chứa 15 file đã pin cứng trong
    /// `components.json` (`config.json`, `denoiser.onnx` ở gốc; `onnx_update/`
    /// với 7 file backbone fp32; `moss/` với 6 file codec ONNX). Truyền cho
    /// cầu nối qua biến môi trường `VIENEU_MODELS_DIR`; cầu nối tự quyết định
    /// dùng cục bộ (offline) hay để SDK tải qua HF Hub nếu thư mục chưa đủ —
    /// xem `_tao_vieneu()` trong `vieneu_bridge.py`.
    pub models_dir: PathBuf,
    /// `<models>/ffmpeg/ffmpeg.exe` — dùng cho bước ép tốc độ `atempo`. VieNeu
    /// không tự ép tốc độ được nên phần này bắt buộc phải có ffmpeg.
    pub ffmpeg: PathBuf,
}

/// Dải hợp lệ của MỘT tầng filter `atempo` trong ffmpeg.
const ATEMPO_MIN: f32 = 0.5;
const ATEMPO_MAX: f32 = 2.0;

/// Đổi hệ số **kéo dài** (`length_scale`, quy ước của Piper và `retime::ScalePlan`)
/// sang hệ số **tốc độ** của ffmpeg.
///
/// HAI ĐẠI LƯỢNG NGHỊCH ĐẢO NHAU — đây là chỗ dễ sai nhất của cả bước này:
///
/// | | ý nghĩa | đọc nhanh hơn thì |
/// |---|---|---|
/// | `length_scale` | hệ số kéo dài | **giảm** (0.6 = nhanh) |
/// | `atempo` | hệ số tốc độ | **tăng** (1.667 = nhanh) |
///
/// Đảo chiều thì giọng đọc **chậm lại** thay vì nhanh lên, cue tràn nặng hơn,
/// và không có gì báo lỗi. Test `doi_chieu_he_so_dung_cach` giữ đúng chiều này.
///
/// `retime::fit_scale` chỉ bao giờ GIẢM `length_scale` (≤ 1.0) và chặn dưới ở
/// `MIN_LENGTH_SCALE = 0.6`, nên `atempo` thực tế nằm trong `[1.0, 1.667]` —
/// gọn trong dải một tầng, không cần nối chuỗi filter.
pub fn atempo_tu_length_scale(length_scale: f32) -> Result<f32, PipelineError> {
    if !length_scale.is_finite() || length_scale <= 0.0 {
        return Err(PipelineError::Io(format!(
            "hệ số tốc độ đọc không hợp lệ: {length_scale}"
        )));
    }
    let atempo = 1.0 / length_scale;
    if !(ATEMPO_MIN..=ATEMPO_MAX).contains(&atempo) {
        return Err(PipelineError::Io(format!(
            "tốc độ đọc {length_scale} vượt dải ffmpeg xử lý được một tầng \
             (atempo {atempo:.3}, phải trong {ATEMPO_MIN}..={ATEMPO_MAX})"
        )));
    }
    Ok(atempo)
}

impl VieNeu {
    /// Ép tốc độ đọc của WAV vừa sinh cho khớp `job.length_scale`.
    ///
    /// Không làm gì khi hệ số bằng 1.0 — đừng chạy ffmpeg vô ích cho mọi cue
    /// trong khi phần lớn cue vừa khung và không cần ép.
    ///
    /// Ghi ra tệp tạm rồi `rename` đè: ffmpeg không đọc và ghi cùng một đường
    /// dẫn được (nó cắt cụt file đầu vào ngay khi mở đầu ra). Cùng khuôn
    /// tmp+rename đã dùng cho wav và manifest ở M6.
    fn ep_toc_do(&self, job: &TtsJob) -> Result<(), PipelineError> {
        ep_toc_do_tep(&self.ffmpeg, &job.out, job.length_scale, job.index)
    }
}

/// Ép tốc độ một tệp WAV tại chỗ. Tách khỏi `VieNeu` để test đi qua đúng mã
/// thật (kể cả bước tmp+rename) mà không cần dựng cả provider và Python.
pub fn ep_toc_do_tep(
    ffmpeg: &Path,
    tep: &Path,
    length_scale: f32,
    index: usize,
) -> Result<(), PipelineError> {
    if (length_scale - 1.0).abs() < 1e-6 {
            return Ok(());
        }
        let atempo = atempo_tu_length_scale(length_scale)?;
        let tmp = tep.with_extension("wav.tmp");
        let args = build_atempo_args(tep, &tmp, atempo);

        let mut cmd = Command::new(ffmpeg);
        cmd.args(&args);
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }
        let out = cmd.output().map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                PipelineError::EngineMissing("ffmpeg".into())
            } else {
                PipelineError::Io(e.to_string())
            }
        })?;
        if !out.status.success() {
            let _ = std::fs::remove_file(&tmp);
            return Err(PipelineError::EngineFailed {
                stage: format!("ép tốc độ cue {index}"),
                code: out.status.code().unwrap_or(-1),
                stderr: String::from_utf8_lossy(&out.stderr).to_string(),
            });
        }
        // Chỉ thay file thật khi ffmpeg đã xong sạch — hỏng giữa chừng thì giữ
        // nguyên bản chưa ép còn hơn để lại một file cụt.
    std::fs::rename(&tmp, tep).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Tham số ffmpeg đọc `vao`, ép tốc độ `atempo`, ghi `ra`. Hàm thuần để test.
///
/// `atempo` không đổi tần số mẫu hay số kênh, nhưng ta vẫn ép `pcm_s16le` để
/// đầu ra chắc chắn cùng định dạng với đầu vào — `compose.rs` so tần số từng
/// WAV với header manifest và từ chối nếu lệch.
pub fn build_atempo_args(vao: &Path, ra: &Path, atempo: f32) -> Vec<String> {
    vec![
        "-nostdin".into(),
        "-hide_banner".into(),
        "-loglevel".into(),
        "error".into(),
        "-y".into(),
        "-i".into(),
        vao.display().to_string(),
        "-filter:a".into(),
        format!("atempo={atempo:.6}"),
        "-c:a".into(),
        "pcm_s16le".into(),
        // BẮT BUỘC: đầu ra là tệp tạm đuôi `.wav.tmp`, ffmpeg không suy ra được
        // định dạng từ đuôi đó và sẽ bỏ ngang với "Unable to choose an output
        // format". Test đơn vị so chuỗi tham số KHÔNG bắt được lỗi này — chỉ
        // E2E chạy ffmpeg thật mới thấy.
        "-f".into(),
        "wav".into(),
        ra.display().to_string(),
    ]
}

/// Một dòng JSON cho stdin của cầu nối VieNeu. Cùng quy tắc gộp xuống dòng với
/// `piper::build_line`; khác biệt duy nhất là khoá `"voice"`.
///
/// `voice` PHẢI là tên hiển thị có dấu lấy từ `list_preset_voices()` của SDK
/// (vd. `"Mai Anh"`), KHÔNG phải slug (`"mai_anh"` ⇒ SDK báo lỗi
/// `Voice not found`) — xem `giong-tu-sdk.json`, việc chọn đúng tên hiển thị
/// thuộc Task 5 (chọn giọng), hàm này chỉ chuyển tiếp nguyên văn.
///
/// KHÔNG có khoá "length_scale"/"speed" — xem comment đầu file module.
pub fn build_line(job: &TtsJob, voice: &str) -> String {
    let text = job.text.replace("\r\n", " ").replace('\n', " ").replace('\r', " ");
    let v = serde_json::json!({
        "text": text,
        "output_file": job.out.display().to_string(),
        "voice": voice,
    });
    v.to_string()
}

/// Gom `jobs` theo tốc độ (khoá `"{:.3}"`, khớp `tts::cache_key` và
/// `piper::group_by_scale`). VieNeu KHÔNG cần nhóm này để spawn — SDK không
/// có cờ tốc độ theo tiến trình như Piper, và nạp model chỉ nên xảy ra một
/// lần cho toàn batch (nạp lại tốn vài giây, xem docstring
/// `vieneu_bridge.py`) — nên `synthesize` bên dưới luôn gọi ĐÚNG MỘT tiến
/// trình cho toàn bộ `jobs`, không dùng hàm này.
///
/// Hàm này tồn tại để task ép tốc độ hậu xử lý (ffmpeg `atempo`, ngay sau
/// task này) có sẵn cách nhóm cue theo tốc độ mong muốn, cùng quy ước khoá
/// với phần còn lại của pipeline.
pub fn group_by_speed(jobs: &[TtsJob]) -> Vec<(f32, Vec<TtsJob>)> {
    let mut map: std::collections::BTreeMap<String, (f32, Vec<TtsJob>)> =
        std::collections::BTreeMap::new();
    for j in jobs {
        let key = format!("{:.3}", j.length_scale);
        map.entry(key).or_insert_with(|| (j.length_scale, Vec::new())).1.push(j.clone());
    }
    map.into_values().collect()
}

impl TtsProvider for VieNeu {
    fn id(&self) -> &'static str {
        "vieneu"
    }

    fn sample_rate(&self) -> u32 {
        // VieNeu-TTS v3 Turbo luôn ra 48kHz — hằng số của SDK
        // (`V3TurboVieNeuTTS.__init__`: `self.sample_rate = 48_000`), không
        // đọc từ file cấu hình như Piper (không có file kiểu đó ở đây).
        48_000
    }

    fn synthesize(
        &self,
        jobs: &[TtsJob],
        on_done: &mut dyn FnMut(usize),
    ) -> Result<(), PipelineError> {
        // Không có job ⇒ không spawn gì cả (đúng hợp đồng trait, và để test
        // `khong_co_job_thi_khong_spawn` chạy được với `python` không tồn tại).
        if jobs.is_empty() {
            return Ok(());
        }
        for j in jobs {
            if let Some(d) = j.out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
        }
        // HF_HOME phải tồn tại trước khi spawn: huggingface_hub tự tạo cây con
        // bên trong, nhưng không tự tạo thư mục gốc nếu cha nó còn thiếu.
        std::fs::create_dir_all(&self.hf_home).map_err(|e| PipelineError::Io(e.to_string()))?;

        let mut cmd = Command::new(&self.python);
        cmd.arg(&self.bridge)
            .env("PYTHONPATH", &self.site_packages)
            .env("HF_HOME", &self.hf_home)
            .env("PYTHONIOENCODING", "utf-8")
            .env("VIENEU_MODELS_DIR", &self.models_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }
        let mut child = cmd.spawn().map_err(|err| {
            if err.kind() == std::io::ErrorKind::NotFound {
                PipelineError::EngineMissing("vieneu".into())
            } else {
                PipelineError::Io(err.to_string())
            }
        })?;

        // Khuôn ba luồng song song (stdin riêng / stdout luồng gọi / stderr
        // riêng, đọc theo byte + decode lossy) — dùng chung với `tts/piper.rs`
        // qua `tts::procio::run_line_protocol`. Xem comment ở đó để biết lý
        // do (treo ống 4KB trên Windows, byte không phải UTF-8 trong đường
        // dẫn output_file làm chết `.lines()`).
        let lines: Vec<String> = jobs.iter().map(|j| build_line(j, &self.voice)).collect();
        let mut done = 0usize;
        let (done_count, stderr_tail) = run_line_protocol(&mut child, lines, &mut |_line| {
            // `on_done` nhận `job.index` GỐC (không phải số thứ tự trong
            // batch): cùng quy ước với `piper.rs`, vì `jobs` ở đây đã là toàn
            // bộ batch (VieNeu không gom nhóm theo tốc độ như Piper).
            if done < jobs.len() {
                on_done(jobs[done].index);
            }
            done += 1;
        });
        let done = done_count;

        let status = child.wait().map_err(|e| PipelineError::Io(e.to_string()))?;

        if !status.success() || done < jobs.len() {
            let failed_index = jobs.get(done).map(|j| j.index).unwrap_or(0);
            return Err(PipelineError::EngineFailed {
                stage: format!("tts cue {failed_index}"),
                code: status.code().unwrap_or(-1),
                stderr: stderr_tail,
            });
        }

        // Hợp đồng của trait: Ok ⇒ mọi file đích tồn tại.
        for j in jobs {
            if !j.out.exists() {
                return Err(PipelineError::EngineFailed {
                    stage: format!("tts cue {}", j.index),
                    code: 0,
                    stderr: format!("vieneu báo xong nhưng thiếu file {}", j.out.display()),
                });
            }
        }

        // Ép tốc độ SAU khi mọi file đã có: cầu nối sinh audio ở tốc độ tự
        // nhiên, bước này mới khớp nó vào khung phụ đề.
        for j in jobs {
            self.ep_toc_do(j)?;
        }
        Ok(())
    }
}
