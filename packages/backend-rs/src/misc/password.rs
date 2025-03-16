//! Utilities for password hash generation and verification

use argon2::{
    password_hash,
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

/// Hashes the given password using [argon2] algorithm.
#[macros::export]
pub fn hash_password(password: &str) -> Result<String, password_hash::errors::Error> {
    let salt = SaltString::generate(&mut OsRng);
    Ok(Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string())
}

#[error_doc::errors]
pub enum Error {
    #[error("failed to verify password against bcrypt hash")]
    Bcrypt(#[from] bcrypt::BcryptError),
    #[error("failed to verify password against argon2 hash")]
    Argon2(#[from] argon2::Error),
    #[error("invalid argon2 password hash")]
    InvalidArgon2Hash(#[from] password_hash::Error),
}

/// Checks whether the given password and hash match.
#[macros::export]
pub fn verify_password(password: &str, hash: &str) -> Result<bool, Error> {
    if is_old_password_algorithm(hash) {
        Ok(bcrypt::verify(password, hash)?)
    } else {
        let parsed_hash = PasswordHash::new(hash)?;
        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }
}

/// Returns whether the [bcrypt] algorithm is used for the password hash.
#[inline]
#[macros::export]
pub fn is_old_password_algorithm(hash: &str) -> bool {
    // bcrypt hashes start with $2[ab]$
    hash.starts_with("$2")
}

#[cfg(test)]
mod unit_test {
    use super::{hash_password, is_old_password_algorithm};

    #[test]
    #[cfg_attr(miri, ignore)] // too slow
    fn verify_password() {
        let password = "omWc*%sD^fn7o2cXmc9e2QasBdrbRuhNB*gx!J5";

        let hash = hash_password(password).unwrap();
        assert!(super::verify_password(password, hash.as_str()).unwrap());

        let argon2_hash = "$argon2id$v=19$m=19456,t=2,p=1$jty3puDFd4ENv/lgHn3ROQ$kRHDdEoVv2rruvnF731E74NxnYlvj5FMgePdGIIq3Jk";
        let argon2_invalid_hash = "$argon2id$v=19$m=19456,t=2,p=1$jty3puDFd4ENv/lgHn3ROQ$kRHDdEoVv2rruvnF731E74NxnYlvj4FMgePdGIIq3Jk";
        let bcrypt_hash = "$2a$12$WzUc.20jgbHmQjUMqTr8vOhKqYbS1BUvubapv/GLjCK1IN.h4e4la";
        let bcrypt_invalid_hash = "$2a$12$WzUc.20jgbHmQjUMqTr7vOhKqYbS1BUvubapv/GLjCK1IN.h4e4la";

        assert!(!is_old_password_algorithm(argon2_hash));
        assert!(is_old_password_algorithm(bcrypt_hash));

        assert!(super::verify_password(password, argon2_hash).unwrap());
        assert!(super::verify_password(password, bcrypt_hash).unwrap());

        assert!(!super::verify_password(password, argon2_invalid_hash).unwrap());
        assert!(!super::verify_password(password, bcrypt_invalid_hash).unwrap());
    }
}
