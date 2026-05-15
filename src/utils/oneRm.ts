import { OneRmPoint, Session } from '../types';

export const epley1Rm = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

export const sessionTopOneRm = (
  session: Session,
  exerciseId: string,
): OneRmPoint | null => {
  const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex) return null;
  const working = ex.sets.filter((s) => s.done && !s.warmup);
  if (working.length === 0) return null;
  let best = { oneRm: -1, topWeight: 0, topReps: 0 };
  for (const s of working) {
    const v = epley1Rm(s.weight, s.reps);
    if (v > best.oneRm) best = { oneRm: v, topWeight: s.weight, topReps: s.reps };
  }
  if (best.oneRm <= 0) return null;
  return {
    date: session.completedAt ?? session.startedAt,
    oneRm: +best.oneRm.toFixed(2),
    topWeight: best.topWeight,
    topReps: best.topReps,
    sessionId: session.id,
  };
};

export const PRIMARY_LIFT_CANDIDATES = [
  'bench-press',
  'back-squat',
  'deadlift',
  'ohp',
];

/** Pick the candidate with the most logged sessions; ties broken by most recent. */
export const pickPrimaryLift = (
  oneRmHistory: Record<string, OneRmPoint[]>,
): string | null => {
  let best: { id: string; count: number; latest: number } | null = null;
  for (const id of PRIMARY_LIFT_CANDIDATES) {
    const points = oneRmHistory[id] ?? [];
    if (points.length === 0) continue;
    const latest = points.reduce((m, p) => (p.date > m ? p.date : m), 0);
    if (
      !best ||
      points.length > best.count ||
      (points.length === best.count && latest > best.latest)
    ) {
      best = { id, count: points.length, latest };
    }
  }
  return best?.id ?? null;
};
