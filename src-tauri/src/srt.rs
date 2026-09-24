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
