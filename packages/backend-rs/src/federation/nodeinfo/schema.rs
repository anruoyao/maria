//! Schema definitions of NodeInfo version 2.0 and 2.1
//!
//! ref: <https://nodeinfo.diaspora.software/schema.html>

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// NodeInfo schema version 2.1
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "version", rename = "2.1")]
pub struct Nodeinfo21 {
    pub software: Software21,
    pub protocols: Vec<Protocol>,
    pub services: Services,
    pub open_registrations: bool,
    pub usage: Usage,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// NodeInfo schema version 2.0
#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "version", rename = "2.0")]
pub struct Nodeinfo20 {
    pub software: Software20,
    pub protocols: Vec<Protocol>,
    pub services: Services,
    pub open_registrations: bool,
    pub usage: Usage,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Software metadata for version 2.1
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Software21 {
    pub name: String,
    pub version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repository: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub homepage: Option<String>,
}

/// Software metadata for version 2.0
#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Software20 {
    pub name: String,
    pub version: String,
}

/// Supported protocols
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Protocol {
    Activitypub,
    Buddycloud,
    Dfrn,
    Diaspora,
    Libertree,
    Ostatus,
    Pumpio,
    Tent,
    Xmpp,
    Zot,
}

/// Supported services
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Services {
    pub inbound: Vec<Inbound>,
    pub outbound: Vec<Outbound>,
}

/// Inbound services
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Inbound {
    #[serde(rename = "atom1.0")]
    Atom1,
    Gnusocial,
    Imap,
    Pnut,
    #[serde(rename = "pop3")]
    Pop3,
    Pumpio,
    #[serde(rename = "rss2.0")]
    Rss2,
    Twitter,
}

/// Outbound services
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Outbound {
    #[serde(rename = "atom1.0")]
    Atom1,
    Blogger,
    Buddycloud,
    Diaspora,
    Dreamwidth,
    Drupal,
    Facebook,
    Friendica,
    Gnusocial,
    Google,
    Insanejournal,
    Libertree,
    Linkedin,
    Livejournal,
    Mediagoblin,
    Myspace,
    Pinterest,
    Pnut,
    Posterous,
    Pumpio,
    Redmatrix,
    #[serde(rename = "rss2.0")]
    Rss2,
    Smtp,
    Tent,
    Tumblr,
    Twitter,
    Wordpress,
    Xmpp,
}

/// Usage statistics
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Usage {
    pub users: Users,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_posts: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_comments: Option<u32>,
}

/// User statistics
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Users {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_halfyear: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_month: Option<u32>,
}

impl From<Software21> for Software20 {
    fn from(software: Software21) -> Self {
        Self {
            name: software.name,
            version: software.version,
        }
    }
}

impl From<Nodeinfo21> for Nodeinfo20 {
    fn from(nodeinfo: Nodeinfo21) -> Self {
        Self {
            software: nodeinfo.software.into(),
            protocols: nodeinfo.protocols,
            services: nodeinfo.services,
            open_registrations: nodeinfo.open_registrations,
            usage: nodeinfo.usage,
            metadata: nodeinfo.metadata,
        }
    }
}