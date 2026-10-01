//! Bảng Hán-Việt làm ý kiến thứ hai.
//!
//! Mấy bài dưới đây cố tình ghim CẢ những chỗ bảng SAI, vì đó là lý do nó chỉ
//! được làm ý kiến thứ hai. Ai đọc test này phải thấy ngay giới hạn của nó chứ
//! không tưởng đây là một bảng tra chuẩn.

use app_lib::han_viet::{dong_y, doc_ten};

#[test]
fn doc_dung_nhung_ten_thuong_gap() {
    assert_eq!(doc_ten("球球").as_deref(), Some("Cầu Cầu"));
    assert_eq!(doc_ten("云庭").as_deref(), Some("Vân Đình"));
    assert_eq!(doc_ten("小花").as_deref(), Some("Tiểu Hoa"));
    assert_eq!(doc_ten("铁柱").as_deref(), Some("Thiết Trụ"));
    assert_eq!(doc_ten("灵公文").as_deref(), Some("Linh Công Văn"));
}

/// Chữ giản thể phải tra được, vì phụ đề Trung Quốc đại lục toàn giản thể còn
/// `kVietnamese` phủ phồn thể tốt hơn. Bước quy giản→phồn lúc sinh bảng thêm
/// được 1008 chữ; mất nó là mất phần lớn phụ đề thật.
#[test]
fn chu_gian_the_tra_duoc_qua_phon_the() {
    assert_eq!(doc_ten("灵").as_deref(), Some("Linh")); // 灵 giản của 靈
    assert_eq!(doc_ten("云").as_deref(), Some("Vân")); // 云 giản của 雲
}

/// Bảng là âm Nôm lẫn Hán-Việt nên có chỗ SAI cho tên người. Ghim lại để không
/// ai lỡ nâng nó lên làm chuẩn: `燕` trong tên là "Yến", bảng cho "Én".
#[test]
fn bang_doc_sai_mot_so_ten_va_do_la_ly_do_no_chi_la_y_kien_thu_hai() {
    assert_eq!(doc_ten("林燕").as_deref(), Some("Lâm Én")); // đúng phải là "Lâm Yến"
    assert_eq!(doc_ten("吴磊").as_deref(), Some("Ngô Lối")); // đúng phải là "Ngô Lỗi"
}

/// Thiếu một chữ thì im lặng, không đọc nửa vời. Đọc nửa vời rồi chêm dấu hỏi
/// vào giữa sẽ bị tưởng là một đề xuất hoàn chỉnh.
#[test]
fn thieu_mot_chu_thi_khong_doan_bua() {
    // 雨 không có trong kVietnamese, nên cả tên phải trả None.
    assert_eq!(doc_ten("小雨"), None);
}

#[test]
fn chuoi_khong_co_chu_han_thi_khong_gop_y_gi() {
    assert_eq!(doc_ten("Lâm Yến"), None);
    assert_eq!(doc_ten(""), None);
    assert_eq!(doc_ten("   "), None);
}

#[test]
fn dong_y_bo_qua_hoa_thuong_va_khoang_trang_thua() {
    assert_eq!(dong_y("球球", "Cầu Cầu"), Some(true));
    assert_eq!(dong_y("球球", "cầu  cầu"), Some(true));
    assert_eq!(dong_y("球球", "Bóng bóng"), Some(false));
    // Tra không ra là "không biết", khác hẳn "không đồng ý".
    assert_eq!(dong_y("小雨", "Tiểu Vũ"), None);
}
