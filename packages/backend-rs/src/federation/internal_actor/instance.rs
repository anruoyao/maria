//! In-memory instance actor cache

use crate::{database::db_conn, model::entity::user};
use sea_orm::prelude::*;
use tokio::sync::OnceCell;

pub const USERNAME: &str = "instance.actor";
static INSTANCE_ACTOR: OnceCell<user::Model> = OnceCell::const_new();

#[error_doc::errors]
pub enum Error {
    #[error("@instance.actor not found")]
    InstanceActorNotFound,
    #[error(transparent)]
    #[doc = "Database error"]
    Db(#[from] DbErr),
}

async fn set_cache() -> Result<&'static user::Model, Error> {
    let instance_actor = INSTANCE_ACTOR
        .get_or_try_init(|| async {
            tracing::debug!("caching @instance.actor");
            let found_model = user::Entity::find()
                .filter(user::Column::Username.eq(USERNAME))
                .filter(user::Column::Host.is_null())
                .one(db_conn().await?)
                .await?;

            found_model.ok_or(Error::InstanceActorNotFound)
        })
        .await?;

    Ok(instance_actor)
}

pub async fn get() -> Result<&'static user::Model, Error> {
    match INSTANCE_ACTOR.get() {
        Some(model) => Ok(model),
        None => set_cache().await,
    }
}

#[macros::for_ts] // https://github.com/napi-rs/napi-rs/issues/2060
type User = user::Model;

#[macros::ts_export(js_name = "getInstanceActor")]
pub async fn get_js() -> Result<User, Error> {
    Ok(get().await?.to_owned())
}
