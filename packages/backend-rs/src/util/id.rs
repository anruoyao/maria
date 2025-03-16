//! ID generation utility based on [cuid2]

use crate::config::CONFIG;
use basen::BASE36;
use chrono::{DateTime, NaiveDateTime, Utc};
use std::{cmp, sync::OnceLock};

static FINGERPRINT: OnceLock<String> = OnceLock::new();
static GENERATOR: OnceLock<cuid2::CuidConstructor> = OnceLock::new();

const TIME_2000: i64 = 946_684_800_000;
const TIMESTAMP_LENGTH: u8 = 8;

/// Initializes Cuid2 generator.
fn init_id_generator(length: u8, fingerprint: &str) {
    FINGERPRINT.get_or_init(move || format!("{}{}", fingerprint, cuid2::create_id()));
    GENERATOR.get_or_init(move || {
        cuid2::CuidConstructor::new()
            // length to pass shoule be greater than or equal to 8.
            .with_length(cmp::max(length - TIMESTAMP_LENGTH, 8).into())
            .with_fingerprinter(|| FINGERPRINT.get().unwrap().clone())
    });
}

/// Returns Cuid2 with the length specified by [init_id_generator].
/// It automatically calls [init_id_generator], if the generator has not been initialized.
fn create_id(datetime: &NaiveDateTime) -> String {
    if GENERATOR.get().is_none() {
        let length = match CONFIG.cuid.as_ref() {
            Some(cuid) => cuid.length.unwrap_or(16).clamp(16, 24),
            None => 16,
        };
        let fingerprint = match CONFIG.cuid.as_ref() {
            Some(cuid) => cuid.fingerprint.as_deref().unwrap_or_default(),
            None => "",
        };
        init_id_generator(length, fingerprint);
    }
    let date_num = cmp::max(0, datetime.and_utc().timestamp_millis() - TIME_2000) as u64;
    format!(
        "{:0>8}{}",
        BASE36.encode_var_len(&date_num),
        GENERATOR.get().unwrap().create_id()
    )
}

#[derive(thiserror::Error, Debug)]
#[doc = "Error type to indicate invalid Firefish ID"]
#[error("'{id}' is not a valid Firefish ID")]
pub struct InvalidIdError {
    id: String,
}

#[macros::export]
pub fn get_timestamp(id: &str) -> Result<i64, InvalidIdError> {
    let n: Option<u64> = BASE36.decode_var_len(&id[0..8]);
    if let Some(n) = n {
        Ok(n as i64 + TIME_2000)
    } else {
        Err(InvalidIdError { id: id.to_owned() })
    }
}

/// The generated ID results in the form of `[8 chars timestamp] + [cuid2]`.
/// The minimum and maximum lengths are 16 and 24, respectively.
/// With the length of 16, namely 8 for cuid2, roughly 1427399 IDs are needed
/// in the same millisecond to reach 50% chance of collision.
///
/// Ref: <https://github.com/paralleldrive/cuid2#parameterized-length>
#[macros::export]
pub fn gen_id() -> String {
    create_id(&Utc::now().naive_utc())
}

/// Generate an ID using a specific datetime
#[macros::export]
pub fn gen_id_at(date: DateTime<Utc>) -> String {
    create_id(&date.naive_utc())
}

#[cfg(test)]
mod unit_test {
    use super::{gen_id, gen_id_at, get_timestamp};
    use chrono::{Duration, Utc};
    use pretty_assertions::{assert_eq, assert_ne};
    use std::thread;

    #[test]
    fn create_and_decode_id() {
        let now = Utc::now();
        assert_eq!(gen_id().len(), 16);
        assert_ne!(gen_id_at(now), gen_id_at(now));
        assert_ne!(gen_id(), gen_id());

        let id1 = thread::spawn(move || gen_id_at(now));
        let id2 = thread::spawn(move || gen_id_at(now));
        assert_ne!(id1.join().unwrap(), id2.join().unwrap());

        let test_id = gen_id_at(now);
        let timestamp = get_timestamp(&test_id).unwrap();
        assert_eq!(now.timestamp_millis(), timestamp);

        let now_id = gen_id_at(now);
        let old_id = gen_id_at(now - Duration::milliseconds(1));
        let future_id = gen_id_at(now + Duration::milliseconds(1));
        assert!(old_id < now_id);
        assert!(now_id < future_id);
    }

    #[test]
    fn get_timestamp_from_id() {
        assert_eq!(get_timestamp("9e112pilk1").unwrap(), 1682499501741);
        assert_eq!(get_timestamp("9e183znmxa").unwrap(), 1682511318850);
        assert_eq!(get_timestamp("9e9srqr79p").unwrap(), 1683029748787);
        assert_eq!(get_timestamp("9tr87i03euwphnsw").unwrap(), 1716735338211);
        assert_eq!(get_timestamp("9s9wn2e9cio09do1").unwrap(), 1713511201761);
        assert_eq!(get_timestamp("9tr7slj2tt2ml1wp").unwrap(), 1716734642942);
    }
}
