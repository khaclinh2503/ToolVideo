use super::{http_client, map_http_err, TranslateProvider};
use crate::error::PipelineError;
use reqwest::blocking::Client;

pub struct GoogleFree {
    pub endpoint: String,
}

impl GoogleFree {
    pub fn new() -> Self {
        Self::with_endpoint("https://translate.googleapis.com/translate_a/single".into())
    }

    pub fn with_endpoint(endpoint: String) -> Self {
        Self { endpoint }
    }

    fn one(&self, client: &Client, text: &str, src: &str, tgt: &str) -> Result<String, PipelineError> {
        let resp = client
            .get(&self.endpoint)
            .query(&[
                ("client", "gtx"),
                ("sl", src),
                ("tl", tgt),
                ("dt", "t"),
                ("q", text),
            ])
            .send()
            .map_err(|e| map_http_err("google_free", e))?;
        let status = resp.status().as_u16();
        let body = resp.text().map_err(|e| map_http_err("google_free", e))?;
        if !(200..300).contains(&status) {
            return Err(PipelineError::ProviderError {
                provider: "google_free".into(),
                status: Some(status),
                msg: body.chars().take(200).collect(),
            });
        }
        let v: serde_json::Value = serde_json::from_str(&body).map_err(|_| PipelineError::ProviderError {
            provider: "google_free".into(),
            status: Some(200),
            msg: body.chars().take(200).collect(),
        })?;
        let parts = v.get(0).and_then(|a| a.as_array()).ok_or_else(|| PipelineError::ProviderError {
            provider: "google_free".into(),
            status: Some(200),
            msg: body.chars().take(200).collect(),
        })?;
        Ok(parts
            .iter()
            .filter_map(|p| p.get(0).and_then(|s| s.as_str()))
            .collect::<String>()
            .trim()
            .to_string())
    }
}

impl Default for GoogleFree {
    fn default() -> Self {
        Self::new()
    }
}

impl TranslateProvider for GoogleFree {
    fn id(&self) -> &'static str {
        "google_free"
    }

    fn batch_size(&self) -> usize {
        20
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        src: &str,
        tgt: &str,
    ) -> Result<Vec<String>, PipelineError> {
        let client = http_client()?;
        texts.iter().map(|t| self.one(&client, t, src, tgt)).collect()
    }
}
