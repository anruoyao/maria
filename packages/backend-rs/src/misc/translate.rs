use crate::{
    config::{local_server_info, server, CONFIG},
    util::http_client,
};

#[error_doc::errors]
pub enum Error {
    #[doc = "Database error"]
    #[error(transparent)]
    Db(#[from] sea_orm::DbErr),
    #[error("failed to acquire an HTTP client")]
    HttpClient(#[from] http_client::Error),
    #[error("invalid http request body")]
    InvalidRequestBody(#[from] isahc::http::Error),
    #[error("http request failed")]
    HttpRequest(#[from] isahc::Error),
    #[error("failed to serialize the request body")]
    Serialize(#[from] serde_json::Error),
    #[error("Libretranslate API url is not set")]
    MissingApiUrl,
    #[error("DeepL API key is not set")]
    MissingApiKey,
    #[error("AI Translate API url is not set")]
    MissingAiApiUrl,
    #[error("AI Translate API key is not set")]
    MissingAiApiKey,
    #[error("AI Translate prompt is not set")]
    MissingAiPrompt,
    #[error("no response")]
    NoResponse,
    #[error("translator is not set")]
    NoTranslator,
    #[error("access to this URL is not allowed")]
    UnsafeUrl,
    #[error("AI translation failed: {0}")]
    AiTranslationFailed(String),
}

#[macros::export(object)]
pub struct Translation {
    pub source_lang: String,
    pub text: String,
}

#[inline]
fn is_zh_hant_tw(lang: &str) -> bool {
    ["zh-tw", "zh-hant", "zh-hant-tw"].contains(&lang.to_ascii_lowercase().as_str())
}

#[macros::export]
pub async fn translate(
    text: &str,
    source_lang: Option<String>,
    target_lang: &str,
) -> Result<Translation, Error> {
    let config = local_server_info().await?;

    let translation = if let (Some(api_url), Some(api_key), Some(prompt)) = (
        config.ai_translate_api_url.as_ref(),
        config.ai_translate_api_key.as_ref(),
        config.ai_translate_prompt.as_ref(),
    ) {
        ai_translate::translate(
            text,
            source_lang.as_deref(),
            target_lang,
            api_url,
            api_key,
            prompt,
            config.ai_translate_model.as_deref(),
        )
        .await?
    } else if let Some(api_key) = config.deepl_auth_key {
        deepl_translate::translate(
            text,
            source_lang.as_deref(),
            target_lang,
            &api_key,
            config.deepl_is_pro,
        )
        .await?
    } else if let Some(api_url) = config.libre_translate_api_url {
        libre_translate::translate(
            text,
            source_lang.as_deref(),
            target_lang,
            &api_url,
            config.libre_translate_api_key.as_deref(),
        )
        .await?
    } else if let Some(server::DeepLConfig {
        auth_key, is_pro, ..
    }) = CONFIG.deepl.as_ref()
    {
        deepl_translate::translate(
            text,
            source_lang.as_deref(),
            target_lang,
            auth_key.as_ref().ok_or(Error::MissingApiKey)?,
            is_pro.unwrap_or(false),
        )
        .await?
    } else if let Some(server::LibreTranslateConfig {
        api_url, api_key, ..
    }) = CONFIG.libre_translate.as_ref()
    {
        libre_translate::translate(
            text,
            source_lang.as_deref(),
            target_lang,
            api_url.as_ref().ok_or(Error::MissingApiUrl)?,
            api_key.as_deref(),
        )
        .await?
    } else {
        return Err(Error::NoTranslator);
    };

    Ok(translation)
}

mod deepl_translate {
    use crate::{misc::is_safe_url::is_safe_url, util::http_client};
    use futures_util::AsyncReadExt;
    use isahc::{AsyncReadResponseExt, Request};
    use serde::Deserialize;
    use serde_json::json;

    #[derive(Deserialize)]
    struct Response {
        translations: Vec<Translation>,
    }

    #[derive(Deserialize, Clone)]
    struct Translation {
        detected_source_language: Option<String>,
        text: String,
    }

    pub(super) async fn translate(
        text: &str,
        source_lang: Option<&str>,
        target_lang: &str,
        api_key: &str,
        is_pro: bool,
    ) -> Result<super::Translation, super::Error> {
        let client = http_client::client()?;

        let api_url = if is_pro {
            "https://api.deepl.com/v2/translate"
        } else {
            "https://api-free.deepl.com/v2/translate"
        };

        if !is_safe_url(api_url) {
            return Err(super::Error::UnsafeUrl);
        }

        let to_zh_hant_tw = super::is_zh_hant_tw(target_lang);

        let mut target_lang = target_lang.split('-').collect::<Vec<&str>>()[0];

        // DeepL API requires us to specify "en-US" or "en-GB" for English
        // translations ("en" does not work), so we need to address it
        if target_lang == "en" {
            target_lang = "en-US";
        }

        let body = if let Some(source_lang) = source_lang {
            let source_lang = source_lang.split('-').collect::<Vec<&str>>()[0];

            json!({
                "text": [text],
                "source_lang": source_lang,
                "target_lang": target_lang
            })
        } else {
            json!({
                "text": [text],
                "target_lang": target_lang
            })
        };

        let request = Request::post(api_url)
            .header("Authorization", format!("DeepL-Auth-Key {}", api_key))
            .header("Content-Type", "application/json")
            .body(serde_json::to_string(&body)?)?;

        // Read up to 1 MiB of the response body
        let response = client
            .send_async(request)
            .await?
            .map(|body| body.take(1024 * 1024))
            .json::<Response>()
            .await?;

        let result = response
            .translations
            .first()
            .ok_or(super::Error::NoResponse)?
            .to_owned();

        let mut translation = super::Translation {
            source_lang: source_lang
                .map(|s| s.to_owned())
                .or(result.detected_source_language)
                .and_then(|lang| {
                    if lang.is_ascii() {
                        Some(lang.to_ascii_lowercase())
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| "unknown".to_owned()),
            text: result.text,
        };

        // DeepL translate don't provide zh-Hant-TW translations at this moment,
        // so we convert zh-Hans-CN translations into zh-Hant-TW using zhconv.
        if to_zh_hant_tw {
            translation.text = zhconv::zhconv(&translation.text, zhconv::Variant::ZhTW);
        }

        Ok(translation)
    }
}

mod libre_translate {
    use crate::{misc::is_safe_url::is_safe_url, util::http_client};
    use futures_util::AsyncReadExt;
    use isahc::{AsyncReadResponseExt, Request};
    use serde::Deserialize;
    use serde_json::json;

    #[derive(Deserialize, Clone)]
    #[serde(rename_all = "camelCase")]
    struct Translation {
        translated_text: String,
        detected_language: DetectedLanguage,
    }

    #[derive(Deserialize, Clone)]
    struct DetectedLanguage {
        language: String,
    }

    pub(super) async fn translate(
        text: &str,
        source_lang: Option<&str>,
        target_lang: &str,
        api_url: &str,
        api_key: Option<&str>,
    ) -> Result<super::Translation, super::Error> {
        if !is_safe_url(api_url) {
            return Err(super::Error::UnsafeUrl);
        }

        let client = http_client::client()?;

        let target_lang = if super::is_zh_hant_tw(target_lang) {
            "zt"
        } else {
            target_lang.split('-').collect::<Vec<&str>>()[0]
        };

        let body = if let Some(source_lang) = source_lang {
            let source_lang = source_lang.split('-').collect::<Vec<&str>>()[0];

            json!({
                "q": [text],
                "source": source_lang,
                "target": target_lang,
                "format": "text",
                "alternatives": 1,
                "api_key": api_key.unwrap_or_default()
            })
        } else {
            json!({
                "q": [text],
                "source": "auto",
                "target": target_lang,
                "format": "text",
                "alternatives": 1,
                "api_key": api_key.unwrap_or_default()
            })
        };

        let request = Request::post(api_url)
            .header("Content-Type", "application/json")
            .body(serde_json::to_string(&body)?)?;

        // Read up to 1 MiB of the response body
        let result = client
            .send_async(request)
            .await?
            .map(|body| body.take(1024 * 1024))
            .json::<Translation>()
            .await?;

        Ok(super::Translation {
            source_lang: source_lang
                .map(|s| s.to_owned())
                .or(Some(result.detected_language.language))
                .and_then(|lang| {
                    if lang.is_ascii() {
                        Some(lang.to_ascii_lowercase())
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| "unknown".to_owned()),
            text: result.translated_text,
        })
    }
}

mod ai_translate {
    use crate::{misc::is_safe_url::is_safe_url, util::http_client};
    use futures_util::AsyncReadExt;
    use isahc::{AsyncReadResponseExt, Request};
    use serde::Deserialize;
    use serde_json::json;

    #[derive(Deserialize, Clone)]
    struct ChatCompletionResponse {
        choices: Vec<Choice>,
    }

    #[derive(Deserialize, Clone)]
    struct Choice {
        message: Message,
    }

    #[derive(Deserialize, Clone)]
    struct Message {
        content: String,
    }

    fn get_language_name(lang_code: &str) -> &str {
        match lang_code.to_lowercase().as_str() {
            "zh" | "zh-cn" | "zh-hans" => "Simplified Chinese",
            "zh-tw" | "zh-hant" => "Traditional Chinese",
            "en" => "English",
            "ja" => "Japanese",
            "ko" => "Korean",
            "es" => "Spanish",
            "fr" => "French",
            "de" => "German",
            "it" => "Italian",
            "pt" => "Portuguese",
            "ru" => "Russian",
            "ar" => "Arabic",
            "hi" => "Hindi",
            "th" => "Thai",
            "vi" => "Vietnamese",
            "id" => "Indonesian",
            "ms" => "Malay",
            "nl" => "Dutch",
            "pl" => "Polish",
            "tr" => "Turkish",
            "uk" => "Ukrainian",
            "cs" => "Czech",
            "sv" => "Swedish",
            "da" => "Danish",
            "fi" => "Finnish",
            "no" => "Norwegian",
            "el" => "Greek",
            "he" => "Hebrew",
            "hu" => "Hungarian",
            "ro" => "Romanian",
            "sk" => "Slovak",
            "bg" => "Bulgarian",
            "hr" => "Croatian",
            "sl" => "Slovenian",
            "lt" => "Lithuanian",
            "lv" => "Latvian",
            "et" => "Estonian",
            _ => lang_code,
        }
    }

    pub(super) async fn translate(
        text: &str,
        source_lang: Option<&str>,
        target_lang: &str,
        api_url: &str,
        api_key: &str,
        prompt_template: &str,
        model: Option<&str>,
    ) -> Result<super::Translation, super::Error> {
        if !is_safe_url(api_url) {
            return Err(super::Error::UnsafeUrl);
        }

        let client = http_client::client()?;

        let target_lang_name = get_language_name(target_lang);
        let source_lang_name = source_lang
            .map(|l| get_language_name(l))
            .unwrap_or("auto-detect");

        let prompt = prompt_template
            .replace("{text}", text)
            .replace("{target_lang}", target_lang_name)
            .replace("{target_lang_code}", target_lang)
            .replace("{source_lang}", source_lang_name);

        // Ensure the API URL has the correct endpoint path
        let api_url = if api_url.ends_with("/chat/completions") {
            api_url.to_string()
        } else {
            format!("{}/chat/completions", api_url.trim_end_matches('/'))
        };

        // Use provided model or default to gpt-3.5-turbo
        let model = model.unwrap_or("gpt-3.5-turbo");

        tracing::info!("AI Translation request - URL: {}, Model: {}, Target: {}, Source: {:?}", api_url, model, target_lang, source_lang);
        tracing::debug!("AI Translation prompt: {}", prompt);

        let body = json!({
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 4096
        });

        let request = Request::post(&api_url)
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", api_key))
            .body(serde_json::to_string(&body)?)?;

        let mut response = match client
            .send_async(request)
            .await {
                Ok(resp) => resp,
                Err(e) => {
                    tracing::error!("AI Translation HTTP request failed: {:?}", e);
                    return Err(super::Error::HttpRequest(e));
                }
            };

        // Check HTTP status code
        let status = response.status();
        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            tracing::error!("AI Translation API returned error status: {}, body: {}", status, error_text);
            return Err(super::Error::AiTranslationFailed(
                format!("API returned error status: {} - {}", status, error_text)
            ));
        }

        let response = match response
            .map(|body| body.take(1024 * 1024))
            .json::<ChatCompletionResponse>()
            .await {
                Ok(resp) => resp,
                Err(e) => {
                    tracing::error!("AI Translation response parsing failed: {:?}", e);
                    return Err(super::Error::AiTranslationFailed(
                        format!("Failed to parse API response: {}", e)
                    ));
                }
            };

        let result = response
            .choices
            .first()
            .ok_or_else(|| super::Error::AiTranslationFailed("No response from AI".to_string()))?;

        let translated_text = result.message.content.trim().to_string();

        tracing::info!("AI Translation successful - Source: {:?}, Result length: {}", source_lang, translated_text.len());

        Ok(super::Translation {
            source_lang: source_lang
                .map(|s| s.to_lowercase())
                .unwrap_or_else(|| "auto".to_string()),
            text: translated_text,
        })
    }
}
