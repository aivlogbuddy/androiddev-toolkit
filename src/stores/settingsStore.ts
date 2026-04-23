import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SettingsStore {
  theme: 'light' | 'dark';
  logSavePath: string;
  logFileNameFormat: string;
  clipboardSync: 'bidirectional' | 'unidirectional' | 'disabled';
  autoReconnect: boolean;
  reconnectInterval: number;
  reconnectMaxRetries: number;
  setTheme: (theme: 'light' | 'dark') => void;
  setLogSavePath: (path: string) => void;
  setLogFileNameFormat: (format: string) => void;
  setClipboardSync: (sync: 'bidirectional' | 'unidirectional' | 'disabled') => void;
  setAutoReconnect: (auto: boolean) => void;
  setReconnectInterval: (interval: number) => void;
  setReconnectMaxRetries: (maxRetries: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      logSavePath: '',
      logFileNameFormat: 'device_log_%Y%m%d_%H%M%S.txt',
      clipboardSync: 'bidirectional',
      autoReconnect: true,
      reconnectInterval: 5000,
      reconnectMaxRetries: 3,
      setTheme: (theme) => set({ theme }),
      setLogSavePath: (logSavePath) => set({ logSavePath }),
      setLogFileNameFormat: (logFileNameFormat) => set({ logFileNameFormat }),
      setClipboardSync: (clipboardSync) => set({ clipboardSync }),
      setAutoReconnect: (autoReconnect) => set({ autoReconnect }),
      setReconnectInterval: (reconnectInterval) => set({ reconnectInterval }),
      setReconnectMaxRetries: (reconnectMaxRetries) => set({ reconnectMaxRetries }),
    }),
    {
      name: 'androiddev-toolkit-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);