use crate::{
    config::local_server_info,
    database::db_conn,
    misc::{is_safe_url::is_safe_url, note::summarize},
    model::entity::{access_token, app, sw_subscription},
    util::{
        http_client,
        id::{get_timestamp, InvalidIdError},
    },
};
use once_cell::sync::OnceCell;
use sea_orm::prelude::*;
use serde::Deserialize;
use web_push::*;

#[error_doc::errors]
pub enum Error {
    #[doc = "Database error"]
    #[error(transparent)]
    Db(#[from] DbErr),
    #[error("web push has failed")]
    WebPush(#[from] WebPushError),
    #[error("failed to (de)serialize an object")]
    Serialize(#[from] serde_json::Error),
    #[doc = "Provided content is invalid"]
    #[error("invalid content ({0})")]
    InvalidContent(String),
    #[doc = "Found Mastodon subscription is invalid"]
    #[error("invalid subscription ({0})")]
    InvalidSubscription(String),
    #[error("invalid notification ID")]
    InvalidId(#[from] InvalidIdError),
    #[error("failed to acquire an HTTP client")]
    HttpClient(#[from] http_client::Error),
    #[error("access to this URL is not allowed")]
    UnsafeUrl,
}

static CLIENT: OnceCell<IsahcWebPushClient> = OnceCell::new();

fn get_client() -> Result<IsahcWebPushClient, Error> {
    Ok(CLIENT
        .get_or_try_init(|| http_client::client().map(IsahcWebPushClient::from))
        .cloned()?)
}

#[macros::export(string_enum = "camelCase")]
pub enum PushNotificationKind {
    Generic,
    Chat,
    ReadAllChats,
    ReadAllChatsInTheRoom,
    ReadNotifications,
    ReadAllNotifications,
    Mastodon,
}

fn compact_content(mut content: serde_json::Value) -> Result<serde_json::Value, Error> {
    if !content.is_object() {
        return Err(Error::InvalidContent("not a JSON object".to_owned()));
    }

    let object = content.as_object_mut().unwrap();

    if !object.contains_key("note") {
        return Ok(content);
    }

    let mut note = if object.contains_key("type") && object.get("type").unwrap() == "renote" {
        object
            .get("note")
            .unwrap()
            .get("renote")
            .ok_or(Error::InvalidContent("renote object is missing".to_owned()))?
    } else {
        object.get("note").unwrap()
    }
    .clone();

    if !note.is_object() {
        return Err(Error::InvalidContent(
            "(re)note is not an object".to_owned(),
        ));
    }

    // TODO: get rid of this struct
    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct PartialNote {
        file_ids: Vec<String>,
        text: Option<String>,
        cw: Option<String>,
        has_poll: bool,
    }

    let note_like: PartialNote = serde_json::from_value(note.clone())?;
    let text = summarize!(note_like);

    let note_object = note.as_object_mut().unwrap();

    note_object.remove("reply");
    note_object.remove("renote");
    note_object.remove("user");
    note_object.insert("text".to_owned(), text.into());
    object.insert("note".to_owned(), note);

    Ok(serde_json::from_value(Json::Object(object.clone()))?)
}

/// Returns a tuple containing the token and client name
async fn get_mastodon_subscription_info(
    db: &DbConn,
    subscription_id: &str,
    token_id: &str,
) -> Result<(String, String), Error> {
    let token = access_token::Entity::find()
        .filter(access_token::Column::Id.eq(token_id))
        .one(db)
        .await?;

    if token.is_none() {
        unsubscribe(db, subscription_id).await?;
        return Err(Error::InvalidSubscription(
            "access token not found".to_owned(),
        ));
    }
    let token = token.unwrap();

    if token.app_id.is_none() {
        unsubscribe(db, subscription_id).await?;
        return Err(Error::InvalidSubscription("no app ID".to_owned()));
    }
    let app_id = token.app_id.unwrap();

    let client = app::Entity::find()
        .filter(app::Column::Id.eq(app_id))
        .one(db)
        .await?;

    if client.is_none() {
        unsubscribe(db, subscription_id).await?;
        return Err(Error::InvalidSubscription("app not found".to_owned()));
    }

    Ok((token.token, client.unwrap().name))
}

async fn encode_mastodon_payload(
    mut content: serde_json::Value,
    db: &DbConn,
    subscription: &sw_subscription::Model,
) -> Result<String, Error> {
    let object = content
        .as_object_mut()
        .ok_or(Error::InvalidContent("not a JSON object".to_owned()))?;

    if subscription.app_access_token_id.is_none() {
        unsubscribe(db, &subscription.id).await?;
        return Err(Error::InvalidSubscription("no access token".to_owned()));
    }

    let (token, client_name) = get_mastodon_subscription_info(
        db,
        &subscription.id,
        subscription.app_access_token_id.as_ref().unwrap(),
    )
    .await?;

    object.insert("access_token".to_owned(), serde_json::to_value(token)?);

    // Some apps expect notification_id to be an integer,
    // but doesn’t break when the ID doesn’t match the rest of API.
    if [
        "IceCubesApp",
        "Mammoth",
        "feather",
        "MaserApp",
        "Metatext",
        "Feditext",
    ]
    .contains(&client_name.as_str())
    {
        let timestamp = object
            .get("notification_id")
            .and_then(|id| id.as_str())
            .map(get_timestamp)
            .transpose()?
            .unwrap_or_default();

        object.insert("notification_id".to_owned(), timestamp.into());
    }

    let res = serde_json::to_string(&content)?;

    // Adding space paddings to the end of JSON payload to prevent
    // `esm` from adding null bytes payload which many Mastodon clients don’t support.
    // not using the padding parameter directly on `res` because we want the padding to be
    // calculated based on the UTF-8 byte size of `res` instead of number of characters.
    let pad_length = match res.len() % 128 {
        127 => 127,
        n => 126 - n,
    };

    Ok(format!("{}{:pad_length$}", res, ""))
}

async fn unsubscribe(db: &DbConn, subscription_id: &str) -> Result<(), DbErr> {
    sw_subscription::Entity::delete_by_id(subscription_id)
        .exec(db)
        .await?;
    Ok(())
}

async fn handle_web_push_failure(
    db: &DbConn,
    err: WebPushError,
    subscription_id: &str,
    error_message: &str,
) -> Result<(), DbErr> {
    match err {
        WebPushError::BadRequest(_)
        | WebPushError::ServerError(_)
        | WebPushError::InvalidUri
        | WebPushError::EndpointNotValid
        | WebPushError::EndpointNotFound
        | WebPushError::TlsError
        | WebPushError::SslError
        | WebPushError::InvalidPackageName
        | WebPushError::MissingCryptoKeys
        | WebPushError::InvalidCryptoKeys
        | WebPushError::InvalidResponse => {
            unsubscribe(db, subscription_id).await?;
            tracing::info!("{}; {} was unsubscribed", error_message, subscription_id);
            tracing::debug!("reason: {:#?}", err);
        }
        _ => {
            tracing::warn!("{}; subscription id: {}", error_message, subscription_id);
            tracing::info!("reason: {:#?}", err);
        }
    };

    Ok(())
}

#[macros::export]
pub async fn send_push_notification(
    receiver_user_id: &str,
    kind: PushNotificationKind,
    content: &serde_json::Value,
) -> Result<(), Error> {
    let meta = local_server_info().await?;

    if !meta.enable_service_worker || meta.sw_public_key.is_none() || meta.sw_private_key.is_none()
    {
        return Ok(());
    }

    let db = db_conn().await?;

    let signature_builder = VapidSignatureBuilder::from_base64_no_sub(
        meta.sw_private_key.unwrap().as_str(),
        web_push::URL_SAFE_NO_PAD,
    )?;

    let subscriptions = sw_subscription::Entity::find()
        .filter(sw_subscription::Column::UserId.eq(receiver_user_id))
        .all(db)
        .await?;

    let use_mastodon_api = matches!(kind, PushNotificationKind::Mastodon);

    // TODO: refactoring
    let mut payload = if use_mastodon_api {
        // Content generated per subscription
        "".to_owned()
    } else {
        // Format the `content` passed from the TypeScript backend
        // for Firefish push notifications
        let label = match kind {
            PushNotificationKind::Generic => "notification",
            PushNotificationKind::Chat => "unreadMessagingMessage",
            PushNotificationKind::ReadAllChats => "readAllMessagingMessages",
            PushNotificationKind::ReadAllChatsInTheRoom => "readAllMessagingMessagesOfARoom",
            PushNotificationKind::ReadNotifications => "readNotifications",
            PushNotificationKind::ReadAllNotifications => "readAllNotifications",
            // unreachable
            _ => "unknown",
        };
        format!(
            "{{\"type\":\"{}\",\"userId\":\"{}\",\"dateTime\":{},\"body\":{}}}",
            label,
            receiver_user_id,
            chrono::Utc::now().timestamp_millis(),
            match kind {
                PushNotificationKind::Generic =>
                    serde_json::to_string(&compact_content(content.to_owned())?)?,
                _ => serde_json::to_string(&content)?,
            }
        )
    };
    tracing::trace!("payload: {}", payload);

    let encoding = if use_mastodon_api {
        ContentEncoding::AesGcm
    } else {
        ContentEncoding::Aes128Gcm
    };

    for subscription in subscriptions.iter() {
        if !is_safe_url(&subscription.endpoint) {
            unsubscribe(db, &subscription.id).await?;
            continue;
        }

        if !subscription.send_read_message
            && matches!(
                kind,
                PushNotificationKind::ReadAllChats
                    | PushNotificationKind::ReadAllChatsInTheRoom
                    | PushNotificationKind::ReadAllNotifications
                    | PushNotificationKind::ReadNotifications
            )
        {
            continue;
        }

        if use_mastodon_api {
            if subscription.app_access_token_id.is_none() {
                continue;
            }
            payload = encode_mastodon_payload(content.clone(), db, subscription).await?;
        } else if subscription.app_access_token_id.is_some() {
            continue;
        }

        let subscription_info = SubscriptionInfo {
            endpoint: subscription.endpoint.to_owned(),
            keys: SubscriptionKeys {
                // convert standard base64 into base64url
                // https://en.wikipedia.org/wiki/Base64#Variants_summary_table
                p256dh: subscription
                    .publickey
                    .replace('+', "-")
                    .replace('/', "_")
                    .to_owned(),
                auth: subscription
                    .auth
                    .replace('+', "-")
                    .replace('/', "_")
                    .to_owned(),
            },
        };

        let signature = signature_builder
            .clone()
            .add_sub_info(&subscription_info)
            .build();

        if let Err(err) = signature {
            handle_web_push_failure(db, err, &subscription.id, "failed to build a signature")
                .await?;
            continue;
        }

        let mut message_builder = WebPushMessageBuilder::new(&subscription_info);
        message_builder.set_ttl(1000);
        message_builder.set_payload(encoding, payload.as_bytes());
        message_builder.set_vapid_signature(signature.unwrap());

        let message = message_builder.build();

        if let Err(err) = message {
            handle_web_push_failure(db, err, &subscription.id, "failed to build a payload").await?;
            continue;
        }

        // Ice Cubes cannot process ";rs=4096" at at the end of Encryption header
        let mut message = message.unwrap();

        if let Some(payload) = message.payload {
            let crypto_headers: Vec<(&str, String)> = payload
                .crypto_headers
                .into_iter()
                .map(|(key, val)| match key {
                    "Encryption" => (key, val.replace(";rs=4096", "")),
                    _ => (key, val),
                })
                .collect();

            message.payload = Some(WebPushPayload {
                content: payload.content,
                content_encoding: payload.content_encoding,
                crypto_headers,
            });
        }

        if let Err(err) = get_client()?.send(message).await {
            handle_web_push_failure(db, err, &subscription.id, "failed to send").await?;
            continue;
        }

        tracing::debug!("success; subscription id: {}", subscription.id);
    }

    Ok(())
}
