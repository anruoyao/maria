#[macros::export]
pub fn is_safe_url(url: &str) -> bool {
    // reject malformed url
    let Ok(url) = url::Url::parse(url) else {
        return false;
    };

    if !matches!(url.scheme(), "http" | "https") {
        return false;
    }

    // resolve domain and reject if failed to resolve
    let Ok(addrs) = url.socket_addrs(|| None) else {
        return false;
    };

    if addrs.is_empty() {
        return false;
    }

    // ensure no address is in rejected ranges
    !addrs.iter().any(|addr| {
        let ip = addr.ip().to_canonical();

        ip.is_unspecified()
            || ip.is_loopback()
            || ip.is_multicast()
            || match ip {
                std::net::IpAddr::V4(ip) => ip.is_private() || ip.is_link_local(),
                std::net::IpAddr::V6(ip) => {
                    ip.segments()[0] & 0xfe00 == 0xfc00 // unique local (fc00::/7)
                 || ip.segments()[0] & 0xffc0 == 0xfe80 // link local (fe80::/10)
                }
            }
    })
}

#[cfg(test)]
mod unit_test {
    #[test]
    fn is_safe_url() {
        assert!(super::is_safe_url("https://firefish.dev/firefish/firefish"));
        assert!(super::is_safe_url("http://[::ffff:8.8.8.8]:3000"));
        assert!(super::is_safe_url("http://[2000::]"));
        assert!(!super::is_safe_url("http://172.17.0.1:8080/?foo=bar"));
        assert!(!super::is_safe_url("ftp://firefish.dev/firefish/firefish"));
        assert!(!super::is_safe_url("http://localhost:3000"));
        assert!(!super::is_safe_url("http://127.0.0.1:3000"));
        assert!(!super::is_safe_url("http://[::1]:3000"));
        assert!(!super::is_safe_url("http://[::ffff:127.0.0.1]:3000"));
        assert!(!super::is_safe_url("http://[fc39:ff14::abc]"));
        assert!(!super::is_safe_url("http://[fdef:194::3e03]"));
        assert!(!super::is_safe_url("http://[fe80::428]"));
        assert!(!super::is_safe_url("unix:///run/postgresql/.s.PGSQL.5432"));
    }
}
