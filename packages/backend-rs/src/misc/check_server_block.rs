//! This module is used in the TypeScript backend only.
// We may want to (re)implement these functions in the `federation` module
// in a Rusty way (e.g., traits of server type) if needed.

/// Checks if a server is blocked.
///
/// # Argument
/// `host` - punycoded instance host
///
/// # Example
/// ```ignore
/// # use backend_rs::misc::check_server_block::is_blocked_server;
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// assert_eq!(true, is_blocked_server("blocked.com").await?);
/// assert_eq!(false, is_blocked_server("not-blocked.com").await?);
/// assert_eq!(true, is_blocked_server("subdomain.of.blocked.com").await?);
/// assert_eq!(true, is_blocked_server("xn--l8jegik.blocked.com").await?);
/// # Ok(())
/// # }
/// ```
#[macros::ts_export]
pub async fn is_blocked_server(host: &str) -> Result<bool, sea_orm::DbErr> {
    Ok(crate::config::local_server_info()
        .await?
        .blocked_hosts
        .iter()
        .any(|blocked_host| {
            host == blocked_host || host.ends_with(format!(".{}", blocked_host).as_str())
        }))
}

/// Checks if a server is silenced.
///
/// # Argument
/// `host` - punycoded instance host
///
/// # Example
/// ```ignore
/// # use backend_rs::misc::check_server_block::is_silenced_server;
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// assert_eq!(true, is_silenced_server("silenced.com").await?);
/// assert_eq!(false, is_silenced_server("not-silenced.com").await?);
/// assert_eq!(true, is_silenced_server("subdomain.of.silenced.com").await?);
/// assert_eq!(true, is_silenced_server("xn--l8jegik.silenced.com").await?);
/// # Ok(())
/// # }
/// ```
#[macros::ts_export]
pub async fn is_silenced_server(host: &str) -> Result<bool, sea_orm::DbErr> {
    Ok(crate::config::local_server_info()
        .await?
        .silenced_hosts
        .iter()
        .any(|silenced_host| {
            host == silenced_host || host.ends_with(format!(".{}", silenced_host).as_str())
        }))
}

/// Checks if a server is allowlisted.
/// Returns `Ok(true)` if private mode is disabled.
///
/// # Argument
/// `host` - punycoded instance host
///
/// # Example
/// ```ignore
/// # use backend_rs::misc::check_server_block::is_allowed_server;
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// assert_eq!(true, is_allowed_server("allowed.com").await?);
/// assert_eq!(false, is_allowed_server("not-allowed.com").await?);
/// assert_eq!(false, is_allowed_server("subdomain.of.allowed.com").await?);
/// assert_eq!(false, is_allowed_server("xn--l8jegik.allowed.com").await?);
/// # Ok(())
/// # }
/// ```
#[macros::ts_export]
pub async fn is_allowed_server(host: &str) -> Result<bool, sea_orm::DbErr> {
    let meta = crate::config::local_server_info().await?;

    if !meta.private_mode.unwrap_or(false) {
        return Ok(true);
    }
    if let Some(allowed_hosts) = meta.allowed_hosts {
        return Ok(allowed_hosts.contains(&host.to_owned()));
    }
    Ok(false)
}
