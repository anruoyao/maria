use crate::{
    model::entity::note,
    service::stream::{publish_to_stream, Error, Stream},
};

// for napi export
// https://github.com/napi-rs/napi-rs/issues/2060
type Note = note::Model;

#[macros::export(js_name = "publishToNoteUpdatesStream")]
pub async fn publish(note: &Note) -> Result<(), Error> {
    publish_to_stream(
        &Stream::NoteEdit,
        Some("updated"),
        Some(serde_json::to_string(note)?),
    )
    .await
}
