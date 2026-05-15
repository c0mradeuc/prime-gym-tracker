import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoButton } from '../components/InfoButton';
import { exerciseById, muscleGroupById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useStatsStore } from '../store/statsStore';
import { colors, radius, spacing } from '../theme';
import { OneRmPoint, PrType } from '../types';
import { overloadSlope } from '../utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetail'>;

type Range = '1M' | '3M' | 'All';
const RANGES: Range[] = ['1M', '3M', 'All'];
const RANGE_DAYS: Record<Range, number | null> = {
  '1M': 30,
  '3M': 90,
  All: null,
};

const screenW = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (o = 1) => `rgba(79, 140, 255, ${o})`,
  labelColor: () => colors.textMuted,
  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
  propsForBackgroundLines: { stroke: colors.border },
};

const PR_LABEL: Record<PrType, string> = {
  weight: 'Weight',
  reps: 'Reps',
  volume: 'Volume',
};

const INFO = {
  pr: {
    title: 'Latest PR',
    body:
      'The most recent Personal Record set for this exercise, across any of three axes:\n\n• Weight PR — heaviest single set ever\n• Reps PR — most reps you\'ve ever done at this weight or heavier\n• Volume PR — biggest single-set volume (reps × weight) ever\n\nWarmup sets are excluded. The card shows whichever PR was hit most recently; the full timeline of every PR for this exercise lives in the "Recent PRs" list further down.',
  },
  overload: {
    title: 'Progressive overload (kg/week)',
    body:
      'How fast your top working-set weight is climbing on this exercise, measured as a least-squares linear regression over the last 4 weeks of completed sessions.\n\nA positive slope (e.g. +1.5 kg/week) means you are progressively overloading — the prerequisite for hypertrophy. A flat or negative slope means it is time to push the weight, change the rep range, or check recovery.\n\nNeeds at least 3 data points in the window. Updates automatically as you log more sessions.',
  },
  ranges: {
    title: 'Date range',
    body:
      'Filters the two charts below to the last 1 month, 3 months, or all-time. Useful for spotting a recent trend without years of history compressing the lines.',
  },
  topWeight: {
    title: 'Top set weight',
    body:
      'Heaviest weight you used in a single working set during each session, plotted over time. Best raw indicator of strength gain on a given exercise. Stagnation here for several weeks signals the lift has stalled.',
  },
  est1Rm: {
    title: 'Estimated 1RM',
    body:
      'Per-session estimated one-rep max for this exercise, computed with the Epley formula on your heaviest working set:\n\n  weight × (1 + reps / 30)\n\nMore stable than the top-set chart because it normalises across rep ranges (a 5×5 day and a 3×10 day become comparable). The slow upward drift here is the signal you want to see.',
  },
  recentPrs: {
    title: 'Recent PRs',
    body:
      'Every PR ever achieved on this exercise, newest first. Shown as the type (Weight / Reps / Volume), the achievement, and the date. Each PR was detected automatically when you completed a session.',
  },
};

export const ExerciseDetailScreen: React.FC<Props> = ({ route }) => {
  const { exerciseId } = route.params;
  const oneRmHistory = useStatsStore((s) => s.oneRmHistory);
  const allPrs = useStatsStore((s) => s.prs);

  const [range, setRange] = useState<Range>('3M');

  const ex = exerciseById(exerciseId);
  const mg = ex ? muscleGroupById(ex.muscleGroup) : null;

  const points: OneRmPoint[] = useMemo(
    () => oneRmHistory[exerciseId] ?? [],
    [oneRmHistory, exerciseId],
  );

  const filtered = useMemo(() => {
    const days = RANGE_DAYS[range];
    if (days === null) return points;
    const cutoff = Date.now() - days * 86_400_000;
    return points.filter((p) => p.date >= cutoff);
  }, [points, range]);

  const slope = useMemo(() => overloadSlope(points, 4), [points]);

  const exercisePrs = useMemo(
    () =>
      allPrs
        .filter((p) => p.exerciseId === exerciseId)
        .sort((a, b) => b.date - a.date),
    [allPrs, exerciseId],
  );

  const latestPr = exercisePrs[0];

  if (!ex) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>Exercise not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{ex.name}</Text>
        <Text style={styles.subtitle}>
          {mg ? `${mg.emoji} ${mg.name} · ` : ''}
          {points.length} session{points.length === 1 ? '' : 's'}
        </Text>

        {latestPr ? (
          <View style={styles.prCard}>
            <View style={styles.prHeader}>
              <Text style={styles.prLabel}>
                🥇 Latest {PR_LABEL[latestPr.type]} PR
              </Text>
              <InfoButton title={INFO.pr.title} body={INFO.pr.body} />
            </View>
            <Text style={styles.prValue}>
              {latestPr.type === 'weight'
                ? `${latestPr.value} kg × ${latestPr.reps}`
                : latestPr.type === 'reps'
                ? `${latestPr.value} reps @ ${latestPr.weight} kg`
                : `${Math.round(latestPr.value)} kg single-set vol`}
            </Text>
            <Text style={styles.prDate}>
              {format(latestPr.date, 'MMM d, yyyy')}
            </Text>
          </View>
        ) : null}

        {slope !== null ? (
          <View style={styles.slopeCard}>
            <View style={styles.slopeLeft}>
              <Text style={styles.slopeLabel}>Overload (last 4 weeks)</Text>
              <InfoButton title={INFO.overload.title} body={INFO.overload.body} />
            </View>
            <Text
              style={[
                styles.slopeValue,
                {
                  color:
                    slope > 0
                      ? colors.success
                      : slope < 0
                      ? colors.danger
                      : colors.text,
                },
              ]}
            >
              {slope >= 0 ? '+' : ''}
              {slope.toFixed(2)} kg / week
            </Text>
          </View>
        ) : null}

        <View style={styles.rangeWrap}>
          <View style={styles.rangeRow}>
            {RANGES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={[
                styles.rangeBtn,
                range === r && styles.rangeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.rangeText,
                  range === r && styles.rangeTextActive,
                ]}
              >
                {r}
              </Text>
            </Pressable>
          ))}
          </View>
          <InfoButton title={INFO.ranges.title} body={INFO.ranges.body} />
        </View>

        {filtered.length >= 1 ? (
          <>
            <View style={styles.chartHead}>
              <Text style={styles.chartTitle}>Top set weight (kg)</Text>
              <InfoButton title={INFO.topWeight.title} body={INFO.topWeight.body} />
            </View>
            <LineChart
              data={{
                labels: filtered.map((p) => format(p.date, 'M/d')),
                datasets: [{ data: filtered.map((p) => p.topWeight) }],
              }}
              width={screenW - spacing.lg * 2}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <View style={styles.chartHead}>
              <Text style={styles.chartTitle}>Estimated 1RM (kg)</Text>
              <InfoButton title={INFO.est1Rm.title} body={INFO.est1Rm.body} />
            </View>
            <LineChart
              data={{
                labels: filtered.map((p) => format(p.date, 'M/d')),
                datasets: [{ data: filtered.map((p) => Math.round(p.oneRm)) }],
              }}
              width={screenW - spacing.lg * 2}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </>
        ) : (
          <Text style={styles.empty}>No data in this range.</Text>
        )}

        {exercisePrs.length > 0 ? (
          <View style={[styles.card, { marginTop: spacing.lg }]}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recent PRs</Text>
              <InfoButton title={INFO.recentPrs.title} body={INFO.recentPrs.body} />
            </View>
            {exercisePrs.slice(0, 8).map((pr) => (
              <View key={pr.id} style={styles.prRow}>
                <Text style={styles.prRowType}>{PR_LABEL[pr.type]}</Text>
                <Text style={styles.prRowText}>
                  {pr.type === 'weight'
                    ? `${pr.value} kg × ${pr.reps}`
                    : pr.type === 'reps'
                    ? `${pr.value} reps @ ${pr.weight} kg`
                    : `${Math.round(pr.value)} kg`}
                </Text>
                <Text style={styles.prRowDate}>
                  {format(pr.date, 'MMM d')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  prCard: {
    backgroundColor: 'rgba(244,183,64,0.12)',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  prLabel: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  prDate: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  slopeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slopeLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  slopeLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slopeValue: { fontSize: 16, fontWeight: '800' },
  rangeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rangeRow: { flexDirection: 'row', gap: spacing.xs },
  rangeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rangeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeText: { color: colors.text, fontWeight: '600', fontSize: 12 },
  rangeTextActive: { color: '#fff', fontWeight: '800' },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chartTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  chart: { borderRadius: radius.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  prRowType: {
    color: colors.warning,
    fontWeight: '800',
    fontSize: 12,
    width: 64,
  },
  prRowText: { color: colors.text, flex: 1, fontSize: 13, fontWeight: '600' },
  prRowDate: { color: colors.textMuted, fontSize: 12 },
});
