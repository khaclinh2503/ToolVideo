use super::{map_http_err, TranslateProvider};
use crate::error::PipelineError;
use serde::{Deserialize, Serialize};

pub const SYSTEM_PROMPT: &str = "Bạn là dịch giả phụ đề. Dịch từng item sang ngôn ngữ đích, giữ nguyên số lượng và thứ tự, không thêm giải thích. Trả về JSON đúng dạng {\"items\":[{\"i\":<số>,\"text\":\"<bản dịch>\"}]}.";

/// Quy tắc dịch áp cho MỌI ngữ cảnh, nối vào sau `SYSTEM_PROMPT`.
///
/// Mỗi câu ở đây vá một lỗi ĐO ĐƯỢC trên bản dịch thật. Bộ đo: 40 cue phim
/// Trung thật, Qwen3-14B-Q5_K_M, chạy 4 lần mỗi prompt — ở temperature 0.2 một
/// lần chạy không nói lên gì, cùng prompt cho ra khác nhau giữa các lần. Số là
/// "số lần đạt / 4 lần chạy", prompt cũ ⇒ prompt này:
///
/// * `干。` ra "Chán." 0/4 ⇒ ra tiếng chửi 4/4.
/// * `姐夫` ra "chú rể"/"anh trai" 0/4 ⇒ ra "anh rể" 4/4.
/// * Câu ghép dài bị cụt mất vế sau 0/4 ⇒ dịch đủ 3/4.
/// * `球球` (tên con chó) ra "Bóng bóng" 0/4 ⇒ ra "Cầu Cầu" 4/4; `林燕` 2/4 ⇒
///   4/4 ra "Lâm Yến".
///
/// Phải biết rõ giới hạn của mấy con số trên, đừng đọc quá lên:
///
/// * `球球` và `林燕` chính là ví dụ nằm trong prompt, nên 4/4 của chúng KHÔNG
///   chứng minh luật tên riêng tổng quát được. Đo riêng trên 6 tên chưa hề xuất
///   hiện trong prompt (3 lần): có khá hơn — `阿福` ra "A Phúc" 1/3 ⇒ 3/3, `团团`
///   thôi ra pinyin "Tuantuan" — nhưng `小花` vẫn bị dịch nghĩa thành "Hoa nhỏ"
///   3/3 ở CẢ HAI prompt, và `铁柱` vẫn sai. Luật này giảm lỗi chứ chưa dứt lỗi.
/// * Câu "giữ nguyên phiên âm" suông đã thử và KHÔNG ăn thua; phải nói rõ
///   Hán-Việt kèm ví dụ cụ thể thì model mới theo. Ví dụ là thứ làm nên tác
///   dụng, bỏ ví dụ đi là mất.
/// * Ràng buộc thô tục để HAI CHIỀU — không làm nhẹ đi mà cũng không thêm vào
///   chỗ bản gốc không có — để bản tin và bài giảng không bị kéo giọng theo.
/// * Thương hiệu phải tách khỏi luật tên riêng: bắt `爱回收严选` phiên âm Hán-Việt
///   thì model dịch nghĩa thành "yêu thu hồi chọn lọc" hoặc "Love Recycling".
/// * Trả giá: 1/4 lần chạy có một cue còn sót chữ Hán, prompt cũ 0/4. Câu
///   "không được còn sót chữ Hán" đã có sẵn trong đây mà vẫn không chặn hết.
///   Từ đệm chửi `他妈` thì bị bỏ nguyên chữ Hán lặp lại y hệt qua nhiều lần
///   chạy, kể cả khi prompt gọi đích danh nó — giới hạn của model.
const QUY_TAC_DICH: &str = "Dịch đủ mọi vế trong câu, không lược bỏ. Giữ đúng ngôi: 我 là người đang nói, 你 là người nghe, 他/她 là người thứ ba — không được hoán ngôi; 我 luôn dịch thành đại từ người nói tự xưng, không bao giờ thành đại từ dùng để gọi người nghe. Tên riêng của người, vật nuôi, biệt danh và địa danh thì phiên âm Hán-Việt, KHÔNG dịch nghĩa dù chữ trong tên có nghĩa thường ngày: 球球 là \"Cầu Cầu\" chứ không phải \"Bóng bóng\", 林燕 là \"Lâm Yến\" chứ không phải \"Rừng Én\"; một cái tên đã gọi thế nào thì giữ nguyên thế ở mọi item. Tên thương hiệu, tên sản phẩm và tên công ty thì để nguyên tên gốc hoặc phiên âm pinyin, tuyệt đối không dịch nghĩa sang tiếng Việt hay tiếng Anh: 爱回收严选 là \"Aihuishou Yanxuan\" chứ không phải \"Love Recycling\" hay \"yêu thu hồi chọn lọc\". Mỗi item phải dịch TRỌN sang ngôn ngữ đích: bản dịch không được còn sót chữ Hán. Giữ đúng mức độ thô tục của lời thoại: tiếng chửi phải dịch thành tiếng chửi tương đương của người Việt, không làm nhẹ đi, cũng không thêm vào chỗ bản gốc không có: 干 / 操 / 妈的 là \"Mẹ kiếp.\" hay \"Chết tiệt.\" chứ không phải \"Chán.\" hay \"Đáng ghét.\"";

/// Ngữ cảnh dịch: (mã, nhãn hiện trên giao diện, câu hướng dẫn nhét vào prompt).
///
/// Để ở Rust thay vì ở giao diện để chỉ có một danh sách: giao diện đọc qua lệnh
/// `translate_contexts`, nên không thể lệch với thứ prompt thật sự dùng.
pub const CONTEXTS: &[(&str, &str, &str)] = &[
    (
        "ban_hang",
        "Bán hàng, quảng cáo",
        "Đây là video bán hàng. Dịch theo giọng chào mời tự nhiên của người Việt, giữ tên sản phẩm và con số nguyên vẹn.",
    ),
    (
        "bai_giang",
        "Bài giảng, hướng dẫn",
        "Đây là bài giảng hoặc hướng dẫn. Ưu tiên chính xác và rõ ràng, giữ nguyên thuật ngữ chuyên ngành, xưng hô mạch lạc từ đầu đến cuối.",
    ),
    // Xưng hô ở đây có một lỗi ĐÃ ĐO, ĐÃ THỬ SỬA, CHƯA SỬA ĐƯỢC. Đừng đọc câu
    // hướng dẫn bên dưới như một việc đã xong.
    //
    // Bệnh: model bám cặp xưng hô của item ĐẦU LÔ rồi áp cho mọi item sau. Bộ
    // thử 8 câu, mỗi câu một vai rõ ràng, trộn chung một lô: chỉ dùng 2/4 kiểu
    // xưng hô cần thiết — lính báo cáo chỉ huy cũng xưng "con", bác sĩ nói với
    // bệnh nhân cũng xưng "con", vì item đầu lô là con nói với mẹ.
    //
    // KHÔNG phải model không làm nổi: ba câu đó dịch đúng hết khi đứng một
    // mình, và đúng hết khi lô không mở đầu bằng câu con-mẹ. Là nhiễm từ item
    // đầu lô, không phải thiếu hướng dẫn — nên viết thêm hướng dẫn không chữa
    // được.
    //
    // Đã thử bốn cách viết prompt: nói rõ "mỗi cặp một kiểu"; kèm ví dụ vai-đại
    // từ; nêu thẳng ví dụ SAI; bắt từ hô trong chính item quyết định. CẢ BỐN đều
    // ra đúng 2/4, không nhúc nhích. Tệ hơn: một trong bốn cách làm cue ghép dài
    // bị cắt mất vế sau (3/4 ⇒ 0/3), nên câu dưới đây là bản ĐÃ TRẢ VỀ nguyên
    // văn cũ. Sửa chữ ở đây thì phải đo lại cả hai thứ, đừng chỉ đo xưng hô.
    //
    // Hai hướng sửa bằng MÃ cũng đã thử và loại, đừng làm lại:
    //
    // * Cắt lô theo mốc thời gian: chỗ đổi cảnh thật trong phim mẫu chỉ hở 2,2
    //   giây, dưới mọi ngưỡng hợp lý, mà ngưỡng 5 giây lại biến 5 lô thành 33
    //   lô — đắt gấp bảy mà không chữa được đúng ca cần chữa.
    // * Báo thẳng ranh giới cảnh cho model: thêm trường "canh" vào từng item và
    //   dặn rõ hai số canh khác nhau là hai cảnh, hai người nói khác nhau. Đây là
    //   bản mạnh nhất có thể của hướng nhận diện cảnh — mọi item đều được đánh
    //   dấu đúng, không phải đoán. VẪN ra 2/4. Nên không cần đi dò ranh giới cảnh
    //   làm gì: có thông tin cảnh hoàn hảo thì model cũng không dùng.
    (
        "phim",
        "Phim, truyện",
        "Đây là lời thoại phim. Dịch thoáng cho tự nhiên như người Việt nói chuyện, giữ đúng sắc thái giữa các nhân vật. Trước khi dịch, suy ra quan hệ giữa các nhân vật từ toàn bộ các item rồi CHỐT một cặp xưng hô cho mỗi cặp nhân vật và giữ nguyên từ đầu đến cuối, không đổi giữa chừng. Dịch đúng quan hệ họ hàng theo tiếng Việt: 姐 là chị gái, 妹 là em gái, 姐夫 là anh rể, 嫂子 là chị dâu.",
    ),
    (
        "tin_tuc",
        "Tin tức, thời sự",
        "Đây là bản tin. Dùng văn phong báo chí trung tính, giữ nguyên tên riêng, địa danh và con số.",
    ),
    (
        "podcast",
        "Podcast, phỏng vấn",
        "Đây là hội thoại hoặc phỏng vấn. Giữ giọng nói chuyện tự nhiên, bỏ bớt từ đệm lặp mà không đổi ý.",
    ),
    (
        "game",
        "Game, giải trí",
        "Đây là nội dung game hoặc giải trí. Giữ thuật ngữ game quen thuộc với người chơi Việt, giọng trẻ trung.",
    ),
    (
        "cong_nghe",
        "Công nghệ",
        "Đây là nội dung công nghệ. Giữ nguyên tên sản phẩm, hãng và thuật ngữ kỹ thuật; không dịch những từ mà người Việt vẫn dùng nguyên bản.",
    ),
];

/// Câu hướng dẫn khi người dùng để ngữ cảnh ở chế độ tự động, hoặc khi mã ngữ
/// cảnh không nhận ra được.
const HUONG_DAN_TU_DONG: &str = "Trước khi dịch, tự đoán xem video thuộc thể loại nào (bán hàng, bài giảng, phim, tin tức, hội thoại…) dựa trên toàn bộ các item, rồi dịch theo đúng văn phong của thể loại đó và giữ nhất quán từ đầu đến cuối.";

/// Ghép hướng dẫn ngữ cảnh vào sau prompt hệ thống.
///
/// NỐI THÊM chứ không thay thế: phần quy định dạng JSON trong `SYSTEM_PROMPT` là
/// thứ giữ cho cả provider chạy được, mất nó thì mọi bản dịch đều hỏng parse.
pub fn build_system_prompt(context: &str) -> String {
    let huong_dan = CONTEXTS
        .iter()
        .find(|(ma, _, _)| *ma == context.trim())
        .map(|(_, _, h)| *h)
        .unwrap_or(HUONG_DAN_TU_DONG);
    format!("{SYSTEM_PROMPT} {QUY_TAC_DICH} {huong_dan}")
}

/// Lọc lấy đúng khối JSON trong nội dung model trả về.
///
/// Model suy luận (GLM, Nemotron, Kimi, DeepSeek-R1…) hay chèn phần suy nghĩ
/// trước JSON — có khi trong `<think>…</think>`, có khi là văn xuôi trần, có
/// khi bọc trong rào ```json. Parser cũ gọi thẳng `from_str` nên mọi thứ đứng
/// trước JSON đều làm cả lô 40 cue hỏng, và biểu hiện thành `provider_error`
/// chứ không phải "bản dịch xấu" — rất khó đoán ra nguyên nhân.
///
/// Trả về nguyên chuỗi nếu không tìm thấy cặp ngoặc nào, để thông báo lỗi vẫn
/// hiện đúng thứ model đã trả.
pub fn loc_khoi_json(noi_dung: &str) -> &str {
    // Bỏ hẳn phần <think>…</think> trước, vì bên trong nó cũng có thể có ngoặc.
    let sau_think = match noi_dung.find("</think>") {
        Some(i) => &noi_dung[i + "</think>".len()..],
        None => noi_dung,
    };
    let bat_dau = match sau_think.find('{') {
        Some(i) => i,
        None => return noi_dung,
    };
    match sau_think.rfind('}') {
        Some(ket) if ket > bat_dau => &sau_think[bat_dau..=ket],
        _ => noi_dung,
    }
}

pub struct OpenAiCompat {
    /// Mã nhà cung cấp mà NGƯỜI DÙNG đã chọn, dùng nguyên văn trong mọi lỗi.
    ///
    /// Không đóng cứng "openai_compat": `llm_tren_may` mượn lại đúng thân
    /// request này để nói chuyện với `llama-server` ở `127.0.0.1`, nên nếu lỗi
    /// nào cũng tự xưng "openai_compat" thì một trục trặc của tiến trình chạy
    /// ngay trên máy lại hiện ra như một dịch vụ cloud hỏng — người dùng đi
    /// kiểm tra mạng và API key, trong khi chẳng có cái nào dính dáng.
    pub chu_so_huu: &'static str,
    pub base_url: String,
    pub api_key: String,
    pub model: String,
    /// Mã ngữ cảnh; rỗng hoặc không nhận ra ⇒ để mô hình tự suy ra thể loại.
    pub context: String,
}

#[derive(Serialize)]
struct Item<'a> {
    i: usize,
    text: &'a str,
}
#[derive(Deserialize)]
struct OutItem {
    i: usize,
    text: String,
}
#[derive(Deserialize)]
struct OutItems {
    items: Vec<OutItem>,
}
#[derive(Deserialize)]
struct Msg {
    content: String,
}
#[derive(Deserialize)]
struct Choice {
    message: Msg,
}
#[derive(Deserialize)]
struct ChatResp {
    choices: Vec<Choice>,
}

impl OpenAiCompat {
    fn perr(&self, status: Option<u16>, msg: impl Into<String>) -> PipelineError {
        PipelineError::ProviderError {
            provider: self.chu_so_huu.into(),
            status,
            msg: msg.into(),
        }
    }

    /// `che_do_json` = bật `response_format: {"type": "json_object"}`.
    ///
    /// Không phải endpoint tương thích-OpenAI nào cũng nhận tham số này —
    /// NVIDIA build.nvidia.com không hề khai nó trong tài liệu, và nhiều
    /// endpoint tự dựng (Groq, LM Studio, OpenRouter) cũng vậy. Đường chạy
    /// không có nó vẫn dùng được vì prompt đã yêu cầu trả đúng JSON.
    fn once(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
        che_do_json: bool,
        tat_suy_luan: bool,
    ) -> Result<Vec<String>, PipelineError> {
        self.once_voi_he_thong(
            texts,
            src,
            tgt,
            che_do_json,
            tat_suy_luan,
            &build_system_prompt(&self.context),
        )
    }

    /// Thân thật của `once`, nhận prompt hệ thống từ ngoài.
    ///
    /// Tách ra để lần dịch lại một cue sót chữ dùng được prompt sửa lỗi riêng
    /// mà vẫn đi chung đường parse, kiểm số item và lùi tham số khi bị 400.
    #[allow(clippy::too_many_arguments)]
    fn once_voi_he_thong(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
        che_do_json: bool,
        tat_suy_luan: bool,
        he_thong: &str,
    ) -> Result<Vec<String>, PipelineError> {
        let items: Vec<Item> = texts
            .iter()
            .enumerate()
            .map(|(i, t)| Item { i, text: t })
            .collect();
        let user = serde_json::json!({ "src": src, "tgt": tgt, "items": items });
        let mut body = serde_json::json!({
            "model": self.model,
            "temperature": 0.2,
            // Một lô 40 cue phụ đề cộng khung JSON dễ vượt 2000 token. Không
            // gửi thì endpoint áp mặc định của nó — ví dụ đoạn mã mẫu của
            // NVIDIA dùng 1024 — và câu trả lời bị CẮT CỤT giữa chừng. JSON
            // cụt thì parse hỏng, app thử lại đúng một lần rồi cũng cụt y hệt.
            "max_tokens": 4096,
            "messages": [
                {"role": "system", "content": he_thong},
                {"role": "user", "content": user.to_string()},
            ]
        });
        if che_do_json {
            body["response_format"] = serde_json::json!({ "type": "json_object" });
        }
        if tat_suy_luan {
            // Model suy luận đốt sạch max_tokens vào phần nghĩ rồi trả về RỖNG.
            // Đo thật trên NVIDIA, lô 40 cue: deepseek-v4.1-flash mất 173 giây
            // và tiêu 4095/4096 token cho suy luận, chữ dịch bằng không.
            //
            // Hai khoá dưới đây là hai cách tắt khác nhau vì nhà cung cấp không
            // thống nhất: `reasoning_effort` là của OpenAI, `chat_template_kwargs`
            // là của vLLM/NVIDIA. Gửi cả hai rồi lùi về khi bị 400 rẻ hơn nhiều
            // so với bắt người dùng tự đoán endpoint của mình nhận khoá nào.
            body["reasoning_effort"] = serde_json::json!("low");
            body["chat_template_kwargs"] = serde_json::json!({ "thinking": false });
        }
        let url = format!("{}/chat/completions", self.base_url.trim_end_matches('/'));
        // `http_client_cho_url` chứ không phải `http_client_voi`: khi base_url
        // là loopback (đường chạy của `llm_tren_may`, hoặc một LM Studio người
        // dùng tự dựng) thì phải TẮT proxy môi trường, xem comment ở hàm đó.
        let resp = crate::translate::http_client_cho_url(&url, crate::translate::CHO_LLM)?
            .post(&url)
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .map_err(|e| map_http_err(self.chu_so_huu, e))?;
        let status = resp.status().as_u16();
        let text = resp.text().map_err(|e| map_http_err(self.chu_so_huu, e))?;
        if !(200..300).contains(&status) {
            return Err(self.perr(Some(status), text.chars().take(200).collect::<String>()));
        }
        let chat: ChatResp = serde_json::from_str(&text)
            .map_err(|_| self.perr(Some(200), text.chars().take(200).collect::<String>()))?;
        let content = chat
            .choices
            .first()
            .map(|c| c.message.content.as_str())
            .ok_or_else(|| self.perr(Some(200), "không có choices"))?;
        let mut out: OutItems = serde_json::from_str(loc_khoi_json(content))
            .map_err(|_| self.perr(Some(200), content.chars().take(200).collect::<String>()))?;
        out.items.sort_by_key(|x| x.i);
        let ok = out.items.len() == texts.len()
            && out.items.iter().enumerate().all(|(k, x)| x.i == k);
        if !ok {
            return Err(self.perr(
                Some(200),
                format!("LLM trả {} item (cần {})", out.items.len(), texts.len()),
            ));
        }
        Ok(out.items.into_iter().map(|x| x.text).collect())
    }
}

impl TranslateProvider for OpenAiCompat {
    fn id(&self) -> &'static str {
        self.chu_so_huu
    }

    fn batch_size(&self) -> usize {
        40
    }

    /// Gửi lại y nguyên thì model trả lại đúng cái cũ — đo được chỉ 1/3 cue
    /// khỏi. Lần này nói thẳng là bản trước HỎNG và hỏng ở chữ nào, nên nó là
    /// một yêu cầu khác hẳn chứ không phải lần gieo lại.
    ///
    /// Vẫn đi qua `once_voi_he_thong` để dùng chung đường parse và kiểm số item;
    /// chỉ có prompt hệ thống là khác.
    fn dich_lai_cho_tron(
        &self,
        text: &str,
        con_sot: &str,
        src: &str,
        tgt: &str,
    ) -> Result<String, PipelineError> {
        let he_thong = format!(
            "{} Bản dịch trước của câu này HỎNG: nó bỏ nguyên các chữ {} không dịch. \
             Dịch lại cho trọn, mọi chữ đều phải sang ngôn ngữ đích, bản dịch trả về \
             tuyệt đối không được chứa chữ Hán hay chữ kana nào. Nếu một chữ là tiếng \
             lóng hay từ đệm không có từ tương đương thì bỏ hẳn nó đi, không được giữ \
             nguyên chữ gốc.",
            build_system_prompt(&self.context),
            con_sot
        );
        let v = self.once_voi_he_thong(&[text], src, tgt, true, true, &he_thong)?;
        v.into_iter()
            .next()
            .ok_or_else(|| self.perr(Some(200), "dịch lại không trả về dòng nào"))
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
    ) -> Result<Vec<String>, PipelineError> {
        match self.once(texts, src, tgt, true, true) {
            Ok(v) => Ok(v),
            // retry đúng 1 lần chỉ khi lỗi nội dung (status 200 nhưng JSON/số item sai);
            // lỗi HTTP (status khác 200 hoặc None) không retry
            Err(PipelineError::ProviderError {
                status: Some(200), ..
            }) => self.once(texts, src, tgt, true, true),
            // 400 thường là endpoint không nhận một tham số nào đó: có nơi không
            // biết `response_format`, có nơi không biết khoá tắt suy luận. Không
            // phân biệt được là cái nào qua thông báo lỗi, nên lùi từng bước —
            // bỏ khoá tắt suy luận trước (vẫn giữ JSON), rồi bỏ nốt JSON. Thà
            // gọi thêm hai lần còn hơn bắt người dùng tự đoán endpoint của mình
            // nhận khoá nào; prompt đã yêu cầu trả JSON nên đường trần vẫn chạy.
            //
            // Chỉ 400: khoá sai là 401, hết hạn mức là 429, model không có
            // thường là 404 — thử lại mấy cái đó chỉ tốn thêm một lần gọi mà
            // chắc chắn hỏng y hệt.
            Err(PipelineError::ProviderError {
                status: Some(400), ..
            }) => match self.once(texts, src, tgt, true, false) {
                Ok(v) => Ok(v),
                Err(PipelineError::ProviderError {
                    status: Some(400), ..
                }) => self.once(texts, src, tgt, false, false),
                Err(e) => Err(e),
            },
            Err(e) => Err(e),
        }
    }
}
