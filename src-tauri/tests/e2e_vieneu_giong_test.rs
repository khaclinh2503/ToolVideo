//! E2E: 25 tên giọng trong `vieneu::VOICES` phải đúng bằng thứ SDK chấp nhận.
//!
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_VIENEU="1"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_giong_test -- --ignored --nocapture
//!
//! Vì sao cần: bảng `VOICES` là hằng số Rust, còn thứ engine chấp nhận nằm
//! trong SDK Python. Hai bên lệch nhau thì test đơn vị vẫn xanh (nó chỉ soi
//! chính bảng đó), và lỗi chỉ lộ ra khi người dùng chọn đúng giọng sai —
//! `Voice '...' not found` giữa lúc lồng tiếng. Đã gặp thật một lần với id
//! dạng slug (`mai_anh`) lấy nhầm từ `gguf/voices/manifest.json`.
//!
//! Test này KHÔNG tổng hợp gì: chỉ nạp SDK và gọi `resolve_voice_name`.

use app_lib::config::models_dir;
use app_lib::tts::vieneu::VOICES;
use std::io::Write;
use std::process::Command;

#[test]
#[ignore]
fn moi_ten_giong_deu_duoc_sdk_chap_nhan() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy SDK thật"
    );

    let m = models_dir();
    let python = m.join("python").join("python.exe");
    let site = m.join("vieneu").join("site-packages");
    let hf = m.join("vieneu").join("cache");
    if !python.exists() || !site.join("vieneu").exists() {
        eprintln!("bỏ qua: chưa cài python/vieneu ở {}", m.display());
        return;
    }

    let d = tempfile::tempdir().unwrap();
    let ten_file = d.path().join("ten.txt");
    let mut f = std::fs::File::create(&ten_file).unwrap();
    for v in VOICES {
        writeln!(f, "{}", v.ten).unwrap();
    }
    drop(f);

    // In ra một dòng "OK" nếu mọi tên resolve được VÀ tập tên hai bên trùng
    // khít; ngược lại in "LECH:" kèm chi tiết.
    let script = r#"
import io, os, sys
os.environ.setdefault("HF_HOME", sys.argv[2])
sys.path.insert(0, sys.argv[3])
from vieneu import Vieneu
ten = [l.strip() for l in io.open(sys.argv[1], encoding="utf-8") if l.strip()]
tts = Vieneu(backend="onnx")
sdk = [v[1] for v in tts.list_preset_voices()]
hong = [t for t in ten if tts.resolve_voice_name(t) is None]
thieu = [t for t in sdk if t not in ten]
thua = [t for t in ten if t not in sdk]
if hong or thieu or thua:
    print("LECH: hong=%r thieu=%r thua=%r" % (hong, thieu, thua))
else:
    print("OK %d" % len(ten))
"#;

    let out = Command::new(&python)
        .args(["-c", script])
        .arg(&ten_file)
        .arg(&hf)
        .arg(&site)
        .env("PYTHONIOENCODING", "utf-8")
        .output()
        .expect("chạy được python");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    println!("python: {}", stdout.trim());
    assert!(
        out.status.success(),
        "python lỗi: {stderr}"
    );
    assert!(
        stdout.contains(&format!("OK {}", VOICES.len())),
        "bảng VOICES lệch với SDK: {stdout}\n{stderr}"
    );
}
