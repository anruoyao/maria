//! NodeInfo fetcher
//!
//! ref: <https://nodeinfo.diaspora.software/protocol.html>

use crate::{federation::nodeinfo::schema::*, misc::is_safe_url::is_safe_url, util::http_client};
use futures_util::io::AsyncReadExt;
use isahc::AsyncReadResponseExt;
use serde::Deserialize;

/// Errors that can occur while fetching NodeInfo from a remote server
#[error_doc::errors]
pub enum Error {
    #[error("failed to acquire an HTTP client")]
    HttpClient(#[from] http_client::Error),
    #[error("HTTP request failed")]
    Http(#[from] isahc::Error),
    #[doc = "Bad HTTP status"]
    #[error("bad HTTP status ({0})")]
    BadStatus(String),
    #[error("failed to parse HTTP response body as text")]
    Response(#[from] std::io::Error),
    #[error("failed to parse HTTP response body as json")]
    Json(#[from] serde_json::Error),
    #[error("nodeinfo is missing")]
    MissingNodeinfo,
    #[error("access to this URL is not allowed")]
    UnsafeUrl,
}

/// Represents the schema of `/.well-known/nodeinfo`.
#[derive(Deserialize)]
pub struct NodeinfoLinks {
    links: Vec<NodeinfoLink>,
}

/// Represents one entry of `/.well-known/nodeinfo`.
#[derive(Deserialize)]
pub struct NodeinfoLink {
    rel: String,
    href: String,
}

/// Fetches `/.well-known/nodeinfo` and parses the result.
async fn fetch_nodeinfo_links(host: &str) -> Result<NodeinfoLinks, Error> {
    let client = http_client::client()?;
    let wellknown_url = format!("https://{}/.well-known/nodeinfo", host);

    if !is_safe_url(&wellknown_url) {
        return Err(Error::UnsafeUrl);
    }

    let wellknown_response = client.get_async(&wellknown_url).await?;

    if !wellknown_response.status().is_success() {
        return Err(Error::BadStatus(format!(
            "{} returned {}",
            wellknown_url,
            wellknown_response.status()
        )));
    }

    // Read up to 1 MiB of the response body
    let text = wellknown_response
        .map(|body| body.take(1024 * 1024))
        .text()
        .await?;
    Ok(serde_json::from_str(&text)?)
}

/// Check if any of the following relations is present in the given [NodeinfoLinks].
/// * <http://nodeinfo.diaspora.software/ns/schema/2.0>
/// * <http://nodeinfo.diaspora.software/ns/schema/2.1>
fn check_nodeinfo_link(links: NodeinfoLinks) -> Result<String, Error> {
    for link in links.links {
        if link.rel == "http://nodeinfo.diaspora.software/ns/schema/2.1"
            || link.rel == "http://nodeinfo.diaspora.software/ns/schema/2.0"
        {
            return Ok(link.href);
        }
    }

    Err(Error::MissingNodeinfo)
}

/// Fetches the nodeinfo from the given URL and parses the result.
async fn fetch_nodeinfo_impl(nodeinfo_link: &str) -> Result<Nodeinfo20, Error> {
    let client = http_client::client()?;
    let mut response = client.get_async(nodeinfo_link).await?;

    if !response.status().is_success() {
        tracing::debug!("{:#?}", response.body());
        return Err(Error::BadStatus(format!(
            "{} returned {}",
            nodeinfo_link,
            response.status()
        )));
    }

    Ok(serde_json::from_str(&response.text().await?)?)
}

// for napi export
type Nodeinfo = Nodeinfo20;

/// Fetches and returns the NodeInfo (version 2.0) of a remote server.
#[macros::export]
pub async fn fetch_nodeinfo(host: &str) -> Result<Nodeinfo, Error> {
    tracing::info!("fetching from {}", host);
    let links = fetch_nodeinfo_links(host).await?;
    let nodeinfo_link = check_nodeinfo_link(links)?;
    fetch_nodeinfo_impl(&nodeinfo_link).await
}

#[cfg(test)]
mod unit_test {
    use super::{NodeinfoLink, NodeinfoLinks};
    use pretty_assertions::assert_eq;

    #[test]
    fn check_nodeinfo_link() {
        let links_1 = NodeinfoLinks {
            links: vec![
                NodeinfoLink {
                    rel: "https://example.com/incorrect/schema/2.0".to_owned(),
                    href: "https://example.com/dummy".to_owned(),
                },
                NodeinfoLink {
                    rel: "http://nodeinfo.diaspora.software/ns/schema/2.0".to_owned(),
                    href: "https://example.com/real".to_owned(),
                },
            ],
        };
        assert_eq!(
            super::check_nodeinfo_link(links_1).unwrap(),
            "https://example.com/real"
        );

        let links_2 = NodeinfoLinks {
            links: vec![
                NodeinfoLink {
                    rel: "https://example.com/incorrect/schema/2.0".to_owned(),
                    href: "https://example.com/dummy".to_owned(),
                },
                NodeinfoLink {
                    rel: "http://nodeinfo.diaspora.software/ns/schema/2.1".to_owned(),
                    href: "https://example.com/real".to_owned(),
                },
            ],
        };
        assert_eq!(
            super::check_nodeinfo_link(links_2).unwrap(),
            "https://example.com/real"
        );

        let links_3 = NodeinfoLinks {
            links: vec![
                NodeinfoLink {
                    rel: "https://example.com/incorrect/schema/2.0".to_owned(),
                    href: "https://example.com/dummy/2.0".to_owned(),
                },
                NodeinfoLink {
                    rel: "https://example.com/incorrect/schema/2.1".to_owned(),
                    href: "https://example.com/dummy/2.1".to_owned(),
                },
            ],
        };
        super::check_nodeinfo_link(links_3).expect_err("No nodeinfo");
    }
}
