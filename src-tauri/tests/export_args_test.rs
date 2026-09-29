use app_lib::export::{parse_duration_ms, prepare_burn_srt};

#[test]
fn doc_thoi_luong_ffprobe() {
    assert_eq!(parse_duration_ms("12.345"), Some(12_345));
    assert_eq!(parse_duration_ms("  7.0\n"), Some(7_000));
    assert_eq!(parse_duration_ms("0.001"), Some(1));
}

#[test]
fn thoi_luong_khong_doc_duoc_tra_ve_none() {
    assert_eq!(parse_duration_ms("N/A"), None);
    assert_eq!(parse_duration_ms(""), None);
    assert_eq!(parse_duration_ms("-1"), None);
    assert_eq!(parse_duration_ms("0"), None);
    assert_eq!(parse_duration_ms("inf"), None);
}

use app_lib::export::{build_export_args, build_filter_complex, ExportOpts, BURN_SRT_NAME};
use std::path::Path;

fn opts(burn: bool, soft: bool, has_audio: bool) -> ExportOpts {
    ExportOpts {
        burn_subs: burn,
        soft_subs: soft,
        has_audio,
        volume_original: 0.18,
        volume_dub: 3.0,
        crf: 20,
        preset: "medium".into(),
        style: None,
        watermark: None,
    }
}

fn args_of(o: &ExportOpts, srt: Option<&Path>) -> Vec<String> {
    args_of_logo(o, srt, None)
}

fn args_of_logo(o: &ExportOpts, srt: Option<&Path>, logo: Option<&Path>) -> Vec<String> {
    build_export_args(
        Path::new(r"E:\phim\clip.mp4"),
        Path::new(r"E:\du an\tts\dub.wav"),
        srt,
        logo,
        Path::new(r"E:\du an\output\final.mp4"),
        o,
    )
    .into_iter()
    .map(|s| s.to_string_lossy().to_string())
    .collect()
}

fn filter_arg(a: &[String]) -> String {
    let i = a.iter().position(|s| s == "-filter_complex").expect("thiếu -filter_complex");
    a[i + 1].clone()
}

#[test]
fn amix_phai_tat_normalize() {
    // Mặc định amix normalize=1 chia lại biên độ theo số input và xoá sạch
    // tỉ lệ 0.18/3.0. Đây là bất biến quan trọng nhất của cả module.
    let f = build_filter_complex(&opts(false, false, true), false);
    assert!(f.contains("normalize=0"), "filtergraph: {f}");
    assert!(
        f.contains("duration=longest"),
        "phải ăn theo luồng dài hơn: dải tiếng dịch dài bằng container, tiếng \
         gốc có thể ngắn hơn (stream copy cắt, hoặc tiếng dừng trước hình) — \
         duration=first sẽ cắt cụt đuôi dải tiếng dịch: {f}"
    );
    assert!(
        f.contains("[0:a]volume=0.18[bg]"),
        "tiếng gốc phải gắn với volume 0.18: {f}"
    );
    assert!(
        f.contains("[1:a]volume=3[vo]"),
        "tiếng lồng phải gắn với volume 3.0: {f}"
    );
    assert!(
        f.contains("[mx]alimiter=limit=0.89:level=disabled[aout]"),
        "phải chặn đỉnh sau khi nhân 3.0, và tắt auto-level (mặc định true, tự khuếch đại ngược lại đúng limit vừa áp): {f}"
    );
}

#[test]
fn khong_co_tieng_goc_thi_khong_nhan_3_lan() {
    // Hệ số 3.0 chỉ có nghĩa khi đứng cạnh nền 0.18; đứng một mình nó chỉ làm vỡ tiếng.
    let f = build_filter_complex(&opts(false, false, false), false);
    assert!(!f.contains("[0:a]"), "video câm không có luồng audio để lấy: {f}");
    assert!(!f.contains("amix"), "một nguồn thì không trộn: {f}");
    assert!(f.contains("[1:a]volume=1[mx]"), "filtergraph: {f}");
    assert!(
        f.contains("[mx]alimiter=limit=0.89:level=disabled[aout]"),
        "filtergraph: {f}"
    );
}

#[test]
fn filtergraph_khong_bao_gio_chua_duong_dan_tuyet_doi() {
    // Chặn việc "sửa cho gọn" bằng cách nhét đường dẫn tuyệt đối vào filtergraph:
    // dấu hai chấm ổ đĩa kết thúc tham số filter, dấu gạch ngược bị nuốt.
    for (burn, audio) in [(true, true), (true, false), (false, true), (false, false)] {
        let a = args_of(&opts(burn, false, audio), None);
        let f = filter_arg(&a);
        assert!(!f.contains('\\'), "filtergraph có dấu gạch ngược: {f}");
        assert!(!f.contains(":\\"), "filtergraph có ổ đĩa: {f}");
        assert!(!f.contains("E:"), "filtergraph có đường dẫn tuyệt đối: {f}");
    }
}

#[test]
fn burn_dung_ten_tuong_doi_va_ma_hoa_lai_video() {
    let a = args_of(&opts(true, false, true), None);
    let f = filter_arg(&a);
    assert!(f.contains(&format!("subtitles={BURN_SRT_NAME}")), "filtergraph: {f}");
    assert!(f.contains("[0:v]"), "filtergraph: {f}");

    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "libx264"));
    assert!(a.windows(2).any(|w| w[0] == "-crf" && w[1] == "20"));
    assert!(a.windows(2).any(|w| w[0] == "-preset" && w[1] == "medium"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "[v]"));
    assert!(!a.iter().any(|s| s == "copy"), "burn thì không thể copy luồng video");
}

#[test]
fn khong_burn_thi_copy_luong_video() {
    let a = args_of(&opts(false, false, true), None);
    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "copy"));
    assert!(!a.iter().any(|s| s == "libx264"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "0:v:0"));
    assert!(!filter_arg(&a).contains("subtitles"));
}

#[test]
fn phu_de_mem_them_input_thu_ba_va_mov_text() {
    let srt = Path::new(r"E:\du an\subtitles\translated.vi.srt");
    let a = args_of(&opts(false, true, true), Some(srt));
    assert_eq!(a.iter().filter(|s| *s == "-i").count(), 3, "video + dub + srt");
    assert!(a.windows(2).any(|w| w[0] == "-c:s" && w[1] == "mov_text"));
    assert!(a.windows(2).any(|w| w[0] == "-map" && w[1] == "2:0"));
    assert!(a.iter().any(|s| s == "language=vie"));
    assert!(a.windows(2).any(|w| w[0] == "-c:v" && w[1] == "copy"));
    // đường dẫn srt đi qua argv, không qua filtergraph
    assert!(a.iter().any(|s| s.contains("translated.vi.srt")));
    assert!(!filter_arg(&a).contains("translated"));
}

#[test]
fn burn_thi_bo_qua_phu_de_mem() {
    // mp4 vừa burn vừa kèm track phụ đề chỉ gây rối cho người xem
    let srt = Path::new(r"E:\du an\subtitles\translated.vi.srt");
    let a = args_of(&opts(true, true, true), Some(srt));
    assert_eq!(a.iter().filter(|s| *s == "-i").count(), 2, "không thêm input srt");
    assert!(!a.iter().any(|s| s == "mov_text"));
}

#[test]
fn luon_ket_bang_duong_dan_dau_ra_va_co_faststart() {
    let a = args_of(&opts(false, false, true), None);
    assert_eq!(a.last().unwrap(), r"E:\du an\output\final.mp4");
    assert!(a.windows(2).any(|w| w[0] == "-movflags" && w[1] == "+faststart"));
    assert!(a.windows(2).any(|w| w[0] == "-c:a" && w[1] == "aac"));
    assert!(a.contains(&"-y".to_string()), "phải ghi đè file cũ, không treo chờ trả lời");
}

#[test]
fn co_nostats_de_khong_tich_luy_tien_do_vao_stderr() {
    // Thiếu -nostats: ffmpeg in tiến độ ra stderr kết thúc bằng '\r' (không
    // phải '\n'), nên cả buổi encode là MỘT dòng — error.rs lấy "20 dòng cuối"
    // sẽ nuốt trọn cả blob đó thay vì lỗi thật.
    let a = args_of(&opts(false, false, true), None);
    assert!(a.iter().any(|s| s == "-nostats"), "thiếu -nostats: {a:?}");
}

#[test]
fn burn_srt_duoc_chep_sang_ten_ascii_canh_ban_dich() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let src = sub.join("translated.vi.srt");
    std::fs::write(&src, "1\r\n00:00:00,000 --> 00:00:01,000\r\nXin chào\r\n\r\n").unwrap();

    let burn = prepare_burn_srt(&sub, &src).unwrap();

    assert_eq!(burn.file_name().unwrap(), "burn.srt");
    assert_eq!(burn.parent().unwrap(), sub);
    assert_eq!(std::fs::read_to_string(&burn).unwrap(), std::fs::read_to_string(&src).unwrap());
}

#[test]
fn burn_srt_ghi_de_ban_cu() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    std::fs::write(sub.join("burn.srt"), "rác cũ").unwrap();
    let src = sub.join("translated.vi.srt");
    std::fs::write(&src, "mới").unwrap();

    let burn = prepare_burn_srt(&sub, &src).unwrap();
    assert_eq!(std::fs::read_to_string(&burn).unwrap(), "mới");
}

#[test]
fn thieu_ban_dich_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let sub = d.path().join("subtitles");
    std::fs::create_dir_all(&sub).unwrap();
    let e = prepare_burn_srt(&sub, &sub.join("khong-co.srt")).unwrap_err();
    assert!(e.to_string().contains("Dịch"), "thông báo phải chỉ ra bước còn thiếu: {e}");
}

#[test]
fn thieu_ffmpeg_tra_ve_engine_missing() {
    let d = tempfile::tempdir().unwrap();
    let e = app_lib::export::run_export(
        Path::new("khong_co_ffmpeg.exe"),
        d.path(),
        &[std::ffi::OsString::from("-version")],
    )
    .unwrap_err();
    assert!(matches!(e, app_lib::error::PipelineError::EngineMissing(_)));
}

#[test]
fn ten_file_xuat_lay_tu_ten_video_va_ngon_ngu() {
    use app_lib::export::output_name;
    assert_eq!(output_name(std::path::Path::new(r"E:\phim\clip.mp4"), "vi"), "clip-vi.mp4");
    assert_eq!(output_name(std::path::Path::new("/a/b/bai giang.mkv"), "vi"), "bai giang-vi.mp4");
    // tgt rỗng hoặc toàn khoảng trắng thì không để lại dấu gạch cụt lủn
    assert_eq!(output_name(std::path::Path::new("/a/clip.mp4"), "  "), "clip.mp4");
}

#[test]
fn ten_file_xuat_khong_bao_gio_rong() {
    use app_lib::export::output_name;
    // Đường dẫn không có phần tên file (hiếm nhưng có thật với thư mục gốc ổ đĩa)
    assert_eq!(output_name(std::path::Path::new("/"), "vi"), "video-vi.mp4");
}

#[test]
fn khong_de_len_file_da_co_trong_thu_muc_nguoi_dung() {
    use app_lib::export::unique_path;
    let d = tempfile::tempdir().unwrap();
    // chưa có gì ⇒ dùng đúng tên
    assert_eq!(unique_path(d.path(), "clip-vi.mp4"), d.path().join("clip-vi.mp4"));
    // đã có ⇒ phải né sang tên khác, KHÔNG được trả về đường dẫn cũ
    std::fs::write(d.path().join("clip-vi.mp4"), b"ban cu").unwrap();
    let p2 = unique_path(d.path(), "clip-vi.mp4");
    assert_eq!(p2, d.path().join("clip-vi (2).mp4"));
    std::fs::write(&p2, b"ban 2").unwrap();
    assert_eq!(unique_path(d.path(), "clip-vi.mp4"), d.path().join("clip-vi (3).mp4"));
    // bản cũ vẫn còn nguyên
    assert_eq!(std::fs::read(d.path().join("clip-vi.mp4")).unwrap(), b"ban cu");
}

// ---------- kiểu chữ phụ đề ----------

#[test]
fn mau_ass_dao_thu_tu_kenh_so_voi_html() {
    use app_lib::export::ass_color;
    // ASS là BGR chứ không phải RGB. Truyền thẳng hex vào sẽ ra màu hoán vị
    // (đỏ thành xanh dương) mà ffmpeg vẫn chạy ngon, không báo lỗi gì — đây là
    // đúng loại sai chỉ phát hiện được bằng mắt sau khi xuất xong cả video.
    assert_eq!(ass_color("#FF0000"), "&H0000FF&", "đỏ HTML phải thành 0000FF trong ASS");
    assert_eq!(ass_color("#0000FF"), "&HFF0000&", "xanh dương HTML phải thành FF0000");
    assert_eq!(ass_color("#00FF00"), "&H00FF00&", "xanh lá đối xứng nên giữ nguyên");
    assert_eq!(ass_color("#FFFFFF"), "&HFFFFFF&");
    assert_eq!(ass_color("#000000"), "&H000000&");
    // Không có dấu thăng vẫn nhận.
    assert_eq!(ass_color("FF0000"), "&H0000FF&");
}

#[test]
fn mau_khong_hop_le_thi_ve_trang_chu_khong_lam_hong_lenh() {
    use app_lib::export::ass_color;
    // Phụ đề sai màu còn hơn không xuất được video.
    for xau in ["", "#12345", "#GGGGGG", "xanh", "#1234567"] {
        assert_eq!(ass_color(xau), "&HFFFFFF&", "nhận: {xau}");
    }
}

#[test]
fn force_style_mang_du_font_co_chu_va_hai_mau() {
    use app_lib::export::{build_force_style, SubStyle};
    let s = SubStyle {
        font: "Segoe UI".into(),
        size: 28,
        color: "#FFEE00".into(),
        outline_color: "#101010".into(),
        outline: 3,
    };
    let fs = build_force_style(&s);
    assert!(fs.contains("FontName=Segoe UI"), "{fs}");
    assert!(fs.contains("FontSize=28"), "{fs}");
    assert!(fs.contains("PrimaryColour=&H00EEFF&"), "màu chữ phải đảo kênh: {fs}");
    assert!(fs.contains("OutlineColour=&H101010&"), "{fs}");
    assert!(fs.contains("Outline=3"), "{fs}");
}

#[test]
fn khong_co_kieu_chu_thi_filter_giu_nguyen_dang_cu() {
    use app_lib::export::subtitles_filter;
    // Dự án cũ chưa cấu hình kiểu chữ vẫn phải xuất được y như trước.
    assert_eq!(subtitles_filter("burn.srt", None), "subtitles=burn.srt");
}

#[test]
fn chuoi_style_duoc_boc_nhay_don_cho_filtergraph() {
    use app_lib::export::{subtitles_filter, SubStyle};
    let f = subtitles_filter("burn.srt", Some(&SubStyle::default()));
    assert!(f.starts_with("subtitles=burn.srt:force_style='"), "{f}");
    assert!(f.ends_with('\''), "{f}");
    // Dấu nháy đơn bên trong sẽ phá filtergraph nên phải bị bỏ.
    let co_nhay = SubStyle { font: "Xin'chao".into(), ..SubStyle::default() };
    let f2 = subtitles_filter("burn.srt", Some(&co_nhay));
    assert_eq!(f2.matches('\'').count(), 2, "chỉ được còn đúng hai nháy bao ngoài: {f2}");
}

#[test]
fn khung_xem_thu_giu_moc_thoi_gian_de_phu_de_hien_ra() {
    use app_lib::export::{build_preview_frame_args, SubStyle};
    use std::path::Path;
    let a = build_preview_frame_args(
        Path::new("C:/v/clip.mp4"),
        "burn.srt",
        12_500,
        Some(&SubStyle::default()),
        Path::new("C:/p/xem-thu.jpg"),
    );
    let ss = a.iter().position(|x| x == "-ss").expect("phải có -ss");
    let i = a.iter().position(|x| x == "-i").expect("phải có -i");
    assert!(ss < i, "-ss phải trước -i để tua nhanh: {a:?}");
    assert_eq!(a[ss + 1], "12.500");
    // Thiếu -copyts thì khung hình mang mốc 0, filter subtitles tìm cue ở giây 0
    // và ảnh xem thử TRỐNG chữ — chạy vẫn xong, chỉ là vô dụng.
    assert!(a.contains(&"-copyts".to_string()), "{a:?}");
    let vf = a.iter().position(|x| x == "-vf").unwrap();
    assert!(a[vf + 1].starts_with("subtitles=burn.srt:force_style="), "{}", a[vf + 1]);
    assert_eq!(a.last().unwrap(), "C:/p/xem-thu.jpg");
}

use app_lib::export::{Goc, Watermark};

fn wm(corner: &str) -> Watermark {
    // video 1920 rộng, 12% ⇒ 230px; lề 3% ⇒ 57px
    Watermark::moi(corner, 1920, 12, 3, 0.85)
}

#[test]
fn watermark_tinh_pixel_tu_phan_tram() {
    let w = wm("br");
    assert_eq!(w.logo_w_px, 230);
    assert_eq!(w.margin_px, 57);
    assert_eq!(w.opacity, 0.85);
}

#[test]
fn goc_la_lui_ve_duoi_phai() {
    assert_eq!(Goc::tu_chuoi("tl"), Goc::TrenTrai);
    assert_eq!(Goc::tu_chuoi("TR"), Goc::TrenPhai);
    assert_eq!(Goc::tu_chuoi("bl"), Goc::DuoiTrai);
    assert_eq!(Goc::tu_chuoi("br"), Goc::DuoiPhai);
    // Người dùng sửa tay config, hoặc khoá thiếu nên thành "".
    assert_eq!(Goc::tu_chuoi("xyz"), Goc::DuoiPhai);
    assert_eq!(Goc::tu_chuoi(""), Goc::DuoiPhai);
}

#[test]
fn toa_do_bon_goc() {
    assert_eq!(wm("tl").overlay_xy(), "57:57");
    assert_eq!(wm("tr").overlay_xy(), "main_w-overlay_w-57:57");
    assert_eq!(wm("bl").overlay_xy(), "57:main_h-overlay_h-57");
    assert_eq!(wm("br").overlay_xy(), "main_w-overlay_w-57:main_h-overlay_h-57");
}

/// Giá trị vô lý phải bị kẹp chứ không đẻ ra `scale=0:-1` (ffmpeg lỗi cứng)
/// hay logo đẩy hẳn ra ngoài khung hình.
#[test]
fn gia_tri_vo_ly_bi_kep() {
    assert_eq!(Watermark::moi("br", 1920, 0, 3, 0.85).logo_w_px, 19, "0% phải kẹp lên 1%");
    assert_eq!(Watermark::moi("br", 1920, 500, 3, 0.85).logo_w_px, 1920, "quá 100% kẹp về bề ngang video");
    assert_eq!(Watermark::moi("br", 1920, 12, 90, 0.85).margin_px, 768, "lề kẹp ở 40%");
    assert_eq!(Watermark::moi("br", 1920, 12, 3, 5.0).opacity, 1.0);
    assert_eq!(Watermark::moi("br", 1920, 12, 3, -2.0).opacity, 0.0);
    // Video bé xíu vẫn phải ra ít nhất 1px, không bao giờ 0.
    assert_eq!(Watermark::moi("br", 4, 12, 3, 0.85).logo_w_px, 1);
}

#[test]
fn filter_co_logo_khong_burn_in() {
    let mut o = opts(false, false, true);
    o.watermark = Some(wm("br"));
    let f = build_filter_complex(&o, false);
    // Không burn-in ⇒ logo ăn thẳng [0:v]; input logo là index 2.
    assert!(f.contains("[2:v]format=rgba,colorchannelmixer=aa=0.85,scale=230:-1[wm]"), "{f}");
    assert!(f.contains("[0:v][wm]overlay=main_w-overlay_w-57:main_h-overlay_h-57[v]"), "{f}");
    assert!(!f.contains("subtitles="), "không tick burn-in thì không được có filter subtitles: {f}");
}

#[test]
fn filter_co_ca_burn_in_lan_logo_noi_tiep_nhau() {
    let mut o = opts(true, false, true);
    o.watermark = Some(wm("tl"));
    let f = build_filter_complex(&o, false);
    assert!(f.contains(&format!("[0:v]subtitles={BURN_SRT_NAME}[vs]")), "{f}");
    assert!(f.contains("[vs][wm]overlay=57:57[v]"), "{f}");
    // Chỉ đúng MỘT nhãn [v] ở đầu ra cuối cùng.
    assert_eq!(f.matches("[v]").count(), 1, "{f}");
}

/// Chỉ số input của logo trượt khi có thêm input srt cho phụ đề bật/tắt được.
#[test]
fn chi_so_input_logo_truot_khi_co_soft_srt() {
    let mut o = opts(false, true, true);
    o.watermark = Some(wm("br"));
    let co_srt = build_filter_complex(&o, true);
    assert!(co_srt.contains("[3:v]format=rgba"), "có srt ⇒ logo là input 3: {co_srt}");
    let khong_srt = build_filter_complex(&o, false);
    assert!(khong_srt.contains("[2:v]format=rgba"), "không srt ⇒ logo là input 2: {khong_srt}");
}

#[test]
fn khong_co_logo_thi_filter_giu_nguyen_nhu_cu() {
    let f = build_filter_complex(&opts(true, false, true), false);
    assert!(f.contains(&format!("[0:v]subtitles={BURN_SRT_NAME}[v]")), "{f}");
    assert!(!f.contains("overlay"), "{f}");
    assert!(!f.contains("[wm]"), "{f}");
}

/// Không burn-in nhưng có logo ⇒ vẫn phải mã hoá lại. `-c:v copy` ở đây là
/// ffmpeg lỗi "filter output [v] not used", hoặc tệ hơn: xuất xong mà không có
/// logo và không ai biết.
#[test]
fn logo_bat_thi_khong_con_c_v_copy() {
    let mut o = opts(false, false, true);
    o.watermark = Some(wm("br"));
    let a = args_of_logo(&o, None, Some(Path::new(r"E:\anh\logo.png")));
    assert!(!a.contains(&"copy".to_string()), "{a:?}");
    assert!(a.contains(&"libx264".to_string()), "{a:?}");
    assert!(a.contains(&"-pix_fmt".to_string()), "{a:?}");
    // Phải map nhánh đã lọc, không phải luồng gốc.
    let i = a.iter().position(|s| s == "-map").unwrap();
    assert_eq!(a[i + 1], "[v]", "{a:?}");
}

#[test]
fn logo_duoc_them_lam_input_cuoi_cung() {
    let mut o = opts(false, false, true);
    o.watermark = Some(wm("br"));
    let a = args_of_logo(&o, None, Some(Path::new(r"E:\anh\logo.png")));
    let inputs: Vec<&String> = a
        .iter()
        .enumerate()
        .filter(|(i, s)| *s == "-i" && *i + 1 < a.len())
        .map(|(i, _)| &a[i + 1])
        .collect();
    assert_eq!(inputs.len(), 3, "{a:?}");
    assert_eq!(inputs[2], r"E:\anh\logo.png", "logo phải là input cuối: {a:?}");
}

#[test]
fn logo_dung_sau_srt_khi_co_soft_subs() {
    let mut o = opts(false, true, true);
    o.watermark = Some(wm("br"));
    let a = args_of_logo(
        &o,
        Some(Path::new(r"E:\du an\subtitles\translated.vi.srt")),
        Some(Path::new(r"E:\anh\logo.png")),
    );
    let inputs: Vec<&String> = a
        .iter()
        .enumerate()
        .filter(|(i, s)| *s == "-i" && *i + 1 < a.len())
        .map(|(i, _)| &a[i + 1])
        .collect();
    assert_eq!(inputs.len(), 4, "{a:?}");
    assert!(inputs[2].ends_with(".srt"), "{a:?}");
    assert_eq!(inputs[3], r"E:\anh\logo.png", "{a:?}");
    assert!(filter_arg(&a).contains("[3:v]format=rgba"), "{}", filter_arg(&a));
}

/// Bật logo nhưng không truyền được file (đã bị xoá, hoặc path rỗng): phải xuất
/// bình thường KHÔNG có logo, chứ không sinh args trỏ vào input không tồn tại.
#[test]
fn logo_thieu_file_thi_xuat_nhu_khong_co_logo() {
    let mut o = opts(false, false, true);
    o.watermark = None; // pipeline đã lọc bỏ vì file không đọc được
    let a = args_of_logo(&o, None, None);
    assert!(a.contains(&"copy".to_string()), "{a:?}");
    assert!(!filter_arg(&a).contains("overlay"), "{}", filter_arg(&a));
}

// --- probe_video_size: video xoay phải trả về kích thước NHƯ FILTER CHAIN SẼ
// THẤY (đã autorotate), không phải kích thước "coded" trong container. Xem
// chú thích tại định nghĩa hàm để biết ffprobe bundled in ra cái gì thật.
use app_lib::export::parse_video_size_json;

#[test]
fn video_khong_xoay_giu_nguyen_kich_thuoc() {
    let j = r#"{"streams":[{"width":1920,"height":1080,"tags":{},"side_data_list":[]}]}"#;
    assert_eq!(parse_video_size_json(j), Some((1920, 1080)));
}

#[test]
fn video_xoay_90_side_data_thi_doi_cho_w_h() {
    // Đo thật trên ffprobe bundled (9.0.2, gyan.dev): clip có ma trận xoay
    // -90° (CCW) coded 1920x1080 in ra side_data_list[].rotation = -90, và
    // ffmpeg thật sự autorotate khung giải mã thành 1080x1920.
    let j = r#"{"streams":[{"width":1920,"height":1080,"tags":{},"side_data_list":[{"side_data_type":"Display Matrix","rotation":-90}]}]}"#;
    assert_eq!(parse_video_size_json(j), Some((1080, 1920)));
}

#[test]
fn video_xoay_90_duong_cung_doi_cho() {
    let j = r#"{"streams":[{"width":1920,"height":1080,"tags":{},"side_data_list":[{"side_data_type":"Display Matrix","rotation":90}]}]}"#;
    assert_eq!(parse_video_size_json(j), Some((1080, 1920)));
}

#[test]
fn video_xoay_180_khong_doi_cho() {
    let j = r#"{"streams":[{"width":1920,"height":1080,"tags":{},"side_data_list":[{"side_data_type":"Display Matrix","rotation":180}]}]}"#;
    assert_eq!(parse_video_size_json(j), Some((1920, 1080)));
}

#[test]
fn video_xoay_qua_the_rotate_cu_khi_khong_co_side_data() {
    // Bản ffprobe cũ hơn báo xoay qua stream_tags=rotate thay vì side_data —
    // xem chú thích ở probe_video_size. Bundled ffprobe không đi nhánh này,
    // nhưng giữ lại để không vỡ trên ffprobe khác.
    let j = r#"{"streams":[{"width":1920,"height":1080,"tags":{"rotate":"90"}}]}"#;
    assert_eq!(parse_video_size_json(j), Some((1080, 1920)));
}

#[test]
fn video_zero_hoac_thieu_field_tra_ve_none() {
    assert_eq!(parse_video_size_json(r#"{"streams":[{"width":0,"height":1080}]}"#), None);
    assert_eq!(parse_video_size_json(r#"{"streams":[]}"#), None);
    assert_eq!(parse_video_size_json("không phải json"), None);
}
