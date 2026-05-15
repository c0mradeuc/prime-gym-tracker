import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
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
import { colors, fontFamily } from './src/theme';

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
  const { t } = useTranslation();
  const language = useProfileStore((s) => s.language);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTitleStyle: {
                color: colors.text,
                fontFamily: fontFamily.bold,
                fontSize: 17,
              },
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
              options={{ title: t('nav.newTraining') }}
            />
            <Stack.Screen
              name="RoutineList"
              component={RoutineListScreen}
              options={{ title: t('nav.routines') }}
            />
            <Stack.Screen
              name="SelectMuscleGroups"
              component={SelectMuscleGroupsScreen}
              options={{ title: t('nav.muscleGroups') }}
            />
            <Stack.Screen
              name="SelectExercises"
              component={SelectExercisesScreen}
              options={{ title: t('nav.exercises') }}
            />
            <Stack.Screen
              name="ConfigureExercises"
              component={ConfigureExercisesScreen}
              options={{ title: t('nav.configure') }}
            />
            <Stack.Screen
              name="ActiveWorkout"
              component={ActiveWorkoutScreen}
              options={{ title: t('nav.training'), headerBackVisible: false }}
            />
            <Stack.Screen
              name="AddExerciseToSession"
              component={AddExerciseToSessionScreen}
              options={{ title: t('nav.addExercise'), presentation: 'modal' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: t('nav.stats') }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: t('nav.history') }}
            />
            <Stack.Screen
              name="SessionDetail"
              component={SessionDetailScreen}
              options={{ title: t('nav.session') }}
            />
            <Stack.Screen
              name="ExerciseList"
              component={ExerciseListScreen}
              options={{ title: t('nav.exercises') }}
            />
            <Stack.Screen
              name="ExerciseDetail"
              component={ExerciseDetailScreen}
              options={{ title: t('nav.progression') }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: t('nav.settings') }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
