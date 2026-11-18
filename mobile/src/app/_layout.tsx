import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { Loading } from '@/components/StateViews';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

function RootNavigator() {
  const { loading, hasSession } = useAuth();

  return (
    <View style={styles.flex}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Sem sessão: apenas a tela de login */}
        <Stack.Protected guard={!hasSession}>
          <Stack.Screen name="login" />
        </Stack.Protected>

        {/* Com sessão (professor, aluno ou visitante): app */}
        <Stack.Protected guard={hasSession}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>

      {/* Cobre a tela enquanto a sessão salva é restaurada (evita piscar o login) */}
      {loading && (
        <View style={styles.overlay}>
          <Loading />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
});
