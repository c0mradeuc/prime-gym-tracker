import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrainingHeatmap } from '../components/TrainingHeatmap';
import { muscleGroupById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { colors, elevation, fontFamily, radius, spacing, type } from '../theme';
import { formatDate } from '../utils/format';
import { sessionDurationMinutes, sessionVolume } from '../utils/volume';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
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
        ListHeaderComponent={data.length > 0 ? <TrainingHeatmap /> : null}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('history.empty')}</Text>
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
                  {formatDate(date, 'EEE, MMM d')}
                </Text>
                <Text style={styles.time}>{formatDate(date, 'HH:mm')}</Text>
              </View>
              <Text style={styles.muscles}>
                {item.muscleGroups
                  .map((m) => t(`muscle.${m}`))
                  .join(' • ')}
              </Text>
              <View style={styles.metrics}>
                <Text style={styles.metric}>
                  {t('history.kgVol', { value: Math.round(volume) })}
                </Text>
                <Text style={styles.metric}>
                  {t('history.minutes', { value: duration })}
                </Text>
                <Text style={styles.metric}>
                  {t('history.exCount', { count: item.exercises.length })}
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
  empty: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...elevation(1),
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...type.bodyLg,
    fontFamily: fontFamily.bold,
  },
  time: { ...type.caption },
  muscles: {
    ...type.body,
    marginTop: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  metric: {
    ...type.caption,
    fontFamily: fontFamily.semibold,
  },
});
