//! Tự tìm tên riêng trên phụ đề THẬT, bằng đúng đường chạy của app.
//!
//! ```text
//! $env:DVL_E2E_DICH="1"
//! $env:DVL_E2E_SRT="<đường dẫn source.srt>"
//! cargo test --test e2e_ten_rieng_test -- --ignored --nocapture
//! ```

use app_lib::config::{models_dir, TranslateConfig};
use app_lib::han_viet;
use app_lib::srt::parse_srt;
use app_lib::translate::{gom_de_hoi_ten, make_provider};

#[test]
#[ignore]
fn tu_tim_ten_rieng_tren_phu_de_that() {
    if std::env::var("DVL_E2E_DICH").as_deref() != Ok("1") {
        eprintln!("bỏ qua: đặt DVL_E2E_DICH=1 để gọi model thật");
        return;
    }
    let duong_dan = std::env::var("DVL_E2E_SRT").expect("đặt DVL_E2E_SRT=<đường dẫn .srt>");
    let goc = std::fs::read_to_string(&duong_dan).expect("đọc được SRT");
    let segs = parse_srt(&goc).expect("SRT hỏng");

    let van_ban = gom_de_hoi_ten(&segs);
    eprintln!(
        "{} cue -> {} ký tự gửi đi hỏi",
        segs.len(),
        van_ban.chars().count()
    );

    let ma = std::env::var("DVL_E2E_NHA_CUNG_CAP").unwrap_or_else(|_| "llm_tren_may".into());
    let p = make_provider(&ma, &TranslateConfig::default(), &models_dir()).expect("dựng provider");

    let bat_dau = std::time::Instant::now();
    let ds = p.liet_ke_ten_rieng(&van_ban).expect("liệt kê tên riêng");
    eprintln!("{} tên, {:.0}s", ds.len(), bat_dau.elapsed().as_secs_f32());
    for t in &ds {
        let bang = han_viet::doc_ten(&t.goc).unwrap_or_else(|| "—".into());
        let dau = match han_viet::dong_y(&t.goc, &t.dich) {
            Some(false) => "ĐÁNG NGỜ",
            Some(true) => "khớp    ",
            None => "bảng im ",
        };
        eprintln!("  {dau} {:12} -> {:20} (bảng: {bang}) [{}]", t.goc, t.dich, t.loai);
    }

    // DVL_E2E_GHI_SO=1 đổ thẳng vào sổ tay của dự án, đúng như người dùng bấm
    // "Thêm vào sổ" mà không sửa gì — kịch bản mặc định, không phải kịch bản đẹp.
    if std::env::var("DVL_E2E_GHI_SO").as_deref() == Ok("1") {
        let dir = std::path::Path::new(&duong_dan)
            .parent()
            .and_then(|p| p.parent())
            .expect("suy ra được thư mục dự án");
        let so = app_lib::so_tay::SoTay {
            version: 1,
            muc: ds
                .iter()
                .map(|t| app_lib::so_tay::Muc {
                    goc: t.goc.clone(),
                    dich: t.dich.clone(),
                    ghi_chu: t.loai.clone(),
                })
                .collect(),
        };
        app_lib::so_tay::ghi(dir, &so).expect("ghi được sổ tay");
        eprintln!("đã ghi {} mục vào {}", so.muc.len(), app_lib::so_tay::duong_dan(dir).display());
    }

    assert!(!ds.is_empty(), "phim có tên riêng mà không tìm được cái nào");
    // Mục rỗng lọt vào sổ sẽ khớp MỌI câu rồi kéo cả sổ vào prompt của mọi lô.
    for t in &ds {
        assert!(!t.goc.trim().is_empty(), "có mục goc rỗng");
        assert!(!t.dich.trim().is_empty(), "có mục dich rỗng: {}", t.goc);
    }
}
