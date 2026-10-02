//! Cài một vài component theo id, đúng đường cài của app.
//!
//! Dùng khi thêm component mới vào `components.json`: chạy nó để KIỂM spec có
//! tải, kiểm sha256 và bung file đúng chỗ không — thay vì chép tay rồi tưởng
//! là xong.
//!
//! ```text
//! cargo run --bin cai_thanh_phan -- pyannote-segmentation speaker-embedding
//! ```
fn main() {
    let ids: Vec<String> = std::env::args().skip(1).collect();
    assert!(!ids.is_empty(), "cần ít nhất một id component");
    let models = app_lib::config::models_dir();
    let specs = app_lib::components::specs().expect("đọc được components.json");
    let can: Vec<_> = specs.into_iter().filter(|s| ids.contains(&s.id)).collect();
    assert_eq!(can.len(), ids.len(), "có id không tìm thấy trong components.json");
    app_lib::components::install_specs(&can, &models, &mut |id, p| {
        if let app_lib::components::Progress::Download { done, total } = p {
            if total > 0 && done % (8 * 1024 * 1024) < 65536 {
                eprintln!("{id}: {:.0}%", done as f64 * 100.0 / total as f64);
            }
        }
    })
    .expect("cài được");
    for id in &ids {
        println!("xong: {id}");
    }
}
