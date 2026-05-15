import { create } from 'zustand';
import { MuscleGroupId, Routine } from '../types';

export type DraftConfig = {
  exerciseId: string;
  schemeIndex: number;
  weight: number;
};

export type DraftMode = 'workout' | 'routine';

type DraftState = {
  mode: DraftMode;
  muscleGroups: MuscleGroupId[];
  exerciseIds: string[];
  configs: DraftConfig[];
  routineId?: string;
  routineName: string;

  reset: () => void;
  setMode: (mode: DraftMode) => void;
  setMuscleGroups: (ids: MuscleGroupId[]) => void;
  setExerciseIds: (ids: string[]) => void;
  ensureConfig: (
    exerciseId: string,
    defaults: Omit<DraftConfig, 'exerciseId'>,
  ) => void;
  upsertConfig: (exerciseId: string, patch: Partial<DraftConfig>) => void;
  loadFromRoutine: (routine: Routine) => void;
  setRoutineName: (name: string) => void;
};

const empty = {
  mode: 'workout' as DraftMode,
  muscleGroups: [] as MuscleGroupId[],
  exerciseIds: [] as string[],
  configs: [] as DraftConfig[],
  routineId: undefined,
  routineName: '',
};

/**
 * In-memory only — survives navigation between builder screens but resets
 * on app reload. Cleared explicitly when the user enters the flow from Home
 * or finishes (start training / save routine).
 */
export const useDraftStore = create<DraftState>((set, get) => ({
  ...empty,

  reset: () => set({ ...empty }),

  setMode: (mode) => set({ mode }),

  setMuscleGroups: (ids) => set({ muscleGroups: ids }),

  setExerciseIds: (ids) => {
    const keep = new Set(ids);
    set({
      exerciseIds: ids,
      configs: get().configs.filter((c) => keep.has(c.exerciseId)),
    });
  },

  ensureConfig: (exerciseId, defaults) =>
    set((s) => {
      if (s.configs.some((c) => c.exerciseId === exerciseId)) return s;
      return { configs: [...s.configs, { exerciseId, ...defaults }] };
    }),

  upsertConfig: (exerciseId, patch) =>
    set((s) => {
      const exists = s.configs.some((c) => c.exerciseId === exerciseId);
      if (!exists) {
        const base: DraftConfig = {
          exerciseId,
          schemeIndex: 0,
          weight: 0,
          ...patch,
        };
        return { configs: [...s.configs, base] };
      }
      return {
        configs: s.configs.map((c) =>
          c.exerciseId === exerciseId ? { ...c, ...patch } : c,
        ),
      };
    }),

  loadFromRoutine: (routine) =>
    set({
      muscleGroups: [...routine.muscleGroups],
      exerciseIds: routine.exercises.map((e) => e.exerciseId),
      configs: routine.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        schemeIndex: e.schemeIndex,
        weight: e.weight,
      })),
      routineId: routine.id,
      routineName: routine.name,
    }),

  setRoutineName: (name) => set({ routineName: name }),
}));
