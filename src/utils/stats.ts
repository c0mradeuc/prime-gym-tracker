import { startOfWeek } from 'date-fns';
import { exerciseById } from '../data/catalog';
import {
  ALL_CATEGORIES,
  MUSCLE_GROUP_TO_CATEGORY,
} from '../data/muscleCategories';
import { MuscleCategory, OneRmPoint, Session } from '../types';

const MS_PER_DAY = 86_400_000;
const WEEK_OPTS = { weekStartsOn: 1 as const };

export const weekKey = (ms: number): number =>
  startOfWeek(ms, WEEK_OPTS).getTime();

const setVolume = (reps: number, weight: number) => reps * weight;

/** Total volume of all working (done, non-warmup) sets in a session. */
export const totalSessionVolume = (session: Session): number =>
  session.exercises.reduce(
    (a, ex) =>
      a +
      ex.sets.reduce(
        (s, set) =>
          set.done && !set.warmup ? s + setVolume(set.reps, set.weight) : s,
        0,
      ),
    0,
  );

/**
 * Sum working volume per exercise in a session, attributed to the exercise's
 * muscle category. Exercises whose group has no category (e.g. abs) are ignored.
 */
export const sessionVolumeByCategory = (
  session: Session,
): Record<MuscleCategory, number> => {
  const out: Record<MuscleCategory, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
  };
  for (const ex of session.exercises) {
    const meta = exerciseById(ex.exerciseId);
    if (!meta) continue;
    const cat = MUSCLE_GROUP_TO_CATEGORY[meta.muscleGroup];
    if (!cat) continue;
    let vol = 0;
    for (const s of ex.sets) {
      if (s.done && !s.warmup) vol += setVolume(s.reps, s.weight);
    }
    out[cat] += vol;
  }
  return out;
};

export const weeklyVolumeByCategory = (
  sessions: Session[],
  weekStartMs: number,
): Record<MuscleCategory, number> => {
  const totals: Record<MuscleCategory, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
  };
  for (const s of sessions) {
    if (!s.completedAt) continue;
    if (weekKey(s.completedAt) !== weekStartMs) continue;
    const v = sessionVolumeByCategory(s);
    for (const c of ALL_CATEGORIES) totals[c] += v[c];
  }
  return totals;
};

/** Count of completed working sets per category in a session. */
export const sessionSetsByCategory = (
  session: Session,
): Record<MuscleCategory, number> => {
  const out: Record<MuscleCategory, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
  };
  for (const ex of session.exercises) {
    const meta = exerciseById(ex.exerciseId);
    if (!meta) continue;
    const cat = MUSCLE_GROUP_TO_CATEGORY[meta.muscleGroup];
    if (!cat) continue;
    for (const s of ex.sets) {
      if (s.done && !s.warmup) out[cat] += 1;
    }
  }
  return out;
};

export const weeklySetsByCategory = (
  sessions: Session[],
  weekStartMs: number,
): Record<MuscleCategory, number> => {
  const totals: Record<MuscleCategory, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
  };
  for (const s of sessions) {
    if (!s.completedAt) continue;
    if (weekKey(s.completedAt) !== weekStartMs) continue;
    const v = sessionSetsByCategory(s);
    for (const c of ALL_CATEGORIES) totals[c] += v[c];
  }
  return totals;
};

export const weeklyTotalVolume = (
  sessions: Session[],
  weekStartMs: number,
): number => {
  let v = 0;
  for (const s of sessions) {
    if (!s.completedAt) continue;
    if (weekKey(s.completedAt) === weekStartMs) v += totalSessionVolume(s);
  }
  return v;
};

export const sessionsInWeek = (
  sessions: Session[],
  weekStartMs: number,
): Session[] =>
  sessions.filter(
    (s) => s.completedAt && weekKey(s.completedAt) === weekStartMs,
  );

/** Days since a session involving the category, per the 5 categories. */
export const daysSinceLastTrained = (
  sessions: Session[],
  now: number = Date.now(),
): Record<MuscleCategory, number | null> => {
  const out: Record<MuscleCategory, number | null> = {
    chest: null,
    back: null,
    legs: null,
    shoulders: null,
    arms: null,
  };
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const cats = new Set<MuscleCategory>();
    for (const ex of s.exercises) {
      const meta = exerciseById(ex.exerciseId);
      if (!meta) continue;
      const c = MUSCLE_GROUP_TO_CATEGORY[meta.muscleGroup];
      if (c) cats.add(c);
    }
    for (const c of cats) {
      const days = Math.floor((now - s.completedAt) / MS_PER_DAY);
      if (out[c] === null || days < (out[c] as number)) out[c] = days;
    }
  }
  return out;
};

/**
 * Days since a specific catalog muscle group was trained (used by
 * SelectMuscleGroupsScreen). null if never.
 */
export const daysSinceLastTrainedByGroup = (
  sessions: Session[],
  now: number = Date.now(),
): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const groups = new Set<string>();
    for (const ex of s.exercises) {
      const meta = exerciseById(ex.exerciseId);
      if (meta) groups.add(meta.muscleGroup);
    }
    const days = Math.floor((now - s.completedAt) / MS_PER_DAY);
    for (const g of groups) {
      if (!(g in out) || days < out[g]) out[g] = days;
    }
  }
  return out;
};

export type WoWDelta = {
  thisWeek: number;
  lastWeek: number;
  pct: number | null; // null if no data last week
};

export const weekOverWeekByCategory = (
  sessions: Session[],
  thisWeekStart: number,
): Record<MuscleCategory, WoWDelta> => {
  const lastWeekStart = thisWeekStart - 7 * MS_PER_DAY;
  const tw = weeklyVolumeByCategory(sessions, thisWeekStart);
  const lw = weeklyVolumeByCategory(sessions, lastWeekStart);
  const out = {} as Record<MuscleCategory, WoWDelta>;
  for (const c of ALL_CATEGORIES) {
    out[c] = {
      thisWeek: tw[c],
      lastWeek: lw[c],
      pct: lw[c] > 0 ? (tw[c] - lw[c]) / lw[c] : null,
    };
  }
  return out;
};

/**
 * Linear regression slope (kg per week) of an exercise's top weight over the
 * last `windowWeeks` weeks. Returns null if < 3 data points.
 */
export const overloadSlope = (
  oneRmHistory: OneRmPoint[],
  windowWeeks = 4,
  now: number = Date.now(),
): number | null => {
  const cutoff = now - windowWeeks * 7 * MS_PER_DAY;
  const points = oneRmHistory
    .filter((p) => p.date >= cutoff)
    .map((p) => ({ x: (p.date - cutoff) / (7 * MS_PER_DAY), y: p.topWeight }));
  if (points.length < 3) return null;
  const n = points.length;
  const xMean = points.reduce((a, p) => a + p.x, 0) / n;
  const yMean = points.reduce((a, p) => a + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - xMean) * (p.y - yMean);
    den += (p.x - xMean) ** 2;
  }
  if (den === 0) return null;
  return num / den;
};

/**
 * True if this week's total volume is < 60% of the average of the previous
 * 4 weeks' volumes. Requires at least 2 prior weeks with volume.
 */
export const isDeloadWeek = (
  sessions: Session[],
  thisWeekStart: number,
): { deload: boolean; pct: number | null } => {
  const prior: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const wk = thisWeekStart - i * 7 * MS_PER_DAY;
    const v = weeklyTotalVolume(sessions, wk);
    if (v > 0) prior.push(v);
  }
  if (prior.length < 2) return { deload: false, pct: null };
  const avg = prior.reduce((a, b) => a + b, 0) / prior.length;
  const cur = weeklyTotalVolume(sessions, thisWeekStart);
  if (avg === 0) return { deload: false, pct: null };
  const ratio = cur / avg;
  return { deload: ratio < 0.6, pct: ratio - 1 };
};

/** Get the most recent completed session containing this exercise. */
export const lastSessionWithExercise = (
  sessions: Session[],
  exerciseId: string,
  excludeSessionId?: string,
): Session | null => {
  let best: Session | null = null;
  for (const s of sessions) {
    if (!s.completedAt) continue;
    if (excludeSessionId && s.id === excludeSessionId) continue;
    if (!s.exercises.some((e) => e.exerciseId === exerciseId)) continue;
    if (!best || (s.completedAt > (best.completedAt ?? 0))) best = s;
  }
  return best;
};
