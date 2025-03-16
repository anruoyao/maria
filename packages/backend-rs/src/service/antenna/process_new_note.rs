use crate::{
    cache,
    database::{redis_conn, redis_key, RedisConnError},
    federation::acct::Acct,
    misc::note::elaborate,
    model::entity::note,
    service::{
        antenna,
        antenna::check_hit::{check_hit_antenna, AntennaCheckError},
        stream,
    },
    util::id::{get_timestamp, InvalidIdError},
};
use redis::{streams::StreamMaxlen, AsyncCommands, RedisError};
use sea_orm::prelude::*;

#[error_doc::errors]
pub enum Error {
    #[doc = "Database error"]
    #[error(transparent)]
    Db(#[from] DbErr),
    #[error("Redis cache operation has failed")]
    Cache(#[from] cache::redis::Error),
    #[error("failed to execute a Redis command")]
    Redis(#[from] RedisError),
    #[error("bad Redis connection")]
    RedisConn(#[from] RedisConnError),
    #[doc = "Provided string is not a valid Firefish ID"]
    #[error(transparent)]
    InvalidId(#[from] InvalidIdError),
    #[error("Redis stream operation has failed")]
    Stream(#[from] stream::Error),
    #[error("failed to check if the note should be added to antenna")]
    AntennaCheck(#[from] AntennaCheckError),
}

// for napi export
// https://github.com/napi-rs/napi-rs/issues/2060
type Note = note::Model;

#[macros::export]
pub async fn update_antennas_on_new_note(
    note: &Note,
    note_author: &Acct,
    note_muted_users: &[String],
) -> Result<(), Error> {
    let note_all_texts = elaborate!(note, false).await?;

    // TODO: do this in parallel
    for antenna in antenna::get_antennas().await?.iter() {
        if note_muted_users.contains(&antenna.user_id) {
            continue;
        }
        if check_hit_antenna(antenna, note, &note_all_texts, note_author).await? {
            add_note_to_antenna(&antenna.id, note).await?;
        }
    }

    Ok(())
}

async fn add_note_to_antenna(antenna_id: &str, note: &Note) -> Result<(), Error> {
    // for streaming API
    stream::antenna::publish(antenna_id.to_owned(), note).await?;

    // for timeline API
    Ok(redis_conn()
        .await?
        .xadd_maxlen(
            redis_key(format!("antennaTimeline:{}", antenna_id)),
            StreamMaxlen::Approx(200),
            format!("{}-*", get_timestamp(&note.id)?),
            &[("note", &note.id)],
        )
        .await?)
}
