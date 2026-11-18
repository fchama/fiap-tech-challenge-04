import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );

export default function TabsLayout() {
  const { isTeacher } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Posts', tabBarIcon: icon('newspaper-outline') }}
      />

      {/* Páginas administrativas: somente professores autenticados */}
      <Tabs.Protected guard={isTeacher}>
        <Tabs.Screen
          name="admin"
          options={{ title: 'Administração', tabBarLabel: 'Admin', tabBarIcon: icon('settings-outline') }}
        />
        <Tabs.Screen
          name="teachers"
          options={{ title: 'Professores', tabBarIcon: icon('school-outline') }}
        />
        <Tabs.Screen
          name="students"
          options={{ title: 'Alunos', tabBarIcon: icon('people-outline') }}
        />
      </Tabs.Protected>

      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: icon('person-circle-outline') }}
      />
    </Tabs>
  );
}
