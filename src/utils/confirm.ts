import { Alert, Platform } from 'react-native';

type Options = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const confirmAction = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: Options) => {
  if (Platform.OS === 'web') {
    const ok = window.confirm(message ? `${title}\n\n${message}` : title);
    if (ok) onConfirm();
    else onCancel?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel', onPress: onCancel },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
};
