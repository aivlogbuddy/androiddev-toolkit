import { useState, useCallback } from 'react';
import { connectSerial, listSerialPorts, SerialConfig } from '../lib/tauri';
import { useDeviceStore } from '../stores/deviceStore';

export interface SerialPortInfo2 {
  port: string;
  baudRate: number;
}

export interface UseSerialReturn {
  refreshPorts: () => Promise<SerialPortInfo2[]>;
  connect: (deviceId: string, config: SerialConfig) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useSerial(): UseSerialReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setDeviceConnected } = useDeviceStore();

  const refreshPorts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ports = await listSerialPorts();
      // Convert string array to SerialPortInfo2 array
      // In a real implementation, we'd get more info from the backend
      const portInfos: SerialPortInfo2[] = ports.map((port) => ({
        port,
        baudRate: 9600, // default baud rate
      }));
      return portInfos;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(
    async (deviceId: string, config: SerialConfig): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await connectSerial(config);
        if (result.success && result.session_id) {
          setDeviceConnected(deviceId, true);
          return result.session_id;
        } else {
          setError(result.error || 'Failed to connect');
          return null;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setDeviceConnected]
  );

  return {
    refreshPorts,
    connect,
    loading,
    error,
  };
}

export default useSerial;