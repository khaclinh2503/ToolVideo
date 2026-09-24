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
    for line in text.lines().filter(|l| !l.trim().is_empty()) {
        let mut it = line.splitn(3, char::is_whitespace);
        let (a, b, t) = (it.next(), it.next(), it.next());
        if let (Some(a), Some(b), Some(t)) = (a, b, t) {
            if let (Ok(s), Ok(e)) = (a.parse::<f64>(), b.parse::<f64>()) {
                segs.push(Segment {
                    start_ms: (s * 1000.0) as u64,
                    end_ms: (e * 1000.0) as u64,
                    text: t.trim().to_string(),
                });
            }
        }
    }
    Ok(segs)
}

pub fn run_stt(
    bin: &Path,
    m: &SttModels,
    wav: &Path,
    lang: &str,
) -> Result<Vec<Segment>, PipelineError> {
    let out = std::process::Command::new(bin)
        .args(build_args(m, wav, lang))
        .output()
        .map_err(|_| PipelineError::EngineMissing("sherpa-onnx-offline".into()))?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "stt".into(),
            code: out.status.code().unwrap_or(-1),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        });
    }
    parse_output(&String::from_utf8_lossy(&out.stdout))
}
