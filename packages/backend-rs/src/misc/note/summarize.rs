#[macros::export(js_name = "getNoteSummary")]
pub fn summarize_impl(
    file_ids: &[String],
    text: Option<String>,
    cw: Option<String>,
    has_poll: bool,
) -> String {
    let mut buf: Vec<String> = vec![];

    if let Some(cw) = cw {
        buf.push(cw)
    } else if let Some(text) = text {
        buf.push(text)
    }

    match file_ids.len() {
        0 => (),
        1 => buf.push("📎".to_owned()),
        n => buf.push(format!("📎 ({})", n)),
    };

    if has_poll {
        buf.push("📊".to_owned())
    }

    buf.join(" ")
}

/// Returns the summary of a post, which can be used to display posts in small spaces
/// such as push notifications.
///
/// # Arguments
///
/// * `note_like` : a note ([`note::Model`](crate::model::entity::note::Model))-like instance containing
///   `file_ids`, `text`, `cw`, `has_poll` fields
///
/// # Caveats
///
/// The `note_like` argument should not contain function calls
/// (e.g., `summarize!(note.clone())`)
/// since the function will be called multiple times after macro expansion.
///
/// # Examples
///
/// ```
/// # use backend_rs::misc::note::summarize;
/// // note-like struct
/// struct NoteLike {
///     // required fields
///     file_ids: Vec<String>,
///     text: Option<String>,
///     cw: Option<String>,
///     has_poll: bool,
///     // arbitrary extra fields
///     renote_id: Option<String>,
///     reply_id: Option<String>,
///     extra_field_1: u32,
///     extra_field_2: Vec<String>,
/// }
///
/// fn print_note_summary(note: &NoteLike) {
///     println!("{}", summarize!(note));
/// }
/// ```
#[doc(hidden)] // hide the macro in the top doc page
#[macro_export]
macro_rules! summarize {
    ($note_like:expr) => {
        $crate::misc::note::summarize::summarize_impl(
            &$note_like.file_ids,
            $note_like.text.to_owned(),
            $note_like.cw.to_owned(),
            $note_like.has_poll.to_owned(),
        )
    };
}

#[doc(inline)] // show the macro in the module doc page
pub use summarize;

#[cfg(test)]
mod unit_test {
    use super::summarize;
    use pretty_assertions::assert_eq;

    struct NoteLike {
        file_ids: Vec<String>,
        text: Option<String>,
        cw: Option<String>,
        has_poll: bool,
    }

    #[test]
    fn summarize_note() {
        let note = NoteLike {
            file_ids: vec![],
            text: Some("Hello world!".to_owned()),
            cw: None,
            has_poll: false,
        };
        assert_eq!(summarize!(note), "Hello world!");

        let note_with_cw = NoteLike {
            file_ids: vec![],
            text: Some("Hello world!".to_owned()),
            cw: Some("Content warning".to_owned()),
            has_poll: false,
        };
        assert_eq!(summarize!(note_with_cw), "Content warning");

        let note_with_file_and_cw = NoteLike {
            file_ids: vec!["9s7fmcqogiq4igin".to_owned()],
            text: None,
            cw: Some("Selfie, no ec".to_owned()),
            has_poll: false,
        };
        assert_eq!(summarize!(note_with_file_and_cw), "Selfie, no ec 📎");

        let note_with_files_only = NoteLike {
            file_ids: vec![
                "9s7fmcqogiq4igin".to_owned(),
                "9s7qrld5u14cey98".to_owned(),
                "9s7gebs5zgts4kca".to_owned(),
                "9s5z3e4vefqd29ee".to_owned(),
            ],
            text: None,
            cw: None,
            has_poll: false,
        };
        assert_eq!(summarize!(note_with_files_only), "📎 (4)");

        let note_all = NoteLike {
            file_ids: vec![
                "9s7fmcqogiq4igin".to_owned(),
                "9s7qrld5u14cey98".to_owned(),
                "9s7gebs5zgts4kca".to_owned(),
                "9s5z3e4vefqd29ee".to_owned(),
            ],
            text: Some("Hello world!".to_owned()),
            cw: Some("Content warning".to_owned()),
            has_poll: true,
        };
        assert_eq!(summarize!(note_all), "Content warning 📎 (4) 📊");
    }
}
