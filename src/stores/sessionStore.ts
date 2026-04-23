import { create } from 'zustand';

export interface Session {
  id: string;
  deviceId: string;
  type: 'ssh' | 'adb' | 'serial';
  title: string;
  createdAt: number;
}

interface SessionStore {
  sessions: Session[];
  activeSessionId: string | null;
  createSession: (session: Session) => void;
  closeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  activeSessionId: null,
  createSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  closeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
    })),
  setActiveSession: (id) => set({ activeSessionId: id }),
}));