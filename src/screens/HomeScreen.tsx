import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { useProfileStore } from '../store/profileStore';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, fontFamily, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const current = useWorkoutStore((s) => s.current);
  const resetDraft = useDraftStore((s) => s.reset);
  const setDraftMode = useDraftStore((s) => s.setMode);
  const name = useProfileStore((s) => s.name);
  const hasActive = !!current;

  const title = name ? t('home.greetingNamed', { name }) : t('home.greetingDefault');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/brand-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>
      <View style={styles.actions}>
        {hasActive ? (
          <PrimaryButton
            label={t('home.resumeTraining')}
            variant="success"
            icon="play"
            onPress={() => navigation.navigate('ActiveWorkout')}
          />
        ) : (
          <PrimaryButton
            label={t('home.createTraining')}
            icon="barbell"
            onPress={() => {
              resetDraft();
              navigation.navigate('SelectStartMode');
            }}
          />
        )}
        <PrimaryButton
          label={t('home.createRoutine')}
          variant="secondary"
          icon="bookmark-outline"
          onPress={() => {
            resetDraft();
            setDraftMode('routine');
            navigation.navigate('SelectMuscleGroups');
          }}
        />
        <PrimaryButton
          label={t('home.viewStats')}
          variant="secondary"
          icon="stats-chart-outline"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label={t('home.settings')}
          variant="ghost"
          icon="settings-outline"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  header: { marginTop: 0, marginBottom: spacing.xl, alignItems: 'center' },
  logo: {
    width: 320,
    height: 143,
    marginBottom: spacing.sm,
  },
  footer: { marginTop: 'auto' },
  title: {
    ...type.display,
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.extrabold,
    textAlign: 'center',
  },
  subtitle: {
    ...type.bodyMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actions: { gap: spacing.md },
});
