import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Routine } from '../types';

const newId = () =>
  `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type RoutineState = {
  routines: Routine[];
  addRoutine: (input: Omit<Routine, 'id' | 'createdAt'>) => Routine;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  getRoutine: (id: string) => Routine | undefined;
};

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      addRoutine: (input) => {
        const r: Routine = { ...input, id: newId(), createdAt: Date.now() };
        set((s) => ({ routines: [r, ...s.routines] }));
        return r;
      },
      updateRoutine: (id, patch) =>
        set((s) => ({
          routines: s.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteRoutine: (id) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),
      getRoutine: (id) => get().routines.find((r) => r.id === id),
    }),
    {
      name: 'gymtracker-routines',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
