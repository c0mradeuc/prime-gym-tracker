import { format, formatDistanceToNowStrict } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useProfileStore } from '../store/profileStore';

const dateLocales = { en: enUS, es };

const activeLocale = () => dateLocales[useProfileStore.getState().language];

export const formatDate = (date: Date | number, pattern: string): string =>
  format(date, pattern, { locale: activeLocale() });

export const formatRelative = (date: Date | number): string =>
  formatDistanceToNowStrict(date, { locale: activeLocale(), addSuffix: true });
