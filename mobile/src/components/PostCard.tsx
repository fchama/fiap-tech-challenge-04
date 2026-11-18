import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, radius } from '@/theme';
import type { Post } from '@/types';
import { excerpt, formatDate } from '@/utils/format';

interface Props {
  post: Post;
  onPress: () => void;
  /** Quando informados, exibe os botões de ação (tela administrativa) */
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostCard({ post, onPress, onEdit, onDelete }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir post ${post.title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={styles.meta}>
        {post.author} · {formatDate(post.createdAt)}
      </Text>
      <Text style={styles.excerpt}>{excerpt(post.content)}</Text>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && <Button title="Editar" onPress={onEdit} variant="secondary" compact />}
          {onDelete && <Button title="Excluir" onPress={onDelete} variant="danger" compact />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { marginTop: 4, fontSize: 13, color: colors.primary, fontWeight: '500' },
  excerpt: { marginTop: 8, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
