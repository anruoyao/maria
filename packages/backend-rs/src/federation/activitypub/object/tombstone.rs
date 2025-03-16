use super::*;
use crate::misc::note;

#[macros::export(object)]
pub struct ApTombstone {
    pub id: String,
    pub r#type: Activity,
}

impl ApObject for ApTombstone {}

impl ApTombstone {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    fn new(note_id: String) -> Self {
        Self {
            id: note::local_uri(note_id),
            r#type: Activity::Tombstone,
        }
    }
}

#[macros::ts_export]
pub fn render_tombstone(note_id: String) -> ApTombstone {
    ApTombstone::new(note_id)
}
