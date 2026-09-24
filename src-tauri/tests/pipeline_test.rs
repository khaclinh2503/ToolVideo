#[cfg(test)]
mod tests {
    use app_lib::pipeline::finalize_srt;
    use app_lib::srt::Segment;

    #[test]
    fn finalize_writes_file_and_counts() {
        let dir = tempfile::tempdir().unwrap();
        let segs = vec![Segment {
            start_ms: 0,
            end_ms: 1000,
            text: "hi".into(),
        }];
        let r = finalize_srt(&segs, dir.path()).unwrap();
        assert_eq!(r.cue_count, 1);
        assert!(r.srt_path.exists());
        assert!(std::fs::read_to_string(&r.srt_path)
            .unwrap()
            .contains("hi"));
    }
}
