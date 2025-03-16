use super::*;
use crate::{federation::internal_actor, misc::user};

#[macros::export(object)]
pub struct ApFlag {
    pub r#type: Activity,
    pub actor: String,
    pub content: String,
    // TODO: object can be an array of uri's
    pub object: String,
}

impl ApObject for ApFlag {}

impl ApFlag {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    async fn new(
        target_user_uri: String,
        comment: String,
    ) -> Result<Self, internal_actor::instance::Error> {
        Ok(Self {
            r#type: Activity::Flag,
            actor: user::local_uri(&internal_actor::instance::get().await?.id),
            content: comment,
            object: target_user_uri,
        })
    }
}

#[macros::ts_export]
pub async fn render_flag(
    target_user_uri: String,
    comment: String,
) -> Result<ApFlag, internal_actor::instance::Error> {
    ApFlag::new(target_user_uri, comment).await
}
