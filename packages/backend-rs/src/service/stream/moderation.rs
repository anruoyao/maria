use crate::service::stream::{publish_to_stream, Error, Stream};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object)]
pub struct AbuseUserReportLike {
    pub id: String,
    pub target_user_id: String,
    pub reporter_id: String,
    pub comment: String,
}

#[macros::export(js_name = "publishToModerationStream")]
pub async fn publish(moderator_id: String, report: &AbuseUserReportLike) -> Result<(), Error> {
    publish_to_stream(
        &Stream::Moderation { moderator_id },
        Some("newAbuseUserReport"),
        Some(serde_json::to_string(report)?),
    )
    .await
}
