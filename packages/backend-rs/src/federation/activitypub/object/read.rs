use super::*;
use crate::misc::user;

#[macros::export(object)]
pub struct ApRead {
    pub r#type: Activity,
    pub actor: String,
    pub object: String,
}

impl ApObject for ApRead {}

impl ApRead {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    fn new(user_id: String, message_uri: String) -> Self {
        Self {
            r#type: Activity::Read,
            actor: user::local_uri(user_id),
            object: message_uri,
        }
    }
}

#[macros::ts_export]
pub fn render_read(user_id: String, message_uri: String) -> ApRead {
    ApRead::new(user_id, message_uri)
}
