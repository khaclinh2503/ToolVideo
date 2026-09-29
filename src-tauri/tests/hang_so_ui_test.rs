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

/// useEffect chạy SAU khi trình duyệt đã commit và vẽ khung hình. Nếu <video>
/// nhận src ngay từ lần render đầu (dựa vào một cờ "đã sẵn sàng" mặc định),
/// trình duyệt bắt đầu tải trước khi cho_phep_xem resolve — asset protocol từ
/// chối im lặng và src không bao giờ đổi lại để nạp lần hai. Test này giữ cho
/// <video> chỉ được vẽ SAU khi biết chắc quyền đã cấp cho đúng videoPath hiện
/// tại, không phải một cờ boolean rời có thể bị "thừa hưởng" từ dự án trước.
#[test]
fn ui_video_khong_gan_src_truoc_khi_co_quyen() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(
        tsx.contains("videoCapChoDuongDan === videoPath"),
        "phải so trực tiếp với videoPath hiện tại, không dùng cờ boolean rời dễ bị trôi qua dự án khác"
    );
    assert!(
        tsx.contains("!videoSanSang ? ("),
        "phải gate việc vẽ <video src=...> theo trạng thái đã cấp quyền cho đúng videoPath"
    );
}

/// Cùng lỗi đua với video, logo cũng convertFileSrc một file cần cho_phep_xem
/// riêng — phải đợi quyền của đúng wm.path hiện tại rồi mới vẽ <img>.
#[test]
fn ui_logo_khong_gan_src_truoc_khi_co_quyen() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(
        tsx.contains("wmCapChoDuongDan === wm.path"),
        "phải so trực tiếp với wm.path hiện tại trước khi vẽ logo"
    );
    assert!(
        tsx.contains("wmSanSang && wm?.enabled && wm.path"),
        "phải gate việc vẽ <img> logo theo trạng thái đã cấp quyền"
    );
}

/// `onResize` của <video> chỉ bắn khi videoWidth/videoHeight NỘI TẠI đổi
/// (đổi nguồn phát), không bắn khi khung HIỂN THỊ đổi cỡ — đổi cỡ cửa sổ ứng
/// dụng không kích hoạt nó. Phải dùng ResizeObserver để tỉ lệ chữ và lề logo
/// không bị tính một lần lúc nạp xong rồi trôi sai khi người dùng đổi cỡ cửa
/// sổ.
#[test]
fn ui_dung_resize_observer_chu_khong_chi_dua_vao_onresize_cua_video() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(tsx.contains("new ResizeObserver("), "phải dùng ResizeObserver để bắt khung hiển thị đổi cỡ");
    assert!(tsx.contains("ro.disconnect()"), "phải ngắt ResizeObserver khi unmount, không rò rỉ observer");
}

/// Rust tính margin logo bằng `video_w * margin_pct / 100` rồi dùng CHUNG giá
/// trị đó cho cả hai trục (export.rs, Watermark::overlay_xy). CSS % của
/// top/bottom lại quy theo chiều CAO khối chứa, không phải bề ngang — gán
/// thẳng "${marginPct}%" cho top/bottom làm lề dọc trên video 16:9 chỉ còn
/// ~0.56 lần lề thật. Phải quy ra px từ bề ngang cho cả hai trục.
#[test]
fn ui_le_logo_quy_ra_px_theo_be_ngang_ca_hai_truc() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(
        !tsx.contains("`${marginPct}%`"),
        "không được gán thẳng phần trăm cho top/bottom — % của top/bottom quy theo chiều cao, lệch so với Rust"
    );
    assert!(
        tsx.contains("(rongPx * marginPct) / 100"),
        "phải quy margin ra px theo bề ngang khung, khớp cách Rust tính margin_px"
    );
}

/// Round 1 sửa lỗi: tạm dừng video mà giọng lồng vẫn chạy tiếp trên khung
/// hình đứng yên là bug rõ nhất trong số ba lỗi review chỉ ra. Test này giữ
/// cho onPause của <video> còn dừng theo thẻ audio, onSeeked còn ÉP đồng bộ
/// lại vị trí trong audio bất kể cue có đổi hay không (tua liên tục trong
/// cùng một cue lúc căn chỉnh vẫn phải khớp lại), và onPlay còn chỉnh vị trí
/// audio theo cue hiện tại trước khi phát tiếp (video có thể đã bị tua trong
/// lúc tạm dừng) thay vì phát tiếp từ chỗ audio dừng lại trước đó.
#[test]
fn ui_video_pause_seek_play_dieu_khien_am_thanh_long_tieng() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(
        tsx.contains("onPause={() => am.current?.pause()}"),
        "onPause của <video> phải dừng theo thẻ audio lồng tiếng"
    );
    assert!(
        tsx.contains("onSeeked={(e) => dongBoTiengLong(e.currentTarget, true)}"),
        "onSeeked phải ép đồng bộ lại audio kể cả khi tua trong cùng một cue"
    );
    assert!(
        tsx.contains("onPlay={(e) => dongBoTiengLong(e.currentTarget, true)}"),
        "onPlay phải chỉnh lại vị trí audio theo cue hiện tại trước khi phát tiếp"
    );
}

/// Guard cũ chỉ so `idx === cueDangPhat.current` (số), bỏ qua audioPath — một
/// cue lồng tiếng lại (audioPath đổi, index giữ nguyên) bị bỏ qua trong lúc
/// người dùng đứng nguyên tại cue đó. Test giữ cho việc so sánh dùng CẢ HAI
/// trường (idx lẫn path) trong state đã đồng bộ.
#[test]
fn ui_dong_bo_am_thanh_so_ca_index_lan_duong_dan() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(
        tsx.contains("idx !== daDongBo.current.idx || path !== daDongBo.current.path"),
        "phải so cả index lẫn audioPath khi quyết định có đồng bộ lại audio hay không"
    );
}
