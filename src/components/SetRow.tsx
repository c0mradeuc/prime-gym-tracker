import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontFamily, radius, spacing, type } from '../theme';
import { PrType, SetEntry } from '../types';

type Props = {
  index: number;
  set: SetEntry;
  expanded: boolean;
  onPress: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  prBadge?: PrType | null;
  children?: React.ReactNode;
};

export const SetRow: React.FC<Props> = ({
  index,
  set,
  expanded,
  onPress,
  onToggleDone,
  onDelete,
  prBadge,
  children,
}) => {
  const { t } = useTranslation();
  const prLabel: Record<PrType, string> = {
    weight: t('components.prWeight'),
    reps: t('components.prReps'),
    volume: t('components.prVolume'),
  };

  const checkScale = useSharedValue(set.done ? 1 : 0);
  useEffect(() => {
    checkScale.value = withSpring(set.done ? 1 : 0, {
      damping: 12,
      stiffness: 180,
    });
  }, [set.done, checkScale]);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const borderColor = prBadge
    ? colors.warning
    : expanded
    ? colors.primary
    : 'transparent';

  return (
    <View style={[styles.wrap, { borderColor }]}>
      <Pressable onPress={onPress} style={styles.row}>
        <Text style={styles.idx}>
          {set.warmup ? t('components.setWarmupShort') : `#${index + 1}`}
        </Text>
        {set.warmup ? (
          <View style={styles.warmupBadge}>
            <Ionicons name="flame" size={10} color="#1A1D24" />
            <Text style={styles.warmupBadgeText}>
              {t('components.setWarmupBadge')}
            </Text>
          </View>
        ) : null}
        {prBadge ? (
          <View style={styles.prBadge}>
            <Ionicons name="trophy" size={10} color={colors.warning} />
            <Text style={styles.prBadgeText}>{prLabel[prBadge]}</Text>
          </View>
        ) : null}
        <Text style={styles.cell}>
          {set.reps} <Text style={styles.unit}>{t('components.setReps')}</Text>
        </Text>
        <Text style={styles.cell}>
          {set.weight} <Text style={styles.unit}>{t('components.setKg')}</Text>
        </Text>
        <Pressable
          onPress={onToggleDone}
          hitSlop={6}
          style={[
            styles.check,
            {
              backgroundColor: set.done ? colors.success : 'transparent',
              borderColor: set.done ? colors.success : colors.border,
            },
          ]}
        >
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark" size={20} color={colors.bg} />
          </Animated.View>
        </Pressable>
      </Pressable>
      {expanded ? (
        <View style={styles.editor}>
          {children}
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons
              name="trash-outline"
              size={14}
              color={colors.danger}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.deleteText}>{t('components.deleteSet')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  idx: {
    ...type.body,
    color: colors.textMuted,
    width: 36,
    fontFamily: fontFamily.bold,
  },
  warmupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warning,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  warmupBadgeText: {
    color: '#1A1D24',
    fontSize: 10,
    fontFamily: fontFamily.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  prBadgeText: {
    color: colors.warning,
    fontSize: 10,
    fontFamily: fontFamily.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cell: {
    flex: 1,
    ...type.bodyLg,
    fontFamily: fontFamily.semibold,
  },
  unit: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editor: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  deleteText: {
    ...type.caption,
    color: colors.danger,
    fontFamily: fontFamily.semibold,
  },
});
