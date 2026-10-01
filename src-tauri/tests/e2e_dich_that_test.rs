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

use app_lib::config::{models_dir, OpenAiConfig, TranslateConfig};
use app_lib::srt::{parse_srt, write_srt};
use app_lib::translate::{con_chu_dong_a, make_provider, translate_segments};

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

    let cfg = TranslateConfig {
        target_lang: std::env::var("DVL_E2E_TGT").unwrap_or_else(|_| "vi".into()),
        openai: OpenAiConfig {
            context: std::env::var("DVL_E2E_NGU_CANH").unwrap_or_else(|_| "phim".into()),
            ..Default::default()
        },
        ..Default::default()
    };
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

    // Đúng thứ pipeline thật quan tâm: LỜI NÓI không được rụng.
    //
    // Chỉ xét cue có ít nhất một chữ cái hoặc chữ số. ASR hay sinh ra cue rác
    // chỉ có dấu câu ("." cho đoạn im lặng); trả rỗng cho mấy cue đó là ĐÚNG,
    // vì `pipeline.rs` bỏ qua cue rỗng khi sinh tiếng — còn trả lại "." thì TTS
    // sẽ đi đọc một dấu chấm. Qwen trả ".", Gemma trả rỗng.
    let co_chu = |t: &str| t.chars().any(|c| c.is_alphanumeric());
    let mut rong = Vec::new();
    for (i, (g, v)) in segs.iter().zip(&ra).enumerate() {
        if co_chu(&g.text) && v.text.trim().is_empty() {
            rong.push(i + 1);
        }
    }
    assert!(rong.is_empty(), "cue có lời nhưng bản dịch rỗng: {rong:?}");

    if let Ok(noi) = std::env::var("DVL_E2E_RA") {
        std::fs::write(&noi, write_srt(&ra)).expect("không ghi được kết quả");
        eprintln!("đã ghi {noi}");
    }
    eprintln!("xong sau {:.0}s", bat_dau.elapsed().as_secs_f32());
}

/// Đo riêng đường sửa cue còn sót chữ Hán.
///
/// Đếm trên cả file thì không quy được công: mỗi lần chạy lô lớn sót ở cue
/// khác nhau, nên 2 cue xuống 1 cue có thể chỉ là nhiễu. Bài này đưa thẳng
/// những câu ĐÃ TỪNG sót vào `dich_lai_cho_tron` rồi đếm xem sửa được mấy.
///
///   $env:DVL_E2E_DICH="1"
///   cargo test --test e2e_dich_that_test sua_cue -- --ignored --nocapture
#[test]
#[ignore]
fn sua_cue_sot_chu_han_an_bao_nhieu_lan() {
    if std::env::var("DVL_E2E_DICH").as_deref() != Ok("1") {
        eprintln!("bỏ qua: đặt DVL_E2E_DICH=1 để gọi model thật");
        return;
    }
    // (câu gốc, chữ model từng bỏ lại) — lấy từ bản dịch thật của dự án 5104ff60.
    let ca_kho = [
        ("任务结束，我得请半天假，你小子拼了大象。", "半天小子"),
        ("你凭什么从小到大好的全是你的，都松手。", "凭什么"),
        ("只要还是炭机见了7.62都得急性酮中毒，担心是迁。", "酮"),
        ("妈的，你他妈给我滚。", "他妈"),
    ];

    let cfg = TranslateConfig {
        openai: OpenAiConfig { context: "phim".into(), ..Default::default() },
        ..Default::default()
    };
    let p = make_provider("llm_tren_may", &cfg, &models_dir()).expect("không dựng được");

    let mut sach = 0;
    for (goc, con_sot) in ca_kho {
        let ra = p.dich_lai_cho_tron(goc, con_sot, "auto", "vi").expect("sửa lỗi");
        let con = con_chu_dong_a(&ra);
        if !con {
            sach += 1;
        }
        eprintln!("{} {goc}{}{ra}", if con { "VẪN SÓT" } else { "SẠCH   " }, nl_ra());
        assert!(!ra.trim().is_empty(), "sửa xong mà trả về rỗng: {goc}");
        assert_ne!(ra.trim(), goc, "trả lại nguyên câu gốc, không dịch gì");
    }
    eprintln!("=> {sach}/{} câu sửa sạch", ca_kho.len());
}

fn nl_ra() -> &'static str {
    "
        -> "
}
