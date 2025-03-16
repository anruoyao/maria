//! In-memory relay actor id cache

use crate::{database::db_conn, model::entity::user};
use sea_orm::{prelude::*, QuerySelect};
use tokio::sync::OnceCell;

pub const USERNAME: &str = "relay.actor";
static RELAY_ACTOR_ID: OnceCell<String> = OnceCell::const_new();

#[error_doc::errors]
pub enum Error {
    #[error("@relay.actor not found")]
    RelayActorNotFound,
    #[error(transparent)]
    #[doc = "Database error"]
    Db(#[from] DbErr),
}

async fn set_id_cache() -> Result<&'static str, Error> {
    let id = RELAY_ACTOR_ID
        .get_or_try_init(|| async {
            tracing::debug!("caching @relay.actor");
            let found_id = user::Entity::find()
                .select_only()
                .column(user::Column::Id)
                .filter(user::Column::Username.eq(USERNAME))
                .filter(user::Column::Host.is_null())
                .into_tuple::<String>()
                .one(db_conn().await?)
                .await?;

            found_id.ok_or(Error::RelayActorNotFound)
        })
        .await?;

    Ok(id)
}

#[macros::export(js_name = "getRelayActorId")]
pub async fn get_id() -> Result<&'static str, Error> {
    match RELAY_ACTOR_ID.get() {
        Some(id) => Ok(id),
        None => set_id_cache().await,
    }
}
