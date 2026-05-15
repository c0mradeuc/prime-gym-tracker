import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { exerciseById, muscleGroupById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useStatsStore } from '../store/statsStore';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseList'>;

export const ExerciseListScreen: React.FC<Props> = ({ navigation }) => {
  const oneRmHistory = useStatsStore((s) => s.oneRmHistory);

  const items = useMemo(() => {
    const ids = Object.keys(oneRmHistory).filter(
      (id) => (oneRmHistory[id]?.length ?? 0) > 0,
    );
    return ids
      .map((id) => {
        const ex = exerciseById(id);
        const points = oneRmHistory[id];
        const latest = points.reduce(
          (b, p) => (p.date > b.date ? p : b),
          points[0],
        );
        return { id, ex, latest, count: points.length };
      })
      .sort((a, b) => b.latest.date - a.latest.date);
  }, [oneRmHistory]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={
          items.length === 0
            ? styles.emptyWrap
            : { padding: spacing.lg, paddingBottom: spacing.xxl }
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No exercises logged yet. Complete a session to start tracking
            progression per exercise.
          </Text>
        }
        renderItem={({ item }) => {
          const mg = item.ex ? muscleGroupById(item.ex.muscleGroup) : null;
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('ExerciseDetail', { exerciseId: item.id })
              }
              style={styles.row}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.ex?.name ?? item.id}
                </Text>
                <Text style={styles.sub}>
                  {mg ? `${mg.emoji} ${mg.name} · ` : ''}
                  {item.count} session{item.count === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.metric}>
                {Math.round(item.latest.oneRm)} kg 1RM
              </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  metric: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});
