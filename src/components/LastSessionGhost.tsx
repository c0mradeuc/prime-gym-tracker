import { formatDistanceToNowStrict } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Session } from '../types';
import { colors, radius, spacing } from '../theme';

type Props = {
  exerciseId: string;
  lastSession: Session | null;
};

export const LastSessionGhost: React.FC<Props> = ({ exerciseId, lastSession }) => {
  if (!lastSession || !lastSession.completedAt) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>Last session</Text>
        <Text style={styles.value}>— first time</Text>
      </View>
    );
  }
  const ex = lastSession.exercises.find((e) => e.exerciseId === exerciseId);
  const working = ex?.sets.filter((s) => s.done && !s.warmup) ?? [];
  if (working.length === 0) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>Last session</Text>
        <Text style={styles.value}>— no logged sets</Text>
      </View>
    );
  }
  const top = working.reduce(
    (b, s) => (s.weight > b.weight ? s : b),
    working[0],
  );
  const ago = formatDistanceToNowStrict(lastSession.completedAt, {
    addSuffix: true,
  });
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Last session</Text>
      <Text style={styles.value}>
        {working.length}×{top.reps} @ {top.weight} kg
      </Text>
      <Text style={styles.ago}>{ago}</Text>
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
