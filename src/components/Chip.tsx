import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export const Chip: React.FC<Props> = ({ label, selected, onPress, style }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceAlt,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? '#fff' : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: { fontSize: 14, fontWeight: '600' },
});
