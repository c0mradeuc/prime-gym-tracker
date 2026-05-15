import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

export type Language = 'en' | 'es';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'es'];
export const DEFAULT_LANGUAGE: Language = 'es';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: 'v4',
});

export default i18n;
