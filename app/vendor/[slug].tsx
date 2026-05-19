import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useVendor, useVendorProducts, useFollowVendor, useUnfollowVendor } from '@/hooks/useVendors';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

const { width } = Dimensions.get('window');

export default function VendorStoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: vendor, isLoading } = useVendor(slug);
  const { data: productData } = useVendorProducts(vendor?.id ?? '');
  const { mutate: follow }   = useFollowVendor();
  const { mutate: unfollow } = useUnfollowVendor();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!vendor) return null;

  const products = productData?.data ?? [];

  function renderProduct({ item }: { item: Product }) {
    return <ProductCard product={item} />;
  }

  const Header = (
    <View>
      {/* Banner */}
      {vendor.bannerUrl ? (
        <Image source={{ uri: vendor.bannerUrl }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]} />
      )}

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Vendor info */}
      <View style={styles.info}>
        <Image
          source={{
            uri: vendor.logoUrl ?? 'https://placehold.co/100x100/EDE9FE/7C3AED?text=VW',
          }}
          style={styles.avatar}
        />
        <View style={styles.meta}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <Text style={styles.followers}>
            {vendor.followerCount.toLocaleString()} followers
            {vendor.productCount ? ` · ${vendor.productCount} products` : ''}
          </Text>
          {vendor.description && (
            <Text style={styles.description} numberOfLines={3}>{vendor.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.followBtn, vendor.isFollowed && styles.followBtnActive]}
          onPress={() =>
            vendor.isFollowed ? unfollow(vendor.id) : follow(vendor.id)
          }
        >
          <Text style={[styles.followBtnText, vendor.isFollowed && styles.followBtnTextActive]}>
            {vendor.isFollowed ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.productsTitle}>Products</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyText}>No products yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { width, height: 180 },
  bannerPlaceholder: { backgroundColor: '#EDE9FE' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, fontWeight: '700', color: '#111827' },
  info: { backgroundColor: '#FFFFFF', padding: 16, gap: 8, marginTop: -24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#EDE9FE',
  },
  meta: { gap: 4, marginTop: 4 },
  vendorName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  followers: { fontSize: 13, color: '#6B7280' },
  description: { fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 4 },
  followBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    marginTop: 8,
  },
  followBtnActive: { backgroundColor: '#7C3AED' },
  followBtnText: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  followBtnTextActive: { color: '#FFFFFF' },
  productsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12, paddingHorizontal: 4 },
  emptyProducts: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
