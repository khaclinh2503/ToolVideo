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

/// Hệ quy chiếu của `FontSize` KHÔNG phải khung hình gốc. ffmpeg chuyển SRT
/// sang ASS trước khi đưa cho libass, và header nó sinh ra ghi cứng
/// `PlayResY: 288` bất kể video to nhỏ ra sao; libass vẽ trong lưới đó rồi
/// phóng cả khung lên. Đo thật (ffmpeg 9.0.2, `FontSize=24,Outline=0` trên nền
/// đen): cao chữ "H" là 19 / 39 / 57 / 115 px ở 360p / 720p / 1080p / 4K.
///
/// Bản đầu tiên quy đổi theo `clientHeight / videoHeight` nên vẽ nhỏ hơn bản
/// xuất 3.75 lần trên 1080p và 7.5 lần trên 4K — không một test nào bắt được,
/// vì con số 288 chỉ nằm trong đầu người viết. Test này đưa nó ra thành hằng số
/// chung và ghim hai bên lại.
#[test]
fn ui_quy_doi_co_chu_theo_he_quy_chieu_ass() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    let mong_doi = format!("const ASS_PLAY_RES_Y = {};", app_lib::export::ASS_PLAY_RES_Y);
    assert!(
        tsx.contains(&mong_doi),
        "XemThu.tsx phải khai `{mong_doi}` cho khớp export::ASS_PLAY_RES_Y"
    );
    assert!(
        tsx.contains("v.clientHeight / ASS_PLAY_RES_Y"),
        "phải quy cỡ chữ theo lưới ASS cao {}, không theo videoHeight",
        app_lib::export::ASS_PLAY_RES_Y
    );
    assert!(
        !tsx.contains("v.clientHeight / v.videoHeight"),
        "quay lại quy đổi theo videoHeight là vẽ nhỏ hơn bản xuất 3.75 lần trên 1080p"
    );
    // Viền có ĐÚNG CÙNG lỗi và phải được sửa cùng chỗ.
    assert!(
        tsx.contains("sub.outline * tiLe"),
        "độ dày viền cũng phải quy theo cùng hệ số lưới ASS"
    );
    assert!(
        tsx.contains("sub.size * tiLe * ASS_EM_TREN_FONTSIZE"),
        "cỡ chữ phải nhân thêm hệ số ascent+descent → ô em của CSS"
    );
}

/// `MarginV=10` trong lưới `PlayResY=288` đặt đáy descender cách đáy khung
/// 10/288 ≈ 3.47% chiều cao khung. Đo thật: 3.33% ở 360p, 3.43% ở 1080p. Con số
/// `bottom: 8%` trước đây đẩy phụ đề xem thử lên cao hơn bản xuất gấp đôi. Giữ
/// cho CSS còn suy ra từ hai hằng số Rust chứ không phải một số gõ tay.
#[test]
fn css_dat_phu_de_theo_margin_v_cua_libass() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    assert!(
        css.contains(&format!("--ass-play-res-y: {};", app_lib::export::ASS_PLAY_RES_Y)),
        "App.css phải khai --ass-play-res-y cho khớp export::ASS_PLAY_RES_Y"
    );
    assert!(
        css.contains(&format!("--ass-margin-v: {};", app_lib::export::ASS_MARGIN_V)),
        "App.css phải khai --ass-margin-v cho khớp export::ASS_MARGIN_V"
    );
    assert!(
        css.contains("bottom: calc(100% * var(--ass-margin-v) / var(--ass-play-res-y));"),
        "vị trí đáy phụ đề phải tính từ hai biến trên, không gõ sẵn một con số"
    );
    assert!(
        !css.contains("bottom: 8%"),
        "bottom: 8% là con số sai cũ, cao hơn bản xuất hơn gấp đôi"
    );
}

/// `line-height: 0` trên `.xem-thu` (dùng để khử khe trắng dưới thẻ <video>
/// inline) DI TRUYỀN xuống mọi con cháu: đoạn ghi chú "chưa khớp khung" đặt
/// trong khối đó bị ép mỗi dòng cao 0 và các dòng chồng đè lên nhau, không đọc
/// nổi. Mà đúng câu đó mới là thứ ngăn người dùng nghe tiếng thử chồng nhau rồi
/// kết luận bản lồng tiếng hỏng.
///
/// Thêm nữa, chiều cao của `.xem-thu` là hệ quy chiếu cho `bottom:` của logo và
/// phụ đề, nên một đoạn <p> nằm trong đó còn đẩy cả hai lớp phủ lên khỏi mặt
/// video. Vì vậy sửa ở CẢ HAI chỗ: khử khe bằng `display: block` trên thẻ
/// video, và đưa ghi chú ra ngoài khối định vị.
#[test]
fn ui_ghi_chu_tieng_thu_khong_nam_trong_khoi_dinh_vi() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    let khoi_video = css
        .split(".xem-thu video {")
        .nth(1)
        .and_then(|s| s.split('}').next())
        .expect("phải có quy tắc .xem-thu video");
    assert!(
        khoi_video.contains("display: block;"),
        ".xem-thu video phải dùng display: block để khử khe trắng dưới video inline"
    );
    let khoi = css
        .split(".xem-thu {")
        .nth(1)
        .and_then(|s| s.split('}').next())
        .expect("phải có quy tắc .xem-thu");
    assert!(
        !khoi.contains("line-height: 0"),
        ".xem-thu không được đặt line-height: 0 — nó di truyền và bóp chết đoạn ghi chú"
    );

    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    let sau_khoi = tsx
        .split(r#"<div className="xem-thu">"#)
        .nth(1)
        .expect("phải có khối .xem-thu");
    let truoc_ghi_chu = sau_khoi
        .split("chưa khớp khung")
        .next()
        .expect("phải còn ghi chú tiếng thử");
    assert!(
        truoc_ghi_chu.contains("</div>"),
        "ghi chú tiếng thử phải nằm NGOÀI <div className=\"xem-thu\"> \
         (trong đó thì line-height bóp chết chữ và <p> đẩy lớp phủ lên khỏi video)"
    );
    assert!(
        truoc_ghi_chu.contains("<audio ref={am} />"),
        "thẻ <audio> cũng ra ngoài khối định vị cùng ghi chú"
    );
}

/// `run_export` đọc kiểu chữ và logo từ ĐĨA qua `load_config()`, không nhận qua
/// tham số. Nếu việc lưu chỉ trông vào một cái nút thì người dùng chỉnh font,
/// thấy trình phát đổi ngay trước mắt, sang Bước 7 bấm Xuất — và nhận về bản
/// với kiểu chữ CŨ, không một lời cảnh báo, sau khi đã chờ hết một lượt mã hoá.
/// (Nút "Lưu cấu hình" của Bước 6 còn từng nằm trong nhánh `wm.enabled`, nên ai
/// không bật logo thì không có chỗ nào để lưu.)
#[test]
fn ui_xuat_video_tu_luu_cau_hinh_truoc() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let than = tsx
        .split("async function onExport()")
        .nth(1)
        .and_then(|s| s.split("async function ").next())
        .expect("phải có onExport");
    assert!(
        than.contains(r#"invoke("save_config", { cfg })"#),
        "onExport phải tự lưu cấu hình trước khi gọi run_export"
    );
    // So theo LỜI GỌI thật, không so theo chữ "run_export" xuất hiện đầu tiên —
    // nó còn nằm trong chú thích ngay phía trên.
    let vi_tri_luu = than
        .find(r#"invoke("save_config", { cfg })"#)
        .expect("có lời gọi save_config");
    let vi_tri_xuat = than
        .find(r#"invoke<ExportResultDto>("run_export""#)
        .expect("có lời gọi run_export");
    assert!(
        vi_tri_luu < vi_tri_xuat,
        "phải lưu TRƯỚC khi gọi run_export, không phải sau"
    );
}

/// `max` trên <input type="number"> chỉ chặn nút mũi tên, không chặn gõ tay.
/// Rust kẹp lại trong `Watermark::moi`, nên gõ 150 làm TRÌNH PHÁT vẽ logo rộng
/// gấp rưỡi khung trong khi bản xuất ra 100% — lớp xem thử nói dối đúng cái
/// việc nó sinh ra để làm.
#[test]
fn ui_kep_tran_o_so_logo_khop_voi_rust() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains("const WM_SIZE_MAX = 100;"), "thiếu hằng trần cỡ logo");
    assert!(tsx.contains("const WM_MARGIN_MAX = 40;"), "thiếu hằng trần lề logo");
    assert!(
        tsx.contains("Math.min(WM_SIZE_MAX, Math.max(1, n))"),
        "ô cỡ logo phải kẹp cả trần lẫn sàn"
    );
    assert!(
        tsx.contains("Math.min(WM_MARGIN_MAX, Math.max(0, n))"),
        "ô lề logo phải kẹp cả trần lẫn sàn"
    );
    // Trần của UI phải là trần THẬT bên Rust, không phải một con số tự chọn.
    let w = app_lib::export::Watermark::moi("br", 1000, 999, 999, 1.0);
    assert_eq!(w.logo_w_px, 1000, "Rust vẫn kẹp size_pct về 100");
    assert_eq!(w.margin_px, 400, "Rust vẫn kẹp margin_pct về 40");
}

/// Theo WHATWG, thuật toán tua bắn "timeupdate" RỒI mới tới "seeked" — ngược
/// với chú thích cũ ở đây. Kết luận của code vẫn đúng nhưng vì lý do khác
/// (`tMs` trong closure là giá trị của lần render cũ, bất kể thứ tự sự kiện).
/// Quy ước chú thích của repo này là "giải thích VÌ SAO, và đúng"; một chú
/// thích sai là một khiếm khuyết.
#[test]
fn ui_khong_con_chu_thich_sai_ve_thu_tu_seeked_timeupdate() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    assert!(
        !tsx.contains(r#""seeked" bắn TRƯỚC "timeupdate""#),
        "chú thích nói seeked bắn trước timeupdate là sai theo WHATWG"
    );
    assert!(
        tsx.contains(r#"bắn "timeupdate" RỒI mới tới "seeked""#),
        "phải ghi đúng thứ tự sự kiện theo WHATWG"
    );
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

/// `document.fonts.check()` KHÔNG dùng được để phát hiện font thiếu trong
/// WebView2 (Chromium): đã đo thật bằng Chrome/Edge headless (cùng lõi
/// Chromium) — `document.fonts.check('16px "TenBiaKhongCoThat123"')` vẫn trả
/// `true` cho một tên bịa hoàn toàn, tức API này không phân biệt được font
/// thật với font không tồn tại trên máy. Test này giữ cho UI dùng kỹ thuật đo
/// bề rộng (`measureText` so với một phông "lính canh") thay vì tin nhầm vào
/// `document.fonts.check`.
#[test]
fn ui_kiem_font_bang_do_be_rong_khong_dua_vao_document_fonts_check() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("measureText"),
        "phải kiểm font có tồn tại hay không bằng đo bề rộng canvas (measureText)"
    );
    assert!(
        !tsx.contains("document.fonts.check"),
        "document.fonts.check() luôn trả true trong WebView2 kể cả với tên bịa — đã đo thật, không dùng được"
    );
}

/// Kiểm font tra ngay mỗi phím gõ sẽ báo sai suốt lúc người dùng đang gõ dở
/// một tiền tố của font thật (vd "Aria" giữa chừng gõ "Arial") — bản thân
/// "Aria" không phải tên font nào cả nên kỹ thuật đo bề rộng báo "thiếu" ĐÚNG
/// về mặt kỹ thuật, nhưng đúng-quá-sớm còn tệ hơn không báo. Phải chờ người
/// dùng ngừng gõ (debounce) rồi mới kiểm và hiện cảnh báo.
#[test]
fn ui_canh_bao_font_thieu_cho_nguoi_dung_ngung_go_moi_kiem() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("window.setTimeout") && tsx.contains("window.clearTimeout"),
        "phải debounce việc kiểm font bằng setTimeout/clearTimeout, không kiểm ngay mỗi phím gõ"
    );
}

/// Font gõ vào không có trên máy thì WebView2 (bản xem thử) và ffmpeg/libass
/// (bản xuất) MỖI NƠI TỰ CHỌN một font thay thế khác nhau, không ai báo cho
/// người dùng biết — cùng kiểu hỏng-câm-lặng đã có tiền lệ với vụ asset-scope
/// ở lib.rs. Test giữ cho cảnh báo nói thẳng hai bên thay thế khác nhau, theo
/// đúng style cảnh báo `.warn` đã có sẵn trong panel này (chỉ hiện khi font
/// thật sự thiếu, không phải cảnh báo tĩnh luôn hiện).
#[test]
fn ui_canh_bao_font_thieu_noi_ro_hai_ben_the_font_khac_nhau() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("{fontThieu && ("),
        "cảnh báo font thiếu phải gate theo state fontThieu, chỉ hiện khi thật sự thiếu"
    );
    assert!(
        tsx.contains("font thay thế") && tsx.contains("KHÁC NHAU"),
        "cảnh báo phải nói rõ trình xem thử và bản xuất dùng font thay thế khác nhau"
    );
}

/// Ô rỗng (chưa gõ gì) không phải là "font thiếu" — không được ăn cảnh báo
/// ngay khi người dùng xoá trắng ô để gõ lại từ đầu.
#[test]
fn ui_font_rong_khong_bi_bao_thieu() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("if (!sach) return true;") || tsx.contains("if (!ten.trim()) return true;"),
        "ô font rỗng phải được coi là chưa có gì để báo thiếu, không phải font thiếu"
    );
}

/// Đã đo thật bằng Edge headless (cùng lõi Chromium với WebView2): trên máy
/// dựng bản này, generic `monospace` map ra đúng "Consolas" — một font có
/// thật, cài sẵn trên Windows. Chỉ so với MỘT lính canh `monospace` thì gõ
/// đúng "Consolas" cho ra bề rộng bằng khớp lính canh (vì đó chính là font mà
/// `monospace` trỏ tới), nên hàm báo "thiếu" một font đang cài thật trên máy.
/// Phải so với HAI lính canh không liên quan (`monospace` VÀ `sans-serif`) —
/// coi là "có" nếu khác với MỘT TRONG HAI — vì hai keyword đó hiếm khi trỏ
/// cùng một font vật lý.
#[test]
fn ui_kiem_font_so_hai_linh_canh_khong_chi_mot() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains(r#""sans-serif""#),
        "phải có lính canh thứ hai sans-serif, không chỉ mỗi monospace"
    );
    assert!(
        tsx.contains("!== linh1") && tsx.contains("!== linh2"),
        "phải so bề rộng với CẢ HAI lính canh"
    );
    assert!(
        tsx.contains("co1 !== linh1 || co2 !== linh2"),
        "coi font là có thật nếu khác lính canh này HOẶC lính canh kia — chỉ cần một trong hai đủ"
    );
}

/// Đã đo thật: một tên font kết thúc bằng backslash lẻ (vd người dùng gõ nhầm
/// `Foo\`) làm dấu backslash đó "ăn" luôn dấu nháy đôi mà code chèn vào để
/// đóng chuỗi CSS, gộp cả phần lính canh phía sau vào MỘT family duy nhất.
/// `ctx.font` vẫn gán "thành công" (không phải no-op) nhưng rơi vào font mặc
/// định của canvas — bề rộng đó khác CẢ HAI lính canh, nên hàm báo "có thật"
/// cho một tên chưa từng tồn tại. Phải thoát backslash thành `\\` TRƯỚC khi
/// thoát dấu nháy đôi (đúng thứ tự escape chuỗi CSS) để tên đó quay lại đúng
/// nghĩa một chuỗi ký tự thường, không phá cấu trúc `family, lính-canh`.
#[test]
fn ui_kiem_font_thoat_backslash_truoc_khi_thoat_dau_nhay() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let vi_tri_backslash = tsx
        .find(r#"replace(/\\/g, "\\\\")"#)
        .expect("phải thoát backslash thành \\\\ trước khi ghép vào font shorthand");
    let vi_tri_quote = tsx
        .find(r#"replace(/"/g, '\\"')"#)
        .expect("phải thoát dấu nháy đôi thành \\\" (escape CSS thật, không đổi thành dấu nháy đơn)");
    assert!(
        vi_tri_backslash < vi_tri_quote,
        "phải thoát backslash TRƯỚC dấu nháy đôi — ngược lại sẽ thoát luôn backslash mới sinh ra từ bước thoát dấu nháy"
    );
}

/// Mã nhà cung cấp trên giao diện phải khớp Rust; lệch là người dùng chọn xong
/// và nhận "provider chưa hỗ trợ".
#[test]
fn ui_khai_dung_ma_llm_tren_may() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let ma = app_lib::translate::llm_tren_may::ID;
    assert!(
        tsx.contains(&format!("value=\"{ma}\"")),
        "App.tsx phải có <option value=\"{ma}\">"
    );
}

/// Người dùng phải biết lần dịch đầu chờ lâu hơn vì nạp model, nếu không họ
/// tưởng app treo và bấm lại.
#[test]
fn ui_noi_ro_lan_dau_phai_nap_model() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains("nạp model"), "thiếu ghi chú lần đầu phải nạp model");
}

/// Con số dung lượng trên banner là lời hứa với người dùng: họ đọc nó rồi quyết
/// định bấm "Tải bộ công cụ" bây giờ hay để lúc khác. M9 thêm ~8,3 GB
/// (llama.cpp + Gemma-3-12B) nên "570 MB" cũ biến một lần tải hàng giờ thành một
/// bất ngờ khó chịu. Chốt con số vào `components.json` để nó không trôi lần nữa.
#[test]
fn ui_noi_dung_luong_bo_cong_cu_khop_components_json() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let nut = tsx
        .find("Tải bộ công cụ")
        .expect("phải có nút tải bộ công cụ");
    let sau_nut = &tsx[nut..];
    let i = sau_nut
        .find("khoảng ")
        .expect("banner phải nói rõ khoảng bao nhiêu dung lượng");
    let sau = &sau_nut[i + "khoảng ".len()..];
    let so: String = sau
        .chars()
        .take_while(|c| c.is_ascii_digit() || *c == ',' || *c == '.')
        .collect();
    assert!(
        sau[so.len()..].trim_start().starts_with("GB"),
        "dung lượng bộ công cụ giờ phải tính bằng GB, đang là: {}",
        &sau[..40.min(sau.len())]
    );
    let ui: f64 = so.replace(',', ".").parse().expect("đọc được con số trên banner");

    let tong: u64 = app_lib::components::specs()
        .expect("đọc được components.json")
        .iter()
        .map(|c| c.size)
        .sum();
    // GiB, vì đó là đơn vị thanh tiến trình của app và của Windows.
    let that = tong as f64 / 1024.0 / 1024.0 / 1024.0;
    assert!(
        (ui - that).abs() < 1.0,
        "banner nói {ui} GB nhưng components.json cộng lại là {that:.1} GB"
    );
}

/// Người dùng phải biết vì sao lần dịch đầu chờ lâu VÀ rằng server tự tắt sau
/// đó — nếu không họ tưởng app treo, hoặc tưởng 11 GB VRAM bị giữ mãi.
///
/// Bắt một mẩu chỉ có trong ghi chú của `llm_tren_may`: "nạp model" một mình
/// còn khớp cả ghi chú của bước lồng tiếng, nên xoá hẳn ghi chú này mà bộ kiểm
/// vẫn xanh.
#[test]
fn ui_ghi_chu_llm_tren_may_noi_ro_tu_tat_tra_vram() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("trả lại VRAM"),
        "thiếu ghi chú rằng dịch xong là tự tắt để trả lại VRAM"
    );
}

/// Ngữ cảnh đi thẳng vào prompt hệ thống và `make_provider` truyền nó cho CẢ
/// `llm_tren_may`; khoá ô chọn lại cho riêng `openai_compat` nghĩa là người dùng
/// trên máy luôn chạy với ngữ cảnh rỗng, khác hẳn cấu hình đã đo (ngữ cảnh
/// "phim"). Google miễn phí không nhận hướng dẫn nên vẫn phải đứng ngoài.
#[test]
fn ui_cho_chon_ngu_canh_ca_khi_dich_tren_may() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let o = tsx
        .find("htmlFor=\"ngu-canh\"")
        .expect("phải có ô chọn ngữ cảnh");
    let truoc = &tsx[..o];
    let dieu_kien = truoc
        .rfind("{(provider ===")
        .or_else(|| truoc.rfind("{provider ==="))
        .expect("ô ngữ cảnh phải nằm trong một điều kiện theo provider");
    let dieu_kien = &truoc[dieu_kien..];
    assert!(
        dieu_kien.contains("llm_tren_may"),
        "ô ngữ cảnh phải hiện cả khi dịch trên máy: {dieu_kien}"
    );
    assert!(
        !dieu_kien.contains("google_free"),
        "google_free không nhận hướng dẫn ngữ cảnh, không được hiện ô này: {dieu_kien}"
    );
}

/// Sổ tay phải nói rõ nó ÉP ĐÚNG chứ không phải chỉ gợi ý, nếu không người dùng
/// tưởng nó là một ô ghi chú và không buồn điền.
#[test]
fn ui_so_tay_noi_ro_la_ep_dung_chu_khong_phai_goi_y() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("Sổ tay tên riêng").expect("Bước 3 phải có vùng sổ tay");
    let sau = &tsx[i..];
    assert!(
        sau.contains("tự được dịch lại"),
        "thiếu lời giải thích rằng câu gọi sai sẽ được dịch lại"
    );
}

/// Danh sách máy tự tìm KHÔNG được tự đổ vào sổ. Đo trên phim mẫu: model nhận
/// nhầm `姐夫` (anh rể) thành tên người và đề xuất "Chị Phu"; mục đó vào sổ sẽ ép
/// mọi cue có `姐夫` ra "Chị Phu", phá bảng quan hệ họ hàng đã đo được 0/4 ⇒ 4/4.
/// Bộ lọc từ họ hàng chặn đúng ca đó, nhưng còn `大虫子` và `莫比乌斯环` thì không —
/// nên bước người duyệt là bắt buộc, không phải trang trí.
#[test]
fn ui_ten_may_tu_tim_phai_qua_nguoi_duyet_moi_vao_so() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("Tự tìm tên riêng").expect("phải có nút tự tìm tên riêng");
    let sau = &tsx[i..];
    assert!(
        sau.contains("chưa vào sổ"),
        "phải nói rõ danh sách tự tìm chưa vào sổ"
    );
    assert!(
        sau.contains("Thêm vào sổ"),
        "phải có nút để NGƯỜI bấm thêm vào sổ"
    );
}

/// Dấu "đáng ngờ" của bảng Hán-Việt không được trình bày như một lỗi. Bảng thiếu
/// 21% số chữ trong phụ đề thật và trộn âm Nôm với âm Hán-Việt (`燕` ra "én" chứ
/// không phải "Yến"), nên nó sai nhiều hơn model — ai đọc màn hình phải hiểu đó
/// là chỗ đáng ngó, không phải chỗ đã sai.
#[test]
fn ui_noi_ro_bang_han_viet_chi_la_y_kien_thu_hai() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("bảng Hán-Việt").expect("phải nhắc tới bảng Hán-Việt");
    let sau = &tsx[i..];
    assert!(
        sau.contains("không chắc là sai"),
        "phải nói rõ lệch bảng không có nghĩa là model sai"
    );
}

/// Người dùng cần biết app còn sống hay đã treo. Hai mức, và CẢ HAI phải có:
/// đếm được thì hiện `đã/tổng`, không đếm được thì hiện đồng hồ.
#[test]
fn ui_hien_tien_do_dem_duoc_va_dong_ho_khi_khong_dem_duoc() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx
        .find("tabs-khoa")
        .expect("phải có banner báo đang chạy");
    let sau = &tsx[i..i + 700.min(tsx.len() - i)];
    assert!(
        sau.contains("tienDo.xong") && sau.contains("tienDo.tong"),
        "banner phải hiện số câu đã xong trên tổng số: {sau}"
    );
    assert!(sau.contains("dongHo("), "banner phải có đồng hồ chạy: {sau}");
}

/// `tong === 0` nghĩa là KHÔNG ĐẾM ĐƯỢC (nhận dạng lời thoại chạy một lượt
/// trong sherpa). Vờ như đếm được là nói dối người dùng, nên phần trăm chỉ
/// được tính khi mẫu số thật sự lớn hơn 0 — và chia cho 0 thì ra NaN%.
#[test]
fn ui_khong_bia_phan_tram_khi_khong_dem_duoc() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("tabs-khoa").expect("phải có banner");
    let sau = &tsx[i..i + 700.min(tsx.len() - i)];
    assert!(
        sau.contains("tienDo.tong > 0"),
        "phải kiểm mẫu số trước khi tính phần trăm: {sau}"
    );
}

/// Bước 6 phải có MẪU kiểu chữ hiện sẵn.
///
/// Trước đây muốn thấy chữ trông thế nào phải bấm "Xem thử phụ đề" để ffmpeg
/// dựng một khung hình thật — tức là chọn font, cỡ và màu trong tình trạng mù.
#[test]
fn ui_buoc_6_co_mau_kieu_chu_hien_san() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains("CAU_MAU_PHU_DE"),
        "Bước 6 phải có câu mẫu để chấm kiểu chữ"
    );
    assert!(
        tsx.contains("mau-phu-de-chu"),
        "phải có khối vẽ câu mẫu theo kiểu chữ đang chọn"
    );
}

/// Câu mẫu phải dài ĐÚNG ngưỡng cắt câu.
///
/// Câu ngắn trông lúc nào cũng vừa khung; chỉ câu dài đúng ngưỡng mới cho thấy
/// cỡ chữ nào bắt đầu tràn xuống hai dòng — mà đó là thứ người dùng cần biết
/// TRƯỚC khi xuất video, không phải sau.
#[test]
fn cau_mau_dai_dung_nguong_cat_cau() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("const CAU_MAU_PHU_DE = \"").expect("phải có câu mẫu");
    let sau = &tsx[i + "const CAU_MAU_PHU_DE = \"".len()..];
    let cau = &sau[..sau.find('"').expect("câu mẫu phải đóng ngoặc kép")];
    assert_eq!(
        cau.chars().count(),
        app_lib::srt::MAX_MOT_DONG,
        "câu mẫu dài {} ký tự, phải đúng {} = ngưỡng cắt câu: {cau:?}",
        cau.chars().count(),
        app_lib::srt::MAX_MOT_DONG
    );
}

/// Mẫu phải quy cỡ chữ theo lưới ASS 288 đơn vị như bản xuất, không gõ sẵn một
/// số pixel. Gõ sẵn thì mẫu nói một đằng, video xuất ra một nẻo.
#[test]
fn css_mau_phu_de_quy_theo_luoi_ass_chu_khong_go_san_pixel() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    let i = css.find(".mau-phu-de-chu").expect("phải có khối CSS cho câu mẫu");
    let sau = &css[i..];
    assert!(
        sau.contains("var(--ass-play-res-y)"),
        "cỡ chữ mẫu phải chia cho --ass-play-res-y: {}",
        &sau[..200.min(sau.len())]
    );
    assert!(
        sau.contains("cqh"),
        "phải quy theo chiều cao khung (cqh), không theo px cố định"
    );
}

/// Bước 6 phải có panel làm mờ, và phải nói rõ hai hệ quả mà người dùng không
/// tự đoán được: lúc khoanh vùng thì không bấm được nút phát, và bật làm mờ là
/// video buộc phải mã hoá lại nên xuất lâu hơn hẳn.
#[test]
fn ui_panel_lam_mo_noi_ro_hai_he_qua() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("Làm mờ một vùng").expect("Bước 6 phải có panel làm mờ");
    let sau = &tsx[i..];
    assert!(
        sau.contains("KHÔNG bấm được nút phát"),
        "phải báo rằng lúc khoanh vùng thì không điều khiển được video"
    );
    assert!(
        sau.contains("mã hoá lại"),
        "phải báo rằng bật làm mờ là buộc mã hoá lại, xuất lâu hơn"
    );
}

/// Lớp khoanh vùng phủ kín thẻ video. Để nó ăn chuột cả khi KHÔNG khoanh vùng
/// thì không bấm được nút phát, tua hay âm lượng — mà chẳng có gì báo vì sao.
#[test]
fn css_lop_khoanh_vung_tat_chuot_khi_khong_ve() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    let i = css.find(".vung-mo-lop {").expect("phải có lớp khoanh vùng");
    let than = &css[i..css[i..].find('}').expect("thiếu dấu đóng") + i];
    assert!(
        than.contains("pointer-events: none"),
        "lớp khoanh vùng phải tắt chuột khi không vẽ: {than}"
    );
}

/// Ngưỡng vùng nhỏ nhất bên TSX phải khớp hằng bên Rust. Lệch nhau thì giao
/// diện cho vẽ một ô mà `crop` bên ffmpeg từ chối, và lỗi chỉ lộ ra giữa chừng
/// lần xuất đã chạy mấy phút.
#[test]
fn nguong_vung_nho_nhat_khop_giua_tsx_va_rust() {
    let tsx = std::fs::read_to_string("../src/VungMoLop.tsx").expect("đọc được VungMoLop.tsx");
    let mong_doi = format!(
        "export const VUNG_MO_MIN_PCT = {};",
        app_lib::export::VUNG_MO_MIN_PCT
    );
    assert!(
        tsx.contains(&mong_doi),
        "VungMoLop.tsx phải khai `{mong_doi}` cho khớp export::VUNG_MO_MIN_PCT"
    );
}

/// Khung xem thử phải CẮT phần hình tràn ra khi phóng to, và cắt ở thẻ CHA.
///
/// `transform` không tự bị chính nó cắt, nên `overflow: hidden` đặt trên thẻ
/// đang scale là vô nghĩa — thiếu chỗ này thì hình chườm ra ngoài khung và xem
/// thử nói dối so với bản xuất, đúng loại lỗi mà trình xem thử sinh ra để tránh.
#[test]
fn css_khung_xem_thu_cat_phan_tran_khi_phong_to() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    let i = css.find(".xem-thu {").expect("phải có .xem-thu");
    let than = &css[i..i + css[i..].find('}').expect("thiếu dấu đóng")];
    assert!(
        than.contains("overflow: hidden"),
        "thẻ cha phải cắt phần tràn: {than}"
    );
    assert!(
        than.contains("background: #000"),
        "thu nhỏ thì viền phải đen như `pad` của ffmpeg, không ra màu của app: {than}"
    );
}

/// Zoom trong trình xem thử chỉ được phóng HÌNH và vùng mờ, KHÔNG phóng phụ đề
/// và logo — đúng thứ tự filtergraph bên Rust (làm mờ → zoom → phụ đề, logo).
/// Phóng cả chữ thì xem thử nói một đằng, bản xuất ra một nẻo.
#[test]
fn xem_thu_chi_phong_hinh_chu_khong_phong_phu_de_va_logo() {
    let tsx = std::fs::read_to_string("../src/XemThu.tsx").expect("đọc được XemThu.tsx");
    // Tìm theo thuộc tính className chứ không theo tên lớp trần: tên lớp cũng
    // nằm trong các dòng chú thích ở đầu file, và `find` bắt phải dòng đó thì
    // bài test so hai vị trí hoàn toàn vô nghĩa.
    let vi_tri = |ten: &str| {
        tsx.find(&format!("className=\"{ten}\""))
            .unwrap_or_else(|| panic!("phải có className={ten}"))
    };
    let i = vi_tri("xem-thu-phong");
    let dong = vi_tri("xem-thu-cap");
    let logo = vi_tri("xem-thu-logo");
    assert!(i < dong && i < logo, "khung phóng phải mở TRƯỚC logo và phụ đề");
    let khung_dong = tsx[i..].find("</div>").expect("khung phóng phải đóng") + i;
    assert!(
        khung_dong < logo && khung_dong < dong,
        "logo và phụ đề phải nằm NGOÀI khung bị phóng"
    );
}

/// Ngưỡng zoom bên TSX phải nằm trong khoảng Rust chấp nhận. Giao diện cho gõ
/// 1000% trong khi Rust kẹp ở 500% thì người dùng gõ xong tưởng đã nhận.
#[test]
fn nguong_zoom_tren_giao_dien_nam_trong_khoang_rust_chap_nhan() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("id=\"zoom\"").expect("phải có ô zoom");
    let sau = &tsx[i..i + 300.min(tsx.len() - i)];
    let doc_so = |ten: &str| -> f32 {
        let j = sau.find(ten).unwrap_or_else(|| panic!("thiếu {ten}: {sau}"));
        sau[j + ten.len()..]
            .chars()
            .take_while(|c| c.is_ascii_digit())
            .collect::<String>()
            .parse()
            .expect("đọc được số")
    };
    assert!(doc_so("min={") >= app_lib::export::ZOOM_MIN * 100.0, "min nhỏ hơn Rust cho phép");
    assert!(doc_so("max={") <= app_lib::export::ZOOM_MAX * 100.0, "max lớn hơn Rust cho phép");
}

/// Panel bộ mẫu phải nói rõ áp mẫu là GHI ĐÈ cả bốn phần.
///
/// Trộn mẫu với thiết lập đang có cho ra một hình hài không giống mẫu nào, mà
/// người dùng lại tưởng mình vừa áp đúng mẫu — và chỉ phát hiện sau khi xem
/// bản xuất.
#[test]
fn ui_panel_bo_mau_noi_ro_la_ghi_de() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("Bộ mẫu định dạng").expect("Bước 6 phải có panel bộ mẫu");
    let sau = &tsx[i..];
    assert!(sau.contains("GHI ĐÈ"), "phải nói rõ áp mẫu là ghi đè");
    for phan in ["kiểu chữ phụ đề", "logo", "vùng làm mờ"] {
        assert!(sau.contains(phan), "phải liệt kê \"{phan}\" trong mẫu");
    }
}

/// Mẫu phải lưu NGAY ra đĩa, không đợi nút "Lưu cấu hình".
///
/// Mẫu là thứ người dùng dựng để DÙNG LẠI; mất nó vì quên bấm lưu thì công
/// khoanh vùng cả buổi đi theo, và không có gì gợi là phải bấm thêm.
#[test]
fn luu_mau_ghi_ngay_ra_dia() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("async function luuMau()").expect("phải có hàm lưu mẫu");
    let than = &tsx[i..i + 900.min(tsx.len() - i)];
    assert!(
        than.contains("save_config"),
        "luuMau phải gọi save_config ngay: {than}"
    );
}

/// Bốn phần của mẫu phải khớp giữa TSX và Rust. Thiếu một phần ở một bên thì
/// mẫu lưu ra thiếu, mà người dùng chỉ biết khi áp lại và thấy sai.
#[test]
fn bon_phan_cua_mau_khop_giua_tsx_va_rust() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx.find("type MauDinhDang = {").expect("phải có kiểu MauDinhDang");
    let than = &tsx[i..i + 300.min(tsx.len() - i)];
    for truong in ["ten", "subtitle", "watermark", "vung_mo", "zoom_pct"] {
        assert!(than.contains(truong), "kiểu MauDinhDang thiếu `{truong}`: {than}");
    }
}

/// Bố cục ba cột: các bước bên trái, khung xem thử ở giữa, nội dung bước bên
/// phải. Khung xem thử phải nằm NGOÀI mọi bước — bước nào cũng cần nhìn hình,
/// mà trước đây nó nằm trong Bước 6 nên phải nhảy qua nhảy lại để đối chiếu.
#[test]
fn ui_ba_cot_va_khung_xem_thu_nam_ngoai_moi_buoc() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let vi_tri = |ten: &str| {
        tsx.find(&format!("className=\"{ten}\""))
            .unwrap_or_else(|| panic!("phải có className={ten}"))
    };
    let buoc = vi_tri("cot-buoc");
    let giua = vi_tri("cot-giua");
    let noi_dung = vi_tri("cot-noi-dung");
    assert!(buoc < giua && giua < noi_dung, "thứ tự cột phải là bước → giữa → nội dung");

    // Khung xem thử nằm trong cột giữa, trước khi cột nội dung mở ra.
    let xem_thu = vi_tri("khung-xem-thu");
    assert!(
        giua < xem_thu && xem_thu < noi_dung,
        "khung xem thử phải nằm trong cột giữa, ngoài mọi bước"
    );
    // Và phải đứng ngoài mọi `{tab === N && ...}`.
    let tab_dau = tsx.find("{tab === 1 &&").expect("phải có bước 1");
    assert!(xem_thu < tab_dau, "khung xem thử bị kẹt trong một bước");
}

/// Cột tinh chỉnh của Bước 6 chia thành tab con. Ba nhóm là ba MẶT của cùng một
/// việc chứ không phải ba bước nối tiếp, nên chúng là tab con chứ không phải
/// thêm bước vào thanh bên trái.
#[test]
fn ui_buoc_6_chia_thanh_tab_con() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    for ten in ["\"Phụ đề\"", "\"Logo\"", "\"Làm mờ & phóng\""] {
        assert!(tsx.contains(ten), "thiếu tab con {ten}");
    }
    assert!(tsx.contains("tab-con"), "tab con phải có lớp riêng để tạo kiểu khác tab bước");
}

/// Cột nội dung là flex-column CÓ max-height, nên mặc định mọi item trong đó co
/// được theo chiều dọc — `overflow-y: auto` không ngăn chuyện đó. Mẫu kiểu chữ
/// dựa hoàn toàn vào `aspect-ratio` để có chiều cao nên bị bóp dẹt thành một
/// dải mỏng, và người dùng tưởng nó biến mất.
#[test]
fn css_cot_noi_dung_khong_bop_dep_cac_item() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    assert!(
        css.contains(".cot-noi-dung > *,"),
        "phải có quy tắc chặn co cho mọi item của cột nội dung"
    );
    let i = css.find(".cot-noi-dung > *,").unwrap();
    let than = &css[i..i + css[i..].find('}').unwrap()];
    assert!(than.contains("flex-shrink: 0"), "{than}");
}

/// Danh sách dự án nằm trong HỘP BẬT LÊN, không nằm thẳng trên trang.
///
/// Trước đây nó chiếm gần một phần ba chiều cao màn hình ở ngay đầu trang, đẩy
/// ba cột làm việc xuống dưới — mà mở dự án là việc làm một lần rồi thôi.
#[test]
fn ui_du_an_gan_day_nam_trong_hop_bat_len() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let hop = tsx.find("hop-du-an").expect("phải có hộp dự án");
    let danh_sach = tsx.find("project-row").expect("phải có danh sách dự án");
    assert!(hop < danh_sach, "danh sách dự án phải nằm TRONG hộp, không nằm trên trang");

    // Hộp phải mở được từ đầu trang, và đóng được bằng nút.
    assert!(tsx.contains("setMoDuAn(true)"), "thiếu nút mở hộp");
    assert!(tsx.contains("setMoDuAn(false)"), "thiếu đường đóng hộp");
}

/// Hộp phải đóng được bằng Esc và bằng cách bấm ra ngoài. Một lớp phủ chỉ đóng
/// được bằng đúng một nút nhỏ là cái bẫy quen thuộc.
#[test]
fn ui_hop_du_an_dong_duoc_bang_esc_va_bam_ra_ngoai() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(tsx.contains("\"Escape\""), "Esc phải đóng được hộp");
    let i = tsx.find("lop-phu").expect("phải có lớp phủ");
    let sau = &tsx[i..i + 200.min(tsx.len() - i)];
    assert!(
        sau.contains("onClick={() => setMoDuAn(false)}"),
        "bấm ra ngoài phải đóng hộp: {sau}"
    );
}

/// Mở một dự án phải ĐÓNG hộp lại. Để hộp che mất đúng thứ vừa mở là vô nghĩa.
#[test]
fn ui_mo_du_an_thi_dong_hop() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let i = tsx
        .find("async function onOpenProject(")
        .expect("phải có hàm mở dự án");
    let than = &tsx[i..i + 200.min(tsx.len() - i)];
    assert!(than.contains("setMoDuAn(false)"), "{than}");
}

/// Không dùng hộp thoại CHẶN của trình duyệt.
///
/// `window.alert`/`confirm`/`prompt` khoá cả luồng sự kiện, và trong WebView2
/// còn có thể bị chặn hẳn — lúc đó `confirm` trả về false im lặng và người
/// dùng tưởng mình vừa bấm Huỷ.
///
/// `confirm` của `@tauri-apps/plugin-dialog` thì KHÁC HẲN và được dùng: nó là
/// hộp thoại thật của hệ điều hành, bất đồng bộ, trả Promise. Xoá vĩnh viễn
/// một dự án đúng là chỗ cần nó.
#[test]
fn ui_khong_dung_hop_thoai_chan_cua_trinh_duyet() {
    for f in ["../src/App.tsx", "../src/XemThu.tsx", "../src/VungMoLop.tsx"] {
        let tsx = std::fs::read_to_string(f).unwrap_or_else(|_| panic!("đọc được {f}"));
        for xau in ["window.alert(", "window.confirm(", "window.prompt(", "alert(", "prompt("] {
            assert!(
                !tsx.contains(xau),
                "{f} dùng hộp thoại chặn `{xau}` — dựng lớp phủ bằng React, hoặc dùng \
                 dialog của Tauri nếu cần hộp thoại thật của hệ điều hành"
            );
        }
        // `confirm` chỉ được phép khi nó tới từ plugin dialog của Tauri.
        if tsx.contains("confirm(") {
            assert!(
                tsx.contains("@tauri-apps/plugin-dialog"),
                "{f} gọi confirm() mà không nhập từ @tauri-apps/plugin-dialog — \
                 nhiều khả năng là confirm chặn của trình duyệt"
            );
        }
    }
}

/// Cột giữa phải RỘNG NHẤT. Hai cột bên chỉ để bấm và gõ, còn cột giữa là chỗ
/// nhìn — một khung hình nhỏ thì không soi được phụ đề lệch hay logo đè lên mặt
/// người. Vì cả ba cột nằm cùng một `grid-template-columns`, mỗi lần nới một
/// panel bên phải là cột giữa hẹp đi mà không ai nhận ra.
///
/// Ngưỡng 34rem: hai bên cộng lại không được quá nửa cửa sổ 1080px (= 67,5rem).
#[test]
fn css_cot_giua_rong_nhat() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    let i = css.find(".bo-cuc {").expect("phải có lưới .bo-cuc");
    let than = &css[i..i + css[i..].find('}').unwrap()];
    let dong = than
        .lines()
        .find(|d| d.contains("grid-template-columns"))
        .unwrap_or_else(|| panic!("{than}"));
    let gia_tri = dong.split(':').nth(1).unwrap().trim_end_matches(';').trim();

    let cot: Vec<&str> = gia_tri.split("minmax(0, 1fr)").collect();
    assert_eq!(cot.len(), 2, "cột giữa phải là minmax(0, 1fr): {gia_tri}");

    let rem = |s: &str| -> f32 {
        s.trim()
            .trim_end_matches("rem")
            .replace(',', ".")
            .parse()
            .unwrap_or_else(|_| panic!("cột bên phải là số rem cố định, gặp {s:?}"))
    };
    let trai = rem(cot[0]);
    let phai = rem(cot[1]);
    assert!(
        trai + phai <= 34.0,
        "hai cột bên cộng lại {}rem, quá nửa cửa sổ hẹp nhất — cột giữa còn quá bé",
        trai + phai
    );
}

/// Hàng cue xếp thành TẦNG, không phải bốn cột cạnh nhau.
///
/// Bước 4 nằm trong cột nội dung rộng 24rem. Bốn cột (số thứ tự · hai ô thời
/// gian · ô chữ · hai nút) cần hơn 20rem chỉ riêng phần cố định, nên ô chữ bị
/// bóp còn một sợi, nút "Lưu" đứt mất một nửa và cả danh sách mọc thanh cuộn
/// ngang. Đây là thứ im lặng quay lại mỗi lần ai đó nới cột nội dung.
#[test]
fn css_hang_cue_xep_tang_cho_cot_hep() {
    let css = std::fs::read_to_string("../src/App.css").expect("đọc được App.css");
    let i = css.find(".cue-row {").expect("phải có .cue-row");
    let than = &css[i..i + css[i..].find('}').unwrap()];
    let dong = than
        .lines()
        .find(|d| d.contains("grid-template-columns"))
        .unwrap_or_else(|| panic!("{than}"));
    let so_cot = dong
        .split(':')
        .nth(1)
        .unwrap()
        .trim_end_matches(';')
        .replace("minmax(0, 1fr)", "X")
        .split_whitespace()
        .count();
    assert!(so_cot <= 2, "hàng cue có {so_cot} cột, quá rộng cho cột 24rem: {dong}");
    assert!(than.contains("grid-template-areas"), "phải xếp bằng vùng tên: {than}");
}

/// Bảng giọng theo nhân vật phải nằm ở BƯỚC 5 (Lồng tiếng), không phải Bước 6.
///
/// Bước 6 là mọi thứ nhìn thấy trên hình; chọn giọng là chuyện nghe. Để nhầm
/// chỗ thì người dùng phải nhảy qua lại giữa hai bước cho một việc.
#[test]
fn ui_bang_giong_nhan_vat_nam_o_buoc_5() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    let b5 = tsx.find("{tab === 5 &&").expect("phải có bước 5");
    let b6 = tsx.find("{tab === 6 &&").expect("phải có bước 6");
    let bang = tsx.find("className=\"nguoi-noi\"").expect("phải có bảng người nói");
    assert!(b5 < bang && bang < b6, "bảng giọng theo nhân vật phải nằm trong Bước 5");
}

/// Ba lệnh của bảng người nói phải được GỌI từ giao diện.
///
/// Một lệnh đăng ký ở Rust mà giao diện không gọi thì im lặng y như không có:
/// repo này đã mất một vòng đo vì `dich_lai_sua_loi` nằm trong trait mà không
/// ai chuyển tiếp.
#[test]
fn ui_goi_du_ba_lenh_nguoi_noi() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    for lenh in ["nguoi_noi_doc", "nguoi_noi_tach", "nguoi_noi_dat_giong"] {
        assert!(tsx.contains(&format!("\"{lenh}\"")), "giao diện chưa gọi lệnh {lenh}");
    }
    let lib = std::fs::read_to_string("src/lib.rs").expect("đọc được lib.rs");
    for lenh in ["nguoi_noi_doc", "nguoi_noi_tach", "nguoi_noi_dat_giong"] {
        assert!(
            lib.contains(&format!("commands::{lenh},")),
            "lệnh {lenh} chưa đăng ký trong invoke_handler"
        );
    }
}

/// Số nhân vật mặc định ở giao diện phải khớp hằng số bên Rust.
#[test]
fn ui_so_nhan_vat_mac_dinh_khop_rust() {
    let tsx = std::fs::read_to_string("../src/App.tsx").expect("đọc được App.tsx");
    assert!(
        tsx.contains(&format!("const SO_NGUOI_MAC_DINH = {};", app_lib::nguoi_noi::SO_NGUOI_MAC_DINH)),
        "App.tsx phải khai SO_NGUOI_MAC_DINH khớp nguoi_noi::SO_NGUOI_MAC_DINH"
    );
    assert!(
        tsx.contains(&format!("const SO_NGUOI_TOI_DA = {};", app_lib::nguoi_noi::SO_NGUOI_TOI_DA)),
        "App.tsx phải khai SO_NGUOI_TOI_DA khớp nguoi_noi::SO_NGUOI_TOI_DA"
    );
}
