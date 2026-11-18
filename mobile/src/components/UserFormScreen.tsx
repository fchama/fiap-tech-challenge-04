import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState, Loading } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { createUser, getUser, updateUser } from '@/services/users';
import { colors } from '@/theme';
import type { UserKind } from '@/types';
import { showAlert } from '@/utils/confirm';
import { errorMessage } from '@/utils/format';

const LABELS = {
  teachers: { singular: 'professor', extra: 'Disciplina', article: 'o' },
  students: { singular: 'aluno', extra: 'Turma', article: 'o' },
} as const;

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

/** Formulário de criação/edição (professores e alunos). Edita quando recebe `id`. */
export function UserFormScreen({ kind }: { kind: UserKind }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const labels = LABELS[kind];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extra, setExtra] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carrega os dados atuais ao editar.
  const loadUser = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getUser(kind, id);
      setName(data.name);
      setEmail(data.email);
      setExtra((kind === 'teachers' ? data.subject : data.grade) ?? '');
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Informe o nome.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Informe um e-mail válido.';
    if (!isEditing && password.length < 6) next.password = 'A senha deve ter ao menos 6 caracteres.';
    if (isEditing && password && password.length < 6)
      next.password = 'A senha deve ter ao menos 6 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const input = {
      name: name.trim(),
      email: email.trim(),
      ...(password ? { password } : {}),
      ...(kind === 'teachers' ? { subject: extra.trim() } : { grade: extra.trim() }),
    };

    setSaving(true);
    try {
      if (isEditing && id) await updateUser(kind, id, input);
      else await createUser(kind, input);
      router.back();
    } catch (e) {
      showAlert('Não foi possível salvar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const title = `${isEditing ? 'Editar' : 'Novo'} ${labels.singular}`;

  if (loading) return <Loading />;
  if (loadError) return <ErrorState message={loadError} onRetry={loadUser} />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Nome"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
        />
        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label={isEditing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextField label={`${labels.extra} (opcional)`} value={extra} onChangeText={setExtra} />

        <Button
          title={isEditing ? 'Salvar alterações' : `Cadastrar ${labels.singular}`}
          onPress={handleSave}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
});
