use super::{http_client, map_http_err, TranslateProvider};
use crate::error::PipelineError;
use serde::{Deserialize, Serialize};

pub const SYSTEM_PROMPT: &str = "Bạn là dịch giả phụ đề. Dịch từng item sang ngôn ngữ đích, giữ nguyên số lượng và thứ tự, không thêm giải thích. Trả về JSON đúng dạng {\"items\":[{\"i\":<số>,\"text\":\"<bản dịch>\"}]}.";

pub struct OpenAiCompat {
    pub base_url: String,
    pub api_key: String,
    pub model: String,
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

    fn once(&self, texts: &[&str], src: &str, tgt: &str) -> Result<Vec<String>, PipelineError> {
        let items: Vec<Item> = texts
            .iter()
            .enumerate()
            .map(|(i, t)| Item { i, text: t })
            .collect();
        let user = serde_json::json!({ "src": src, "tgt": tgt, "items": items });
        let body = serde_json::json!({
            "model": self.model,
            "temperature": 0.2,
            "response_format": { "type": "json_object" },
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user.to_string()},
            ]
        });
        let url = format!("{}/chat/completions", self.base_url.trim_end_matches('/'));
        let resp = http_client()
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
        let mut out: OutItems = serde_json::from_str(content)
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
        match self.once(texts, src, tgt) {
            Ok(v) => Ok(v),
            // retry đúng 1 lần chỉ khi lỗi nội dung (status 200 nhưng JSON/số item sai);
            // lỗi HTTP (status khác 200 hoặc None) không retry
            Err(PipelineError::ProviderError {
                status: Some(200), ..
            }) => self.once(texts, src, tgt),
            Err(e) => Err(e),
        }
    }
}
