use crate::config::server::VERSION;

const GREETING_MESSAGE: &str = "\
███    ███  █████  ██████  ██  █████       ██████   ██████  
████  ████ ██   ██ ██   ██ ██ ██   ██     ██       ██    ██ 
██ ████ ██ ███████ ██████  ██ ███████     ██   ███ ██    ██ 
██  ██  ██ ██   ██ ██   ██ ██ ██   ██     ██    ██ ██    ██ 
██      ██ ██   ██ ██   ██ ██ ██   ██      ██████   ██████  
 Firefish is an open-source decentralized microblogging platform.
";

/// Prints the greeting message and the Firefish version to stdout.
#[macros::export]
pub fn greet() {
    println!("{}", GREETING_MESSAGE);

    tracing::info!("Welcome to Firefish!");
    tracing::info!("Firefish v{VERSION}");
}
