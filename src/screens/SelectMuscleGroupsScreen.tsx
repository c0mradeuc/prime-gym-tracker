import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { MUSCLE_GROUPS } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { useHistoryStore } from '../store/historyStore';
import { colors, spacing } from '../theme';
import { MuscleGroupId } from '../types';
import { daysSinceLastTrainedByGroup } from '../utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectMuscleGroups'>;

export const SelectMuscleGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const selected = useDraftStore((s) => s.muscleGroups);
  const setMuscleGroups = useDraftStore((s) => s.setMuscleGroups);
  const mode = useDraftStore((s) => s.mode);
  const sessions = useHistoryStore((s) => s.sessions);
  const daysByGroup = useMemo(
    () => daysSinceLastTrainedByGroup(sessions),
    [sessions],
  );

  const formatDays = (days: number | undefined): string => {
    if (days === undefined) return t('builder.dayNew');
    if (days === 0) return t('builder.dayToday');
    if (days > 5) return t('builder.daysAgoWarn', { days });
    return t('builder.daysAgo', { days });
  };

  const toggle = (id: MuscleGroupId) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setMuscleGroups(next);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('builder.muscleTitle')}</Text>
        <Text style={styles.subtitle}>
          {mode === 'routine'
            ? t('builder.muscleSubtitleRoutine')
            : t('builder.muscleSubtitleSession')}
        </Text>
        <View style={styles.chipsWrap}>
          {MUSCLE_GROUPS.map((mg) => (
            <Chip
              key={mg.id}
              label={`${mg.emoji} ${t(`muscle.${mg.id}`)} ${formatDays(daysByGroup[mg.id])}`}
              selected={selected.includes(mg.id)}
              onPress={() => toggle(mg.id)}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={t('builder.next', { count: selected.length })}
          disabled={selected.length === 0}
          onPress={() => navigation.navigate('SelectExercises')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
