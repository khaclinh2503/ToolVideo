use crate::{config::TranslateConfig, error::PipelineError, srt::Segment};

pub mod google_free;
pub mod llama_server;
pub mod llm_tren_may;
pub mod openai_compat;

/// Hạn chờ cho endpoint LLM. Đo thật trên NVIDIA: một lô 40 cue mất 11–17 giây
/// với model đã tắt suy luận, nhưng 103–206 giây nếu nó vẫn nghĩ. 30 giây như cũ
/// cắt đứt gần như mọi lô thật; 240 giây đủ rộng mà vẫn không treo app cả buổi.
pub(crate) const CHO_LLM: std::time::Duration = std::time::Duration::from_secs(240);

/// Hạn chờ cho Google miễn phí: chỉ là một GET nhỏ, chờ lâu là hỏng thật.
pub(crate) const CHO_NHANH: std::time::Duration = std::time::Duration::from_secs(30);

pub(crate) fn http_client_voi(cho: std::time::Duration) -> Result<reqwest::blocking::Client, PipelineError> {
    reqwest::blocking::Client::builder()
        .timeout(cho)
        .user_agent("DichVideo-Local/0.1")
        .build()
        .map_err(|e| PipelineError::ProviderError {
            provider: "http".into(),
            status: None,
            msg: e.to_string(),
        })
}

pub(crate) fn http_client() -> Result<reqwest::blocking::Client, PipelineError> {
    http_client_voi(CHO_NHANH)
}

/// Host của `url` có phải loopback không (`127.x.x.x`, `localhost`, `::1`).
///
/// Tách chuỗi bằng tay thay vì kéo thêm crate `url`: chỉ cần phần authority, và
/// mọi base_url đi qua đây đều do app tự dựng hoặc do người dùng gõ vào một ô
/// duy nhất.
pub fn la_loopback(url: &str) -> bool {
    let sau_scheme = url.split_once("://").map(|(_, s)| s).unwrap_or(url);
    // Cắt đường dẫn/query/fragment, rồi cắt userinfo nếu có.
    let authority = sau_scheme
        .split(['/', '?', '#'])
        .next()
        .unwrap_or("");
    let authority = authority.rsplit_once('@').map(|(_, h)| h).unwrap_or(authority);
    // IPv6 trong ngoặc vuông: `[::1]:8080`.
    let host = if let Some(dong) = authority.strip_prefix('[') {
        match dong.split_once(']') {
            Some((h, _)) => h,
            None => dong,
        }
    } else {
        authority.split(':').next().unwrap_or("")
    };
    if host.eq_ignore_ascii_case("localhost") {
        return true;
    }
    host.parse::<std::net::IpAddr>()
        .map(|ip| ip.is_loopback())
        .unwrap_or(false)
}

/// Client HTTP hướng tới đúng `url` này.
///
/// Vì sao không dùng thẳng `http_client_voi`: `reqwest` 0.12 đọc
/// `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY` từ môi trường theo mặc định và KHÔNG
/// tự miễn trừ địa chỉ loopback. Trên một máy công ty có đặt các biến đó, mọi
/// request tới `127.0.0.1` — cả lần thăm dò sẵn sàng lẫn từng lô dịch của
/// `llm_tren_may` — đều bị đẩy ra proxy rồi hỏng hoặc treo, đúng trong môi
/// trường mà "không cần mạng" là lý do tồn tại của nhà cung cấp này. Biểu hiện
/// của nó là một lần hết giờ 180 giây không rõ nguyên nhân.
///
/// Xét theo HOST chứ không theo tên nhà cung cấp: `google_free` vẫn cần proxy
/// trên chính cái máy đó (nó ra Internet thật), còn một `openai_compat` mà
/// người dùng trỏ vào LM Studio ở máy mình thì cũng phải được miễn trừ y như
/// `llm_tren_may`. Host mới là thứ quyết định, không phải nhãn provider.
pub(crate) fn http_client_cho_url(
    url: &str,
    cho: std::time::Duration,
) -> Result<reqwest::blocking::Client, PipelineError> {
    if !la_loopback(url) {
        return http_client_voi(cho);
    }
    reqwest::blocking::Client::builder()
        .timeout(cho)
        .user_agent("DichVideo-Local/0.1")
        .no_proxy()
        .build()
        .map_err(|e| PipelineError::ProviderError {
            provider: "http".into(),
            status: None,
            msg: e.to_string(),
        })
}

pub(crate) fn map_http_err(provider: &str, e: reqwest::Error) -> PipelineError {
    let msg = if e.is_timeout() {
        "Hết thời gian chờ".to_string()
    } else {
        e.to_string()
    };
    PipelineError::ProviderError {
        provider: provider.into(),
        status: e.status().map(|s| s.as_u16()),
        msg,
    }
}

pub trait TranslateProvider {
    fn id(&self) -> &'static str;
    fn batch_size(&self) -> usize;
    fn translate_batch(&self, texts: &[&str], src: &str, tgt: &str)
        -> Result<Vec<String>, PipelineError>;

    /// Liệt kê tên riêng trong một khối văn bản, kèm phiên âm đề xuất.
    ///
    /// Trả `Err` mặc định: `google_free` không làm được việc này, và giả vờ
    /// trả danh sách rỗng sẽ bị hiểu nhầm thành "phim không có tên riêng nào".
    fn liet_ke_ten_rieng(&self, _van_ban: &str) -> Result<Vec<TenRieng>, PipelineError> {
        Err(PipelineError::ProviderError {
            provider: self.id().into(),
            status: None,
            msg: "nhà cung cấp này không tự tìm được tên riêng".into(),
        })
    }

    /// Dịch một lô CÓ KÈM sổ tay tên riêng của dự án.
    ///
    /// Mặc định bỏ qua sổ tay và gọi `translate_batch` — `google_free` không
    /// nhận hướng dẫn nào cả, ép nó cũng vô ích. Nhà cung cấp dùng LLM thì
    /// ghi đè để gắn sổ vào prompt.
    ///
    /// Nhét vào prompt KHÔNG đủ để bảo đảm gì: model vẫn có thể lờ đi. Thứ
    /// bảo đảm là phần đối chiếu sau khi dịch ở `translate_segments`.
    fn translate_batch_voi_so_tay(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
        _so_tay: &[&crate::so_tay::Muc],
    ) -> Result<Vec<String>, PipelineError> {
        self.translate_batch(texts, src, tgt)
    }

    /// Dịch lại MỘT cue mà bản dịch trước bị lỗi, kèm mô tả lỗi bằng lời.
    ///
    /// `mo_ta_loi` nói rõ chỗ hỏng — chữ nào còn sót, hay tên riêng nào gọi
    /// sai — để nhà cung cấp chỉ mặt được cho model. Một đường duy nhất cho
    /// mọi kiểu sửa: thêm cơ chế thứ hai song song là chắc chắn lệch nhau.
    ///
    /// Mặc định là gửi lại y nguyên qua `translate_batch`. Đo trên dữ liệu thật
    /// cho thấy cách đó gần như vô ích — ở `temperature 0.2` model trả lại đúng
    /// cái cũ, 1/3 cue khỏi. Nhà cung cấp nào dựng được một yêu cầu SỬA LỖI thì
    /// nên ghi đè; `OpenAiCompat` có ghi đè.
    fn dich_lai_sua_loi(
        &self,
        text: &str,
        _mo_ta_loi: &str,
        src: &str,
        tgt: &str,
    ) -> Result<String, PipelineError> {
        let v = self.translate_batch(&[text], src, tgt)?;
        v.into_iter().next().ok_or_else(|| PipelineError::ProviderError {
            provider: self.id().into(),
            status: None,
            msg: "dịch lại không trả về dòng nào".into(),
        })
    }
}

/// Trim, then collapse runs of 2+ newlines (including "\r\n\r\n"-style runs)
/// into a single '\n' so the resulting text re-parses cleanly as SRT.
fn normalize_translated(s: &str) -> String {
    let s = s.trim();
    let mut out = String::with_capacity(s.len());
    let mut newline_run = 0usize;
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\r' {
            // treat \r (and \r\n) as part of a newline run
            if chars.peek() == Some(&'\n') {
                chars.next();
            }
            newline_run += 1;
            continue;
        }
        if c == '\n' {
            newline_run += 1;
            continue;
        }
        if newline_run > 0 {
            out.push('\n');
            newline_run = 0;
        }
        out.push(c);
    }
    // trailing newline run is dropped (we already trimmed, but be safe)
    out
}

pub fn translate_segments(
    p: &dyn TranslateProvider,
    segs: &[Segment],
    src: &str,
    tgt: &str,
) -> Result<Vec<Segment>, PipelineError> {
    translate_segments_voi_so_tay(p, segs, src, tgt, &crate::so_tay::SoTay::default())
}

/// Như `translate_segments` nhưng áp sổ tay tên riêng của dự án.
///
/// Sổ tay được dùng HAI lần cho mỗi lô: nhét phần liên quan vào prompt
/// trước khi dịch, và đối chiếu sau khi dịch. Chỉ nhét vào prompt là
/// không bảo đảm được gì — phiên đo trước cho thấy model lờ quy tắc trong
/// prompt rất thoải mái; phần đối chiếu mới là thứ bắt buộc được.
pub fn translate_segments_voi_so_tay(
    p: &dyn TranslateProvider,
    segs: &[Segment],
    src: &str,
    tgt: &str,
    so_tay: &crate::so_tay::SoTay,
) -> Result<Vec<Segment>, PipelineError> {
    translate_segments_co_tien_do(p, segs, src, tgt, so_tay, &mut |_, _| {})
}

/// Như trên nhưng báo tiến độ sau MỖI LÔ: `(số câu đã dịch, tổng số câu)`.
///
/// Báo theo lô chứ không theo câu vì một request trả về cả lô 40 câu cùng
/// lúc — không có gì để báo ở giữa. Lô 40 câu mất khoảng 26 giây, nên thanh
/// tiến độ nhích mỗi nửa phút; đủ để người dùng biết app còn sống, mà đó
/// chính là việc nó phải làm.
///
/// Nuốt lỗi của callback là cố ý: vẽ màn hình hỏng không được làm hỏng bản
/// dịch đã tốn vài phút.
pub fn translate_segments_co_tien_do(
    p: &dyn TranslateProvider,
    segs: &[Segment],
    src: &str,
    tgt: &str,
    so_tay: &crate::so_tay::SoTay,
    on_tien_do: &mut dyn FnMut(usize, usize),
) -> Result<Vec<Segment>, PipelineError> {
    let mut out = Vec::with_capacity(segs.len());
    let bs = p.batch_size().max(1);
    for chunk in segs.chunks(bs) {
        // Only send non-blank texts to the provider; blank inputs (empty or
        // whitespace-only) map straight to "" without hitting the network.
        let mut idx: Vec<usize> = Vec::new();
        let mut texts: Vec<&str> = Vec::new();
        for (i, s) in chunk.iter().enumerate() {
            if !s.text.trim().is_empty() {
                idx.push(i);
                texts.push(s.text.as_str());
            }
        }

        let mut translated_by_idx: Vec<String> = vec![String::new(); chunk.len()];
        if !texts.is_empty() {
            let lien_quan = crate::so_tay::muc_lien_quan(so_tay, &texts);
            let translated = p.translate_batch_voi_so_tay(&texts, src, tgt, &lien_quan)?;
            if translated.len() != texts.len() {
                return Err(PipelineError::ProviderError {
                    provider: p.id().into(),
                    status: None,
                    msg: format!("trả {} dòng, cần {}", translated.len(), texts.len()),
                });
            }
            for (pos, t) in idx.iter().zip(translated) {
                translated_by_idx[*pos] = normalize_translated(&t);
            }
        }

        // Lệch hàng: nhà cung cấp trả đủ số item, chỉ số vẫn liên tục, nhưng
        // nội dung dịch chuyển đi vài dòng — phụ đề chạy sai với tiếng nói suốt
        // phim mà không lớp kiểm nào cũ bắt được. Chưa bắt gặp model nào thật sự
        // lệch — cả Gemma lẫn Qwen đều 18/19 mốc neo trên phim mẫu — nhưng hậu
        // quả quá nặng để chờ gặp rồi mới chặn.
        //
        // Thử lại cả lô trước khi bỏ cuộc, nhưng CHỈ nhận khi lệch ít đi — hệt
        // luật dùng cho cue sót chữ Hán.
        let mut lech = cue_lech(chunk, &idx, &translated_by_idx);
        if lech.len() >= TOI_THIEU_LECH {
            if let Ok(lai) = p.translate_batch(&texts, src, tgt) {
                if lai.len() == texts.len() {
                    let mut thu: Vec<String> = vec![String::new(); chunk.len()];
                    for (pos, t) in idx.iter().zip(lai) {
                        thu[*pos] = normalize_translated(&t);
                    }
                    let lech_moi = cue_lech(chunk, &idx, &thu);
                    if lech_moi.len() < lech.len() {
                        translated_by_idx = thu;
                        lech = lech_moi;
                    }
                }
            }
        }
        // Vẫn lệch thì DỪNG HẲN. Một file phụ đề lệch hàng tệ hơn một lỗi rõ
        // ràng: người dùng không nhìn ra nó sai, chỉ thấy phim xem rất khó hiểu.
        if lech.len() >= TOI_THIEU_LECH {
            let vi_du: Vec<String> = lech
                .iter()
                .take(3)
                .map(|i| chunk[*i].text.chars().take(24).collect::<String>())
                .collect();
            return Err(PipelineError::ProviderError {
                provider: p.id().into(),
                status: None,
                msg: format!(
                    "bản dịch bị lệch hàng: {} cue có con số của câu khác trong cùng lô \
                     (ví dụ: {}). Thử lại, hoặc đổi sang nhà cung cấp dịch khác.",
                    lech.len(),
                    vi_du.join(" | ")
                ),
            });
        }

        // Sổ tay: cue nào gọi sai tên riêng thì gửi đi sửa. Đây là phần BẮT
        // BUỘC được, khác với phần nhét sổ vào prompt ở trên.
        sua_cue_sai_so_tay(p, chunk, &idx, &mut translated_by_idx, src, tgt, so_tay);

        // Lô lớn thỉnh thoảng để sót vài chữ Hán giữa câu tiếng Việt. Đo trên
        // 193 cue thật: 2 cue dính, và đó là rác hiện thẳng lên màn hình chứ
        // không phải bản dịch vụng. Siết prompt đã thử và không chặn được.
        if ngon_ngu_khong_dung_chu_dong_a(tgt) {
            dich_lai_cue_con_chu_dong_a(p, chunk, &idx, &mut translated_by_idx, src, tgt);
        }

        // Gán giới tính bừa cho tiếng chửi: 不要脸的东西 không nói người bị
        // chửi là nam hay nữ, nhưng "thằng"/"mụ" thì nói. Cảnh con gái mắng
        // con gái mà ra "Thằng vô liêm sỉ" là sai hẳn vai.
        dich_lai_cue_sai_gioi_tinh(p, chunk, &idx, &mut translated_by_idx, src, tgt);

        for (s, t) in chunk.iter().zip(translated_by_idx) {
            out.push(Segment {
                start_ms: s.start_ms,
                end_ms: s.end_ms,
                text: t,
            });
        }
        on_tien_do(out.len(), segs.len());
    }
    Ok(out)
}

/// Số cue tối đa chịu dịch lại trong một lô.
///
/// Dịch lại là mỗi cue một request, nên phải có trần. Lác đác một hai cue thì
/// đây là lỗi ngẫu nhiên, gửi riêng từng cue gần như chắc chắn khỏi. Cả lô
/// cùng sót thì là hỏng hệ thống — sai ngôn ngữ đích, model lẫn lộn — và 40
/// request nữa cũng không chữa được, chỉ tổ chậm và tốn tiền với nhà cung cấp
/// cloud.
const TOI_DA_DICH_LAI: usize = 8;

/// Ngôn ngữ đích có tự viết bằng chữ Hán hay kana không.
///
/// Với tiếng Trung, tiếng Nhật thì "còn chữ Hán" là bản dịch ĐÚNG, không phải
/// dịch sót — không được đem đi kiểm.
fn ngon_ngu_khong_dung_chu_dong_a(tgt: &str) -> bool {
    let ma = tgt.trim().to_ascii_lowercase();
    let goc = ma.split(['-', '_']).next().unwrap_or("");
    !matches!(goc, "zh" | "ja" | "yue" | "wuu" | "cmn" | "lzh")
}

/// Chuỗi còn sót chữ Hán hoặc kana không.
///
/// Gộp cả kana vì nguồn có thể là tiếng Nhật (bộ 193 cue thật có một câu
/// `助けてして`); bỏ sót kana thì kiểm nửa vời.
pub fn con_chu_dong_a(s: &str) -> bool {
    s.chars().any(la_chu_dong_a)
}

/// Đếm chữ Đông Á còn sót, để so bản sửa với bản cũ.
pub fn dem_chu_dong_a(s: &str) -> usize {
    s.chars().filter(|c| la_chu_dong_a(*c)).count()
}

fn la_chu_dong_a(c: char) -> bool {
    matches!(c as u32,
        0x3040..=0x30FF   // hiragana, katakana
        | 0x3400..=0x4DBF // CJK mở rộng A
        | 0x4E00..=0x9FFF // CJK thông dụng
        | 0xF900..=0xFAFF // CJK tương thích
    )
}

/// Một tên riêng model tìm thấy trong phụ đề.
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct TenRieng {
    pub goc: String,
    pub dich: String,
    /// "người", "vật nuôi", "địa danh", "thương hiệu"… Đi thẳng vào ô ghi chú
    /// của sổ tay, và cũng được gửi kèm khi sửa cue vì vai đổi cách dịch.
    #[serde(default)]
    pub loai: String,
}

/// Từ xưng hô họ hàng — KHÔNG BAO GIỜ được vào sổ tên riêng.
///
/// Model nhận nhầm chúng thành tên người: đo trên phim mẫu, nó trả `姐夫`
/// (anh rể) dưới dạng tên người kèm phiên âm "Chị Phu". Một mục như vậy vào
/// sổ sẽ ÉP mọi cue có `姐夫` phải ra "Chị Phu", phá đúng bảng quan hệ họ hàng
/// trong prompt ngữ cảnh phim — thứ đã đo được 0/4 ⇒ 4/4. Sổ tay mạnh hơn
/// prompt vì nó có đối chiếu bắt buộc, nên một mục sai ở đây hại hơn hẳn.
const TU_HO_HANG: &[&str] = &[
    "姐夫", "嫂子", "姐姐", "妹妹", "哥哥", "弟弟", "爸爸", "妈妈", "爷爷",
    "奶奶", "叔叔", "阿姨", "舅舅", "姑姑", "儿子", "女儿", "老婆", "老公",
    // Đo thêm ở vòng sau: 娘 (mẹ) và 娃娃 (em bé) cũng bị trả về như tên người,
    // ép thành "Nương" và "Oa Oa".
    "娘", "娃娃", "孩子", "宝贝",
];

/// Hậu tố chức danh / xưng hô — `họ + hậu tố` KHÔNG phải tên riêng.
///
/// Đo trên phim mẫu: model trả `林老师` và ép sổ dịch thành "Lâm Giáo sư",
/// trong khi bản không có sổ ra "Cô giáo Lâm" — đúng tiếng Việt hơn hẳn.
/// `陈叔` ra "Trần thúc" thay vì "chú Trần", `张哥` ra "Trương ca" thay vì
/// "anh Trương". Tiếng Việt đặt chức danh TRƯỚC họ, nên ép cả cụm theo thứ tự
/// Hán luôn luôn sai. Phần họ vẫn được dịch đúng nhờ luật phiên âm trong
/// prompt, không cần sổ.
const HAU_TO_CHUC_DANH: &[&str] = &[
    "老师", "医生", "教授", "大夫", "先生", "小姐", "老板", "总",
    "叔", "哥", "姐", "妈", "爸", "婶", "嫂", "爷", "奶",
];

/// Tên riêng dài hơn chừng này chữ gần như chắc chắn là một cụm mô tả.
///
/// Đo trên phim mẫu: model trả `国家异常生态灾害应急处置部队` (13 chữ, "lực lượng
/// ứng phó thảm họa sinh thái bất thường quốc gia") như một tên riêng. Ép cả
/// cụm đó theo phiên âm Hán-Việt cho ra một câu không ai hiểu. Tên người và
/// tên thương hiệu thật hầu hết 2-5 chữ.
const TOI_DA_CHU_TRONG_TEN: usize = 6;

/// Dọn danh sách tên riêng model trả về.
///
/// Hai thứ ĐO ĐƯỢC trên phim thật, không phải phòng xa:
///
/// * Model trả CÙNG một tên hàng chục lần (`天损` 20 lần trong một lượt).
/// * Model CHÉP LẠI nguyên chữ Hán vào ô dịch thay vì phiên âm. Một mục như
///   vậy vào sổ sẽ thành luật "天损 phải dịch là 天损", tức là bắt buộc giữ
///   nguyên chữ Hán — đúng thứ mà nhánh sửa cue sót chữ Hán đang chống.
///
/// Chỗ model trượt lại đúng chỗ bảng Hán-Việt làm được: `天损` ra "Thiên Tốn",
/// `玄鸟` ra "Huyền Điểu". Nên lấy bảng đỡ, và vẫn là ĐỀ XUẤT để người dùng
/// duyệt chứ không tự đổ vào sổ.
pub fn don_ten_rieng(ds: Vec<TenRieng>) -> Vec<TenRieng> {
    let mut da = std::collections::HashSet::new();
    let mut ra = Vec::new();
    for mut t in ds {
        t.goc = t.goc.trim().to_string();
        t.dich = t.dich.trim().to_string();
        if t.goc.is_empty() || !da.insert(t.goc.clone()) {
            continue;
        }
        if TU_HO_HANG.contains(&t.goc.as_str()) {
            continue;
        }
        if t.goc.chars().count() > TOI_DA_CHU_TRONG_TEN {
            continue;
        }
        if HAU_TO_CHUC_DANH.iter().any(|h| t.goc.ends_with(h)) {
            continue;
        }
        if t.dich.is_empty() || con_chu_dong_a(&t.dich) {
            match crate::han_viet::doc_ten(&t.goc) {
                Some(a) => t.dich = a,
                // Bảng cũng chịu thì bỏ hẳn mục: thà thiếu một tên còn hơn
                // đưa vào sổ một luật bắt giữ nguyên chữ Hán.
                None => continue,
            }
        }
        ra.push(t);
    }
    ra
}

/// Gom phụ đề thành một khối để hỏi tên riêng.
///
/// Bỏ cue trùng nhau và cue không có chữ: phim mẫu 193 cue có tới 5 cue chỉ
/// là dấu chấm, và nhiều cue "Yeah." lặp lại — gửi hết chỉ tốn context.
pub fn gom_de_hoi_ten(segs: &[Segment]) -> String {
    let mut da: std::collections::HashSet<&str> = std::collections::HashSet::new();
    let mut ra: Vec<&str> = Vec::new();
    for s in segs {
        let t = s.text.trim();
        if t.chars().any(|c| c.is_alphanumeric()) && da.insert(t) {
            ra.push(t);
        }
    }
    ra.join("\n")
}

/// Số cue lệch tối thiểu trong một lô mới kết luận là lô bị dịch chuyển.
///
/// Một cue lệch có thể là trùng số ngẫu nhiên — hai câu cùng nhắc "200". Hai
/// cue trở lên cùng tìm thấy số của mình ở chỗ khác thì không còn là trùng hợp.
const TOI_THIEU_LECH: usize = 2;

/// Các cụm từ 2 chữ số trở lên, đã bỏ dấu phân cách hàng nghìn.
///
/// Bỏ dấu phân cách vì tiếng Việt viết `12.000` còn bản gốc viết `12000`; không
/// chuẩn hoá thì mọi con số lớn đều thành "lệch". Bỏ số một chữ số vì chúng
/// trùng nhau quá dễ và hay được viết thành chữ (`3` thành "ba").
pub fn cum_so(s: &str) -> Vec<String> {
    let ky_tu: Vec<char> = s.chars().collect();
    let mut phang = String::with_capacity(ky_tu.len());
    for (i, c) in ky_tu.iter().enumerate() {
        // Dấu chấm/phẩy KẸP GIỮA hai chữ số là phân cách, bỏ đi. Dấu cuối câu
        // thì giữ, nếu không `72.` và `72` lại hoá khác nhau theo hướng ngược.
        let la_phan_cach = matches!(c, '.' | ',')
            && i > 0
            && ky_tu[i - 1].is_ascii_digit()
            && ky_tu.get(i + 1).is_some_and(char::is_ascii_digit);
        if !la_phan_cach {
            phang.push(*c);
        }
    }
    let mut ra = Vec::new();
    let mut cum = String::new();
    for c in phang.chars().chain(std::iter::once(' ')) {
        if c.is_ascii_digit() {
            cum.push(c);
        } else if cum.len() >= 2 {
            ra.push(std::mem::take(&mut cum));
        } else {
            cum.clear();
        }
    }
    ra
}

/// Những cue mà con số của câu gốc lại nằm ở bản dịch của cue KHÁC trong lô.
///
/// Đây là dấu hiệu riêng của lệch hàng, và nó phân biệt được với thứ dễ nhầm
/// nhất: model viết số thành chữ (`29处` ra "hai mươi chín nơi"). Số viết thành
/// chữ thì biến mất khỏi cả lô nên KHÔNG tính là lệch; số của câu này mọc ở câu
/// kia mới là lệch. Phân biệt được chuyện đó là lý do phép kiểm này dám báo lỗi
/// thay vì chỉ cảnh báo.
fn cue_lech(chunk: &[Segment], idx: &[usize], dich: &[String]) -> Vec<usize> {
    let phang: Vec<Vec<String>> = dich.iter().map(|t| cum_so(t)).collect();
    let co_du = |o: usize, so: &[String]| so.iter().all(|n| phang[o].contains(n));
    let mut ra = Vec::new();
    for &p in idx {
        let so = cum_so(&chunk[p].text);
        if so.is_empty() || co_du(p, &so) {
            continue;
        }
        if idx.iter().any(|&q| q != p && co_du(q, &so)) {
            ra.push(p);
        }
    }
    ra
}

/// Những chữ Đông Á còn sót trong một chuỗi, mỗi chữ kể một lần, giữ thứ tự.
///
/// Đưa vào prompt sửa lỗi để chỉ mặt chỗ hỏng cho model.
pub fn chu_dong_a_trong(s: &str) -> String {
    let mut ra = String::new();
    for c in s.chars() {
        if la_chu_dong_a(c) && !ra.contains(c) {
            ra.push(c);
        }
    }
    ra
}

/// Gửi lại những cue gọi sai tên riêng trong sổ tay, mỗi cue một request.
///
/// CHỈ nhận bản sửa khi số mục vi phạm GIẢM — luật đơn điệu y như nhánh sửa
/// chữ Hán còn sót, nên một lần sửa hỏng không xoá mất bản dịch đang có.
///
/// Nuốt lỗi là cố ý: cả lô đã dịch xong, không được để một request vá lỗi
/// hỏng kéo sập toàn bộ bản dịch.
#[allow(clippy::too_many_arguments)]
fn sua_cue_sai_so_tay(
    p: &dyn TranslateProvider,
    chunk: &[Segment],
    idx: &[usize],
    translated_by_idx: &mut [String],
    src: &str,
    tgt: &str,
    so_tay: &crate::so_tay::SoTay,
) {
    if so_tay.muc.is_empty() {
        return;
    }
    let tat_ca: Vec<&crate::so_tay::Muc> = so_tay.muc.iter().collect();
    let mut can: Vec<usize> = Vec::new();
    for &i in idx {
        if !crate::so_tay::muc_vi_pham(&chunk[i].text, &translated_by_idx[i], &tat_ca).is_empty()
        {
            can.push(i);
        }
    }
    for i in can.into_iter().take(TOI_DA_DICH_LAI) {
        let hong = crate::so_tay::muc_vi_pham(&chunk[i].text, &translated_by_idx[i], &tat_ca);
        let mo_ta = format!("nó gọi sai tên riêng: {}", crate::so_tay::mo_ta_vi_pham(&hong));
        let Ok(lai) = p.dich_lai_sua_loi(chunk[i].text.as_str(), &mo_ta, src, tgt) else {
            continue;
        };
        let t = normalize_translated(&lai);
        if t.trim().is_empty() {
            continue;
        }
        if crate::so_tay::muc_vi_pham(&chunk[i].text, &t, &tat_ca).len() < hong.len() {
            translated_by_idx[i] = t;
        }
    }
}

/// Gửi lại riêng từng cue còn sót chữ Hán, mỗi cue một request.
///
/// Cue đứng một mình thì model không còn 39 cue khác tranh ngữ cảnh, nên gần
/// như luôn dịch trọn. CHỈ nhận kết quả mới khi nó thực sự khá hơn — có chữ và
/// bớt được chữ sót — để một lần dịch lại hỏng không xoá mất bản dịch đang có.
///
/// Nuốt lỗi là cố ý: cả lô đã dịch xong rồi, không được để một request vá lỗi
/// hỏng kéo sập toàn bộ bản dịch.
/// Danh từ chửi KHÔNG mang giới tính trong tiếng Trung.
///
/// 东西 "thứ/đồ", 家伙 "của nợ", 玩意 "cái của ấy", 货色 "thứ đồ" — không từ
/// nào cho biết người bị chửi là nam hay nữ. Tiếng Việt thì loại từ chửi lại
/// chia giới rõ: "thằng" là nam, "mụ" "ả" "con mẹ" là nữ, còn "đồ" thì trung
/// tính, dùng được cho cả hai.
///
/// Ca thật người dùng báo: 不要脸的东西 ra "Thằng vô liêm sỉ" trong cảnh con
/// gái mắng con gái. Bản gốc không hề nói giới tính — model tự bịa ra.
const TU_CHUI_KHONG_GIOI: &[&str] = &["东西", "家伙", "玩意", "货色"];

/// Loại từ tiếng Việt chỉ rõ giới tính của người bị nói tới.
///
/// Cố ý KHÔNG có "con" đứng một mình: "con chó", "con bé", "con người" đều vô
/// can, bắt nhầm thì lớp sửa chạy loạn.
/// Xếp cụm DÀI trước cụm ngắn: "con mụ" phải khớp trước "mụ", kẻo câu mô tả
/// lỗi gửi cho model chỉ nói được một nửa từ sai.
const LOAI_TU_CO_GIOI: &[&str] = &["con mẹ", "con nhỏ", "con mụ", "thằng", "gã", "mụ", "ả"];

/// `hay` có xuất hiện trong `trong` như một TỪ RIÊNG không.
fn chua_tu(trong: &str, hay: &str) -> bool {
    let b: Vec<char> = trong.chars().collect();
    let c: Vec<char> = hay.chars().collect();
    if c.is_empty() || b.len() < c.len() {
        return false;
    }
    (0..=b.len() - c.len()).any(|i| {
        b[i..i + c.len()] == c[..]
            && (i == 0 || !b[i - 1].is_alphabetic())
            && (i + c.len() == b.len() || !b[i + c.len()].is_alphabetic())
    })
}

/// Bản dịch có tự gán giới tính cho một tiếng chửi vốn không có giới tính
/// không. Trả về chính từ bị gán, để câu mô tả lỗi nói đúng chỗ sai.
///
/// CHỈ xét khi bản gốc dùng danh từ chửi trung tính. 他/她 trong cùng câu là
/// người THỨ BA ("他是你姐夫" — anh rể), không phải người bị chửi, nên không
/// lấy nó làm bằng chứng giới tính được.
pub fn gan_gioi_tinh_bua(goc: &str, dich: &str) -> Option<&'static str> {
    if !TU_CHUI_KHONG_GIOI.iter().any(|t| goc.contains(t)) {
        return None;
    }
    let thuong = dich.to_lowercase();
    LOAI_TU_CO_GIOI.iter().find(|t| chua_tu(&thuong, t)).copied()
}

/// Cue nào gán giới tính bừa thì gửi đi dịch lại.
///
/// Làm ở lớp MÃ chứ không chỉ ở prompt: quy tắc trong prompt áp cho cả lô 40
/// cue, còn đây nhắm đúng một cue và nói thẳng nó sai chỗ nào — cùng cách đã
/// dùng cho cue sót chữ Hán và cue gọi sai tên riêng.
fn dich_lai_cue_sai_gioi_tinh(
    p: &dyn TranslateProvider,
    chunk: &[Segment],
    idx: &[usize],
    translated_by_idx: &mut [String],
    src: &str,
    tgt: &str,
) {
    let can: Vec<(usize, &str)> = idx
        .iter()
        .copied()
        .filter_map(|i| {
            gan_gioi_tinh_bua(&chunk[i].text, &translated_by_idx[i]).map(|t| (i, t))
        })
        .collect();
    for (i, tu) in can.into_iter().take(TOI_DA_DICH_LAI) {
        let mo_ta = format!(
            "nó dùng \"{tu}\" — một từ chỉ rõ giới tính — trong khi bản gốc không cho biết người bị chửi là nam hay nữ. Dùng từ chửi TRUNG TÍNH của tiếng Việt: 不要脸的东西 là \"Đồ vô liêm sỉ.\" chứ không phải \"Thằng vô liêm sỉ.\" hay \"Con mụ vô liêm sỉ.\""
        );
        let Ok(lai) = p.dich_lai_sua_loi(chunk[i].text.as_str(), &mo_ta, src, tgt) else {
            continue;
        };
        let t = normalize_translated(&lai);
        // Chỉ nhận khi HẾT gán bừa — khác luật "bớt được là nhận" của chữ Hán
        // sót, vì ở đây không có thang nhiều ít: còn một từ giới tính là vẫn
        // sai nguyên vẹn.
        if !t.trim().is_empty() && gan_gioi_tinh_bua(&chunk[i].text, &t).is_none() {
            translated_by_idx[i] = t;
        }
    }
}

fn dich_lai_cue_con_chu_dong_a(
    p: &dyn TranslateProvider,
    chunk: &[Segment],
    idx: &[usize],
    translated_by_idx: &mut [String],
    src: &str,
    tgt: &str,
) {
    let can: Vec<usize> = idx
        .iter()
        .copied()
        .filter(|i| con_chu_dong_a(&translated_by_idx[*i]))
        .collect();
    for i in can.into_iter().take(TOI_DA_DICH_LAI) {
        let mo_ta = format!(
            "nó bỏ nguyên các chữ {} không dịch",
            chu_dong_a_trong(&translated_by_idx[i])
        );
        let Ok(lai) = p.dich_lai_sua_loi(chunk[i].text.as_str(), &mo_ta, src, tgt) else {
            continue;
        };
        let t = normalize_translated(&lai);
        // Nhận khi BỚT được chữ sót, không đòi sạch hẳn. Đo trên 4 câu khó
        // nhất: chỉ 2 câu sửa sạch, nhưng câu không sạch vẫn bớt được một chữ
        // (`小子` khỏi, `半天` còn). Đòi sạch thì vứt luôn phần đã khá hơn.
        // So bằng SỐ LƯỢNG nên luật này đơn điệu: không bao giờ làm xấu đi.
        if !t.trim().is_empty() && dem_chu_dong_a(&t) < dem_chu_dong_a(&translated_by_idx[i]) {
            translated_by_idx[i] = t;
        }
    }
}

pub fn make_provider(
    id: &str,
    cfg: &TranslateConfig,
    models: &std::path::Path,
) -> Result<Box<dyn TranslateProvider>, PipelineError> {
    match id {
        "google_free" => Ok(Box::new(google_free::GoogleFree::new())),
        llm_tren_may::ID => Ok(Box::new(llm_tren_may::LlmTrenMay::khoi_dong(
            models,
            cfg.openai.context.clone(),
        )?)),
        "openai_compat" => {
            let o = &cfg.openai;
            if o.api_key.trim().is_empty() || o.base_url.trim().is_empty() || o.model.trim().is_empty() {
                return Err(PipelineError::ProviderError {
                    provider: id.into(),
                    status: None,
                    msg: "thiếu cấu hình openai_compat: api_key/base_url/model (nhập rồi bấm Lưu cấu hình)".into(),
                });
            }
            Ok(Box::new(openai_compat::OpenAiCompat {
                chu_so_huu: "openai_compat",
                base_url: o.base_url.clone(),
                api_key: o.api_key.clone(),
                model: o.model.clone(),
                context: o.context.clone(),
            }))
        }
        _ => Err(PipelineError::ProviderError {
            provider: id.into(),
            status: None,
            msg: "provider chưa hỗ trợ".into(),
        }),
    }
}
