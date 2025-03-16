//! Cache handlers

pub mod bare;
pub mod redis;

pub use bare::Cache;
pub use redis::{delete, delete_all, delete_one, get, get_one, set, set_one, Category};
