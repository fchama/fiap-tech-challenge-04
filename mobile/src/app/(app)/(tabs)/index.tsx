import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { PostListContent } from '@/components/PostListContent';
import { useAuth } from '@/context/AuthContext';
import { colors, radius } from '@/theme';

/** Página principal: lista de posts com busca por palavra-chave. */
export default function HomeScreen() {
  const router = useRouter();
  const { isTeacher } = useAuth();
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar posts por palavra-chave"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Buscar posts"
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={styles.search}
        />
        {isTeacher && (
          <Button title="Novo" compact onPress={() => router.push('/post-form')} />
        )}
      </View>
      <PostListContent query={query} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  search: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
});
