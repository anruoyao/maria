use crate::misc::system_info;
use sysinfo::System;

/// Prints the server hardware information as the server info log.
#[macros::export]
pub fn show_server_info() {
    let system_info = system_info::get();

    tracing::info!(
        "Hostname: {}",
        System::host_name().unwrap_or_else(|| "unknown".to_owned())
    );
    tracing::info!(
        "OS: {}",
        System::long_os_version().unwrap_or_else(|| "unknown".to_owned())
    );
    tracing::info!(
        "Kernel: {}",
        System::kernel_version().unwrap_or_else(|| "unknown".to_owned())
    );
    tracing::info!(
        "CPU architecture: {}",
        System::cpu_arch().unwrap_or_else(|| "unknown".to_owned())
    );
    tracing::info!("CPU threads: {}", system_info.cpus().len());
    tracing::info!("Total memory: {} MiB", system_info.total_memory() / 1048576);
    tracing::info!("Free memory: {} MiB", system_info.free_memory() / 1048576);
    tracing::info!("Total swap: {} MiB", system_info.total_swap() / 1048576);
    tracing::info!("Free swap: {} MiB", system_info.free_swap() / 1048576);
}
