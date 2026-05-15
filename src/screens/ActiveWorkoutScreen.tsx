import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { DragCard } from '../components/DragCard';
import { LastSessionGhost } from '../components/LastSessionGhost';
import { NumberStepper } from '../components/NumberStepper';
import { PrimaryButton } from '../components/PrimaryButton';
import { SetRow } from '../components/SetRow';
import { exerciseById, muscleGroupById } from '../data/catalog';
import { MUSCLE_ICONS } from '../data/muscleIcons';
import { MuscleLabel } from '../components/MuscleLabel';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { useRoutineStore } from '../store/routineStore';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, elevation, fontFamily, radius, spacing, type } from '../theme';
import { confirmAction } from '../utils/confirm';
import { previewSetPr } from '../utils/prDetection';
import { lastSessionWithExercise } from '../utils/stats';
import { equipmentIncrement } from '../utils/weight';
import { RoutineExercise, Session } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveWorkout'>;

const sessionToRoutineExercises = (session: Session): RoutineExercise[] =>
  session.exercises
    .filter((e) => e.sets.length > 0)
    .map((e) => {
      const nonWarmup = e.sets.filter((s) => !s.warmup);
      const firstSet = nonWarmup[0] ?? e.sets[0];
      const exDef = exerciseById(e.exerciseId);
      let schemeIndex = 0;
      if (exDef) {
        const idx = exDef.recommendedSchemes.findIndex(
          (s) => s.sets === nonWarmup.length && s.reps === firstSet.reps,
        );
        if (idx >= 0) schemeIndex = idx;
      }
      return {
        exerciseId: e.exerciseId,
        schemeIndex,
        weight: firstSet.weight,
      };
    });

const formatElapsed = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const ActiveWorkoutScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const session = useWorkoutStore((s) => s.current);
  const history = useHistoryStore((s) => s.sessions);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const removeMuscleGroup = useWorkoutStore((s) => s.removeMuscleGroup);
  const reorderExercises = useWorkoutStore((s) => s.reorderExercises);
  const completeSession = useWorkoutStore((s) => s.completeSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);
  const addRoutine = useRoutineStore((s) => s.addRoutine);

  const [expandedSet, setExpandedSet] = useState<{ ex: string; idx: number } | null>(
    null,
  );
  const [openExercises, setOpenExercises] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saveRoutineOpen, setSaveRoutineOpen] = useState(false);
  const [routineName, setRoutineName] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!session) navigation.goBack();
  }, [session, navigation]);

  if (!session) return null;

  const elapsed = now - session.startedAt;
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = session.exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).length,
    0,
  );

  const dropTargetProps = (exId: string) =>
    Platform.OS === 'web'
      ? {
          onDragOver: (e: any) => {
            // MUST preventDefault here so the browser allows this element to be a drop zone
            e.preventDefault?.();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            setHoverId((prev) => (prev === exId ? prev : exId));
          },
          onDragLeave: () => {
            setHoverId((prev) => (prev === exId ? null : prev));
          },
          onDrop: (e: any) => {
            e.preventDefault?.();
            const sourceId =
              e.dataTransfer?.getData?.('text/plain') || draggingId;
            setDraggingId(null);
            setHoverId(null);
            if (!sourceId || sourceId === exId) return;
            const ids = session.exercises.map((x) => x.exerciseId);
            const fromIdx = ids.indexOf(sourceId);
            const toIdx = ids.indexOf(exId);
            if (fromIdx < 0 || toIdx < 0) return;
            const [moved] = ids.splice(fromIdx, 1);
            ids.splice(toIdx, 0, moved);
            reorderExercises(ids);
          },
        }
      : {};

  const dragSourceProps = (exId: string) =>
    Platform.OS === 'web'
      ? {
          draggable: true,
          onDragStart: (e: any) => {
            setDraggingId(exId);
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              try {
                e.dataTransfer.setData('text/plain', exId);
              } catch {}
            }
          },
          onDragEnd: () => {
            setDraggingId(null);
            setHoverId(null);
          },
        }
      : {};

  const finishAndGoHome = () => {
    completeSession();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const onComplete = () => {
    confirmAction({
      title: t('active.completeTitle'),
      message: t('active.completeMessage'),
      confirmLabel: t('active.completeConfirm'),
      onConfirm: () => {
        if (session.routineId) {
          finishAndGoHome();
        } else {
          setRoutineName('');
          setSaveRoutineOpen(true);
        }
      },
    });
  };

  const onSaveAsRoutine = () => {
    const name = routineName.trim();
    if (!name) return;
    addRoutine({
      name,
      muscleGroups: session.muscleGroups,
      exercises: sessionToRoutineExercises(session),
    });
    setSaveRoutineOpen(false);
    finishAndGoHome();
  };

  const onSkipSaveRoutine = () => {
    setSaveRoutineOpen(false);
    finishAndGoHome();
  };

  const onDiscard = () => {
    confirmAction({
      title: t('active.discardTitle'),
      message: t('active.discardMessage'),
      confirmLabel: t('active.discardConfirm'),
      destructive: true,
      onConfirm: () => {
        discardSession();
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      },
    });
  };

  const askRemoveExercise = (id: string, name: string) => {
    confirmAction({
      title: t('active.removeExerciseTitle'),
      message: t('active.removeExerciseMessage', { name }),
      confirmLabel: t('active.removeConfirm'),
      destructive: true,
      onConfirm: () => removeExercise(id),
    });
  };

  const askRemoveMuscleGroup = (mgId: string, name: string) => {
    confirmAction({
      title: t('active.removeMuscleTitle'),
      message: t('active.removeMuscleMessage', { name }),
      confirmLabel: t('active.removeConfirm'),
      destructive: true,
      onConfirm: () => removeMuscleGroup(mgId as any),
    });
  };

  const toggleOpen = (exId: string) =>
    setOpenExercises((prev) => ({ ...prev, [exId]: !prev[exId] }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          <Text style={styles.progress}>
            {doneSets}/{totalSets} {t('active.setsSuffix')}
          </Text>
        </View>
        <View style={styles.muscleRow}>
          {session.muscleGroups.map((mgId) => {
            const mg = muscleGroupById(mgId);
            const mgName = mg ? t(`muscle.${mg.id}`) : mgId;
            const icon = MUSCLE_ICONS[mgId];
            return (
              <Pressable
                key={mgId}
                onLongPress={() => askRemoveMuscleGroup(mgId, mgName)}
                style={styles.muscleChip}
              >
                {icon ? (
                  <Image source={icon} style={styles.muscleChipIcon} resizeMode="contain" />
                ) : (
                  <Text style={styles.muscleChipText}>{mg?.emoji}</Text>
                )}
                <Text style={styles.muscleChipText}>{mgName}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {session.exercises.length === 0 ? (
          <Text style={styles.empty}>{t('active.empty')}</Text>
        ) : null}

        {session.exercises.map((exInSession) => {
          const ex = exerciseById(exInSession.exerciseId);
          if (!ex) return null;
          const mg = muscleGroupById(ex.muscleGroup);
          const total = exInSession.sets.length;
          const done = exInSession.sets.filter((s) => s.done).length;
          const allDone = total > 0 && done === total;
          const isOpen = !!openExercises[ex.id];
          const isDragging = draggingId === ex.id;
          const isHover = hoverId === ex.id;

          return (
            <DragCard
              key={exInSession.exerciseId}
              style={[
                styles.card,
                allDone && styles.cardAllDone,
                isDragging && styles.cardDragging,
                isHover && styles.cardHover,
              ]}
              {...dropTargetProps(ex.id)}
            >
              <View style={styles.cardHeader}>
                <DragCard
                  style={styles.dragHandle}
                  {...dragSourceProps(ex.id)}
                >
                  <Ionicons
                    name="reorder-three"
                    size={22}
                    color={colors.textFaint}
                  />
                </DragCard>

                <View
                  style={[
                    styles.checkBubble,
                    {
                      backgroundColor: allDone
                        ? colors.success
                        : colors.surfaceAlt,
                      borderColor: allDone ? colors.success : colors.border,
                    },
                  ]}
                >
                  {allDone ? (
                    <Ionicons name="checkmark" size={22} color={colors.bg} />
                  ) : (
                    <Text style={styles.checkBubbleProgress}>
                      {done}/{total}
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={() => toggleOpen(ex.id)}
                  style={styles.headerLabel}
                >
                  <Text style={styles.cardTitle}>{t(`exercise.${ex.id}`)}</Text>
                  {mg ? (
                    <MuscleLabel
                      mgId={mg.id}
                      size={12}
                      textStyle={styles.cardSub}
                      style={{ marginTop: 2 }}
                    />
                  ) : null}
                </Pressable>

                <Pressable
                  onPress={() => toggleOpen(ex.id)}
                  hitSlop={12}
                  style={styles.chevronBtn}
                >
                  <Ionicons
                    name={isOpen ? 'chevron-down' : 'chevron-forward'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>

              {isOpen ? (
                <View style={styles.cardBody}>
                  <LastSessionGhost
                    exerciseId={ex.id}
                    lastSession={lastSessionWithExercise(history, ex.id, session.id)}
                  />
                  {exInSession.sets.map((set, idx) => {
                    const isExpanded =
                      expandedSet?.ex === ex.id && expandedSet?.idx === idx;
                    const prBadge = previewSetPr(ex.id, set, history);
                    return (
                      <SetRow
                        key={idx}
                        index={idx}
                        set={set}
                        expanded={isExpanded}
                        prBadge={prBadge}
                        onPress={() =>
                          setExpandedSet(
                            isExpanded ? null : { ex: ex.id, idx },
                          )
                        }
                        onToggleDone={() => toggleSetDone(ex.id, idx)}
                        onDelete={() => {
                          removeSet(ex.id, idx);
                          setExpandedSet(null);
                        }}
                      >
                        <View>
                          <Text style={styles.editLabel}>{t('active.reps')}</Text>
                          <NumberStepper
                            value={set.reps}
                            onChange={(v) =>
                              updateSet(ex.id, idx, { reps: v })
                            }
                            step={1}
                            min={1}
                            decimal={false}
                          />
                        </View>
                        <View>
                          <Text style={styles.editLabel}>{t('active.weight')}</Text>
                          <NumberStepper
                            value={set.weight}
                            onChange={(v) =>
                              updateSet(ex.id, idx, { weight: v })
                            }
                            step={equipmentIncrement(ex)}
                            bigStep={5}
                            unit="kg"
                          />
                        </View>
                        <Pressable
                          onPress={() =>
                            updateSet(ex.id, idx, { warmup: !set.warmup })
                          }
                          style={[
                            styles.warmupToggle,
                            set.warmup && styles.warmupToggleOn,
                          ]}
                        >
                          <Text
                            style={[
                              styles.warmupToggleText,
                              set.warmup && styles.warmupToggleTextOn,
                            ]}
                          >
                            {set.warmup ? t('active.warmupOn') : t('active.warmupOff')}
                          </Text>
                        </Pressable>
                      </SetRow>
                    );
                  })}

                  <View style={styles.cardFooter}>
                    <Pressable
                      onPress={() => addSet(ex.id)}
                      style={styles.addSetBtn}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={colors.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.addSetText}>{t('active.addSet')}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => askRemoveExercise(ex.id, t(`exercise.${ex.id}`))}
                      style={styles.removeBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={colors.danger}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.removeBtnText}>{t('active.removeExercise')}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </DragCard>
          );
        })}

        <PrimaryButton
          label={t('active.addExercise')}
          variant="ghost"
          icon="add-circle-outline"
          onPress={() => navigation.navigate('AddExerciseToSession')}
          style={{ marginTop: spacing.md }}
        />
        <Pressable onPress={onDiscard} style={styles.discardBtn}>
          <Ionicons
            name="close-circle-outline"
            size={16}
            color={colors.danger}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.discardText}>{t('active.discardTraining')}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('active.completeTraining')}
          variant="success"
          icon="checkmark-done"
          onPress={onComplete}
        />
      </View>

      <Modal
        visible={saveRoutineOpen}
        transparent
        animationType="fade"
        onRequestClose={onSkipSaveRoutine}
      >
        <Pressable onPress={onSkipSaveRoutine} style={styles.modalBackdrop}>
          <Pressable onPress={() => null} style={styles.modalDialog}>
            <Text style={styles.modalTitle}>{t('active.saveRoutineTitle')}</Text>
            <Text style={styles.modalSub}>{t('active.saveRoutineSub')}</Text>
            <TextInput
              value={routineName}
              onChangeText={setRoutineName}
              placeholder={t('active.saveRoutinePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSaveAsRoutine}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={onSkipSaveRoutine} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>{t('active.skip')}</Text>
              </Pressable>
              <Pressable
                onPress={onSaveAsRoutine}
                disabled={!routineName.trim()}
                style={[
                  styles.modalSave,
                  !routineName.trim() && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.modalSaveText}>{t('active.saveAndFinish')}</Text>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    ...type.display,
    fontSize: 28,
    lineHeight: 34,
  },
  progress: {
    ...type.caption,
    fontFamily: fontFamily.semibold,
    color: colors.textMuted,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  muscleChipIcon: {
    width: 16,
    height: 16,
  },
  muscleChipText: {
    ...type.caption,
    color: colors.text,
    fontFamily: fontFamily.semibold,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  empty: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...elevation(1),
  },
  cardAllDone: {
    backgroundColor: colors.successSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  dragHandle: {
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    ...(Platform.OS === 'web' ? { cursor: 'grab' as any } : {}),
  },
  cardDragging: { opacity: 0.4 },
  cardHover: { borderWidth: 2, borderColor: colors.primary },
  checkBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBubbleProgress: {
    ...type.caption,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  headerLabel: { flex: 1, marginLeft: spacing.md },
  cardTitle: {
    ...type.bodyLg,
    fontFamily: fontFamily.bold,
  },
  cardSub: {
    ...type.caption,
    marginTop: 2,
  },
  chevronBtn: { paddingHorizontal: spacing.sm },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  editLabel: {
    ...type.micro,
    marginBottom: spacing.xs,
  },
  addSetBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginRight: spacing.sm,
  },
  addSetText: {
    ...type.body,
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  removeBtnText: {
    ...type.caption,
    color: colors.danger,
    fontFamily: fontFamily.semibold,
  },
  warmupToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  warmupToggleOn: {
    backgroundColor: colors.warning,
  },
  warmupToggleText: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fontFamily.bold,
    fontSize: 13,
  },
  warmupToggleTextOn: { color: '#1A1D24' },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  discardText: {
    ...type.body,
    color: colors.danger,
    fontFamily: fontFamily.semibold,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...elevation(3),
  },
  modalTitle: {
    ...type.h2,
  },
  modalSub: {
    ...type.caption,
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
    fontFamily: fontFamily.medium,
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
  modalCancelText: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fontFamily.bold,
  },
  modalSave: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    ...type.body,
    color: '#fff',
    fontFamily: fontFamily.extrabold,
  },
});
