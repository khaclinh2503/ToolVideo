#[cfg(test)]
mod tests {
    use app_lib::pipeline::{finalize_srt, run_translate_stage};
    use app_lib::srt::Segment;
    use app_lib::translate::TranslateProvider;
    use app_lib::error::PipelineError;

    #[test]
    fn finalize_srt_empty_segments_ok() {
        let dir = tempfile::tempdir().unwrap();
        let r = finalize_srt(&[], dir.path()).unwrap();
        assert_eq!(r.cue_count, 0);
        assert!(r.srt_path.exists());
        assert_eq!(std::fs::read_to_string(&r.srt_path).unwrap(), "");
    }

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

    struct Upper;
    impl TranslateProvider for Upper {
        fn id(&self) -> &'static str { "upper" }
        fn batch_size(&self) -> usize { 10 }
        fn translate_batch(&self, t: &[&str], _: &str, _: &str) -> Result<Vec<String>, PipelineError> {
            Ok(t.iter().map(|s| s.to_uppercase()).collect())
        }
    }

    #[test]
    fn translate_stage_reads_source_writes_translated_keeping_timing() {
        let dir = tempfile::tempdir().unwrap();
        let segs = vec![
            Segment { start_ms: 0, end_ms: 1000, text: "abc".into() },
            Segment { start_ms: 1000, end_ms: 2000, text: "def".into() },
        ];
        app_lib::pipeline::finalize_srt(&segs, dir.path()).unwrap();
        let r = run_translate_stage(dir.path(), &Upper, "auto", "vi").unwrap();
        assert_eq!(r.cue_count, 2);
        assert!(r.srt_path.ends_with("subtitles/translated.vi.srt") || r.srt_path.ends_with("subtitles\\translated.vi.srt"));
        let out = app_lib::srt::parse_srt(&std::fs::read_to_string(&r.srt_path).unwrap()).unwrap();
        assert_eq!(out[1].text, "DEF");
        assert_eq!(out[1].start_ms, 1000);
    }

    #[test]
    fn translate_stage_without_source_is_clear_io_error() {
        let dir = tempfile::tempdir().unwrap();
        let err = run_translate_stage(dir.path(), &Upper, "auto", "vi").unwrap_err();
        match err { PipelineError::Io(m) => assert!(m.contains("Chưa có source.srt")), e => panic!("{e:?}") }
    }

    #[test]
    fn translate_stage_empty_source_gives_zero_cues() {
        let dir = tempfile::tempdir().unwrap();
        app_lib::pipeline::finalize_srt(&[], dir.path()).unwrap();
        let r = run_translate_stage(dir.path(), &Upper, "auto", "vi").unwrap();
        assert_eq!(r.cue_count, 0);
        assert_eq!(std::fs::read_to_string(r.srt_path).unwrap(), "");
    }
}
