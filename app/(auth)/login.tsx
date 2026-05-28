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
import { Ionicons } from '@expo/vector-icons';
import { useLogin } from '@/hooks/useAuth';
import { useTheme, Palette } from '@/theme/useTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const t = useTheme();

  function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Eksik alan', 'Lütfen e-posta ve şifreni gir.');
      return;
    }
    login(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: () => router.replace('/(tabs)/home'),
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? 'Giriş yapılamadı. Lütfen tekrar dene.';
          Alert.alert('Hata', msg);
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: t.bgBody }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header — logo + tagline */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: Palette.brand }]}>VibeHub</Text>
          <Text style={[styles.tagline, { color: t.textSecondary }]}>
            Sanatçıların resmi merch'i
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Tekrar hoş geldin</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: t.textSecondary }]}>E-posta</Text>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.borderSecondary }]}>
              <Ionicons name="mail-outline" size={18} color={t.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: t.textPrimary }]}
                placeholder="siz@ornek.com"
                placeholderTextColor={t.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Şifre</Text>
              <Link href="/(auth)/forgot-password" style={[styles.forgotLink, { color: Palette.brand }]}>
                Şifremi unuttum
              </Link>
            </View>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.borderSecondary }]}>
              <Ionicons name="lock-closed-outline" size={18} color={t.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: t.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={t.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Palette.brand, shadowColor: Palette.brand }, isPending && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={isPending}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {isPending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: t.borderPrimary }]} />
            <Text style={[styles.dividerText, { color: t.textMuted }]}>veya</Text>
            <View style={[styles.dividerLine, { backgroundColor: t.borderPrimary }]} />
          </View>

          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: t.textSecondary }]}>Hesabın yok mu? </Text>
            <Link href="/(auth)/register" style={[styles.registerLink, { color: Palette.brand }]}>
              Kayıt Ol
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { fontSize: 14, marginTop: 4 },
  form: { gap: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: { fontSize: 13, fontWeight: '500' },
  inputWrap: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, fontSize: 15, height: '100%' },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
});
