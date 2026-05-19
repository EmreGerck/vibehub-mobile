import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { mutate: cancel, isPending: cancelling } = useCancelOrder();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!order) return null;

  function handleCancel() {
    Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () => cancel(id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status */}
      <View style={styles.statusCard}>
        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        <Text style={styles.statusText}>{order.status}</Text>
        {order.trackingNumber && (
          <Text style={styles.tracking}>Tracking: {order.trackingNumber}</Text>
        )}
        <Text style={styles.date}>
          Placed {new Date(order.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.itemVariant}>
                {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
              </Text>
              <Text style={styles.itemPrice}>
                {item.quantity} × ₺{item.unitPrice.toLocaleString('tr-TR')}
              </Text>
            </View>
            <Text style={styles.itemTotal}>₺{item.total.toLocaleString('tr-TR')}</Text>
          </View>
        ))}
      </View>

      {/* Shipping address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
          <Text style={styles.addressLine}>{order.shippingAddress.line1}</Text>
          {order.shippingAddress.line2 && (
            <Text style={styles.addressLine}>{order.shippingAddress.line2}</Text>
          )}
          <Text style={styles.addressLine}>
            {order.shippingAddress.city}
            {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}
          </Text>
          <Text style={styles.addressLine}>{order.shippingAddress.phone}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₺{order.subtotal.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>₺{order.shippingFee.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>₺{order.total.toLocaleString('tr-TR')}</Text>
          </View>
        </View>
      </View>

      {/* Cancel button */}
      {['PENDING', 'CONFIRMED'].includes(order.status) && (
        <TouchableOpacity
          style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
          onPress={handleCancel}
          disabled={cancelling}
        >
          <Text style={styles.cancelBtnText}>
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  statusCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  orderNumber: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  statusText: { fontSize: 22, fontWeight: '700', color: '#DDD6FE' },
  tracking: { fontSize: 13, color: '#C4B5FD', marginTop: 4 },
  date: { fontSize: 13, color: '#C4B5FD' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    alignItems: 'center',
  },
  itemImg: { width: 60, height: 60, borderRadius: 8 },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemVariant: { fontSize: 12, color: '#9CA3AF' },
  itemPrice: { fontSize: 13, color: '#6B7280' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 3,
  },
  addressName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  addressLine: { fontSize: 14, color: '#6B7280' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  summaryTotalValue: { fontSize: 16, fontWeight: '800', color: '#7C3AED' },
  cancelBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
