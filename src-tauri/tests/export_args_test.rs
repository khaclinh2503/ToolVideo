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
