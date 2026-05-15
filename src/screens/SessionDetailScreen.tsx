import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NumberStepper } from '../components/NumberStepper';
import { PrimaryButton } from '../components/PrimaryButton';
import { SetRow } from '../components/SetRow';
import { exerciseById, muscleGroupById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { useStatsStore } from '../store/statsStore';
import { colors, radius, spacing } from '../theme';
import { ExerciseInSession, Session, SetEntry } from '../types';
import { confirmAction } from '../utils/confirm';
import { sessionDurationMinutes, sessionVolume } from '../utils/volume';
import { equipmentIncrement } from '../utils/weight';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

export const SessionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const session = useHistoryStore((s) =>
    s.sessions.find((x) => x.id === sessionId),
  );
  const allSessions = useHistoryStore((s) => s.sessions);
  const deleteSession = useHistoryStore((s) => s.deleteSession);
  const updateSession = useHistoryStore((s) => s.updateSession);
  const recomputeStats = useStatsStore((s) => s.recomputeFromHistory);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Session | null>(null);
  const [expandedSet, setExpandedSet] = useState<{
    ex: string;
    idx: number;
  } | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(null);
      setExpandedSet(null);
    }
  }, [editing]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        session && !editing ? (
          <Pressable
            onPress={() => {
              setDraft(JSON.parse(JSON.stringify(session)) as Session);
              setEditing(true);
            }}
            hitSlop={8}
            style={{ paddingHorizontal: spacing.sm }}
          >
            <Text style={styles.headerAction}>Edit</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, session, editing]);

  const view = editing && draft ? draft : session;

  const summary = useMemo(() => {
    if (!view) return null;
    return {
      volume: Math.round(sessionVolume(view)),
      duration: sessionDurationMinutes(view),
      doneSets: view.exercises.reduce(
        (a, e) => a + e.sets.filter((s) => s.done).length,
        0,
      ),
    };
  }, [view]);

  if (!view || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>Session not found.</Text>
      </SafeAreaView>
    );
  }

  const onDelete = () => {
    confirmAction({
      title: 'Delete session',
      message: 'Remove this session permanently?',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        deleteSession(sessionId);
        recomputeStats(
          allSessions.filter((x) => x.id !== sessionId),
        );
        navigation.goBack();
      },
    });
  };

  const updateDraft = (mutate: (s: Session) => Session) => {
    setDraft((prev) => (prev ? mutate(prev) : prev));
  };

  const updateSet = (exId: string, idx: number, patch: Partial<SetEntry>) => {
    updateDraft((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.exerciseId === exId
          ? {
              ...e,
              sets: e.sets.map((set, i) => (i === idx ? { ...set, ...patch } : set)),
            }
          : e,
      ),
    }));
  };

  const deleteSet = (exId: string, idx: number) => {
    updateDraft((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.exerciseId === exId
          ? { ...e, sets: e.sets.filter((_, i) => i !== idx) }
          : e,
      ),
    }));
    setExpandedSet(null);
  };

  const deleteExercise = (exId: string, name: string) => {
    confirmAction({
      title: 'Remove exercise',
      message: `Remove "${name}" from this session?`,
      confirmLabel: 'Remove',
      destructive: true,
      onConfirm: () => {
        updateDraft((s) => ({
          ...s,
          exercises: s.exercises.filter((e) => e.exerciseId !== exId),
        }));
        setExpandedSet(null);
      },
    });
  };

  const onSave = () => {
    if (!draft) return;
    updateSession(sessionId, draft);
    const next = allSessions.map((s) => (s.id === sessionId ? draft : s));
    recomputeStats(next);
    setEditing(false);
  };

  const onCancel = () => setEditing(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.date}>
          {format(view.completedAt ?? view.startedAt, 'EEEE, MMM d • HH:mm')}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryNum}>{summary.volume}</Text>
            <Text style={styles.summaryLbl}>kg volume</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryNum}>{summary.duration}</Text>
            <Text style={styles.summaryLbl}>min</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryNum}>{summary.doneSets}</Text>
            <Text style={styles.summaryLbl}>sets done</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Muscle groups</Text>
        <Text style={styles.musclesText}>
          {view.muscleGroups
            .map((m) => muscleGroupById(m)?.name)
            .filter(Boolean)
            .join(' • ')}
        </Text>

        {view.exercises.map((exInSession) =>
          editing ? (
            <EditableExerciseCard
              key={exInSession.exerciseId}
              exInSession={exInSession}
              expandedSet={expandedSet}
              onSelectSet={(idx) =>
                setExpandedSet(
                  expandedSet?.ex === exInSession.exerciseId &&
                    expandedSet?.idx === idx
                    ? null
                    : { ex: exInSession.exerciseId, idx },
                )
              }
              onUpdateSet={(idx, patch) =>
                updateSet(exInSession.exerciseId, idx, patch)
              }
              onDeleteSet={(idx) => deleteSet(exInSession.exerciseId, idx)}
              onDeleteExercise={(name) =>
                deleteExercise(exInSession.exerciseId, name)
              }
            />
          ) : (
            <ReadOnlyExerciseCard
              key={exInSession.exerciseId}
              exInSession={exInSession}
            />
          ),
        )}

        {!editing ? (
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Delete session</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {editing ? (
        <View style={styles.footer}>
          <PrimaryButton
            label="Cancel"
            variant="secondary"
            onPress={onCancel}
            style={{ marginBottom: spacing.sm }}
          />
          <PrimaryButton label="Save changes" onPress={onSave} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const ReadOnlyExerciseCard: React.FC<{ exInSession: ExerciseInSession }> = ({
  exInSession,
}) => {
  const ex = exerciseById(exInSession.exerciseId);
  return (
    <View style={styles.card}>
      <Text style={styles.exTitle}>{ex?.name ?? exInSession.exerciseId}</Text>
      {exInSession.sets.map((set, idx) => (
        <View key={idx} style={styles.setRow}>
          <Text style={styles.setIdx}>{set.warmup ? 'W' : `#${idx + 1}`}</Text>
          <Text style={styles.setText}>
            {set.reps} reps × {set.weight} kg
            {set.warmup ? '  (warm-up)' : ''}
          </Text>
          <Text
            style={[
              styles.setStatus,
              { color: set.done ? colors.success : colors.textMuted },
            ]}
          >
            {set.done ? '✓' : '—'}
          </Text>
        </View>
      ))}
    </View>
  );
};

const EditableExerciseCard: React.FC<{
  exInSession: ExerciseInSession;
  expandedSet: { ex: string; idx: number } | null;
  onSelectSet: (idx: number) => void;
  onUpdateSet: (idx: number, patch: Partial<SetEntry>) => void;
  onDeleteSet: (idx: number) => void;
  onDeleteExercise: (name: string) => void;
}> = ({
  exInSession,
  expandedSet,
  onSelectSet,
  onUpdateSet,
  onDeleteSet,
  onDeleteExercise,
}) => {
  const ex = exerciseById(exInSession.exerciseId);
  const name = ex?.name ?? exInSession.exerciseId;
  return (
    <View style={styles.card}>
      <View style={styles.editHeaderRow}>
        <Text style={styles.exTitle}>{name}</Text>
        <Pressable
          onPress={() => onDeleteExercise(name)}
          hitSlop={8}
          style={styles.removeExerciseBtn}
        >
          <Text style={styles.removeExerciseText}>Remove</Text>
        </Pressable>
      </View>
      {exInSession.sets.map((set, idx) => {
        const isExpanded =
          expandedSet?.ex === exInSession.exerciseId && expandedSet?.idx === idx;
        return (
          <SetRow
            key={idx}
            index={idx}
            set={set}
            expanded={isExpanded}
            onPress={() => onSelectSet(idx)}
            onToggleDone={() => onUpdateSet(idx, { done: !set.done })}
            onDelete={() => onDeleteSet(idx)}
          >
            <View>
              <Text style={styles.editLabel}>Reps</Text>
              <NumberStepper
                value={set.reps}
                onChange={(v) => onUpdateSet(idx, { reps: v })}
                step={1}
                min={1}
                decimal={false}
              />
            </View>
            <View>
              <Text style={styles.editLabel}>Weight</Text>
              <NumberStepper
                value={set.weight}
                onChange={(v) => onUpdateSet(idx, { weight: v })}
                step={ex ? equipmentIncrement(ex) : 1}
                bigStep={5}
                unit="kg"
              />
            </View>
            <Pressable
              onPress={() => onUpdateSet(idx, { warmup: !set.warmup })}
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
                {set.warmup ? '✓ Warm-up set' : 'Mark as warm-up'}
              </Text>
            </Pressable>
          </SetRow>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  date: { color: colors.text, fontSize: 18, fontWeight: '700' },
  headerAction: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  summaryRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  summaryCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryNum: { color: colors.text, fontWeight: '800', fontSize: 20 },
  summaryLbl: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  musclesText: {
    color: colors.text,
    fontSize: 15,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  editHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeExerciseBtn: { paddingVertical: 4, paddingHorizontal: spacing.xs },
  removeExerciseText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  setIdx: { color: colors.textMuted, width: 36, fontWeight: '600' },
  setText: { color: colors.text, flex: 1, fontSize: 14 },
  setStatus: { fontWeight: '800' },
  editLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
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
  deleteBtn: { alignSelf: 'center', padding: spacing.md, marginTop: spacing.md },
  deleteText: { color: colors.danger, fontWeight: '600' },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
