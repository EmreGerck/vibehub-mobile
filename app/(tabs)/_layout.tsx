import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

/**
 * Apple/iOS HIG-style tab bar:
 * - Ionicons outline (inactive) → solid (focused)
 * - Active tint = VibeHub brand purple (#9333EA, matches desktop)
 * - Background + border auto-switch with system color scheme
 * - 5 tabs only (HIG limit), Cart gets a badge instead of a FAB
 * - Scan tab is registered for routing but hidden from the bar
 *   (accessed via Home header camera button)
 */

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIconBadge({
  focused,
  outline,
  filled,
  activeColor,
  inactiveColor,
  badgeCount,
}: {
  focused: boolean;
  outline: IoniconName;
  filled: IoniconName;
  activeColor: string;
  inactiveColor: string;
  badgeCount?: number;
}) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons
        name={focused ? filled : outline}
        size={24}
        color={focused ? activeColor : inactiveColor}
      />
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: t.navBg,
          borderTopColor: t.navBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: t.isDark ? 0.4 : 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.textMuted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIconBadge
              focused={focused} outline="home-outline" filled="home"
              activeColor={t.brand} inactiveColor={t.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <TabIconBadge
              focused={focused} outline="storefront-outline" filled="storefront"
              activeColor={t.brand} inactiveColor={t.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
          tabBarIcon: ({ focused }) => (
            <TabIconBadge
              focused={focused} outline="chatbubbles-outline" filled="chatbubbles"
              activeColor={t.brand} inactiveColor={t.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIconBadge
              focused={focused} outline="person-outline" filled="person"
              activeColor={t.brand} inactiveColor={t.textMuted}
            />
          ),
        }}
      />
      {/* Scan tab is registered for routing but hidden from the bar */}
      <Tabs.Screen
        name="scan"
        options={{
          href: null,
          title: 'Scan',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
