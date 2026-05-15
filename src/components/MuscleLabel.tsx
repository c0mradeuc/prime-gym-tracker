import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { muscleGroupById } from '../data/catalog';
import { MUSCLE_ICONS } from '../data/muscleIcons';
import { MuscleGroupId } from '../types';

type Props = {
  mgId: MuscleGroupId;
  size?: number;
  textStyle?: TextStyle | TextStyle[];
  style?: ViewStyle;
  /** Render only the icon (or emoji fallback) without the name. */
  iconOnly?: boolean;
};

export const MuscleLabel: React.FC<Props> = ({
  mgId,
  size = 16,
  textStyle,
  style,
  iconOnly = false,
}) => {
  const { t } = useTranslation();
  const mg = muscleGroupById(mgId);
  const icon = MUSCLE_ICONS[mgId];
  const name = mg ? t(`muscle.${mg.id}`) : mgId;

  return (
    <View style={[styles.row, style]}>
      {icon ? (
        <Image
          source={icon}
          style={{ width: size, height: size, marginRight: iconOnly ? 0 : 4 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={textStyle}>{mg?.emoji ?? ''}{iconOnly ? '' : ' '}</Text>
      )}
      {!iconOnly ? <Text style={textStyle}>{name}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
