use crate::service::stream::{publish_to_stream, Error, Stream};
use serde_json::json;

#[macros::export]
pub enum NoteEvent {
    Delete,
    React,
    Unreact,
    Reply,
    Update,
    Vote,
}

// We want to merge `kind` and `object` into a single enum
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToNoteStream")]
pub async fn publish(
    note_id: String,
    kind: NoteEvent,
    object: &serde_json::Value,
) -> Result<(), Error> {
    let kind = match kind {
        NoteEvent::Delete => "deleted",
        NoteEvent::React => "reacted",
        NoteEvent::Unreact => "unreacted",
        NoteEvent::Reply => "replied",
        NoteEvent::Update => "updated",
        NoteEvent::Vote => "pollVoted",
    };

    let value = json!({
        "id": note_id.clone(),
        "body": object,
    });

    publish_to_stream(
        &Stream::Note { note_id },
        Some(kind),
        Some(serde_json::to_string(&value)?),
    )
    .await
}
