import { useState, useCallback } from 'react';
import { listADBDevices, connectADB, DeviceInfo } from '../lib/tauri';
import { useDeviceStore } from '../stores/deviceStore';

export interface UseADBReturn {
  refreshDevices: () => Promise<void>;
  connect: (deviceId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useADB(): UseADBReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { devices, addDevice, setDeviceConnected } = useDeviceStore();

  const refreshDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const adbDevices: DeviceInfo[] = await listADBDevices();
      // Device list is informational; actual device management via deviceStore
      console.log('ADB devices:', adbDevices);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async (deviceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await connectADB(deviceId);
      if (result.success) {
        setDeviceConnected(deviceId, true);
      } else {
        setError(result.error || 'Failed to connect');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [setDeviceConnected]);

  return {
    refreshDevices,
    connect,
    loading,
    error,
  };
}

export default useADB;
