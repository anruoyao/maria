use crate::service::stream::{publish_to_stream, Error, Stream};

#[macros::export(js_name = "publishToChannelStream")]
pub async fn publish(channel_id: String, user_id: String) -> Result<(), Error> {
    publish_to_stream(
        &Stream::Channel { channel_id },
        Some("typing"),
        Some(format!("\"{}\"", user_id)),
    )
    .await
}
