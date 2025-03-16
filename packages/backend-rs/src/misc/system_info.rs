//! Utilities to check hardware information such as cpu, memory, storage usage
// TODO: i64 -> u64 (we can't export u64 to Node.js)

use std::sync::{Mutex, OnceLock};
use sysinfo::{Disks, MemoryRefreshKind, System};

static SYSTEM_INFO: OnceLock<Mutex<System>> = OnceLock::new();

/// Gives you access to the shared static [System] object.
///
/// # Example
///
/// ```
/// # use backend_rs::misc::system_info;
/// let system_info = system_info::get();
/// println!("The number of CPU threads is {}.", system_info.cpus().len());
/// println!("The total memory is {} MiB.", system_info.total_memory() / 1048576);
/// ```
pub fn get() -> std::sync::MutexGuard<'static, System> {
    let guard = SYSTEM_INFO
        .get_or_init(|| Mutex::new(System::new_all()))
        .lock();

    if let Err(err) = guard {
        let mut inner = err.into_inner();
        *inner = System::new_all();
        inner
    } else {
        guard.unwrap()
    }
}

#[macros::export(object)]
pub struct Cpu {
    pub model: String,
    // TODO: u16 -> usize (we can't export usize to Node.js)
    pub cores: u16,
}

#[macros::export(object)]
pub struct Memory {
    /// Total memory amount in bytes
    pub total: i64,
    /// Used memory amount in bytes
    pub used: i64,
    /// Available (for (re)use) memory amount in bytes
    pub available: i64,
}

#[macros::export(object)]
pub struct Storage {
    /// Total storage space in bytes
    pub total: i64,
    /// Used storage space in bytes
    pub used: i64,
}

#[macros::export]
pub fn cpu_info() -> Cpu {
    let system_info = get();

    Cpu {
        model: match system_info.cpus() {
            [] => {
                tracing::debug!("failed to get CPU info");
                "unknown".to_owned()
            }
            cpus => cpus[0].brand().to_owned(),
        },
        cores: system_info.cpus().len() as u16,
    }
}

#[macros::export]
pub fn cpu_usage() -> f32 {
    let mut system_info = get();
    system_info.refresh_cpu_usage();

    let total_cpu_usage: f32 = system_info.cpus().iter().map(|cpu| cpu.cpu_usage()).sum();
    let cpu_threads = system_info.cpus().len();

    total_cpu_usage / (cpu_threads as f32)
}

#[macros::export]
pub fn memory_usage() -> Memory {
    let mut system_info = get();

    system_info.refresh_memory_specifics(MemoryRefreshKind::new().with_ram());

    Memory {
        total: system_info.total_memory() as i64,
        used: system_info.used_memory() as i64,
        available: system_info.available_memory() as i64,
    }
}

#[macros::export]
pub fn storage_usage() -> Option<Storage> {
    // Get the first disk that is actualy used (has available space & has at least 1 GB total space).
    let disks = Disks::new_with_refreshed_list();
    let disk = disks
        .iter()
        .find(|disk| disk.available_space() > 0 && disk.total_space() > 1024 * 1024 * 1024)?;

    let total = disk.total_space() as i64;
    let available = disk.available_space() as i64;

    Some(Storage {
        total,
        used: total - available,
    })
}
