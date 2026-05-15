import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
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
  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: prBadge
            ? colors.warning
            : expanded
            ? colors.primary
            : colors.border,
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.row}>
        <Text style={styles.idx}>
          {set.warmup ? t('components.setWarmupShort') : `#${index + 1}`}
        </Text>
        {set.warmup ? <View style={styles.warmupBadge}><Text style={styles.warmupBadgeText}>{t('components.setWarmupBadge')}</Text></View> : null}
        {prBadge ? (
          <View style={styles.prBadge}>
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
          style={[
            styles.check,
            { backgroundColor: set.done ? colors.success : 'transparent' },
          ]}
        >
          <Text style={styles.checkText}>{set.done ? '✓' : ''}</Text>
        </Pressable>
      </Pressable>
      {expanded ? (
        <View style={styles.editor}>
          {children}
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>{t('components.deleteSet')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
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
    color: colors.textMuted,
    width: 36,
    fontWeight: '700',
  },
  warmupBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  warmupBadgeText: {
    color: '#1A1D24',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prBadge: {
    backgroundColor: 'rgba(244,183,64,0.18)',
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
    fontWeight: '800',
  },
  cell: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  unit: { color: colors.textMuted, fontWeight: '400', fontSize: 13 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontWeight: '900' },
  editor: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  deleteText: { color: colors.danger, fontWeight: '600' },
});
