//! DVL_E2E_PROJECT=<project_dir có subtitles/source.srt> cargo test --test e2e_translate_test -- --ignored --nocapture
use app_lib::pipeline::run_translate_stage;
use app_lib::translate::google_free::GoogleFree;
use std::path::Path;

#[test]
#[ignore]
fn e2e_google_free_translates_source_srt() {
    let dir = std::env::var("DVL_E2E_PROJECT").expect("set DVL_E2E_PROJECT");
    let src_cues = app_lib::srt::parse_srt(&std::fs::read_to_string(Path::new(&dir).join("subtitles/source.srt")).unwrap()).unwrap().len();
    let r = run_translate_stage(Path::new(&dir), &GoogleFree::new(), "auto", "vi").unwrap();
    println!("\n=== E2E translate OK: {} cue -> {}\n{}", r.cue_count, r.srt_path.display(), std::fs::read_to_string(&r.srt_path).unwrap());
    assert_eq!(r.cue_count, src_cues);
}
