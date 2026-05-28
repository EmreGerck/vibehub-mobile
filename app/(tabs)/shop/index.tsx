import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useTheme, Palette } from '@/theme/useTheme';
import type { Product } from '@/types';

const SORT_OPTIONS = [
  { key: 'newest',     label: 'Yeni' },
  { key: 'popular',    label: 'Popüler' },
  { key: 'price_asc',  label: 'Fiyat ↑' },
  { key: 'price_desc', label: 'Fiyat ↓' },
] as const;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((s) => s.itemCount);
  const t = useTheme();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [query, setQuery]   = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProducts({ search: query, sortBy: sortBy as any });

  const products = data?.pages.flatMap((p) => p.data) ?? [];

  const handleSearch = useCallback(() => setQuery(search.trim()), [search]);

  function renderProduct({ item }: { item: Product }) {
    return <ProductCard product={item} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bgBody, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.textPrimary }]}>Mağaza</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push('/cart')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={itemCount > 0 ? 'bag' : 'bag-outline'} size={26} color={t.textPrimary} />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchInputWrap, { backgroundColor: t.bgCard, borderColor: t.borderPrimary }]}>
          <Ionicons name="search" size={18} color={t.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: t.textPrimary }]}
            placeholder="Ürün veya sanatçı ara…"
            placeholderTextColor={t.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: Palette.brand }]} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {/* Sort chips — fixed-height row (was rendering 600px tall in web before)
          ScrollView was inheriting `flex: 1` and stretching vertically;
          replaced with a plain row View with horizontal overflow. */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.chip,
                { backgroundColor: t.bgCard, borderColor: t.borderPrimary },
                active && { backgroundColor: Palette.brand, borderColor: Palette.brand },
              ]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={[styles.chipText, { color: t.textSecondary }, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Product grid */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Palette.brand} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={Palette.brand} style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={48} color={t.textMuted} />
              <Text style={[styles.emptyText, { color: t.textMuted }]}>Ürün bulunamadı</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 28, fontWeight: '800' },
  cartBtn: { position: 'relative', padding: 4 },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  searchInputWrap: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },
  searchBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  // Fixed-height chip row — flex direction row, no vertical stretch
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12, paddingHorizontal: 4 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16 },
});
