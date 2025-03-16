use super::{emoji::ApEmoji, *};
use crate::{
    config::CONFIG,
    database::db_conn,
    misc::{self, user},
    model::entity::{emoji, note, note_reaction},
};
use sea_orm::{ColumnTrait, DbErr, EntityTrait, QueryFilter, QuerySelect};

#[error_doc::errors]
pub enum Error {
    #[doc = "Nonexistent note"]
    #[error("note {0} not found")]
    NoteNotFound(String),
    #[doc = "Database error"]
    #[error(transparent)]
    Db(#[from] DbErr),
}

#[macros::export(object, use_nullable = false)]
pub struct ApLike {
    pub id: String,
    pub r#type: Activity,
    pub actor: String,
    pub object: String,
    pub content: String,
    pub tag: Option<Vec<ApEmoji>>,
}

impl ApObject for ApLike {}

impl ApLike {
    #[allow(dead_code)] // TODO: remove this line by actually using it
    async fn new(reaction: note_reaction::Model) -> Result<Self, Error> {
        let db = db_conn().await?;

        let note_uri = {
            let note_uri = note::Entity::find()
                .select_only()
                .column(note::Column::Uri)
                .filter(note::Column::Id.eq(&reaction.note_id))
                .into_tuple::<Option<String>>()
                .one(db)
                .await?;

            match note_uri {
                Some(Some(uri)) => uri,
                Some(None) => misc::note::local_uri(reaction.note_id),
                None => return Err(Error::NoteNotFound(reaction.note_id)),
            }
        };

        let tag = emoji::Entity::find()
            .filter(emoji::Column::Name.eq(reaction.reaction.replace(':', "")))
            .filter(emoji::Column::Host.is_null())
            .one(db)
            .await?
            .map(|emoji| vec![ApEmoji::new(emoji)]);

        Ok(Self {
            id: format!("{}/likes/{}", CONFIG.url, reaction.id),
            r#type: Activity::Like,
            actor: user::local_uri(reaction.user_id),
            object: note_uri,
            content: reaction.reaction,
            tag,
        })
    }
}

#[macros::ts_export]
pub async fn render_like(reaction: note_reaction::Model) -> Result<ApLike, Error> {
    ApLike::new(reaction).await
}
