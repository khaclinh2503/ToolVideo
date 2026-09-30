/// Provider phải SỞ HỮU server: `Box<dyn TranslateProvider>` bị thả lúc dịch
/// xong là `Drop` của LlamaServer giết tiến trình và trả lại VRAM. Nếu server
/// nằm ngoài, `run_translate_stage` và `commands.rs` đều phải sửa để tắt nó —
/// và ai đó sẽ quên ở một trong hai đường lỗi.
#[test]
fn lo_khong_tim_thay_engine_thi_bao_ro_phai_tai_bo_cong_cu() {
    let d = tempfile::tempdir().unwrap();
    let cfg = app_lib::config::TranslateConfig::default();
    let r = app_lib::translate::make_provider("llm_tren_may", &cfg, d.path());
    assert!(r.is_err());
    // `.unwrap_err()` cần `T: Debug`, mà `Box<dyn TranslateProvider>` (kiểu Ok)
    // không có — dùng `.err().unwrap()` để lấy lỗi mà không đòi hỏi đó.
    let msg = format!("{}", r.err().unwrap());
    assert!(msg.contains("bộ công cụ"), "phải chỉ người dùng đi tải, đang là: {msg}");
}

#[test]
fn id_provider_dung_ten() {
    // Không dựng được provider thật mà không có model 9,8 GB, nên chỉ chốt
    // rằng tên id khớp với thứ config và giao diện dùng.
    assert_eq!(app_lib::translate::llm_tren_may::ID, "llm_tren_may");
}

/// Các provider cũ không được đổi hành vi khi thêm tham số `models`.
#[test]
fn provider_cu_van_dung_duoc() {
    let d = tempfile::tempdir().unwrap();
    let cfg = app_lib::config::TranslateConfig::default();
    let p = app_lib::translate::make_provider("google_free", &cfg, d.path()).unwrap();
    assert_eq!(p.id(), "google_free");

    let mut c2 = cfg.clone();
    c2.openai.api_key = "k".into();
    c2.openai.base_url = "http://x/v1".into();
    c2.openai.model = "m".into();
    let p2 = app_lib::translate::make_provider("openai_compat", &c2, d.path()).unwrap();
    assert_eq!(p2.id(), "openai_compat");
}
