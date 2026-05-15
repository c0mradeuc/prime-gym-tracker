import { Exercise, MuscleGroup } from '../types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'chest', name: 'Chest', emoji: '🫁' },
  { id: 'back', name: 'Back', emoji: '🔙' },
  { id: 'shoulders', name: 'Shoulders', emoji: '🤷' },
  { id: 'biceps', name: 'Biceps', emoji: '💪' },
  { id: 'triceps', name: 'Triceps', emoji: '🦾' },
  { id: 'quads', name: 'Quads', emoji: '🦵' },
  { id: 'hamstrings', name: 'Hamstrings', emoji: '🦿' },
  { id: 'glutes', name: 'Glutes', emoji: '🍑' },
  { id: 'calves', name: 'Calves', emoji: '🐐' },
  { id: 'abs', name: 'Abs', emoji: '🧱' },
];

const HYP_4x6 = { sets: 4, reps: 6, labelKey: 'hyp_4x6' };
const HYP_4x8 = { sets: 4, reps: 8, labelKey: 'hyp_4x8' };
const HYP_3x10 = { sets: 3, reps: 10, labelKey: 'hyp_3x10' };
const HYP_4x10 = { sets: 4, reps: 10, labelKey: 'hyp_4x10' };
const HYP_3x12 = { sets: 3, reps: 12, labelKey: 'hyp_3x12' };
const END_3x15 = { sets: 3, reps: 15, labelKey: 'end_3x15' };
const END_3x20 = { sets: 3, reps: 20, labelKey: 'end_3x20' };

// Default scheme bundles. First entry = best hypertrophy (default selection),
// last entry = endurance/resistance.
const COMPOUND_BARBELL = [HYP_4x8, HYP_4x6, HYP_3x10, END_3x15];
const ACCESSORY = [HYP_3x10, HYP_4x8, HYP_3x12, END_3x15];
const ISOLATION = [HYP_3x12, HYP_3x10, HYP_4x10, END_3x15];
const BODYWEIGHT_PUSH = [HYP_4x8, HYP_3x10, HYP_3x12, END_3x15];
const HIGH_REP = [HYP_3x12, HYP_3x10, HYP_4x10, END_3x20];

export const EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 0.85 }, { reps: 8, ratio: 0.75 }, { reps: 10, ratio: 0.7 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'incline-db-press',
    name: 'Incline DB Press',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 8, ratio: 0.3 }, { reps: 10, ratio: 0.27 }, { reps: 12, ratio: 0.24 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'dips',
    name: 'Dips',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    recommendedSchemes: BODYWEIGHT_PUSH,
  },
  {
    id: 'cable-fly',
    name: 'Cable Fly',
    muscleGroup: 'chest',
    equipment: 'cable',
    bwRatio: [{ reps: 10, ratio: 0.2 }, { reps: 12, ratio: 0.18 }, { reps: 15, ratio: 0.15 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'pushup',
    name: 'Push-ups',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'decline-db-press',
    name: 'Decline DB Press',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 8, ratio: 0.32 }, { reps: 10, ratio: 0.28 }, { reps: 12, ratio: 0.25 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck',
    muscleGroup: 'chest',
    equipment: 'machine',
    bwRatio: [{ reps: 10, ratio: 0.6 }, { reps: 12, ratio: 0.55 }, { reps: 15, ratio: 0.5 }],
    recommendedSchemes: ISOLATION,
  },

  // BACK
  {
    id: 'pullup',
    name: 'Pull-ups',
    muscleGroup: 'back',
    equipment: 'bodyweight',
    recommendedSchemes: BODYWEIGHT_PUSH,
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'back',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 0.8 }, { reps: 8, ratio: 0.7 }, { reps: 10, ratio: 0.6 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    equipment: 'cable',
    bwRatio: [{ reps: 8, ratio: 0.7 }, { reps: 10, ratio: 0.6 }, { reps: 12, ratio: 0.55 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'seated-row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    equipment: 'cable',
    bwRatio: [{ reps: 8, ratio: 0.65 }, { reps: 10, ratio: 0.55 }, { reps: 12, ratio: 0.5 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 1.35 }, { reps: 8, ratio: 1.2 }, { reps: 10, ratio: 1.05 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    muscleGroup: 'back',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 0.75 }, { reps: 8, ratio: 0.65 }, { reps: 10, ratio: 0.55 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'single-arm-db-row',
    name: 'Single-Arm DB Row',
    muscleGroup: 'back',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 8, ratio: 0.35 }, { reps: 10, ratio: 0.3 }, { reps: 12, ratio: 0.27 }],
    recommendedSchemes: ACCESSORY,
  },

  // SHOULDERS
  {
    id: 'ohp',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 0.55 }, { reps: 8, ratio: 0.5 }, { reps: 10, ratio: 0.45 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'db-lateral-raise',
    name: 'DB Lateral Raise',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 10, ratio: 0.11 }, { reps: 12, ratio: 0.1 }, { reps: 15, ratio: 0.08 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'shoulders',
    equipment: 'cable',
    bwRatio: [{ reps: 10, ratio: 0.32 }, { reps: 12, ratio: 0.3 }, { reps: 15, ratio: 0.25 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 8, ratio: 0.22 }, { reps: 10, ratio: 0.2 }, { reps: 12, ratio: 0.18 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'db-shoulder-press',
    name: 'DB Shoulder Press',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 6, ratio: 0.28 }, { reps: 8, ratio: 0.25 }, { reps: 10, ratio: 0.22 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 10, ratio: 0.1 }, { reps: 12, ratio: 0.09 }, { reps: 15, ratio: 0.08 }],
    recommendedSchemes: ISOLATION,
  },

  // BICEPS
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscleGroup: 'biceps',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 0.4 }, { reps: 10, ratio: 0.35 }, { reps: 12, ratio: 0.3 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'biceps',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 10, ratio: 0.18 }, { reps: 12, ratio: 0.16 }, { reps: 15, ratio: 0.14 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'incline-db-curl',
    name: 'Incline DB Curl',
    muscleGroup: 'biceps',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 10, ratio: 0.15 }, { reps: 12, ratio: 0.13 }, { reps: 15, ratio: 0.11 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    muscleGroup: 'biceps',
    equipment: 'cable',
    bwRatio: [{ reps: 10, ratio: 0.32 }, { reps: 12, ratio: 0.28 }, { reps: 15, ratio: 0.24 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    muscleGroup: 'biceps',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 0.32 }, { reps: 10, ratio: 0.28 }, { reps: 12, ratio: 0.25 }],
    recommendedSchemes: ACCESSORY,
  },

  // TRICEPS
  {
    id: 'close-grip-bench',
    name: 'Close-Grip Bench',
    muscleGroup: 'triceps',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 0.65 }, { reps: 8, ratio: 0.6 }, { reps: 10, ratio: 0.55 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'rope-pushdown',
    name: 'Rope Pushdown',
    muscleGroup: 'triceps',
    equipment: 'cable',
    bwRatio: [{ reps: 10, ratio: 0.4 }, { reps: 12, ratio: 0.35 }, { reps: 15, ratio: 0.3 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'overhead-extension',
    name: 'Overhead Extension',
    muscleGroup: 'triceps',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 10, ratio: 0.25 }, { reps: 12, ratio: 0.22 }, { reps: 15, ratio: 0.18 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    muscleGroup: 'triceps',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 0.32 }, { reps: 10, ratio: 0.28 }, { reps: 12, ratio: 0.25 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'diamond-pushup',
    name: 'Diamond Push-up',
    muscleGroup: 'triceps',
    equipment: 'bodyweight',
    recommendedSchemes: HIGH_REP,
  },

  // QUADS
  {
    id: 'back-squat',
    name: 'Back Squat',
    muscleGroup: 'quads',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 1.1 }, { reps: 8, ratio: 1.0 }, { reps: 10, ratio: 0.9 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'quads',
    equipment: 'machine',
    bwRatio: [{ reps: 8, ratio: 1.8 }, { reps: 10, ratio: 1.6 }, { reps: 12, ratio: 1.4 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'quads',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 8, ratio: 0.3 }, { reps: 10, ratio: 0.25 }, { reps: 12, ratio: 0.22 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscleGroup: 'quads',
    equipment: 'machine',
    bwRatio: [{ reps: 10, ratio: 0.6 }, { reps: 12, ratio: 0.5 }, { reps: 15, ratio: 0.45 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    muscleGroup: 'quads',
    equipment: 'barbell',
    bwRatio: [{ reps: 6, ratio: 0.9 }, { reps: 8, ratio: 0.8 }, { reps: 10, ratio: 0.7 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    muscleGroup: 'quads',
    equipment: 'machine',
    bwRatio: [{ reps: 8, ratio: 1.4 }, { reps: 10, ratio: 1.25 }, { reps: 12, ratio: 1.1 }],
    recommendedSchemes: ACCESSORY,
  },

  // HAMSTRINGS
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'hamstrings',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 1.0 }, { reps: 10, ratio: 0.9 }, { reps: 12, ratio: 0.8 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'hamstrings',
    equipment: 'machine',
    bwRatio: [{ reps: 10, ratio: 0.45 }, { reps: 12, ratio: 0.4 }, { reps: 15, ratio: 0.35 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'good-morning',
    name: 'Good Morning',
    muscleGroup: 'hamstrings',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 0.55 }, { reps: 10, ratio: 0.5 }, { reps: 12, ratio: 0.45 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'stiff-leg-deadlift',
    name: 'Stiff-Leg Deadlift',
    muscleGroup: 'hamstrings',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 0.95 }, { reps: 10, ratio: 0.85 }, { reps: 12, ratio: 0.75 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'nordic-curl',
    name: 'Nordic Curl',
    muscleGroup: 'hamstrings',
    equipment: 'bodyweight',
    recommendedSchemes: BODYWEIGHT_PUSH,
  },

  // GLUTES
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'glutes',
    equipment: 'barbell',
    bwRatio: [{ reps: 8, ratio: 1.4 }, { reps: 10, ratio: 1.25 }, { reps: 12, ratio: 1.1 }],
    recommendedSchemes: COMPOUND_BARBELL,
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    muscleGroup: 'glutes',
    equipment: 'barbell',
    bwRatio: [{ reps: 10, ratio: 1.0 }, { reps: 12, ratio: 0.9 }, { reps: 15, ratio: 0.8 }],
    recommendedSchemes: ACCESSORY,
  },
  {
    id: 'cable-kickback',
    name: 'Cable Kickback',
    muscleGroup: 'glutes',
    equipment: 'cable',
    bwRatio: [{ reps: 10, ratio: 0.28 }, { reps: 12, ratio: 0.25 }, { reps: 15, ratio: 0.2 }],
    recommendedSchemes: ISOLATION,
  },
  {
    id: 'hip-abduction',
    name: 'Hip Abduction',
    muscleGroup: 'glutes',
    equipment: 'machine',
    bwRatio: [{ reps: 12, ratio: 0.55 }, { reps: 15, ratio: 0.5 }, { reps: 20, ratio: 0.45 }],
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'step-up',
    name: 'Step-Up',
    muscleGroup: 'glutes',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 10, ratio: 0.25 }, { reps: 12, ratio: 0.22 }, { reps: 15, ratio: 0.2 }],
    recommendedSchemes: ACCESSORY,
  },

  // CALVES
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'calves',
    equipment: 'machine',
    bwRatio: [{ reps: 10, ratio: 1.2 }, { reps: 12, ratio: 1.1 }, { reps: 15, ratio: 1.0 }],
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    muscleGroup: 'calves',
    equipment: 'machine',
    bwRatio: [{ reps: 10, ratio: 0.6 }, { reps: 12, ratio: 0.55 }, { reps: 15, ratio: 0.5 }],
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'donkey-calf-raise',
    name: 'Donkey Calf Raise',
    muscleGroup: 'calves',
    equipment: 'machine',
    bwRatio: [{ reps: 10, ratio: 1.3 }, { reps: 12, ratio: 1.15 }, { reps: 15, ratio: 1.0 }],
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'single-leg-calf-raise',
    name: 'Single-Leg Calf Raise',
    muscleGroup: 'calves',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 12, ratio: 0.25 }, { reps: 15, ratio: 0.22 }, { reps: 20, ratio: 0.18 }],
    recommendedSchemes: HIGH_REP,
  },

  // ABS
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'abs',
    equipment: 'bodyweight',
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscleGroup: 'abs',
    equipment: 'cable',
    bwRatio: [{ reps: 10, ratio: 0.5 }, { reps: 12, ratio: 0.45 }, { reps: 15, ratio: 0.4 }],
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'plank',
    name: 'Plank (sec)',
    muscleGroup: 'abs',
    equipment: 'bodyweight',
    recommendedSchemes: [
      { sets: 3, reps: 30, labelKey: 'hyp_3x30s' },
      { sets: 3, reps: 45, labelKey: 'hyp_3x45s' },
      { sets: 3, reps: 60, labelKey: 'hyp_3x60s' },
      { sets: 3, reps: 90, labelKey: 'end_3x90s' },
    ],
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: 'abs',
    equipment: 'dumbbell',
    bwRatio: [{ reps: 15, ratio: 0.1 }, { reps: 20, ratio: 0.08 }, { reps: 30, ratio: 0.06 }],
    recommendedSchemes: HIGH_REP,
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    muscleGroup: 'abs',
    equipment: 'bodyweight',
    recommendedSchemes: HIGH_REP,
  },
];

export const exerciseById = (id: string): Exercise | undefined =>
  EXERCISES.find((e) => e.id === id);

export const muscleGroupById = (id: string): MuscleGroup | undefined =>
  MUSCLE_GROUPS.find((m) => m.id === id);

export const exercisesByMuscleGroup = (mg: string): Exercise[] =>
  EXERCISES.filter((e) => e.muscleGroup === mg);
