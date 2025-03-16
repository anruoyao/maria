use crate::cache;
use chrono::Duration;
use identicon_rs::{error::IdenticonError, Identicon};

#[error_doc::errors]
pub enum Error {
    #[doc = "Failed to generate identicon"]
    #[error(transparent)]
    Identicon(#[from] IdenticonError),
    #[error("Redis cache operation has failed")]
    Cache(#[from] cache::redis::Error),
}

pub async fn generate(id: &str) -> Result<Vec<u8>, Error> {
    if let Some(icon) = cache::get_one::<Vec<u8>>(cache::Category::RandomIcon, id).await? {
        Ok(icon)
    } else {
        let icon = Identicon::new(id)
            .set_border(16)
            .set_scale(96)?
            .export_png_data()?;
        cache::set_one(
            cache::Category::RandomIcon,
            id,
            &icon,
            Duration::minutes(10),
        )
        .await?;
        Ok(icon)
    }
}

#[cfg(feature = "napi")]
#[napi_derive::napi(js_name = "genIdenticon")]
pub async fn generate_js(id: String) -> napi::Result<napi::bindgen_prelude::Buffer> {
    match generate(&id).await {
        Ok(icon) => Ok(icon.into()),
        Err(err) => Err(napi::Error::from_reason(format!(
            "\n{}\n",
            crate::util::error_chain::format_error(&err)
        ))),
    }
}
