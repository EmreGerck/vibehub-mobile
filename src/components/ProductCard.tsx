import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import type { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  product: Product;
  onWishlistToggle?: (product: Product) => void;
}

export function ProductCard({ product, onWishlistToggle }: Props) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.images[0] ?? 'https://placehold.co/300x300/EDE9FE/7C3AED?text=VW' }}
          style={styles.image}
          resizeMode="cover"
        />
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => onWishlistToggle?.(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.wishlistIcon}>
            {product.isWishlisted ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.vendorName} numberOfLines={1}>
          {product.vendor.name}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₺{product.price.toLocaleString('tr-TR')}</Text>
          {product.compareAtPrice && (
            <Text style={styles.comparePrice}>
              ₺{product.compareAtPrice.toLocaleString('tr-TR')}
            </Text>
          )}
        </View>
        {product.rating && (
          <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageWrap: {
    width: '100%',
    height: CARD_WIDTH,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: { fontSize: 16, color: '#7C3AED' },
  info: { padding: 10, gap: 2 },
  vendorName: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', textTransform: 'uppercase' },
  productName: { fontSize: 13, color: '#111827', fontWeight: '600', lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  comparePrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  rating: { fontSize: 12, color: '#F59E0B', marginTop: 2 },
});
