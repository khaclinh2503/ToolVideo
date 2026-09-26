//! E2E: đổi giọng phải THẬT SỰ ra audio khác.
//!
//! Bỏ qua mặc định; bật bằng:
//!   $env:DVL_E2E_VIENEU="1"
//!   cargo test --manifest-path src-tauri/Cargo.toml --test e2e_vieneu_doi_giong_test -- --ignored --nocapture
//!
//! Vì sao cần: `vieneu_test.rs` chỉ khẳng định dòng JSON có mang khoá `voice`
//! — tức khẳng định thứ ta GỬI ĐI, không khẳng định thứ engine LÀM với nó.
//! Đó đúng là chỗ mù đã để `--length_scale` của Piper thành no-op suốt từ M3
//! tới khi phát hiện ở M6: test đơn vị xanh, engine phớt lờ tham số, không ai
//! biết. Test này đóng đúng chỗ mù đó cho tham số `voice`.

use app_lib::config::models_dir;
use app_lib::tts::{vieneu::VieNeu, TtsJob, TtsProvider};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};

fn sha256(p: &Path) -> String {
    format!("{:x}", Sha256::digest(std::fs::read(p).unwrap()))
}

fn provider(models: &Path, giong: &str) -> VieNeu {
    VieNeu {
        python: models.join("python").join("python.exe"),
        bridge: app_lib::tts::vieneu::ensure_bridge_script(models).unwrap(),
        site_packages: app_lib::pyenv::site_packages(models),
        hf_home: models.join("vieneu").join("cache"),
        voice: giong.to_string(),
        models_dir: models.join("vieneu"),
        ffmpeg: models.join("ffmpeg").join("ffmpeg.exe"),
    }
}

fn job(index: usize, out: PathBuf) -> TtsJob {
    TtsJob {
        index,
        text: "Xin chào, đây là câu kiểm tra đổi giọng.".into(),
        out,
        length_scale: 1.0,
    }
}

#[test]
#[ignore]
fn hai_giong_khac_nhau_cho_ra_audio_khac_nhau() {
    assert_eq!(
        std::env::var("DVL_E2E_VIENEU").as_deref(),
        Ok("1"),
        "đặt DVL_E2E_VIENEU=1 để chạy engine thật"
    );

    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu ở {}", m.display());
        return;
    }

    let d = tempfile::tempdir().unwrap();
    let a = d.path().join("nu.wav");
    let b = d.path().join("nam.wav");

    // Hai giọng KHÁC GIỚI cho khác biệt rõ nhất. Không dùng "Mạnh Dũng" —
    // giọng đó nằm trong manifest GGUF trên HuggingFace nhưng KHÔNG có trong
    // SDK ONNX/Python mà app dùng.
    provider(&m, "Mai Anh")
        .synthesize(&[job(1, a.clone())], &mut |_| {})
        .expect("tổng hợp giọng nữ phải chạy được");
    provider(&m, "Hải Đăng")
        .synthesize(&[job(1, b.clone())], &mut |_| {})
        .expect("tổng hợp giọng nam phải chạy được");

    let ha = sha256(&a);
    let hb = sha256(&b);
    let da = app_lib::wav::duration_ms(&a).unwrap();
    let db = app_lib::wav::duration_ms(&b).unwrap();
    println!("Mai Anh: {da} ms, sha {}…", &ha[..12]);
    println!("Hải Đăng: {db} ms, sha {}…", &hb[..12]);

    // ĐÂY là khẳng định quan trọng: nếu engine bỏ qua tham số `voice` thì hai
    // file sẽ giống hệt nhau và test đỏ.
    assert_ne!(ha, hb, "đổi giọng mà audio y hệt ⇒ engine đang bỏ qua tham số voice");

    // Cả hai phải là audio thật, không phải file rỗng.
    assert!(da > 500, "giọng nữ quá ngắn: {da} ms");
    assert!(db > 500, "giọng nam quá ngắn: {db} ms");

    // Tần số phải đúng 48 kHz — compose.rs so tần số từng wav với manifest.
    for p in [&a, &b] {
        assert_eq!(
            app_lib::wav::read_info(p).unwrap().sample_rate,
            48_000,
            "{} phải là 48 kHz",
            p.display()
        );
    }
}

#[test]
#[ignore]
fn giong_khong_ton_tai_thi_bao_loi_chu_khong_doc_bang_giong_khac() {
    assert_eq!(std::env::var("DVL_E2E_VIENEU").as_deref(), Ok("1"));
    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu");
        return;
    }

    let d = tempfile::tempdir().unwrap();
    // `mai_anh` là id dạng slug lấy nhầm từ gguf/voices/manifest.json — SDK
    // không nhận. Phải BÁO LỖI chứ không được lặng lẽ rơi về giọng mặc định:
    // người dùng chọn một giọng rồi nghe ra giọng khác là kiểu hỏng tệ nhất.
    let err = provider(&m, "mai_anh")
        .synthesize(&[job(1, d.path().join("x.wav"))], &mut |_| {})
        .unwrap_err();
    println!("lỗi nhận được: {err}");
    assert_eq!(err.code(), "engine_failed", "nhận: {err}");
}

#[test]
#[ignore]
fn synthesize_that_su_ep_toc_do_chu_khong_chi_sinh_roi_bo_qua() {
    // Lỗ hổng I2 của review tổng: xoá hẳn vòng `ep_toc_do` trong `synthesize`
    // thì TOÀN BỘ test đơn vị vẫn xanh, vì không cái nào đi qua `synthesize`
    // với `length_scale != 1.0`. Đúng chỗ mù đã để `--length_scale` của Piper
    // thành no-op suốt từ M3. Test này là lưới cho chính `synthesize`.
    assert_eq!(std::env::var("DVL_E2E_VIENEU").as_deref(), Ok("1"));
    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu");
        return;
    }

    let d = tempfile::tempdir().unwrap();
    let thuong = d.path().join("thuong.wav");
    let nhanh = d.path().join("nhanh.wav");

    let p = provider(&m, "Mai Anh");
    let mut j1 = job(1, thuong.clone());
    j1.length_scale = 1.0;
    p.synthesize(&[j1], &mut |_| {}).expect("tốc độ thường");

    let mut j2 = job(2, nhanh.clone());
    j2.length_scale = 0.6;
    p.synthesize(&[j2], &mut |_| {}).expect("tốc độ nhanh");

    let d1 = app_lib::wav::duration_ms(&thuong).unwrap();
    let d2 = app_lib::wav::duration_ms(&nhanh).unwrap();
    let ti_le = d2 as f64 / d1 as f64;
    println!("1.0 ⇒ {d1} ms | 0.6 ⇒ {d2} ms | tỉ lệ {ti_le:.3}");

    // Ngưỡng 0.8 chứ không phải 0.6: VieNeu lấy mẫu ngẫu nhiên (temperature
    // 0.8, không seed) nên hai lượt sinh cùng văn bản đã khác nhau sẵn vài
    // phần trăm. 0.8 nằm giữa "có ép" (≈0.6) và "không ép" (≈1.0 ± nhiễu).
    assert!(
        ti_le < 0.8,
        "synthesize không ép tốc độ: 0.6 mà tỉ lệ vẫn {ti_le:.3}"
    );
}

#[test]
#[ignore]
fn doi_toc_do_lan_hai_khong_sinh_lai_va_cho_ket_qua_xac_dinh() {
    // I8 của review tổng: pha retime đổi `length_scale` ⇒ cue bị SINH LẠI, mà
    // VieNeu lấy mẫu ngẫu nhiên. Đo thật: cùng câu, cùng giọng, 4 lượt cho
    // 4400/4160/4160/4480 ms — chênh 7.7%. `fit_scale` đo một dạng sóng rồi áp
    // hệ số lên dạng sóng khác ⇒ cue "đã khớp" vẫn tràn.
    //
    // Nay provider giữ bản gốc tốc độ tự nhiên và chỉ chạy lại `atempo`, nên
    // lần hai phải XÁC ĐỊNH: đúng tỉ lệ, và nhanh vì không nạp model.
    assert_eq!(std::env::var("DVL_E2E_VIENEU").as_deref(), Ok("1"));
    let m = models_dir();
    if !m.join("python").join("python.exe").exists()
        || !app_lib::pyenv::site_packages(&m).join("vieneu").exists()
    {
        eprintln!("bỏ qua: chưa cài python/vieneu");
        return;
    }

    let d = tempfile::tempdir().unwrap();
    let f = d.path().join("cue-0001.wav");
    let p = provider(&m, "Mai Anh");

    // Lượt một: tốc độ tự nhiên, có sinh thật.
    let mut j = job(1, f.clone());
    j.length_scale = 1.0;
    let t0 = std::time::Instant::now();
    p.synthesize(&[j], &mut |_| {}).expect("lượt một");
    let giay_sinh = t0.elapsed().as_secs_f32();
    let goc_ms = app_lib::wav::duration_ms(&f).unwrap();

    // Lượt hai: CÙNG văn bản, CÙNG giọng, chỉ đổi tốc độ — đúng thứ pha retime làm.
    let mut j2 = job(1, f.clone());
    j2.length_scale = 0.6;
    let t1 = std::time::Instant::now();
    p.synthesize(&[j2], &mut |_| {}).expect("lượt hai");
    let giay_ep = t1.elapsed().as_secs_f32();
    let ep_ms = app_lib::wav::duration_ms(&f).unwrap();

    let ti_le = ep_ms as f64 / goc_ms as f64;
    println!("gốc {goc_ms} ms ({giay_sinh:.1}s) → ép {ep_ms} ms ({giay_ep:.1}s) | tỉ lệ {ti_le:.4}");

    // XÁC ĐỊNH: ép từ đúng dạng sóng đã đo nên tỉ lệ phải sát 0.6, không phải
    // "0.6 cộng trừ 7.7% vì sinh lại".
    assert!(
        (ti_le - 0.6).abs() < 0.03,
        "tỉ lệ phải xác định quanh 0.6, nhận {ti_le:.4} — có phải đang sinh lại không?"
    );

    // Và phải NHANH vì không nạp model: nạp model đo được ~9 giây.
    assert!(
        giay_ep < giay_sinh / 2.0,
        "lượt ép phải nhanh hơn hẳn lượt sinh ({giay_ep:.1}s so với {giay_sinh:.1}s) — nghi là vẫn spawn Python"
    );
}
