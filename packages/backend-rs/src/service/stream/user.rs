use crate::service::stream::{publish_to_stream, Error, Stream};

#[macros::export]
pub enum UserEvent {
    Disconnect,
    FollowChannel,
    UnfollowChannel,
    UpdateProfile,
    Mute,
    Unmute,
    Follow,
    Unfollow,
}

// We want to merge `kind` and `object` into a single enum
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToUserStream")]
pub async fn publish(
    user_id: String,
    kind: UserEvent,
    object: &serde_json::Value,
) -> Result<(), Error> {
    let kind = match kind {
        UserEvent::Disconnect => "terminate",
        UserEvent::FollowChannel => "followChannel",
        UserEvent::UnfollowChannel => "unfollowChannel",
        UserEvent::UpdateProfile => "updateUserProfile",
        UserEvent::Mute => "mute",
        UserEvent::Unmute => "unmute",
        UserEvent::Follow => "follow",
        UserEvent::Unfollow => "unfollow",
    };

    publish_to_stream(
        &Stream::User { user_id },
        Some(kind),
        Some(serde_json::to_string(&object)?),
    )
    .await
}
