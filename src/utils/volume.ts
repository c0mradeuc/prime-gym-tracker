import { Session } from '../types';

export const sessionVolume = (session: Session): number =>
  session.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce(
        (s, set) =>
          set.done && !set.warmup ? s + set.reps * set.weight : s,
        0,
      ),
    0,
  );

export const sessionDurationMinutes = (session: Session): number => {
  if (!session.completedAt) return 0;
  return Math.max(1, Math.round((session.completedAt - session.startedAt) / 60000));
};

export type ExerciseProgressionPoint = {
  date: number;
  topWeight: number;
  totalVolume: number;
  topReps: number;
};

export const exerciseProgression = (
  exerciseId: string,
  history: Session[],
): ExerciseProgressionPoint[] => {
  const points: ExerciseProgressionPoint[] = [];
  for (const session of history) {
    if (!session.completedAt) continue;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    const doneSets = ex.sets.filter((s) => s.done && !s.warmup);
    if (doneSets.length === 0) continue;
    const top = doneSets.reduce(
      (best, s) => (s.weight > best.weight ? s : best),
      doneSets[0],
    );
    const totalVolume = doneSets.reduce((sum, s) => sum + s.reps * s.weight, 0);
    points.push({
      date: session.completedAt,
      topWeight: top.weight,
      topReps: top.reps,
      totalVolume,
    });
  }
  return points;
};

export const personalRecord = (
  exerciseId: string,
  history: Session[],
): { weight: number; reps: number; date: number } | null => {
  let pr: { weight: number; reps: number; date: number } | null = null;
  for (const session of history) {
    if (!session.completedAt) continue;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const s of ex.sets) {
      if (!s.done || s.warmup) continue;
      if (!pr || s.weight > pr.weight) {
        pr = { weight: s.weight, reps: s.reps, date: session.completedAt };
      }
    }
  }
  return pr;
};

export const allLoggedExerciseIds = (history: Session[]): string[] => {
  const set = new Set<string>();
  for (const s of history) {
    for (const e of s.exercises) {
      if (e.sets.some((x) => x.done)) set.add(e.exerciseId);
    }
  }
  return Array.from(set);
};
