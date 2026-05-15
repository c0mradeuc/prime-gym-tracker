import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../components/Chip';
import { MuscleLabel } from '../components/MuscleLabel';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  exercisesByMuscleGroup,
  muscleGroupById,
} from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectExercises'>;

export const SelectExercisesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const muscleGroups = useDraftStore((s) => s.muscleGroups);
  const selected = useDraftStore((s) => s.exerciseIds);
  const setExerciseIds = useDraftStore((s) => s.setExerciseIds);
  const mode = useDraftStore((s) => s.mode);

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setExerciseIds(next);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('builder.exercisesTitle')}</Text>
        <Text style={styles.subtitle}>
          {mode === 'routine'
            ? t('builder.exercisesSubtitleRoutine')
            : t('builder.exercisesSubtitleSession')}
        </Text>
        {muscleGroups.map((mgId) => {
          const mg = muscleGroupById(mgId);
          const exercises = exercisesByMuscleGroup(mgId);
          return (
            <View key={mgId} style={styles.section}>
              {mg ? (
                <MuscleLabel
                  mgId={mg.id}
                  size={18}
                  textStyle={styles.sectionTitle}
                  style={{ marginBottom: spacing.sm }}
                />
              ) : null}
              <View style={styles.chipsWrap}>
                {exercises.map((ex) => (
                  <Chip
                    key={ex.id}
                    label={t(`exercise.${ex.id}`)}
                    selected={selected.includes(ex.id)}
                    onPress={() => toggle(ex.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={t('builder.next', { count: selected.length })}
          disabled={selected.length === 0}
          onPress={() => navigation.navigate('ConfigureExercises')}
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
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
