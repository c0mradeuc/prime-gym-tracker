import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { InfoButton } from './InfoButton';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
  style?: ViewStyle;
  info?: { title: string; body: string };
};

export const MetricTile: React.FC<Props> = ({
  label,
  value,
  sublabel,
  accent,
  style,
  info,
}) => (
  <View style={[styles.tile, style]}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {info ? (
        <InfoButton title={info.title} body={info.body} size={14} />
      ) : null}
    </View>
    <Text style={[styles.value, accent ? { color: accent } : undefined]}>
      {value}
    </Text>
    {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  sub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
