use crate::{config::stt_defaults as d, error::PipelineError, srt::Segment};
use std::path::{Path, PathBuf};

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

// KNOWN RISK: exact sherpa-onnx-offline output format is unverified (no binary available
// in this build environment). Assumed format, one segment per non-empty line:
//   "<start_seconds> <end_seconds> <text>"
// e.g. "0.000 1.500 你好". See tests/fixtures/sherpa_sample_output.txt.
// parse_output is isolated so it can be adjusted once verified end-to-end.
pub fn parse_output(text: &str) -> Result<Vec<Segment>, PipelineError> {
    let mut segs = Vec::new();
    let mut any_nonempty = false;
    for line in text.lines().filter(|l| !l.trim().is_empty()) {
        any_nonempty = true;
        let trimmed = line.trim_start();
        let mut parts = trimmed.splitn(2, char::is_whitespace);
        let a = parts.next();
        let rest = parts.next().unwrap_or("").trim_start();
        let mut parts2 = rest.splitn(2, char::is_whitespace);
        let b = parts2.next();
        let t = parts2.next().unwrap_or("").trim();
        if let (Some(a), Some(b)) = (a, b) {
            if let (Ok(s), Ok(e)) = (a.parse::<f64>(), b.parse::<f64>()) {
                segs.push(Segment {
                    start_ms: (s * 1000.0).round() as u64,
                    end_ms: (e * 1000.0).round() as u64,
                    text: t.to_string(),
                });
            }
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
            PipelineError::EngineMissing("sherpa-onnx-offline".into())
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
