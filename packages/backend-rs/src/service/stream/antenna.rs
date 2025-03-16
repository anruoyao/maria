use crate::{
    model::entity::note,
    service::stream::{publish_to_stream, Error, Stream},
};

pub async fn publish(antenna_id: String, note: &note::Model) -> Result<(), Error> {
    publish_to_stream(
        &Stream::Antenna { antenna_id },
        Some("note"),
        Some(serde_json::to_string(note)?),
    )
    .await
}
