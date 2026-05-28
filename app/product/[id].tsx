import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { toggleWishlist } from '@/api/wishlist';
import { Palette } from '@/theme/useTheme';
import type { ProductVariant } from '@/types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  // Sync wishlist state from backend (was previously hardcoded to false)
  useEffect(() => {
    if (product?.isWishlisted !== undefined) setWishlisted(!!product.isWishlisted);
  }, [product?.id, product?.isWishlisted]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Palette.brand} />
      </View>
    );
  }

  if (!product) return null;

  const variant = selectedVariant ?? product.variants[0];
  const sizes   = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const colors  = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];

  function handleAddToCart() {
    if (!variant) return;
    addToCart(
      { variantId: variant.id, qty: 1 },
      {
        onSuccess: () =>
          Alert.alert('Sepete eklendi', product!.name, [
            { text: 'Sepete Git', onPress: () => router.push('/cart') },
            { text: 'Alışverişe Devam', style: 'cancel' },
          ]),
        onError: () => Alert.alert('Hata', 'Ürün sepete eklenemedi.'),
      },
    );
  }

  async function handleShare() {
    await Share.share({ message: `${product!.name} ürününe VibeHub'tan göz at!` });
  }

  // Backend toggle returns { added: boolean } — single endpoint handles add+remove
  async function handleWishlist() {
    try {
      const added = await toggleWishlist(product!.id);
      setWishlisted(added);
    } catch {
      Alert.alert('Hata', 'İstek listesi güncellenemedi.');
    }
  }

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImage(idx);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
            ))}
          </ScrollView>
          {product.images.length > 1 && (
            <View style={styles.dots}>
              {product.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Nav buttons — Apple-style Ionicons */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistBtn} onPress={handleWishlist}>
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlisted ? '#EF4444' : '#111827'}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          {/* Vendor */}
          <TouchableOpacity onPress={() => router.push(`/vendor/${product.vendor.slug}`)}>
            <Text style={styles.vendorName}>{product.vendor.name}</Text>
          </TouchableOpacity>

          {/* Title + price */}
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₺{product.price.toLocaleString('tr-TR')}</Text>
            {product.compareAtPrice && (
              <Text style={styles.comparePrice}>
                ₺{product.compareAtPrice.toLocaleString('tr-TR')}
              </Text>
            )}
            {discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            )}
          </View>

          {/* Rating */}
          {product.rating && (
            <Text style={styles.rating}>
              ★ {product.rating.toFixed(1)} ({product.reviewCount} değerlendirme)
            </Text>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Beden</Text>
              <View style={styles.optionRow}>
                {sizes.map((size) => {
                  const v = product.variants.find(
                    (v) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color),
                  );
                  const active = selectedVariant?.size === size;
                  const outOfStock = v ? v.stock === 0 : true;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeChip, active && styles.sizeChipActive, outOfStock && styles.sizeChipOOS]}
                      onPress={() => !outOfStock && setSelectedVariant(v ?? null)}
                      disabled={outOfStock}
                    >
                      <Text style={[styles.sizeText, active && styles.sizeTextActive]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Renk</Text>
              <View style={styles.optionRow}>
                {colors.map((color) => {
                  const v = product.variants.find(
                    (v) => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size),
                  );
                  const active = selectedVariant?.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorChip, active && styles.colorChipActive]}
                      onPress={() => setSelectedVariant(v ?? null)}
                    >
                      <Text style={[styles.sizeText, active && styles.sizeTextActive]}>{color}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.optionLabel}>Ürün hakkında</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to cart CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={[styles.addBtn, addingToCart && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart || !variant || variant.stock === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>
            {variant?.stock === 0
              ? 'Stokta yok'
              : addingToCart
              ? 'Ekleniyor…'
              : 'Sepete Ekle'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gallery: { width, height: width, position: 'relative' },
  galleryImage: { width, height: width },
  dots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 18 },
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
  backIcon: { fontSize: 18, color: '#111827', fontWeight: '700' },
  shareBtn: {
    position: 'absolute',
    top: 52,
    right: 56,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: { fontSize: 16, color: '#111827', fontWeight: '700' },
  wishlistBtn: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: { fontSize: 18, color: '#9333EA' },
  info: { padding: 20, gap: 10 },
  vendorName: { fontSize: 13, color: '#9333EA', fontWeight: '600', textTransform: 'uppercase' },
  productName: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 28 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 22, fontWeight: '800', color: '#9333EA' },
  comparePrice: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  rating: { fontSize: 14, color: '#F59E0B' },
  optionSection: { gap: 8, marginTop: 4 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  sizeChipActive: { borderColor: '#9333EA', backgroundColor: '#F5F3FF' },
  sizeChipOOS: { opacity: 0.4 },
  colorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  colorChipActive: { borderColor: '#9333EA', backgroundColor: '#F5F3FF' },
  sizeText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  sizeTextActive: { color: '#9333EA', fontWeight: '700' },
  descSection: { gap: 8, marginTop: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  cta: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addBtn: {
    height: 52,
    backgroundColor: '#9333EA',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333EA',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
