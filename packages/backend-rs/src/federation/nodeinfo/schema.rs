//! Schema definitions of NodeInfo version 2.0 and 2.1
//!
//! ref: <https://nodeinfo.diaspora.software/schema.html>

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// NodeInfo schema version 2.1. <https://nodeinfo.diaspora.software/docson/index.html#/ns/schema/2.1>
#[cfg_attr(test, derive(Debug, PartialEq, Deserialize))]
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "version", rename = "2.1")]
pub struct Nodeinfo21 {
    /// Metadata about server software in use.
    pub software: Software21,
    /// The protocols supported on this server.
    pub protocols: Vec<Protocol>,
    /// The third party sites this server can connect to via their application API.
    pub services: Services,
    /// Whether this server allows open self-registration.
    pub open_registrations: bool,
    /// Usage statistics for this server.
    pub usage: Usage,
    /// Free form key value pairs for software specific values. Clients should not rely on any specific key present.
    pub metadata: HashMap<String, serde_json::Value>,
}

/// NodeInfo schema version 2.0. <https://nodeinfo.diaspora.software/docson/index.html#/ns/schema/2.0>
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, js_name = "Nodeinfo")]
#[serde(tag = "version", rename = "2.0")]
pub struct Nodeinfo20 {
    /// Metadata about server software in use.
    pub software: Software20,
    /// The protocols supported on this server.
    pub protocols: Vec<Protocol>,
    /// The third party sites this server can connect to via their application API.
    pub services: Services,
    /// Whether this server allows open self-registration.
    pub open_registrations: bool,
    /// Usage statistics for this server.
    pub usage: Usage,
    /// Free form key value pairs for software specific values. Clients should not rely on any specific key present.
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Metadata about server software in use (version 2.1).
#[cfg_attr(test, derive(Debug, PartialEq, Deserialize))]
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Software21 {
    /// The canonical name of this server software.
    pub name: String,
    /// The version of this server software.
    pub version: String,
    /// The url of the source code repository of this server software.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repository: Option<String>,
    /// The url of the homepage of this server software.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub homepage: Option<String>,
}

/// Metadata about server software in use (version 2.0).
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object)]
pub struct Software20 {
    /// The canonical name of this server software.
    pub name: String,
    /// The version of this server software.
    pub version: String,
}

#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[macros::export]
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

/// The third party sites this server can connect to via their application API.
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object)]
pub struct Services {
    /// The third party sites this server can retrieve messages from for combined display with regular traffic.
    pub inbound: Vec<Inbound>,
    /// The third party sites this server can publish messages to on the behalf of a user.
    pub outbound: Vec<Outbound>,
}

/// The third party sites this server can retrieve messages from for combined display with regular traffic.
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[macros::export]
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

/// The third party sites this server can publish messages to on the behalf of a user.
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[macros::export]
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

/// Usage statistics for this server.
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object)]
pub struct Usage {
    pub users: Users,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_posts: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_comments: Option<u32>,
}

/// statistics about the users of this server.
#[cfg_attr(test, derive(Debug, PartialEq))]
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object)]
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

#[cfg(test)]
mod unit_test {
    use super::{Nodeinfo20, Nodeinfo21};
    use pretty_assertions::assert_eq;

    #[test]
    fn parse_nodeinfo_2_0() {
        let json_str_1 = r#"{"version":"2.0","software":{"name":"mastodon","version":"4.3.0-nightly.2024-04-30"},"protocols":["activitypub"],"services":{"outbound":[],"inbound":[]},"usage":{"users":{"total":1935016,"activeMonth":238223,"activeHalfyear":618795},"localPosts":90175135},"openRegistrations":true,"metadata":{"nodeName":"Mastodon","nodeDescription":"The original server operated by the Mastodon gGmbH non-profit"}}"#;
        let parsed_1: Nodeinfo20 = serde_json::from_str(json_str_1).unwrap();
        let serialized_1 = serde_json::to_string(&parsed_1).unwrap();
        let reparsed_1: Nodeinfo20 = serde_json::from_str(&serialized_1).unwrap();

        assert_eq!(parsed_1, reparsed_1);
        assert_eq!(parsed_1.software.name, "mastodon");
        assert_eq!(parsed_1.software.version, "4.3.0-nightly.2024-04-30");

        let json_str_2 = r#"{"version":"2.0","software":{"name":"peertube","version":"5.0.0"},"protocols":["activitypub"],"services":{"inbound":[],"outbound":["atom1.0","rss2.0"]},"openRegistrations":false,"usage":{"users":{"total":5,"activeMonth":0,"activeHalfyear":2},"localPosts":1018,"localComments":1},"metadata":{"taxonomy":{"postsName":"Videos"},"nodeName":"Blender Video","nodeDescription":"Blender Foundation PeerTube instance.","nodeConfig":{"search":{"remoteUri":{"users":true,"anonymous":false}},"plugin":{"registered":[]},"theme":{"registered":[],"default":"default"},"email":{"enabled":false},"contactForm":{"enabled":true},"transcoding":{"hls":{"enabled":true},"webtorrent":{"enabled":true},"enabledResolutions":[1080]},"live":{"enabled":false,"transcoding":{"enabled":true,"enabledResolutions":[]}},"import":{"videos":{"http":{"enabled":true},"torrent":{"enabled":false}}},"autoBlacklist":{"videos":{"ofUsers":{"enabled":false}}},"avatar":{"file":{"size":{"max":4194304},"extensions":[".png",".jpeg",".jpg",".gif",".webp"]}},"video":{"image":{"extensions":[".png",".jpg",".jpeg",".webp"],"size":{"max":4194304}},"file":{"extensions":[".webm",".ogv",".ogg",".mp4",".mkv",".mov",".qt",".mqv",".m4v",".flv",".f4v",".wmv",".avi",".3gp",".3gpp",".3g2",".3gpp2",".nut",".mts",".m2ts",".mpv",".m2v",".m1v",".mpg",".mpe",".mpeg",".vob",".mxf",".mp3",".wma",".wav",".flac",".aac",".m4a",".ac3"]}},"videoCaption":{"file":{"size":{"max":20971520},"extensions":[".vtt",".srt"]}},"user":{"videoQuota":5368709120,"videoQuotaDaily":-1},"trending":{"videos":{"intervalDays":7}},"tracker":{"enabled":true}}}}"#;
        let parsed_2: Nodeinfo20 = serde_json::from_str(json_str_2).unwrap();
        let serialized_2 = serde_json::to_string(&parsed_2).unwrap();
        let reparsed_2: Nodeinfo20 = serde_json::from_str(&serialized_2).unwrap();

        assert_eq!(parsed_2, reparsed_2);
        assert_eq!(parsed_2.software.name, "peertube");
        assert_eq!(parsed_2.software.version, "5.0.0");

        let json_str_3 = r#"{"metadata":{"nodeName":"pixelfed","software":{"homepage":"https://pixelfed.org","repo":"https://github.com/pixelfed/pixelfed"},"config":{"features":{"timelines":{"local":true,"network":true},"mobile_apis":true,"stories":true,"video":true,"import":{"instagram":false,"mastodon":false,"pixelfed":false},"label":{"covid":{"enabled":false,"org":"visit the WHO website","url":"https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public"}},"hls":{"enabled":false}}}},"protocols":["activitypub"],"services":{"inbound":[],"outbound":[]},"software":{"name":"pixelfed","version":"0.12.0"},"usage":{"localPosts":24059868,"localComments":0,"users":{"total":112832,"activeHalfyear":24366,"activeMonth":8921}},"version":"2.0","openRegistrations":true}"#;
        let parsed_3: Nodeinfo20 = serde_json::from_str(json_str_3).unwrap();
        let serialized_3 = serde_json::to_string(&parsed_3).unwrap();
        let reparsed_3: Nodeinfo20 = serde_json::from_str(&serialized_3).unwrap();

        assert_eq!(parsed_3, reparsed_3);
        assert_eq!(parsed_3.software.name, "pixelfed");
        assert_eq!(parsed_3.software.version, "0.12.0");
    }

    #[test]
    fn parse_nodeinfo_2_1() {
        let json_str = r##"{"version":"2.1","software":{"name":"maria","version":"1.0.0","repository":"https://github.com/buka5587/maria.git","homepage":"https://github.com/buka5587/maria.git"},"protocols":["activitypub"],"services":{"inbound":[],"outbound":["atom1.0","rss2.0"]},"openRegistrations":true,"usage":{"users":{"total":294,"activeHalfyear":292,"activeMonth":139},"localPosts":22616,"localComments":0},"metadata":{"nodeName":"Maria Social","nodeDescription":"🌎 Home of Maria, a new platform for fedi communities","maintainer":{"name":"admin","email":"redacted@example.com"},"langs":[],"tosUrl":"https://example.com/redacted","repositoryUrl":"https://github.com/buka5587/maria.git","feedbackUrl":"https://github.com/buka5587/maria.git/issues","disableRegistration":false,"disableLocalTimeline":false,"disableRecommendedTimeline":true,"disableGlobalTimeline":false,"emailRequiredForSignup":true,"postEditing":true,"postImports":false,"enableHcaptcha":true,"enableRecaptcha":false,"maxNoteTextLength":8000,"maxCaptionTextLength":1500,"enableGithubIntegration":false,"enableDiscordIntegration":false,"enableEmail":true,"themeColor":"#31748f"}}"##;
        let parsed: Nodeinfo21 = serde_json::from_str(json_str).unwrap();
        let serialized = serde_json::to_string(&parsed).unwrap();
        let reparsed: Nodeinfo21 = serde_json::from_str(&serialized).unwrap();
    
        assert_eq!(parsed, reparsed);
        assert_eq!(parsed.software.name, "maria");
        assert_eq!(parsed.software.version, "1.0.0");
    }
}