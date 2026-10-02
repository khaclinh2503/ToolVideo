//! E2E: provider Rust `VieNeu` (`app_lib::tts::vieneu::VieNeu`) chạy cầu nối
//! Python thật (`python/vieneu_bridge.py`) qua đúng đường `synthesize()` mà
//! pipeline dùng — không phải spawn tay như bản trước review. Bỏ qua mặc
//! định; bật bằng:
//!   DVL_E2E_VIENEU=1 cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_bridge_test -- --ignored --nocapture
//!
//! Yêu cầu Task 1 + Task 2 của M7 đã xong: `python.exe` đóng gói cùng app và
//! `site-packages` của vieneu đã cài ở `models_dir()`.
//!
//! Test này chạy HAI job trong một lần gọi `synthesize()` (không phải một)
//! và khẳng định `on_done` nhận đúng `job.index` GỐC của cả hai — index cố
//! tình không liền số với vị trí trong batch (5 rồi 2, không phải 1 rồi 2)
//! để không thể nhầm "job.index gốc" với "số thứ tự trong batch". Đây là
//! đường thanh tiến độ thật của người dùng, trước bản sửa này chỉ được xác
//! nhận bằng đọc mã.
//!
//! Nếu `models_dir()/vieneu/onnx_update` hoặc `.../moss` (15 file đã pin ở
//! Task 4) CHƯA có trên máy — components.json mới chỉ khai báo, chưa có bước
//! cài đặt thật nào chạy — test bỏ qua sạch sẽ (in lý do, không panic, không
//! đỏ) thay vì coi đó là lỗi.
//!
//! Không đụng gì dưới `%APPDATA%\dichvideo-local\` ngoài việc ĐỌC
//! `models/python`, `models/vieneu/site-packages`, `models/vieneu/onnx_update`,
//! `models/vieneu/moss` (đều đã có sẵn từ trước) và GHI vào `models/vieneu/cache`
//! (thư mục cache HF_HOME hợp lệ, không phải nơi cấm động vào). File wav đầu
//! ra nằm trong `tempdir` tự dọn khi test xong.

use app_lib::config::models_dir;
use app_lib::pyenv::{python_exe, site_packages};
use app_lib::tts::vieneu::{ensure_bridge_script, VieNeu};
use app_lib::tts::{TtsJob, TtsProvider};
use app_lib::wav;
use std::sync::{Arc, Mutex};

#[test]
#[ignore]
fn vieneu_provider_that_tong_hop_hai_job_on_done_dung_index_goc() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy provider VieNeu thật (yêu cầu Task 1 + Task 2 đã cài xong)"
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

    let vieneu_dir = m.join("vieneu");
    let onnx_update = vieneu_dir.join("onnx_update");
    let moss = vieneu_dir.join("moss");
    // KHÔNG `return` im lặng ở đây. Trước đây test in "BỎ QUA" rồi trả về —
    // cargo báo `ok`, nên nó nằm trong danh sách test xanh suốt nhiều vòng
    // review trong khi KHÔNG kiểm gì cả, và đường model offline chưa bao giờ
    // được thực thi lần nào.
    //
    // Đặt `DVL_E2E_VIENEU=1` nghĩa là đã khẳng định "tôi muốn chạy E2E VieNeu".
    // Thiếu model lúc đó là một thất bại CÓ Ý NGHĨA: nó nói đúng rằng bước cài
    // đặt chưa từng được kiểm.
    assert!(
        onnx_update.exists() && moss.exists(),
        "chưa có model VieNeu đã pin ở {} (thiếu onnx_update/ hoặc moss/) — bấm \
         'Tải bộ công cụ' trong app để tải 15 file đã pin trong components.json. \
         Không bỏ qua im lặng: đường chạy offline chính là thứ test này sinh ra để kiểm.",
        vieneu_dir.display()
    );

    let bridge = ensure_bridge_script(&m).unwrap_or_else(|e| panic!("ghi cầu nối lỗi: {e}"));

    // Thư mục tạm tự dọn khi `dir` bị drop cuối hàm — không đụng %APPDATA%.
    let dir = tempfile::tempdir().unwrap();
    let out1 = dir.path().join("cue-a.wav");
    let out2 = dir.path().join("cue-b.wav");

    // index cố tình KHÔNG liền số với vị trí trong batch (vị trí 0 -> index 5,
    // vị trí 1 -> index 2): nếu `synthesize` lỡ báo số thứ tự batch thay vì
    // `job.index` gốc, test này bắt được ngay, khác với 1/2 dễ trùng nhau.
    let jobs = vec![
        TtsJob { index: 5, text: "Xin chào, đây là cue thứ nhất.".into(), out: out1.clone(), length_scale: 1.0, voice: None },
        TtsJob { index: 2, text: "Và đây là cue thứ hai.".into(), out: out2.clone(), length_scale: 1.0, voice: None },
    ];

    let p = VieNeu {
        python: py,
        bridge,
        site_packages: sp,
        hf_home: vieneu_dir.join("cache"),
        voice: "Mai Anh".into(),
        models_dir: vieneu_dir,
        ffmpeg: models_dir().join("ffmpeg").join("ffmpeg.exe"),
    };

    let indices_bao_xong: Arc<Mutex<Vec<usize>>> = Arc::new(Mutex::new(Vec::new()));
    let ghi = Arc::clone(&indices_bao_xong);

    let t0 = std::time::Instant::now();
    let ket_qua = p.synthesize(&jobs, &mut |idx| ghi.lock().unwrap().push(idx));
    let elapsed = t0.elapsed();

    println!(
        "provider VieNeu tổng hợp 2 job trong {:.1}s (đã bao gồm nạp model)",
        elapsed.as_secs_f32()
    );

    ket_qua.unwrap_or_else(|e| panic!("synthesize lỗi: {e}"));

    assert_eq!(
        *indices_bao_xong.lock().unwrap(),
        vec![5usize, 2usize],
        "on_done phải nhận đúng job.index GỐC của cả hai job, theo đúng thứ tự đã xử lý"
    );

    for out in [&out1, &out2] {
        assert!(out.exists(), "thiếu wav đầu ra: {}", out.display());
        let info = wav::read_info(out).unwrap_or_else(|e| panic!("wav::read_info lỗi: {e}"));
        assert_eq!(
            info.sample_rate, 48_000,
            "VieNeu-TTS v3 Turbo phải ra 48kHz, đọc được {}",
            info.sample_rate
        );
    }
}
