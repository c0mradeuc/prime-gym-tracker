import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NumberStepper } from '../components/NumberStepper';
import { PrimaryButton } from '../components/PrimaryButton';
import { exerciseById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { useHistoryStore } from '../store/historyStore';
import { useRoutineStore } from '../store/routineStore';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, radius, spacing } from '../theme';
import { SetRepScheme } from '../types';
import { equipmentIncrement, suggestWeight } from '../utils/weight';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigureExercises'>;

export const ConfigureExercisesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const mode = useDraftStore((s) => s.mode);
  const muscleGroups = useDraftStore((s) => s.muscleGroups);
  const exerciseIds = useDraftStore((s) => s.exerciseIds);
  const configs = useDraftStore((s) => s.configs);
  const routineId = useDraftStore((s) => s.routineId);
  const draftRoutineName = useDraftStore((s) => s.routineName);
  const ensureConfig = useDraftStore((s) => s.ensureConfig);
  const upsertConfig = useDraftStore((s) => s.upsertConfig);
  const resetDraft = useDraftStore((s) => s.reset);

  const history = useHistoryStore((s) => s.sessions);
  const startSession = useWorkoutStore((s) => s.startSession);
  const addRoutine = useRoutineStore((s) => s.addRoutine);
  const updateRoutine = useRoutineStore((s) => s.updateRoutine);
  const getRoutine = useRoutineStore((s) => s.getRoutine);

  const sourceRoutine = routineId ? getRoutine(routineId) : undefined;

  // Seed default configs for any newly added exercises
  useEffect(() => {
    for (const id of exerciseIds) {
      const ex = exerciseById(id);
      const scheme = ex?.recommendedSchemes[0];
      ensureConfig(id, {
        schemeIndex: 0,
        weight: scheme ? suggestWeight(id, scheme.reps, history) : 0,
      });
    }
  }, [exerciseIds, history, ensureConfig]);

  const [saveOpen, setSaveOpen] = useState(false);
  const [routineName, setRoutineName] = useState(draftRoutineName);

  useEffect(() => setRoutineName(draftRoutineName), [draftRoutineName]);

  const onSchemeChange = (exerciseId: string, schemeIndex: number) => {
    const ex = exerciseById(exerciseId);
    const scheme = ex?.recommendedSchemes[schemeIndex];
    upsertConfig(exerciseId, {
      schemeIndex,
      weight: scheme
        ? suggestWeight(exerciseId, scheme.reps, history)
        : 0,
    });
  };

  const onStart = () => {
    startSession(
      muscleGroups,
      configs.map((c) => {
        const ex = exerciseById(c.exerciseId)!;
        return {
          exerciseId: c.exerciseId,
          scheme: ex.recommendedSchemes[c.schemeIndex],
          weight: c.weight,
        };
      }),
      routineId,
    );
    resetDraft();
    navigation.reset({ index: 0, routes: [{ name: 'ActiveWorkout' }] });
  };

  const onSaveRoutine = () => {
    const name = routineName.trim();
    if (!name) return;
    if (sourceRoutine) {
      updateRoutine(sourceRoutine.id, {
        name,
        muscleGroups,
        exercises: configs,
      });
    } else {
      addRoutine({ name, muscleGroups, exercises: configs });
    }
    setSaveOpen(false);
    resetDraft();
    navigation.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'RoutineList' }],
    });
  };

  // Render in the order of exerciseIds (configs may be in a different order)
  const orderedConfigs = exerciseIds
    .map((id) => configs.find((c) => c.exerciseId === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {mode === 'routine'
            ? t('builder.configureTitleRoutine')
            : t('builder.configureTitle')}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'routine'
            ? t('builder.configureSubtitleRoutine')
            : sourceRoutine
            ? t('builder.configureSubtitleLoaded', { name: sourceRoutine.name })
            : t('builder.configureSubtitleSession')}
        </Text>
        {orderedConfigs.map((cfg) => {
          const ex = exerciseById(cfg.exerciseId)!;
          const scheme: SetRepScheme = ex.recommendedSchemes[cfg.schemeIndex];
          return (
            <View key={cfg.exerciseId} style={styles.card}>
              <Text style={styles.exName}>{t(`exercise.${ex.id}`)}</Text>
              <Text style={styles.exMeta}>{t(`equipment.${ex.equipment}`)}</Text>

              <Text style={styles.sectionLabel}>{t('builder.scheme')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.schemeRow}
              >
                {ex.recommendedSchemes.map((s, sIdx) => {
                  const selected = sIdx === cfg.schemeIndex;
                  return (
                    <Pressable
                      key={sIdx}
                      onPress={() => onSchemeChange(cfg.exerciseId, sIdx)}
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

              <Text style={styles.sectionLabel}>
                {t('builder.weightFor', { reps: scheme.reps })}
              </Text>
              <NumberStepper
                value={cfg.weight}
                onChange={(v) => upsertConfig(cfg.exerciseId, { weight: v })}
                step={equipmentIncrement(ex)}
                bigStep={10}
                unit="kg"
              />
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        {mode === 'routine' ? (
          <PrimaryButton
            label={sourceRoutine ? t('builder.updateRoutine') : t('builder.saveRoutine')}
            onPress={() => setSaveOpen(true)}
          />
        ) : (
          <PrimaryButton
            label={t('builder.startTraining')}
            variant="success"
            onPress={onStart}
          />
        )}
      </View>

      <Modal
        visible={saveOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveOpen(false)}
      >
        <Pressable
          onPress={() => setSaveOpen(false)}
          style={styles.modalBackdrop}
        >
          <Pressable onPress={() => null} style={styles.modalDialog}>
            <Text style={styles.modalTitle}>
              {sourceRoutine ? t('builder.updateRoutine') : t('builder.nameRoutine')}
            </Text>
            <Text style={styles.modalSub}>
              {t('builder.exerciseCount', { count: configs.length })} ·{' '}
              {t('builder.groupCount', { count: muscleGroups.length })}
            </Text>
            <TextInput
              value={routineName}
              onChangeText={setRoutineName}
              placeholder={t('builder.routinePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSaveRoutine}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setSaveOpen(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>{t('builder.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={onSaveRoutine}
                disabled={!routineName.trim()}
                style={[
                  styles.modalSave,
                  !routineName.trim() && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.modalSaveText}>
                  {sourceRoutine ? t('builder.update') : t('builder.save')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  exMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
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
  schemeSub: {
    color: colors.text,
    opacity: 0.85,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalCancel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  modalCancelText: { color: colors.textMuted, fontWeight: '700' },
  modalSave: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  modalSaveText: { color: '#fff', fontWeight: '800' },
});
