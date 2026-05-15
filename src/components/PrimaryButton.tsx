import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontFamily, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

const palette: Record<
  Variant,
  { bg: string; fg: string; border?: string }
> = {
  primary: { bg: colors.primary, fg: '#fff' },
  success: { bg: colors.success, fg: colors.bg },
  danger: { bg: colors.danger, fg: '#fff' },
  secondary: { bg: colors.surfaceAlt, fg: colors.text },
  ghost: { bg: 'transparent', fg: colors.primary, border: colors.primarySoftBorder },
};

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
  style,
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const c = palette[variant];

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        android_ripple={
          variant === 'ghost'
            ? { color: colors.primarySoft, borderless: false }
            : { color: 'rgba(255,255,255,0.12)', borderless: false }
        }
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: c.bg,
            borderColor: c.border ?? 'transparent',
            borderWidth: c.border ? 1 : 0,
            opacity: disabled ? 0.4 : pressed && Platform.OS === 'ios' ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.inner}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={c.fg}
              style={{ marginRight: spacing.sm }}
            />
          ) : null}
          <Text style={[styles.label, { color: c.fg }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
