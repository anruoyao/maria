mod check_hit;
pub mod process_new_note;
pub mod update;

use crate::{cache::Cache, database::db_conn, model::entity::antenna};
use sea_orm::prelude::*;
use std::sync::Arc;

static ANTENNAS_CACHE: Cache<Arc<[antenna::Model]>> = Cache::new();

async fn update() -> Result<Arc<[antenna::Model]>, DbErr> {
    tracing::debug!("updating cache");
    let antennas: Arc<[antenna::Model]> =
        antenna::Entity::find().all(db_conn().await?).await?.into();
    ANTENNAS_CACHE.set(antennas.clone());
    Ok(antennas)
}

async fn get_antennas() -> Result<Arc<[antenna::Model]>, DbErr> {
    if let Some(cache) = ANTENNAS_CACHE.get() {
        return Ok(cache);
    }
    update().await
}
