import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from './src/i18n';
import { RootStackParamList } from './src/navigation';
import { useProfileStore } from './src/store/profileStore';
import { ActiveWorkoutScreen } from './src/screens/ActiveWorkoutScreen';
import { AddExerciseToSessionScreen } from './src/screens/AddExerciseToSessionScreen';
import { ConfigureExercisesScreen } from './src/screens/ConfigureExercisesScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ExerciseDetailScreen } from './src/screens/ExerciseDetailScreen';
import { ExerciseListScreen } from './src/screens/ExerciseListScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RoutineListScreen } from './src/screens/RoutineListScreen';
import { SelectExercisesScreen } from './src/screens/SelectExercisesScreen';
import { SelectMuscleGroupsScreen } from './src/screens/SelectMuscleGroupsScreen';
import { SelectStartModeScreen } from './src/screens/SelectStartModeScreen';
import { SessionDetailScreen } from './src/screens/SessionDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.primary,
  },
};

export default function App() {
  const language = useProfileStore((s) => s.language);
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTitleStyle: { color: colors.text, fontWeight: '700' },
              headerTintColor: colors.primary,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SelectStartMode"
              component={SelectStartModeScreen}
              options={{ title: 'New training' }}
            />
            <Stack.Screen
              name="RoutineList"
              component={RoutineListScreen}
              options={{ title: 'Routines' }}
            />
            <Stack.Screen
              name="SelectMuscleGroups"
              component={SelectMuscleGroupsScreen}
              options={{ title: 'Muscle groups' }}
            />
            <Stack.Screen
              name="SelectExercises"
              component={SelectExercisesScreen}
              options={{ title: 'Exercises' }}
            />
            <Stack.Screen
              name="ConfigureExercises"
              component={ConfigureExercisesScreen}
              options={{ title: 'Configure' }}
            />
            <Stack.Screen
              name="ActiveWorkout"
              component={ActiveWorkoutScreen}
              options={{ title: 'Training', headerBackVisible: false }}
            />
            <Stack.Screen
              name="AddExerciseToSession"
              component={AddExerciseToSessionScreen}
              options={{ title: 'Add exercise', presentation: 'modal' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Stats' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'History' }}
            />
            <Stack.Screen
              name="SessionDetail"
              component={SessionDetailScreen}
              options={{ title: 'Session' }}
            />
            <Stack.Screen
              name="ExerciseList"
              component={ExerciseListScreen}
              options={{ title: 'Exercises' }}
            />
            <Stack.Screen
              name="ExerciseDetail"
              component={ExerciseDetailScreen}
              options={{ title: 'Progression' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
