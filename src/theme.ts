import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  bg: '#0B0D11',
  surface: '#161A22',
  surfaceAlt: '#1F2430',
  surfaceHi: '#262B38',
  border: '#262B38',
  borderSubtle: '#1F2430',
  text: '#F4F5F7',
  textMuted: '#8A93A6',
  textFaint: '#5C667A',
  primary: '#4F8CFF',
  primaryPressed: '#3A75E0',
  primarySoft: 'rgba(79,140,255,0.14)',
  primarySoftBorder: 'rgba(79,140,255,0.32)',
  success: '#3FCF8E',
  successSoft: 'rgba(63,207,142,0.16)',
  danger: '#FF5C5C',
  dangerSoft: 'rgba(255,92,92,0.14)',
  warning: '#F4B740',
  warningSoft: 'rgba(244,183,64,0.18)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
};

export const type: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.text,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: colors.text,
  },
  bodyLg: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  bodyMuted: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  micro: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  buttonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: '#fff',
  },
  number: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: colors.text,
  },
};

export const elevation = (
  level: 1 | 2 | 3,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: level === 1 ? 0.18 : level === 2 ? 0.28 : 0.4,
      shadowOffset: { width: 0, height: level === 1 ? 2 : level === 2 ? 6 : 12 },
      shadowRadius: level === 1 ? 6 : level === 2 ? 14 : 22,
    },
    android: {
      elevation: level === 1 ? 2 : level === 2 ? 6 : 12,
    },
    default: {},
  }) ?? {};

export const card: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  ...elevation(1),
};
