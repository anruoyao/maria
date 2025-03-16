//! Fetch latest Firefish version from the Firefish repository

use crate::{cache::Cache, misc::is_safe_url::is_safe_url, util::http_client};
use chrono::Duration;
use futures_util::AsyncReadExt;
use isahc::AsyncReadResponseExt;
use serde::Deserialize;

#[error_doc::errors]
pub enum Error {
    #[error("HTTP request failed")]
    Isahc(#[from] isahc::Error),
    #[error("failed to acquire an HTTP client")]
    HttpClient(#[from] http_client::Error),
    #[doc = "codeberg.org returned bad HTTP status"]
    #[error("codeberg.org returned bad HTTP status ({0})")]
    BadStatus(String),
    #[error("failed to parse the HTTP response")]
    Io(#[from] std::io::Error),
    #[error("failed to parse the HTTP response as JSON")]
    Json(#[from] serde_json::Error),
    #[error("access to this URL is not allowed")]
    UnsafeUrl,
}

#[derive(Clone, Deserialize)]
struct PackageJson {
    version: String,
}

const UPSTREAM_PACKAGE_JSON_URL: &str =
    "https://codeberg.org/firefish/firefish/raw/branch/main/package.json";

static PACKAGE_JSON_CACHE: Cache<PackageJson> = Cache::new_with_ttl(Duration::hours(3));

async fn get_package_json() -> Result<PackageJson, Error> {
    if !is_safe_url(UPSTREAM_PACKAGE_JSON_URL) {
        return Err(Error::UnsafeUrl);
    }

    // Read up to 1 MiB of the response body
    let mut response = http_client::client()?
        .get_async(UPSTREAM_PACKAGE_JSON_URL)
        .await?
        .map(|body| body.take(1024 * 1024));

    if !response.status().is_success() {
        tracing::info!("status: {}", response.status());
        return Err(Error::BadStatus(response.status().to_string()));
    }

    let package_json: PackageJson = serde_json::from_str(&response.text().await?)?;

    Ok(package_json)
}

/// Returns the latest Firefish version.
#[macros::export]
pub async fn latest_version() -> Result<String, Error> {
    if let Some(package_json) = PACKAGE_JSON_CACHE.get() {
        tracing::trace!("use cached value: {}", package_json.version);
        Ok(package_json.version)
    } else {
        tracing::trace!("cache is expired, fetching the latest version");
        let package_json = get_package_json().await?;
        tracing::trace!("fetched value: {}", package_json.version);

        PACKAGE_JSON_CACHE.set(package_json.clone());
        Ok(package_json.version)
    }
}

#[cfg(test)]
mod unit_test {
    use super::latest_version;
    use pretty_assertions::assert_eq;

    fn validate_version(version: &str) {
        // version: YYYYMMDD or YYYYMMDD-X
        assert!(version.len() >= 8);
        assert!(version[..8].chars().all(|c| c.is_ascii_digit()));

        // YYYY
        assert!(&version[..4] >= "2024");

        // MM
        assert!(&version[4..6] >= "01");
        assert!(&version[4..6] <= "12");

        // DD
        assert!(&version[6..8] >= "01");
        assert!(&version[6..8] <= "31");

        // -X
        if version.len() > 8 {
            assert!(version.chars().nth(8).unwrap() == '-');
            assert!(version[9..].chars().all(|c| c.is_ascii_digit()));
        }
    }

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `getaddrinfo` on OS `linux`
    async fn get_latest_version() {
        // fetch from codeberg.org
        let version_1 = latest_version().await.unwrap();
        validate_version(&version_1);

        // use cache
        let version_2 = latest_version().await.unwrap();
        validate_version(&version_2);

        assert_eq!(version_1, version_2);
    }
}
