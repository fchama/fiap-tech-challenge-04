import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';
import { Button } from './Button';

interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;

  return (
    <View style={styles.row}>
      <Button
        title="Anterior"
        variant="secondary"
        compact
        disabled={page <= 1}
        onPress={() => onChange(page - 1)}
      />
      <Text style={styles.label}>
        Página {page} de {pages}
      </Text>
      <Button
        title="Próxima"
        variant="secondary"
        compact
        disabled={page >= pages}
        onPress={() => onChange(page + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: { color: colors.textMuted, fontSize: 14 },
});
