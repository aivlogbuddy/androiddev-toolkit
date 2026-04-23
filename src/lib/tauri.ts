import { invoke } from '@tauri-apps/api/core';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'key';
  password?: string;
  privateKeyPath?: string;
}

export interface ADBConnectConfig {
  deviceId: string;
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

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
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

export async function listADBDevices(): Promise<DeviceInfo[]> {
  try {
    return await invoke<DeviceInfo[]>('list_adb_devices');
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

export async function listSerialPorts(): Promise<string[]> {
  try {
    return await invoke<string[]>('list_serial_ports');
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