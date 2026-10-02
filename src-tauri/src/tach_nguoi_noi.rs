//! Tách người nói: chia audio thành các đoạn "ai đang nói", để mỗi nhân vật
//! trong phim được lồng một giọng riêng.
//!
//! Chạy `sherpa-onnx-offline-speaker-diarization.exe` — file này đã nằm sẵn
//! trong gói sherpa từ trước, chỉ thiếu hai model nên chưa ai dùng tới:
//! pyannote segmentation 3.0 (cắt đoạn) và CAM++ (so giọng để gom đoạn cùng
//! một người).
//!
//! Đo trên phim thật 24 phút, 16 kHz mono: 69 giây, RTF 0,035 — tức nhanh gấp
//! ~28 lần thời gian thực. Phim 90 phút rơi vào khoảng 3-4 phút.

use crate::error::PipelineError;
use crate::srt::Segment;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};

/// Một đoạn liên tục do MỘT người nói.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct DoanNguoiNoi {
    pub start_ms: u64,
    pub end_ms: u64,
    /// Nhãn do công cụ đặt: `speaker_00`, `speaker_01`... Không phải tên nhân
    /// vật — người dùng tự gán giọng cho từng nhãn.
    pub nguoi: String,
}

pub struct ModelTachNguoiNoi {
    pub exe: PathBuf,
    pub segmentation: PathBuf,
    pub embedding: PathBuf,
}

pub fn models(models_dir: &Path) -> ModelTachNguoiNoi {
    let s = models_dir.join("sherpa");
    ModelTachNguoiNoi {
        exe: s.join("sherpa-onnx-offline-speaker-diarization.exe"),
        segmentation: s.join("pyannote-segmentation.onnx"),
        embedding: s.join("speaker-embedding.onnx"),
    }
}

/// Số luồng cho hai mạng. Giữ bằng STT để không giành CPU với nhau khi ai đó
/// nối hai bước chạy liền.
const SO_LUONG: usize = 8;

pub fn build_args(m: &ModelTachNguoiNoi, wav: &Path, so_nguoi: u32) -> Vec<String> {
    vec![
        // `--num-threads` KHÔNG tồn tại ở lệnh này (chỉ STT có), truyền vào là
        // nó bỏ chạy ngay với mã 127. Phải đặt riêng cho từng mạng.
        format!("--segmentation.pyannote-model={}", m.segmentation.display()),
        format!("--segmentation.num-threads={SO_LUONG}"),
        format!("--embedding.model={}", m.embedding.display()),
        format!("--embedding.num-threads={SO_LUONG}"),
        format!("--clustering.num-clusters={so_nguoi}"),
        wav.display().to_string(),
    ]
}

/// Đọc danh sách đoạn từ STDOUT của công cụ.
///
/// Khớp CẢ DÒNG, không phải "dòng nào có `--` thì lấy". Lý do đã trả giá một
/// lần: stderr in `progress 12.34%` liên tục trong lúc chạy, và nếu ai đó gộp
/// hai luồng (`2>&1`) thì một dòng tiến độ chen vào giữa một dòng kết quả, đẻ
/// ra những dòng rác kiểu `35 -- 751.779 speaker_00` — một đoạn giả dài 12
/// phút nuốt trọn mọi cue khi gán theo độ chồng lấn, và cả phim ra đúng một
/// người nói mà không có lỗi nào báo.
///
/// Định dạng đã kiểm trên sherpa-onnx v1.13.8 win-x64, 2026-10-03:
/// STDOUT = một dòng cấu hình, dòng `Started`, rồi `<đầu> -- <cuối> speaker_NN`
/// với thời gian luôn có đúng ba chữ số thập phân. STDERR = `progress ...%`.
pub fn parse_output(stdout: &str) -> Vec<DoanNguoiNoi> {
    let mut ra = Vec::new();
    for dong in stdout.lines() {
        let d = dong.trim();
        let Some((a, rest)) = d.split_once(" -- ") else { continue };
        let Some((b, nguoi)) = rest.split_once(' ') else { continue };
        if !nguoi.starts_with("speaker_") || !nguoi[8..].chars().all(|c| c.is_ascii_digit()) {
            continue;
        }
        let (Ok(s), Ok(e)) = (giay(a), giay(b)) else { continue };
        if e > s {
            ra.push(DoanNguoiNoi {
                start_ms: s,
                end_ms: e,
                nguoi: nguoi.to_string(),
            });
        }
    }
    ra
}

/// Chuỗi giây dạng `123.456` sang mili-giây. Đòi đúng ba chữ số thập phân để
/// một dòng rác không lọt qua chỉ vì nó cũng có dấu chấm.
fn giay(s: &str) -> Result<u64, ()> {
    let s = s.trim();
    let (nguyen, le) = s.split_once('.').ok_or(())?;
    if le.len() != 3 || !le.chars().all(|c| c.is_ascii_digit()) {
        return Err(());
    }
    let nguyen: u64 = nguyen.parse().map_err(|_| ())?;
    let le: u64 = le.parse().map_err(|_| ())?;
    Ok(nguyen * 1000 + le)
}

/// Chạy công cụ. `on_tien_do` nhận phần trăm 0..100 đọc từ stderr.
pub fn chay(
    m: &ModelTachNguoiNoi,
    wav: &Path,
    so_nguoi: u32,
    on_tien_do: &mut dyn FnMut(f32),
) -> Result<Vec<DoanNguoiNoi>, PipelineError> {
    for (ten, p) in [("segmentation", &m.segmentation), ("embedding", &m.embedding)] {
        if !p.exists() {
            return Err(PipelineError::EngineMissing(format!(
                "model {ten} để tách người nói ({})",
                p.display()
            )));
        }
    }
    let mut cmd = std::process::Command::new(&m.exe);
    cmd.args(build_args(m, wav, so_nguoi))
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    let mut con = cmd.spawn().map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            PipelineError::EngineMissing("sherpa-onnx-offline-speaker-diarization".into())
        } else {
            PipelineError::Io(err.to_string())
        }
    })?;

    // Rút cạn stderr trên LUỒNG GỌI để báo tiến độ, còn stdout đọc ở luồng
    // riêng: cả hai ống đều phải có người đọc, kẻo ống nào đầy trước thì tiến
    // trình con chặn ở write và treo vĩnh viễn — cùng cái bẫy đã ghi trong
    // `tts/procio.rs`. Ở đây stderr là ống chảy xiết (hàng trăm dòng tiến độ)
    // nên nó phải nằm ở luồng gọi, không phải luồng phụ.
    let out = con.stdout.take().expect("đã piped");
    let doc_stdout = std::thread::spawn(move || {
        let mut s = String::new();
        let mut r = BufReader::new(out);
        let mut dem = Vec::new();
        while r.read_until(b'\n', &mut dem).unwrap_or(0) > 0 {
            s.push_str(&String::from_utf8_lossy(&dem));
            dem.clear();
        }
        s
    });
    if let Some(err) = con.stderr.take() {
        let mut r = BufReader::new(err);
        let mut dem = Vec::new();
        while r.read_until(b'\n', &mut dem).unwrap_or(0) > 0 {
            let dong = String::from_utf8_lossy(&dem);
            if let Some(p) = dong.trim().strip_prefix("progress ") {
                if let Ok(v) = p.trim_end_matches('%').parse::<f32>() {
                    on_tien_do(v);
                }
            }
            dem.clear();
        }
    }
    let stdout = doc_stdout.join().unwrap_or_default();
    let ma = con.wait().map_err(|e| PipelineError::Io(e.to_string()))?;
    if !ma.success() {
        return Err(PipelineError::EngineFailed {
            stage: "tach_nguoi_noi".into(),
            code: ma.code().unwrap_or(-1),
            stderr: stdout.lines().take(10).collect::<Vec<_>>().join("\n"),
        });
    }
    Ok(parse_output(&stdout))
}

/// Gán mỗi cue cho người nói CHỒNG LẤN NHIỀU NHẤT với nó.
///
/// `None` nghĩa là không đoạn nào chạm vào cue — gần như luôn là cue rác do
/// STT sinh ra trên nhạc nền hoặc tiếng động (`.`, `Yeah.`, `さ。`). Đo trên
/// phim mẫu: 45/193 cue rơi vào nhóm này, và đọc tay thì đúng là rác.
pub fn gan_cho_cue(cues: &[Segment], doan: &[DoanNguoiNoi]) -> Vec<Option<String>> {
    cues.iter()
        .map(|c| {
            let mut tot: Option<(&str, u64)> = None;
            for d in doan {
                let dau = c.start_ms.max(d.start_ms);
                let cuoi = c.end_ms.min(d.end_ms);
                if cuoi <= dau {
                    continue;
                }
                let chong = cuoi - dau;
                if tot.is_none_or(|(_, x)| chong > x) {
                    tot = Some((d.nguoi.as_str(), chong));
                }
            }
            tot.map(|(n, _)| n.to_string())
        })
        .collect()
}
