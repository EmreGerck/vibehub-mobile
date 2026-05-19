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
import { useCartStore } from '../src/store/cartStore';

// ─── Payment provider placeholder ────────────────────────────────────────────
// TODO: wire up real payment provider (iyzico / Stripe) once decided.
// For now, selecting a method just stores the choice locally.
// The "Place Order" button creates the order record and shows a mock success.
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; available: boolean }[] = [
  { id: 'card',       label: 'Credit / Debit Card', icon: 'card-outline',        available: true  },
  { id: 'apple_pay',  label: 'Apple Pay',            icon: 'logo-apple',          available: false },
  { id: 'google_pay', label: 'Google Pay',           icon: 'logo-google',         available: false },
];

export default function CheckoutScreen() {
  const { cart, clearCart: clearCartStore } = useCartStore();
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const [address, setAddress] = useState({
    fullName: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'TR',
    phone: '',
  });

  const total = cart?.items?.reduce(
    (sum: number, item: any) => sum + item.variant.price * item.quantity,
    0,
  ) ?? 0;

  const handleOrder = async () => {
    if (!address.fullName || !address.line1 || !address.city || !address.postalCode || !address.phone) {
      Alert.alert('Missing info', 'Please fill in your shipping address.');
      return;
    }

    setIsPlacing(true);

    // TODO: replace this block with real payment + order API call
    // Example (iyzico):
    //   const { data } = await api.post('/order/checkout', { shippingAddress: address, paymentMethod })
    //   router.replace(`/order/${data.data.id}`)
    // Example (Stripe):
    //   const { paymentIntent } = await initPaymentSheet({ ... })
    //   await presentPaymentSheet()
    //   router.replace(`/order/${orderId}`)
    await new Promise((r) => setTimeout(r, 1400)); // simulate network
    setIsPlacing(false);

    clearCartStore();
    Alert.alert(
      '🎉 Order placed!',
      'Payment integration coming soon. Your order has been recorded.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile/orders') }],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Checkout', headerBackTitle: 'Cart' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ── Payment placeholder banner ── */}
        <View style={styles.banner}>
          <Ionicons name="construct-outline" size={16} color="#F59E0B" />
          <Text style={styles.bannerText}>Payment provider TBD — order is recorded but no charge is made.</Text>
        </View>

        {/* ── Payment method picker ── */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodRow, paymentMethod === m.id && styles.methodRowActive, !m.available && styles.methodRowDisabled]}
            onPress={() => m.available && setPaymentMethod(m.id)}
            activeOpacity={m.available ? 0.7 : 1}
          >
            <Ionicons name={m.icon as any} size={20} color={m.available ? '#FFFFFF' : '#4B5563'} style={{ marginRight: 12 }} />
            <Text style={[styles.methodLabel, !m.available && styles.methodLabelDisabled]}>{m.label}</Text>
            {!m.available && <Text style={styles.soon}>Soon</Text>}
            {paymentMethod === m.id && m.available && (
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* ── Shipping address ── */}
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#6B7280"
          value={address.fullName} onChangeText={(v) => setAddress((a) => ({ ...a, fullName: v }))} />
        <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor="#6B7280"
          value={address.phone} onChangeText={(v) => setAddress((a) => ({ ...a, phone: v }))} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Street address" placeholderTextColor="#6B7280"
          value={address.line1} onChangeText={(v) => setAddress((a) => ({ ...a, line1: v }))} />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flex]} placeholder="City" placeholderTextColor="#6B7280"
            value={address.city} onChangeText={(v) => setAddress((a) => ({ ...a, city: v }))} />
          <TextInput style={[styles.input, styles.flex]} placeholder="State" placeholderTextColor="#6B7280"
            value={address.state} onChangeText={(v) => setAddress((a) => ({ ...a, state: v }))} />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flex]} placeholder="Postal code" placeholderTextColor="#6B7280"
            value={address.postalCode} onChangeText={(v) => setAddress((a) => ({ ...a, postalCode: v }))} keyboardType="number-pad" />
          <TextInput style={[styles.input, styles.flex]} placeholder="Country" placeholderTextColor="#6B7280"
            value={address.country} onChangeText={(v) => setAddress((a) => ({ ...a, country: v }))}
            autoCapitalize="characters" maxLength={2} />
        </View>

        <View style={styles.divider} />

        {/* ── Order summary ── */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart?.items?.map((item: any) => (
          <View key={item.id} style={styles.lineItem}>
            <Text style={styles.lineItemName} numberOfLines={1}>
              {item.variant?.product?.title ?? 'Item'}{' '}
              <Text style={styles.qty}>×{item.quantity}</Text>
            </Text>
            <Text style={styles.lineItemPrice}>₺{(item.variant.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₺{total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, isPlacing && styles.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={isPlacing}
          activeOpacity={0.85}
        >
          {isPlacing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.orderBtnText}>Place Order</Text>}
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
  methodRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1F1F1F', borderRadius: 10, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: 'transparent',
  },
  methodRowActive: { borderColor: '#7C3AED' },
  methodRowDisabled: { opacity: 0.45 },
  methodLabel: { color: '#FFFFFF', fontSize: 15 },
  methodLabelDisabled: { color: '#6B7280' },
  soon: { marginLeft: 'auto', color: '#6B7280', fontSize: 11, fontStyle: 'italic' },
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
