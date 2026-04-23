import { create } from 'zustand';

export interface Device {
  id: string;
  name: string;
  type: 'ssh' | 'adb' | 'serial';
  group: string;
  host?: string;
  port?: number;
  username?: string;
  authMethod?: 'password' | 'key';
  serialPort?: string;
  baudRate?: number;
  connected: boolean;
}

interface DeviceStore {
  devices: Device[];
  selectedDeviceId: string | null;
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  selectDevice: (id: string | null) => void;
  setDeviceConnected: (id: string, connected: boolean) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [],
  selectedDeviceId: null,
  addDevice: (device) =>
    set((state) => ({ devices: [...state.devices, device] })),
  removeDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
      selectedDeviceId: state.selectedDeviceId === id ? null : state.selectedDeviceId,
    })),
  updateDevice: (id, updates) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  setDeviceConnected: (id, connected) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, connected } : d)),
    })),
}));