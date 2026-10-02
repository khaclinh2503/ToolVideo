//! Trộn tiếng gốc với dải tiếng dịch rồi mux vào video.
//!
//! Chia làm hai nửa: `build_*` là hàm thuần trên chuỗi (test được không cần
//! ffmpeg), `run_export`/`probe_*` gọi tiến trình con.

use crate::error::PipelineError;
use std::path::Path;
use std::process::Command;

/// Ẩn cửa sổ console của tiến trình con trên Windows.
/// Ẩn cửa sổ console của tiến trình con trên Windows.
///
/// NỢ KỸ THUẬT: hiện có ba bản sao gần giống nhau (ở đây, `download.rs`,
/// `pyenv.rs`). Bản này được mở `pub` để `project.rs` dùng lại thay vì thêm bản
/// thứ tư; gom cả ba về một chỗ là việc dọn riêng, không làm lẫn vào một commit
/// tính năng.
pub fn no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    #[cfg(not(windows))]
    let _ = cmd;
}

fn run_ffprobe(ffprobe: &Path, args: &[&str], video: &Path) -> Result<String, PipelineError> {
    let mut cmd = Command::new(ffprobe);
    cmd.args(args).arg(video);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffprobe".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if !out.status.success() {
        return Err(PipelineError::EngineFailed {
            stage: "ffprobe".into(),
            code: out.status.code().unwrap_or(-1),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        });
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
}

/// `ffprobe` in ra thời lượng dạng giây thập phân, hoặc `N/A` với container
/// không khai báo. Hàm thuần để test được mà không cần ffprobe thật.
pub fn parse_duration_ms(s: &str) -> Option<u64> {
    let v: f64 = s.trim().parse().ok()?;
    if !v.is_finite() || v <= 0.0 {
        return None;
    }
    Some((v * 1000.0).round() as u64)
}

pub fn probe_duration_ms(ffprobe: &Path, video: &Path) -> Result<u64, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
        ],
        video,
    )?;
    parse_duration_ms(&s).ok_or_else(|| PipelineError::EngineFailed {
        stage: "ffprobe".into(),
        code: 0,
        stderr: format!(
            "Không đọc được thời lượng của {} (ffprobe trả về '{s}')",
            video.display()
        ),
    })
}

/// Rút `(width, height)` từ JSON `ffprobe -show_entries
/// stream=width,height:stream_tags=rotate:stream_side_data=rotation -of json`,
/// đổi chỗ width/height nếu góc xoay là bội lẻ của 90°. Hàm thuần để test
/// không cần ffprobe thật — xem chú thích ở `probe_video_size` về góc xoay.
pub fn parse_video_size_json(json: &str) -> Option<(u32, u32)> {
    let v: serde_json::Value = serde_json::from_str(json).ok()?;
    let stream = v.get("streams")?.as_array()?.first()?;
    let w = stream.get("width")?.as_u64()? as u32;
    let h = stream.get("height")?.as_u64()? as u32;
    if w == 0 || h == 0 {
        return None;
    }

    // Ưu tiên side_data (nhánh ffprobe hiện đại THẬT SỰ dùng — xem chú thích ở
    // probe_video_size); thẻ `rotate` kiểu cũ chỉ là lưới an toàn cho ffprobe
    // đời trước, không có trên bộ ffprobe đi kèm app.
    // `as_i64()` chỉ trả Some khi serde_json đã PARSE số đó ở biểu diễn số
    // nguyên nội bộ. Máy quay/điện thoại thật — đặc biệt file do Apple mux —
    // hay ghi góc Display Matrix không tròn số kiểu -89.999992 thay vì -90.0,
    // ffprobe in y nguyên số đó ra JSON dạng float; `as_i64()` trả None dù giá
    // trị làm tròn ra đúng -90. Trước khi sửa, angle rơi về unwrap_or(0), khung
    // không được đổi chỗ w/h — lặp lại chính bug mà hàm này được sửa để tránh,
    // và im lặng vì vẫn trả Some (không None) chứ không panic hay báo lỗi gì.
    // `as_f64()` đọc được cả hai dạng (int lẫn float) nên dùng nó rồi làm tròn
    // về độ nguyên trước khi xét bội lẻ của 90.
    let angle = stream
        .get("side_data_list")
        .and_then(|l| l.as_array())
        .and_then(|arr| {
            arr.iter()
                .find_map(|sd| sd.get("rotation").and_then(|r| r.as_f64()))
        })
        .or_else(|| {
            stream
                .get("tags")
                .and_then(|t| t.get("rotate"))
                .and_then(|r| r.as_str())
                .and_then(|s| s.trim().parse::<f64>().ok())
        })
        .map(|f| f.round() as i64)
        .unwrap_or(0);

    // Chỉ dấu và bội chẵn/lẻ của 90 là quan trọng — 90/-90/270/-270 đều đổi
    // chỗ w/h, 0/180/-180 đều giữ nguyên. Không cần phân biệt chiều xoay ở
    // đây, chỉ cần biết khung có "nằm ngang" hay không sau khi autorotate.
    if angle.rem_euclid(180) == 90 {
        Some((h, w))
    } else {
        Some((w, h))
    }
}

/// Bề ngang × bề cao mà FILTER CHAIN sẽ thấy — không phải kích thước "coded"
/// trong container. `None` nếu không đọc được — chỗ gọi phải coi đó là "không
/// đặt được logo" chứ không phải lỗi xuất.
///
/// ffmpeg CLI tự chèn một bước xoay TRƯỚC filter_complex dựa theo metadata xoay
/// của luồng (autorotate mặc định bật, không tắt ở đâu trong app này). Video
/// quay dọc trên điện thoại thường được MÃ HOÁ ngang (coded 1920x1080) kèm ma
/// trận xoay 90°; hỏi ffprobe `stream=width,height` trơn chỉ ra kích thước
/// coded đó, nên nếu dùng thẳng để tính `Watermark::moi` thì logo bị tính sai
/// theo khung ĐÃ xoay (ví dụ 230px trên khung 1080 rộng thật = 21% chứ không
/// phải 12% người dùng chọn).
///
/// Đã đo thật với ffprobe/ffmpeg bundled (`9.0.2-essentials_build-www.gyan.dev`):
///   - Dựng một clip coded 1920x1080 mang ma trận xoay -90° (Display Matrix,
///     qua `-display_rotation`), `ffprobe -show_entries stream_side_data=rotation`
///     in ra `rotation=-90`; decode thật một khung của clip đó ra đúng
///     1080x1920 — xác nhận ffmpeg CLI có autorotate và side_data là nơi lộ
///     thông tin đó trên bản ffprobe này.
///   - Thẻ xoay kiểu cũ (`stream_tags=rotate`, ví dụ `-metadata:s:v rotate=90`)
///     KHÔNG xuất hiện trên bản ffprobe này khi đọc lại một mp4/mov thật —
///     chỉ side_data mới có. Vẫn đọc thêm thẻ này làm lưới an toàn cho ffprobe
///     đời cũ hơn (theo tài liệu ffmpeg), nhưng trên bộ ffprobe đi kèm app,
///     nhánh side_data là nhánh duy nhất có tác dụng thật.
///   - QUY ƯỚC DẤU (dễ nhầm): `rotation` của side_data là góc xoay NGƯỢC chiều
///     kim đồng hồ (CCW) cần áp để đưa khung về đúng chiều hiển thị — âm nghĩa
///     là xoay THEO chiều kim đồng hồ. Thẻ `rotate` kiểu cũ mang quy ước NGƯỢC
///     lại (thuận chiều kim đồng hồ). May là không cần quan tâm dấu ở đây: chỉ
///     cần |góc| là bội lẻ của 90° thì đổi chỗ width/height.
pub fn probe_video_size(ffprobe: &Path, video: &Path) -> Option<(u32, u32)> {
    let out = std::process::Command::new(ffprobe)
        .args([
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height:stream_tags=rotate:stream_side_data=rotation",
            "-of", "json",
        ])
        .arg(video)
        .output()
        .ok()?;
    parse_video_size_json(&String::from_utf8_lossy(&out.stdout))
}

/// Video câm là chuyện bình thường (màn hình quay, slide). Không có tiếng gốc
/// thì nhánh `[0:a]` của filtergraph sẽ làm ffmpeg chết ngay, nên phải hỏi trước.
pub fn probe_has_audio(ffprobe: &Path, video: &Path) -> Result<bool, PipelineError> {
    let s = run_ffprobe(
        ffprobe,
        &[
            "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
        ],
        video,
    )?;
    Ok(!s.trim().is_empty())
}

use std::ffi::OsString;

/// Chiều cao hệ quy chiếu của script ASS mà ffmpeg sinh ra khi nạp một file
/// SRT. libass KHÔNG đo `FontSize` theo khung hình thật: ffmpeg chuyển SRT
/// sang ASS trước, và header nó sinh ra ghi cứng `PlayResX: 384 / PlayResY:
/// 288` bất kể video 360p hay 4K. libass vẽ trong lưới 288 đơn vị đó rồi phóng
/// cả khung lên kích thước thật, nên `FontSize=24` là 24/288 ≈ 8.3% chiều cao
/// khung — TỈ LỆ với khung, không phải một số pixel tuyệt đối.
///
/// Đo thật (ffmpeg 9.0.2, burn `FontSize=24,Outline=0` lên nền đen): chiều cao
/// chữ "H" là 19 / 39 / 57 / 115 px ở 360p / 720p / 1080p / 4K.
///
/// Hằng số này `pub` để lớp xem thử bên frontend quy đổi cùng một hệ quy
/// chiếu; `tests/hang_so_ui_test.rs` ghim cho hai bên không trôi khỏi nhau.
pub const ASS_PLAY_RES_Y: u32 = 288;

/// Lề dọc mặc định trong style `Default` mà ffmpeg ghi vào script ASS đó
/// (`MarginL/R/V = 10`). Ở hệ quy chiếu 288 đơn vị, nó đặt đáy phần nét chữ
/// thấp nhất (descender) cách đáy khung `10/288` ≈ 3.47% chiều cao khung.
///
/// Đo thật (cùng lần burn trên, chuỗi "Hgpq"): đáy descender cách đáy khung
/// 3.33% ở 360p và 3.43% ở 1080p.
pub const ASS_MARGIN_V: u32 = 10;

/// Tên file phụ đề dùng trong filtergraph. Luôn là tên ASCII **tương đối**:
/// ffmpeg chạy với `current_dir` đặt ở thư mục chứa nó, nên filtergraph không
/// bao giờ phải mang đường dẫn tuyệt đối. Trên Windows, dấu hai chấm ổ đĩa kết
/// thúc tham số filter, dấu gạch ngược bị nuốt, và `[ ] , ;` trong tên thư mục
/// phá luôn graph — tên người dùng có dấu tiếng Việt làm mọi thứ tệ hơn.
pub const BURN_SRT_NAME: &str = "burn.srt";

/// Phóng to / thu nhỏ NỘI DUNG trong khung, khung giữ nguyên kích thước.
///
/// Phóng to thì cắt bớt mép, thu nhỏ thì thêm viền đen — giống phóng ảnh
/// trong một ô cố định, KHÁC với đổi độ phân giải đầu ra.
///
/// Giữ nguyên kích thước khung là có chủ ý: đổi kích thước thì mọi thứ đo
/// theo % khung (vùng mờ, logo, cỡ chữ) phải tính lại, mà người dùng không
/// có cách nào biết điều đó đã xảy ra.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Zoom {
    /// 1.0 = nguyên bản. >1 phóng to (cắt mép), <1 thu nhỏ (thêm viền).
    pub ti_le: f32,
    pub khung_w: u32,
    pub khung_h: u32,
}

/// Giới hạn tỉ lệ phóng.
///
/// Dưới 0.1 thì hình còn vài pixel giữa một khung đen — không ai muốn thế mà
/// rất dễ gõ nhầm. Trên 5.0 thì `scale` dựng một khung trung gian 25 lần diện
/// tích gốc; với video 4K là 8 tỉ pixel mỗi khung, đủ để hết RAM.
pub const ZOOM_MIN: f32 = 0.1;
pub const ZOOM_MAX: f32 = 5.0;

impl Zoom {
    /// `None` khi không phải phóng gì — để filtergraph không mọc thêm nhánh
    /// thừa, và `-c:v copy` vẫn dùng được nếu không có filter nào khác.
    pub fn moi(ti_le: f32, khung_w: u32, khung_h: u32) -> Option<Zoom> {
        let t = ti_le.clamp(ZOOM_MIN, ZOOM_MAX);
        // So với biên hẹp chứ không so bằng `== 1.0`: 100.4% làm tròn ra một
        // khung lệch 0 pixel nhưng vẫn dựng cả nhánh scale+crop vô ích.
        if (t - 1.0).abs() < 0.005 {
            return None;
        }
        Some(Zoom { ti_le: t, khung_w, khung_h })
    }

    /// Chuỗi filter, không gồm nhãn vào/ra.
    ///
    /// Phóng to: scale lên rồi `crop` về đúng khung, lấy giữa. Thu nhỏ: scale
    /// xuống rồi `pad` ra đúng khung, đặt giữa. Hai nhánh khác nhau vì `crop`
    /// không nới được và `pad` không cắt được.
    ///
    /// Mọi kích thước trung gian làm tròn xuống số CHẴN: yuv420p lấy mẫu màu
    /// 2x2 nên cạnh lẻ bị ffmpeg từ chối hoặc tự dịch đi một pixel.
    pub fn filter(&self) -> String {
        let chan = |v: f32| ((v.max(2.0) as u32) / 2) * 2;
        let w = chan(self.khung_w as f32 * self.ti_le);
        let h = chan(self.khung_h as f32 * self.ti_le);
        let (kw, kh) = (self.khung_w, self.khung_h);
        if self.ti_le > 1.0 {
            format!("scale={w}:{h},crop={kw}:{kh}:{}:{}", (w - kw) / 2, (h - kh) / 2)
        } else {
            format!(
                "scale={w}:{h},pad={kw}:{kh}:{}:{}:black",
                (kw - w) / 2,
                (kh - h) / 2
            )
        }
    }
}

/// Một vùng chữ nhật bị làm mờ, đo bằng PHẦN TRĂM khung hình.
///
/// Phần trăm chứ không phải pixel: người dùng khoanh vùng trên khung xem thử
/// (kích thước tuỳ cửa sổ), còn video có thể 360p hay 4K. Lưu pixel thì đổi
/// video là vùng mờ lệch chỗ, mà không có gì báo.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct VungMo {
    pub x_pct: f32,
    pub y_pct: f32,
    pub w_pct: f32,
    pub h_pct: f32,
}

/// Bề rộng/cao tối thiểu của một vùng, tính theo % khung.
///
/// Vùng 0% cho ra `crop=0:0` và ffmpeg CHẾT với "Invalid too big or non
/// positive size" — một cú kéo chuột lỡ tay sẽ giết cả lần xuất video đã
/// chạy mấy phút.
pub const VUNG_MO_MIN_PCT: f32 = 0.5;

impl VungMo {
    /// Ép vùng nằm gọn trong khung và không nhỏ quá mức dùng được.
    ///
    /// Kẹp chứ không trả lỗi: dữ liệu này tới từ một cú kéo chuột, và kéo ra
    /// ngoài mép khung là chuyện bình thường chứ không phải lỗi người dùng.
    pub fn chuan_hoa(self) -> VungMo {
        let x = self.x_pct.clamp(0.0, 100.0 - VUNG_MO_MIN_PCT);
        let y = self.y_pct.clamp(0.0, 100.0 - VUNG_MO_MIN_PCT);
        VungMo {
            x_pct: x,
            y_pct: y,
            w_pct: self.w_pct.clamp(VUNG_MO_MIN_PCT, 100.0 - x),
            h_pct: self.h_pct.clamp(VUNG_MO_MIN_PCT, 100.0 - y),
        }
    }

    /// Đổi sang pixel của video, làm tròn xuống số CHẴN.
    ///
    /// Chẵn vì yuv420p lấy mẫu màu 2x2: `crop`/`overlay` ở toạ độ lẻ khiến
    /// ffmpeg tự dịch đi một pixel hoặc báo lỗi tuỳ phiên bản. Trả `(x,y,w,h)`.
    pub fn sang_pixel(self, video_w: u32, video_h: u32) -> (u32, u32, u32, u32) {
        let v = self.chuan_hoa();
        let chan = |f: f32| ((f.max(0.0) as u32) / 2) * 2;
        let x = chan(video_w as f32 * v.x_pct / 100.0);
        let y = chan(video_h as f32 * v.y_pct / 100.0);
        // Rộng/cao tối thiểu 2px: làm tròn xuống số chẵn có thể ra 0 với vùng
        // rất nhỏ trên video nhỏ, và `crop=0` thì ffmpeg chết.
        let w = chan(video_w as f32 * v.w_pct / 100.0).max(2).min(video_w - x);
        let h = chan(video_h as f32 * v.h_pct / 100.0).max(2).min(video_h - y);
        (x, y, w, h)
    }

    /// Bán kính boxblur, suy từ kích thước vùng.
    ///
    /// Bán kính cố định là sai ở cả hai đầu: quá nhỏ với một logo to thì vẫn
    /// đọc được chữ, quá lớn với một vùng bé thì ffmpeg chết vì bán kính vượt
    /// nửa cạnh. Lấy theo cạnh ngắn nên vùng nào cũng nhoè tương đương.
    pub fn ban_kinh(w: u32, h: u32) -> u32 {
        let canh_ngan = w.min(h);
        // ffmpeg đòi bán kính < nửa cạnh; chừa biên an toàn bằng cách chia 2 rồi
        // trừ 1 chứ không chia đúng 2.
        let tran = (canh_ngan / 2).saturating_sub(1).max(1);
        (canh_ngan / 6).max(1).min(tran)
    }
}
#[derive(Debug, Clone)]
pub struct ExportOpts {
    pub burn_subs: bool,
    /// Chỉ có tác dụng khi `burn_subs == false`.
    pub soft_subs: bool,
    pub has_audio: bool,
    pub volume_original: f32,
    pub volume_dub: f32,
    pub crf: u32,
    pub preset: String,
    /// Kiểu chữ khi ghi phụ đề vào hình. `None` ⇒ để libass dùng mặc định,
    /// giữ nguyên hành vi của dự án trước khi có tính năng này.
    pub style: Option<SubStyle>,
    /// Logo đóng dấu. `None` ⇒ không có nhánh overlay nào, giữ nguyên hành vi cũ.
    pub watermark: Option<Watermark>,
    /// Các vùng bị làm mờ, đã quy sang pixel `(x, y, w, h)` của video.
    ///
    /// Quy sang pixel ở lớp gọi chứ không ở đây: `build_filter_complex` không
    /// biết kích thước video, mà đoán sai kích thước thì vùng mờ lệch chỗ.
    pub vung_mo: Vec<(u32, u32, u32, u32)>,
    /// Phóng to/thu nhỏ nội dung. `None` ⇒ giữ nguyên, không thêm nhánh nào.
    pub zoom: Option<Zoom>,
}

/// `0.18` chứ không phải `0.180`; `3` chứ không phải `3.000`.
fn fmt_vol(v: f32) -> String {
    let s = format!("{v:.3}");
    let s = s.trim_end_matches('0');
    s.trim_end_matches('.').to_string()
}

pub fn build_filter_complex(o: &ExportOpts, co_srt_input: bool) -> String {
    let mut parts: Vec<String> = Vec::new();

    // Nhánh video chỉ tồn tại khi có việc phải làm với hình. Cả burn-in lẫn
    // logo đều buộc mã hoá lại — xem chỗ chọn `-c:v` ở build_export_args.
    if o.burn_subs || o.watermark.is_some() || !o.vung_mo.is_empty() || o.zoom.is_some() {
        // Nhãn luồng video đang cầm, không có ngoặc vuông.
        let mut cur = "0:v".to_string();
        // Làm mờ TRƯỚC phụ đề và logo. Làm sau thì chính phụ đề và logo mình
        // vừa vẽ lên cũng bị nhoè theo.
        for (k, (x, y, w, h)) in o.vung_mo.iter().enumerate() {
            let r = VungMo::ban_kinh(*w, *h);
            let con = if k + 1 == o.vung_mo.len() && !o.burn_subs && o.watermark.is_none() {
                "v".to_string()
            } else {
                format!("vm{k}")
            };
            // split vì luồng vào được dùng HAI lần: một bản nguyên để làm nền,
            // một bản cắt ra để làm mờ. Nối thẳng hai nhánh vào cùng một nhãn
            // là lỗi "Filter has an unconnected output".
            parts.push(format!("[{cur}]split[g{k}][c{k}]"));
            parts.push(format!(
                "[c{k}]crop={w}:{h}:{x}:{y},boxblur={r}:2[b{k}]"
            ));
            parts.push(format!("[g{k}][b{k}]overlay={x}:{y}[{con}]"));
            cur = con;
        }
        // Zoom SAU làm mờ, TRƯỚC phụ đề và logo.
        //
        // Sau làm mờ vì người dùng khoanh vùng trên khung GỐC ở trình xem thử;
        // zoom trước thì mọi toạ độ vùng mờ lệch đi mà không có gì báo.
        //
        // Trước phụ đề và logo vì hai thứ đó là mình vẽ thêm — zoom sau sẽ cắt
        // mất chữ ở mép và phóng to nét chữ thành răng cưa.
        if let Some(z) = &o.zoom {
            let ra = if o.burn_subs || o.watermark.is_some() { "vz" } else { "v" };
            parts.push(format!("[{cur}]{}[{ra}]", z.filter()));
            cur = ra.to_string();
        }
        if o.burn_subs {
            // Nếu còn logo phía sau thì đây chưa phải đầu ra cuối cùng.
            let ra = if o.watermark.is_some() { "vs" } else { "v" };
            parts.push(format!(
                "[{cur}]{}[{ra}]",
                subtitles_filter(BURN_SRT_NAME, o.style.as_ref())
            ));
            cur = ra.to_string();
        }
        if let Some(w) = &o.watermark {
            // Input: 0 video, 1 dub.wav, 2 srt (chỉ khi soft-subs), rồi tới logo.
            let idx = if co_srt_input { 3 } else { 2 };
            // format=rgba TRƯỚC colorchannelmixer: PNG không có alpha thì kênh
            // aa không tồn tại và hệ số độ mờ bị bỏ qua im lặng.
            parts.push(format!(
                "[{idx}:v]format=rgba,colorchannelmixer=aa={},scale={}:-1[wm]",
                fmt_vol(w.opacity),
                w.logo_w_px
            ));
            parts.push(format!("[{cur}][wm]overlay={}[v]", w.overlay_xy()));
        }
    }

    if o.has_audio {
        parts.push(format!("[0:a]volume={}[bg]", fmt_vol(o.volume_original)));
        parts.push(format!("[1:a]volume={}[vo]", fmt_vol(o.volume_dub)));
        // normalize=0 bắt buộc: mặc định amix chia lại biên độ theo số input,
        // xoá sạch tỉ lệ vừa đặt ở hai dòng trên.
        // duration=longest chứ không phải first: `[0:a]` là tiếng GỐC, có thể
        // ngắn hơn hình (stream copy bị cắt, hoặc file gốc tiếng dừng trước
        // hình) trong khi dải tiếng dịch `[1:a]` luôn được dựng dài đúng bằng
        // `video_ms` (thời lượng container). Nếu ăn theo tiếng gốc ngắn hơn,
        // amix cắt cụt đúng phần đuôi dải tiếng dịch mà không cue/thống kê nào
        // phát hiện. Cả hai input đã bị chặn trần ở `video_ms` nên `longest`
        // không kéo dài mix ra ngoài hình; normalize=0 vẫn còn nên không có
        // hiện tượng khuếch đại lại khi một nhánh im lặng ở đuôi.
        parts.push(
            "[bg][vo]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0[mx]".into(),
        );
    } else {
        // Video câm: hệ số nhân 3.0 vô nghĩa vì không có nền nào để nổi lên trên.
        parts.push("[1:a]volume=1[mx]".into());
    }

    // Nhân 3.0 lên một giọng Piper vốn gần full-scale sẽ cắt đỉnh thô; limiter
    // giữ đỉnh dưới 0 dBFS.
    // level=disabled bắt buộc: mặc định alimiter tự bật "auto level", tự động
    // khuếch đại lại đầu ra về 0 dB — xoá sạch chính cái limit vừa đặt, y hệt
    // cái bẫy normalize=1 của amix ở trên.
    // limit=0.89 (~ -1 dBFS), không phải một số gần 0 dBFS: mux cuối cùng mã
    // hoá AAC, và giải mã AAC có thể vọt đỉnh tới ~0.5 dB so với mẫu PCM đưa
    // vào — đo được trên chính giọng lồng thật, không phải suy đoán. Ở
    // limit=0.98 đỉnh sau AAC đã vượt hẳn 0 dBFS dù limiter "đúng". −1 dBFS là
    // mức đệm quy ước cho phát hành qua codec mất dữ liệu, chọn theo nguyên
    // tắc đó chứ không theo riêng file test này — đừng chỉnh lại gần 0 dBFS.
    parts.push("[mx]alimiter=limit=0.89:level=disabled[aout]".into());
    parts.join(";")
}

pub fn build_export_args(
    video: &Path,
    dub: &Path,
    srt: Option<&Path>,
    logo: Option<&Path>,
    out: &Path,
    o: &ExportOpts,
) -> Vec<OsString> {
    let soft = o.soft_subs && !o.burn_subs;
    let soft_srt = if soft { srt } else { None };

    let mut a: Vec<OsString> = vec!["-hide_banner".into(), "-nostats".into(), "-y".into()];
    a.push("-i".into());
    a.push(video.into());
    a.push("-i".into());
    a.push(dub.into());
    if let Some(s) = soft_srt {
        a.push("-i".into());
        a.push(s.into());
    }
    // Logo LUÔN là input cuối cùng — chỉ số của nó trong filtergraph được tính
    // từ việc có srt hay không, xem build_filter_complex.
    if let Some(l) = logo {
        a.push("-i".into());
        a.push(l.into());
    }

    a.push("-filter_complex".into());
    a.push(build_filter_complex(o, soft_srt.is_some()).into());

    // Có bất cứ filter hình nào cũng buộc mã hoá lại: `-c:v copy` chép luồng
    // nén nguyên vẹn, không có chỗ nào để chèn phụ đề hay logo vào.
    let co_filter_video = o.burn_subs || o.watermark.is_some() || !o.vung_mo.is_empty() || o.zoom.is_some();

    a.push("-map".into());
    a.push(OsString::from(if co_filter_video { "[v]" } else { "0:v:0" }));
    a.push("-map".into());
    a.push("[aout]".into());
    if soft_srt.is_some() {
        a.push("-map".into());
        a.push("2:0".into());
        a.push("-c:s".into());
        a.push("mov_text".into());
        a.push("-metadata:s:s:0".into());
        a.push("language=vie".into());
    }

    if co_filter_video {
        a.push("-c:v".into());
        a.push("libx264".into());
        a.push("-preset".into());
        a.push(o.preset.as_str().into());
        a.push("-crf".into());
        a.push(o.crf.to_string().into());
        a.push("-pix_fmt".into());
        a.push("yuv420p".into());
    } else {
        a.push("-c:v".into());
        a.push("copy".into());
    }

    a.push("-c:a".into());
    a.push("aac".into());
    a.push("-b:a".into());
    a.push("192k".into());
    a.push("-movflags".into());
    a.push("+faststart".into());
    a.push(out.into());
    a
}

use std::path::PathBuf;

/// Chép bản dịch sang `burn.srt` cạnh nó. Trả về đường dẫn tuyệt đối, nhưng
/// filtergraph chỉ dùng tên `BURN_SRT_NAME` — xem chú thích ở hằng số đó.
pub fn prepare_burn_srt(subtitles_dir: &Path, translated: &Path) -> Result<PathBuf, PipelineError> {
    let text = std::fs::read(translated).map_err(|_| {
        PipelineError::Io(format!(
            "Chưa có bản dịch — chạy Dịch trước ({})",
            translated.display()
        ))
    })?;
    std::fs::create_dir_all(subtitles_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let dst = subtitles_dir.join(BURN_SRT_NAME);
    std::fs::write(&dst, text)
        .map_err(|e| PipelineError::Io(format!("không ghi được {}: {e}", dst.display())))?;
    Ok(dst)
}

/// Chạy ffmpeg với thư mục làm việc đặt ở `work_dir` — đó là cách filtergraph
/// tham chiếu `burn.srt` bằng tên tương đối mà không phải escape đường dẫn.
pub fn run_export(ffmpeg: &Path, work_dir: &Path, args: &[OsString]) -> Result<(), PipelineError> {
    let mut cmd = Command::new(ffmpeg);
    cmd.current_dir(work_dir).args(args);
    no_window(&mut cmd);
    let out = cmd.output().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("ffmpeg".into())
        } else {
            PipelineError::Io(e.to_string())
        }
    })?;
    if out.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
    Err(crate::ffmpeg::classify_ffmpeg_failure(
        "export",
        out.status.code().unwrap_or(-1),
        &stderr,
    ))
}

/// Tên file xuất khi ghi vào thư mục do người dùng chọn: `<tên video>-<tgt>.mp4`.
///
/// Không dùng `final.mp4` như khi ghi trong thư mục dự án: ở đó mỗi dự án có
/// thư mục riêng nên trùng tên vô hại, còn thư mục của người dùng thì mọi dự án
/// đổ chung một chỗ và sẽ đè lên nhau.
pub fn output_name(video: &Path, tgt: &str) -> String {
    let goc = video
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "video".to_string());
    let t = tgt.trim();
    if t.is_empty() {
        format!("{goc}.mp4")
    } else {
        format!("{goc}-{t}.mp4")
    }
}

/// Đường dẫn còn trống trong `dir`: giữ nguyên `name` nếu chưa có, nếu đã có thì
/// thêm ` (2)`, ` (3)`…
///
/// Ghi đè im lặng một file sẵn có trong thư mục của người dùng là mất dữ liệu
/// không hoàn lại — họ có thể đã xuất bản cũ và còn cần nó.
pub fn unique_path(dir: &Path, name: &str) -> PathBuf {
    let p = dir.join(name);
    if !p.exists() {
        return p;
    }
    let (than, duoi) = match name.rsplit_once('.') {
        Some((a, b)) => (a.to_string(), format!(".{b}")),
        None => (name.to_string(), String::new()),
    };
    // Dừng ở 999 thay vì lặp vô hạn: tới mức đó thì thư mục đã hỏng theo nghĩa
    // nào đó, và trả về đường dẫn cuối còn hơn treo cứng.
    for i in 2..1000 {
        let p = dir.join(format!("{than} ({i}){duoi}"));
        if !p.exists() {
            return p;
        }
    }
    dir.join(format!("{than} (1000){duoi}"))
}

/// Kiểu chữ phụ đề khi ghi vào hình (burn-in).
#[derive(Debug, Clone, PartialEq)]
pub struct SubStyle {
    /// Tên font theo cách Windows gọi, ví dụ "Arial", "Segoe UI".
    pub font: String,
    pub size: u32,
    /// Màu chữ dạng `#RRGGBB`.
    pub color: String,
    /// Màu viền dạng `#RRGGBB`.
    pub outline_color: String,
    /// Độ dày viền, 0 = không viền.
    pub outline: u32,
}

/// Góc đặt logo trên khung hình.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Goc {
    TrenTrai,
    TrenPhai,
    DuoiTrai,
    DuoiPhai,
}

impl Goc {
    /// Giá trị lạ lùi về dưới-phải thay vì lỗi: `corner` trong config là String
    /// nên nó có thể mang bất cứ thứ gì người dùng gõ vào, và đặt nhầm góc thì
    /// nhìn là thấy, còn làm hỏng cả file config thì không.
    pub fn tu_chuoi(s: &str) -> Goc {
        match s.trim().to_ascii_lowercase().as_str() {
            "tl" => Goc::TrenTrai,
            "tr" => Goc::TrenPhai,
            "bl" => Goc::DuoiTrai,
            _ => Goc::DuoiPhai,
        }
    }
}

/// Logo đã quy ra pixel trên khung hình thật.
///
/// Quy đổi %→pixel làm ở đây chứ không nhét vào filtergraph, vì filter `scale`
/// đặt trên luồng logo không thấy được kích thước video (`main_w` chỉ tồn tại
/// trong ngữ cảnh của `overlay`). Có `scale2ref` làm được việc đó nhưng nó đã
/// bị đánh dấu loại bỏ ở ffmpeg mới. Tính sẵn bằng Rust cho chuỗi filter thành
/// hàm thuần, test được không cần chạy ffmpeg.
#[derive(Debug, Clone, PartialEq)]
pub struct Watermark {
    pub corner: Goc,
    pub logo_w_px: u32,
    pub margin_px: u32,
    pub opacity: f32,
}

impl Watermark {
    /// `video_w` là bề ngang video thật, lấy từ `probe_video_size`.
    ///
    /// Mọi giá trị bị kẹp: `scale=0:-1` làm ffmpeg lỗi cứng giữa chừng buổi
    /// xuất, còn lề quá lớn đẩy logo ra khỏi khung — cả hai đều là "người dùng
    /// gõ một con số" chứ không phải lỗi lập trình, nên xử lý chứ không panic.
    pub fn moi(corner: &str, video_w: u32, size_pct: u32, margin_pct: u32, opacity: f32) -> Watermark {
        let size_pct = size_pct.clamp(1, 100);
        let margin_pct = margin_pct.clamp(0, 40);
        let w = video_w.max(1);
        Watermark {
            corner: Goc::tu_chuoi(corner),
            logo_w_px: (w * size_pct / 100).max(1),
            margin_px: w * margin_pct / 100,
            opacity: opacity.clamp(0.0, 1.0),
        }
    }

    /// Phần `x:y` của filter `overlay`. Dùng biến `main_w`/`overlay_w` của
    /// ffmpeg cho hai góc phải/dưới để khỏi phải biết bề cao logo sau khi scale.
    pub fn overlay_xy(&self) -> String {
        let m = self.margin_px;
        match self.corner {
            Goc::TrenTrai => format!("{m}:{m}"),
            Goc::TrenPhai => format!("main_w-overlay_w-{m}:{m}"),
            Goc::DuoiTrai => format!("{m}:main_h-overlay_h-{m}"),
            Goc::DuoiPhai => format!("main_w-overlay_w-{m}:main_h-overlay_h-{m}"),
        }
    }
}

impl Default for SubStyle {
    fn default() -> Self {
        Self {
            // Arial có đủ dấu tiếng Việt và có trên mọi máy Windows.
            font: "Arial".into(),
            size: 24,
            color: "#FFFFFF".into(),
            outline_color: "#000000".into(),
            outline: 2,
        }
    }
}

/// Đổi màu `#RRGGBB` sang dạng ASS `&HBBGGRR&`.
///
/// ASS ĐẢO THỨ TỰ KÊNH MÀU so với HTML: nó là BGR chứ không phải RGB. Đây là
/// cái bẫy kinh điển của libass — truyền thẳng chuỗi hex vào sẽ cho ra màu
/// hoán vị (đỏ thành xanh dương) mà vẫn chạy ngon lành, không báo lỗi gì.
///
/// Đầu vào không hợp lệ ⇒ trả về trắng, vì phụ đề sai màu còn hơn không xuất
/// được video.
pub fn ass_color(hex: &str) -> String {
    let h = hex.trim().trim_start_matches('#');
    if h.len() != 6 || !h.chars().all(|c| c.is_ascii_hexdigit()) {
        return "&HFFFFFF&".to_string();
    }
    // &H + BB + GG + RR
    format!("&H{}{}{}&", &h[4..6], &h[2..4], &h[0..2]).to_uppercase()
}

/// Chuỗi `force_style` cho filter `subtitles` của ffmpeg.
pub fn build_force_style(s: &SubStyle) -> String {
    format!(
        "FontName={},FontSize={},PrimaryColour={},OutlineColour={},Outline={},BorderStyle=1",
        s.font.trim(),
        s.size,
        ass_color(&s.color),
        ass_color(&s.outline_color),
        s.outline
    )
}

/// Escape chuỗi `force_style` để nhét vào filtergraph của ffmpeg.
///
/// Trong filtergraph, dấu `:` ngăn cách tham số và `,` ngăn cách filter, nên
/// một tên font có dấu cách thì không sao nhưng chuỗi style thì phải bọc trong
/// nháy đơn. Dấu `'` trong tên font được bỏ đi thay vì escape lồng nhau —
/// không font Windows chuẩn nào có dấu nháy, và escape lồng trong filtergraph
/// là chỗ rất dễ sai.
pub fn subtitles_filter(srt_name: &str, style: Option<&SubStyle>) -> String {
    match style {
        None => format!("subtitles={srt_name}"),
        Some(s) => {
            let fs = build_force_style(s).replace('\'', "");
            format!("subtitles={srt_name}:force_style='{fs}'")
        }
    }
}

/// Tham số ffmpeg dựng MỘT khung hình có phụ đề đã cháy vào, để xem thử kiểu chữ.
///
/// `-ss` đặt TRƯỚC `-i` để tua nhanh, và `-copyts` giữ nguyên mốc thời gian gốc
/// — thiếu nó thì sau khi tua, khung hình mang mốc 0 và filter `subtitles` đi
/// tìm cue ở giây 0, nên ảnh xem thử thường TRỐNG chữ dù video có phụ đề.
pub fn build_preview_frame_args(
    video: &Path,
    srt_name: &str,
    tai_ms: u64,
    style: Option<&SubStyle>,
    ra: &Path,
) -> Vec<String> {
    let giay = tai_ms as f64 / 1000.0;
    vec![
        "-nostdin".into(),
        "-hide_banner".into(),
        "-loglevel".into(),
        "error".into(),
        "-y".into(),
        "-ss".into(),
        format!("{giay:.3}"),
        "-copyts".into(),
        "-i".into(),
        video.display().to_string(),
        "-vf".into(),
        subtitles_filter(srt_name, style),
        "-frames:v".into(),
        "1".into(),
        "-q:v".into(),
        "2".into(),
        ra.display().to_string(),
    ]
}
