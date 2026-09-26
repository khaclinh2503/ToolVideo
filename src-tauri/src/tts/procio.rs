//! Khuôn ba luồng song song dùng chung cho mọi engine TTS chạy qua tiến
//! trình con theo giao thức dòng (Piper, VieNeu): ghi stdin trên luồng riêng,
//! đọc stdout trên luồng gọi, đọc stderr trên luồng riêng.
//!
//! Chuyển nguyên khối từ `tts/piper.rs` (bản gốc, Task M6) sang đây để
//! `tts/vieneu.rs` (Task 4, M7) dùng lại đúng logic, không viết lại — chỉ đổi
//! chỗ gọi `on_done(jobs[done].index)` cụ thể của Piper thành một closure
//! `on_line` chung, để caller (Piper hay VieNeu) tự quyết định làm gì với mỗi
//! dòng stdout và tự đếm số dòng đã nhận.
//!
//! Lý do của khuôn này (giữ nguyên văn từ piper.rs, Task M6):
//!
//! Ống nặc danh trên Windows có bộ đệm khoảng 4KB. Nếu ghi hết stdin rồi mới
//! đọc stdout, với một batch lớn (nhiều cue ⇒ nhiều KB JSON vào, nhiều KB
//! đường dẫn ra) sẽ nghẽn: ghi đầy bộ đệm stdin ⇒ tiến trình gọi bị chặn ở
//! write; tiến trình con đầy bộ đệm stdout vì không ai đọc ⇒ tiến trình con bị
//! chặn ở write stdout; tiến trình con bị chặn nên ngừng đọc stdin ⇒ không
//! bên nào tiến được nữa — treo vĩnh viễn, không lỗi, không timeout.
//!
//! Tách ghi stdin ra luồng riêng và đọc stdout ngay trên luồng gọi giải quyết
//! việc này: mỗi ống luôn có người rút cạn phía bên kia bất kể ống nào đầy
//! trước.
//!
//! Đọc stdout/stderr theo byte (`read_until`) rồi decode lossy, không dùng
//! `.lines()`: `.lines()` trả `Err` ngay khi gặp byte không phải UTF-8 hợp lệ
//! và `map_while(Result::ok)` dừng hẳn tại đó — một byte hỏng là đủ để luồng
//! rút ống này ngừng vĩnh viễn, ống đầy lại, và treo y hệt lỗi mà driver này
//! được viết ra để tránh. Cả hai engine đều có thể in đường dẫn (bắt nguồn từ
//! %APPDATA%) theo codepage hệ thống chứ không phải UTF-8, nên tên người dùng
//! có dấu là đủ để kích hoạt.

use std::io::{BufRead, BufReader, Write};
use std::process::Child;

/// Chạy giao thức dòng của `child`: ghi `lines` vào stdin (luồng riêng), đọc
/// stderr (luồng riêng, giữ tối đa 100 dòng cuối), đọc stdout trên luồng gọi
/// — mỗi dòng không rỗng gọi `on_line(&line)`.
///
/// Không gọi `child.wait()`: đó là việc của caller, để mỗi provider tự diễn
/// giải mã thoát + `stderr` theo ngôn ngữ lỗi riêng của nó (`EngineFailed` với
/// `stage` khác nhau giữa Piper và VieNeu).
///
/// Trả về `(số dòng stdout không rỗng đã nhận, đuôi stderr)`.
pub(crate) fn run_line_protocol(
    child: &mut Child,
    lines: Vec<String>,
    on_line: &mut dyn FnMut(&str),
) -> (usize, String) {
    // stderr đọc song song để tiến trình con không nghẽn ống.
    let stderr = child.stderr.take().expect("đã piped");
    let err_handle = std::thread::spawn(move || {
        let mut tail: Vec<String> = Vec::new();
        let mut reader = BufReader::new(stderr);
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
            tail.push(String::from_utf8_lossy(&buf).into_owned());
            if tail.len() > 100 {
                tail.remove(0);
            }
        }
        tail.join("\n")
    });

    // Ghi stdin trên luồng riêng, đọc stdout trên luồng gọi — chạy song song
    // (xem giải thích ở đầu file).
    let mut stdin = child.stdin.take().expect("đã piped");
    let writer_handle = std::thread::spawn(move || -> std::io::Result<()> {
        for l in &lines {
            stdin.write_all(l.as_bytes())?;
            stdin.write_all(b"\n")?;
        }
        stdin.flush()
        // `stdin` bị drop ở cuối closure ⇒ báo hết đầu vào cho tiến trình con.
    });

    let stdout = child.stdout.take().expect("đã piped");
    let mut reader = BufReader::new(stdout);
    let mut buf: Vec<u8> = Vec::new();
    let mut done = 0usize;
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
        let line = String::from_utf8_lossy(&buf);
        if line.trim().is_empty() {
            continue;
        }
        on_line(&line);
        done += 1;
    }

    // Join luồng ghi trước khi caller wait(): lỗi ghi thường do tiến trình
    // con đã chết — để caller báo lỗi có ngữ cảnh (mã thoát + stderr) thay vì
    // trả lỗi I/O trần trụi ở đây.
    let _ = writer_handle.join();

    // Join stderr trước khi trả về: mọi luồng phải được join trên MỌI nhánh
    // thoát, kể cả khi wait() (ở caller) sau đó lỗi.
    let stderr_tail = err_handle.join().unwrap_or_default();

    (done, stderr_tail)
}
