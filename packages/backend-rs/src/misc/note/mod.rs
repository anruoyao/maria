pub use elaborate::elaborate;
pub use summarize::summarize;

pub mod elaborate;
pub mod summarize;

use crate::config::CONFIG;

/// Returns URI of a local post.
pub fn local_uri(note_id: impl std::fmt::Display) -> String {
    format!("{}/notes/{}", CONFIG.url, note_id)
}
