import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Session } from '../types';
import { colors, radius, spacing } from '../theme';
import { formatRelative } from '../utils/format';

type Props = {
  exerciseId: string;
  lastSession: Session | null;
};

export const LastSessionGhost: React.FC<Props> = ({ exerciseId, lastSession }) => {
  const { t } = useTranslation();
  if (!lastSession || !lastSession.completedAt) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{t('components.lastSessionLabel')}</Text>
        <Text style={styles.value}>{t('components.lastSessionFirst')}</Text>
      </View>
    );
  }
  const ex = lastSession.exercises.find((e) => e.exerciseId === exerciseId);
  const working = ex?.sets.filter((s) => s.done && !s.warmup) ?? [];
  if (working.length === 0) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{t('components.lastSessionLabel')}</Text>
        <Text style={styles.value}>{t('components.lastSessionNone')}</Text>
      </View>
    );
  }
  const top = working.reduce(
    (b, s) => (s.weight > b.weight ? s : b),
    working[0],
  );
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{t('components.lastSessionLabel')}</Text>
      <Text style={styles.value}>
        {t('components.lastSessionValue', {
          sets: working.length,
          reps: top.reps,
          weight: top.weight,
        })}
      </Text>
      <Text style={styles.ago}>{formatRelative(lastSession.completedAt)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: spacing.sm,
    flex: 1,
  },
  ago: { color: colors.textMuted, fontSize: 11 },
});
