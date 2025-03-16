//! Utilities for using Redis cache

use crate::database::{redis_conn, redis_key, RedisConnError};
use chrono::Duration;
use redis::{AsyncCommands, RedisError};
use serde::{Deserialize, Serialize};

#[cfg_attr(test, derive(Debug))]
pub enum Category {
    FetchUrl,
    Block,
    Follow,
    CatLang,
    RandomIcon,
    #[cfg(test)]
    Test,
}

#[error_doc::errors]
pub enum Error {
    #[error("failed to execute Redis command")]
    Redis(#[from] RedisError),
    #[error("bad Redis connection")]
    RedisConn(#[from] RedisConnError),
    #[error("failed to encode data for Redis")]
    Encode(#[from] rmp_serde::encode::Error),
    #[error("invalid cache TTL")]
    TTL,
}

#[inline]
fn prefix_key(key: &str) -> String {
    redis_key(format!("cache:{}", key))
}

fn categorize(category: Category, key: &str) -> String {
    let prefix = match category {
        Category::FetchUrl => "fetchUrl",
        Category::Block => "blocking",
        Category::Follow => "following",
        Category::CatLang => "catlang",
        Category::RandomIcon => "randomIcon",
        #[cfg(test)]
        Category::Test => "usedOnlyForTesting",
    };
    format!("{}:{}", prefix, key)
}

#[inline]
fn wildcard(category: Category) -> String {
    prefix_key(&categorize(category, "*"))
}

/// Sets a Redis cache.
///
/// This overwrites the exsisting cache with the same key.
///
/// # Arguments
///
/// * `key` : key (prefixed automatically)
/// * `value` : (de)serializable value
/// * `ttl` : cache lifetime
///
/// # Example
///
/// ```
/// # use backend_rs::cache;
/// use chrono::Duration;
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// let key = "apple";
/// let data = "I want to cache this string".to_owned();
///
/// // caches the data for 10 seconds
/// cache::set(key, &data, Duration::seconds(10)).await?;
///
/// // get the cache
/// let cached_data = cache::get::<String>(key).await?;
///
/// assert!(cached_data.is_some());
/// assert_eq!(data, cached_data.unwrap());
/// # Ok(())
/// # }
/// ```
pub async fn set<V: for<'a> Deserialize<'a> + Serialize>(
    key: &str,
    value: &V,
    ttl: Duration,
) -> Result<(), Error> {
    Ok(redis_conn()
        .await?
        .set_ex(
            prefix_key(key),
            rmp_serde::encode::to_vec(&value)?,
            ttl.num_seconds().try_into().map_err(|_| Error::TTL)?,
        )
        .await?)
}

/// Gets a Redis cache.
///
/// If the Redis connection is fine, this returns `Ok(data)` where `data`
/// is the cached value. Returns `Ok(None)` if there is no value corresponding to `key`.
///
/// # Argument
///
/// * `key` : key (will be prefixed automatically)
///
/// # Example
///
/// ```
/// # use backend_rs::cache;
/// use chrono::Duration;
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// let key = "banana";
/// let data = "I want to cache this string".to_owned();
///
/// // set cache
/// cache::set(key, &data, Duration::seconds(10)).await?;
///
/// // get cache
/// let cached_data = cache::get::<String>(key).await?;
/// assert!(cached_data.is_some());
/// assert_eq!(data, cached_data.unwrap());
///
/// // get nonexistent (or expired) cache
/// let no_cache = cache::get::<String>("nonexistent").await?;
/// assert!(no_cache.is_none());
/// # Ok(())
/// # }
/// ```
pub async fn get<V: for<'a> Deserialize<'a> + Serialize>(key: &str) -> Result<Option<V>, Error> {
    let serialized_value: Option<Vec<u8>> = redis_conn().await?.get(prefix_key(key)).await?;
    Ok(match serialized_value {
        Some(v) => rmp_serde::from_slice::<V>(v.as_ref()).ok(),
        None => None,
    })
}

/// Deletes a Redis cache.
///
/// If the Redis connection is fine, this returns `Ok(())`
/// regardless of whether the cache exists.
///
/// # Argument
///
/// * `key` : key (prefixed automatically)
///
/// # Example
///
/// ```
/// # use backend_rs::cache;
/// use chrono::Duration;
/// # async fn f() -> Result<(), Box<dyn std::error::Error>> {
/// let key = "chocolate";
/// let value = "I want to cache this string".to_owned();
///
/// // set cache
/// cache::set(key, &value, Duration::seconds(10)).await?;
///
/// // delete the cache
/// cache::delete("foo").await?;
/// cache::delete("nonexistent").await?; // this is okay
///
/// // the cache is gone
/// let cached_value = cache::get::<String>("foo").await?;
/// assert!(cached_value.is_none());
/// # Ok(())
/// # }
/// ```
pub async fn delete(key: &str) -> Result<(), Error> {
    Ok(redis_conn().await?.del(prefix_key(key)).await?)
}

/// Sets a Redis cache under a `category`.
///
/// The usage is the same as [set], except that you need to
/// use [get_one] and [delete_one] to get/delete the cache.
///
/// # Arguments
///
/// * `category` : one of [Category]
/// * `key` : key (prefixed automatically)
/// * `value` : (de)serializable value
/// * `ttl` : cache lifetime
pub async fn set_one<V: for<'a> Deserialize<'a> + Serialize>(
    category: Category,
    key: &str,
    value: &V,
    ttl: Duration,
) -> Result<(), Error> {
    set(&categorize(category, key), value, ttl).await
}

/// Gets a Redis cache under a `category`.
///
/// The usage is basically the same as [get].
///
/// # Arguments
///
/// * `category` : one of [Category]
/// * `key` : key (prefixed automatically)
pub async fn get_one<V: for<'a> Deserialize<'a> + Serialize>(
    category: Category,
    key: &str,
) -> Result<Option<V>, Error> {
    get(&categorize(category, key)).await
}

/// Deletes a Redis cache under a `category`.
///
/// The usage is basically the same as [delete].
///
/// # Arguments
///
/// - `category` : one of [Category]
/// - `key` : key (prefixed automatically)
pub async fn delete_one(category: Category, key: &str) -> Result<(), Error> {
    delete(&categorize(category, key)).await
}

/// Deletes all Redis caches under a `category`.
///
/// # Argument
///
/// * `category` : one of [Category]
pub async fn delete_all(category: Category) -> Result<(), Error> {
    let mut redis = redis_conn().await?;
    let keys: Vec<Vec<u8>> = redis.keys(wildcard(category)).await?;

    if !keys.is_empty() {
        redis.del(keys).await?
    }

    Ok(())
}

#[cfg(test)]
mod unit_test {
    use super::{delete_all, get, get_one, set, set_one, Category::Test};
    use crate::cache::delete_one;
    use chrono::Duration;
    use pretty_assertions::assert_eq;

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `getaddrinfo` on OS `linux`
    async fn set_get_expire() {
        #[derive(serde::Deserialize, serde::Serialize, PartialEq, Debug)]
        struct Data {
            id: u32,
            kind: String,
        }

        let key_1 = "CARGO_TEST_CACHE_KEY_1";
        let value_1: Vec<i32> = vec![1, 2, 3, 4, 5];

        let key_2 = "CARGO_TEST_CACHE_KEY_2";
        let value_2 = "Hello fedizens".to_owned();

        let key_3 = "CARGO_TEST_CACHE_KEY_3";
        let value_3 = Data {
            id: 1000000007,
            kind: "prime number".to_owned(),
        };

        set(key_1, &value_1, Duration::seconds(1)).await.unwrap();
        set(key_2, &value_2, Duration::seconds(1)).await.unwrap();
        set(key_3, &value_3, Duration::seconds(1)).await.unwrap();

        let cached_value_1: Vec<i32> = get(key_1).await.unwrap().unwrap();
        let cached_value_2: String = get(key_2).await.unwrap().unwrap();
        let cached_value_3: Data = get(key_3).await.unwrap().unwrap();

        assert_eq!(value_1, cached_value_1);
        assert_eq!(value_2, cached_value_2);
        assert_eq!(value_3, cached_value_3);

        // wait for the cache to expire
        std::thread::sleep(std::time::Duration::from_millis(1100));

        let expired_value_1: Option<Vec<i32>> = get(key_1).await.unwrap();
        let expired_value_2: Option<Vec<i32>> = get(key_2).await.unwrap();
        let expired_value_3: Option<Vec<i32>> = get(key_3).await.unwrap();

        assert!(expired_value_1.is_none());
        assert!(expired_value_2.is_none());
        assert!(expired_value_3.is_none());
    }

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `getaddrinfo` on OS `linux`
    async fn use_category() {
        let key_1 = "fire";
        let key_2 = "fish";
        let key_3 = "awawa";

        let value_1 = "hello".to_owned();
        let value_2 = 998244353u32;
        let value_3 = 'あ';

        set_one(Test, key_1, &value_1, Duration::minutes(5))
            .await
            .unwrap();
        set_one(Test, key_2, &value_2, Duration::minutes(5))
            .await
            .unwrap();
        set_one(Test, key_3, &value_3, Duration::minutes(5))
            .await
            .unwrap();

        assert_eq!(
            get_one::<String>(Test, key_1).await.unwrap().unwrap(),
            value_1
        );
        assert_eq!(get_one::<u32>(Test, key_2).await.unwrap().unwrap(), value_2);
        assert_eq!(
            get_one::<char>(Test, key_3).await.unwrap().unwrap(),
            value_3
        );

        delete_one(Test, key_1).await.unwrap();

        assert!(get_one::<String>(Test, key_1).await.unwrap().is_none());
        assert!(get_one::<u32>(Test, key_2).await.unwrap().is_some());
        assert!(get_one::<char>(Test, key_3).await.unwrap().is_some());

        delete_all(Test).await.unwrap();

        assert!(get_one::<String>(Test, key_1).await.unwrap().is_none());
        assert!(get_one::<u32>(Test, key_2).await.unwrap().is_none());
        assert!(get_one::<char>(Test, key_3).await.unwrap().is_none());
    }
}
