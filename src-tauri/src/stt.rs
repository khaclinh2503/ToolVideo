use crate::{config::stt_defaults as d, error::PipelineError, srt::Segment};
use std::path::{Path, PathBuf};

/// Các giá trị hợp lệ cho `--sense-voice-language`, **đã kiểm bằng cách chạy
/// engine thật** (xem `tests/e2e_src_lang_test.rs`, test này chạy lại đúng 6
/// giá trị dưới đây mỗi khi được bật). Đừng thêm giá trị vào đây mà chưa
/// chạy lại đầu dò đó: cờ này thuộc sherpa-onnx, không phải của ta, và một
/// giá trị bị từ chối chỉ lộ ra lúc chạy.
///
/// Đã thăm dò 2026-09-25 trên sherpa-onnx-vad-with-offline-asr.exe (model
/// SenseVoice) với clip tiếng Anh 6s: `auto`, `zh`, `en`, `ja`, `ko`, `yue`
/// đều được engine chấp nhận (exit 0, sinh SRT bình thường) — SenseVoice
/// không từ chối giá trị nào trong số này, kể cả khi ngôn ngữ khai báo
/// không khớp giọng nói thật.
///
/// Chuỗi rỗng `""` **cố ý không có trong danh sách này**: `auto` đã hợp lệ
/// và làm đúng việc tự nhận dạng, nên thêm `""` bên cạnh chỉ tạo ra hai mục
/// làm cùng một việc trong dropdown ngôn ngữ của UI — một trong hai lại
/// hiển thị rỗng. (Có thử `""` một lần bằng một test tạm gọi thẳng
/// `run_stt_pipeline`, engine cũng nhận, nhưng test đó không được giữ lại
/// nên đừng coi dòng này là một phép đo còn kiểm được — cần biết lại thì
/// phải tự thăm dò.)
///
/// Lưu ý khi viết lại đầu dò: trên Windows, gán chuỗi rỗng cho biến môi
/// trường trong PowerShell/.NET (`$env:X = ""`) **xoá hẳn biến đó** thay vì
/// giữ giá trị rỗng, nên `std::env::var("X")` trả `Err` và code rơi về giá
/// trị mặc định — một script thăm dò dùng cách này sẽ âm thầm kiểm tra nhầm
/// giá trị.
pub const SRC_LANGS: &[&str] = &["auto", "zh", "en", "ja", "ko", "yue"];

pub struct SttModels {
    pub sense_voice: PathBuf,
    pub tokens: PathBuf,
    pub vad: PathBuf,
}

pub fn build_args(m: &SttModels, wav: &Path, lang: &str) -> Vec<String> {
    vec![
        format!("--silero-vad-model={}", m.vad.display()),
        format!("--silero-vad-threshold={}", d::VAD_THRESHOLD),
        format!("--silero-vad-min-silence-duration={:.2}", d::MIN_SILENCE),
        format!("--silero-vad-min-speech-duration={:.2}", d::MIN_SPEECH),
        format!("--silero-vad-max-speech-duration={}", d::MAX_SPEECH),
        format!("--tokens={}", m.tokens.display()),
        format!("--sense-voice-model={}", m.sense_voice.display()),
        format!("--sense-voice-language={}", lang),
        format!("--sense-voice-use-itn={}", d::USE_ITN),
        "--provider=cpu".into(),
        format!("--num-threads={}", d::NUM_THREADS),
        wav.display().to_string(),
    ]
}

// Output format of `sherpa-onnx-vad-with-offline-asr` (verified 2026-09-24 against
// sherpa-onnx v1.13.8 win-x64): results go to STDOUT, one segment per line:
//   "<start_seconds> -- <end_seconds>: <text>"
// e.g. "0.000 -- 5.212: 市场规模除了去年负增长之外，每年都在稳步增加。"
// Logs/config dumps go to stderr. See tests/fixtures/sherpa_sample_output.txt.
pub fn parse_output(text: &str) -> Result<Vec<Segment>, PipelineError> {
    let mut segs = Vec::new();
    let mut any_nonempty = false;
    for line in text.lines().filter(|l| !l.trim().is_empty()) {
        any_nonempty = true;
        let Some((a, rest)) = line.trim().split_once(" -- ") else { continue };
        let Some((b, t)) = rest.split_once(':') else { continue };
        if let (Ok(s), Ok(e)) = (a.trim().parse::<f64>(), b.trim().parse::<f64>()) {
            segs.push(Segment {
                start_ms: (s * 1000.0).round() as u64,
                end_ms: (e * 1000.0).round() as u64,
                text: t.trim().to_string(),
            });
        }
    }
    if any_nonempty && segs.is_empty() {
        let head: Vec<&str> = text
            .lines()
            .filter(|l| !l.trim().is_empty())
            .take(10)
            .collect();
        return Err(PipelineError::EngineFailed {
            stage: "stt_parse".into(),
            code: 0,
            stderr: head.join("\n"),
        });
    }
    Ok(segs)
}

pub fn run_stt(
    bin: &Path,
    m: &SttModels,
    wav: &Path,
    lang: &str,
) -> Result<Vec<Segment>, PipelineError> {
    let mut cmd = std::process::Command::new(bin);
    cmd.args(build_args(m, wav, lang));
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    let out = cmd.output().map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("sherpa-onnx-vad-with-offline-asr".into())
        } else {
            PipelineError::Io(err.to_string())
        }
    })?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "stt".into(),
            code: out.status.code().unwrap_or(-1),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        });
    }
    parse_output(&String::from_utf8_lossy(&out.stdout))
}
