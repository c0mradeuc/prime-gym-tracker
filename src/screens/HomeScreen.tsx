import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { useProfileStore } from '../store/profileStore';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const current = useWorkoutStore((s) => s.current);
  const resetDraft = useDraftStore((s) => s.reset);
  const setDraftMode = useDraftStore((s) => s.setMode);
  const name = useProfileStore((s) => s.name);
  const hasActive = !!current;

  const title = name ? `Hi, ${name}` : 'Gym Tracker';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Stay strong. Log every set.</Text>
      </View>
      <View style={styles.actions}>
        {hasActive ? (
          <PrimaryButton
            label="Resume training"
            variant="success"
            onPress={() => navigation.navigate('ActiveWorkout')}
          />
        ) : (
          <PrimaryButton
            label="Start Training"
            onPress={() => {
              resetDraft();
              navigation.navigate('SelectStartMode');
            }}
          />
        )}
        <PrimaryButton
          label="Create Routine"
          variant="secondary"
          onPress={() => {
            resetDraft();
            setDraftMode('routine');
            navigation.navigate('SelectMuscleGroups');
          }}
        />
        <PrimaryButton
          label="My Stats"
          variant="secondary"
          onPress={() => navigation.navigate('Dashboard')}
        />
        <PrimaryButton
          label="Settings"
          variant="secondary"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  header: { marginTop: spacing.xxl, marginBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs },
  actions: { gap: spacing.md },
});
