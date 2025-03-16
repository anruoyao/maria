use crate::service::stream::{publish_to_stream, Error, Stream};

#[macros::export(string_enum = "camelCase")]
pub enum ChatIndexEvent {
    Message,
    Read,
}

// We want to merge `kind` and `object` into a single enum
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToChatIndexStream")]
pub async fn publish(
    user_id: String,
    kind: ChatIndexEvent,
    object: &serde_json::Value,
) -> Result<(), Error> {
    let kind = match kind {
        ChatIndexEvent::Message => "message",
        ChatIndexEvent::Read => "read",
    };

    publish_to_stream(
        &Stream::ChatIndex { user_id },
        Some(kind),
        Some(serde_json::to_string(object)?),
    )
    .await
}
