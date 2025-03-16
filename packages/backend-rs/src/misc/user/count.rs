use crate::{federation::internal_actor::INTERNAL_ACTORS, model::entity::user};
use sea_orm::prelude::*;

pub async fn local_total(db: &DbConn) -> Result<u64, DbErr> {
    user::Entity::find()
        .filter(user::Column::Host.is_null())
        .count(db)
        .await
        .map(|count| count - INTERNAL_ACTORS)
}

#[macros::ts_export(js_name = "countLocalUsers")]
pub async fn local_total_js() -> Result<u32, DbErr> {
    local_total(crate::database::db_conn().await?)
        .await
        .map(|count| count as u32)
}
