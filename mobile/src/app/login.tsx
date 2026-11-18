import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';
import { showAlert } from '@/utils/confirm';
import { errorMessage } from '@/utils/format';

export default function LoginScreen() {
  const { signIn, signInAsGuest } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Informe o e-mail.';
    if (!password) next.password = 'Informe a senha.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // Em caso de sucesso, o guard do layout raiz leva para o app.
      await signIn(email, password);
    } catch (e) {
      showAlert('Não foi possível entrar', errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.title}>Blog Escolar</Text>
          <Text style={styles.subtitle}>Entre com sua conta de professor ou aluno</Text>
        </View>

        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="voce@escola.com"
        />
        <TextField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
          placeholder="••••••"
          onSubmitEditing={handleLogin}
        />

        <Button title="Entrar" onPress={handleLogin} loading={loading} />
        <Button
          title="Continuar como visitante"
          variant="ghost"
          onPress={signInAsGuest}
          disabled={loading}
          style={styles.guest}
        />
        <Text style={styles.hint}>
          Visitantes e alunos podem apenas visualizar os posts. Somente professores podem criar,
          editar e excluir conteúdo.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  guest: { marginTop: 8 },
  hint: { marginTop: 16, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
