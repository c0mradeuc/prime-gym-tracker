import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { muscleGroupById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { colors, radius, spacing } from '../theme';
import { sessionDurationMinutes, sessionVolume } from '../utils/volume';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const sessions = useHistoryStore((s) => s.sessions);
  const data = useMemo(
    () => [...sessions].sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    [sessions],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerStyle={
          data.length === 0
            ? styles.emptyWrap
            : { padding: spacing.lg, paddingBottom: spacing.xxl }
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No sessions yet. Complete a training to see it here.
          </Text>
        }
        renderItem={({ item }) => {
          const date = item.completedAt ?? item.startedAt;
          const volume = sessionVolume(item);
          const duration = sessionDurationMinutes(item);
          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('SessionDetail', { sessionId: item.id })
              }
            >
              <View style={styles.rowHeader}>
                <Text style={styles.date}>
                  {format(date, 'EEE, MMM d')}
                </Text>
                <Text style={styles.time}>{format(date, 'HH:mm')}</Text>
              </View>
              <Text style={styles.muscles}>
                {item.muscleGroups
                  .map((m) => muscleGroupById(m)?.name)
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
              <View style={styles.metrics}>
                <Text style={styles.metric}>{Math.round(volume)} kg vol</Text>
                <Text style={styles.metric}>{duration} min</Text>
                <Text style={styles.metric}>
                  {item.exercises.length} ex
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  empty: { color: colors.textMuted, textAlign: 'center' },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: { color: colors.text, fontWeight: '700', fontSize: 16 },
  time: { color: colors.textMuted, fontSize: 13 },
  muscles: { color: colors.text, marginTop: spacing.xs, fontSize: 14 },
  metrics: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  metric: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
