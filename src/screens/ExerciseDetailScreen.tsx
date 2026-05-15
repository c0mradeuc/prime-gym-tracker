import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { formatDate } from '../utils/format';
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

export const ExerciseDetailScreen: React.FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const { exerciseId } = route.params;

  const PR_LABEL: Record<PrType, string> = {
    weight: t('prType.weight'),
    reps: t('prType.reps'),
    volume: t('prType.volume'),
  };

  const INFO = {
    pr: { title: t('exerciseDetail.infoPrTitle'), body: t('exerciseDetail.infoPrBody') },
    overload: { title: t('exerciseDetail.infoOverloadTitle'), body: t('exerciseDetail.infoOverloadBody') },
    ranges: { title: t('exerciseDetail.infoRangesTitle'), body: t('exerciseDetail.infoRangesBody') },
    topWeight: { title: t('exerciseDetail.infoTopWeightTitle'), body: t('exerciseDetail.infoTopWeightBody') },
    est1Rm: { title: t('exerciseDetail.infoEst1RmTitle'), body: t('exerciseDetail.infoEst1RmBody') },
    recentPrs: { title: t('exerciseDetail.infoRecentPrsTitle'), body: t('exerciseDetail.infoRecentPrsBody') },
  };

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
        <Text style={styles.empty}>{t('exerciseDetail.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const prValue = (pr: typeof latestPr): string => {
    if (!pr) return '';
    if (pr.type === 'weight') return t('exerciseDetail.prWeight', { value: pr.value, reps: pr.reps });
    if (pr.type === 'reps') return t('exerciseDetail.prReps', { value: pr.value, weight: pr.weight });
    return t('exerciseDetail.prVolume', { value: Math.round(pr.value) });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t(`exercise.${ex.id}`)}</Text>
        <Text style={styles.subtitle}>
          {mg ? `${mg.emoji} ${t(`muscle.${mg.id}`)} · ` : ''}
          {t('exerciseDetail.sessionCount', { count: points.length })}
        </Text>

        {latestPr ? (
          <View style={styles.prCard}>
            <View style={styles.prHeader}>
              <Text style={styles.prLabel}>
                {t('exerciseDetail.latestPr', { type: PR_LABEL[latestPr.type] })}
              </Text>
              <InfoButton title={INFO.pr.title} body={INFO.pr.body} />
            </View>
            <Text style={styles.prValue}>{prValue(latestPr)}</Text>
            <Text style={styles.prDate}>
              {formatDate(latestPr.date, 'MMM d, yyyy')}
            </Text>
          </View>
        ) : null}

        {slope !== null ? (
          <View style={styles.slopeCard}>
            <View style={styles.slopeLeft}>
              <Text style={styles.slopeLabel}>{t('exerciseDetail.overload')}</Text>
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
              {t('exerciseDetail.overloadValue', {
                value: `${slope >= 0 ? '+' : ''}${slope.toFixed(2)}`,
              })}
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
              <Text style={styles.chartTitle}>{t('exerciseDetail.topWeightChart')}</Text>
              <InfoButton title={INFO.topWeight.title} body={INFO.topWeight.body} />
            </View>
            <LineChart
              data={{
                labels: filtered.map((p) => formatDate(p.date, 'M/d')),
                datasets: [{ data: filtered.map((p) => p.topWeight) }],
              }}
              width={screenW - spacing.lg * 2}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <View style={styles.chartHead}>
              <Text style={styles.chartTitle}>{t('exerciseDetail.est1RmChart')}</Text>
              <InfoButton title={INFO.est1Rm.title} body={INFO.est1Rm.body} />
            </View>
            <LineChart
              data={{
                labels: filtered.map((p) => formatDate(p.date, 'M/d')),
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
          <Text style={styles.empty}>{t('exerciseDetail.noDataRange')}</Text>
        )}

        {exercisePrs.length > 0 ? (
          <View style={[styles.card, { marginTop: spacing.lg }]}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t('exerciseDetail.recentPrs')}</Text>
              <InfoButton title={INFO.recentPrs.title} body={INFO.recentPrs.body} />
            </View>
            {exercisePrs.slice(0, 8).map((pr) => (
              <View key={pr.id} style={styles.prRow}>
                <Text style={styles.prRowType}>{PR_LABEL[pr.type]}</Text>
                <Text style={styles.prRowText}>{prValue(pr)}</Text>
                <Text style={styles.prRowDate}>{formatDate(pr.date, 'MMM d')}</Text>
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
