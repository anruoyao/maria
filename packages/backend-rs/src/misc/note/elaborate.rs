use crate::{
    database::db_conn,
    model::entity::{drive_file, note},
};
use sea_orm::{prelude::*, QuerySelect};

/// Returns [`Vec<String>`] containing the post text, content warning,
/// those of the "parent" (replied/quoted) posts, and alt texts of attached files.
/// Consider using [`elaborate`] macro instead
/// when dealing with a note ([`note::Model`])-like instance.
///
/// # Arguments
///
/// * `file_ids` : IDs of attached files ([`drive_file::Model`])
/// * `text`, `cw`, `renote_id`, `reply_id` : note ([`note::Model`]) fields
/// * `include_parent` : whether to take the reply-to post and quoted post into account
pub async fn elaborate_impl(
    file_ids: &[String],
    text: Option<String>,
    cw: Option<String>,
    renote_id: Option<&String>,
    reply_id: Option<&String>,
    include_parent: bool,
) -> Result<Vec<String>, DbErr> {
    let db = db_conn().await?;

    let mut texts: Vec<String> = vec![];
    let is_renote = text.is_none();

    if let Some(text) = text {
        texts.push(text);
    }
    if let Some(cw) = cw {
        texts.push(cw);
    }

    texts.extend(
        drive_file::Entity::find()
            .select_only()
            .column(drive_file::Column::Comment)
            .filter(drive_file::Column::Id.is_in(file_ids))
            .into_tuple::<Option<String>>()
            .all(db)
            .await?
            .into_iter()
            .flatten(),
    );

    let mut query_note_ids = Vec::<&str>::with_capacity(2);
    if let Some(renote_id) = renote_id {
        if include_parent || is_renote {
            query_note_ids.push(renote_id);
        }
    }
    if let Some(reply_id) = reply_id {
        if include_parent {
            query_note_ids.push(reply_id);
        }
    }
    if !query_note_ids.is_empty() {
        texts.extend(
            note::Entity::find()
                .filter(note::Column::Id.is_in(query_note_ids))
                .select_only()
                .columns([note::Column::Text, note::Column::Cw])
                .into_tuple::<(Option<String>, Option<String>)>()
                .one(db)
                .await?
                .into_iter()
                .flat_map(|(text, cw)| [text, cw])
                .flatten(),
        );
    }

    Ok(texts)
}

/// Returns [`Vec<String>`] containing the post text, content warning,
/// those of the "parent" (replied/quoted) posts, and alt texts of attached files.
///
/// # Arguments
///
/// * `note_like` : a note ([`note::Model`])-like instance containing
///   `file_ids`, `text`, `cw`, `renote_id`, `reply_id` fields
/// * `include_parent` ([bool]) : whether to take the reply-to post and quoted post into account
///
/// # Caveats
///
/// The `note_like` argument should not contain function calls
/// (e.g., `elaborate!(note.clone(), false)`)
/// since the function will be called multiple times after macro expansion.
///
/// # Examples
///
/// ```
/// # use backend_rs::misc::note::elaborate;
/// // note-like struct
/// struct NoteLike {
///     // required fields
///     file_ids: Vec<String>,
///     text: Option<String>,
///     cw: Option<String>,
///     renote_id: Option<String>,
///     reply_id: Option<String>,
///     // arbitrary extra fields
///     extra_field_1: u32,
///     extra_field_2: Vec<String>,
/// }
///
/// async fn print_all_related_texts(
///     note: &NoteLike
/// ) -> Result<(), sea_orm::DbErr> {
///     let all_texts = elaborate!(note, true).await?;
///     all_texts.iter().map(|text| println!("{}", text));
///     Ok(())
/// }
/// ```
#[doc(hidden)] // hide the macro in the top doc page
#[macro_export]
macro_rules! elaborate {
    ($note_like:expr, $include_parent:expr) => {
        $crate::misc::note::elaborate::elaborate_impl(
            &$note_like.file_ids,
            $note_like.text.clone(),
            $note_like.cw.clone(),
            $note_like.renote_id.as_ref(),
            $note_like.reply_id.as_ref(),
            $include_parent,
        )
    };
}

#[doc(inline)] // show the macro in the module doc page
pub use elaborate;
