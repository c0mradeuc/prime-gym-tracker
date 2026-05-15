import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LANGUAGE, Language } from '../i18n';

type ProfileState = {
  name: string;
  age: number;
  /** Bodyweight in kg. 0 means "not set" — fall back to default in weight suggestions. */
  weight: number;
  /** Height in cm. 0 means "not set". */
  height: number;
  /** UI language. Defaults to Spanish on first launch. */
  language: Language;

  setName: (name: string) => void;
  setAge: (age: number) => void;
  setWeight: (weight: number) => void;
  setHeight: (height: number) => void;
  setLanguage: (language: Language) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      age: 0,
      weight: 0,
      height: 0,
      language: DEFAULT_LANGUAGE,

      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setWeight: (weight) => set({ weight }),
      setHeight: (height) => set({ height }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'gymtracker-profile',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Returns the user's bodyweight in kg, or `undefined` if not set. */
export const getBodyweightOrUndefined = (): number | undefined => {
  const w = useProfileStore.getState().weight;
  return w > 0 ? w : undefined;
};
