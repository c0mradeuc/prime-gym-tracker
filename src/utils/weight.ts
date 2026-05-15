import { exerciseById } from '../data/catalog';
import { useProfileStore } from '../store/profileStore';
import { Exercise, Session } from '../types';

/** Default used when the user hasn't set their bodyweight in Settings. */
export const BODYWEIGHT_KG = 90;

export const roundToIncrement = (value: number, increment = 2.5): number => {
  return Math.round(value / increment) * increment;
};

const findLastWeight = (
  exerciseId: string,
  history: Session[],
): number | null => {
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || ex.sets.length === 0) continue;
    const top = ex.sets.reduce((m, s) => (s.weight > m ? s.weight : m), 0);
    if (top > 0) return top;
  }
  return null;
};

export const suggestWeight = (
  exerciseId: string,
  reps: number,
  history: Session[],
  bodyweight: number = useProfileStore.getState().weight || BODYWEIGHT_KG,
): number => {
  const last = findLastWeight(exerciseId, history);
  if (last !== null) return last;

  const ex = exerciseById(exerciseId);
  if (!ex) return 0;

  if (ex.equipment === 'bodyweight') return 0;

  if (ex.bwRatio && ex.bwRatio.length > 0) {
    const closest = ex.bwRatio.reduce((best, r) =>
      Math.abs(r.reps - reps) < Math.abs(best.reps - reps) ? r : best,
    );
    return roundToIncrement(bodyweight * closest.ratio, 2.5);
  }

  return ex.equipment === 'barbell' ? 20 : 5;
};

export const equipmentIncrement = (ex: Exercise | undefined): number => {
  if (!ex) return 2.5;
  if (ex.equipment === 'machine' || ex.equipment === 'cable') return 5;
  return 2.5;
};
