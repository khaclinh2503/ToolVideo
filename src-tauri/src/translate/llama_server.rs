//! Vòng đời tiến trình `llama-server.exe`.
//!
//! Đây là thứ ĐẦU TIÊN trong app sống lâu hơn một lệnh. Mọi engine khác
//! (ffmpeg, piper, python của VieNeu) đều chạy-rồi-tắt trong một lời gọi, nên
//! không có khuôn sẵn để chép — phần lớn rủi ro của M9 nằm ở file này chứ không
//! ở chất lượng dịch.

use crate::error::PipelineError;
use std::collections::VecDeque;
use std::io::{BufRead, BufReader, Read};
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

fn perr(msg: impl Into<String>) -> PipelineError {
    PipelineError::ProviderError {
        provider: "llm_tren_may".into(),
        status: None,
        msg: msg.into(),
    }
}

/// Số dòng stderr gần nhất giữ lại để chẩn đoán. `llama-server` ghi log theo
/// từng request/slot suốt cả phiên chạy, không có gì tự giới hạn — giữ hết
/// thì rò rỉ bộ nhớ dần trên một phiên dịch dài, nên chặn trên và chỉ giữ
/// những dòng mới nhất (đó là thứ một chẩn đoán cần).
const STDERR_CAP: usize = 20;

/// Bộ đệm stderr có giới hạn, dùng chung giữa luồng hút (ghi) và luồng gọi
/// (đọc). Đọc luôn tức khắc từ bộ nhớ, không đụng tới ống — khác với đọc
/// trực tiếp từ `Child::stderr`, việc đọc bộ đệm này không bao giờ treo dù
/// tiến trình còn sống hay đã chết.
#[derive(Clone)]
pub struct DemStderr(Arc<Mutex<VecDeque<String>>>);

impl DemStderr {
    pub fn moi() -> Self {
        DemStderr(Arc::new(Mutex::new(VecDeque::new())))
    }

    fn day(&self, dong: String) {
        let mut d = self.0.lock().unwrap();
        d.push_back(dong);
        while d.len() > STDERR_CAP {
            d.pop_front();
        }
    }

    /// Nối các dòng đang giữ lại, mới nhất ở cuối.
    pub fn doc_ra(&self) -> String {
        self.0
            .lock()
            .unwrap()
            .iter()
            .cloned()
            .collect::<Vec<_>>()
            .join(" | ")
    }
}

/// Hút stderr LIÊN TỤC cho tới khi ống đóng (tiến trình thoát), đẩy từng dòng
/// vào `dem`. Phải chạy suốt đời tiến trình trên một luồng riêng, ngay từ lúc
/// spawn — không phải gọi khi cần chẩn đoán.
///
/// Ống ẩn danh trên Windows chỉ có khoảng 4KB. `llama-server` ghi log theo
/// từng request/slot suốt phiên; nếu không ai rút ống liên tục, log tích tới
/// khi đầy 4KB rồi CHÍNH `llama-server` bị chặn ở lời gọi `write()` stderr
/// của nó — cả phiên dịch treo cứng, trông giống "model còn đang nạp" hoặc
/// "mạng bị nghẽn" chứ không lộ ra là do ống stderr. Đây đúng là lớp lỗi mà
/// `tts::procio::run_line_protocol` được viết ra để tránh (xem comment ở
/// `tts/vieneu.rs` gọi hàm đó) — không dùng lại được nguyên khuôn giao thức
/// dòng của nó (đây là server HTTP, không phải giao thức stdin/stdout theo
/// dòng), nhưng bài học thì giữ: luôn có người rút ống phía bên kia.
///
/// Đọc theo byte (`read_until`) rồi decode lossy, KHÔNG dùng `.lines()`:
/// `.lines()` trả `Err` ngay khi gặp byte không phải UTF-8 hợp lệ và dừng đọc
/// vĩnh viễn tại đó — một dòng log không phải UTF-8 (đường dẫn theo codepage
/// hệ thống, tên người dùng có dấu) là đủ để ống ngừng được rút và treo lại
/// đúng kiểu lỗi này được viết ra để tránh.
pub fn hut_stderr_lien_tuc(nguon: impl Read, dem: DemStderr) {
    let mut reader = BufReader::new(nguon);
    let mut buf: Vec<u8> = Vec::new();
    loop {
        buf.clear();
        match reader.read_until(b'\n', &mut buf) {
            Ok(0) | Err(_) => break,
            Ok(_) => {}
        }
        if buf.last() == Some(&b'\n') {
            buf.pop();
            if buf.last() == Some(&b'\r') {
                buf.pop();
            }
        }
        dem.day(String::from_utf8_lossy(&buf).into_owned());
    }
}

/// Chờ tới khi server dịch được THẬT.
///
/// KHÔNG dùng `/health`: nó trả 200 ngay khi tiến trình lên, trong khi model
/// còn đang nạp và `POST /v1/chat/completions` lúc đó trả 503. Đo thật khi dựng
/// máy đo M9. Chờ theo `/health` là chờ hụt và lỗi 503 rơi vào giữa lô dịch.
///
/// Hàm này CHỈ làm việc gọi HTTP lặp lại — cố ý tách khỏi mọi thứ liên quan
/// tới tiến trình con, để test được bằng server giả (`httpmock`) không cần
/// `llama-server` thật. `doi_san_sang_va_kiem_song` bên dưới bọc thêm việc
/// kiểm tiến trình còn sống, ở nơi có `Child` để kiểm.
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

/// Lõi chờ sẵn sàng có thêm kiểm tiến trình còn sống — tách khỏi
/// `LlamaServer` để test được với BẤT KỲ tiến trình con nào (không cần
/// `llama-server` thật), theo cùng khuôn với `cho_san_sang`.
///
/// Vì sao cần: nếu một tiến trình khác chiếm mất cổng ngay sau khi
/// `cong_trong()` nhả ra, `spawn()` của `llama-server` vẫn THÀNH CÔNG (nó chỉ
/// lỗi kiểu không tìm thấy exe) — bên thua cuộc bind là `llama-server` tự nó,
/// và nó chết ngay. Không kiểm sống thì lỗi đó bị `cho_san_sang` báo sai thành
/// "model chưa nạp xong sau N giây" sau khi đã chờ hết cả `han`, trong khi
/// tiến trình đã chết từ giây đầu — chờ hụt hai lần thay vì báo đúng ngay.
pub fn doi_san_sang_va_kiem_song(
    child: &mut Child,
    base_url: &str,
    han: Duration,
    ly_do_chet: impl Fn() -> String,
) -> Result<(), PipelineError> {
    let het = Instant::now() + han;
    loop {
        if let Ok(Some(status)) = child.try_wait() {
            return Err(perr(format!(
                "llama-server đã tắt (mã {:?}) trước khi sẵn sàng dịch — không phải đang nạp dở, đừng chờ thêm: {}",
                status.code(),
                ly_do_chet()
            )));
        }
        let con_lai = het.saturating_duration_since(Instant::now());
        if con_lai.is_zero() {
            return Err(perr(format!(
                "model chưa nạp xong sau {} giây, chưa sẵn sàng dịch",
                han.as_secs()
            )));
        }
        // Kiểm tiến trình còn sống mỗi tối đa 500ms, để bắt chết sớm ngay cả
        // khi `han` còn dài — không phải đợi hết hạn mới biết là đã chết.
        let buoc = con_lai.min(Duration::from_millis(500));
        if cho_san_sang(base_url, buoc).is_ok() {
            return Ok(());
        }
    }
}

/// Xin một cổng trống từ hệ điều hành: bind cổng 0, đọc cổng thật, rồi nhả ra.
///
/// Có khe hở tranh chấp giữa lúc nhả và lúc `llama-server` bind, nhưng nhỏ hơn
/// nhiều so với đóng cứng một cổng có thể đang bận — và `doi_san_sang_va_kiem_song`
/// bắt được ngay nếu hỏng (xem comment ở đó).
pub fn cong_trong() -> Result<u16, PipelineError> {
    let l = std::net::TcpListener::bind(("127.0.0.1", 0))
        .map_err(|e| perr(format!("không xin được cổng trống: {e}")))?;
    let p = l.local_addr().map_err(|e| perr(e.to_string()))?.port();
    drop(l);
    Ok(p)
}

pub struct LlamaServer {
    child: Child,
    port: u16,
    stderr_dem: DemStderr,
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
        let mut child = cmd.spawn().map_err(|e| {
            perr(format!("không chạy được llama-server ({}): {e}", exe.display()))
        })?;

        // Hút stderr LIÊN TỤC từ lúc tiến trình sống, trên một luồng riêng —
        // không phải đọc khi cần. Xem comment ở `hut_stderr_lien_tuc` để biết
        // vì sao đợi mới đọc là tự treo cả phiên dịch.
        let stderr_dem = DemStderr::moi();
        if let Some(nguon) = child.stderr.take() {
            let dem = stderr_dem.clone();
            std::thread::spawn(move || hut_stderr_lien_tuc(nguon, dem));
        }

        Ok(LlamaServer { child, port, stderr_dem })
    }

    pub fn base_url(&self) -> String {
        format!("http://127.0.0.1:{}/v1", self.port)
    }

    /// Chờ sẵn sàng dịch, có kiểm tiến trình còn sống — bọc
    /// `doi_san_sang_va_kiem_song` với `child` và bộ đệm stderr của chính
    /// server này để chẩn đoán khi nó chết sớm.
    pub fn doi_san_sang(&mut self, han: Duration) -> Result<(), PipelineError> {
        let url = self.base_url();
        let dem = self.stderr_dem.clone();
        doi_san_sang_va_kiem_song(&mut self.child, &url, han, move || dem.doc_ra())
    }

    /// Vài dòng stderr gần nhất, để thông báo lỗi nói được *vì sao* thay vì
    /// chỉ "không sẵn sàng".
    ///
    /// Đọc từ bộ đệm trong bộ nhớ (`stderr_dem`, được một luồng nền hút liên
    /// tục từ lúc `khoi_dong`) — KHÔNG đọc trực tiếp ống của tiến trình, nên
    /// gọi được bất cứ lúc nào, kể cả khi tiến trình còn sống, mà không bị
    /// treo tới khi nó thoát (đọc trực tiếp ống chỉ trả về khi ống đóng, tức
    /// tiến trình đã chết — gọi hàm này lúc tiến trình còn sống, ví dụ ngay
    /// sau khi `doi_san_sang` hết giờ vì model còn nạp dở, sẽ treo vô hạn).
    pub fn ly_do_chet(&self) -> String {
        self.stderr_dem.doc_ra()
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
        // Không join luồng hút stderr: ống đóng ngay sau `wait()` xong nên
        // luồng đó tự thoát trong tức khắc; nó không giữ tài nguyên gì cần
        // dọn đồng bộ, và Drop không nên chờ một luồng nền không quan trọng.
    }
}
