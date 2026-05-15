import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fontFamily, radius, spacing } from '../theme';

type Props = {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  bigStep?: number;
  /** Allow decimals (e.g. 2.5 kg). Defaults to true. */
  decimal?: boolean;
};

export const NumberStepper: React.FC<Props> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  unit,
  bigStep,
  decimal = true,
}) => {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  const commit = () => {
    setFocused(false);
    const cleaned = text.replace(',', '.').trim();
    if (cleaned === '' || cleaned === '-' || cleaned === '.') {
      setText(String(value));
      return;
    }
    let parsed = decimal ? parseFloat(cleaned) : parseInt(cleaned, 10);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    parsed = Math.max(min, Math.min(max, parsed));
    parsed = +parsed.toFixed(2);
    setText(String(parsed));
    if (parsed !== value) onChange(parsed);
  };

  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  const decBig = () =>
    bigStep && onChange(Math.max(min, +(value - bigStep).toFixed(2)));
  const incBig = () =>
    bigStep && onChange(Math.min(max, +(value + bigStep).toFixed(2)));

  const showBigDec = !!bigStep && value - bigStep >= min;
  const showBigInc = !!bigStep && value + bigStep <= max;
  const showDec = value - step >= min;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {showBigDec ? (
        <Pressable onPress={decBig} style={[styles.btn, styles.bigBtn]}>
          <Text style={[styles.btnText, styles.bigBtnText]}>−{bigStep}</Text>
        </Pressable>
      ) : null}
      {showDec ? (
        <Pressable onPress={dec} style={styles.btn}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
      ) : null}
      <View
        style={[
          styles.valueBox,
          { borderColor: focused ? colors.primary : colors.border },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          inputMode={decimal ? 'decimal' : 'numeric'}
          selectTextOnFocus
          style={styles.input}
          underlineColorAndroid="transparent"
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Pressable onPress={inc} style={styles.btn}>
        <Text style={styles.btnText}>+</Text>
      </Pressable>
      {showBigInc ? (
        <Pressable onPress={incBig} style={[styles.btn, styles.bigBtn]}>
          <Text style={[styles.btnText, styles.bigBtnText]}>+{bigStep}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  btn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  bigBtn: {
    backgroundColor: colors.primarySoft,
    minWidth: 48,
    paddingHorizontal: 8,
  },
  btnText: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
  bigBtnText: {
    color: colors.primary,
    fontFamily: fontFamily.extrabold,
  },
  valueBox: {
    width: 94,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    width: 0,
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  unit: {
    color: colors.textMuted,
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    marginLeft: 3,
  },
});
