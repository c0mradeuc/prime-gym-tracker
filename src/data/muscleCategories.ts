import { MuscleCategory, MuscleGroupId } from '../types';

export const MUSCLE_CATEGORY_TO_GROUPS: Record<MuscleCategory, MuscleGroupId[]> = {
  chest: ['chest'],
  back: ['back'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  shoulders: ['shoulders'],
  arms: ['biceps', 'triceps'],
};

export const MUSCLE_GROUP_TO_CATEGORY: Partial<
  Record<MuscleGroupId, MuscleCategory>
> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  biceps: 'arms',
  triceps: 'arms',
  quads: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  // abs and forearms intentionally omitted — not part of the 5-category dashboard view
};

export const MUSCLE_CATEGORY_LABEL: Record<MuscleCategory, string> = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
};

export const MUSCLE_CATEGORY_EMOJI: Record<MuscleCategory, string> = {
  chest: '🫁',
  back: '🔙',
  legs: '🦵',
  shoulders: '🤷',
  arms: '💪',
};

export const ALL_CATEGORIES: MuscleCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
];
