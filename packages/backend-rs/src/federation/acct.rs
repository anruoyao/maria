use std::{fmt, str::FromStr};

#[cfg_attr(test, derive(Debug, PartialEq))]
#[macros::export(object)]
pub struct Acct {
    pub username: String,
    pub host: Option<String>,
}

#[derive(thiserror::Error, Debug)]
#[doc = "Error type to indicate a [`String`]-to-[`Acct`] conversion failure"]
#[error("failed to convert string '{0}' into acct")]
pub struct InvalidAcctString(String);

impl FromStr for Acct {
    type Err = InvalidAcctString;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let split: Vec<&str> = if let Some(stripped) = value.strip_prefix('@') {
            stripped
        } else {
            value
        }
        .split('@')
        .collect();

        Ok(Self {
            username: split[0].to_owned(),
            host: if split.len() == 1 {
                None
            } else {
                Some(split[1].to_owned())
            },
        })
    }
}

impl fmt::Display for Acct {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let result = match &self.host {
            Some(host) => format!("{}@{}", self.username, host),
            None => self.username.clone(),
        };
        write!(f, "{result}")
    }
}

impl From<Acct> for String {
    fn from(value: Acct) -> Self {
        value.to_string()
    }
}

#[macros::ts_export]
pub fn string_to_acct(acct: &str) -> Acct {
    Acct::from_str(acct).unwrap()
}

#[macros::ts_export]
pub fn acct_to_string(acct: &Acct) -> String {
    acct.to_string()
}

#[cfg(test)]
mod unit_test {
    use super::Acct;
    use pretty_assertions::assert_eq;
    use std::str::FromStr;

    #[test]
    fn acct_to_string() {
        let remote_acct = Acct {
            username: "firefish".to_owned(),
            host: Some("example.com".to_owned()),
        };
        let local_acct = Acct {
            username: "MisakaMikoto".to_owned(),
            host: None,
        };

        assert_eq!(remote_acct.to_string(), "firefish@example.com");
        assert_ne!(remote_acct.to_string(), "mastodon@example.com");
        assert_eq!(local_acct.to_string(), "MisakaMikoto");
        assert_ne!(local_acct.to_string(), "ShiraiKuroko");
    }

    #[test]
    fn string_to_acct() {
        let remote_acct = Acct {
            username: "firefish".to_owned(),
            host: Some("example.com".to_owned()),
        };
        let local_acct = Acct {
            username: "MisakaMikoto".to_owned(),
            host: None,
        };

        assert_eq!(
            Acct::from_str("@firefish@example.com").unwrap(),
            remote_acct
        );
        assert_eq!(Acct::from_str("firefish@example.com").unwrap(), remote_acct);
        assert_eq!(Acct::from_str("@MisakaMikoto").unwrap(), local_acct);
        assert_eq!(Acct::from_str("MisakaMikoto").unwrap(), local_acct);
    }
}
