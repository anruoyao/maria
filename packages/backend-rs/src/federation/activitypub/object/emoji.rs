use super::*;
use crate::{misc, model::entity::emoji};
use chrono::Utc;

#[macros::export(object)]
pub struct ApEmoji {
    pub id: String,
    pub r#type: Activity,
    pub name: String,
    pub updated: String,
    pub icon: Icon,
}

#[macros::export(object)]
pub struct Icon {
    pub r#type: Activity,
    pub media_type: String,
    pub url: String,
}

impl ApObject for ApEmoji {}

impl ApEmoji {
    pub fn new(emoji: emoji::Model) -> Self {
        Self {
            id: misc::emoji::local_uri(&emoji.name),
            r#type: Activity::Emoji,
            name: format!(":{}:", emoji.name),
            updated: emoji
                .updated_at
                .unwrap_or_else(|| Utc::now().into())
                .to_rfc3339(),
            icon: Icon {
                r#type: Activity::Image,
                media_type: emoji.r#type.unwrap_or_else(|| "image/png".to_owned()),
                url: emoji.public_url,
            },
        }
    }
}

#[macros::for_ts] // https://github.com/napi-rs/napi-rs/issues/2060
type Emoji = emoji::Model;

#[macros::ts_export]
pub fn render_emoji(emoji: Emoji) -> ApEmoji {
    ApEmoji::new(emoji)
}
