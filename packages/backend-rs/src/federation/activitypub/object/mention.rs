use super::*;
use crate::{federation::acct::Acct, misc::user};

#[derive(thiserror::Error, Debug)]
#[error("remote user's uri is missing")]
pub struct MissingRemoteUserUri;

#[macros::export(object)]
pub struct ApMention {
    pub r#type: Activity,
    pub href: String,
    pub name: String,
}

impl ApObject for ApMention {}

impl ApMention {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    fn new(user: UserLike) -> Result<Self, MissingRemoteUserUri> {
        Ok(Self {
            r#type: Activity::Mention,
            href: match user::is_local!(user) {
                true => user::local_uri(user.id),
                false => user.uri.ok_or(MissingRemoteUserUri)?,
            },
            name: format!(
                "@{}",
                Acct {
                    username: user.username,
                    host: user.host
                }
            ),
        })
    }
}

#[macros::ts_export]
pub fn render_mention(user: UserLike) -> Result<ApMention, MissingRemoteUserUri> {
    ApMention::new(user)
}
