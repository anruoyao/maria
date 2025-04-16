use crate::config::server::VERSION;

const GREETING_MESSAGE: &str = "\
.___  ___.      ___      .______       __       ___           _______   ______   
|   \/   |     /   \     |   _  \     |  |     /   \         /  _____| /  __  \  
|  \  /  |    /  ^  \    |  |_)  |    |  |    /  ^  \       |  |  __  |  |  |  | 
|  |\/|  |   /  /_\  \   |      /     |  |   /  /_\  \      |  | |_ | |  |  |  | 
|  |  |  |  /  _____  \  |  |\  \----.|  |  /  _____  \     |  |__| | |  `--'  | 
|__|  |__| /__/     \__\ | _| `._____||__| /__/     \__\     \______|  \______/  
                                                                                 
 Maria is an open-source decentralized microblogging platform.
";

/// Prints the greeting message and the Maria version to stdout.
#[macros::export]
pub fn greet() {
    println!("{}", GREETING_MESSAGE);

    tracing::info!("Welcome to Maria!");
    tracing::info!("Maria v{VERSION}");
}
