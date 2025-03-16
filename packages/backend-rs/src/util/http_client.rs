//! Shared [isahc] HTTP client

use crate::config::CONFIG;
use isahc::{config::*, HttpClient};
use once_cell::sync::OnceCell;
use std::time::Duration;

#[error_doc::errors]
pub enum Error {
    #[error("HTTP request failed")]
    Isahc(#[from] isahc::Error),
    #[error("invalid URL")]
    UrlParse(#[from] isahc::http::uri::InvalidUri),
}

static CLIENT: OnceCell<HttpClient> = OnceCell::new();

/// Returns an [HttpClient] that takes the proxy configuration into account.
///
/// # Example
/// ```no_run
/// # use backend_rs::util::http_client::client;
/// use isahc::AsyncReadResponseExt;
///
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// let mut response = client()?.get_async("https://example.com/").await?;
///
/// if response.status().is_success() {
///     println!("{}", response.text().await?);
/// }
/// # Ok(())
/// # }
/// ```
pub fn client() -> Result<HttpClient, Error> {
    CLIENT
        .get_or_try_init(|| {
            let mut builder = HttpClient::builder()
                .timeout(Duration::from_secs(10))
                .default_header("user-agent", &CONFIG.user_agent)
                .dns_cache(DnsCache::Timeout(Duration::from_secs(60 * 60)));

            if let Some(proxy_url) = &CONFIG.proxy {
                builder = builder.proxy(Some(proxy_url.parse()?));
                if let Some(proxy_bypass_hosts) = &CONFIG.proxy_bypass_hosts {
                    builder = builder.proxy_blacklist(proxy_bypass_hosts);
                }
            }

            Ok(builder.build()?)
        })
        .cloned()
}
