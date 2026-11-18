import { Stack } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

export default function AppLayout() {
  const { isTeacher } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />

      {/* Telas de criação/edição: somente professores autenticados */}
      <Stack.Protected guard={isTeacher}>
        <Stack.Screen name="post-form" />
        <Stack.Screen name="teacher-form" />
        <Stack.Screen name="student-form" />
      </Stack.Protected>
    </Stack>
  );
}
