import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import { useDeviceStore } from '../stores/deviceStore';

export interface SshConfig {
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'key';
  password?: string;
  privateKeyPath?: string;
}

interface UseSSHReturn {
  connect: (deviceId: string, config: SshConfig) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  disconnect: (deviceId: string, sessionId: string) => Promise<{ success: boolean; error?: string }>;
  exec: (sessionId: string, command: string) => Promise<{ success: boolean; output?: string; error?: string }>;
  loading: boolean;
  error: string | null;
}

export function useSSH(): UseSSHReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDeviceConnected = useDeviceStore((state) => state.setDeviceConnected);

  const connect = useCallback(
    async (deviceId: string, config: SshConfig): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const result = await invoke<{ success: boolean; session_id?: string; error?: string }>('connect_ssh', {
          config: {
            host: config.host,
            port: config.port || 22,
            username: config.username,
            auth_method: config.authMethod,
            password: config.password,
            key_path: config.privateKeyPath,
          },
        });

        if (result.success) {
          setDeviceConnected(deviceId, true);
          setLoading(false);
          return { success: true, sessionId: result.session_id };
        } else {
          setLoading(false);
          return { success: false, error: result.error || 'Connection failed' };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [setDeviceConnected]
  );

  const disconnect = useCallback(
    async (deviceId: string, sessionId: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const result = await invoke<{ success: boolean; error?: string }>('disconnect_ssh', { sessionId });
        setDeviceConnected(deviceId, false);
        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [setDeviceConnected]
  );

  const exec = useCallback(
    async (sessionId: string, command: string): Promise<{ success: boolean; output?: string; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const output = await invoke<string>('exec_ssh', { sessionId, command });
        setLoading(false);
        return { success: true, output };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  return {
    connect,
    disconnect,
    exec,
    loading,
    error,
  };
}

export default useSSH;