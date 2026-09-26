//! Test cho phần thuần của `pyenv` — không đụng %APPDATA% thật, không cài gì.

use app_lib::pyenv::{build_pip_args, site_packages, REQUIREMENTS};
use std::path::Path;

#[test]
fn pip_bat_buoc_kiem_hash() {
    let a = build_pip_args(Path::new("C:/r.txt"), Path::new("C:/sp"));
    assert!(
        a.contains(&"--require-hashes".to_string()),
        "thiếu cờ này thì pip cài bất cứ thứ gì nó tải được: {a:?}"
    );
}

#[test]
fn pip_cai_vao_dung_thu_muc_va_khong_dung_moi_truong_nguoi_dung() {
    let a = build_pip_args(Path::new("C:/r.txt"), Path::new("C:/sp"));
    let i = a.iter().position(|s| s == "--target").expect("phải có --target");
    assert_eq!(a[i + 1], "C:/sp");
    // Không được đụng tới gói đã cài sẵn ngoài hệ thống, và không được đọc
    // cấu hình pip của người dùng — cả hai đều phá tính tất định.
    assert!(a.contains(&"--isolated".to_string()), "{a:?}");
    assert!(a.contains(&"--no-cache-dir".to_string()), "{a:?}");
}

#[test]
fn site_packages_nam_trong_thu_muc_models() {
    let p = site_packages(Path::new("C:/m"));
    assert!(p.starts_with("C:/m"), "{}", p.display());
}

#[test]
fn requirements_nhung_vao_binary_co_hash() {
    // Phải nhúng vào binary lúc biên dịch (`include_str!`), không đọc từ đĩa
    // theo `CARGO_MANIFEST_DIR` — hằng số đó trỏ vào máy build, không tồn tại
    // trên máy người dùng cài bản đóng gói. Test này bắt trường hợp file bị
    // xoá hoặc bị làm rỗng mà mã vẫn biên dịch được.
    assert!(!REQUIREMENTS.trim().is_empty(), "vieneu-requirements.txt rỗng");
    assert!(
        REQUIREMENTS.contains("--hash=sha256:"),
        "thiếu hash đã pin — --require-hashes sẽ không có gì để đối chiếu"
    );
}

#[test]
fn components_ready_tinh_ca_buoc_cai_goi_python() {
    // Thư mục trống: artifact thiếu VÀ gói python thiếu ⇒ phải là chưa sẵn sàng.
    // Nếu components_ready chỉ tính artifact thì giao diện sẽ ẩn mất nút "Tải bộ
    // công cụ" ngay khi tải xong file, trong khi 79 gói python chưa hề được cài.
    let d = tempfile::tempdir().unwrap();
    assert!(!app_lib::pyenv::is_installed(d.path()), "thư mục trống ⇒ chưa cài gói");
}
