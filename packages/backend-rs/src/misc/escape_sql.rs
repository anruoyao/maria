use once_cell::sync::Lazy;
use regex::Regex;

/// Escapes `%` and `\` in the given string.
#[macros::export]
pub fn sql_like_escape(src: &str) -> String {
    src.replace('%', r"\%").replace('_', r"\_")
}

#[macros::export]
pub fn sql_regex_escape(src: &str) -> String {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"[!$()*+.:<=>?\[\]\^{|}-]").unwrap());
    RE.replace_all(src, r"\$1").to_string()
}

/// Returns `true` if `src` does not contain suspicious characters like `%`.
#[macros::export]
pub fn safe_for_sql(src: &str) -> bool {
    !src.contains([
        '\0', '\x08', '\x09', '\x1a', '\n', '\r', '"', '\'', '\\', '%',
    ])
}

#[cfg(test)]
mod unit_test {
    use pretty_assertions::assert_eq;

    #[test]
    fn sql_like_escape() {
        assert_eq!(super::sql_like_escape(""), "");
        assert_eq!(super::sql_like_escape("abc"), "abc");
        assert_eq!(super::sql_like_escape("a%bc"), r"a\%bc");
        assert_eq!(super::sql_like_escape("a呼%吸bc"), r"a呼\%吸bc");
        assert_eq!(super::sql_like_escape("a呼%吸b%_c"), r"a呼\%吸b\%\_c");
        assert_eq!(super::sql_like_escape("_اللغة العربية"), r"\_اللغة العربية");
    }

    #[test]
    fn safe_for_sql() {
        assert!(super::safe_for_sql("123"));
        assert!(super::safe_for_sql("人間"));
        assert!(!super::safe_for_sql("人間\x09"));
        assert!(!super::safe_for_sql("abc\ndef"));
        assert!(!super::safe_for_sql("%something%"));
    }
}
