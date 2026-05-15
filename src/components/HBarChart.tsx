import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type HBarItem = {
  key: string;
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: HBarItem[];
  unit?: string;
};

export const HBarChart: React.FC<Props> = ({ data, unit = 'kg' }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <View key={d.key} style={styles.row}>
            <Text style={styles.label}>{d.label}</Text>
            <View style={styles.barWrap}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${Math.max(2, pct)}%`,
                    backgroundColor: d.color ?? colors.primary,
                    opacity: d.value === 0 ? 0.2 : 1,
                  },
                ]}
              />
            </View>
            <Text style={styles.value}>
              {d.value > 0 ? `${Math.round(d.value).toLocaleString()} ${unit}` : '—'}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text,
    width: 72,
    fontSize: 13,
    fontWeight: '600',
  },
  barWrap: {
    flex: 1,
    height: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  bar: { height: '100%', borderRadius: radius.sm },
  value: {
    color: colors.textMuted,
    width: 90,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
