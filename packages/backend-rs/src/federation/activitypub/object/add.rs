//! Add note to featured collection (pinned posts)

use super::*;
use crate::misc::{note, user};

#[macros::export(object)]
pub struct ApAdd {
    pub r#type: Activity,
    pub actor: String,
    pub target: String,
    pub object: String,
}

impl ApObject for ApAdd {}

impl ApAdd {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    fn new(user_id: String, note_id: String) -> Self {
        let actor_uri = user::local_uri(user_id);
        let collection_uri = format!("{}/collections/featured", actor_uri);

        Self {
            r#type: Activity::Add,
            actor: actor_uri,
            target: collection_uri,
            object: note::local_uri(note_id),
        }
    }
}

#[macros::ts_export]
pub fn render_add(user_id: String, note_id: String) -> ApAdd {
    ApAdd::new(user_id, note_id)
}
