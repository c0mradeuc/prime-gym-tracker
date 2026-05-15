import { PrRecord, PrType, Session, SetEntry } from '../types';

const newPrId = (sessionId: string, exerciseId: string, type: PrType, idx: number) =>
  `pr_${sessionId}_${exerciseId}_${type}_${idx}`;

type PriorStats = {
  maxWeight: number; // best single-set weight (any reps)
  maxRepsAtOrAbove: Map<number, number>; // weight -> max reps at any weight >= weight
  maxSingleSetVolume: number;
};

const buildPriorStats = (priorSessions: Session[], exerciseId: string): PriorStats => {
  const stats: PriorStats = {
    maxWeight: 0,
    maxRepsAtOrAbove: new Map(),
    maxSingleSetVolume: 0,
  };
  for (const s of priorSessions) {
    const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const set of ex.sets) {
      if (!set.done || set.warmup) continue;
      if (set.weight > stats.maxWeight) stats.maxWeight = set.weight;
      const vol = set.reps * set.weight;
      if (vol > stats.maxSingleSetVolume) stats.maxSingleSetVolume = vol;
      const cur = stats.maxRepsAtOrAbove.get(set.weight) ?? 0;
      if (set.reps > cur) stats.maxRepsAtOrAbove.set(set.weight, set.reps);
    }
  }
  return stats;
};

/**
 * For a given (exerciseId, weight) compute the max reps ever performed
 * at that weight or any heavier weight. Used as the threshold for a "reps PR".
 */
const maxRepsAtOrHeavier = (
  stats: PriorStats,
  weight: number,
): number => {
  let max = 0;
  for (const [w, r] of stats.maxRepsAtOrAbove) {
    if (w >= weight && r > max) max = r;
  }
  return max;
};

/**
 * Detect new PRs achieved in `session` versus all `priorSessions` (sessions
 * completed strictly before this one). Returns one PrRecord per PR axis
 * triggered by the best qualifying set.
 */
export const detectPrsForSession = (
  session: Session,
  priorSessions: Session[],
): PrRecord[] => {
  const out: PrRecord[] = [];
  const date = session.completedAt ?? session.startedAt;

  for (const ex of session.exercises) {
    const working = ex.sets.filter((s): s is SetEntry => s.done && !s.warmup);
    if (working.length === 0) continue;

    const prior = buildPriorStats(priorSessions, ex.exerciseId);

    // Weight PR: heaviest set in this session vs prior max
    const heaviest = working.reduce((b, s) => (s.weight > b.weight ? s : b), working[0]);
    if (heaviest.weight > prior.maxWeight && heaviest.weight > 0) {
      out.push({
        id: newPrId(session.id, ex.exerciseId, 'weight', 0),
        exerciseId: ex.exerciseId,
        type: 'weight',
        value: heaviest.weight,
        reps: heaviest.reps,
        date,
        sessionId: session.id,
      });
    }

    // Volume PR: best single-set volume vs prior max
    const bestVolSet = working.reduce(
      (b, s) => (s.reps * s.weight > b.reps * b.weight ? s : b),
      working[0],
    );
    const bestVol = bestVolSet.reps * bestVolSet.weight;
    if (bestVol > prior.maxSingleSetVolume && bestVol > 0) {
      out.push({
        id: newPrId(session.id, ex.exerciseId, 'volume', 0),
        exerciseId: ex.exerciseId,
        type: 'volume',
        value: bestVol,
        reps: bestVolSet.reps,
        weight: bestVolSet.weight,
        date,
        sessionId: session.id,
      });
    }

    // Reps PR: best reps in this session beats reps ever done at this weight or heavier
    const bestRepsSet = working.reduce(
      (b, s) => (s.reps > b.reps ? s : b),
      working[0],
    );
    const repsThreshold = maxRepsAtOrHeavier(prior, bestRepsSet.weight);
    if (bestRepsSet.reps > repsThreshold && bestRepsSet.reps > 0) {
      out.push({
        id: newPrId(session.id, ex.exerciseId, 'reps', 0),
        exerciseId: ex.exerciseId,
        type: 'reps',
        value: bestRepsSet.reps,
        weight: bestRepsSet.weight,
        date,
        sessionId: session.id,
      });
    }
  }

  return out;
};

/**
 * Pure check used in the active workout to "preview" if a single set
 * would set a PR right now. Returns the strongest PR axis it'd trigger,
 * or null. Pass the full history (excluding the active session).
 */
export const previewSetPr = (
  exerciseId: string,
  set: SetEntry,
  priorSessions: Session[],
): PrType | null => {
  if (!set.done || set.warmup || set.weight <= 0 || set.reps <= 0) return null;
  const prior = buildPriorStats(priorSessions, exerciseId);
  if (set.weight > prior.maxWeight) return 'weight';
  const vol = set.reps * set.weight;
  if (vol > prior.maxSingleSetVolume) return 'volume';
  const repsThreshold = maxRepsAtOrHeavier(prior, set.weight);
  if (set.reps > repsThreshold) return 'reps';
  return null;
};
