//! Dịch một file SRT THẬT bằng đúng đường chạy của app, không mô phỏng.
//!
//! Bộ đo bằng Python dựng request bằng tay, nên nó chỉ chứng minh được prompt
//! chứ không chứng minh được đường chạy: cắt lô, bỏ cue rỗng, gộp dòng, chuẩn
//! hoá bản dịch, vòng đời server đều nằm ngoài tầm nó. Bài này gọi thẳng
//! `make_provider` + `translate_segments` như `pipeline.rs` gọi.
//!
//! Chạy tay (tải model rồi mới chạy được, mất vài phút):
//!   $env:DVL_E2E_DICH="1"
//!   $env:DVL_E2E_SRT="<đường dẫn source.srt>"
//!   cargo test --test e2e_dich_that_test -- --ignored --nocapture
//!
//! Tuỳ chọn: `DVL_E2E_NHA_CUNG_CAP` (mặc định `llm_tren_may`),
//! `DVL_E2E_NGU_CANH` (mặc định `phim`), `DVL_E2E_RA` (nơi ghi bản dịch).

use app_lib::config::{models_dir, TranslateConfig};
use app_lib::srt::{parse_srt, write_srt};
use app_lib::translate::{make_provider, translate_segments};

#[test]
#[ignore]
fn dich_file_srt_that_bang_duong_chay_cua_app() {
    if std::env::var("DVL_E2E_DICH").as_deref() != Ok("1") {
        eprintln!("bỏ qua: đặt DVL_E2E_DICH=1 để dịch thật");
        return;
    }
    let duong_dan = std::env::var("DVL_E2E_SRT").expect("đặt DVL_E2E_SRT=<đường dẫn .srt>");
    let goc = std::fs::read_to_string(&duong_dan).expect("không đọc được file SRT");
    let segs = parse_srt(&goc).expect("SRT hỏng");
    assert!(!segs.is_empty(), "file SRT không có cue nào");

    let mut cfg = TranslateConfig::default();
    cfg.target_lang = std::env::var("DVL_E2E_TGT").unwrap_or_else(|_| "vi".into());
    cfg.openai.context = std::env::var("DVL_E2E_NGU_CANH").unwrap_or_else(|_| "phim".into());
    let ma = std::env::var("DVL_E2E_NHA_CUNG_CAP").unwrap_or_else(|_| "llm_tren_may".into());

    let bat_dau = std::time::Instant::now();
    let p = make_provider(&ma, &cfg, &models_dir()).expect("không dựng được nhà cung cấp");
    eprintln!(
        "{}: {} cue, lô {}, nạp xong sau {:.0}s",
        p.id(),
        segs.len(),
        p.batch_size(),
        bat_dau.elapsed().as_secs_f32()
    );

    let ra = translate_segments(p.as_ref(), &segs, "auto", &cfg.target_lang).expect("dịch lỗi");
    assert_eq!(ra.len(), segs.len(), "số cue ra khác số cue vào");

    // Đúng thứ pipeline thật quan tâm: cue có chữ vào thì phải có chữ ra.
    let mut rong = Vec::new();
    for (i, (g, v)) in segs.iter().zip(&ra).enumerate() {
        if !g.text.trim().is_empty() && v.text.trim().is_empty() {
            rong.push(i + 1);
        }
    }
    assert!(rong.is_empty(), "cue có chữ nhưng bản dịch rỗng: {rong:?}");

    if let Ok(noi) = std::env::var("DVL_E2E_RA") {
        std::fs::write(&noi, write_srt(&ra)).expect("không ghi được kết quả");
        eprintln!("đã ghi {noi}");
    }
    eprintln!("xong sau {:.0}s", bat_dau.elapsed().as_secs_f32());
}
