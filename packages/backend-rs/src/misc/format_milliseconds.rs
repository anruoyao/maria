/// Converts milliseconds to a human readable string.
#[macros::export]
pub fn format_milliseconds(milliseconds: u32) -> String {
    let mut seconds = milliseconds / 1000;
    let mut minutes = seconds / 60;
    let mut hours = minutes / 60;
    let days = hours / 24;

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    let mut buf: Vec<String> = vec![];

    if days > 0 {
        buf.push(format!("{} day(s)", days));
    }
    if hours > 0 {
        buf.push(format!("{} hour(s)", hours));
    }
    if minutes > 0 {
        buf.push(format!("{} minute(s)", minutes));
    }
    if seconds > 0 {
        buf.push(format!("{} second(s)", seconds));
    }

    buf.join(", ")
}

#[cfg(test)]
mod unit_test {
    use pretty_assertions::assert_eq;

    #[test]
    fn format_milliseconds() {
        assert_eq!(super::format_milliseconds(1000), "1 second(s)");
        assert_eq!(
            super::format_milliseconds(1387938),
            "23 minute(s), 7 second(s)"
        );
        assert_eq!(
            super::format_milliseconds(34200457),
            "9 hour(s), 30 minute(s)"
        );
        assert_eq!(
            super::format_milliseconds(998244353),
            "11 day(s), 13 hour(s), 17 minute(s), 24 second(s)"
        );
    }
}
