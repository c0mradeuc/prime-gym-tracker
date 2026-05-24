import { Ionicons } from '@expo/vector-icons';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useHistoryStore } from '../store/historyStore';
import { colors, elevation, fontFamily, radius, spacing, type } from '../theme';
import { formatDate } from '../utils/format';
import { sessionVolume } from '../utils/volume';

const WEEK_OPTS = { weekStartsOn: 1 as const };
const CELL_GAP = 4;

type DayStat = {
  volume: number;
  count: number;
};

const buildDailyStats = (
  sessions: ReturnType<typeof useHistoryStore.getState>['sessions'],
): Map<number, DayStat> => {
  const out = new Map<number, DayStat>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const key = startOfDay(s.completedAt).getTime();
    const prev = out.get(key) ?? { volume: 0, count: 0 };
    out.set(key, {
      volume: prev.volume + sessionVolume(s),
      count: prev.count + 1,
    });
  }
  return out;
};

const intensityOf = (volume: number, thresholds: number[]): 0 | 1 | 2 | 3 | 4 => {
  if (volume <= 0) return 0;
  if (volume < thresholds[0]) return 1;
  if (volume < thresholds[1]) return 2;
  if (volume < thresholds[2]) return 3;
  return 4;
};

const computeThresholds = (stats: Map<number, DayStat>): number[] => {
  const vols = Array.from(stats.values())
    .map((s) => s.volume)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (vols.length === 0) return [1, 2, 3];
  const pick = (p: number) => vols[Math.min(vols.length - 1, Math.floor(vols.length * p))];
  return [pick(0.33), pick(0.66), pick(0.9)];
};

const INTENSITY_COLORS = [
  colors.surfaceAlt,
  'rgba(63,207,142,0.25)',
  'rgba(63,207,142,0.45)',
  'rgba(63,207,142,0.7)',
  colors.success,
];

export const TrainingHeatmap: React.FC = () => {
  const { t } = useTranslation();
  const sessions = useHistoryStore((s) => s.sessions);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(Date.now()));
  const [selected, setSelected] = useState<number | null>(null);

  const stats = useMemo(() => buildDailyStats(sessions), [sessions]);
  const thresholds = useMemo(() => computeThresholds(stats), [stats]);

  const today = startOfDay(Date.now()).getTime();
  const currentMonthStart = startOfMonth(Date.now()).getTime();
  const atCurrentMonth = monthAnchor.getTime() === currentMonthStart;

  const days = useMemo(() => {
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    const gridStart = startOfWeek(monthStart, WEEK_OPTS);
    const gridEnd = endOfWeek(monthEnd, WEEK_OPTS);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [monthAnchor]);

  const monthlyTotals = useMemo(() => {
    let volume = 0;
    let trainedDays = 0;
    for (const d of days) {
      if (!isSameMonth(d, monthAnchor)) continue;
      const stat = stats.get(d.getTime());
      if (stat && stat.volume > 0) {
        volume += stat.volume;
        trainedDays += 1;
      }
    }
    return { volume, trainedDays };
  }, [days, stats, monthAnchor]);

  const weekdayLabels = useMemo(() => {
    const refWeek = eachDayOfInterval({
      start: startOfWeek(monthAnchor, WEEK_OPTS),
      end: endOfWeek(monthAnchor, WEEK_OPTS),
    });
    return refWeek.map((d) => formatDate(d, 'EEEEE'));
  }, [monthAnchor]);

  const selectedStat = selected != null ? stats.get(selected) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            setMonthAnchor((m) => startOfMonth(addMonths(m, -1)));
            setSelected(null);
          }}
          hitSlop={8}
          style={styles.navBtn}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>{formatDate(monthAnchor, 'MMMM yyyy')}</Text>
        <Pressable
          onPress={() => {
            setMonthAnchor((m) => startOfMonth(addMonths(m, 1)));
            setSelected(null);
          }}
          hitSlop={8}
          disabled={atCurrentMonth}
          style={[styles.navBtn, atCurrentMonth && styles.navBtnDisabled]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={atCurrentMonth ? colors.textMuted : colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label, i) => (
          <Text key={i} style={styles.weekdayLabel}>{label}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((d) => {
          const ts = d.getTime();
          const inMonth = isSameMonth(d, monthAnchor);
          const stat = stats.get(ts);
          const intensity = inMonth ? intensityOf(stat?.volume ?? 0, thresholds) : 0;
          const isToday = ts === today;
          const isSelected = selected === ts;
          return (
            <Pressable
              key={ts}
              onPress={() => setSelected(isSelected ? null : ts)}
              style={[
                styles.cell,
                {
                  backgroundColor: inMonth ? INTENSITY_COLORS[intensity] : 'transparent',
                  opacity: inMonth ? 1 : 0.25,
                },
                isToday && styles.cellToday,
                isSelected && styles.cellSelected,
              ]}
            >
              <Text
                style={[
                  styles.cellLabel,
                  intensity >= 3 && { color: '#0D1F17' },
                  !inMonth && { color: colors.textFaint },
                ]}
              >
                {d.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>{t('history.heatLess')}</Text>
        {INTENSITY_COLORS.map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendLabel}>{t('history.heatMore')}</Text>
      </View>

      {selected != null ? (
        <Text style={styles.selectedLine}>
          {formatDate(selected, 'EEE, MMM d')}
          {' · '}
          {selectedStat && selectedStat.volume > 0
            ? t('history.heatDayStat', {
                count: selectedStat.count,
                volume: Math.round(selectedStat.volume),
              })
            : t('history.heatDayRest')}
        </Text>
      ) : (
        <Text style={styles.selectedLine}>
          {t('history.heatMonthSummary', {
            count: monthlyTotals.trainedDays,
            volume: Math.round(monthlyTotals.volume),
          })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...elevation(1),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  navBtnDisabled: { opacity: 0.4 },
  title: {
    ...type.bodyLg,
    fontFamily: fontFamily.bold,
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: CELL_GAP,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...type.micro,
    color: colors.textFaint,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CELL_GAP,
    // simulate gap by tightening padding; flexWrap+% width handles spacing well enough
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellToday: {
    borderColor: colors.primary,
  },
  cellSelected: {
    borderColor: colors.text,
  },
  cellLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textMuted,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  legendLabel: {
    ...type.caption,
    color: colors.textFaint,
    fontSize: 10,
    marginHorizontal: spacing.xs,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  selectedLine: {
    ...type.caption,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
