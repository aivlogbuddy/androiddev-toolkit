import { invoke } from '@tauri-apps/api/core';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'key';
  password?: string;
  privateKeyPath?: string;
}

export interface SerialConfig {
  port: string;
  baudRate: number;
}

export interface ConnectResult {
  success: boolean;
  session_id?: string;
  error?: string;
}

export interface AdbDeviceInfo {
  id: string;
  status: string;
  product: string | null;
  model: string | null;
  device: string | null;
}

export interface SerialPortInfo {
  name: string;
  port_type: string;
}

export async function connectSSH(config: SSHConfig): Promise<ConnectResult> {
  try {
    return await invoke<ConnectResult>('connect_ssh', { config });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function disconnectSSH(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; error?: string }>('disconnect_ssh', { sessionId });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function execSSH(sessionId: string, command: string): Promise<string> {
  try {
    return await invoke<string>('exec_ssh', { sessionId, command });
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function listADBDevices(): Promise<AdbDeviceInfo[]> {
  try {
    return await invoke<AdbDeviceInfo[]>('list_devices');
  } catch (error) {
    console.error('Failed to list ADB devices:', error);
    return [];
  }
}

export async function connectADB(deviceId: string): Promise<ConnectResult> {
  try {
    return await invoke<ConnectResult>('connect_adb', { deviceId });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function disconnectADB(deviceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; error?: string }>('disconnect_adb', { deviceId });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function adbShell(deviceId: string, command: string): Promise<string> {
  try {
    return await invoke<string>('adb_shell', { deviceId, command });
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function adbLogcat(deviceId: string, args: string[]): Promise<string> {
  try {
    return await invoke<string>('adb_logcat', { deviceId, args });
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function listSerialPorts(): Promise<SerialPortInfo[]> {
  try {
    return await invoke<SerialPortInfo[]>('list_ports');
  } catch (error) {
    console.error('Failed to list serial ports:', error);
    return [];
  }
}

export async function connectSerial(config: SerialConfig): Promise<ConnectResult> {
  try {
    return await invoke<ConnectResult>('connect_serial', { config });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function serialWrite(sessionId: string, data: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; error?: string }>('serial_write', { sessionId, data });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function serialRead(sessionId: string, bytes: number = 1024): Promise<string> {
  try {
    return await invoke<string>('serial_read', { sessionId, bytes });
  } catch (error) {
    return '';
  }
}

export async function disconnectSerial(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; error?: string }>('disconnect_serial', { sessionId });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function unlockStore(masterPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; error?: string }>('unlock_store', { masterPassword });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function lockStore(): Promise<{ success: boolean; error?: string }> {
  try {
    return await invoke<{ success: boolean; error?: string }>('lock_store');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}