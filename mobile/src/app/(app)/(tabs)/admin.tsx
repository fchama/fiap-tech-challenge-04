import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PostListContent } from '@/components/PostListContent';
import { colors } from '@/theme';

/** Página administrativa: todos os posts com editar/excluir. */
export default function AdminScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar posts</Text>
        <Button title="Novo post" compact onPress={() => router.push('/post-form')} />
      </View>
      <PostListContent admin />
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
  title: { fontSize: 14, color: colors.textMuted },
});
