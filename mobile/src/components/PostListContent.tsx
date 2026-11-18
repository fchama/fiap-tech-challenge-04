import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { EmptyState, ErrorState, Loading } from '@/components/StateViews';
import { useDebounce } from '@/hooks/useDebounce';
import { deletePost, listPosts, searchPosts } from '@/services/posts';
import { colors } from '@/theme';
import type { Post } from '@/types';
import { confirm, showAlert } from '@/utils/confirm';
import { errorMessage } from '@/utils/format';

interface Props {
  /** Texto de busca (a lista não filtra quando vazio) */
  query?: string;
  /** Exibe botões de editar/excluir em cada item (tela administrativa) */
  admin?: boolean;
}

/** Lista de posts com busca, pull-to-refresh e (opcionalmente) ações de administração. */
export function PostListContent({ query = '', admin = false }: Props) {
  const router = useRouter();
  const debouncedQuery = useDebounce(query.trim());

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'refresh') setRefreshing(true);
      setError(null);
      try {
        setPosts(debouncedQuery ? await searchPosts(debouncedQuery) : await listPosts());
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setRefreshing(false);
      }
    },
    [debouncedQuery]
  );

  // Recarrega ao focar a tela e quando a busca muda.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleDelete = async (post: Post) => {
    const ok = await confirm('Excluir post', `Deseja excluir "${post.title}"?`);
    if (!ok) return;
    try {
      await deletePost(post._id);
      await load();
    } catch (e) {
      showAlert('Não foi possível excluir', errorMessage(e));
    }
  };

  if (posts === null && !error) return <Loading />;
  if (posts === null && error) return <ErrorState message={error} onRetry={load} />;

  return (
    <FlatList
      data={posts ?? []}
      keyExtractor={(item) => item._id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      style={styles.list}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} />}
      ListEmptyComponent={
        error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <EmptyState
            message={
              debouncedQuery
                ? `Nenhum post encontrado para "${debouncedQuery}".`
                : 'Nenhum post publicado ainda.'
            }
          />
        )
      }
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() => router.push({ pathname: '/post/[id]', params: { id: item._id } })}
          onEdit={
            admin
              ? () => router.push({ pathname: '/post-form', params: { id: item._id } })
              : undefined
          }
          onDelete={admin ? () => handleDelete(item) : undefined}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: 16, flexGrow: 1 },
});
