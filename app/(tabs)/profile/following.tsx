import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useFollowedVendors, useUnfollowVendor } from '@/hooks/useVendors';
import type { Vendor } from '@/types';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function VendorAvatar({ vendor }: { vendor: Vendor }) {
  if (vendor.logoUrl) {
    return <Image source={{ uri: vendor.logoUrl }} style={styles.avatar} />;
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarText}>{initials(vendor.name)}</Text>
    </View>
  );
}

export default function FollowingScreen() {
  const { data: vendors = [], isLoading } = useFollowedVendors();
  const { mutate: unfollow, isPending } = useUnfollowVendor();

  function renderVendor({ item }: { item: Vendor }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/vendor/${item.slug}`)}
        activeOpacity={0.85}
      >
        <VendorAvatar vendor={item} />

        <View style={styles.info}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <Text style={styles.followerCount}>
            {item.followerCount.toLocaleString()} followers
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.unfollowBtn, isPending && styles.unfollowBtnDisabled]}
          onPress={() => unfollow(item.id)}
          disabled={isPending}
          activeOpacity={0.75}
        >
          <Text style={styles.unfollowText}>Unfollow</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <FlatList
      data={vendors}
      keyExtractor={(item) => item.id}
      renderItem={renderVendor}
      contentContainerStyle={styles.list}
      style={styles.container}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>You're not following any artists yet</Text>
          <Text style={styles.emptySubtext}>
            Follow artists to see their drops in your feed
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 10 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#7C3AED' },

  info: { flex: 1, gap: 2 },
  vendorName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  followerCount: { fontSize: 13, color: '#9CA3AF' },

  unfollowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  unfollowBtnDisabled: { opacity: 0.4 },
  unfollowText: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 8, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
});
