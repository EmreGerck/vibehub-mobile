import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { FeedItem } from '../types';

const TYPE_LABEL: Record<string, string> = {
  new_product: 'New product',
  new_drop:    'New drop',
  event:       'Event',
  forum_post:  'Forum post',
};

interface Props {
  item: FeedItem;
}

export function FeedCard({ item }: Props) {
  function handlePress() {
    if (item.product) router.push(`/product/${item.product.id}`);
    else router.push(`/vendor/${item.vendor.slug}`);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.92}>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.body}>
        <View style={styles.header}>
          <Image
            source={{
              uri: item.vendor.logoUrl ?? 'https://placehold.co/40x40/EDE9FE/7C3AED?text=VW',
            }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.vendorName}>{item.vendor.name}</Text>
            <Text style={styles.meta}>
              {TYPE_LABEL[item.type] ?? item.type} · {timeAgo(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.product && (
          <View style={styles.productTag}>
            <Text style={styles.productTagText}>
              ₺{item.product.price.toLocaleString('tr-TR')} → View product
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: { width: '100%', height: 200 },
  body: { padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDE9FE' },
  headerText: { flex: 1 },
  vendorName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#1F2937', lineHeight: 22 },
  productTag: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  productTagText: { fontSize: 13, color: '#7C3AED', fontWeight: '600' },
});
