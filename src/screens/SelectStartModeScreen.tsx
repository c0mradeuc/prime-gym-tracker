import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation';
import { useRoutineStore } from '../store/routineStore';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectStartMode'>;

export const SelectStartModeScreen: React.FC<Props> = ({ navigation }) => {
  const routineCount = useRoutineStore((s) => s.routines.length);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.body}>
        <Text style={styles.title}>How do you want to start?</Text>
        <Text style={styles.subtitle}>
          Pick a saved routine or build today&apos;s workout from muscle groups.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label={
              routineCount > 0
                ? `Use a routine (${routineCount})`
                : 'Use a routine'
            }
            disabled={routineCount === 0}
            onPress={() => navigation.navigate('RoutineList')}
          />
          <PrimaryButton
            label="Pick muscle groups"
            variant="secondary"
            onPress={() => navigation.navigate('SelectMuscleGroups')}
          />
        </View>

        {routineCount === 0 ? (
          <Text style={styles.hint}>
            No routines saved yet — tap &quot;Create Routine&quot; on the home
            screen to save one.
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  actions: { gap: spacing.md },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xl,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
