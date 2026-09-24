use crate::error::PipelineError;

#[derive(Clone, Debug)]
pub struct Segment {
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
}

fn ts(ms: u64) -> String {
    let h = ms / 3_600_000;
    let m = ms / 60_000 % 60;
    let s = ms / 1000 % 60;
    let mm = ms % 1000;
    format!("{:02}:{:02}:{:02},{:03}", h, m, s, mm)
}

pub fn write_srt(segs: &[Segment]) -> String {
    let mut out = String::new();
    for (i, s) in segs.iter().enumerate() {
        out.push_str(&format!(
            "{}\r\n{} --> {}\r\n{}\r\n\r\n",
            i + 1,
            ts(s.start_ms),
            ts(s.end_ms),
            s.text
        ));
    }
    out
}

fn parse_ts(s: &str) -> Option<u64> {
    // "HH:MM:SS,mmm" (chấp nhận '.' thay ',')
    let s = s.trim().replace('.', ",");
    let (hms, ms) = s.split_once(',')?;
    let mut it = hms.split(':');
    let h: u64 = it.next()?.parse().ok()?;
    let m: u64 = it.next()?.parse().ok()?;
    let sec: u64 = it.next()?.parse().ok()?;
    let ms: u64 = ms.parse().ok()?;
    Some(h * 3_600_000 + m * 60_000 + sec * 1000 + ms)
}

pub fn parse_srt(text: &str) -> Result<Vec<Segment>, PipelineError> {
    let text = text.trim_start_matches('\u{feff}').replace("\r\n", "\n");
    let mut segs = Vec::new();
    for block in text.split("\n\n").map(str::trim).filter(|b| !b.is_empty()) {
        let mut lines = block.lines();
        let bad = || PipelineError::EngineFailed { stage: "srt_parse".into(), code: 0, stderr: block.to_string() };
        let _index = lines.next().ok_or_else(bad)?;
        let timing = lines.next().ok_or_else(bad)?;
        let (a, b) = timing.split_once("-->").ok_or_else(bad)?;
        let (start_ms, end_ms) = (parse_ts(a).ok_or_else(bad)?, parse_ts(b).ok_or_else(bad)?);
        let text = lines.collect::<Vec<_>>().join("\n");
        segs.push(Segment { start_ms, end_ms, text });
    }
    Ok(segs)
}
