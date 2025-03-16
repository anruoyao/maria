use crate::config::CONFIG;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

/// Initializes the [tracing] logger.
#[macros::export(js_name = "initializeRustLogger")]
pub fn initialize_logger() {
    let mut builder = FmtSubscriber::builder();

    if let Some(max_level) = &CONFIG.max_log_level {
        builder = builder.with_max_level(match max_level.as_str() {
            "error" => Level::ERROR,
            "warning" => Level::WARN,
            "info" => Level::INFO,
            "debug" => Level::DEBUG,
            "trace" => Level::TRACE,
            _ => Level::INFO, // Fallback
        });
    } else if let Some(levels) = &CONFIG.log_level {
        // `logLevel` config is Deprecated
        if levels.contains(&"trace".to_owned()) {
            builder = builder.with_max_level(Level::TRACE);
        } else if levels.contains(&"debug".to_owned()) {
            builder = builder.with_max_level(Level::DEBUG);
        } else if levels.contains(&"info".to_owned()) {
            builder = builder.with_max_level(Level::INFO);
        } else if levels.contains(&"warning".to_owned()) {
            builder = builder.with_max_level(Level::WARN);
        } else if levels.contains(&"error".to_owned()) {
            builder = builder.with_max_level(Level::ERROR);
        } else {
            // Fallback
            builder = builder.with_max_level(Level::INFO);
        }
    } else {
        // Fallback
        builder = builder.with_max_level(Level::INFO);
    };

    let subscriber = builder
        .without_time()
        .with_level(true)
        .with_ansi(true)
        .with_target(true)
        .with_thread_names(true)
        .with_line_number(true)
        .log_internal_errors(true)
        .compact()
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to initialize the logger");
}
