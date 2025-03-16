//! This module is used in the TypeScript backend only.

#[macros::ts_export]
pub fn is_unicode_emoji(s: &str) -> bool {
    emojis::get(s).is_some()
}
