use crate::error::PipelineError;

#[derive(Clone, Debug)]
pub struct Segment {
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
}

fn ts(ms: u64) -> String {
    let h = ms / 3_600_000;
    let m = ms / 60_000 % 60;
    let s = ms / 1000 % 60;
    let mm = ms % 1000;
    format!("{:02}:{:02}:{:02},{:03}", h, m, s, mm)
}

pub fn write_srt(segs: &[Segment]) -> String {
    let mut out = String::new();
    for (i, s) in segs.iter().enumerate() {
        out.push_str(&format!(
            "{}\r\n{} --> {}\r\n{}\r\n\r\n",
            i + 1,
            ts(s.start_ms),
            ts(s.end_ms),
            s.text
        ));
    }
    out
}

fn parse_ts(s: &str) -> Option<u64> {
    // "HH:MM:SS,mmm" (chấp nhận '.' thay ',')
    let s = s.trim().replace('.', ",");
    let (hms, ms) = s.split_once(',')?;
    let mut it = hms.split(':');
    let h: u64 = it.next()?.parse().ok()?;
    let m: u64 = it.next()?.parse().ok()?;
    let sec: u64 = it.next()?.parse().ok()?;
    let ms: u64 = ms.parse().ok()?;
    Some(h * 3_600_000 + m * 60_000 + sec * 1000 + ms)
}

pub fn parse_srt(text: &str) -> Result<Vec<Segment>, PipelineError> {
    let text = text.trim_start_matches('\u{feff}').replace("\r\n", "\n");
    let mut segs = Vec::new();
    for block in text.split("\n\n").map(str::trim).filter(|b| !b.is_empty()) {
        let mut lines = block.lines();
        let bad = || PipelineError::EngineFailed { stage: "srt_parse".into(), code: 0, stderr: block.to_string() };
        let _index = lines.next().ok_or_else(bad)?;
        let timing = lines.next().ok_or_else(bad)?;
        let (a, b) = timing.split_once("-->").ok_or_else(bad)?;
        let (start_ms, end_ms) = (parse_ts(a).ok_or_else(bad)?, parse_ts(b).ok_or_else(bad)?);
        let text = lines.collect::<Vec<_>>().join("\n");
        segs.push(Segment { start_ms, end_ms, text });
    }
    Ok(segs)
}

/// Số ký tự tối đa cho MỘT dòng phụ đề.
///
/// 42 là mức các hãng phụ đề hay dùng cho một dòng trên khung 16:9. Đây chỉ là
/// TRẦN, không phải đích: hàm cắt bám ranh giới câu trước, nên câu ngắn vẫn giữ
/// nguyên độ dài tự nhiên của nó.
pub const MAX_MOT_DONG: usize = 42;

/// Cắt một chuỗi thành các mảnh không quá `toi_da` ký tự, ưu tiên ranh giới tự
/// nhiên: hết câu → dấu ngắt trong câu → khoảng trắng.
///
/// Không bao giờ cắt giữa từ. Nếu một "từ" dài hơn cả giới hạn (đường dẫn, URL)
/// thì để nguyên, vì cắt nó ra chỉ làm khó đọc hơn.
fn cat_van_ban(text: &str, toi_da: usize) -> Vec<String> {
    let text = text.trim();
    if text.is_empty() {
        return Vec::new();
    }
    if text.chars().count() <= toi_da {
        return vec![text.to_string()];
    }

    // Bước 1: tách theo câu. Giữ lại dấu kết câu ở cuối mảnh.
    let mut cau: Vec<String> = Vec::new();
    let mut hien_tai = String::new();
    let ky_tu: Vec<char> = text.chars().collect();
    for (i, &c) in ky_tu.iter().enumerate() {
        hien_tai.push(c);
        if !matches!(c, '.' | '?' | '!' | '…') {
            continue;
        }
        // CHỈ coi là hết câu khi sau dấu là khoảng trắng hoặc hết chuỗi.
        //
        // Cắt ở mọi dấu chấm là sai với chính loại nội dung app này phục vụ:
        // "1.500.000 đồng" thành ba cue, "example.com" vỡ đôi, "v.v." vụn ra.
        // Video bán hàng đầy giá tiền nên đây không phải ca hiếm.
        let het_chuoi = i + 1 == ky_tu.len();
        let sau_la_trang = ky_tu.get(i + 1).is_some_and(|n| n.is_whitespace());
        if het_chuoi || sau_la_trang {
            let t = hien_tai.trim();
            if !t.is_empty() {
                cau.push(t.to_string());
            }
            hien_tai.clear();
        }
    }
    let con = hien_tai.trim();
    if !con.is_empty() {
        cau.push(con.to_string());
    }

    // Bước 2: câu nào vẫn quá dài thì cắt tiếp ở dấu ngắt trong câu, rồi tới
    // khoảng trắng.
    let mut ra: Vec<String> = Vec::new();
    for c in cau {
        if c.chars().count() <= toi_da {
            ra.push(c);
            continue;
        }
        ra.extend(cat_theo_dau_ngat(&c, toi_da));
    }
    ra
}

/// Hư từ MỞ NGỮ: gần như không bao giờ là âm tiết sau của một từ ghép, nên
/// ngắt dòng ngay trước chúng luôn an toàn.
///
/// Vì sao cần bảng này: tiếng Việt viết rời từng âm tiết, nên khoảng trắng
/// KHÔNG phải ranh giới từ. Cắt ở khoảng trắng gần nhất trước trần ký tự là
/// cách đúng với tiếng Anh nhưng sai với tiếng Việt — "báo cáo kiểm" rồi "tra
/// chi tiết" bổ đôi cả "kiểm tra" lẫn "chi tiết", mà hai mảnh còn hiện ở hai
/// thời điểm khác nhau.
///
/// Hư từ là lớp từ ĐÓNG — vài trăm từ, không sinh thêm — nên bảng cứng là đủ.
/// Liệt kê từ ghép thì ngược lại: vô hạn, không bao giờ đủ.
///
/// CỐ Ý không có: `nào` `gì` `ai` `đâu` `sao` `này` `kia` `đó` `ấy`. Chúng
/// đứng CUỐI ngữ đoạn ("thế nào", "cái này"), ngắt trước chúng còn gãy hơn.
const HU_TU_MO_NGU: &[&str] = &[
    "và", "nhưng", "mà", "hoặc", "nếu", "dù", "tuy", "vì", "bởi", "nên", "rồi",
    "còn", "khi", "để", "của", "cho", "trong", "thì",
    "các", "những", "mọi", "mỗi", "một", "vài",
    "đã", "đang", "sẽ", "vẫn", "cũng", "chỉ", "lại", "rất", "quá", "càng",
    "hãy", "đừng", "không", "chưa", "chẳng",
    "tôi", "tao", "tớ", "mình", "chúng", "bạn", "cậu", "mày", "nó", "hắn",
];

/// Hư từ HAI MẶT: mở ngữ được, nhưng cũng hay làm âm tiết sau của từ ghép —
/// `bị` trong "chuẩn bị", `ông` trong "đàn ông", `họ` trong "bọn họ", `người`
/// trong "loài người", `tại` trong "tồn tại", `với` trong "so với", `do`
/// trong "lý do". Chỉ ngắt trước chúng khi không còn chỗ nào khá hơn.
///
/// Danh sách này rút ra từ ĐO THẬT: chạy bộ cắt trên phụ đề 193 cue của một
/// dự án rồi đọc hết 217 chỗ ngắt, nhặt ra những cặp bị bổ đôi.
const HU_TU_HAI_MAT: &[&str] = &[
    "với", "cùng", "hay", "song", "dẫu", "lúc",
    "bằng", "theo", "về", "từ", "đến", "tới", "tại", "ở", "trên", "dưới",
    "ngoài", "giữa", "sau", "trước", "qua", "bên", "do",
    "vừa", "mới", "từng", "hơi", "khá", "cứ", "chớ", "được", "bị", "phải",
    "có", "là",
    "cái", "con", "chiếc", "người",
    "ta", "anh", "chị", "em", "ông", "bà", "cô", "chú", "bác", "cháu", "họ",
];

fn trong_bang(bang: &[&str], t: &str) -> bool {
    let s = t.trim_matches(|c: char| !c.is_alphanumeric()).to_lowercase();
    bang.contains(&s.as_str())
}

/// Chấm điểm một chỗ ngắt dòng giữa `truoc` và `sau`. Càng cao càng tốt;
/// 0 nghĩa là cắt bừa.
///
/// Để `pub` cho bin `do_ngat` chấm được chất lượng ngắt trên phụ đề thật;
/// đây là chỗ duy nhất quyết định cắt ở đâu nên phải đo được.
pub fn diem_ngat(truoc: &str, sau: &str) -> u8 {
    let ket = truoc.chars().last().unwrap_or(' ');
    if matches!(ket, '.' | '?' | '!' | '…') {
        return 4;
    }
    if matches!(ket, ',' | ';' | ':' | '—' | '–') {
        return 3;
    }
    // Không ngắt giữa HAI hư từ ("còn | có", "đã | được"): chúng dính thành
    // một cụm, ngắt ở đó đọc còn gãy hơn.
    if trong_bang(HU_TU_MO_NGU, truoc) || trong_bang(HU_TU_HAI_MAT, truoc) {
        return 0;
    }
    // Không tách con số khỏi đơn vị: "7 | ngày", "100 | tệ". Video bán hàng
    // đầy những cụm như vậy.
    if truoc.chars().any(|c| c.is_ascii_digit()) {
        return 0;
    }
    if trong_bang(HU_TU_MO_NGU, sau) {
        return 2;
    }
    if trong_bang(HU_TU_HAI_MAT, sau) {
        return 1;
    }
    0
}

fn do_dai(tu: &[&str]) -> usize {
    tu.iter().map(|t| t.chars().count()).sum::<usize>() + tu.len().saturating_sub(1)
}

/// Cắt một câu dài: lấp dòng tới trần ký tự rồi chọn chỗ ngắt ĐIỂM CAO NHẤT
/// trong dòng, hoà điểm thì lấy chỗ muộn nhất cho dòng đầy.
fn cat_theo_dau_ngat(cau: &str, toi_da: usize) -> Vec<String> {
    let tu: Vec<&str> = cau.split_whitespace().collect();
    let mut ra: Vec<String> = Vec::new();
    let mut dau = 0usize;

    while dau < tu.len() {
        // `het` = token đầu tiên KHÔNG còn vừa dòng. Luôn nhận ít nhất một
        // token, kể cả khi nó dài hơn cả trần (đường dẫn, URL).
        let mut het = dau;
        let mut dai = 0usize;
        while het < tu.len() {
            let them = tu[het].chars().count() + usize::from(het > dau);
            if het > dau && dai + them > toi_da {
                break;
            }
            dai += them;
            het += 1;
        }
        if het >= tu.len() {
            ra.push(tu[dau..].join(" "));
            break;
        }

        // Một phần ba trần, KHÔNG phải một nửa. Đo thật: với ngưỡng một nửa
        // (21 ký tự), câu "Sự nóng lên liên tục đang làm thay đổi chu kỳ..."
        // không có chỗ ngắt sạch nào đủ dài — chỗ sạch duy nhất là trước
        // "đang", dài 20 ký tự — nên nó rơi về cắt bừa và bổ đôi "chu kỳ".
        // Một dòng hơi ngắn vẫn đọc được; một từ bị bổ đôi thì không.
        let toi_thieu = toi_da / 3;
        let mut chon = het;
        let mut diem_tot = 0u8;
        let mut k = het;
        while k > dau + 1 {
            if do_dai(&tu[dau..k]) >= toi_thieu {
                let d = diem_ngat(tu[k - 1], tu[k]);
                if d > diem_tot {
                    diem_tot = d;
                    chon = k;
                }
            }
            k -= 1;
        }
        ra.push(tu[dau..chon].join(" "));
        dau = chon;
    }
    ra
}

/// Cắt các cue dài thành nhiều cue ngắn, chia lại thời gian theo tỉ lệ số ký tự.
///
/// Cue ngắn sau khi cắt được GIỮ NGUYÊN, không ghép lại — người dùng đã chọn
/// như vậy. Cue rỗng lời hoặc có khung thời gian không hợp lệ được giữ nguyên
/// thay vì bị bỏ, để số cue không âm thầm giảm đi.
pub fn cat_cue_dai(segs: &[Segment], toi_da: usize) -> Vec<Segment> {
    let mut ra: Vec<Segment> = Vec::new();
    for s in segs {
        let manh = cat_van_ban(&s.text, toi_da);
        if manh.len() <= 1 || s.end_ms <= s.start_ms {
            ra.push(s.clone());
            continue;
        }
        // Chia thời gian theo số ký tự: mảnh dài đọc lâu hơn thì hiện lâu hơn.
        let tong: usize = manh.iter().map(|m| m.chars().count()).sum();
        let khoang = s.end_ms - s.start_ms;
        let mut moc = s.start_ms;
        for (i, m) in manh.iter().enumerate() {
            let cuoi = if i + 1 == manh.len() {
                s.end_ms
            } else {
                let phan: u64 = manh[..=i].iter().map(|x| x.chars().count() as u64).sum();
                s.start_ms + khoang * phan / tong.max(1) as u64
            };
            ra.push(Segment {
                start_ms: moc,
                end_ms: cuoi.max(moc + 1),
                text: m.clone(),
            });
            moc = cuoi.max(moc + 1);
        }
    }
    ra
}
