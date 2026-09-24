use app_lib::components::{specs, Archive};
use app_lib::components::verify_sha256;

#[test]
fn verify_rejects_wrong_hash() {
    let f = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(f.path(), b"hello").unwrap();
    // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    assert!(verify_sha256(f.path(), "deadbeef").is_err());
    assert!(verify_sha256(
        f.path(),
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    )
    .is_ok());
}

#[test]
fn manifest_has_all_eight_components_with_valid_shape() {
    let s = specs().unwrap();
    assert_eq!(s.len(), 8, "components.json phải có đủ 8 artifact");

    let ids: Vec<&str> = s.iter().map(|c| c.id.as_str()).collect();
    for want in [
        "ffmpeg", "sherpa", "sense-voice", "sense-voice-tokens",
        "silero-vad", "piper", "piper-voice-vi", "piper-voice-vi-cfg",
    ] {
        assert!(ids.contains(&want), "thiếu component '{want}' trong {ids:?}");
    }

    for c in &s {
        assert!(c.url.starts_with("https://"), "{}: url phải là https", c.id);
        assert!(!c.files.is_empty(), "{}: files rỗng", c.id);
        if c.archive == Archive::Raw {
            assert_eq!(c.files.len(), 1, "{}: raw phải có đúng 1 file map", c.id);
            assert!(c.files[0].from.is_none(), "{}: raw không được có 'from'", c.id);
        } else {
            for f in &c.files {
                assert!(f.from.is_some(), "{}: archive phải có 'from'", c.id);
            }
        }
    }
}

#[test]
fn manifest_installs_to_paths_m1_expects() {
    let s = specs().unwrap();
    let all_to: Vec<String> = s.iter().flat_map(|c| c.files.iter().map(|f| f.to.clone())).collect();
    // 5 đường dẫn resolve_engine_ctx đang đòi (ffmpeg.exe nằm trong cây con "ffmpeg")
    for want in ["sherpa/sense-voice.onnx", "sherpa/tokens.txt", "sherpa/vad-model.onnx"] {
        assert!(all_to.contains(&want.to_string()), "thiếu đích '{want}' trong {all_to:?}");
    }
}
