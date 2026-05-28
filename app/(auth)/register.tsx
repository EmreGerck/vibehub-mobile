import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useRegister } from '@/hooks/useAuth';

/**
 * Backend register DTO requires `termsAccepted: true` + `privacyAccepted: true`.
 * The user's name is captured as a single `name` field (matches backend).
 * Phone collected at registration is stored locally to PATCH /auth/profile
 * after first login in a follow-up sprint.
 */
export default function RegisterScreen() {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [acceptTerms, setAcceptTerms]       = useState(false);
  const [acceptPrivacy, setAcceptPrivacy]   = useState(false);
  const [marketingOk, setMarketingOk]       = useState(false);

  const { mutate: register, isPending } = useRegister();

  function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Eksik alan', 'Lütfen ad, e-posta ve şifre alanlarını doldur.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Zayıf şifre', 'Şifre en az 8 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Şifreler uyuşmuyor', 'İki şifre alanını aynı doldur.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Kullanım Şartları', 'Devam etmek için Kullanım Şartlarını kabul etmelisin.');
      return;
    }
    if (!acceptPrivacy) {
      Alert.alert('Gizlilik & KVKK', 'Devam etmek için Gizlilik Politikası + KVKK aydınlatmasını kabul etmelisin.');
      return;
    }

    register(
      {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent: marketingOk,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Hesabın oluşturuldu! 🎉',
            'Şimdi giriş yapabilirsin.',
            [{ text: 'Giriş yap', onPress: () => router.replace('/(auth)/login') }],
          );
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? 'Kayıt başarısız.';
          Alert.alert('Hata', Array.isArray(msg) ? msg.join('\n') : msg);
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>VibeHub fan topluluğuna katıl</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Emre Gerçek"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-posta *</Text>
            <TextInput
              style={styles.input}
              placeholder="siz@ornek.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifre *</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 8 karakter"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifre tekrar *</Text>
            <TextInput
              style={[styles.input, confirm && confirm !== password && styles.inputError]}
              placeholder="Şifreni tekrar gir"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          {/* Consent checkboxes — required by backend */}
          <ConsentRow
            checked={acceptTerms}
            onToggle={() => setAcceptTerms(v => !v)}
            label={
              <Text style={styles.consentText}>
                <Text style={styles.consentLink}>Kullanım Şartları</Text>nı okudum ve kabul ediyorum (14 günlük cayma hakkı dahil) *
              </Text>
            }
          />
          <ConsentRow
            checked={acceptPrivacy}
            onToggle={() => setAcceptPrivacy(v => !v)}
            label={
              <Text style={styles.consentText}>
                <Text style={styles.consentLink}>Gizlilik Politikası</Text> ve <Text style={styles.consentLink}>KVKK Aydınlatmasını</Text> kabul ediyorum *
              </Text>
            }
          />
          <ConsentRow
            checked={marketingOk}
            onToggle={() => setMarketingOk(v => !v)}
            label={
              <Text style={styles.consentText}>
                Pazarlama e-postaları, kampanya ve güncellemeleri almayı kabul ediyorum (isteğe bağlı)
              </Text>
            }
          />

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (isPending || !acceptTerms || !acceptPrivacy) && styles.primaryBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={isPending || !acceptTerms || !acceptPrivacy}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {isPending ? 'Hesap oluşturuluyor…' : 'Hesap Oluştur'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Hesabın var mı? </Text>
            <Link href="/(auth)/login" style={styles.loginLink}>Giriş yap</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ConsentRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.consentRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.consentLabelWrap}>{label}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: { marginBottom: 24 },
  backText: { fontSize: 16, color: '#7C3AED', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 28 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputError: { borderColor: '#EF4444' },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  consentLabelWrap: { flex: 1 },
  consentText: { fontSize: 13, color: '#374151', lineHeight: 18 },
  consentLink: { color: '#7C3AED', fontWeight: '600' },
  primaryBtn: {
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#7C3AED', fontWeight: '600' },
});
