use serialport::{DataBits, FlowControl, Parity, SerialPort, SerialPortInfo, StopBits};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, serde::Serialize)]
pub struct SerialPortInfo2 {
    pub name: String,
    pub port_type: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct SerialConfig {
    pub port: String,
    pub baud_rate: u32,
    pub data_bits: Option<u8>,
    pub stop_bits: Option<u8>,
    pub parity: Option<String>,
}

pub struct SerialConnection {
    port: Box<dyn SerialPort>,
}

pub struct SerialState {
    connections: Mutex<HashMap<String, SerialConnection>>,
}

impl SerialState {
    pub fn new() -> Self {
        Self {
            connections: Mutex::new(HashMap::new()),
        }
    }
}

impl Default for SerialState {
    fn default() -> Self {
        Self::new()
    }
}

fn parse_parity(parity: &Option<String>) -> Parity {
    match parity.as_deref() {
        Some("none") => Parity::None,
        Some("odd") => Parity::Odd,
        Some("even") => Parity::Even,
        _ => Parity::None,
    }
}

fn parse_data_bits(bits: Option<u8>) -> DataBits {
    match bits.unwrap_or(8) {
        5 => DataBits::Five,
        6 => DataBits::Six,
        7 => DataBits::Seven,
        8 => DataBits::Eight,
        _ => DataBits::Eight,
    }
}

fn parse_stop_bits(bits: Option<u8>) -> StopBits {
    match bits.unwrap_or(1) {
        1 => StopBits::One,
        2 => StopBits::Two,
        _ => StopBits::One,
    }
}

#[tauri::command]
pub fn list_ports() -> Result<Vec<SerialPortInfo2>, String> {
    let ports = serialport::available_ports()
        .map_err(|e| format!("Failed to list ports: {}", e))?;

    let result: Vec<SerialPortInfo2> = ports
        .into_iter()
        .map(|p| SerialPortInfo2 {
            name: p.port_name,
            port_type: format!("{:?}", p.port_type),
        })
        .collect();

    Ok(result)
}

#[tauri::command]
pub fn connect_serial(config: SerialConfig, state: State<SerialState>) -> Result<String, String> {
    let port_name = config.port.clone();
    let baud_rate = config.baud_rate;

    let builder = serialport::new(&port_name, baud_rate)
        .data_bits(parse_data_bits(config.data_bits))
        .stop_bits(parse_stop_bits(config.stop_bits))
        .parity(parse_parity(&config.parity))
        .flow_control(FlowControl::None);

    let port = builder
        .open()
        .map_err(|e| format!("Failed to open serial port {}: {}", port_name, e))?;

    let connection_id = uuid::Uuid::new_v4().to_string();

    let mut connections = state
        .connections
        .lock()
        .map_err(|e| format!("Failed to lock connections: {}", e))?;

    connections.insert(connection_id.clone(), SerialConnection { port });

    Ok(connection_id)
}

#[tauri::command]
pub fn disconnect_serial(connection_id: String, state: State<SerialState>) -> Result<bool, String> {
    let mut connections = state
        .connections
        .lock()
        .map_err(|e| format!("Failed to lock connections: {}", e))?;

    match connections.remove(&connection_id) {
        Some(_) => Ok(true),
        None => Err(format!("Connection {} not found", connection_id)),
    }
}

#[tauri::command]
pub fn serial_write(
    connection_id: String,
    data: String,
    state: State<SerialState>,
) -> Result<bool, String> {
    let connections = state
        .connections
        .lock()
        .map_err(|e| format!("Failed to lock connections: {}", e))?;

    let connection = connections
        .get(&connection_id)
        .ok_or_else(|| format!("Connection {} not found", connection_id))?;

    let mut port = connection.port.try_clone()
        .map_err(|e| format!("Failed to clone port: {}", e))?;

    port.write_all(data.as_bytes())
        .map_err(|e| format!("Failed to write to serial port: {}", e))?;

    port.flush()
        .map_err(|e| format!("Failed to flush serial port: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub fn serial_read(
    connection_id: String,
    bytes: usize,
    state: State<SerialState>,
) -> Result<String, String> {
    let connections = state
        .connections
        .lock()
        .map_err(|e| format!("Failed to lock connections: {}", e))?;

    let connection = connections
        .get(&connection_id)
        .ok_or_else(|| format!("Connection {} not found", connection_id))?;

    let mut port = connection.port.try_clone()
        .map_err(|e| format!("Failed to clone port: {}", e))?;

    let mut buffer = vec![0u8; bytes];
    let bytes_read = port
        .read(&mut buffer)
        .map_err(|e| format!("Failed to read from serial port: {}", e))?;

    buffer.truncate(bytes_read);

    let result = String::from_utf8(buffer)
        .map_err(|e| format!("Failed to convert bytes to string: {}", e))?;

    Ok(result)
}
