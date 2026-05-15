import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MuscleLabel } from '../components/MuscleLabel';
import { NumberStepper } from '../components/NumberStepper';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  EXERCISES,
  MUSCLE_GROUPS,
  exerciseById,
} from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, radius, spacing } from '../theme';
import { equipmentIncrement, suggestWeight } from '../utils/weight';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExerciseToSession'>;

export const AddExerciseToSessionScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const history = useHistoryStore((s) => s.sessions);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const session = useWorkoutStore((s) => s.current);
  const alreadyIn = useMemo(
    () => new Set(session?.exercises.map((e) => e.exerciseId) ?? []),
    [session],
  );

  const [pickedId, setPickedId] = useState<string | null>(null);
  const [schemeIndex, setSchemeIndex] = useState(0);
  const [weight, setWeight] = useState(0);

  const onPick = (id: string) => {
    const ex = exerciseById(id);
    if (!ex) return;
    setPickedId(id);
    setSchemeIndex(0);
    setWeight(suggestWeight(id, ex.recommendedSchemes[0].reps, history));
  };

  const onConfirm = () => {
    if (!pickedId) return;
    const ex = exerciseById(pickedId)!;
    addExercise(pickedId, ex.recommendedSchemes[schemeIndex], weight);
    navigation.goBack();
  };

  if (pickedId) {
    const ex = exerciseById(pickedId)!;
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{t(`exercise.${ex.id}`)}</Text>
          <Text style={styles.subtitle}>{t('builder.configureAndAdd')}</Text>

          <Text style={styles.sectionLabel}>{t('builder.scheme')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.schemeRow}
          >
            {ex.recommendedSchemes.map((s, sIdx) => {
              const selected = sIdx === schemeIndex;
              return (
                <Pressable
                  key={sIdx}
                  onPress={() => {
                    setSchemeIndex(sIdx);
                    setWeight(suggestWeight(pickedId, s.reps, history));
                  }}
                  style={[
                    styles.schemeBtn,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surface,
                    },
                  ]}
                >
                  <Text style={styles.schemeLabel}>{t(`scheme.${s.labelKey}`)}</Text>
                  <Text style={styles.schemeSub}>
                    {s.sets} × {s.reps}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>{t('builder.weight')}</Text>
          <NumberStepper
            value={weight}
            onChange={setWeight}
            step={equipmentIncrement(ex)}
            bigStep={10}
            unit="kg"
          />
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            label={t('builder.cancel')}
            variant="secondary"
            onPress={() => setPickedId(null)}
            style={{ marginBottom: spacing.sm }}
          />
          <PrimaryButton label={t('builder.addToSession')} variant="success" onPress={onConfirm} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('builder.addTitle')}</Text>
        <Text style={styles.subtitle}>{t('builder.addSubtitle')}</Text>
        {MUSCLE_GROUPS.map((mg) => {
          const list = EXERCISES.filter((e) => e.muscleGroup === mg.id);
          return (
            <View key={mg.id} style={styles.section}>
              <MuscleLabel
                mgId={mg.id}
                size={18}
                textStyle={styles.sectionTitle}
                style={{ marginBottom: spacing.sm }}
              />
              {list.map((ex) => {
                const inSession = alreadyIn.has(ex.id);
                return (
                  <Pressable
                    key={ex.id}
                    disabled={inSession}
                    onPress={() => onPick(ex.id)}
                    style={[
                      styles.exRow,
                      { opacity: inSession ? 0.4 : 1 },
                    ]}
                  >
                    <Text style={styles.exName}>{t(`exercise.${ex.id}`)}</Text>
                    <Text style={styles.exMeta}>
                      {inSession ? t('builder.alreadyAdded') : t(`equipment.${ex.equipment}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  exName: { color: colors.text, fontWeight: '600', fontSize: 15 },
  exMeta: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize' },
  schemeRow: {
    flexDirection: 'row',
    paddingRight: spacing.sm,
  },
  schemeBtn: {
    minWidth: 130,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  schemeLabel: { color: colors.text, fontWeight: '700' },
  schemeSub: { color: colors.text, opacity: 0.85, fontSize: 12, marginTop: 2 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
