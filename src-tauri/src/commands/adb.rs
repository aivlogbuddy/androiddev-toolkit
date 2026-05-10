use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Deserialize, Clone, serde::Serialize)]
pub struct AdbDevice {
    pub id: String,
    pub status: String,
    pub product: Option<String>,
    pub model: Option<String>,
    pub device: Option<String>,
}

/// List all ADB devices using `adb devices -l`
#[tauri::command]
pub fn list_devices() -> Result<Vec<AdbDevice>, String> {
    let output = Command::new("adb")
        .args(["devices", "-l"])
        .output()
        .map_err(|e| format!("Failed to execute adb devices: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines().skip(1) {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let id = parts[0].to_string();
        let status = parts[1].to_string();

        let mut product = None;
        let mut model = None;
        let mut device = None;

        for part in parts.iter().skip(2) {
            if let Some(rest) = part.strip_prefix("product:") {
                product = Some(rest.to_string());
            } else if let Some(rest) = part.strip_prefix("model:") {
                model = Some(rest.to_string());
            } else if let Some(rest) = part.strip_prefix("device:") {
                device = Some(rest.to_string());
            }
        }

        devices.push(AdbDevice {
            id,
            status,
            product,
            model,
            device,
        });
    }

    Ok(devices)
}

/// Connect to an ADB device using `adb connect <device_id>`
#[tauri::command]
pub fn connect_adb(device_id: String) -> Result<bool, String> {
    let output = Command::new("adb")
        .args(["connect", &device_id])
        .output()
        .map_err(|e| format!("Failed to execute adb connect: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(output.status.success() && (stdout.contains("connected") || stdout.contains("already connected")))
}

/// Disconnect from an ADB device using `adb disconnect <device_id>`
#[tauri::command]
pub fn disconnect_adb(device_id: String) -> Result<bool, String> {
    let output = Command::new("adb")
        .args(["disconnect", &device_id])
        .output()
        .map_err(|e| format!("Failed to execute adb disconnect: {}", e))?;

    Ok(output.status.success())
}

/// Execute a shell command on an ADB device using `adb -s <device_id> shell <command>`
#[tauri::command]
pub fn adb_shell(device_id: String, command: String) -> Result<String, String> {
    let output = Command::new("adb")
        .args(["-s", &device_id, "shell", &command])
        .output()
        .map_err(|e| format!("Failed to execute adb shell: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/// Run logcat on an ADB device using `adb -s <device_id> logcat <args>`
#[tauri::command]
pub fn adb_logcat(device_id: String, args: Vec<String>) -> Result<String, String> {
    let mut cmd_args: Vec<&str> = vec!["-s", &device_id, "logcat"];
    cmd_args.extend(args.iter().map(|s| s.as_str()));

    let output = Command::new("adb")
        .args(&cmd_args)
        .output()
        .map_err(|e| format!("Failed to execute adb logcat: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}