use crate::misc::note::elaborate;
use once_cell::sync::Lazy;
use regex::Regex;
use sea_orm::DbErr;

#[macros::export(object)]
pub struct PartialNoteToCheckWordMute {
    pub file_ids: Vec<String>,
    pub text: Option<String>,
    pub cw: Option<String>,
    pub renote_id: Option<String>,
    pub reply_id: Option<String>,
}

fn convert_regex(js_regex: &str) -> String {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"^/(.+)/(.*)$").unwrap());
    RE.replace(js_regex, "(?$2)$1").to_string()
}

fn check_word_mute_impl(
    texts: &[String],
    muted_words: &[String],
    muted_patterns: &[String],
) -> bool {
    muted_words.iter().any(|item| {
        texts.iter().any(|text| {
            let text_lower = text.to_lowercase();
            item.split_whitespace()
                .all(|muted_word| text_lower.contains(&muted_word.to_lowercase()))
        })
    }) || muted_patterns.iter().any(|muted_pattern| {
        Regex::new(convert_regex(muted_pattern).as_str())
            .map(|re| texts.iter().any(|text| re.is_match(text)))
            .unwrap_or(false)
    })
}

/// Returns whether `note` should be hard-muted.
///
/// More specifically, this function returns `Ok(true)`
/// if and only if one or more of these conditions are met:
///
/// * the note (text or CW) contains any of the words/patterns
/// * the "parent" note(s) (reply, quote) contain any of the words/patterns
/// * the alt text of the attached files contains any of the words/patterns
///
/// # Arguments
///
/// * `note` : [PartialNoteToCheckWordMute] object
/// * `muted_words` : list of muted keyword lists (each array item is a space-separated keyword list that represents an AND condition)
/// * `muted_patterns` : list of JavaScript-style (e.g., `/foo/i`) regular expressions
#[macros::export]
pub async fn check_word_mute(
    note: PartialNoteToCheckWordMute,
    muted_words: &[String],
    muted_patterns: &[String],
) -> Result<bool, DbErr> {
    if muted_words.is_empty() && muted_patterns.is_empty() {
        Ok(false)
    } else {
        Ok(check_word_mute_impl(
            &elaborate!(note, true).await?,
            muted_words,
            muted_patterns,
        ))
    }
}

#[cfg(test)]
mod unit_test {
    use super::check_word_mute_impl;

    #[test]
    fn word_mute_match() {
        let texts = [
            "The quick brown fox jumps over the lazy dog.".to_owned(),
            "色は匂へど 散りぬるを 我が世誰ぞ 常ならむ".to_owned(),
            "😇".to_owned(),
        ];

        let hiragana_1 = r"/[\u{3040}-\u{309f}]/u".to_owned();
        let hiragana_2 = r"/[あ-ん]/u".to_owned();
        let katakana_1 = r"/[\u{30a1}-\u{30ff}]/u".to_owned();
        let katakana_2 = r"/[ア-ン]/u".to_owned();
        let emoji = r"/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/u".to_owned();

        assert!(check_word_mute_impl(&texts, &[], &["/the/i".to_owned()]));

        assert!(!check_word_mute_impl(&texts, &[], &["/the/".to_owned()]));

        assert!(check_word_mute_impl(&texts, &[], &["/QuICk/i".to_owned()]));

        assert!(!check_word_mute_impl(&texts, &[], &["/QuICk/".to_owned()]));

        assert!(check_word_mute_impl(
            &texts,
            &[
                "我".to_owned(),
                "有為の奥山 今日越えて 浅き夢見し 酔ひもせず".to_owned()
            ],
            &[]
        ));

        assert!(!check_word_mute_impl(
            &texts,
            &["有為の奥山 今日越えて 浅き夢見し 酔ひもせず".to_owned()],
            &[]
        ));

        assert!(!check_word_mute_impl(
            &texts,
            &[
                "有為の奥山".to_owned(),
                "今日越えて".to_owned(),
                "浅き夢見し".to_owned(),
                "酔ひもせず".to_owned()
            ],
            &[]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "mastodon".to_owned()],
            &[hiragana_1.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "mastodon".to_owned()],
            &[hiragana_2.clone()]
        ));

        assert!(!check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "mastodon".to_owned()],
            &[katakana_1.clone()]
        ));

        assert!(!check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "mastodon".to_owned()],
            &[katakana_2.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["brown fox".to_owned(), "mastodon".to_owned()],
            &[katakana_1.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["brown fox".to_owned(), "mastodon".to_owned()],
            &[katakana_2.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "dog".to_owned()],
            &[katakana_1.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "dog".to_owned()],
            &[katakana_2.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["yellow fox".to_owned(), "mastodon".to_owned()],
            &[hiragana_1.clone(), katakana_1.clone()]
        ));

        assert!(check_word_mute_impl(
            &texts,
            &["😇".to_owned(), "🥲".to_owned(), "🥴".to_owned()],
            &[]
        ));

        assert!(!check_word_mute_impl(
            &texts,
            &["🙂".to_owned(), "🥲".to_owned(), "🥴".to_owned()],
            &[]
        ));

        assert!(check_word_mute_impl(&texts, &[], &[emoji.clone()]));
    }
}
