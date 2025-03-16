pub mod count;

use crate::config::CONFIG;

/// Returns URI of a local user.
pub fn local_uri(user_id: impl std::fmt::Display) -> String {
    format!("{}/users/{}", CONFIG.url, user_id)
}

#[doc(hidden)] // hide the macro in the top doc page
#[macro_export]
macro_rules! is_local {
    ($user_like:expr) => {
        $user_like.host.is_none()
    };
}

#[doc(inline)] // show the macro in the module doc page
pub use is_local;

#[doc(hidden)] // hide the macro in the top doc page
#[macro_export]
macro_rules! is_remote {
    ($user_like:expr) => {
        $user_like.host.is_some()
    };
}

#[doc(inline)] // show the macro in the module doc page
pub use is_remote;
