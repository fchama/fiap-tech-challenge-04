import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState, Loading } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { createPost, getPost, updatePost } from '@/services/posts';
import { colors } from '@/theme';
import { showAlert } from '@/utils/confirm';
import { errorMessage } from '@/utils/format';

interface Errors {
  title?: string;
  content?: string;
  author?: string;
}

/** Criação e edição de posts (edita quando recebe `id`). */
export default function PostFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(isEditing ? '' : (user?.name ?? ''));
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carrega os dados atuais do post ao editar.
  const loadPost = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const post = await getPost(id);
      setTitle(post.title);
      setContent(post.content);
      setAuthor(post.author);
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    const next: Errors = {};
    if (!title.trim()) next.title = 'Informe o título.';
    else if (title.trim().length > 200) next.title = 'O título deve ter no máximo 200 caracteres.';
    if (!content.trim()) next.content = 'Informe o conteúdo.';
    if (!author.trim()) next.author = 'Informe o autor.';
    else if (author.trim().length > 100) next.author = 'O autor deve ter no máximo 100 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const input = { title: title.trim(), content: content.trim(), author: author.trim() };

    setSaving(true);
    try {
      if (isEditing && id) await updatePost(id, input);
      else await createPost(input);
      router.back();
    } catch (e) {
      showAlert('Não foi possível salvar', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorState message={loadError} onRetry={loadPost} />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: isEditing ? 'Editar post' : 'Novo post' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Título" value={title} onChangeText={setTitle} error={errors.title} />
        <TextField
          label="Autor"
          value={author}
          onChangeText={setAuthor}
          error={errors.author}
          autoCapitalize="words"
        />
        <TextField
          label="Conteúdo"
          value={content}
          onChangeText={setContent}
          error={errors.content}
          multiline
        />
        <Button
          title={isEditing ? 'Salvar alterações' : 'Publicar post'}
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
