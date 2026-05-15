import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format, isMonday, startOfWeek } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HBarChart } from '../components/HBarChart';
import { InfoButton } from '../components/InfoButton';
import { MetricTile } from '../components/MetricTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { exerciseById } from '../data/catalog';
import {
  ALL_CATEGORIES,
  MUSCLE_CATEGORY_EMOJI,
  MUSCLE_CATEGORY_LABEL,
} from '../data/muscleCategories';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { useStatsStore } from '../store/statsStore';
import { colors, radius, spacing } from '../theme';
import { pickPrimaryLift } from '../utils/oneRm';
import {
  daysSinceLastTrained,
  isDeloadWeek,
  sessionsInWeek,
  weekKey,
  weekOverWeekByCategory,
  weeklySetsByCategory,
  weeklyTotalVolume,
} from '../utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const fmtKg = (n: number) =>
  n >= 10000
    ? `${(n / 1000).toFixed(1)}k`
    : Math.round(n).toLocaleString();

const fmtPct = (p: number | null): string => {
  if (p === null) return '—';
  const sign = p > 0 ? '+' : '';
  return `${sign}${Math.round(p * 100)}%`;
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const sessions = useHistoryStore((s) => s.sessions);
  const oneRmHistory = useStatsStore((s) => s.oneRmHistory);
  const prs = useStatsStore((s) => s.prs);
  const backfill = useStatsStore((s) => s.backfillFromHistory);
  const processedCount = useStatsStore((s) => s.processedSessionIds.length);

  // Backfill on first load if cache is empty but history exists
  useEffect(() => {
    if (processedCount === 0 && sessions.some((s) => s.completedAt)) {
      backfill(sessions);
    }
  }, [processedCount, sessions, backfill]);

  const now = Date.now();
  const thisWeekStart = useMemo(
    () => startOfWeek(now, { weekStartsOn: 1 }).getTime(),
    [now],
  );

  const primaryLiftId = useMemo(
    () => pickPrimaryLift(oneRmHistory),
    [oneRmHistory],
  );
  const primaryLiftName = primaryLiftId
    ? exerciseById(primaryLiftId)?.name ?? primaryLiftId
    : null;
  const primaryLiftLatest1Rm = useMemo(() => {
    if (!primaryLiftId) return null;
    const pts = oneRmHistory[primaryLiftId] ?? [];
    if (pts.length === 0) return null;
    return pts.reduce(
      (best, p) => (p.oneRm > best.oneRm ? p : best),
      pts[0],
    ).oneRm;
  }, [primaryLiftId, oneRmHistory]);

  const weekTotalVolume = useMemo(
    () => weeklyTotalVolume(sessions, thisWeekStart),
    [sessions, thisWeekStart],
  );
  const weekSessions = useMemo(
    () => sessionsInWeek(sessions, thisWeekStart),
    [sessions, thisWeekStart],
  );
  const weekPrs = useMemo(
    () =>
      prs.filter(
        (p) => p.date >= thisWeekStart && p.date < thisWeekStart + 7 * 86_400_000,
      ),
    [prs, thisWeekStart],
  );

  const setsByCat = useMemo(
    () => weeklySetsByCategory(sessions, thisWeekStart),
    [sessions, thisWeekStart],
  );
  const wow = useMemo(
    () => weekOverWeekByCategory(sessions, thisWeekStart),
    [sessions, thisWeekStart],
  );
  const daysSince = useMemo(
    () => daysSinceLastTrained(sessions, now),
    [sessions, now],
  );
  const deload = useMemo(
    () => isDeloadWeek(sessions, thisWeekStart),
    [sessions, thisWeekStart],
  );

  const [summaryOpen, setSummaryOpen] = useState(isMonday(now));

  const INFO = {
    summary: {
      title: 'Weekly summary',
      body:
        'Recap of the current calendar week (Mon–Sun): how many sessions you completed, total kg moved, week-over-week change per muscle group, and any new PRs hit. The card auto-expands on Mondays so you can review last week at a glance.',
    },
    oneRm: {
      title: 'Estimated 1RM',
      body:
        'One-Rep Max — the heaviest weight you could lift for a single rep, estimated from your normal working sets using the Epley formula:\n\n  weight × (1 + reps / 30)\n\nThe tile shows the all-time best estimate for whichever of Bench Press, Back Squat, Deadlift, or Overhead Press you have logged most often (auto-picked). Warmup sets are excluded.',
    },
    volume: {
      title: 'Weekly volume',
      body:
        'Total kg moved this week (sets × reps × weight, summed across every working set in every session). The primary hypertrophy indicator: the more weight your muscles displaced, the more growth stimulus they got.\n\nWarmups and undone sets are not counted.',
    },
    sessions: {
      title: 'Sessions this week',
      body:
        'Number of training sessions you completed since Monday. A session counts the moment you tap "Complete training", regardless of how many exercises were in it.',
    },
    prs: {
      title: 'PRs this week',
      body:
        'Personal Records hit since Monday, across three axes per exercise:\n\n• Weight PR — heaviest single set ever for that lift\n• Reps PR — most reps you\'ve ever done at that weight or heavier\n• Volume PR — biggest single-set volume (reps × weight) ever\n\nPRs are detected when you complete a session and saved permanently. The set row in the active workout shows a gold badge as soon as you log a set that would beat history.',
    },
    sets: {
      title: 'Sets by muscle (this week)',
      body:
        'Count of completed working sets for each muscle category this week. A common rule of thumb is 10–20 hard sets per muscle per week for hypertrophy — use this to balance your week and avoid over- or under-training a group.\n\nLegs combines quads, hamstrings, glutes and calves. Arms combines biceps and triceps. Abs are tracked separately and not shown here.',
    },
    lastTrained: {
      title: 'Last trained',
      body:
        'How many days since each muscle category last appeared in a completed session. Anything over 5 days gets a ⚠ flag — that muscle is likely losing the previous training stimulus.',
    },
    deload: {
      title: 'Deload week',
      body:
        'A passive flag shown when this week\'s total volume is below 60% of the average of the previous 4 weeks. Could be intentional (planned recovery week) or accidental (life got in the way). No notification — just an FYI.',
    },
  };

  const noData = sessions.length === 0;

  if (noData) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No stats yet</Text>
          <Text style={styles.emptySub}>
            Complete a training session to start building your dashboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const newPrCount = weekPrs.length;
  const wowChips = ALL_CATEGORIES.filter((c) => wow[c].pct !== null).map(
    (c) => {
      const p = wow[c].pct!;
      const color =
        p > 0.3
          ? colors.success
          : p < -0.2
          ? colors.danger
          : colors.textMuted;
      return { c, p, color };
    },
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Weekly summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => setSummaryOpen((v) => !v)}>
                <Text style={styles.cardTitle}>
                  Week of {format(thisWeekStart, 'MMM d')}
                </Text>
              </Pressable>
              <InfoButton title={INFO.summary.title} body={INFO.summary.body} />
            </View>
            <Pressable onPress={() => setSummaryOpen((v) => !v)} hitSlop={8}>
              <Text style={styles.chevron}>{summaryOpen ? '▾' : '▸'}</Text>
            </Pressable>
          </View>
          {summaryOpen ? (
            <View style={styles.cardBody}>
              <Text style={styles.summaryLine}>
                {weekSessions.length}{' '}
                {weekSessions.length === 1 ? 'session' : 'sessions'} ·{' '}
                {fmtKg(weekTotalVolume)} kg volume
              </Text>
              {wowChips.length > 0 ? (
                <View style={styles.deltaRow}>
                  {wowChips.map(({ c, p, color }) => (
                    <View key={c} style={styles.deltaChip}>
                      <Text style={styles.deltaLabel}>
                        {MUSCLE_CATEGORY_LABEL[c]}
                      </Text>
                      <Text style={[styles.deltaPct, { color }]}>
                        {fmtPct(p)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.muted}>
                  Train another week to see week-over-week changes.
                </Text>
              )}
              {newPrCount > 0 ? (
                <View>
                  <Text style={styles.prsHeader}>
                    🥇 {newPrCount} PR{newPrCount === 1 ? '' : 's'} this week
                  </Text>
                  {weekPrs.slice(0, 4).map((pr) => {
                    const ex = exerciseById(pr.exerciseId);
                    const text =
                      pr.type === 'weight'
                        ? `${ex?.name ?? pr.exerciseId} — ${pr.value} kg × ${pr.reps}`
                        : pr.type === 'reps'
                        ? `${ex?.name ?? pr.exerciseId} — ${pr.value} reps @ ${pr.weight} kg`
                        : `${ex?.name ?? pr.exerciseId} — ${Math.round(pr.value)} kg vol`;
                    return (
                      <Text key={pr.id} style={styles.prLine}>
                        · {text}
                      </Text>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Metric tiles */}
        <View style={styles.tileRow}>
          <MetricTile
            label="1RM"
            value={
              primaryLiftLatest1Rm
                ? `${Math.round(primaryLiftLatest1Rm)} kg`
                : '—'
            }
            sublabel={primaryLiftName ?? 'no lift yet'}
            info={INFO.oneRm}
          />
          <MetricTile
            label="Volume"
            value={fmtKg(weekTotalVolume)}
            sublabel="kg this week"
            info={INFO.volume}
          />
        </View>
        <View style={styles.tileRow}>
          <MetricTile
            label="Sessions"
            value={weekSessions.length}
            sublabel="this week"
            info={INFO.sessions}
          />
          <MetricTile
            label="PRs"
            value={newPrCount}
            sublabel="this week"
            accent={newPrCount > 0 ? colors.warning : undefined}
            info={INFO.prs}
          />
        </View>

        {/* Sets by muscle */}
        <View style={[styles.card, { paddingBottom: spacing.md }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Sets by muscle (this week)</Text>
            <InfoButton title={INFO.sets.title} body={INFO.sets.body} />
          </View>
          <HBarChart
            unit="sets"
            data={ALL_CATEGORIES.map((c) => ({
              key: c,
              label: MUSCLE_CATEGORY_LABEL[c],
              value: setsByCat[c],
            }))}
          />
        </View>

        {/* Last trained */}
        <View style={[styles.card, { paddingBottom: spacing.md }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Last trained</Text>
            <InfoButton
              title={INFO.lastTrained.title}
              body={INFO.lastTrained.body}
            />
          </View>
          {ALL_CATEGORIES.map((c) => {
            const days = daysSince[c];
            const overdue = days !== null && days > 5;
            return (
              <View key={c} style={styles.lastRow}>
                <Text style={styles.lastLabel}>
                  {MUSCLE_CATEGORY_EMOJI[c]} {MUSCLE_CATEGORY_LABEL[c]}
                </Text>
                <Text
                  style={[
                    styles.lastDays,
                    overdue && { color: colors.danger, fontWeight: '700' },
                  ]}
                >
                  {days === null
                    ? '— never'
                    : days === 0
                    ? 'today'
                    : `${days}d ago${overdue ? ' ⚠' : ''}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Deload banner */}
        {deload.deload && deload.pct !== null ? (
          <View style={styles.deloadBanner}>
            <Text style={styles.deloadText}>
              ⚠ Deload week detected — volume {fmtPct(deload.pct)} vs prior
              4-week average.
            </Text>
            <InfoButton title={INFO.deload.title} body={INFO.deload.body} />
          </View>
        ) : null}

        {/* Footer links */}
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <PrimaryButton
            label="Browse exercise progression"
            onPress={() => navigation.navigate('ExerciseList')}
          />
          <PrimaryButton
            label="Training history"
            variant="secondary"
            onPress={() => navigation.navigate('History')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  emptySub: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  chevron: { color: colors.textMuted, fontSize: 16 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardBody: { marginTop: spacing.sm, gap: spacing.sm },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryLine: { color: colors.text, fontSize: 14, fontWeight: '600' },
  muted: { color: colors.textMuted, fontSize: 12 },
  deltaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  deltaChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deltaLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  deltaPct: { fontSize: 12, fontWeight: '800' },
  prsHeader: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  prLine: { color: colors.text, fontSize: 12, marginTop: 2 },
  tileRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  lastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  lastLabel: { color: colors.text, fontSize: 14 },
  lastDays: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  deloadBanner: {
    backgroundColor: 'rgba(244,183,64,0.12)',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  deloadText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
