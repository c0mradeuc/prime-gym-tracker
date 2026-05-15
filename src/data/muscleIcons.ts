import { ImageSourcePropType } from 'react-native';
import { MuscleGroupId } from '../types';

// Custom muscle-group icons. Missing entries fall back to emoji in the UI.
// leg.png shows the hamstrings (rear of upper leg). Quads has no dedicated
// icon yet — falls back to emoji.
// trapezius.png exists in /assets but the catalog has no `traps` category,
// so it is unused.
export const MUSCLE_ICONS: Partial<Record<MuscleGroupId, ImageSourcePropType>> =
  {
    chest: require('../../assets/muscle-groups/pectorals.png'),
    back: require('../../assets/muscle-groups/lats.png'),
    shoulders: require('../../assets/muscle-groups/shoulder.png'),
    biceps: require('../../assets/muscle-groups/biceps.png'),
    triceps: require('../../assets/muscle-groups/triceps.png'),
    hamstrings: require('../../assets/muscle-groups/leg.png'),
    glutes: require('../../assets/muscle-groups/gluteus.png'),
    calves: require('../../assets/muscle-groups/calves.png'),
    abs: require('../../assets/muscle-groups/abdominal.png'),
  };
