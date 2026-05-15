import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
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
  header: { marginTop: spacing.xxl, marginBottom: spacing.xxl },
  title: {
    ...type.display,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fontFamily.extrabold,
  },
  subtitle: {
    ...type.bodyMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  actions: { gap: spacing.md },
});
