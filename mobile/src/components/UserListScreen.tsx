import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { EmptyState, ErrorState, Loading } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { deleteUser, listUsers } from '@/services/users';
import { colors, radius } from '@/theme';
import type { Paginated, User, UserKind } from '@/types';
import { confirm, showAlert } from '@/utils/confirm';
import { errorMessage } from '@/utils/format';

const LABELS = {
  teachers: {
    singular: 'professor',
    plural: 'Professores',
    extra: 'Disciplina',
    form: '/teacher-form',
    empty: 'Nenhum professor cadastrado.',
  },
  students: {
    singular: 'aluno',
    plural: 'Alunos',
    extra: 'Turma',
    form: '/student-form',
    empty: 'Nenhum aluno cadastrado.',
  },
} as const;

/** Listagem paginada com botões de editar e excluir (professores e alunos). */
export function UserListScreen({ kind }: { kind: UserKind }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const labels = LABELS[kind];

  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number, mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const data = await listUsers(kind, targetPage);
        // Se a última página ficou vazia (exclusões), volta uma página.
        if (data.data.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
          return;
        }
        setResult(data);
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [kind]
  );

  // Recarrega ao focar a tela (ex.: depois de criar/editar) e ao trocar de página.
  useFocusEffect(
    useCallback(() => {
      void load(page);
    }, [load, page])
  );

  const handleDelete = async (item: User) => {
    const ok = await confirm(
      `Excluir ${labels.singular}`,
      `Deseja realmente excluir ${item.name}? Esta ação não pode ser desfeita.`
    );
    if (!ok) return;

    try {
      await deleteUser(kind, item._id);
      await load(page);
    } catch (e) {
      showAlert('Não foi possível excluir', errorMessage(e));
    }
  };

  const goToForm = (id?: string) =>
    router.push({ pathname: labels.form, params: id ? { id } : {} });

  if (loading && !result) return <Loading />;
  if (error && !result) return <ErrorState message={error} onRetry={() => load(page)} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.total}>
          {result?.total ?? 0} {result?.total === 1 ? labels.singular : labels.plural.toLowerCase()}
        </Text>
        <Button title={`Novo ${labels.singular}`} onPress={() => goToForm()} compact />
      </View>

      {!!error && <Text style={styles.inlineError}>{error}</Text>}

      <FlatList
        data={result?.data ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(page, 'refresh')} />
        }
        ListEmptyComponent={<EmptyState message={labels.empty} />}
        renderItem={({ item }) => {
          const extra = kind === 'teachers' ? item.subject : item.grade;
          const isMe = item._id === me?._id && kind === 'teachers';
          return (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.name}
                {isMe ? ' (você)' : ''}
              </Text>
              <Text style={styles.detail}>{item.email}</Text>
              {!!extra && (
                <Text style={styles.detail}>
                  {labels.extra}: {extra}
                </Text>
              )}
              <View style={styles.actions}>
                <Button
                  title="Editar"
                  variant="secondary"
                  compact
                  onPress={() => goToForm(item._id)}
                />
                <Button
                  title="Excluir"
                  variant="danger"
                  compact
                  disabled={isMe}
                  onPress={() => handleDelete(item)}
                />
              </View>
            </View>
          );
        }}
      />

      <Pagination page={result?.page ?? 1} pages={result?.pages ?? 1} onChange={setPage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  total: { fontSize: 14, color: colors.textMuted },
  inlineError: { color: colors.danger, paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  detail: { marginTop: 2, fontSize: 14, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
