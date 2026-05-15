import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
            return (
              <Pressable
                key={mgId}
                onLongPress={() => askRemoveMuscleGroup(mgId, mgName)}
                style={styles.muscleChip}
              >
                <Text style={styles.muscleChipText}>
                  {mg?.emoji} {mgName}
                </Text>
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
                    <Ionicons name="checkmark" size={22} color="#0B0D11" />
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
                  <Text style={styles.cardSub}>
                    {mg?.emoji} {mg ? t(`muscle.${mg.id}`) : ''}
                  </Text>
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
          variant="secondary"
          onPress={() => navigation.navigate('AddExerciseToSession')}
          style={{ marginTop: spacing.md }}
        />
        <Pressable onPress={onDiscard} style={styles.discardBtn}>
          <Text style={styles.discardText}>{t('active.discardTraining')}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('active.completeTraining')}
          variant="success"
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: { color: colors.text, fontSize: 24, fontWeight: '800' },
  progress: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  muscleChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  muscleChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
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
  dragHandleText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '900',
  },
  cardDragging: { opacity: 0.4 },
  cardHover: { borderColor: colors.primary, borderWidth: 2 },
  checkBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBubbleText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  checkBubbleProgress: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  headerLabel: { flex: 1, marginLeft: spacing.md },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  chevronBtn: { paddingHorizontal: spacing.sm },
  chevron: { color: colors.textMuted, fontSize: 18 },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  editLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  addSetBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginRight: spacing.sm,
  },
  addSetText: { color: colors.primary, fontWeight: '700' },
  removeBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  removeBtnText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  warmupToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  warmupToggleOn: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  warmupToggleText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  warmupToggleTextOn: { color: '#1A1D24' },
  discardBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  discardText: { color: colors.danger, fontWeight: '600' },
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
