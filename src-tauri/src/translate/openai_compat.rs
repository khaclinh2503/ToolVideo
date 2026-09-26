use super::{http_client, map_http_err, TranslateProvider};
use crate::error::PipelineError;
use serde::{Deserialize, Serialize};

pub const SYSTEM_PROMPT: &str = "Bạn là dịch giả phụ đề. Dịch từng item sang ngôn ngữ đích, giữ nguyên số lượng và thứ tự, không thêm giải thích. Trả về JSON đúng dạng {\"items\":[{\"i\":<số>,\"text\":\"<bản dịch>\"}]}.";

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
    (
        "phim",
        "Phim, truyện",
        "Đây là lời thoại phim. Dịch thoáng cho tự nhiên như người Việt nói chuyện, giữ đúng sắc thái và xưng hô giữa các nhân vật.",
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
    format!("{SYSTEM_PROMPT} {huong_dan}")
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
            provider: "openai_compat".into(),
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
                {"role": "system", "content": build_system_prompt(&self.context)},
                {"role": "user", "content": user.to_string()},
            ]
        });
        if che_do_json {
            body["response_format"] = serde_json::json!({ "type": "json_object" });
        }
        let url = format!("{}/chat/completions", self.base_url.trim_end_matches('/'));
        let resp = http_client()?
            .post(url)
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .map_err(|e| map_http_err("openai_compat", e))?;
        let status = resp.status().as_u16();
        let text = resp.text().map_err(|e| map_http_err("openai_compat", e))?;
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
        "openai_compat"
    }

    fn batch_size(&self) -> usize {
        40
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
    ) -> Result<Vec<String>, PipelineError> {
        match self.once(texts, src, tgt, true) {
            Ok(v) => Ok(v),
            // retry đúng 1 lần chỉ khi lỗi nội dung (status 200 nhưng JSON/số item sai);
            // lỗi HTTP (status khác 200 hoặc None) không retry
            Err(PipelineError::ProviderError {
                status: Some(200), ..
            }) => self.once(texts, src, tgt, true),
            // 400 thường là endpoint không nhận `response_format`. Thử lại đúng
            // một lần KHÔNG kèm tham số đó thay vì bắt người dùng tự đoán: prompt
            // đã yêu cầu trả JSON, nên đường này vẫn dùng được.
            //
            // Chỉ 400: khoá sai là 401, hết hạn mức là 429, model không có
            // thường là 404 — thử lại mấy cái đó chỉ tốn thêm một lần gọi mà
            // chắc chắn hỏng y hệt.
            Err(PipelineError::ProviderError {
                status: Some(400), ..
            }) => self.once(texts, src, tgt, false),
            Err(e) => Err(e),
        }
    }
}
