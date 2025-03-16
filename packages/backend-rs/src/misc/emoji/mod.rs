pub mod reaction;
pub mod unicode;

use crate::config::CONFIG;

/// Returns URI of a local custom emoji.
pub fn local_uri(emoji_code: impl std::fmt::Display) -> String {
    format!("{}/emojis/{}", CONFIG.url, emoji_code)
}
