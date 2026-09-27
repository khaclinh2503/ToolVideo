//! Tiện ích dùng chung cho các phép kiểm đầu-cuối.

use std::path::{Path, PathBuf};

/// Thư mục dự án tạm cho E2E, TỰ DỌN khi phép kiểm xanh.
///
/// E2E buộc phải chạy trong thư mục dự án thật (`projects_dir()`) vì nó kiểm
/// đúng đường đi mà app dùng, không phải một bản sao. Không dọn thì mỗi lần
/// chạy để lại một dự án rác, và danh sách dự án của người dùng ngập rác test.
///
/// Dọn ở `Drop` mà chỉ khi KHÔNG panic: phép kiểm đỏ thì giữ nguyên hiện
/// trường để còn soi file đầu ra tìm nguyên nhân.
pub struct DuAnTam(PathBuf);

impl DuAnTam {
    pub fn moi(ten: &str) -> Self {
        let p = app_lib::config::projects_dir().join(format!("{ten}-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&p).expect("tạo được thư mục dự án");
        Self(p)
    }

    pub fn duong_dan(&self) -> &Path {
        &self.0
    }
}

impl Drop for DuAnTam {
    fn drop(&mut self) {
        if std::thread::panicking() {
            eprintln!("phép kiểm đỏ — GIỮ LẠI {} để soi", self.0.display());
            return;
        }
        let _ = std::fs::remove_dir_all(&self.0);
    }
}
