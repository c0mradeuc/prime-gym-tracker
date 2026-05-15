import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { exerciseById } from '../data/catalog';
import {
  ExerciseInSession,
  MuscleGroupId,
  SetEntry,
  SetRepScheme,
  Session,
} from '../types';
import { suggestWeight } from '../utils/weight';
import { useHistoryStore } from './historyStore';
import { useStatsStore } from './statsStore';

const newId = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const buildSets = (scheme: SetRepScheme, weight: number): SetEntry[] =>
  Array.from({ length: scheme.sets }, () => ({
    reps: scheme.reps,
    weight,
    done: false,
  }));

type WorkoutState = {
  current: Session | null;

  startSession: (
    muscleGroups: MuscleGroupId[],
    exercises: { exerciseId: string; scheme: SetRepScheme; weight: number }[],
    routineId?: string,
  ) => void;

  addExercise: (exerciseId: string, scheme: SetRepScheme, weight?: number) => void;
  removeExercise: (exerciseId: string) => void;
  addMuscleGroup: (mg: MuscleGroupId) => void;
  removeMuscleGroup: (mg: MuscleGroupId) => void;

  reorderExercises: (newOrder: string[]) => void;

  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  updateSet: (
    exerciseId: string,
    setIndex: number,
    patch: Partial<SetEntry>,
  ) => void;
  toggleSetDone: (exerciseId: string, setIndex: number) => void;

  completeSession: () => void;
  discardSession: () => void;
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      current: null,

      startSession: (muscleGroups, exercises, routineId) => {
        const session: Session = {
          id: newId(),
          startedAt: Date.now(),
          muscleGroups: [...muscleGroups],
          exercises: exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: buildSets(e.scheme, e.weight),
          })),
          routineId,
        };
        set({ current: session });
      },

      addExercise: (exerciseId, scheme, weight) => {
        const cur = get().current;
        if (!cur) return;
        const ex = exerciseById(exerciseId);
        const history = useHistoryStore.getState().sessions;
        const w =
          weight ?? suggestWeight(exerciseId, scheme.reps, history);
        const newEx: ExerciseInSession = {
          exerciseId,
          sets: buildSets(scheme, w),
        };
        const muscleGroups = cur.muscleGroups.includes(
          ex?.muscleGroup as MuscleGroupId,
        )
          ? cur.muscleGroups
          : [...cur.muscleGroups, ex?.muscleGroup as MuscleGroupId];
        set({
          current: {
            ...cur,
            muscleGroups,
            exercises: [...cur.exercises, newEx],
          },
        });
      },

      removeExercise: (exerciseId) => {
        const cur = get().current;
        if (!cur) return;
        set({
          current: {
            ...cur,
            exercises: cur.exercises.filter((e) => e.exerciseId !== exerciseId),
          },
        });
      },

      addMuscleGroup: (mg) => {
        const cur = get().current;
        if (!cur) return;
        if (cur.muscleGroups.includes(mg)) return;
        set({ current: { ...cur, muscleGroups: [...cur.muscleGroups, mg] } });
      },

      removeMuscleGroup: (mg) => {
        const cur = get().current;
        if (!cur) return;
        set({
          current: {
            ...cur,
            muscleGroups: cur.muscleGroups.filter((m) => m !== mg),
            exercises: cur.exercises.filter((e) => {
              const ex = exerciseById(e.exerciseId);
              return ex?.muscleGroup !== mg;
            }),
          },
        });
      },

      reorderExercises: (newOrder) => {
        const cur = get().current;
        if (!cur) return;
        const byId = new Map(cur.exercises.map((e) => [e.exerciseId, e]));
        const reordered = newOrder
          .map((id) => byId.get(id))
          .filter((e): e is ExerciseInSession => !!e);
        // Append any not in newOrder (defensive)
        for (const e of cur.exercises) {
          if (!newOrder.includes(e.exerciseId)) reordered.push(e);
        }
        set({ current: { ...cur, exercises: reordered } });
      },

      addSet: (exerciseId) => {
        const cur = get().current;
        if (!cur) return;
        set({
          current: {
            ...cur,
            exercises: cur.exercises.map((e) => {
              if (e.exerciseId !== exerciseId) return e;
              const last = e.sets[e.sets.length - 1];
              const next: SetEntry = last
                ? { reps: last.reps, weight: last.weight, done: false }
                : { reps: 8, weight: 0, done: false };
              return { ...e, sets: [...e.sets, next] };
            }),
          },
        });
      },

      removeSet: (exerciseId, setIndex) => {
        const cur = get().current;
        if (!cur) return;
        set({
          current: {
            ...cur,
            exercises: cur.exercises.map((e) =>
              e.exerciseId === exerciseId
                ? { ...e, sets: e.sets.filter((_, i) => i !== setIndex) }
                : e,
            ),
          },
        });
      },

      updateSet: (exerciseId, setIndex, patch) => {
        const cur = get().current;
        if (!cur) return;
        set({
          current: {
            ...cur,
            exercises: cur.exercises.map((e) =>
              e.exerciseId === exerciseId
                ? {
                    ...e,
                    sets: e.sets.map((s, i) =>
                      i === setIndex ? { ...s, ...patch } : s,
                    ),
                  }
                : e,
            ),
          },
        });
      },

      toggleSetDone: (exerciseId, setIndex) => {
        const cur = get().current;
        if (!cur) return;
        set({
          current: {
            ...cur,
            exercises: cur.exercises.map((e) =>
              e.exerciseId === exerciseId
                ? {
                    ...e,
                    sets: e.sets.map((s, i) =>
                      i === setIndex ? { ...s, done: !s.done } : s,
                    ),
                  }
                : e,
            ),
          },
        });
      },

      completeSession: () => {
        const cur = get().current;
        if (!cur) return;
        const completed: Session = { ...cur, completedAt: Date.now() };
        const priorSessions = useHistoryStore.getState().sessions;
        useHistoryStore.getState().addSession(completed);
        useStatsStore.getState().processSession(completed, priorSessions);
        set({ current: null });
      },

      discardSession: () => set({ current: null }),
    }),
    {
      name: 'gymtracker-workout',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
