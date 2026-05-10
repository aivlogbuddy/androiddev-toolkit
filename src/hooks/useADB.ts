import { useState, useCallback } from 'react';
import { useDeviceStore } from '../stores/deviceStore';
import {
  listADBDevices,
  connectADB,
  disconnectADB,
  adbShell,
  adbLogcat,
  AdbDeviceInfo,
} from '../lib/tauri';

export interface UseADBReturn {
  refreshDevices: () => Promise<AdbDeviceInfo[]>;
  connect: (deviceId: string) => Promise<{ success: boolean; error?: string }>;
  disconnect: (deviceId: string) => Promise<{ success: boolean; error?: string }>;
  shell: (deviceId: string, command: string) => Promise<string>;
  logcat: (deviceId: string, args?: string[]) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export function useADB(): UseADBReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDeviceConnected = useDeviceStore((state) => state.setDeviceConnected);

  const refreshDevices = useCallback(async (): Promise<AdbDeviceInfo[]> => {
    setLoading(true);
    setError(null);
    try {
      const devices = await listADBDevices();
      setLoading(false);
      return devices;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      return [];
    }
  }, []);

  const connect = useCallback(async (deviceId: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await connectADB(deviceId);
      if (result.success) {
        setDeviceConnected(deviceId, true);
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

  const disconnect = useCallback(async (deviceId: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await disconnectADB(deviceId);
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

  const shell = useCallback(async (deviceId: string, command: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const output = await adbShell(deviceId, command);
      setLoading(false);
      return output;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      throw new Error(err);
    }
  }, []);

  const logcat = useCallback(async (deviceId: string, args: string[] = []): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const output = await adbLogcat(deviceId, args);
      setLoading(false);
      return output;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      setLoading(false);
      throw new Error(err);
    }
  }, []);

  return {
    refreshDevices,
    connect,
    disconnect,
    shell,
    logcat,
    loading,
    error,
  };
}

export default useADB;