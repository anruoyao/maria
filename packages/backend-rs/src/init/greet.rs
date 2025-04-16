use crate::config::server::VERSION;

const GREETING_MESSAGE: &str = "\
███████╗██╗██████╗ ███████╗███████╗██╗███████╗██╗  ██╗    ○     ▄    ▄
██╔════╝██║██╔══██╗██╔════╝██╔════╝██║██╔════╝██║  ██║      ⚬   █▄▄  █▄▄
█████╗  ██║██████╔╝█████╗  █████╗  ██║███████╗███████║      ▄▄▄▄▄▄   ▄
██╔══╝  ██║██╔══██╗██╔══╝  ██╔══╝  ██║╚════██║██╔══██║     █      █  █▄▄
██║     ██║██║  ██║███████╗██║     ██║███████║██║  ██║     █ ● ●  █
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝     ▀▄▄▄▄▄▄▀
 Maria is an open-source decentralized microblogging platform.
";

/// Prints the greeting message and the Maria version to stdout.
#[macros::export]
pub fn greet() {
    println!("{}", GREETING_MESSAGE);

    tracing::info!("Welcome to Maria!");
    tracing::info!("Maria v{VERSION}");
}