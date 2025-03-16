use super::*;
use crate::config::CONFIG;

#[macros::export(object)]
pub struct ApHashtag {
    pub id: String,
    pub r#type: Activity,
    pub name: String,
}

impl ApObject for ApHashtag {}

impl ApHashtag {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    fn new(tag_name: &str) -> Self {
        Self {
            id: format!("{}/tags/{}", CONFIG.url, urlencoding::encode(tag_name)),
            r#type: Activity::Hashtag,
            name: format!("#{}", tag_name),
        }
    }
}

#[macros::ts_export]
pub fn render_hashtag(tag_name: &str) -> ApHashtag {
    ApHashtag::new(tag_name)
}
