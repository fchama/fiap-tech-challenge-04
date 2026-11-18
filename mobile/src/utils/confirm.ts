import { Alert, Platform } from 'react-native';

/** Exibe uma mensagem simples (funciona no app nativo e na web). */
export const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
};

/** Exibe um diálogo de confirmação e resolve `true` se o usuário confirmar. */
export const confirm = (title: string, message: string, confirmLabel = 'Excluir') =>
  new Promise<boolean>((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${title}\n\n${message}`));
      return;
    }

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
