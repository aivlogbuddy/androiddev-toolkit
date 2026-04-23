use ssh2::Session;
use std::collections::HashMap;
use std::net::TcpStream;
use std::sync::Mutex;
use tauri::State;

pub struct SshSession {
    session: Session,
    _stream: TcpStream,
}

pub struct SshState {
    sessions: Mutex<HashMap<String, SshSession>>,
}

impl Default for SshState {
    fn default() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct SshConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: String,
    pub password: Option<String>,
    pub key_path: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct SshConnectResult {
    pub session_id: String,
    pub success: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub fn connect_ssh(config: SshConfig, state: State<SshState>) -> Result<SshConnectResult, String> {
    let addr = format!("{}:{}", config.host, config.port);

    let tcp_stream = TcpStream::connect(&addr).map_err(|e| {
        format!("Failed to connect to {}: {}", addr, e)
    })?;

    let mut session = Session::new().map_err(|e| {
        format!("Failed to create SSH session: {}", e)
    })?;

    session.set_tcp_stream(tcp_stream.try_clone().map_err(|e| {
        format!("Failed to clone TCP stream: {}", e)
    })?);

    session.handshake().map_err(|e| {
        format!("SSH handshake failed: {}", e)
    })?;

    match config.auth_method.as_str() {
        "password" => {
            let password = config.password.ok_or_else(|| {
                "Password required for password authentication".to_string()
            })?;
            session.userauth_password(&config.username, &password).map_err(|e| {
                format!("Password authentication failed: {}", e)
            })?;
        }
        "key" => {
            let key_path = config.key_path.ok_or_else(|| {
                "Key path required for key authentication".to_string()
            })?;
            session.userauth_pubkey_file(&config.username, None, std::path::Path::new(&key_path), None)
                .map_err(|e| {
                    format!("Key authentication failed: {}", e)
                })?;
        }
        _ => {
            return Ok(SshConnectResult {
                session_id: String::new(),
                success: false,
                error: Some(format!("Unsupported auth method: {}", config.auth_method)),
            });
        }
    }

    if !session.authenticated() {
        return Ok(SshConnectResult {
            session_id: String::new(),
            success: false,
            error: Some("Authentication failed".to_string()),
        });
    }

    let session_id = format!("ssh-{}", uuid::Uuid::new_v4());

    let ssh_session = SshSession {
        session,
        _stream: tcp_stream,
    };

    let mut sessions = state.sessions.lock().map_err(|e| {
        format!("Failed to lock sessions: {}", e)
    })?;
    sessions.insert(session_id.clone(), ssh_session);

    Ok(SshConnectResult {
        session_id,
        success: true,
        error: None,
    })
}

#[tauri::command]
pub fn disconnect_ssh(session_id: String, state: State<SshState>) -> Result<bool, String> {
    let mut sessions = state.sessions.lock().map_err(|e| {
        format!("Failed to lock sessions: {}", e)
    })?;

    if let Some(ssh_session) = sessions.remove(&session_id) {
        ssh_session.session.disconnect(None, "User requested disconnect", None)
            .map_err(|e| {
                format!("Failed to disconnect SSH session: {}", e)
            })?;
        Ok(true)
    } else {
        Err(format!("Session not found: {}", session_id))
    }
}

#[tauri::command]
pub fn exec_ssh(session_id: String, command: String, state: State<SshState>) -> Result<String, String> {
    let sessions = state.sessions.lock().map_err(|e| {
        format!("Failed to lock sessions: {}", e)
    })?;

    let ssh_session = sessions.get(&session_id).ok_or_else(|| {
        format!("Session not found: {}", session_id)
    })?;

    let mut channel = ssh_session.session.channel_session().map_err(|e| {
        format!("Failed to open channel: {}", e)
    })?;

    channel.exec(&command).map_err(|e| {
        format!("Failed to execute command: {}", e)
    })?;

    let mut output = String::new();
    channel.read_to_string(&mut output).map_err(|e| {
        format!("Failed to read command output: {}", e)
    })?;

    channel.wait_close().map_err(|e| {
        format!("Failed to wait for channel close: {}", e)
    })?;

    Ok(output)
}
