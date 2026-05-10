use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Argon2, PasswordHasher};
use argon2::password_hash::SaltString;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EncryptedEntry {
    pub id: String,
    pub data: String,
}

pub struct SecureStore {
    pub master_key: [u8; 32],
    pub entries: HashMap<String, Vec<u8>>,
}

pub struct CryptoState {
    store: Mutex<Option<SecureStore>>,
}

impl CryptoState {
    pub fn new() -> Self {
        Self {
            store: Mutex::new(None),
        }
    }
}

impl Default for CryptoState {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn unlock_store(master_password: String, state: State<CryptoState>) -> Result<bool, String> {
    let salt = SaltString::from_b64("defaultsalt123456789012345678")
        .map_err(|e| format!("Salt error: {}", e))?;

    let argon2 = Argon2::default();
    let mut key = [0u8; 32];

    argon2
        .hash_password_into(master_password.as_bytes(), salt.as_str().as_bytes(), &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;

    let mut store_guard = state.store.lock().map_err(|e| format!("Lock error: {}", e))?;
    *store_guard = Some(SecureStore {
        master_key: key,
        entries: HashMap::new(),
    });
    Ok(true)
}

#[tauri::command]
pub fn lock_store(state: State<CryptoState>) -> Result<bool, String> {
    let mut store_guard = state.store.lock().map_err(|e| format!("Lock error: {}", e))?;
    *store_guard = None;
    Ok(true)
}

#[tauri::command]
pub fn is_store_unlocked(state: State<CryptoState>) -> Result<bool, String> {
    Ok(state.store.lock().map_err(|e| format!("Lock error: {}", e))?.is_some())
}

#[tauri::command]
pub fn encrypt_entry(id: String, data: String, state: State<CryptoState>) -> Result<EncryptedEntry, String> {
    let store = state.store.lock().map_err(|e| format!("Lock error: {}", e))?;
    let store = store.as_ref().ok_or("Store is locked")?;

    let cipher = Aes256Gcm::new_from_slice(&store.master_key)
        .map_err(|e| format!("Cipher error: {}", e))?;

    let nonce = Nonce::from_slice(b"unique nonce 12b");
    let ciphertext = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    Ok(EncryptedEntry {
        id,
        data: BASE64.encode(ciphertext),
    })
}

#[tauri::command]
pub fn decrypt_entry(encrypted: EncryptedEntry, state: State<CryptoState>) -> Result<String, String> {
    let store = state.store.lock().map_err(|e| format!("Lock error: {}", e))?;
    let store = store.as_ref().ok_or("Store is locked")?;

    let cipher = Aes256Gcm::new_from_slice(&store.master_key)
        .map_err(|e| format!("Cipher error: {}", e))?;

    let ciphertext = BASE64.decode(&encrypted.data)
        .map_err(|e| format!("Base64 decode failed: {}", e))?;

    let nonce = Nonce::from_slice(b"unique nonce 12b");
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| format!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8 error: {}", e))
}