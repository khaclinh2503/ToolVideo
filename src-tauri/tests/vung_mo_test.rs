//! Vùng làm mờ: quy %→pixel và nhánh filtergraph.

use app_lib::export::{build_filter_complex, ExportOpts, VungMo, VUNG_MO_MIN_PCT};

fn opts(vung_mo: Vec<(u32, u32, u32, u32)>) -> ExportOpts {
    ExportOpts {
        burn_subs: false,
        soft_subs: false,
        has_audio: false,
        volume_original: 1.0,
        volume_dub: 1.0,
        crf: 20,
        preset: "veryfast".into(),
        style: None,
        watermark: None,
        vung_mo,
    }
}

fn v(x: f32, y: f32, w: f32, h: f32) -> VungMo {
    VungMo { x_pct: x, y_pct: y, w_pct: w, h_pct: h }
}

#[test]
fn khong_co_vung_nao_thi_filtergraph_khong_doi() {
    let f = build_filter_complex(&opts(vec![]), false);
    assert!(!f.contains("boxblur"), "không có vùng mà vẫn dựng nhánh mờ: {f}");
}

/// Luồng vào được dùng HAI lần — một bản nguyên làm nền, một bản cắt ra làm mờ
/// — nên phải `split`. Nối thẳng hai nhánh vào cùng một nhãn là lỗi "Filter has
/// an unconnected output" và ffmpeg chết ngay khi khởi động.
#[test]
fn mot_vung_dung_split_crop_boxblur_overlay() {
    let f = build_filter_complex(&opts(vec![(10, 20, 100, 50)]), false);
    assert!(f.contains("[0:v]split[g0][c0]"), "{f}");
    assert!(f.contains("[c0]crop=100:50:10:20,boxblur="), "{f}");
    assert!(f.contains("[b0]overlay=10:20[v]"), "{f}");
}

/// Vùng thứ hai phải ăn ĐẦU RA của vùng thứ nhất, không phải `0:v`. Ăn `0:v` thì
/// vùng trước bị vùng sau ghi đè mất và chỉ vùng cuối có tác dụng.
#[test]
fn nhieu_vung_noi_tiep_nhau_chu_khong_cung_an_nguon() {
    let f = build_filter_complex(&opts(vec![(0, 0, 50, 50), (60, 60, 40, 40)]), false);
    assert!(f.contains("[0:v]split[g0][c0]"), "{f}");
    assert!(f.contains("[vm0]split[g1][c1]"), "vùng 2 phải nối tiếp vùng 1: {f}");
    assert!(f.contains("[b1]overlay=60:60[v]"), "{f}");
}

/// Làm mờ phải chạy TRƯỚC phụ đề: làm sau thì chính phụ đề vừa ghi vào hình
/// cũng bị nhoè theo.
#[test]
fn lam_mo_truoc_roi_moi_ghi_phu_de() {
    let mut o = opts(vec![(10, 10, 100, 100)]);
    o.burn_subs = true;
    let f = build_filter_complex(&o, false);
    let i_mo = f.find("boxblur").expect("phải có nhánh mờ");
    let i_sub = f.find("subtitles=").expect("phải có nhánh phụ đề");
    assert!(i_mo < i_sub, "phụ đề bị ghi trước khi làm mờ: {f}");
    // Vùng mờ không được chiếm nhãn `v` khi còn phụ đề phía sau.
    assert!(f.contains("[b0]overlay=10:10[vm0]"), "{f}");
}

#[test]
fn quy_phan_tram_sang_pixel_lam_tron_xuong_so_chan() {
    // 10% của 1920 = 192; 25% của 1080 = 270 -> chẵn xuống 270.
    assert_eq!(v(10.0, 25.0, 50.0, 50.0).sang_pixel(1920, 1080), (192, 270, 960, 540));
    // Toạ độ lẻ phải xuống chẵn: 1% của 101 = 1.01 -> 0.
    let (x, _, _, _) = v(1.0, 0.0, 50.0, 50.0).sang_pixel(101, 100);
    assert_eq!(x % 2, 0, "toạ độ phải chẵn cho yuv420p");
}

/// Một cú kéo chuột lỡ tay cho ra vùng 0% → `crop=0:0` → ffmpeg chết với
/// "Invalid too big or non positive size", giết cả lần xuất đã chạy mấy phút.
#[test]
fn vung_qua_nho_bi_keo_len_muc_dung_duoc() {
    let n = v(50.0, 50.0, 0.0, 0.0).chuan_hoa();
    assert!(n.w_pct >= VUNG_MO_MIN_PCT && n.h_pct >= VUNG_MO_MIN_PCT, "{n:?}");
    let (_, _, w, h) = v(50.0, 50.0, 0.0, 0.0).sang_pixel(640, 360);
    assert!(w >= 2 && h >= 2, "crop={w}:{h} sẽ làm ffmpeg chết");
}

/// Kéo chuột ra ngoài mép khung là chuyện bình thường, không phải lỗi người
/// dùng — nhưng `crop` vượt khung thì ffmpeg chết.
#[test]
fn vung_tran_ra_ngoai_khung_bi_kep_lai_vua_khung() {
    let (x, y, w, h) = v(80.0, 80.0, 50.0, 50.0).sang_pixel(1920, 1080);
    assert!(x + w <= 1920, "tràn ngang: {x}+{w}");
    assert!(y + h <= 1080, "tràn dọc: {y}+{h}");
    let (x2, y2, _, _) = v(-20.0, -30.0, 10.0, 10.0).sang_pixel(1920, 1080);
    assert_eq!((x2, y2), (0, 0), "toạ độ âm phải kẹp về 0");
}

/// Bán kính cố định sai ở cả hai đầu: quá nhỏ với vùng to thì vẫn đọc được
/// chữ, quá lớn với vùng bé thì ffmpeg chết vì bán kính vượt nửa cạnh.
#[test]
fn ban_kinh_mo_theo_canh_ngan_va_khong_vuot_nua_canh() {
    for (w, h) in [(2, 2), (4, 4), (10, 6), (300, 200), (1920, 1080)] {
        let r = VungMo::ban_kinh(w, h);
        assert!(r >= 1, "bán kính 0 thì không mờ gì: {w}x{h}");
        assert!(
            r < w.min(h).max(2) / 2 || w.min(h) <= 3,
            "bán kính {r} vượt nửa cạnh ngắn của {w}x{h}, ffmpeg sẽ chết"
        );
    }
    assert!(
        VungMo::ban_kinh(600, 400) > VungMo::ban_kinh(60, 40),
        "vùng to phải mờ mạnh hơn để chữ to cũng không đọc được"
    );
}

/// Làm mờ là một filter hình, nên buộc phải mã hoá lại. `-c:v copy` chép thẳng
/// luồng hình gốc — vùng mờ sẽ biến mất không dấu vết, và người dùng chỉ phát
/// hiện khi xem lại bản xuất.
#[test]
fn co_vung_mo_thi_buoc_ma_hoa_lai_chu_khong_copy_luong_hinh() {
    use app_lib::export::build_export_args;
    use std::path::Path;
    let a = build_export_args(
        Path::new("in.mp4"),
        Path::new("dub.wav"),
        None,
        None,
        Path::new("out.mp4"),
        &opts(vec![(10, 10, 100, 100)]),
    );
    let i = a.iter().position(|x| x == "-c:v").expect("phải chọn codec hình");
    assert_ne!(a[i + 1], "copy", "có vùng mờ mà vẫn chép luồng hình: {a:?}");
}
