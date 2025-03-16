//! Determine whether to enable the cat language conversion

use crate::{cache, database::db_conn, model::entity::user};
use chrono::Duration;
use sea_orm::{DbErr, EntityTrait, QuerySelect};

#[error_doc::errors]
pub enum Error {
    #[doc = "Database error"]
    #[error(transparent)]
    Db(#[from] DbErr),
    #[doc = "Cache error"]
    #[error(transparent)]
    Cache(#[from] cache::redis::Error),
    #[doc = "User not found"]
    #[error("user {0} not found")]
    NotFound(String),
}

#[macros::export]
pub async fn should_nyaify(reader_user_id: &str) -> Result<bool, Error> {
    let cached_value = cache::get_one::<bool>(cache::Category::CatLang, reader_user_id).await?;
    if let Some(value) = cached_value {
        return Ok(value);
    }

    let fetched_value = user::Entity::find_by_id(reader_user_id)
        .select_only()
        .column(user::Column::ReadCatLanguage)
        .into_tuple::<bool>()
        .one(db_conn().await?)
        .await?
        .ok_or_else(|| Error::NotFound(reader_user_id.to_owned()))?;

    cache::set_one(
        cache::Category::CatLang,
        reader_user_id,
        &fetched_value,
        Duration::minutes(10),
    )
    .await?;

    Ok(fetched_value)
}
