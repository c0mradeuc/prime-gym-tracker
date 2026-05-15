import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, elevation, radius, spacing } from '../theme';

type Props = ViewProps & {
  padded?: boolean;
  tone?: 'default' | 'elevated' | 'subtle';
  accent?: 'primary' | 'success' | 'danger' | 'warning' | null;
};

const toneStyles: Record<NonNullable<Props['tone']>, ViewStyle> = {
  default: { backgroundColor: colors.surface, ...elevation(1) },
  elevated: { backgroundColor: colors.surfaceAlt, ...elevation(2) },
  subtle: { backgroundColor: colors.surface },
};

const accentColor = (a: Props['accent']) =>
  a === 'success'
    ? colors.success
    : a === 'danger'
    ? colors.danger
    : a === 'warning'
    ? colors.warning
    : a === 'primary'
    ? colors.primary
    : null;

export const Card: React.FC<Props> = ({
  padded = true,
  tone = 'default',
  accent = null,
  style,
  children,
  ...rest
}) => {
  const ac = accentColor(accent);
  return (
    <View
      style={[
        styles.base,
        toneStyles[tone],
        padded && styles.padded,
        ac ? { borderLeftWidth: 3, borderLeftColor: ac } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
});
