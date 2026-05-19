import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, removeFromWishlist } from '@/api/wishlist';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

export default function WishlistScreen() {
  const qc = useQueryClient();
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });
  const { mutate: remove } = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  function renderItem({ item }: { item: Product }) {
    return (
      <ProductCard
        product={{ ...item, isWishlisted: true }}
        onWishlistToggle={(p) => remove(p.id)}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      style={styles.container}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>Tap the heart on any product to save it</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 12, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12, paddingHorizontal: 4 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 52, color: '#7C3AED' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
});
