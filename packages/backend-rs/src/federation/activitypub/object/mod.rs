pub mod accept;
pub mod add;
pub mod emoji;
pub mod flag;
pub mod follow;
pub mod hashtag;
pub mod like;
pub mod mention;
pub mod read;
pub mod reject;
pub mod remove;
pub mod tombstone;

pub trait ApObject {}

#[macros::export(string_enum)]
pub enum Activity {
    Accept,
    Add,
    Emoji,
    Flag,
    Follow,
    Hashtag,
    Like,
    Mention,
    Image,
    Read,
    Reject,
    Remove,
    Tombstone,
}

const AS_PUBLIC_URL: &str = "https://www.w3.org/ns/activitystreams#Public";

use crate::config::CONFIG;
use uuid::Uuid;

fn random_local_uri() -> String {
    format!("{}/{}", CONFIG.url, Uuid::new_v4())
}

#[macros::export(object)]
pub struct UserLike {
    pub id: String,
    pub username: String,
    pub host: Option<String>,
    pub uri: Option<String>,
}
