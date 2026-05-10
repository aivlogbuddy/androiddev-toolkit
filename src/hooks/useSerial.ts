import { useState, useCallback } from 'react';
import { connectSerial, listSerialPorts, disconnectSerial, serialWrite, serialRead, SerialConfig, SerialPortInfo } from '../lib/tauri';
import { useDeviceStore } from '../stores/deviceStore';

export interface UseSerialReturn {
  refreshPorts: () => Promise<SerialPortInfo[]>;
  connect: (deviceId: string, config: SerialConfig) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  disconnect: (deviceId: string, sessionId: string) => Promise<{ success: boolean; error?: string }>;
  write: (sessionId: string, data: string) => Promise<{ success: boolean; error?: string }>;
  read: (sessionId: string, bytes?: number) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export function useSerial(): UseSerialReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDeviceConnected = useDeviceStore((state) => state.setDeviceConnected);

  const refreshPorts = useCallback(async (): Promise<SerialPortInfo[]> => {
    setLoading(true);
    setError(null);
    try {
      const ports = await listSerialPorts();
      setLoading(false);
      return ports;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      return [];
    }
  }, []);

  const connect = useCallback(async (deviceId: string, config: SerialConfig): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await connectSerial(config);
      if (result.success && result.session_id) {
        setDeviceConnected(deviceId, true);
        setLoading(false);
        return { success: true, sessionId: result.session_id };
      } else {
        setLoading(false);
        return { success: false, error: result.error || 'Failed to connect' };
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      return { success: false, error: err };
    }
  }, [setDeviceConnected]);

  const disconnect = useCallback(async (deviceId: string, sessionId: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await disconnectSerial(sessionId);
      if (result.success) {
        setDeviceConnected(deviceId, false);
      }
      setLoading(false);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      return { success: false, error: err };
    }
  }, [setDeviceConnected]);

  const write = useCallback(async (sessionId: string, data: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await serialWrite(sessionId, data);
      setLoading(false);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      return { success: false, error: err };
    }
  }, []);

  const read = useCallback(async (sessionId: string, bytes: number = 1024): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const result = await serialRead(sessionId, bytes);
      setLoading(false);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      return '';
    }
  }, []);

  return {
    refreshPorts,
    connect,
    disconnect,
    write,
    read,
    loading,
    error,
  };
}

export default useSerial;