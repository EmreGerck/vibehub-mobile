import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useTheme, Palette } from '@/theme/useTheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuRow {
  icon: IoniconName;
  label: string;
  route?: string;
  onPress?: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const t = useTheme();

  function handleLogout() {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () =>
          logout(undefined, {
            onSuccess: () => router.replace('/(auth)/login'),
          }),
      },
    ]);
  }

  // Apple HIG outline icons (iOS-flavored)
  const menuItems: MenuRow[] = [
    { icon: 'cube-outline',         label: 'Siparişlerim',     route: '/(tabs)/profile/orders' },
    { icon: 'heart-outline',        label: 'İstek Listem',     route: '/(tabs)/profile/wishlist' },
    { icon: 'notifications-outline', label: 'Bildirimler',     route: '/(tabs)/profile/notifications' },
    { icon: 'people-outline',       label: 'Takip Ettiklerim', route: '/(tabs)/profile/following' },
    { icon: 'settings-outline',     label: 'Ayarlar',          route: '/(tabs)/profile/settings' },
    { icon: 'log-out-outline',      label: 'Çıkış Yap',        onPress: handleLogout, danger: true },
  ];

  // Avatar fallback: first letter of email or "?"
  const initial = (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bgBody }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={[styles.avatar, { borderColor: Palette.brand }]}
          />
        ) : (
          <View style={[styles.avatarFallback, { borderColor: Palette.brand, backgroundColor: t.bgCard }]}>
            <Text style={[styles.avatarInitial, { color: Palette.brand }]}>{initial}</Text>
          </View>
        )}
        {(user as any)?.name ? (
          <Text style={[styles.name, { color: t.textPrimary }]}>{(user as any).name}</Text>
        ) : null}
        <Text style={[styles.email, { color: t.textSecondary }]}>{user?.email}</Text>
      </View>

      {/* Menu */}
      <View style={[styles.menu, { backgroundColor: t.bgCard }]}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.menuRow,
              { borderBottomColor: t.borderPrimary },
              idx === menuItems.length - 1 && styles.menuRowLast,
            ]}
            onPress={item.onPress ?? (() => item.route && router.push(item.route as any))}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={item.danger ? '#EF4444' : t.textSecondary}
              style={{ width: 28 }}
            />
            <Text style={[
              styles.menuLabel,
              { color: t.textPrimary },
              item.danger && styles.menuLabelDanger,
            ]}>
              {item.label}
            </Text>
            {!item.danger && (
              <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.version, { color: t.textMuted }]}>VibeHub v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800' },
  email: { fontSize: 14 },
  menu: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  menuLabelDanger: { color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12 },
});
