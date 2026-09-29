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

/// Cảnh báo "kiểu chữ chỉ áp dụng khi burn-in" là thứ duy nhất ngăn người dùng
/// tốn công chỉnh font rồi xuất phụ đề mềm (mov_text — không mang style nào)
/// mà thấy chẳng có gì đổi. Test này giữ cho cảnh báo còn tồn tại VÀ còn đúng
/// điều kiện hiện — chỉ hiện khi burn-in đang TẮT, chứ không phải ngược lại.
#[test]
fn ui_canh_bao_kieu_chu_chi_hien_khi_tat_burn_in() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("{!burnSubs && ("),
        "cảnh báo kiểu chữ phải gate theo điều kiện tắt burn-in"
    );
    assert!(
        tsx.contains("chỉ áp dụng khi bạn tick"),
        "thiếu nội dung cảnh báo kiểu chữ chỉ áp dụng khi burn-in"
    );
}

/// UI phải nói thẳng rằng bật logo là mã hoá lại video. Không burn-in thì xuất
/// dùng `-c:v copy` nên rất nhanh; có logo là mất đường đó, lâu ngang burn-in.
/// Không nói trước thì người dùng chờ 20 phút rồi mới hiểu ra.
#[test]
fn ui_canh_bao_logo_buoc_ma_hoa_lai() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains("mã hoá lại"), "thiếu cảnh báo bật logo là mã hoá lại video");
}

/// Mặc định của UI phải khớp Rust, nếu không người dùng thấy một con số mà
/// backend dùng một con số khác.
#[test]
fn ui_khai_dung_mac_dinh_watermark() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let w = app_lib::config::WatermarkConfig::default();
    assert!(tsx.contains(&format!("WM_SIZE_MAC_DINH = {}", w.size_pct)));
    assert!(tsx.contains(&format!("WM_MARGIN_MAC_DINH = {}", w.margin_pct)));
}

/// WebView2 là Chromium, không mở container Matroska. Phải nói rõ thay vì để
/// người dùng nhìn một ô đen câm lặng và tưởng app hỏng.
#[test]
fn ui_bao_ro_mkv_khong_xem_thu_duoc() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains(".mkv"), "phải nhận diện .mkv");
    assert!(tsx.contains("Xem thử phụ đề"), "phải chỉ sang nút khung hình ffmpeg");
}

/// Cỡ chữ ASS tính trên khung hình GỐC; trình phát hiện ở kích thước khác nên
/// phải quy đổi, nếu không phụ đề xem thử to nhỏ sai hẳn so với bản xuất.
#[test]
fn ui_quy_doi_co_chu_theo_ti_le_khung_hinh() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains("videoHeight"), "phải quy đổi theo videoHeight");
    assert!(tsx.contains("clientHeight"), "phải quy đổi theo clientHeight");
}

/// `Number(e.target.value) || MAC_DINH` coi 0 là falsy nên gõ "0" vào ô lề bị
/// đẩy về mặc định — lề 0 (logo sát mép) lại là giá trị hợp lệ. Giữ test này
/// để không ai lỡ quay lại lối `||` cũ ở hai ô số của khối logo.
#[test]
fn ui_watermark_khong_dung_or_de_gia_tri_mac_dinh() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        !tsx.contains("Number(e.target.value) || WM_SIZE_MAC_DINH"),
        "ô cỡ logo vẫn dùng `||`, gõ 0 sẽ bị nhảy về mặc định"
    );
    assert!(
        !tsx.contains("Number(e.target.value) || WM_MARGIN_MAC_DINH"),
        "ô lề logo vẫn dùng `||`, gõ 0 sẽ bị nhảy về mặc định"
    );
    assert!(
        tsx.contains("Number.isFinite(n)"),
        "phải dùng Number.isFinite để tách \"không phải số\" khỏi \"bằng 0\""
    );
}

/// Tiếng lồng xem thử là bản CHƯA retime — pha retime lúc xuất mới ép từng cue
/// vừa khung của nó. Không nói rõ thì người dùng nghe thấy câu chồng lên nhau
/// và tưởng bản xuất cũng hỏng.
#[test]
fn ui_noi_ro_tieng_thu_chua_retime() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains("chưa khớp khung"), "thiếu ghi chú tiếng thử chưa retime");
}
