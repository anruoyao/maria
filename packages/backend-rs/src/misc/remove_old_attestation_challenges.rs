// TODO: Migrate to Redis

use crate::{database::db_conn, model::entity::attestation_challenge};
use chrono::{Duration, Utc};
use sea_orm::prelude::*;

/// Delete all entries in the [attestation_challenge] table created at more than 5 minutes ago
#[macros::export]
pub async fn remove_old_attestation_challenges() -> Result<(), DbErr> {
    let res = attestation_challenge::Entity::delete_many()
        .filter(attestation_challenge::Column::CreatedAt.lt(Utc::now() - Duration::minutes(5)))
        .exec(db_conn().await?)
        .await?;

    tracing::info!("removed {} rows", res.rows_affected);

    Ok(())
}
