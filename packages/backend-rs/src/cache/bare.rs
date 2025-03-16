//! In-memory cache handler

use chrono::{DateTime, Duration, Utc};
use std::sync::Mutex;

/// Cache stored directly in memory
pub struct Cache<T: Clone> {
    cache: Mutex<TimedData<T>>,
    valid_duration: Option<Duration>,
}

struct TimedData<T: Clone> {
    value: Option<T>,
    last_updated: DateTime<Utc>,
}

impl<T: Clone> Default for Cache<T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<T: Clone> Cache<T> {
    /// Creates a new cache object with no auto invalidation.
    pub const fn new() -> Self {
        Self {
            cache: Mutex::new(TimedData {
                value: None,
                last_updated: DateTime::UNIX_EPOCH,
            }),
            valid_duration: None,
        }
    }

    /// Creates a new cache object whose content is invalidated
    /// in the specified duration.
    ///
    /// # Example
    /// ```
    /// # use backend_rs::cache::Cache;
    /// use chrono::Duration;
    /// static CACHE: Cache<i32> = Cache::new_with_ttl(Duration::seconds(1));
    ///
    /// fn use_cache() {
    ///     let data = 998244353;
    ///
    ///     // Set cache
    ///     CACHE.set(data);
    ///
    ///     // wait for the cache to expire
    ///     std::thread::sleep(std::time::Duration::from_millis(1100));
    ///
    ///     // Get cache
    ///     let cache = CACHE.get();
    ///
    ///     assert!(cache.is_none());
    /// }
    /// ```
    pub const fn new_with_ttl(ttl: Duration) -> Self {
        Self {
            cache: Mutex::new(TimedData {
                value: None,
                last_updated: DateTime::UNIX_EPOCH,
            }),
            valid_duration: Some(ttl),
        }
    }

    /// Sets a cache. This function overwrites the existing data.
    ///
    /// # Example
    /// ```
    /// # use backend_rs::cache::Cache;
    /// static CACHE: Cache<i32> = Cache::new();
    ///
    /// fn use_cache() {
    ///     let data = 998244353;
    ///
    ///     // Set cache
    ///     CACHE.set(data);
    ///
    ///     // Get cache
    ///     let cache = CACHE.get();
    ///
    ///     if let Some(cached_data) = cache {
    ///         println!("found a cached value");
    ///         assert_eq!(data, cached_data)
    ///     } else {
    ///         println!("cache not found");
    ///     }
    /// }
    /// ```
    pub fn set(&self, value: T) {
        if self.valid_duration.is_none() {
            let mut cache = match self.cache.lock() {
                Ok(cache) => cache,
                Err(err) => err.into_inner(),
            };
            cache.value = Some(value);
        } else {
            let mut cache = match self.cache.lock() {
                Ok(cache) => cache,
                Err(err) => err.into_inner(),
            };

            *cache = TimedData {
                value: Some(value),
                last_updated: Utc::now(),
            };
        }
    }

    /// Gets a cache. Returns [`None`] is the cache is not set or expired.
    pub fn get(&self) -> Option<T> {
        let data = self.cache.lock().ok()?;

        if let Some(ttl) = self.valid_duration {
            if data.last_updated + ttl < Utc::now() {
                return None;
            }
        }
        data.value.to_owned()
    }
}

#[cfg(test)]
mod unit_test {
    use super::Cache;
    use chrono::Duration;
    use pretty_assertions::assert_eq;

    #[derive(Clone, Debug, PartialEq)]
    struct Data {
        id: u64,
        name: String,
    }

    #[test]
    fn set_and_get() {
        static CACHE: Cache<Data> = Cache::new();
        static CACHE_WITH_TTL: Cache<Data> = Cache::new_with_ttl(Duration::seconds(1));

        let data = Data {
            id: 16,
            name: "Firefish".to_owned(),
        };

        assert!(CACHE.get().is_none());
        assert!(CACHE_WITH_TTL.get().is_none());

        CACHE.set(data.clone());
        assert_eq!(data, CACHE.get().unwrap());

        CACHE_WITH_TTL.set(data.clone());
        assert_eq!(data, CACHE_WITH_TTL.get().unwrap());
    }

    #[test]
    fn expire() {
        static CACHE: Cache<Data> = Cache::new_with_ttl(Duration::seconds(1));

        let data = Data {
            id: 16,
            name: "Firefish".to_owned(),
        };

        CACHE.set(data);

        std::thread::sleep(std::time::Duration::from_millis(1100));

        assert!(CACHE.get().is_none());
    }

    static GLOBAL_CACHE_1: Cache<Data> = Cache::new();
    static GLOBAL_CACHE_2: Cache<Data> = Cache::new_with_ttl(Duration::milliseconds(2));

    #[tokio::test]
    async fn use_cache_in_parallel() {
        let mut tasks = Vec::new();

        async fn f() -> Data {
            Data {
                id: rand::random(),
                name: cuid2::create_id(),
            }
        }

        for _ in 0..20 {
            tasks.push(tokio::spawn(async {
                GLOBAL_CACHE_1.set(f().await);
                GLOBAL_CACHE_2.set(f().await);
                (GLOBAL_CACHE_1.get(), GLOBAL_CACHE_2.get())
            }))
        }
        for task in tasks {
            task.await.unwrap();
        }
    }
}
