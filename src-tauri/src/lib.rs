mod commands;

use commands::ssh::{connect_ssh, disconnect_ssh, exec_ssh, SshState};
use commands::adb::{list_devices, connect_adb, disconnect_adb, adb_shell, adb_logcat};
use commands::serial::{list_ports, connect_serial, disconnect_serial, serial_write, serial_read, SerialState};
use commands::crypto::{unlock_store, lock_store, is_store_unlocked, encrypt_entry, decrypt_entry, CryptoState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SshState::default())
        .manage(SerialState::default())
        .manage(CryptoState::default())
        .invoke_handler(tauri::generate_handler![
            connect_ssh,
            disconnect_ssh,
            exec_ssh,
            list_devices,
            connect_adb,
            disconnect_adb,
            adb_shell,
            adb_logcat,
            list_ports,
            connect_serial,
            disconnect_serial,
            serial_write,
            serial_read,
            unlock_store,
            lock_store,
            is_store_unlocked,
            encrypt_entry,
            decrypt_entry,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}