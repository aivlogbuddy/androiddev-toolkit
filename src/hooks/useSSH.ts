import { useState, useCallback } from 'react';
import { useDeviceStore } from '../stores/deviceStore';

export interface SshConfig {
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: string;
}

interface UseSSHReturn {
  connect: (deviceId: string, config: SshConfig) => Promise<string | null>;
  disconnect: (deviceId: string, sessionId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useSSH(): UseSSHReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDeviceConnected = useDeviceStore((state) => state.setDeviceConnected);

  const connect = useCallback(
    async (deviceId: string, config: SshConfig): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        // Placeholder: actual SSH connection logic in Task 12
        // Simulate connection delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate a mock session ID
        const sessionId = `ssh-session-${Date.now()}`;

        // Update device connection status
        setDeviceConnected(deviceId, true);

        setLoading(false);
        return sessionId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [setDeviceConnected]
  );

  const disconnect = useCallback(
    async (deviceId: string, sessionId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Placeholder: actual SSH disconnect logic in Task 12
        // Simulate disconnect delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Update device connection status
        setDeviceConnected(deviceId, false);

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Disconnect failed';
        setError(errorMessage);
        setLoading(false);
      }
    },
    [setDeviceConnected]
  );

  return {
    connect,
    disconnect,
    loading,
    error,
  };
}

export default useSSH;
