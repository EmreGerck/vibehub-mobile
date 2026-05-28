import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../src/store/cartStore';
import { placeOrder, mockPay } from '../src/api/orders';

/**
 * Real checkout flow:
 *   1. Validate shipping address fields
 *   2. POST /orders → creates order, returns id
 *   3. POST /payments/mock/pay → confirms order, decrements stock,
 *      issues e-Arşiv invoice, sends customer email + push
 *   4. Invalidate cart + orders queries, route to /order/[id]
 *
 * When real Iyzico keys land, step 3 swaps to
 *   POST /payments/iyzico/initiate/:orderId → open returned URL in WebBrowser
 */

export default function CheckoutScreen() {
  const cart = useCartStore((s) => s.cart);
  const clearCartStore = useCartStore((s) => s.clearCart);
  const qc = useQueryClient();
  const [isPlacing, setIsPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'TR',
    phone: '',
  });

  const total = cart?.total ?? 0;
  const itemCount = cart?.itemCount ?? 0;

  const handleOrder = async () => {
    if (!address.name || !address.line1 || !address.city || !address.postalCode || !address.phone) {
      Alert.alert('Eksik bilgi', 'Lütfen teslimat adresinin tüm zorunlu alanlarını doldur.');
      return;
    }
    if (!cart || cart.items.length === 0) {
      Alert.alert('Sepetin boş', 'Önce ürün eklemen lazım.');
      return;
    }

    setIsPlacing(true);
    try {
      // Step 1: place the order — backend DTO uses `name` (not `fullName`)
      const order = await placeOrder({
        shippingAddress: {
          name: address.name,
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          state: address.state || address.city, // backend requires state
          postalCode: address.postalCode,
          country: address.country || 'TR',
          phone: address.phone,
        } as any,
        currency: 'TRY',
      });

      // Step 2: confirm payment (mock until Iyzico keys live)
      // Wrapped in try/catch — payment failure shouldn't lose the order
      try {
        await mockPay(order.id);
      } catch (payErr: any) {
        // Order created but payment failed — let user know they can retry
        Alert.alert(
          'Sipariş alındı, ödeme bekliyor',
          'Siparişin oluştu ama ödeme onayı şu an çalışmıyor. Sipariş sayfasından tekrar deneyebilirsin.',
        );
        clearCartStore();
        qc.invalidateQueries({ queryKey: ['cart'] });
        qc.invalidateQueries({ queryKey: ['orders'] });
        router.replace(`/order/${order.id}`);
        return;
      }

      // Success: cart was server-cleared by placeOrder; mirror locally + invalidate
      clearCartStore();
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });

      Alert.alert(
        '🎉 Siparişin alındı!',
        `Sipariş numaran: #${order.id.slice(0, 8).toUpperCase()}. Detayları sipariş sayfanda görebilirsin.`,
        [{ text: 'Siparişimi gör', onPress: () => router.replace(`/order/${order.id}`) }],
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Sipariş oluşturulamadı.';
      Alert.alert('Hata', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ödeme', headerBackTitle: 'Sepet' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Placeholder banner — real payment provider TBD */}
        <View style={styles.banner}>
          <Ionicons name="construct-outline" size={16} color="#F59E0B" />
          <Text style={styles.bannerText}>
            Test modu — gerçek ödeme alınmaz, sipariş kayda geçer.
          </Text>
        </View>

        {/* Shipping address */}
        <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
        <TextInput style={styles.input} placeholder="Ad Soyad *" placeholderTextColor="#6B7280"
          value={address.name} onChangeText={(v) => setAddress((a) => ({ ...a, name: v }))} />
        <TextInput style={styles.input} placeholder="Telefon *" placeholderTextColor="#6B7280"
          value={address.phone} onChangeText={(v) => setAddress((a) => ({ ...a, phone: v }))} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Adres satırı 1 *" placeholderTextColor="#6B7280"
          value={address.line1} onChangeText={(v) => setAddress((a) => ({ ...a, line1: v }))} />
        <TextInput style={styles.input} placeholder="Adres satırı 2 (apartman, daire)" placeholderTextColor="#6B7280"
          value={address.line2} onChangeText={(v) => setAddress((a) => ({ ...a, line2: v }))} />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flex]} placeholder="İl *" placeholderTextColor="#6B7280"
            value={address.city} onChangeText={(v) => setAddress((a) => ({ ...a, city: v }))} />
          <TextInput style={[styles.input, styles.flex]} placeholder="İlçe" placeholderTextColor="#6B7280"
            value={address.state} onChangeText={(v) => setAddress((a) => ({ ...a, state: v }))} />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flex]} placeholder="Posta kodu *" placeholderTextColor="#6B7280"
            value={address.postalCode} onChangeText={(v) => setAddress((a) => ({ ...a, postalCode: v }))} keyboardType="number-pad" />
          <TextInput style={[styles.input, styles.flex]} placeholder="Ülke" placeholderTextColor="#6B7280"
            value={address.country} onChangeText={(v) => setAddress((a) => ({ ...a, country: v }))}
            autoCapitalize="characters" maxLength={2} />
        </View>

        <View style={styles.divider} />

        {/* Order summary */}
        <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
        {cart?.items?.map((item) => (
          <View key={item.variantId} style={styles.lineItem}>
            <Text style={styles.lineItemName} numberOfLines={1}>
              {item.product?.title ?? 'Ürün'}{' '}
              <Text style={styles.qty}>×{item.qty}</Text>
            </Text>
            <Text style={styles.lineItemPrice}>₺{item.lineTotal.toLocaleString('tr-TR')}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam ({itemCount} ürün)</Text>
          <Text style={styles.totalAmount}>₺{total.toLocaleString('tr-TR')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, isPlacing && styles.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={isPlacing}
          activeOpacity={0.85}
        >
          {isPlacing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.orderBtnText}>Siparişi Tamamla</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  content: { padding: 20, paddingBottom: 40 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1C1700', borderWidth: 1, borderColor: '#F59E0B33',
    borderRadius: 10, padding: 12, marginBottom: 20,
  },
  bannerText: { color: '#F59E0B', fontSize: 12, flex: 1 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  input: {
    backgroundColor: '#1F1F1F', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#FFFFFF', fontSize: 15, marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  divider: { height: 1, backgroundColor: '#1F1F1F', marginVertical: 20 },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  lineItemName: { color: '#D1D5DB', fontSize: 14, flex: 1, marginRight: 8 },
  qty: { color: '#9CA3AF' },
  lineItemPrice: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#1F1F1F', marginBottom: 28,
  },
  totalLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  totalAmount: { color: '#7C3AED', fontSize: 20, fontWeight: '800' },
  orderBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
