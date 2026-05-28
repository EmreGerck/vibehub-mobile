import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';

const STATUS_COLOR: Record<OrderStatus, string> = {
  PLACED:           '#F59E0B',
  CONFIRMED:        '#3B82F6',
  SHIPPED:          '#7C3AED',
  DELIVERED:        '#10B981',
  CANCELLED:        '#EF4444',
  REFUND_REQUESTED: '#F97316',
  REFUNDED:         '#6B7280',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED:           'Alındı',
  CONFIRMED:        'Onaylandı',
  SHIPPED:          'Kargoda',
  DELIVERED:        'Teslim Edildi',
  CANCELLED:        'İptal Edildi',
  REFUND_REQUESTED: 'İade Bekliyor',
  REFUNDED:         'İade Edildi',
};

export default function OrdersScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useOrders();
  const orders = data?.pages.flatMap((p) => p.data) ?? [];

  function renderOrder({ item }: { item: Order }) {
    const color = STATUS_COLOR[item.status];
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/order/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${color}1A` }]}>
            <Text style={[styles.statusText, { color }]}>{STATUS_LABEL[item.status]}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
        <Text style={styles.orderItems}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''} · ₺{item.total.toLocaleString('tr-TR')}
        </Text>
        {item.trackingNumber && (
          <Text style={styles.tracking}>Tracking: {item.trackingNumber}</Text>
        )}
      </TouchableOpacity>
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
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrder}
      contentContainerStyle={styles.list}
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Your orders will appear here</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator size="small" color="#7C3AED" style={{ margin: 16 }} /> : null
      }
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 10 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  orderDate: { fontSize: 13, color: '#9CA3AF' },
  orderItems: { fontSize: 14, color: '#374151', fontWeight: '500' },
  tracking: { fontSize: 13, color: '#7C3AED', fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
});
