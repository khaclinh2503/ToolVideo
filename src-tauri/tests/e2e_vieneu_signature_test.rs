//! E2E (nhẹ, không cần model): kiểm tra hàm `_kiem_tra_tham_so_ro_rang` trong
//! `vieneu_bridge.py` — hàm này khẳng định `onnx_dir`/`codec_dir` vẫn là
//! tham số CÓ TÊN tường minh trong chữ ký SDK `vieneu` đang cài, TRƯỚC khi
//! `vieneu_bridge.py` vá `OnnxV3LiteEngine.__init__` để chèn `codec_dir` cục
//! bộ. Nếu một bản `vieneu` sau đổi tên tham số, giá trị sẽ rơi vào
//! `**kwargs`/`**_kw` catch-all và bị nuốt lặng lẽ — SDK âm thầm quay lại tải
//! model qua HF Hub thay vì dùng 15 file đã pin cứng (Task 4), mà không ai
//! biết vì audio vẫn ra bình thường. Test này bắt sớm việc đó bằng cách gọi
//! đúng hàm kiểm tra thật trong cầu nối, đối chiếu chữ ký SDK thật đang cài.
//!
//! KHÔNG cần 580MB model đã pin, KHÔNG cần mạng — chỉ cần Python + site-
//! packages của Task 1/2 (`import vieneu` phải chạy được). Bỏ qua mặc định;
//! bật bằng CÙNG cổng với các E2E VieNeu khác:
//!   DVL_E2E_VIENEU=1 cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_signature_test -- --ignored --nocapture

use app_lib::config::models_dir;
use app_lib::pyenv::{python_exe, site_packages};
use std::io::Read;
use std::process::{Command, Stdio};

/// Script Python nhỏ nạp `vieneu_bridge.py` bằng `importlib` (không phải
/// `import` thường: file này không nằm trong site-packages, và không cần
/// biến nó thành package chỉ để test), rồi gọi thẳng
/// `_kiem_tra_tham_so_ro_rang` với chữ ký SDK thật đang cài. In "CHU_KY_OK"
/// và thoát 0 nếu cả hai tham số vẫn tường minh; nếu không, hàm tự `raise`
/// và tiến trình thoát khác 0 kèm thông điệp lỗi tiếng Việt trên stderr.
const SCRIPT_KIEM_TRA: &str = r#"
import importlib.util
import sys

duong_dan_cau_noi = sys.argv[1]
spec = importlib.util.spec_from_file_location("vieneu_bridge", duong_dan_cau_noi)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

from vieneu.v3turbo import V3TurboVieNeuTTS
import vieneu._v3_turbo_engine.onnx_runtime_lite as ol

m._kiem_tra_tham_so_ro_rang(V3TurboVieNeuTTS.__init__, "onnx_dir", "V3TurboVieNeuTTS")
m._kiem_tra_tham_so_ro_rang(ol.OnnxV3LiteEngine.__init__, "codec_dir", "OnnxV3LiteEngine")
print("CHU_KY_OK")
"#;

#[test]
#[ignore]
fn chu_ky_sdk_van_co_onnx_dir_va_codec_dir_tuong_minh() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để kiểm chữ ký SDK vieneu thật (yêu cầu Task 1 + Task 2 đã cài xong)"
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

    let bridge = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("python")
        .join("vieneu_bridge.py");
    assert!(bridge.exists(), "thiếu cầu nối: {}", bridge.display());

    let dir = tempfile::tempdir().unwrap();
    let script_path = dir.path().join("kiem_tra_chu_ky.py");
    std::fs::write(&script_path, SCRIPT_KIEM_TRA).unwrap();

    let mut cmd = Command::new(&py);
    cmd.arg(&script_path)
        .arg(&bridge)
        .env("PYTHONPATH", &sp)
        .env("PYTHONIOENCODING", "utf-8")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let mut child = cmd.spawn().unwrap_or_else(|e| panic!("spawn python lỗi: {e}"));

    // Đọc stderr trên luồng riêng + stdout trên luồng gọi — output ở đây rất
    // nhỏ (một dòng "CHU_KY_OK" hoặc một traceback ngắn) nên khó thực sự chạm
    // giới hạn 4KB của ống nặc danh Windows, nhưng giữ đúng khuôn hai luồng
    // song song cho nhất quán với phần còn lại của codebase (xem
    // `tts/procio.rs`) thay vì đọc tuần tự stdout-rồi-stderr — chính cái mẫu
    // đó là nguồn treo ống đã được ghi lại rõ ràng ở nơi khác trong repo này.
    let mut stderr_pipe = child.stderr.take().unwrap();
    let stderr_handle = std::thread::spawn(move || -> String {
        let mut s = String::new();
        let _ = stderr_pipe.read_to_string(&mut s);
        s
    });

    let mut stdout_s = String::new();
    let _ = child.stdout.take().unwrap().read_to_string(&mut stdout_s);

    let stderr_s = stderr_handle.join().unwrap_or_default();
    let status = child.wait().unwrap_or_else(|e| panic!("wait python lỗi: {e}"));

    assert!(
        status.success(),
        "kiểm chữ ký thất bại (mã {:?}) — SDK vieneu đang cài đã đổi chữ ký \
         `onnx_dir`/`codec_dir` thành thứ không còn tường minh, vá pin model \
         cục bộ trong vieneu_bridge.py không còn an toàn. stdout:\n{stdout_s}\nstderr:\n{stderr_s}",
        status.code()
    );
    assert!(
        stdout_s.contains("CHU_KY_OK"),
        "phải in CHU_KY_OK khi chữ ký còn tường minh, nhận stdout:\n{stdout_s}\nstderr:\n{stderr_s}"
    );
}
