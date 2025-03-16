use crate::service::stream::{publish_to_stream, Error, Stream};

#[macros::export]
pub enum InternalEvent {
    Suspend,
    Silence,
    Moderator,
    Token,
    LocalUser,
    RemoteUser,
    WebhookCreated,
    WebhookUpdated,
    WebhookDeleted,
    AntennaCreated,
    AntennaUpdated,
    AntennaDeleted,
}

// We want to merge `kind` and `object` into a single enum
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToInternalStream")]
pub async fn publish(kind: InternalEvent, object: &serde_json::Value) -> Result<(), Error> {
    let kind = match kind {
        InternalEvent::Suspend => "userChangeSuspendedState",
        InternalEvent::Silence => "userChangeSilencedState",
        InternalEvent::Moderator => "userChangeModeratorState",
        InternalEvent::Token => "userTokenRegenerated",
        InternalEvent::LocalUser => "localUserUpdated",
        InternalEvent::RemoteUser => "remoteUserUpdated",
        InternalEvent::WebhookCreated => "webhookCreated",
        InternalEvent::WebhookUpdated => "webhookUpdated",
        InternalEvent::WebhookDeleted => "webhookDeleted",
        InternalEvent::AntennaCreated => "antennaCreated",
        InternalEvent::AntennaUpdated => "antennaUpdated",
        InternalEvent::AntennaDeleted => "antennaDeleted",
    };

    publish_to_stream(
        &Stream::Internal,
        Some(kind),
        Some(serde_json::to_string(&object)?),
    )
    .await
}
