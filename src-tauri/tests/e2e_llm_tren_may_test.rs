//! Chạy nhánh dịch trên máy qua llama-server THẬT.
//!
//! Bật bằng:
//!   DVL_E2E_LLM=1 cargo test --test e2e_llm_tren_may_test -- --ignored --nocapture --test-threads=1
//!
//! `--test-threads=1` là bắt buộc, không phải tùy chọn: hai test trong file
//! này đều tự nạp và tắt llama-server, và `tha_provider_thi_server_chet` chụp
//! ảnh PID trước/sau khi tự nạp server của nó để suy ra đúng PID mới sinh ra
//! (xem chú thích ở hàm đó) — nếu cargo chạy song song, spawn của TEST KIA có
//! thể rơi vào đúng cửa sổ chụp ảnh đó và làm assert đếm PID trật đi. Chạy nối
//! tiếp cũng khiến VRAM chỉ cần tính cho một instance một lúc.
//!
//! Cần bộ công cụ đã cài (llama-server.exe + Qwen3-14B-Q5_K_M.gguf) và một GPU
//! đủ ~14 GB VRAM trống cho MỘT instance (đo thật: 13,5/16,3 GB). Đây là số
//! đúng cho lệnh --test-threads=1 ở trên. Nếu ai đó bỏ cờ đó và để hai test
//! chạy song song, cần gấp đôi: ~27 GB cho hai instance cùng lúc — thiếu VRAM
//! thì một bên tràn sang RAM, dịch chậm hẳn xuống chứ không báo lỗi rõ (đã
//! thấy 27–28s thay vì 18,5s khi hai server cùng sống, xem task-6-report.md).

// Không cần `use app_lib::translate::TranslateProvider`: `make_provider` trả
// `Box<dyn TranslateProvider>`, và gọi phương thức trên một giá trị đã biết
// kiểu cụ thể là `dyn Trait` không cần trait đó nằm trong scope — vì đây là
// một trait object đã tự mang theo vtable, không phải vì `dyn Trait` khác gì
// tham số kiểu chung `T: Trait` ở điểm này (cả hai đều không cần `use`).

fn bat() {
    assert_eq!(
        std::env::var("DVL_E2E_LLM").unwrap_or_default(),
        "1",
        "đặt DVL_E2E_LLM=1 để chạy test này"
    );
}

#[test]
#[ignore]
fn dich_that_40_cue_tra_du_va_khong_rong() {
    bat();
    let models = app_lib::config::models_dir();
    let cfg = app_lib::config::load_config().translate;
    let p = app_lib::translate::make_provider("llm_tren_may", &cfg, &models)
        .expect("khởi động được llm_tren_may");

    // 40 cue tiếng Trung, đúng cỡ lô mà openai_compat gửi.
    let cau: Vec<String> = (0..40).map(|i| format!("这是第{i}句话。")).collect();
    let texts: Vec<&str> = cau.iter().map(|s| s.as_str()).collect();

    let t0 = std::time::Instant::now();
    let ra = p.translate_batch(&texts, "zh", "vi").expect("dịch được");
    let giay = t0.elapsed().as_secs_f32();

    assert_eq!(ra.len(), 40, "phải trả đúng 40 item");
    for (i, s) in ra.iter().enumerate() {
        assert!(!s.trim().is_empty(), "item {i} rỗng");
    }
    println!("40 cue trong {giay:.1}s");
}

/// Tập PID của mọi tiến trình `llama-server.exe` đang chạy. Dùng `/FO CSV /NH`
/// (không tiêu đề) để phân tích cột ổn định — không phụ thuộc bảng có tiêu đề
/// tiếng Anh hay tiếng Việt theo ngôn ngữ hệ điều hành.
fn pid_llama_dang_chay() -> std::collections::HashSet<String> {
    let ra = std::process::Command::new("tasklist")
        .args(["/FI", "IMAGENAME eq llama-server.exe", "/FO", "CSV", "/NH"])
        .output()
        .expect("chạy được tasklist");
    let s = String::from_utf8_lossy(&ra.stdout);
    s.lines()
        .filter_map(|dong| {
            // Dòng CSV: "llama-server.exe","6360","Console","1","15,516,220 K".
            // Khi không có tiến trình nào khớp, tasklist in một dòng thông báo
            // (không phải CSV) — cột đầu không khớp tên nên bị lọc bỏ tự nhiên.
            let mut cot = dong.split(',');
            let ten = cot.next()?.trim_matches('"');
            if ten != "llama-server.exe" {
                return None;
            }
            Some(cot.next()?.trim_matches('"').to_string())
        })
        .collect()
}

/// Server phải chết khi provider bị thả — đây là thứ trả lại 13,5 GB VRAM.
///
/// KHÔNG dò "còn thấy 'llama-server.exe' trong tasklist hay không": nếu test
/// kia (`dich_that_40_cue_...`) đang giữ MỘT llama-server sống khác cùng lúc,
/// dò theo tên tiến trình sẽ thấy server CỦA TEST KIA và báo nhầm "chưa chết"
/// dù `Drop` của chính test này chạy đúng. Test này từng báo ĐỎ giả đúng kiểu
/// đó khi hai test chạy song song (xem task-6-report.md). Phải tự chụp PID
/// của đúng tiến trình mình sinh ra (khác trước/sau khi gọi `make_provider`)
/// rồi chỉ soi đúng PID đó có biến mất.
///
/// Cách chụp PID này AN TOÀN khi server của test kia đã tồn tại TỪ TRƯỚC lúc
/// chụp ảnh "trước" (nó nằm trong cả hai ảnh, bị trừ đi, không lẫn vào tập
/// "mới"). Nó KHÔNG an toàn nếu server của test kia bắt đầu spawn ĐÚNG vào
/// giữa cửa sổ chụp ảnh của hàm này (giữa lúc chụp "trước" và chụp "sau khi
/// khởi động", dài cỡ 15 giây nạp model) — lúc đó `moi.len()` sẽ ra 2 và
/// assert bên dưới trật, dù `Drop` không hề hỏng. Đây là lý do lệnh chạy ở
/// đầu file bắt buộc có `--test-threads=1`: chạy nối tiếp thì không bao giờ
/// có spawn nào rơi vào cửa sổ của test khác. Thất bại kiểu này luôn ồn ào
/// (assert trật, không phải xanh giả), nên tính an toàn của thuộc tính đang
/// kiểm không bị ảnh hưởng — chỉ là thông báo lỗi có thể trỏ nhầm nguyên nhân
/// nếu ai đó bỏ cờ `--test-threads=1`.
#[test]
#[ignore]
fn tha_provider_thi_server_chet() {
    bat();
    let models = app_lib::config::models_dir();
    let cfg = app_lib::config::load_config().translate;

    let truoc = pid_llama_dang_chay();
    let pid_cua_toi = {
        let _p = app_lib::translate::make_provider("llm_tren_may", &cfg, &models).unwrap();
        let sau_khi_khoi_dong = pid_llama_dang_chay();
        let moi: Vec<String> = sau_khi_khoi_dong.difference(&truoc).cloned().collect();
        assert_eq!(
            moi.len(),
            1,
            "phải sinh đúng 1 tiến trình llama-server mới để theo dõi, thấy: {moi:?}"
        );
        moi.into_iter().next().unwrap()
        // `_p` bị thả ở dấu đóng khối này — ngay sau khi PID đã được chụp lại,
        // trước khi khối ngoài đọc `pid_cua_toi`.
    };

    std::thread::sleep(std::time::Duration::from_secs(2));
    let sau_khi_tha = pid_llama_dang_chay();
    assert!(
        !sau_khi_tha.contains(&pid_cua_toi),
        "llama-server (PID {pid_cua_toi}) còn sống sau khi provider bị thả"
    );
}
