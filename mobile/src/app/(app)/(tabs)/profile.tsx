import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config';
import { colors, radius } from '@/theme';

const ROLE_LABEL = { teacher: 'Professor', student: 'Aluno' } as const;

export default function ProfileScreen() {
  const { user, isGuest, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user ? user.name : 'Visitante'}</Text>
        {user ? (
          <>
            <Text style={styles.detail}>{user.email}</Text>
            <Text style={styles.badge}>{ROLE_LABEL[user.role]}</Text>
          </>
        ) : (
          <Text style={styles.detail}>Você está navegando sem login (somente leitura).</Text>
        )}
      </View>

      <Button
        title={isGuest ? 'Entrar com uma conta' : 'Sair'}
        variant={isGuest ? 'primary' : 'danger'}
        onPress={() => void signOut()}
      />

      <Text style={styles.api}>API: {API_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background, gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  detail: { marginTop: 4, fontSize: 15, color: colors.textMuted },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  api: { marginTop: 'auto', textAlign: 'center', fontSize: 12, color: colors.textMuted },
});
