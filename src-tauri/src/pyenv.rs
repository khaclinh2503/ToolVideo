//! Cài các gói Python cho VieNeu vào một thư mục riêng trong `models/`.
//!
//! Không dùng venv: chỉ cần một cây `site-packages` rồi đặt `PYTHONPATH` khi
//! gọi. Ít thứ có thể hỏng hơn, và không phụ thuộc vào `python -m venv` vốn cần
//! ghi vào chỗ khác.

use crate::error::PipelineError;
use std::io::BufRead;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

/// File đánh dấu "đã cài xong" — sự tồn tại của `vieneu/__init__.py` bên trong
/// cây site-packages đã cài.
const MARKER_REL: &str = "vieneu/__init__.py";

pub fn site_packages(models: &Path) -> PathBuf {
    models.join("vieneu").join("site-packages")
}

pub fn python_exe(models: &Path) -> PathBuf {
    models.join("python").join("python.exe")
}

pub fn requirements_path() -> &'static Path {
    Path::new(concat!(env!("CARGO_MANIFEST_DIR"), "/vieneu-requirements.txt"))
}

pub fn build_pip_args(req: &Path, target: &Path) -> Vec<String> {
    vec![
        "-m".into(),
        "pip".into(),
        "install".into(),
        // Từ chối mọi gói không khớp hash đã pin trong repo.
        "--require-hashes".into(),
        // Bỏ qua cấu hình pip và biến môi trường của máy người dùng.
        "--isolated".into(),
        "--no-cache-dir".into(),
        "--no-warn-script-location".into(),
        "--target".into(),
        target.display().to_string(),
        "-r".into(),
        req.display().to_string(),
    ]
}

fn no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    #[cfg(not(windows))]
    let _ = cmd;
}

/// Đã cài = tồn tại `vieneu/__init__.py` bên trong `site_packages(models)`.
pub fn is_installed(models: &Path) -> bool {
    site_packages(models).join(MARKER_REL).exists()
}

/// Cài các gói trong `vieneu-requirements.txt` vào `site_packages(models)`.
///
/// Cài vào thư mục tạm cạnh đích rồi `rename` sang đích thật — cùng khuôn
/// tmp+rename đã dùng ở M6 cho wav/manifest — để một lần cài hỏng giữa chừng
/// không để lại cây gói nửa vời mà `is_installed` lại tưởng là xong.
pub fn install(models: &Path, on_line: &mut dyn FnMut(&str)) -> Result<(), PipelineError> {
    if is_installed(models) {
        return Ok(());
    }

    let py = python_exe(models);
    if !py.exists() {
        return Err(PipelineError::EngineMissing("python".into()));
    }

    let req = requirements_path();
    if !req.exists() {
        return Err(PipelineError::Io(format!(
            "thiếu file pin gói Python: {}",
            req.display()
        )));
    }

    let vieneu_dir = models.join("vieneu");
    std::fs::create_dir_all(&vieneu_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let tmp_target = vieneu_dir.join("site-packages.tmp");
    // Dọn tàn dư của một lần cài hỏng trước đó — rename không cho phép đích đã tồn tại.
    if tmp_target.exists() {
        std::fs::remove_dir_all(&tmp_target).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    std::fs::create_dir_all(&tmp_target).map_err(|e| PipelineError::Io(e.to_string()))?;

    let mut cmd = Command::new(&py);
    cmd.args(build_pip_args(req, &tmp_target))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    no_window(&mut cmd);

    let mut child = cmd.spawn().map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("python".into())
        } else {
            PipelineError::Io(err.to_string())
        }
    })?;

    // Đọc stdout/stderr theo byte rồi decode lossy, không dùng `.lines()`: một
    // byte không phải UTF-8 hợp lệ (tên gói/đường dẫn theo codepage hệ thống)
    // là đủ làm `.lines()` dừng đọc vĩnh viễn, ống đầy, và treo cả tiến trình
    // pip — cùng lý do đã ghi trong tts/piper.rs.
    let stderr = child.stderr.take().expect("đã piped");
    let err_handle = std::thread::spawn(move || {
        let mut tail: Vec<String> = Vec::new();
        let mut reader = std::io::BufReader::new(stderr);
        let mut buf: Vec<u8> = Vec::new();
        loop {
            buf.clear();
            match reader.read_until(b'\n', &mut buf) {
                Ok(0) | Err(_) => break,
                Ok(_) => {}
            }
            tail.push(String::from_utf8_lossy(&buf).trim_end().to_string());
            if tail.len() > 200 {
                tail.remove(0);
            }
        }
        tail.join("\n")
    });

    let stdout = child.stdout.take().expect("đã piped");
    let mut reader = std::io::BufReader::new(stdout);
    let mut buf: Vec<u8> = Vec::new();
    loop {
        buf.clear();
        match reader.read_until(b'\n', &mut buf) {
            Ok(0) | Err(_) => break,
            Ok(_) => {}
        }
        let line = String::from_utf8_lossy(&buf);
        let line = line.trim_end();
        if !line.is_empty() {
            on_line(line);
        }
    }

    let wait_res = child.wait();
    let stderr_tail = err_handle.join().unwrap_or_default();
    let status = wait_res.map_err(|e| PipelineError::Io(e.to_string()))?;

    if !status.success() {
        let _ = std::fs::remove_dir_all(&tmp_target);
        return Err(PipelineError::EngineFailed {
            stage: "cài gói Python cho VieNeu".into(),
            code: status.code().unwrap_or(-1),
            stderr: stderr_tail,
        });
    }

    let target = site_packages(models);
    if target.exists() {
        std::fs::remove_dir_all(&target).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    std::fs::rename(&tmp_target, &target).map_err(|e| PipelineError::Io(e.to_string()))?;

    if !is_installed(models) {
        return Err(PipelineError::EngineFailed {
            stage: "cài gói Python cho VieNeu".into(),
            code: 0,
            stderr: format!(
                "pip báo xong nhưng thiếu {}",
                target.join(MARKER_REL).display()
            ),
        });
    }

    Ok(())
}
