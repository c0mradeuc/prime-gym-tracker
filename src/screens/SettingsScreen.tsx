import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n, { Language, SUPPORTED_LANGUAGES } from '../i18n';
import { RootStackParamList } from '../navigation';
import { useProfileStore } from '../store/profileStore';
import { colors, elevation, fontFamily, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const clampNumber = (raw: string, min: number, max: number, decimal: boolean): number => {
  const cleaned = raw.replace(',', '.').trim();
  if (!cleaned) return 0;
  const parsed = decimal ? parseFloat(cleaned) : parseInt(cleaned, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(min, Math.min(max, decimal ? +parsed.toFixed(2) : parsed));
};

export const SettingsScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const name = useProfileStore((s) => s.name);
  const age = useProfileStore((s) => s.age);
  const weight = useProfileStore((s) => s.weight);
  const height = useProfileStore((s) => s.height);
  const language = useProfileStore((s) => s.language);
  const setName = useProfileStore((s) => s.setName);
  const setAge = useProfileStore((s) => s.setAge);
  const setWeight = useProfileStore((s) => s.setWeight);
  const setHeight = useProfileStore((s) => s.setHeight);
  const setLanguage = useProfileStore((s) => s.setLanguage);

  const [nameDraft, setNameDraft] = useState(name);
  const [ageDraft, setAgeDraft] = useState(age ? String(age) : '');
  const [weightDraft, setWeightDraft] = useState(weight ? String(weight) : '');
  const [heightDraft, setHeightDraft] = useState(height ? String(height) : '');

  useEffect(() => setNameDraft(name), [name]);
  useEffect(() => setAgeDraft(age ? String(age) : ''), [age]);
  useEffect(() => setWeightDraft(weight ? String(weight) : ''), [weight]);
  useEffect(() => setHeightDraft(height ? String(height) : ''), [height]);

  const commitAge = () => {
    const v = clampNumber(ageDraft, 0, 120, false);
    setAge(v);
    setAgeDraft(v ? String(v) : '');
  };
  const commitWeight = () => {
    const v = clampNumber(weightDraft, 0, 300, true);
    setWeight(v);
    setWeightDraft(v ? String(v) : '');
  };
  const commitHeight = () => {
    const v = clampNumber(heightDraft, 0, 250, false);
    setHeight(v);
    setHeightDraft(v ? String(v) : '');
  };

  const pickLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const languageLabels: Record<Language, string> = {
    en: t('settings.languageEnglish'),
    es: t('settings.languageSpanish'),
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>{t('settings.intro')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.language')}</Text>
            <View style={styles.segmentRow}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = language === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => pickLanguage(lang)}
                    style={({ pressed }) => [
                      styles.segment,
                      active && styles.segmentActive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        active && styles.segmentTextActive,
                      ]}
                    >
                      {languageLabels[lang]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.name')}</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              onBlur={() => setName(nameDraft.trim())}
              onSubmitEditing={() => setName(nameDraft.trim())}
              placeholder={t('settings.namePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.age')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={ageDraft}
                onChangeText={setAgeDraft}
                onBlur={commitAge}
                onSubmitEditing={commitAge}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.inputFlex]}
                keyboardType="number-pad"
                inputMode="numeric"
                returnKeyType="done"
                selectTextOnFocus
              />
              <Text style={styles.unit}>{t('units.year', { count: age })}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.height')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={heightDraft}
                onChangeText={setHeightDraft}
                onBlur={commitHeight}
                onSubmitEditing={commitHeight}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.inputFlex]}
                keyboardType="number-pad"
                inputMode="numeric"
                returnKeyType="done"
                selectTextOnFocus
              />
              <Text style={styles.unit}>{t('units.cm')}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.bodyweight')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={weightDraft}
                onChangeText={setWeightDraft}
                onBlur={commitWeight}
                onSubmitEditing={commitWeight}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.inputFlex]}
                keyboardType="decimal-pad"
                inputMode="decimal"
                returnKeyType="done"
                selectTextOnFocus
              />
              <Text style={styles.unit}>{t('units.kg')}</Text>
            </View>
            {weight === 0 ? (
              <Text style={styles.hint}>{t('settings.hintBodyweight')}</Text>
            ) : null}
          </View>

          <Text style={styles.footer}>{t('settings.autosave')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  intro: {
    ...type.bodyMuted,
  },
  field: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...elevation(1),
  },
  label: {
    ...type.micro,
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  input: {
    color: colors.text,
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '50%',
  },
  inputFlex: {
    flex: 1,
  },
  unit: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fontFamily.bold,
    minWidth: 44,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  segmentTextActive: {
    color: '#fff',
  },
  hint: {
    ...type.caption,
  },
  footer: {
    ...type.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
