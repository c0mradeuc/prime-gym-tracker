import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  title: string;
  body: string;
  size?: number;
  style?: ViewStyle;
};

export const InfoButton: React.FC<Props> = ({
  title,
  body,
  size = 18,
  style,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={[
          styles.btn,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        <Text style={[styles.btnText, { fontSize: size * 0.7 }]}>i</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={styles.backdrop}
        >
          <Pressable onPress={() => null} style={styles.dialog}>
            <Text style={styles.title}>{title}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.body}>{body}</Text>
            </ScrollView>
            <Pressable
              onPress={() => setOpen(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>{t('components.infoGotIt')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: colors.textMuted,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  closeText: { color: '#fff', fontWeight: '700' },
});
