use crate::service::stream::{publish_to_stream, Error, Stream};

#[macros::export]
pub enum Event {
    Notification,
    NewNotification,
    Mention,
    NewMention,
    Chat,
    NewChat,
    NewDm,
    Reply,
    Renote,
    Follow,
    Followed,
    Unfollow,
    NewFollowRequest,
    Page,
    ReadAllNotifications,
    ReadAllMentions,
    ReadNotifications,
    ReadAllDms,
    ReadAllChats,
    ReadAntenna,
    ReadAllAntennaPosts,
    NewAntennaPost,
    ReadAllAnnouncements,
    ReadAllChannelPosts,
    NewChannelPost,
    DriveFile,
    UrlUploadFinished,
    Me,
    RegenerateMyToken,
    Signin,
    Registry,
}

// We want to merge `kind` and `object` into a single enum
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToMainStream")]
pub async fn publish(
    user_id: String,
    kind: Event,
    object: &serde_json::Value,
) -> Result<(), Error> {
    let kind = match kind {
        Event::Notification => "notification",
        Event::Mention => "mention",
        Event::Reply => "reply",
        Event::Renote => "renote",
        Event::Follow => "follow",
        Event::Followed => "followed",
        Event::Unfollow => "unfollow",
        Event::Me => "meUpdated",
        Event::Page => "pageEvent",
        Event::UrlUploadFinished => "urlUploadFinished",
        Event::ReadAllNotifications => "readAllNotifications",
        Event::ReadNotifications => "readNotifications",
        Event::NewNotification => "unreadNotification",
        Event::NewMention => "unreadMention",
        Event::ReadAllMentions => "readAllUnreadMentions",
        Event::ReadAllDms => "readAllUnreadSpecifiedNotes",
        Event::NewDm => "unreadSpecifiedNote",
        Event::ReadAllChats => "readAllMessagingMessages",
        Event::Chat => "messagingMessage",
        Event::NewChat => "unreadMessagingMessage",
        Event::ReadAllAntennaPosts => "readAllAntennas",
        Event::NewAntennaPost => "unreadAntenna",
        Event::ReadAllAnnouncements => "readAllAnnouncements",
        Event::ReadAllChannelPosts => "readAllChannels",
        Event::NewChannelPost => "unreadChannel",
        Event::RegenerateMyToken => "myTokenRegenerated",
        Event::Signin => "signin",
        Event::Registry => "registryUpdated",
        Event::DriveFile => "driveFileCreated",
        Event::ReadAntenna => "readAntenna",
        Event::NewFollowRequest => "receiveFollowRequest",
    };

    publish_to_stream(
        &Stream::Main { user_id },
        Some(kind),
        Some(serde_json::to_string(&object)?),
    )
    .await
}
