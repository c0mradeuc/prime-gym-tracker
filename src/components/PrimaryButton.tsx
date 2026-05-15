import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
};

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}) => {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'success'
      ? colors.success
      : variant === 'danger'
      ? colors.danger
      : colors.surfaceAlt;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
