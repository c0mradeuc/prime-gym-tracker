export type MuscleGroupId =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'forearms';

export type MuscleGroup = {
  id: MuscleGroupId;
  name: string;
  emoji: string;
};

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export type SetRepScheme = {
  sets: number;
  reps: number;
  /** i18n key under the "scheme" namespace, e.g. "hyp_4x8" → t('scheme.hyp_4x8'). */
  labelKey: string;
};

export type BwRatio = { reps: number; ratio: number };

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroupId;
  equipment: Equipment;
  bwRatio?: BwRatio[];
  recommendedSchemes: SetRepScheme[];
};

export type SetEntry = {
  reps: number;
  weight: number;
  done: boolean;
  warmup?: boolean;
};

export type ExerciseInSession = {
  exerciseId: string;
  sets: SetEntry[];
};

export type Session = {
  id: string;
  startedAt: number;
  completedAt?: number;
  muscleGroups: MuscleGroupId[];
  exercises: ExerciseInSession[];
  routineId?: string;
};

export type MuscleCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms';

export type OneRmPoint = {
  date: number;
  oneRm: number;
  topWeight: number;
  topReps: number;
  sessionId: string;
};

export type PrType = 'weight' | 'reps' | 'volume';

export type PrRecord = {
  id: string;
  exerciseId: string;
  type: PrType;
  value: number;
  reps?: number;
  weight?: number;
  date: number;
  sessionId: string;
};

export type RoutineExercise = {
  exerciseId: string;
  schemeIndex: number;
  weight: number;
};

export type Routine = {
  id: string;
  name: string;
  createdAt: number;
  muscleGroups: MuscleGroupId[];
  exercises: RoutineExercise[];
};
