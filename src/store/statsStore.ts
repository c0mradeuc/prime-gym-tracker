import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { OneRmPoint, PrRecord, Session } from '../types';
import { sessionTopOneRm } from '../utils/oneRm';
import { detectPrsForSession } from '../utils/prDetection';

type StatsState = {
  oneRmHistory: Record<string, OneRmPoint[]>;
  prs: PrRecord[];
  /** sessionIds we've already processed to keep processSession idempotent. */
  processedSessionIds: string[];

  processSession: (
    session: Session,
    priorSessions: Session[],
  ) => { newPrs: PrRecord[] };
  backfillFromHistory: (sessions: Session[]) => void;
  recomputeFromHistory: (sessions: Session[]) => void;
  clear: () => void;
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      oneRmHistory: {},
      prs: [],
      processedSessionIds: [],

      processSession: (session, priorSessions) => {
        const state = get();
        if (state.processedSessionIds.includes(session.id)) {
          return { newPrs: [] };
        }

        // 1RM points per exercise
        const newOneRm: Record<string, OneRmPoint[]> = {};
        for (const ex of session.exercises) {
          const point = sessionTopOneRm(session, ex.exerciseId);
          if (point) {
            newOneRm[ex.exerciseId] = [
              ...(state.oneRmHistory[ex.exerciseId] ?? []),
              point,
            ];
          }
        }

        // PR detection
        const newPrs = detectPrsForSession(session, priorSessions);

        set({
          oneRmHistory: { ...state.oneRmHistory, ...newOneRm },
          prs: [...state.prs, ...newPrs],
          processedSessionIds: [...state.processedSessionIds, session.id],
        });
        return { newPrs };
      },

      backfillFromHistory: (sessions) => {
        if (get().processedSessionIds.length > 0) return; // already initialised
        get().recomputeFromHistory(sessions);
      },

      recomputeFromHistory: (sessions) => {
        const ordered = [...sessions]
          .filter((s) => s.completedAt)
          .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));

        const oneRmHistory: Record<string, OneRmPoint[]> = {};
        const prs: PrRecord[] = [];
        const processed: string[] = [];
        for (let i = 0; i < ordered.length; i++) {
          const s = ordered[i];
          for (const ex of s.exercises) {
            const point = sessionTopOneRm(s, ex.exerciseId);
            if (point) {
              if (!oneRmHistory[ex.exerciseId]) oneRmHistory[ex.exerciseId] = [];
              oneRmHistory[ex.exerciseId].push(point);
            }
          }
          const prior = ordered.slice(0, i);
          prs.push(...detectPrsForSession(s, prior));
          processed.push(s.id);
        }
        set({ oneRmHistory, prs, processedSessionIds: processed });
      },

      clear: () =>
        set({ oneRmHistory: {}, prs: [], processedSessionIds: [] }),
    }),
    {
      name: 'gymtracker-stats',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
