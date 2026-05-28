import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import type { CartItem } from '@/types';

export default function CartTabScreen() {
  // Cart used to be a tab — now it's a regular Stack screen pushed from any
  // top-right bag icon. Custom header carries title + item count + back button.
  const { data: cart, isLoading } = useCart();
  const itemCount = useCartStore((s) => s.itemCount);
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();

  function handleCheckout() {
    router.push('/checkout');
  }

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  }

  function handleRemove(variantId: string) {
    Alert.alert('Sepetten Çıkar', 'Bu ürünü sepetinden çıkarmak istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkar', style: 'destructive', onPress: () => removeItem(variantId) },
    ]);
  }

  function renderItem({ item }: { item: CartItem }) {
    const variantLabel = [item.variant?.attributes?.size, item.variant?.attributes?.color]
      .filter(Boolean).join(' · ');
    return (
      <View style={styles.item}>
        <Image
          source={{ uri: item.product.images[0] }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product.title}
          </Text>
          {variantLabel ? <Text style={styles.itemVariant}>{variantLabel}</Text> : null}
          <Text style={styles.itemPrice}>
            ₺{item.lineTotal.toLocaleString('tr-TR')}
          </Text>
        </View>
        <View style={styles.controls}>
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                if (item.qty === 1) {
                  handleRemove(item.variantId);
                } else {
                  updateItem({ variantId: item.variantId, qty: item.qty - 1 });
                }
              }}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateItem({ variantId: item.variantId, qty: item.qty + 1 })}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.variantId)}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sepetim</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sepetim</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyTitle}>Sepetin boş</Text>
          <Text style={styles.emptySubtext}>Sevdiğin sanatçıların ürünlerini keşfet</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/shop')}
            activeOpacity={0.85}
          >
            <Text style={styles.browseBtnText}>Ürünlere Göz At →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Sepetim</Text>
          <Text style={styles.headerCount}>{itemCount} {itemCount === 1 ? 'ürün' : 'ürün'}</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.variantId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.flatList}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Ara Toplam</Text>
          <Text style={styles.totalValue}>₺{cart.total.toLocaleString('tr-TR')}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>
            Ödemeye Geç · ₺{cart.total.toLocaleString('tr-TR')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  browseBtn: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#9333EA',
    borderRadius: 14,
    shadowColor: '#9333EA',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  flatList: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemVariant: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9333EA',
  },
  controls: {
    alignItems: 'center',
    gap: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 22,
  },
  qty: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  separator: {
    height: 10,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  checkoutBtn: {
    height: 54,
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
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
