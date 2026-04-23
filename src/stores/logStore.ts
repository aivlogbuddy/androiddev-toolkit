import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  tag: string;
  message: string;
  deviceId: string;
}

export interface Filter {
  id: string;
  pattern: string;
  color: string;
  enabled: boolean;
  isRegex: boolean;
  isExclude: boolean;
}

interface LogStore {
  entries: LogEntry[];
  filters: Filter[];
  paused: boolean;
  addEntry: (entry: LogEntry) => void;
  addEntries: (entries: LogEntry[]) => void;
  clearEntries: () => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (id: string) => void;
  toggleFilter: (id: string) => void;
  setPaused: (paused: boolean) => void;
}

const MAX_ENTRIES = 10000;

export const useLogStore = create<LogStore>((set) => ({
  entries: [],
  filters: [],
  paused: false,
  addEntry: (entry) =>
    set((state) => ({
      entries: [...state.entries.slice(-MAX_ENTRIES), entry],
    })),
  addEntries: (newEntries) =>
    set((state) => ({
      entries: [...state.entries.slice(-MAX_ENTRIES + newEntries.length), ...newEntries].slice(-MAX_ENTRIES),
    })),
  clearEntries: () => set({ entries: [] }),
  addFilter: (filter) =>
    set((state) => ({ filters: [...state.filters, filter] })),
  removeFilter: (id) =>
    set((state) => ({ filters: state.filters.filter((f) => f.id !== id) })),
  toggleFilter: (id) =>
    set((state) => ({
      filters: state.filters.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    })),
  setPaused: (paused) => set({ paused }),
}));