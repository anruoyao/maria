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
    #[error("no response")]
    NoResponse,
    #[error("translator is not set")]
    NoTranslator,
    #[error("access to this URL is not allowed")]
    UnsafeUrl,
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

    let translation = if let Some(api_key) = config.deepl_auth_key {
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
