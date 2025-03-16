use crate::{database::db_conn, model::entity::note_watching, util::id::gen_id_at};
use sea_orm::{prelude::*, ActiveValue};

#[macros::export]
pub async fn watch_note(
    watcher_id: &str,
    note_author_id: &str,
    note_id: &str,
) -> Result<(), DbErr> {
    if watcher_id != note_author_id {
        let now = chrono::Utc::now();

        note_watching::Entity::insert(note_watching::ActiveModel {
            id: ActiveValue::set(gen_id_at(now)),
            created_at: ActiveValue::set(now.into()),
            user_id: ActiveValue::Set(watcher_id.to_owned()),
            note_user_id: ActiveValue::Set(note_author_id.to_owned()),
            note_id: ActiveValue::Set(note_id.to_owned()),
        })
        .exec(db_conn().await?)
        .await?;
    }

    Ok(())
}

#[macros::export]
pub async fn unwatch_note(watcher_id: &str, note_id: &str) -> Result<(), DbErr> {
    let db = db_conn().await?;

    let entry = note_watching::Entity::find()
        .filter(note_watching::Column::UserId.eq(watcher_id))
        .filter(note_watching::Column::NoteId.eq(note_id))
        .one(db)
        .await?;

    if let Some(entry) = entry {
        entry.delete(db).await?;
    }

    Ok(())
}
