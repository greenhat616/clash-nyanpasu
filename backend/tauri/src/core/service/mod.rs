use std::path::PathBuf;

use nyanpasu_ipc::types::StatusInfo;
use once_cell::sync::Lazy;

use crate::{config::Config, utils::dirs::app_install_dir};

pub mod control;
pub mod ipc;

const SERVICE_NAME: &str = "nyanpasu-service";
static SERVICE_PATH: Lazy<PathBuf> = Lazy::new(|| {
    let app_path = app_install_dir().unwrap();
    app_path.join(format!("{}{}", SERVICE_NAME, std::env::consts::EXE_SUFFIX))
});

pub async fn init_service() {
    let enable_service = {
        *Config::verge()
            .latest()
            .enable_service_mode
            .as_ref()
            .unwrap_or(&false)
    };
    if let Ok(StatusInfo {
        status: nyanpasu_ipc::types::ServiceStatus::Running,
        ..
    }) = control::status().await
    {
        if !enable_service {
            control::stop_service().await.unwrap();
        } else {
            ipc::spawn_health_check()
        }
    }
}
