import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Session } from '../types';

type HistoryState = {
  sessions: Session[];
  addSession: (s: Session) => void;
  updateSession: (id: string, next: Session) => void;
  deleteSession: (id: string) => void;
  clearAll: () => void;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (s) =>
        set((state) => ({ sessions: [...state.sessions, s] })),
      updateSession: (id, next) =>
        set((state) => ({
          sessions: state.sessions.map((x) => (x.id === id ? next : x)),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((x) => x.id !== id),
        })),
      clearAll: () => set({ sessions: [] }),
    }),
    {
      name: 'gymtracker-history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
