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
/// định bấm "Tải bộ công cụ" bây giờ hay để lúc khác. M9 thêm ~10,4 GB
/// (llama.cpp + Qwen3-14B) nên "570 MB" cũ biến một lần tải hàng giờ thành một
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
/// đó — nếu không họ tưởng app treo, hoặc tưởng 13,5 GB VRAM bị giữ mãi.
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
