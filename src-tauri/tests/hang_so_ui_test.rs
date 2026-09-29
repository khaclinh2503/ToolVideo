//! Giao diện in ra con số giới hạn ký tự cho người dùng đọc, nhưng bộ cắt thật
//! nằm bên Rust. Hai chỗ trôi khỏi nhau thì UI nói dối mà không ai biết.

#[test]
fn ui_khai_bao_dung_gioi_han_mot_dong() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let mong_doi = format!("const MAX_MOT_DONG = {};", app_lib::srt::MAX_MOT_DONG);
    assert!(
        tsx.contains(&mong_doi),
        "App.tsx phải khai báo `{mong_doi}` cho khớp srt::MAX_MOT_DONG"
    );
}

/// Bước 6 đã tách đôi. Test này giữ cho con số bước không trôi khỏi tài liệu và
/// khỏi chỗ nhảy tab tự động sau khi lồng tiếng.
#[test]
fn ui_co_bay_buoc_va_tach_phu_de_khoi_xuat() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains(r#"{ id: 6, ten: "Phụ đề & Logo" }"#), "thiếu tab 6");
    assert!(tsx.contains(r#"{ id: 7, ten: "Xuất video" }"#), "thiếu tab 7");
    assert!(tsx.contains("{tab === 7 && ("), "thiếu khối render tab 7");
}

/// Kiểu chữ không được nằm trong nhánh chỉ hiện khi tick burn-in nữa.
#[test]
fn ui_khong_con_giau_kieu_chu_sau_burn_in() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        !tsx.contains("{burnSubs && sub && ("),
        "khối kiểu chữ vẫn bị giấu sau tick burn-in"
    );
}
