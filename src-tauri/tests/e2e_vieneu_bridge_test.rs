//! E2E: cầu nối Python VieNeu-TTS thật (`python/vieneu_bridge.py`) — tổng hợp
//! một câu, ghi ra wav 48kHz, đọc lại được bằng `wav::read_info`. Bỏ qua mặc
//! định; bật bằng:
//!   DVL_E2E_VIENEU=1 cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_bridge_test -- --ignored --nocapture
//!
//! Yêu cầu Task 1 + Task 2 của M7 đã xong: `python.exe` đóng gói cùng app và
//! `site-packages` của vieneu đã cài ở `models_dir()`. Lần chạy ĐẦU TIÊN còn
//! tự tải model ONNX (~580 MB tổng, backbone + codec) về `HF_HOME` nên có thể
//! mất một, hai phút; các lần sau (đã cache) chỉ vài giây.
//!
//! Không đụng gì dưới `%APPDATA%\dichvideo-local\` ngoài việc ĐỌC
//! `models/python` + `models/vieneu/site-packages` (Task 1/2 đã cài) và GHI
//! vào `models/vieneu/cache` (thư mục cache HF_HOME hợp lệ, không phải nơi
//! cấm động vào). File wav đầu ra nằm trong `tempdir` tự dọn khi test xong.

use app_lib::config::models_dir;
use app_lib::pyenv::{python_exe, site_packages};
use app_lib::wav;
use std::io::{Read, Write};
use std::process::{Command, Stdio};

#[test]
#[ignore]
fn vieneu_bridge_that_tong_hop_mot_cau_ra_wav_48k() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy cầu nối VieNeu thật (yêu cầu Task 1 + Task 2 đã cài xong)"
    );

    let m = models_dir();
    let py = python_exe(&m);
    assert!(
        py.exists(),
        "thiếu python.exe ở {} — chạy Task 1 (cài Python) trước",
        py.display()
    );
    let sp = site_packages(&m);
    assert!(
        sp.join("vieneu").join("__init__.py").exists(),
        "thiếu vieneu trong site-packages ở {} — chạy Task 2 (cài gói) trước",
        sp.display()
    );

    let script = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("python")
        .join("vieneu_bridge.py");
    assert!(script.exists(), "thiếu cầu nối: {}", script.display());

    // Thư mục tạm tự dọn khi `dir` bị drop cuối hàm — không đụng %APPDATA%.
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("cau-kiem-tra.wav");

    let job = serde_json::json!({
        "text": "Xin chào, đây là câu kiểm tra cầu nối VieNeu tê tê ét.",
        "output_file": out.display().to_string(),
        "voice": "Mai Anh",
    });
    let line = job.to_string();

    // HF_HOME trỏ vào cache thật của VieNeu (đã có từ Task 2 / lần chạy tự tải
    // model) — không phải %USERPROFILE%\.cache.
    let hf_home = m.join("vieneu").join("cache");
    std::fs::create_dir_all(&hf_home).unwrap();

    let mut cmd = Command::new(&py);
    cmd.arg(&script)
        .env("PYTHONPATH", &sp)
        .env("HF_HOME", &hf_home)
        .env("PYTHONIOENCODING", "utf-8")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let t0 = std::time::Instant::now();
    let mut child = cmd.spawn().unwrap_or_else(|e| panic!("spawn cầu nối lỗi: {e}"));

    // Ghi stdin trên luồng riêng + đọc stderr trên luồng riêng, đọc stdout
    // trên luồng gọi — cùng khuôn với `tts/piper.rs` để không ống nào có thể
    // làm nghẽn tiến trình con dù batch một job này quá nhỏ để thực sự gặp
    // vấn đề đó.
    let mut stdin = child.stdin.take().expect("đã piped");
    let writer = std::thread::spawn(move || -> std::io::Result<()> {
        stdin.write_all(line.as_bytes())?;
        stdin.write_all(b"\n")?;
        stdin.flush()
        // `stdin` bị drop ở cuối closure ⇒ báo hết đầu vào cho cầu nối.
    });

    let mut stderr_pipe = child.stderr.take().expect("đã piped");
    let stderr_reader = std::thread::spawn(move || -> String {
        let mut s = String::new();
        let _ = stderr_pipe.read_to_string(&mut s);
        s
    });

    let mut stdout_s = String::new();
    child
        .stdout
        .take()
        .expect("đã piped")
        .read_to_string(&mut stdout_s)
        .unwrap_or_else(|e| panic!("đọc stdout cầu nối lỗi: {e}"));

    let _ = writer.join();
    let stderr_s = stderr_reader.join().unwrap_or_default();
    let status = child.wait().unwrap_or_else(|e| panic!("wait cầu nối lỗi: {e}"));
    let elapsed = t0.elapsed();

    println!(
        "cầu nối VieNeu tổng hợp 1 câu trong {:.1}s (đã bao gồm nạp model; lần đầu còn cộng thời gian tải model)",
        elapsed.as_secs_f32()
    );
    if !stderr_s.trim().is_empty() {
        println!("stderr cầu nối:\n{stderr_s}");
    }

    assert!(
        status.success(),
        "cầu nối thoát mã {:?}, stderr:\n{stderr_s}",
        status.code()
    );
    assert_eq!(
        stdout_s.trim(),
        out.display().to_string(),
        "stdout phải in đúng một dòng là đường dẫn wav đã ghi (hợp đồng stdin/stdout của cầu nối)"
    );

    assert!(out.exists(), "thiếu wav đầu ra: {}", out.display());
    let info = wav::read_info(&out).unwrap_or_else(|e| panic!("wav::read_info lỗi: {e}"));
    assert_eq!(info.sample_rate, 48_000, "VieNeu-TTS v3 Turbo phải ra 48kHz, đọc được {}", info.sample_rate);
}
