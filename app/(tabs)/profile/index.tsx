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
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

interface MenuRow {
  icon: string;
  label: string;
  route?: string;
  onPress?: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () =>
          logout(undefined, {
            onSuccess: () => router.replace('/(auth)/login'),
          }),
      },
    ]);
  }

  const menuItems: MenuRow[] = [
    { icon: '📦', label: 'My Orders',       route: '/(tabs)/profile/orders' },
    { icon: '♥',  label: 'Wishlist',         route: '/(tabs)/profile/wishlist' },
    { icon: '🔔', label: 'Notifications',    route: '/(tabs)/profile/notifications' },
    { icon: '👥', label: 'Following',        route: '/(tabs)/profile/following' },
    { icon: '⚙️', label: 'Settings',         route: '/(tabs)/profile/settings' },
    { icon: '🚪', label: 'Sign out',         onPress: handleLogout, danger: true },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <Image
          source={{
            uri: user?.avatarUrl ?? 'https://placehold.co/100x100/EDE9FE/7C3AED?text=VW',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.menuRow, item.danger && styles.menuRowDanger]}
            onPress={item.onPress ?? (() => item.route && router.push(item.route as any))}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
              {item.label}
            </Text>
            {!item.danger && <Text style={styles.chevron}>›</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>Vibeworks v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EDE9FE',
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280' },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  menuRowDanger: { borderBottomWidth: 0 },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  menuLabelDanger: { color: '#EF4444' },
  chevron: { fontSize: 22, color: '#D1D5DB' },
  version: { textAlign: 'center', fontSize: 12, color: '#D1D5DB' },
});
