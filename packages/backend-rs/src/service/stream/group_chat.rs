use crate::service::stream::{publish_to_stream, ChatEvent, Error, Stream};

// We want to merge `kind` and `object` into a single enum
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToGroupChatStream")]
pub async fn publish(
    group_id: String,
    kind: ChatEvent,
    object: &serde_json::Value,
) -> Result<(), Error> {
    let kind = match kind {
        ChatEvent::Message => "message",
        ChatEvent::Read => "read",
        ChatEvent::Deleted => "deleted",
        ChatEvent::Typing => "typing",
    };

    publish_to_stream(
        &Stream::GroupChat { group_id },
        Some(kind),
        Some(serde_json::to_string(object)?),
    )
    .await
}
