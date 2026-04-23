use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, serde::Serialize)]
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

fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    let salt_string = SaltString::encode_b64(salt)
        .map_err(|e| format!("Failed to encode salt: {}", e))?;

    let argon2 = Argon2::default();

    let hash = argon2
        .hash_password(password.as_bytes(), &salt_string)
        .map_err(|e| format!("Failed to derive key: {}", e))?;

    let hash_output = hash
        .hash
        .ok_or("No hash output produced")?;

    let hash_bytes = hash_output.as_bytes();

    let mut key = [0u8; 32];
    let copy_len = std::cmp::min(hash_bytes.len(), 32);
    key[..copy_len].copy_from_slice(&hash_bytes[..copy_len]);

    Ok(key)
}

#[tauri::command]
pub fn unlock_store(master_password: String, state: State<CryptoState>) -> Result<bool, String> {
    let salt = b"androiddev-toolkit-salt-v1";

    let master_key = derive_key(&master_password, salt)?;

    let store = SecureStore {
        master_key,
        entries: HashMap::new(),
    };

    let mut locked_store = state
        .store
        .lock()
        .map_err(|e| format!("Failed to lock store: {}", e))?;

    *locked_store = Some(store);

    Ok(true)
}

#[tauri::command]
pub fn lock_store(state: State<CryptoState>) -> Result<bool, String> {
    let mut store = state
        .store
        .lock()
        .map_err(|e| format!("Failed to lock store: {}", e))?;

    *store = None;

    Ok(true)
}

#[tauri::command]
pub fn is_store_unlocked(state: State<CryptoState>) -> Result<bool, String> {
    let store = state
        .store
        .lock()
        .map_err(|e| format!("Failed to lock store: {}", e))?;

    Ok(store.is_some())
}

#[tauri::command]
pub fn encrypt_entry(
    id: String,
    data: String,
    state: State<CryptoState>,
) -> Result<EncryptedEntry, String> {
    let store = state
        .store
        .lock()
        .map_err(|e| format!("Failed to lock store: {}", e))?;

    let secure_store = store
        .as_ref()
        .ok_or("Store is locked")?;

    let cipher = Aes256Gcm::new_from_slice(&secure_store.master_key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;

    let nonce_bytes: [u8; 12] = rand::random();
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let mut combined = nonce_bytes.to_vec();
    combined.extend(ciphertext);

    let encoded = BASE64.encode(&combined);

    Ok(EncryptedEntry { id, data: encoded })
}

#[tauri::command]
pub fn decrypt_entry(
    encrypted: EncryptedEntry,
    state: State<CryptoState>,
) -> Result<String, String> {
    let store = state
        .store
        .lock()
        .map_err(|e| format!("Failed to lock store: {}", e))?;

    let secure_store = store
        .as_ref()
        .ok_or("Store is locked")?;

    let cipher = Aes256Gcm::new_from_slice(&secure_store.master_key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;

    let combined = BASE64
        .decode(&encrypted.data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    if combined.len() < 12 {
        return Err("Invalid encrypted data".to_string());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext)
        .map_err(|e| format!("Failed to convert decrypted data to string: {}", e))
}
