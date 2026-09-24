use app_lib::srt::{Segment, write_srt};

#[test]
fn writes_srt_with_comma_millis_and_cjk() {
    let segs = vec![
        Segment{start_ms:0, end_ms:1500, text:"你好".into()},
        Segment{start_ms:1500, end_ms:3200, text:"world".into()},
    ];
    let out = write_srt(&segs);
    assert!(out.contains("00:00:00,000 --> 00:00:01,500"));
    assert!(out.contains("你好"));
    assert!(out.starts_with("1\r\n"));
}

#[test]
fn empty_segments_yield_empty_string() {
    assert_eq!(write_srt(&[]), "");
}
