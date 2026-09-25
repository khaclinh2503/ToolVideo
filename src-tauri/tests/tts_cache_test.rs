use app_lib::tts::cache_key;

#[test]
fn key_is_stable_and_hex_sha256() {
    let a = cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào");
    let b = cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào");
    assert_eq!(a, b);
    assert_eq!(a.len(), 64, "sha256 hex phải dài 64 ký tự");
    assert!(a.chars().all(|c| c.is_ascii_hexdigit()));
}

#[test]
fn key_changes_with_every_parameter() {
    let base = cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào");
    assert_ne!(base, cache_key("vieneu", "vi_VN-vais1000-medium", 1.0, "Xin chào"));
    assert_ne!(base, cache_key("piper", "vi_VN-vivos-x_low", 1.0, "Xin chào"));
    assert_ne!(base, cache_key("piper", "vi_VN-vais1000-medium", 1.2, "Xin chào"));
    assert_ne!(base, cache_key("piper", "vi_VN-vais1000-medium", 1.0, "Xin chào!"));
}

#[test]
fn length_scale_compared_at_three_decimals() {
    // 1.0 và 1.0004 làm tròn về "1.000" ⇒ cùng key (chênh lệch không nghe được).
    assert_eq!(
        cache_key("piper", "v", 1.0, "a"),
        cache_key("piper", "v", 1.0004, "a")
    );
    assert_ne!(
        cache_key("piper", "v", 1.0, "a"),
        cache_key("piper", "v", 1.002, "a")
    );
}

#[test]
fn text_cannot_forge_field_boundary() {
    // Nếu ghép trường bằng chuỗi thường, "v" + "\u{1f}" + "a" có thể đụng với voice="v\u{1f}a".
    let x = cache_key("piper", "v", 1.0, "\u{1f}a");
    let y = cache_key("piper", "v\u{1f}", 1.0, "a");
    assert_ne!(x, y, "0x1F trong text không được làm nhoè ranh giới trường");

    // Cặp trường LIỀN KỀ (provider, voice): nối bằng dấu phân cách 0x1F thường sẽ đụng độ
    // vì "a\u{1f}" + "b" == "a" + "\u{1f}b" khi ghép chuỗi thô. length_scale và text giữ
    // nguyên ở cả hai vế để phép so sánh chỉ phụ thuộc vào ranh giới provider/voice.
    let p = cache_key("a\u{1f}b", "c", 1.0, "Xin chào");
    let q = cache_key("a", "b\u{1f}c", 1.0, "Xin chào");
    assert_ne!(
        p, q,
        "0x1F trong provider không được làm nhoè ranh giới provider/voice"
    );
}

#[test]
fn make_provider_rejects_unknown_id_and_missing_exe() {
    let cfg = app_lib::config::TtsConfig::default();
    let dir = tempfile::tempdir().unwrap();

    let err = app_lib::tts::make_provider("khong-co", &cfg, dir.path()).unwrap_err();
    assert!(format!("{err}").contains("chưa hỗ trợ"), "{err}");

    // piper.exe chưa cài ⇒ báo engine_missing kèm gợi ý tải bộ công cụ
    let err = app_lib::tts::make_provider("piper", &cfg, dir.path()).unwrap_err();
    assert_eq!(err.code(), "engine_missing", "{err}");
}

#[test]
fn make_provider_builds_piper_when_files_exist() {
    let dir = tempfile::tempdir().unwrap();
    let piper_dir = dir.path().join("piper");
    std::fs::create_dir_all(&piper_dir).unwrap();
    std::fs::write(piper_dir.join("piper.exe"), b"x").unwrap();
    std::fs::write(piper_dir.join("vi_VN-vais1000-medium.onnx"), b"x").unwrap();

    let cfg = app_lib::config::TtsConfig::default();
    let p = app_lib::tts::make_provider("piper", &cfg, dir.path()).unwrap();
    assert_eq!(p.id(), "piper");
    assert_eq!(p.sample_rate(), 22050);
}
