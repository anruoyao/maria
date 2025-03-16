//! Cat language converter

use once_cell::sync::Lazy;
use regex::{Captures, Regex};

/// Converts the given text into the cat language.
///
/// refs:
/// * <https://misskey-hub.net/ns#isCat>
/// * <https://codeberg.org/firefish/firefish/src/branch/main/docs/activitypub-extensions.md#speakascat>
///
/// # Arguments
///
/// * `text` : original text
/// * `lang` : language code (e.g., `Some("en")`, `Some("en-US")`, `Some("uk-UA")`, `None`)
///
/// # Example
///
/// ```
/// # use backend_rs::misc::nyaify::nyaify;
/// assert_eq!(nyaify("I'll take a nap.", Some("en")), "I'll take a nyap.");
/// ```
#[macros::export]
pub fn nyaify(text: &str, lang: Option<String>) -> String {
    let mut to_return = text.to_owned();

    {
        static RE: Lazy<Regex> =
            Lazy::new(|| Regex::new(r"(?i-u)(non)([bcdfghjklmnpqrstvwxyz])").unwrap());
        to_return = RE
            .replace_all(&to_return, |caps: &Captures<'_>| {
                format!(
                    "{}{}",
                    match &caps[1] {
                        "non" => "nyan",
                        "Non" => "Nyan",
                        "NON" => "NYAN",
                        _ => &caps[1],
                    },
                    &caps[2]
                )
            })
            .to_string();
    }

    {
        static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"다([.．。…?？!！\s]|$)").unwrap());
        to_return = RE.replace_all(&to_return, r"다냥$1").to_string();
    }

    {
        static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"야([?？\s]|$)").unwrap());
        to_return = RE.replace_all(&to_return, r"냥$1").to_string();
    }

    {
        static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"([나-낳])").unwrap());
        to_return = RE
            .replace_all(&to_return, |caps: &Captures<'_>| {
                format!(
                    "{}",
                    char::from_u32(
                        caps[0].chars().next().unwrap() as u32 + 56 /* = '냐' - '나' */
                    )
                    .unwrap()
                )
            })
            .to_string();
    }

    if lang.is_some() && lang.unwrap().starts_with("zh") {
        static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"[妙庙描渺瞄秒苗藐廟]").unwrap());
        to_return = RE.replace_all(&to_return, "喵").to_string();
    }

    let simple_rules = [
        ("な", "にゃ"),
        ("ナ", "ニャ"),
        ("ﾅ", "ﾆｬ"),
        ("na", "nya"),
        ("NA", "NYA"),
        ("Na", "Nya"),
        ("morning", "mornyan"),
        ("Morning", "Mornyan"),
        ("MORNING", "MORNYAN"),
        ("everyone", "everynyan"),
        ("Everyone", "Everynyan"),
        ("EVERYONE", "EVERYNYAN"),
        ("να", "νια"),
        ("ΝΑ", "ΝΙΑ"),
        ("Να", "Νια"),
    ];

    simple_rules.into_iter().for_each(|(from, to)| {
        to_return = to_return.replace(from, to);
    });

    to_return
}

#[cfg(test)]
mod unit_test {
    use pretty_assertions::assert_eq;

    #[test]
    fn nyaify() {
        assert_eq!(
            super::nyaify("Hello everyone!", Some("en".to_owned())),
            "Hello everynyan!"
        );
        assert_eq!(
            super::nyaify("Nonbinary people", None),
            "Nyanbinyary people"
        );
        assert_eq!(
            super::nyaify("1分鐘是60秒", Some("zh-TW".to_owned())),
            "1分鐘是60喵"
        );
        assert_eq!(
            super::nyaify("1分間は60秒です", Some("ja-JP".to_owned())),
            "1分間は60秒です"
        );
        assert_eq!(
            super::nyaify("あなたは誰ですか", None),
            "あにゃたは誰ですか"
        );
        assert_eq!(
            super::nyaify("Ναυτικός", Some("el-GR".to_owned())),
            "Νιαυτικός"
        );
        assert_eq!(super::nyaify("일어나다", None), "일어냐다냥");
    }
}
