import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { exerciseById, muscleGroupById } from '../data/catalog';
import { RootStackParamList } from '../navigation';
import { useDraftStore } from '../store/draftStore';
import { useRoutineStore } from '../store/routineStore';
import { colors, radius, spacing } from '../theme';
import { confirmAction } from '../utils/confirm';
import { formatDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineList'>;

export const RoutineListScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const routines = useRoutineStore((s) => s.routines);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);
  const loadFromRoutine = useDraftStore((s) => s.loadFromRoutine);

  const onDelete = (id: string, name: string) => {
    confirmAction({
      title: t('routines.deleteTitle'),
      message: t('routines.deleteMessage', { name }),
      confirmLabel: t('routines.deleteConfirm'),
      destructive: true,
      onConfirm: () => deleteRoutine(id),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={routines}
        keyExtractor={(r) => r.id}
        contentContainerStyle={
          routines.length === 0
            ? styles.emptyWrap
            : { padding: spacing.lg, paddingBottom: spacing.xxl }
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{t('routines.empty')}</Text>
        }
        renderItem={({ item }) => {
          const exNames = item.exercises
            .slice(0, 4)
            .map((e) => t(`exercise.${e.exerciseId}`));
          const remaining = item.exercises.length - exNames.length;
          const muscles = item.muscleGroups
            .map((m) => muscleGroupById(m)?.emoji)
            .filter(Boolean)
            .join(' ');
          return (
            <Pressable
              style={styles.row}
              onPress={() => {
                loadFromRoutine(item);
                navigation.navigate('ConfigureExercises');
              }}
            >
              <View style={styles.rowHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Pressable
                  onPress={() => onDelete(item.id, item.name)}
                  hitSlop={8}
                >
                  <Text style={styles.delete}>{t('routines.delete')}</Text>
                </Pressable>
              </View>
              <Text style={styles.meta}>
                {t('routines.meta', {
                  count: item.exercises.length,
                  muscles,
                  date: formatDate(item.createdAt, 'MMM d'),
                })}
              </Text>
              <Text style={styles.exList}>
                {exNames.join(' · ')}
                {remaining > 0 ? ` · ${t('routines.more', { count: remaining })}` : ''}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  empty: { color: colors.textMuted, textAlign: 'center' },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { color: colors.text, fontWeight: '700', fontSize: 16 },
  delete: { color: colors.danger, fontWeight: '600', fontSize: 12 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  exList: { color: colors.text, fontSize: 13, marginTop: spacing.sm },
});
