//! Interfaces for accessing PostgreSQL and Redis

pub use postgresql::get_conn as db_conn;

pub use redis::get_conn as redis_conn;
pub use redis::key as redis_key;
pub use redis::RedisConnError;

pub mod postgresql;
pub mod redis;
