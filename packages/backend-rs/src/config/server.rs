//! Server configuration

use once_cell::sync::Lazy;
use serde::Deserialize;
use std::{env, fs};

pub const VERSION: &str = macros::read_version_from_package_json!();

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
struct ServerConfig {
    pub url: String,
    pub port: u16,
    /// the host address to bind to
    pub bind: Option<String>,
    pub disable_hsts: Option<bool>,

    /// PostgreSQL configurations
    pub db: DbConfig,
    /// Redis configurations
    pub redis: RedisConfig,
    /// secondary Redis server configurations
    pub cache_server: Option<RedisConfig>,

    /// proxy host used for HTTP requests
    pub proxy: Option<String>,
    /// proxy host used for SMTP requests
    pub proxy_smtp: Option<String>,
    /// hosts to bypass the proxy
    pub proxy_bypass_hosts: Option<Vec<String>>,

    // TODO: i64 -> u64 (NapiValue is not implemented for u64)
    /// maximum file size that can be uploaded to the drive (in bytes)
    pub max_file_size: Option<i64>,
    pub access_log: Option<String>,
    pub cluster_limits: Option<WorkerConfigInternal>,
    pub cuid: Option<IdConfig>,
    pub outgoing_address: Option<String>,

    pub deliver_job_concurrency: Option<u32>,
    pub inbox_job_concurrency: Option<u32>,
    pub deliver_job_per_sec: Option<u32>,
    pub inbox_job_per_sec: Option<u32>,
    pub deliver_job_max_attempts: Option<u32>,
    pub inbox_job_max_attempts: Option<u32>,

    /// deprecated in favor of `max_log_level`
    pub log_level: Option<Vec<String>>,

    /// verbosity of the server log. `error`, `warn`, `info`, `debug`, or `trace`
    pub max_log_level: Option<String>,

    pub syslog: Option<SysLogConfig>,

    pub proxy_remote_files: Option<bool>,
    pub media_proxy: Option<String>,
    pub summaly_proxy_url: Option<String>,

    pub reserved_usernames: Option<Vec<String>>,

    pub max_user_signups: Option<u32>,
    pub is_managed_hosting: Option<bool>,
    pub max_note_length: Option<u32>,
    pub max_caption_length: Option<u32>,

    pub deepl: Option<DeepLConfig>,
    pub libre_translate: Option<LibreTranslateConfig>,
    pub email: Option<EmailConfig>,
    pub object_storage: Option<ObjectStorageConfig>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct DbConfig {
    pub host: String,
    pub port: u16,
    pub db: String,
    pub user: String,
    pub pass: String,
    pub disable_cache: Option<bool>,
    pub extra: Option<serde_json::Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct RedisConfig {
    pub host: String,
    pub port: u16,
    pub family: Option<u8>,
    pub user: Option<String>,
    pub pass: Option<String>,
    pub tls: Option<TlsConfig>,
    #[serde(default)]
    pub db: u32,
    pub prefix: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct TlsConfig {
    pub host: String,
    pub reject_unauthorized: bool,
}

#[macros::export(object, use_nullable = false)]
pub struct WorkerConfig {
    pub web: u32,
    pub queue: u32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct WorkerConfigInternal {
    pub web: Option<u32>,
    pub queue: Option<u32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct IdConfig {
    pub length: Option<u8>,
    pub fingerprint: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct SysLogConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct DeepLConfig {
    pub managed: Option<bool>,
    pub auth_key: Option<String>,
    pub is_pro: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct LibreTranslateConfig {
    pub managed: Option<bool>,
    pub api_url: Option<String>,
    pub api_key: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct EmailConfig {
    pub managed: Option<bool>,
    pub address: Option<String>,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub user: Option<String>,
    pub pass: Option<String>,
    pub use_implicit_ssl_tls: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[macros::export(object, use_nullable = false)]
pub struct ObjectStorageConfig {
    pub managed: Option<bool>,
    pub base_url: Option<String>,
    pub bucket: Option<String>,
    pub prefix: Option<String>,
    pub endpoint: Option<String>,
    pub region: Option<String>,
    pub access_key: Option<String>,
    pub secret_key: Option<String>,
    pub use_ssl: Option<bool>,
    pub connnect_over_proxy: Option<bool>,
    pub set_public_read_on_upload: Option<bool>,
    pub s3_force_path_style: Option<bool>,
}

#[macros::export(object, use_nullable = false)]
pub struct Config {
    // ServerConfig (from default.yml)
    pub url: String,
    pub port: u16,
    pub bind: Option<String>,
    pub disable_hsts: Option<bool>,
    pub db: DbConfig,
    pub redis: RedisConfig,
    pub cache_server: Option<RedisConfig>,
    pub proxy: Option<String>,
    pub proxy_smtp: Option<String>,
    pub proxy_bypass_hosts: Option<Vec<String>>,
    pub max_file_size: i64,
    pub access_log: Option<String>,
    pub cluster_limits: WorkerConfig,
    pub cuid: Option<IdConfig>,
    pub outgoing_address: Option<String>,
    pub deliver_job_concurrency: Option<u32>,
    pub inbox_job_concurrency: Option<u32>,
    pub deliver_job_per_sec: Option<u32>,
    pub inbox_job_per_sec: Option<u32>,
    pub deliver_job_max_attempts: Option<u32>,
    pub inbox_job_max_attempts: Option<u32>,

    /// deprecated
    pub log_level: Option<Vec<String>>,

    pub max_log_level: Option<String>,
    pub syslog: Option<SysLogConfig>,
    pub proxy_remote_files: Option<bool>,
    pub media_proxy: Option<String>,
    pub summaly_proxy_url: Option<String>,
    pub reserved_usernames: Option<Vec<String>>,
    pub max_user_signups: Option<u32>,
    pub is_managed_hosting: Option<bool>,
    pub max_note_length: u32,
    pub max_caption_length: u32,
    pub deepl: Option<DeepLConfig>,
    pub libre_translate: Option<LibreTranslateConfig>,
    pub email: Option<EmailConfig>,
    pub object_storage: Option<ObjectStorageConfig>,

    // Mixin
    pub version: String,
    pub host: String,
    pub hostname: String,
    pub redis_key_prefix: String,
    pub scheme: String,
    pub ws_scheme: String,
    pub api_url: String,
    pub ws_url: String,
    pub auth_url: String,
    pub drive_url: String,
    pub user_agent: String,
}

fn read_config_file() -> ServerConfig {
    let cwd = env::current_dir().unwrap();
    let yml = fs::File::open(cwd.join("../../.config/default.yml"))
        .expect("Failed to open '.config/default.yml'");
    let mut data: ServerConfig =
        serde_yaml::from_reader(yml).expect("Failed to parse .config/default.yml");

    data.url = url::Url::parse(&data.url)
        .expect("Config url is invalid")
        .origin()
        .ascii_serialization();

    if data.bind.is_none() {
        data.bind = std::env::var("BIND").ok()
    }

    data
}

#[macros::export]
pub fn load_config() -> Config {
    let server_config = read_config_file();
    let version = VERSION.to_owned();
    let url = url::Url::parse(&server_config.url).expect("Config url is invalid");
    let hostname = url
        .host_str()
        .expect("Hostname is missing in the config url")
        .to_owned();
    let host = match url.port() {
        Some(port) => format!("{}:{}", hostname, port),
        None => hostname.clone(),
    };
    let scheme = url.scheme().to_owned();
    let ws_scheme = match scheme.as_str() {
        "http" => "ws",
        _ => "wss",
    };

    let cluster_limits = match server_config.cluster_limits {
        Some(cl) => WorkerConfig {
            web: cl.web.unwrap_or(1),
            queue: cl.queue.unwrap_or(1),
        },
        None => WorkerConfig { web: 1, queue: 1 },
    };

    let redis_key_prefix = if let Some(cache_server) = &server_config.cache_server {
        cache_server.prefix.clone()
    } else {
        server_config.redis.prefix.clone()
    }
    .unwrap_or_else(|| hostname.clone());

    Config {
        url: server_config.url,
        port: server_config.port,
        bind: server_config.bind,
        disable_hsts: server_config.disable_hsts,
        db: server_config.db,
        redis: server_config.redis,
        cache_server: server_config.cache_server,
        proxy: server_config.proxy,
        proxy_smtp: server_config.proxy_smtp,
        proxy_bypass_hosts: server_config.proxy_bypass_hosts,
        max_file_size: server_config.max_file_size.unwrap_or(262144000),
        access_log: server_config.access_log,
        cluster_limits,
        cuid: server_config.cuid,
        outgoing_address: server_config.outgoing_address,
        deliver_job_concurrency: server_config.deliver_job_concurrency,
        inbox_job_concurrency: server_config.inbox_job_concurrency,
        deliver_job_per_sec: server_config.deliver_job_per_sec,
        inbox_job_per_sec: server_config.inbox_job_per_sec,
        deliver_job_max_attempts: server_config.deliver_job_max_attempts,
        inbox_job_max_attempts: server_config.inbox_job_max_attempts,
        log_level: server_config.log_level,
        max_log_level: server_config.max_log_level,
        syslog: server_config.syslog,
        proxy_remote_files: server_config.proxy_remote_files,
        media_proxy: server_config.media_proxy,
        summaly_proxy_url: server_config.summaly_proxy_url,
        reserved_usernames: server_config.reserved_usernames,
        max_user_signups: server_config.max_user_signups,
        is_managed_hosting: server_config.is_managed_hosting,
        max_note_length: server_config.max_note_length.unwrap_or(3000),
        max_caption_length: server_config.max_caption_length.unwrap_or(1500),
        deepl: server_config.deepl,
        libre_translate: server_config.libre_translate,
        email: server_config.email,
        object_storage: server_config.object_storage,

        ws_url: format!("{}://{}", ws_scheme, host),
        api_url: format!("{}://{}/api", scheme, host),
        auth_url: format!("{}://{}/auth", scheme, host),
        drive_url: format!("{}://{}/files", scheme, host),
        user_agent: format!("Firefish/{} ({})", version, url),
        version,
        host,
        hostname,
        redis_key_prefix,
        scheme,
        ws_scheme: ws_scheme.to_owned(),
    }
}

pub static CONFIG: Lazy<Config> = Lazy::new(load_config);
