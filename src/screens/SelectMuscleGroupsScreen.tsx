import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { muscleGroupById } from '../data/catalog';
import { MUSCLE_ICONS } from '../data/muscleIcons';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { useHistoryStore } from '../store/historyStore';
import { colors, spacing, type } from '../theme';
import { MuscleGroupId } from '../types';
import { daysSinceLastTrainedByGroup } from '../utils/stats';

const MUSCLE_SECTIONS: { titleKey: string; groups: MuscleGroupId[] }[] = [
  {
    titleKey: 'builder.sectionBody',
    groups: ['chest', 'back', 'shoulders', 'abs'],
  },
  {
    titleKey: 'builder.sectionArms',
    groups: ['biceps', 'triceps'],
  },
  {
    titleKey: 'builder.sectionLegs',
    groups: ['quads', 'hamstrings', 'glutes', 'calves'],
  },
];

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
        {MUSCLE_SECTIONS.map((section) => (
          <View key={section.titleKey} style={styles.section}>
            <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
            <View style={styles.chipsWrap}>
              {section.groups.map((id) => {
                const mg = muscleGroupById(id);
                if (!mg) return null;
                const icon = MUSCLE_ICONS[mg.id];
                const name = t(`muscle.${mg.id}`);
                const label = icon
                  ? mode === 'routine'
                    ? name
                    : `${name} ${formatDays(daysByGroup[mg.id])}`
                  : mode === 'routine'
                  ? `${mg.emoji} ${name}`
                  : `${mg.emoji} ${name} ${formatDays(daysByGroup[mg.id])}`;
                return (
                  <Chip
                    key={mg.id}
                    label={label}
                    iconSource={icon}
                    selected={selected.includes(mg.id)}
                    onPress={() => toggle(mg.id)}
                  />
                );
              })}
            </View>
          </View>
        ))}
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
  title: {
    ...type.display,
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    ...type.bodyMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...type.micro,
    marginBottom: spacing.sm,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
});
