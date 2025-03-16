#[macros::export(object, js_name = "NoteLikeForIsQuote")]
pub struct NoteLike {
    pub renote_id: Option<String>,
    pub text: Option<String>,
    pub has_poll: bool,
    pub file_ids: Vec<String>,
}

#[macros::export]
pub fn is_quote(note: &NoteLike) -> bool {
    note.renote_id.is_some() && (note.text.is_some() || note.has_poll || !note.file_ids.is_empty())
}
