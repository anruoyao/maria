//! NodeInfo generator

use crate::{
    cache::Cache,
    config::{local_server_info, CONFIG},
    database::db_conn,
    federation::nodeinfo::schema::*,
    misc,
    model::entity::{note, user},
};
use chrono::Duration;
use sea_orm::prelude::*;
use serde_json::json;
use std::collections::HashMap;

static NODEINFO_CACHE: Cache<Nodeinfo21> = Cache::new_with_ttl(Duration::hours(1));

/// Fetches the number of total/active local users and local posts.
///
/// # Return value
/// A tuple containing the following information in this order:
/// * the total number of local users
/// * the total number of local users active in the last 6 months
/// * the total number of local users active in the last month (MAU)
/// * the total number of posts from local users
async fn statistics() -> Result<(u64, u64, u64, u64), DbErr> {
    let db = db_conn().await?;

    let now = chrono::Utc::now();
    const MONTH: chrono::TimeDelta = chrono::Duration::days(30);
    const HALF_YEAR: chrono::TimeDelta = chrono::Duration::days(183);

    let local_users = misc::user::count::local_total(db);

    // We don't need to care about the number of system actors here,
    // because their last active date is null
    let local_active_halfyear = user::Entity::find()
        .filter(user::Column::Host.is_null())
        .filter(user::Column::LastActiveDate.gt(now - HALF_YEAR))
        .count(db);
    let local_active_month = user::Entity::find()
        .filter(user::Column::Host.is_null())
        .filter(user::Column::LastActiveDate.gt(now - MONTH))
        .count(db);
    let local_posts = note::Entity::find()
        .filter(note::Column::UserHost.is_null())
        .count(db);

    tokio::try_join!(
        local_users,
        local_active_halfyear,
        local_active_month,
        local_posts
    )
}

/// Generates NodeInfo (version 2.1) of the local server.
/// This function doesn't use caches and returns the latest information.
async fn generate_nodeinfo_2_1() -> Result<Nodeinfo21, DbErr> {
    tracing::info!("generating NodeInfo");

    let (local_users, local_active_halfyear, local_active_month, local_posts) =
        statistics().await?;
    let meta = local_server_info().await?;
    let mut metadata = HashMap::from([
        (
            "nodeName".to_owned(),
            json!(meta.name.unwrap_or_else(|| CONFIG.host.clone())),
        ),
        ("nodeDescription".to_owned(), json!(meta.description)),
        ("repositoryUrl".to_owned(), json!(meta.repository_url)),
        (
            "enableLocalTimeline".to_owned(),
            json!(!meta.disable_local_timeline),
        ),
        (
            "enableRecommendedTimeline".to_owned(),
            json!(!meta.disable_recommended_timeline),
        ),
        (
            "enableGlobalTimeline".to_owned(),
            json!(!meta.disable_global_timeline),
        ),
        (
            "enableGuestTimeline".to_owned(),
            json!(meta.enable_guest_timeline),
        ),
        (
            "maintainer".to_owned(),
            json!({"name":meta.maintainer_name,"email":meta.maintainer_email}),
        ),
        ("proxyAccountName".to_owned(), json!(meta.proxy_account_id)),
        (
            "themeColor".to_owned(),
            json!(meta.theme_color.unwrap_or_else(|| "#31748f".to_owned())),
        ),
    ]);
    metadata.shrink_to_fit();

    Ok(Nodeinfo21 {
        software: Software21 {
            name: "firefish".to_owned(),
            version: CONFIG.version.clone(),
            repository: Some(meta.repository_url),
            homepage: Some("https://codeberg.org/firefish/firefish".to_owned()),
        },
        protocols: vec![Protocol::Activitypub],
        services: Services {
            inbound: vec![],
            outbound: vec![Outbound::Atom1, Outbound::Rss2],
        },
        open_registrations: !meta.disable_registration,
        usage: Usage {
            users: Users {
                total: Some(local_users as u32),
                active_halfyear: Some(local_active_halfyear as u32),
                active_month: Some(local_active_month as u32),
            },
            local_posts: Some(local_posts as u32),
            local_comments: None,
        },
        metadata,
    })
}

/// Returns NodeInfo (version 2.1) of the local server.
pub async fn nodeinfo_2_1() -> Result<Nodeinfo21, DbErr> {
    if let Some(nodeinfo) = NODEINFO_CACHE.get() {
        return Ok(nodeinfo);
    }

    let nodeinfo = generate_nodeinfo_2_1().await?;

    tracing::info!("updating cache");
    NODEINFO_CACHE.set(nodeinfo.clone());

    Ok(nodeinfo)
}

/// Returns NodeInfo (version 2.0) of the local server.
pub async fn nodeinfo_2_0() -> Result<Nodeinfo20, DbErr> {
    Ok(nodeinfo_2_1().await?.into())
}

#[macros::for_ts]
#[error_doc::errors]
pub enum Error {
    #[doc = "Database error"]
    #[error(transparent)]
    Db(#[from] DbErr),
    #[error("failed to serialize nodeinfo into JSON")]
    Json(#[from] serde_json::Error),
}

#[macros::ts_export(js_name = "nodeinfo_2_1")]
pub async fn nodeinfo_2_1_as_json() -> Result<serde_json::Value, Error> {
    Ok(serde_json::to_value(nodeinfo_2_1().await?)?)
}

#[macros::ts_export(js_name = "nodeinfo_2_0")]
pub async fn nodeinfo_2_0_as_json() -> Result<serde_json::Value, Error> {
    Ok(serde_json::to_value(nodeinfo_2_0().await?)?)
}
