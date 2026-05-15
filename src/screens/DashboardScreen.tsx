import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isMonday, startOfWeek } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HBarChart } from '../components/HBarChart';
import { InfoButton } from '../components/InfoButton';
import { MetricTile } from '../components/MetricTile';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  ALL_CATEGORIES,
  MUSCLE_CATEGORY_EMOJI,
} from '../data/muscleCategories';
import { RootStackParamList } from '../navigation';
import { useHistoryStore } from '../store/historyStore';
import { useStatsStore } from '../store/statsStore';
import { colors, radius, spacing } from '../theme';
import { formatDate } from '../utils/format';
import { pickPrimaryLift } from '../utils/oneRm';
import {
  daysSinceLastTrained,
  isDeloadWeek,
  sessionsInWeek,
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
  const { t } = useTranslation();
  const sessions = useHistoryStore((s) => s.sessions);
  const oneRmHistory = useStatsStore((s) => s.oneRmHistory);
  const prs = useStatsStore((s) => s.prs);
  const backfill = useStatsStore((s) => s.backfillFromHistory);
  const processedCount = useStatsStore((s) => s.processedSessionIds.length);

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
    ? t(`exercise.${primaryLiftId}`)
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
    summary: { title: t('dashboard.infoSummaryTitle'), body: t('dashboard.infoSummaryBody') },
    oneRm: { title: t('dashboard.infoOneRmTitle'), body: t('dashboard.infoOneRmBody') },
    volume: { title: t('dashboard.infoVolumeTitle'), body: t('dashboard.infoVolumeBody') },
    sessions: { title: t('dashboard.infoSessionsTitle'), body: t('dashboard.infoSessionsBody') },
    prs: { title: t('dashboard.infoPrsTitle'), body: t('dashboard.infoPrsBody') },
    sets: { title: t('dashboard.infoSetsTitle'), body: t('dashboard.infoSetsBody') },
    lastTrained: { title: t('dashboard.infoLastTrainedTitle'), body: t('dashboard.infoLastTrainedBody') },
    deload: { title: t('dashboard.infoDeloadTitle'), body: t('dashboard.infoDeloadBody') },
  };

  const noData = sessions.length === 0;

  if (noData) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('dashboard.noStatsTitle')}</Text>
          <Text style={styles.emptySub}>{t('dashboard.noStatsSub')}</Text>
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

  const formatPrLine = (pr: typeof weekPrs[number]) => {
    const name = t(`exercise.${pr.exerciseId}`);
    if (pr.type === 'weight') {
      return t('dashboard.prWeight', { name, value: pr.value, reps: pr.reps });
    }
    if (pr.type === 'reps') {
      return t('dashboard.prReps', { name, value: pr.value, weight: pr.weight });
    }
    return t('dashboard.prVolume', { name, value: Math.round(pr.value) });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => setSummaryOpen((v) => !v)}>
                <Text style={styles.cardTitle}>
                  {t('dashboard.weekOf', { date: formatDate(thisWeekStart, 'MMM d') })}
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
                {t('dashboard.sessionsLine', {
                  count: weekSessions.length,
                  volume: fmtKg(weekTotalVolume),
                })}
              </Text>
              {wowChips.length > 0 ? (
                <View style={styles.deltaRow}>
                  {wowChips.map(({ c, p, color }) => (
                    <View key={c} style={styles.deltaChip}>
                      <Text style={styles.deltaLabel}>{t(`category.${c}`)}</Text>
                      <Text style={[styles.deltaPct, { color }]}>{fmtPct(p)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.muted}>{t('dashboard.noWow')}</Text>
              )}
              {newPrCount > 0 ? (
                <View>
                  <Text style={styles.prsHeader}>
                    {t('dashboard.prsHeader', { count: newPrCount })}
                  </Text>
                  {weekPrs.slice(0, 4).map((pr) => (
                    <Text key={pr.id} style={styles.prLine}>· {formatPrLine(pr)}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.tileRow}>
          <MetricTile
            label={t('dashboard.tile1Rm')}
            value={primaryLiftLatest1Rm ? `${Math.round(primaryLiftLatest1Rm)} kg` : '—'}
            sublabel={primaryLiftName ?? t('dashboard.noLiftYet')}
            info={INFO.oneRm}
          />
          <MetricTile
            label={t('dashboard.tileVolume')}
            value={fmtKg(weekTotalVolume)}
            sublabel={t('dashboard.tileVolumeSub')}
            info={INFO.volume}
          />
        </View>
        <View style={styles.tileRow}>
          <MetricTile
            label={t('dashboard.tileSessions')}
            value={weekSessions.length}
            sublabel={t('dashboard.tileSessionsSub')}
            info={INFO.sessions}
          />
          <MetricTile
            label={t('dashboard.tilePrs')}
            value={newPrCount}
            sublabel={t('dashboard.tilePrsSub')}
            accent={newPrCount > 0 ? colors.warning : undefined}
            info={INFO.prs}
          />
        </View>

        <View style={[styles.card, { paddingBottom: spacing.md }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('dashboard.setsByMuscle')}</Text>
            <InfoButton title={INFO.sets.title} body={INFO.sets.body} />
          </View>
          <HBarChart
            unit={t('units.sets')}
            data={ALL_CATEGORIES.map((c) => ({
              key: c,
              label: t(`category.${c}`),
              value: setsByCat[c],
            }))}
          />
        </View>

        <View style={[styles.card, { paddingBottom: spacing.md }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('dashboard.lastTrained')}</Text>
            <InfoButton title={INFO.lastTrained.title} body={INFO.lastTrained.body} />
          </View>
          {ALL_CATEGORIES.map((c) => {
            const days = daysSince[c];
            const overdue = days !== null && days > 5;
            return (
              <View key={c} style={styles.lastRow}>
                <Text style={styles.lastLabel}>
                  {MUSCLE_CATEGORY_EMOJI[c]} {t(`category.${c}`)}
                </Text>
                <Text
                  style={[
                    styles.lastDays,
                    overdue && { color: colors.danger, fontWeight: '700' },
                  ]}
                >
                  {days === null
                    ? t('dashboard.lastNever')
                    : days === 0
                    ? t('dashboard.lastToday')
                    : overdue
                    ? t('dashboard.lastDaysAgoWarn', { days })
                    : t('dashboard.lastDaysAgo', { days })}
                </Text>
              </View>
            );
          })}
        </View>

        {deload.deload && deload.pct !== null ? (
          <View style={styles.deloadBanner}>
            <Text style={styles.deloadText}>
              {t('dashboard.deloadBanner', { pct: fmtPct(deload.pct) })}
            </Text>
            <InfoButton title={INFO.deload.title} body={INFO.deload.body} />
          </View>
        ) : null}

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <PrimaryButton
            label={t('dashboard.browseProgression')}
            onPress={() => navigation.navigate('ExerciseList')}
          />
          <PrimaryButton
            label={t('dashboard.trainingHistory')}
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
