use app_lib::error::PipelineError;
use app_lib::srt::{parse_srt, write_srt};

#[test]
fn parses_crlf_bom_cjk_and_roundtrips() {
    let src = "\u{feff}1\r\n00:00:00,000 --> 00:00:05,212\r\n市场规模。\r\n\r\n2\r\n00:00:05,308 --> 00:00:10,780\r\nhello \"world\"\r\n\r\n";
    let segs = parse_srt(src).unwrap();
    assert_eq!(segs.len(), 2);
    assert_eq!(segs[0].start_ms, 0);
    assert_eq!(segs[0].end_ms, 5212);
    assert_eq!(segs[0].text, "市场规模。");
    assert_eq!(segs[1].text, "hello \"world\"");
    let back = write_srt(&segs);
    assert_eq!(back, src.trim_start_matches('\u{feff}'));
}

#[test]
fn parses_lf_and_multiline_text() {
    let segs = parse_srt("1\n00:01:02,003 --> 00:01:03,004\nline a\nline b\n\n").unwrap();
    assert_eq!(segs[0].start_ms, 62_003);
    assert_eq!(segs[0].end_ms, 63_004);
    assert_eq!(segs[0].text, "line a\nline b");
}

#[test]
fn empty_is_empty_and_bad_block_is_err() {
    assert!(parse_srt("").unwrap().is_empty());
    assert!(parse_srt("   \r\n\r\n").unwrap().is_empty());
    let err = parse_srt("1\r\nnot a timestamp\r\ntext\r\n").unwrap_err();
    match err {
        PipelineError::EngineFailed { stage, .. } => assert_eq!(stage, "srt_parse"),
        _ => panic!("expected EngineFailed srt_parse"),
    }
}
