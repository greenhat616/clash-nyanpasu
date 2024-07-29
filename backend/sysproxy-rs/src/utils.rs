pub fn command_exists(command: &str) -> bool {
    #[cfg(unix)]
    {
        std::process::Command::new("command")
            .arg("-v")
            .arg(command)
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    }
    #[cfg(windows)]
    {
        std::process::Command::new("where")
            .arg(command)
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    }
}
