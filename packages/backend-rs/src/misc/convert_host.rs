//! This module is used in the TypeScript backend only.
// We may want to (re)implement these functions in the `federation` module
// in a Rusty way (e.g., traits of actor type) if needed.

#[error_doc::errors]
pub enum Error {
    #[doc = "UTS #46 process has failed"]
    #[error(transparent)]
    Idna(#[from] idna::Errors),
    #[error("failed to parse a URL")]
    UrlParse(#[from] url::ParseError),
    #[error("hostname is missing")]
    NoHostname,
}

#[macros::ts_export]
pub fn get_full_ap_account(username: &str, host: Option<String>) -> Result<String, Error> {
    Ok(match host {
        Some(host) => format!("{}@{}", username, to_puny(host.as_ref())?),
        None => format!("{}@{}", username, extract_host(&crate::config::CONFIG.url)?),
    })
}

#[macros::ts_export]
pub fn is_self_host(host: Option<String>) -> Result<bool, Error> {
    Ok(match host {
        Some(host) => extract_host(&crate::config::CONFIG.url)? == to_puny(host.as_ref())?,
        None => true,
    })
}

#[macros::ts_export]
pub fn is_same_origin(uri: &str) -> Result<bool, Error> {
    Ok(url::Url::parse(uri)?.origin().ascii_serialization() == crate::config::CONFIG.url)
}

#[macros::ts_export]
pub fn extract_host(uri: &str) -> Result<String, Error> {
    url::Url::parse(uri)?
        .host_str()
        .ok_or(Error::NoHostname)
        .and_then(|v| Ok(to_puny(v)?))
}

#[macros::ts_export]
pub fn to_puny(host: &str) -> Result<String, idna::Errors> {
    idna::domain_to_ascii(host)
}
