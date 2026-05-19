import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const { data: cart, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();

  function handleCheckout() {
    router.push('/checkout');
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={styles.item}>
        <Image
          source={{ uri: item.product.images[0] }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.itemVariant}>
            {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
          </Text>
          <Text style={styles.itemPrice}>₺{(item.unitPrice * item.quantity).toLocaleString('tr-TR')}</Text>
        </View>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              if (item.quantity === 1) {
                Alert.alert('Remove item', 'Remove this item from your cart?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
                ]);
              } else {
                updateItem({ itemId: item.id, quantity: item.quantity - 1 });
              }
            }}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add some merch to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
          <Text style={styles.shopBtnText}>Keep shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal ({cart.itemCount} items)</Text>
          <Text style={styles.totalValue}>₺{cart.subtotal.toLocaleString('tr-TR')}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
          <Text style={styles.checkoutBtnText}>
            Checkout · ₺{cart.total.toLocaleString('tr-TR')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  emptySubtext: { fontSize: 15, color: '#6B7280' },
  shopBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  shopBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  list: { padding: 16 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemVariant: { fontSize: 12, color: '#9CA3AF' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#7C3AED' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, color: '#374151', lineHeight: 22 },
  qty: { fontSize: 15, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },
  separator: { height: 10 },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 15, color: '#6B7280' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  checkoutBtn: {
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
