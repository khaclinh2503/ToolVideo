use crate::{
    config::{models_dir, projects_dir},
    pipeline::{run_stt_pipeline, EngineCtx},
    stt::SttModels,
};
use std::path::{Path, PathBuf};

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SttResultDto {
    pub srt_path: String,
    pub cue_count: usize,
    pub project_dir: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslateResultDto {
    pub srt_path: String,
    pub cue_count: usize,
}

fn require_path(p: PathBuf) -> Result<PathBuf, String> {
    if p.exists() {
        Ok(p)
    } else {
        Err(format!(
            "Model chưa cài: {}. Hãy bấm nút \"Tải bộ công cụ\" để tự động tải và cài đặt.",
            p.display()
        ))
    }
}

fn resolve_engine_ctx() -> Result<EngineCtx, String> {
    let md = models_dir();
    let ffmpeg = require_path(md.join("ffmpeg").join("ffmpeg.exe"))?;
    let sherpa = require_path(md.join("sherpa").join("sherpa-onnx-vad-with-offline-asr.exe"))?;
    let sense_voice = require_path(md.join("sherpa").join("sense-voice.onnx"))?;
    let tokens = require_path(md.join("sherpa").join("tokens.txt"))?;
    let vad = require_path(md.join("sherpa").join("vad-model.onnx"))?;
    Ok(EngineCtx {
        ffmpeg,
        sherpa,
        models: SttModels {
            sense_voice,
            tokens,
            vad,
        },
    })
}

#[tauri::command]
pub async fn run_stt(video_path: String, lang: String) -> Result<SttResultDto, String> {
    let dto = tauri::async_runtime::spawn_blocking(move || -> Result<SttResultDto, String> {
        let ctx = resolve_engine_ctx()?;
        let video = Path::new(&video_path);

        let project_dir = projects_dir().join(uuid::Uuid::new_v4().to_string());
        std::fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;

        let result = run_stt_pipeline(&ctx, video, &project_dir, &lang)
            .map_err(|e| e.to_string())?;

        let cfg = crate::config::load_config();
        let now = crate::project::now_ms();
        crate::project::save(
            &project_dir,
            &crate::project::new_project_meta(video, &lang, &cfg.translate.target_lang, now),
        )
        .map_err(|e| e.to_string())?;

        // Ảnh bìa cho danh sách dự án. Không chặn luồng chính: thiếu ảnh chỉ
        // làm màn hình xấu hơn một chút, không đáng làm hỏng lần nhận dạng vừa
        // tốn vài phút.
        crate::project::tao_thumbnail(&ctx.ffmpeg, video, &project_dir);

        Ok(SttResultDto {
            srt_path: result.srt_path.display().to_string(),
            cue_count: result.cue_count,
            project_dir: project_dir.display().to_string(),
        })
    })
    .await
    .map_err(|e| e.to_string())??;
    Ok(dto)
}

#[tauri::command]
pub async fn run_translate(
    project_dir: String,
    provider: String,
    src: String,
    tgt: String,
) -> Result<TranslateResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<TranslateResultDto, String> {
        let cfg = crate::config::load_config();
        let p = crate::translate::make_provider(&provider, &cfg.translate).map_err(|e| e.to_string())?;
        let r = crate::pipeline::run_translate_stage(Path::new(&project_dir), p.as_ref(), &src, &tgt)
            .map_err(|e| e.to_string())?;
        // Trim khớp với run_translate_stage: nó đã trim `tgt` trước khi dựng
        // tên file translated.<tgt>.srt, nên metadata phải trim y hệt — nếu
        // không, status() tra theo tên file còn khoảng trắng và has_translation
        // kẹt ở false dù bản dịch đã nằm trên đĩa.
        let tgt_luu = tgt.trim().to_string();
        touch_project(&project_dir, move |m| m.tgt_lang = tgt_luu);
        Ok(TranslateResultDto {
            srt_path: r.srt_path.display().to_string(),
            cue_count: r.cue_count,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[derive(serde::Serialize)]
pub struct ContextDto {
    pub id: String,
    pub label: String,
}

/// Danh sách ngữ cảnh dịch cho giao diện. Lấy thẳng từ `CONTEXTS` để màn hình
/// không thể liệt kê một lựa chọn mà prompt không biết tới.
#[tauri::command]
pub fn translate_contexts() -> Vec<ContextDto> {
    crate::translate::openai_compat::CONTEXTS
        .iter()
        .map(|(id, label, _)| ContextDto {
            id: (*id).to_string(),
            label: (*label).to_string(),
        })
        .collect()
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VoiceDto {
    /// Giá trị truyền thẳng cho provider — với VieNeu là tên hiển thị có dấu.
    pub id: String,
    pub ten: String,
    pub gioi: String,
    pub mien: String,
    pub phong_cach: String,
    pub khuyen_dung: bool,
}

/// Danh sách giọng của một nhà cung cấp, cho giao diện.
///
/// Lấy thẳng từ `vieneu::VOICES` (sinh máy từ `list_preset_voices()` của SDK)
/// để màn hình không thể bày ra một giọng mà engine không nhận.
#[tauri::command]
pub fn tts_voices(provider: String) -> Vec<VoiceDto> {
    match provider.as_str() {
        "vieneu" => crate::tts::vieneu::VOICES
            .iter()
            .map(|v| VoiceDto {
                id: v.ten.to_string(),
                ten: v.ten.to_string(),
                gioi: v.gioi.to_string(),
                mien: v.mien.to_string(),
                phong_cach: v.phong_cach.to_string(),
                khuyen_dung: v.khuyen_dung,
            })
            .collect(),
        // Piper chỉ có đúng một giọng tiếng Việt được pin trong components.json.
        _ => vec![VoiceDto {
            id: "vi_VN-vais1000-medium".into(),
            ten: "vais1000".into(),
            gioi: "Nữ".into(),
            mien: "Bắc".into(),
            phong_cach: "tự nhiên".into(),
            khuyen_dung: true,
        }],
    }
}

/// Thư mục chứa câu demo của từng giọng. Để NGOÀI `projects/` vì demo không
/// thuộc dự án nào; asset protocol đã được mở thêm đúng thư mục này.
pub fn demo_dir() -> std::path::PathBuf {
    crate::config::data_dir().join("demo")
}

/// Câu demo dùng chung cho mọi giọng. Cố định để người dùng so được các giọng
/// với nhau, và để bản đã sinh dùng lại được mãi.
const CAU_DEMO: &str = "Xin chào, đây là giọng đọc thử. Bạn nghe có tự nhiên không?";

/// Sinh (hoặc dùng lại) câu demo cho một giọng. Tách khỏi lệnh Tauri để test
/// đi qua đúng mã thật mà không cần runtime.
pub fn tao_demo(
    provider: &str,
    voice: &str,
    models: &std::path::Path,
    thu_muc_demo: &std::path::Path,
) -> Result<std::path::PathBuf, crate::error::PipelineError> {
    use sha2::{Digest, Sha256};
    let khoa = format!(
        "{:x}",
        Sha256::digest(format!("{provider}
{voice}
{CAU_DEMO}").as_bytes())
    );
    let out = thu_muc_demo.join(format!("{}.wav", &khoa[..16]));

    // Đã sinh rồi thì dùng lại: mỗi lần sinh mất ~10 giây vì phải nạp model.
    if out.exists() {
        return Ok(out);
    }
    std::fs::create_dir_all(thu_muc_demo)
        .map_err(|e| crate::error::PipelineError::Io(e.to_string()))?;

    let mut cfg = crate::config::load_config();
    cfg.tts.voice = voice.to_string();
    let p = crate::tts::make_provider(provider, &cfg.tts, models)?;
    p.synthesize(
        &[crate::tts::TtsJob {
            index: 1,
            text: CAU_DEMO.to_string(),
            out: out.clone(),
            length_scale: 1.0,
        }],
        &mut |_| {},
    )?;
    Ok(out)
}

#[tauri::command]
pub async fn preview_voice(provider: String, voice: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        tao_demo(&provider, &voice, &models_dir(), &demo_dir())
            .map(|p| p.display().to_string())
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Kiểm một đường dẫn trước khi khai vào phạm vi asset protocol.
///
/// Tách khỏi lệnh Tauri để test được không cần AppHandle.
///
/// Chỉ nhận đúng các đuôi file mà tính năng này cần: `mp4`/`mkv`/`mov` là danh
/// sách filter video của chính `onPickVideo` bên `src/App.tsx` (người dùng đã
/// có thể chọn những file này rồi, nên khai lại không mở thêm gì mới), và
/// `png` cho ảnh logo watermark. So đuôi không phân biệt hoa/thường vì Windows
/// có file `.PNG`. KHÔNG coi đây là "an toàn" tuyệt đối: `cho_phep_xem` vẫn có
/// thể bị gọi từ một webview đã bị chiếm để đọc bất kỳ file `.mp4` nào trên
/// đĩa — allowlist này chỉ thu hẹp từ "mọi file" xuống "đúng loại media mà
/// người dùng lẽ ra đã có thể tự chọn", không hơn.
pub fn duong_dan_xem_duoc(path: &str) -> Result<std::path::PathBuf, String> {
    const DUOI_CHO_PHEP: &[&str] = &["mp4", "mkv", "mov", "png"];
    let p = std::path::PathBuf::from(path.trim());
    if path.trim().is_empty() {
        return Err("đường dẫn rỗng".into());
    }
    if !p.is_file() {
        return Err(format!("không phải file đọc được: {}", p.display()));
    }
    let duoi = p
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase());
    match duoi {
        Some(d) if DUOI_CHO_PHEP.contains(&d.as_str()) => {}
        _ => {
            return Err(format!(
                "chỉ chấp nhận file mp4/mkv/mov/png, không phải: {}",
                p.display()
            ))
        }
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
/// Khai từng file một, không bao giờ khai thư mục. `duong_dan_xem_duoc` còn
/// chặn theo đuôi file — xem comment ở đó về giới hạn của lớp chặn này.
#[tauri::command]
pub fn cho_phep_xem(app: tauri::AppHandle, path: String) -> Result<(), String> {
    use tauri::Manager;
    let p = duong_dan_xem_duoc(&path)?;
    app.asset_protocol_scope()
        .allow_file(&p)
        .map_err(|e| format!("không khai được phạm vi cho {}: {e}", p.display()))
}

/// Dựng một khung hình có phụ đề đã cháy vào, để xem thử kiểu chữ trước khi
/// xuất cả video (có thể mất vài phút).
///
/// Chọn mốc thời gian ở GIỮA một cue có chữ thật, không phải giây 0 — khung đầu
/// video thường chưa có phụ đề nào và ảnh xem thử sẽ trống trơn.
#[tauri::command]
pub async fn preview_subtitle(project_dir: String, tgt: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        let ffmpeg = require_path(models_dir().join("ffmpeg").join("ffmpeg.exe"))?;
        let style = crate::config::doi_sang_sub_style(&crate::config::load_config().subtitle);
        tao_xem_thu_phu_de(
            std::path::Path::new(&project_dir),
            tgt.trim(),
            &style,
            &ffmpeg,
        )
        .map(|p| p.display().to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Dựng một khung hình có phụ đề thật của dự án, trả đường dẫn ảnh.
///
/// Tách khỏi lệnh Tauri để chạy được với ffmpeg thật trong test — kiểu chữ là
/// thứ chỉ nhìn ảnh mới biết đúng sai, vì ffmpeg bỏ qua im lặng mọi khoá
/// force_style nó không hiểu.
pub fn tao_xem_thu_phu_de(
    du_an: &std::path::Path,
    tgt: &str,
    style: &crate::export::SubStyle,
    ffmpeg: &std::path::Path,
) -> Result<std::path::PathBuf, String> {
    {
        let meta = crate::project::load(du_an)
            .ok_or_else(|| "Chưa mở dự án nào".to_string())?;
        let video = std::path::PathBuf::from(&meta.video_path);
        if !video.exists() {
            return Err(format!("Không tìm thấy video gốc: {}", video.display()));
        }

        let sub_dir = du_an.join("subtitles");
        let ban_dich = sub_dir.join(format!("translated.{tgt}.srt"));
        let raw = std::fs::read_to_string(&ban_dich)
            .map_err(|_| "Chưa có bản dịch — chạy Dịch trước".to_string())?;
        let segs = crate::srt::parse_srt(&raw).map_err(|e| e.to_string())?;

        // Cue đầu tiên có ít nhất 10 ký tự: cue quá ngắn ("Ừ.") không cho thấy
        // kiểu chữ trông ra sao.
        let cue = segs
            .iter()
            .find(|s| s.text.trim().chars().count() >= 10)
            .or_else(|| segs.first())
            .ok_or_else(|| "Bản dịch rỗng".to_string())?;
        let giua = cue.start_ms + (cue.end_ms.saturating_sub(cue.start_ms)) / 2;

        // Dùng chính burn.srt mà bước xuất dùng, để thứ nhìn thấy đúng là thứ
        // sẽ được ghi ra.
        crate::export::prepare_burn_srt(&sub_dir, &ban_dich).map_err(|e| e.to_string())?;

        let ra = du_an.join("media").join("xem-thu-phu-de.jpg");
        if let Some(d) = ra.parent() {
            std::fs::create_dir_all(d).map_err(|e| e.to_string())?;
        }
        let args = crate::export::build_preview_frame_args(
            &video,
            crate::export::BURN_SRT_NAME,
            giua,
            Some(style),
            &ra,
        );
        // Chạy trong thư mục subtitles: filter `subtitles=` không escape được
        // đường dẫn Windows trong filtergraph, nên bước xuất cũng làm y hệt.
        crate::export::run_export(
            ffmpeg,
            &sub_dir,
            &args.iter().map(std::ffi::OsString::from).collect::<Vec<_>>(),
        )
        .map_err(|e| e.to_string())?;

        Ok(ra)
    }
}

#[tauri::command]
pub fn get_config() -> crate::config::AppConfig {
    crate::config::load_config()
}

#[tauri::command]
pub fn save_config(cfg: crate::config::AppConfig) -> Result<(), String> {
    crate::config::save_config(&cfg).map_err(|e| e.to_string())
}

/// Danh sách id component chưa cài (dùng cho UI và test; không gọi mạng).
pub fn missing_component_ids(models: &std::path::Path) -> Result<Vec<String>, String> {
    let specs = crate::components::specs().map_err(|e| e.to_string())?;
    Ok(specs
        .into_iter()
        .filter(|s| !crate::components::is_installed(s, models))
        .map(|s| s.id)
        .collect())
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ComponentProgressEvent {
    pub id: String,
    pub phase: &'static str,
    pub done: u64,
    pub total: u64,
}

/// Thư mục chứa video tải từ link. Để ngoài `projects/` vì một video tải về có
/// thể được dùng lại cho nhiều dự án, và xoá dự án thì không nên mất file gốc.
pub fn downloads_dir() -> std::path::PathBuf {
    crate::config::data_dir().join("downloads")
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgressEvent {
    pub percent: f32,
}

#[tauri::command]
pub async fn download_video(
    app: tauri::AppHandle,
    url: String,
    out_dir: Option<String>,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        use tauri::Emitter;
        let md = models_dir();
        let ytdlp = require_path(md.join("yt-dlp").join("yt-dlp.exe"))?;
        let ffmpeg_dir = md.join("ffmpeg");
        // Thư mục người dùng chọn, hoặc chỗ mặc định trong data_dir. Cùng khuôn
        // với thư mục xuất video ở `run_export`.
        let out = out_dir
            .map(std::path::PathBuf::from)
            .unwrap_or_else(downloads_dir);

        // Chỉ phát sự kiện khi phần trăm đổi tới mức thấy được: yt-dlp báo tiến
        // độ vài chục lần mỗi giây, gửi hết sang webview là phí.
        let mut last = -1.0f32;
        let path = crate::download::run_download(&ytdlp, &ffmpeg_dir, &url, &out, &mut |p| {
            if p - last >= 1.0 || p >= 100.0 {
                last = p;
                let _ = app.emit("download_progress", DownloadProgressEvent { percent: p });
            }
        })
        .map_err(|e| e.to_string())?;

        Ok(path.display().to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub fn components_ready() -> Result<bool, String> {
    let models = crate::config::models_dir();
    // Phải tính CẢ bước cài gói Python: thiếu nó thì VieNeu không chạy được,
    // mà giao diện lại ẩn mất đúng nút "Tải bộ công cụ" mà thông báo lỗi bảo bấm.
    let artifacts = crate::components::all_installed(&models).map_err(|e| e.to_string())?;
    Ok(artifacts && crate::pyenv::is_installed(&models))
}

#[tauri::command]
pub async fn ensure_components(app: tauri::AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        use tauri::Emitter;
        let models = crate::config::models_dir();
        std::fs::create_dir_all(&models).map_err(|e| e.to_string())?;
        crate::components::install_all(&models, &mut |id, p| {
            let ev = match p {
                crate::components::Progress::Download { done, total } => ComponentProgressEvent {
                    id: id.to_string(), phase: "download", done, total,
                },
                crate::components::Progress::Extract => ComponentProgressEvent {
                    id: id.to_string(), phase: "extract", done: 0, total: 0,
                },
                crate::components::Progress::Done => ComponentProgressEvent {
                    id: id.to_string(), phase: "done", done: 0, total: 0,
                },
            };
            let _ = app.emit("component_progress", ev);
        })
        .map_err(|e| e.to_string())?;

        // Cài gói Python cho VieNeu. KHÔNG nằm trong `install_all` vì đó là cây
        // thư mục chứ không phải một artifact tải theo sha256 — nhưng nếu không
        // gọi ở đây thì 79 gói không bao giờ được cài và VieNeu không chạy được
        // trên bất kỳ máy nào. Đã từng thiếu đúng lời gọi này.
        crate::pyenv::install(&models, &mut |dong| {
            let _ = app.emit(
                "component_progress",
                ComponentProgressEvent {
                    id: "vieneu-packages".into(),
                    phase: "extract",
                    done: 0,
                    total: 0,
                },
            );
            let _ = dong;
        })
        .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TtsResultDto {
    pub manifest_path: String,
    pub cue_count: usize,
    pub generated: usize,
    pub cached: usize,
}

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
    /// Thứ đã bị bỏ qua mà bản xuất vẫn thành công (hiện chỉ có logo). UI phải
    /// in ra cạnh kết quả — xem chú thích ở `pipeline::ExportResult::warnings`.
    pub warnings: Vec<String>,
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
    out_dir: Option<String>,
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
            out_dir.as_deref().map(Path::new),
            Some(crate::config::doi_sang_sub_style(&cfg.subtitle)),
            &cfg.watermark,
            &mut |phase| {
                let _ = app.emit("export_progress", ExportProgressEvent { phase: phase.to_string() });
            },
        )
        .map_err(|e| e.to_string())?;

        // Ghi lại đúng đường dẫn vừa xuất: status() và nút "Mở thư mục" đều đọc
        // từ đây, nếu không thì xuất ra thư mục riêng xong dự án vẫn báo là
        // chưa có bản xuất.
        let da_xuat = r.output_path.display().to_string();
        touch_project(&project_dir, move |m| m.export_path = Some(da_xuat));

        Ok(ExportResultDto {
            output_path: r.output_path.display().to_string(),
            adjusted: r.retime.adjusted,
            capped: r.retime.capped,
            placed: r.dub.placed,
            truncated: r.dub.truncated,
            saturated: r.dub.saturated,
            warnings: r.warnings,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn run_tts(project_dir: String, tgt: String) -> Result<TtsResultDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<TtsResultDto, String> {
        let cfg = crate::config::load_config();
        let models = models_dir();
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &models)
            .map_err(|e| e.to_string())?;
        let r = crate::pipeline::run_tts_stage(
            Path::new(&project_dir),
            p.as_ref(),
            &cfg.tts.voice,
            &crate::tts::ScalePlan::uniform(cfg.tts.length_scale),
            &tgt,
        )
        .map_err(|e| e.to_string())?;
        touch_project(&project_dir, |_| {});
        Ok(TtsResultDto {
            manifest_path: r.manifest_path.display().to_string(),
            cue_count: r.cue_count,
            generated: r.generated,
            cached: r.cached,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

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
    /// Đường dẫn bản xuất, để nút "Mở thư mục" trỏ đúng chỗ kể cả khi người dùng
    /// đã xuất ra thư mục riêng. `None` nếu chưa xuất lần nào.
    pub export_path: Option<String>,
    /// Ảnh bìa để hiện trong danh sách; `None` nếu chưa có.
    pub thumbnail_path: Option<String>,
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
        thumbnail_path: {
            let t = crate::project::thumbnail_path(&s.project_dir);
            t.exists().then(|| t.display().to_string())
        },
        export_path: if s.status.has_export {
            // Dự án cũ chưa có trường này trong metadata vẫn phải mở được thư
            // mục, nên lùi về đúng chỗ mà status() đã kiểm.
            Some(s.meta.export_path.clone().unwrap_or_else(|| {
                s.project_dir.join("output").join("final.mp4").display().to_string()
            }))
        } else {
            None
        },
        video_exists: s.status.video_exists,
    }
}

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

/// `async` + `spawn_blocking`: `project::status` gọi `Path::exists()` trên
/// `video_path` của từng dự án, và đường dẫn đó có thể là ổ mạng (UNC/ổ đã
/// map) không còn kết nối được — khi đó `exists()` treo tới khi hết timeout
/// SMB. Chạy trên thread pool blocking để không đứng hình cửa sổ chính, cùng
/// khuôn `run_tts` đã dùng trong file này.
#[tauri::command]
pub async fn list_projects() -> Result<Vec<ProjectSummaryDto>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        crate::project::list(&projects_dir())
            .iter()
            .map(summary_to_dto)
            .collect()
    })
    .await
    .map_err(|e| e.to_string())
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

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CueDto {
    pub index: usize,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
    pub duration_ms: u64,
    pub audio_path: Option<String>,
    pub stale: bool,
}

pub fn cue_to_dto(c: &crate::cues::CueView) -> CueDto {
    CueDto {
        index: c.index,
        start_ms: c.start_ms,
        end_ms: c.end_ms,
        text: c.text.clone(),
        duration_ms: c.duration_ms,
        audio_path: c.audio_path.as_ref().map(|p| p.display().to_string()),
        stale: c.stale,
    }
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviewDto {
    pub audio_path: String,
    pub duration_ms: u64,
    pub length_scale: f32,
    pub unconstrained: bool,
}

#[tauri::command]
pub fn list_cues(project_dir: String, tgt: String) -> Result<Vec<CueDto>, String> {
    crate::cues::list(Path::new(&project_dir), &tgt)
        .map(|v| v.iter().map(cue_to_dto).collect())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_cue(
    project_dir: String,
    tgt: String,
    index: usize,
    text: String,
    start_ms: u64,
    end_ms: u64,
) -> Result<(), String> {
    crate::cues::save(Path::new(&project_dir), &tgt, index, &text, start_ms, end_ms)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn preview_cue(
    project_dir: String,
    tgt: String,
    index: usize,
) -> Result<PreviewDto, String> {
    tauri::async_runtime::spawn_blocking(move || -> Result<PreviewDto, String> {
        let cfg = crate::config::load_config();
        let md = models_dir();
        let p = crate::tts::make_provider(&cfg.tts.default_provider, &cfg.tts, &md)
            .map_err(|e| e.to_string())?;

        // Độ dài video chỉ cần cho cue cuối; video mất thì nghe thử không ràng buộc.
        let dir = Path::new(&project_dir);
        let video_ms = crate::project::load(dir).and_then(|meta| {
            let ffprobe = md.join("ffmpeg").join("ffprobe.exe");
            let video = Path::new(&meta.video_path);
            if !ffprobe.exists() || !video.exists() {
                return None;
            }
            crate::export::probe_duration_ms(&ffprobe, video).ok()
        });

        let opts = crate::retime::FitOpts {
            guard_ms: cfg.compose.guard_ms,
            min_scale: cfg.compose.min_length_scale,
        };
        let r = crate::cues::preview(
            dir,
            p.as_ref(),
            &cfg.tts.voice,
            cfg.tts.length_scale,
            &tgt,
            index,
            video_ms,
            &opts,
        )
        .map_err(|e| e.to_string())?;

        Ok(PreviewDto {
            audio_path: r.audio_path.display().to_string(),
            duration_ms: r.duration_ms,
            length_scale: r.length_scale,
            unconstrained: r.unconstrained,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}
