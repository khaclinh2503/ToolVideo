//! Vòng đời tiến trình `llama-server.exe`.
//!
//! Đây là thứ ĐẦU TIÊN trong app sống lâu hơn một lệnh. Mọi engine khác
//! (ffmpeg, piper, python của VieNeu) đều chạy-rồi-tắt trong một lời gọi, nên
//! không có khuôn sẵn để chép — phần lớn rủi ro của M9 nằm ở file này chứ không
//! ở chất lượng dịch.

use crate::error::PipelineError;
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

fn perr(msg: impl Into<String>) -> PipelineError {
    PipelineError::ProviderError {
        provider: "llm_tren_may".into(),
        status: None,
        msg: msg.into(),
    }
}

/// Xin một cổng trống từ hệ điều hành: bind cổng 0, đọc cổng thật, rồi nhả ra.
///
/// Có khe hở tranh chấp giữa lúc nhả và lúc `llama-server` bind, nhưng nhỏ hơn
/// nhiều so với đóng cứng một cổng có thể đang bận — và `cho_san_sang` sẽ bắt
/// được nếu hỏng.
pub fn cong_trong() -> Result<u16, PipelineError> {
    let l = std::net::TcpListener::bind(("127.0.0.1", 0))
        .map_err(|e| perr(format!("không xin được cổng trống: {e}")))?;
    let p = l.local_addr().map_err(|e| perr(e.to_string()))?.port();
    drop(l);
    Ok(p)
}

/// Chờ tới khi server dịch được THẬT.
///
/// KHÔNG dùng `/health`: nó trả 200 ngay khi tiến trình lên, trong khi model
/// còn đang nạp và `POST /v1/chat/completions` lúc đó trả 503. Đo thật khi dựng
/// máy đo M9. Chờ theo `/health` là chờ hụt và lỗi 503 rơi vào giữa lô dịch.
pub fn cho_san_sang(base_url: &str, han: Duration) -> Result<(), PipelineError> {
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let than = serde_json::json!({
        "messages": [{"role": "user", "content": "x"}],
        "max_tokens": 1
    });
    let khach = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| perr(e.to_string()))?;

    let het = Instant::now() + han;
    let mut cuoi = String::from("chưa gọi được lần nào");
    while Instant::now() < het {
        match khach.post(&url).json(&than).send() {
            Ok(r) if r.status().is_success() => return Ok(()),
            Ok(r) => cuoi = format!("HTTP {}", r.status().as_u16()),
            Err(e) => cuoi = e.to_string(),
        }
        std::thread::sleep(Duration::from_millis(300));
    }
    Err(perr(format!(
        "model chưa nạp xong sau {} giây, chưa sẵn sàng dịch (lần cuối: {cuoi})",
        han.as_secs()
    )))
}

pub struct LlamaServer {
    child: Child,
    port: u16,
}

impl LlamaServer {
    /// Tham số đã ĐO THẬT trên RTX 5060 Ti 16GB: 13,5/16,3 GB VRAM, 34,3 giây
    /// mỗi lô 40 cue. Đổi bất kỳ cờ nào — nhất là `-ngl` hay `-c` — đều phải đo
    /// lại VRAM, vì tràn sang RAM làm tốc độ sụp hàng chục lần.
    pub fn khoi_dong(exe: &Path, gguf: &Path) -> Result<LlamaServer, PipelineError> {
        if !exe.is_file() {
            return Err(perr(format!(
                "chưa có llama-server ở {} — tải bộ công cụ trước",
                exe.display()
            )));
        }
        if !gguf.is_file() {
            return Err(perr(format!(
                "chưa có model llm ở {} — tải bộ công cụ trước",
                gguf.display()
            )));
        }
        let port = cong_trong()?;
        let mut cmd = Command::new(exe);
        cmd.arg("-m").arg(gguf)
            .args(["-ngl", "99", "-c", "16384", "-fa", "on"])
            .arg("--jinja")
            .args(["--reasoning-budget", "0"])
            // Chỉ nghe loopback: không có lý do gì để model dịch của người dùng
            // mở ra mạng LAN.
            .args(["--host", "127.0.0.1"])
            .args(["--port", &port.to_string()])
            .stdout(Stdio::null())
            .stderr(Stdio::piped());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            // CREATE_NO_WINDOW — thiếu nó là mỗi lần dịch một cửa sổ đen nháy lên.
            cmd.creation_flags(0x08000000);
        }
        let child = cmd.spawn().map_err(|e| {
            perr(format!("không chạy được llama-server ({}): {e}", exe.display()))
        })?;
        Ok(LlamaServer { child, port })
    }

    pub fn base_url(&self) -> String {
        format!("http://127.0.0.1:{}/v1", self.port)
    }

    /// Đọc stderr của tiến trình đã chết, để thông báo lỗi nói được *vì sao*
    /// thay vì chỉ "không sẵn sàng".
    pub fn ly_do_chet(&mut self) -> String {
        use std::io::Read;
        let mut s = String::new();
        if let Some(mut e) = self.child.stderr.take() {
            let _ = e.read_to_string(&mut s);
        }
        s.lines().rev().take(5).collect::<Vec<_>>().join(" | ")
    }
}

impl Drop for LlamaServer {
    /// Giết server khi provider bị thả — tức ngay sau khi dịch xong, hoặc khi
    /// một lỗi giữa chừng làm rớt biến. Đây là thứ trả lại 13,5 GB VRAM.
    ///
    /// GIỚI HẠN ĐÃ BIẾT: `Drop` không chạy khi tiến trình app bị kết thúc cứng;
    /// khi đó `llama-server` sống tiếp và giữ VRAM cho tới khi người dùng tự
    /// tắt. Chặn triệt để cần Job Object của Windows — xem spec §6.1, cố ý
    /// không làm trong M9.
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
