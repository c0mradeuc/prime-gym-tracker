import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fontFamily, radius, spacing } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  iconSource?: ImageSourcePropType;
  style?: ViewStyle;
};

export const Chip: React.FC<Props> = ({
  label,
  selected,
  onPress,
  iconSource,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: false }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceAlt,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.92 : 1,
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {iconSource ? (
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        ) : null}
        <Text
          style={[
            styles.label,
            { color: selected ? '#fff' : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  label: {
    fontSize: 13.5,
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.1,
  },
});
