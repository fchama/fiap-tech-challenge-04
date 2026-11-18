import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ErrorState, Loading } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { deletePost, getPost } from '@/services/posts';
import { colors } from '@/theme';
import type { Post } from '@/types';
import { confirm, showAlert } from '@/utils/confirm';
import { errorMessage, formatDate } from '@/utils/format';

/** Página de leitura: conteúdo completo do post. */
export default function PostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTeacher } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPost(await getPost(id));
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [id]);

  // Recarrega ao voltar da edição.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleDelete = async () => {
    if (!post) return;
    const ok = await confirm('Excluir post', `Deseja excluir "${post.title}"?`);
    if (!ok) return;
    try {
      await deletePost(post._id);
      router.back();
    } catch (e) {
      showAlert('Não foi possível excluir', errorMessage(e));
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!post) return <Loading />;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        Por {post.author} · {formatDate(post.createdAt)}
        {post.updatedAt !== post.createdAt ? ' (editado)' : ''}
      </Text>
      <Text style={styles.body}>{post.content}</Text>

      {isTeacher && (
        <View style={styles.actions}>
          <Button
            title="Editar"
            variant="secondary"
            style={styles.flex}
            onPress={() => router.push({ pathname: '/post-form', params: { id: post._id } })}
          />
          <Button title="Excluir" variant="danger" style={styles.flex} onPress={handleDelete} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  meta: { marginTop: 8, fontSize: 14, color: colors.primary, fontWeight: '500' },
  body: { marginTop: 20, fontSize: 17, lineHeight: 26, color: colors.text },
  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  flex: { flex: 1 },
});
