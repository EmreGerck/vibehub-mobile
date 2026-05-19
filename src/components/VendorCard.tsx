import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Vendor } from '../types';

interface Props {
  vendor: Vendor;
  onFollow?: (vendor: Vendor) => void;
  compact?: boolean;
}

export function VendorCard({ vendor, onFollow, compact = false }: Props) {
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compact}
        onPress={() => router.push(`/vendor/${vendor.slug}`)}
        activeOpacity={0.9}
      >
        <Image
          source={{
            uri: vendor.logoUrl ?? 'https://placehold.co/80x80/EDE9FE/7C3AED?text=VW',
          }}
          style={styles.compactAvatar}
        />
        <Text style={styles.compactName} numberOfLines={1}>{vendor.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/vendor/${vendor.slug}`)}
      activeOpacity={0.92}
    >
      {vendor.bannerUrl ? (
        <Image source={{ uri: vendor.bannerUrl }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]} />
      )}

      <View style={styles.body}>
        <Image
          source={{
            uri: vendor.logoUrl ?? 'https://placehold.co/80x80/EDE9FE/7C3AED?text=VW',
          }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
          <Text style={styles.followers}>
            {vendor.followerCount.toLocaleString()} followers
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, vendor.isFollowed && styles.followBtnActive]}
          onPress={() => onFollow?.(vendor)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.followBtnText, vendor.isFollowed && styles.followBtnTextActive]}>
            {vendor.isFollowed ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  banner: { height: 80, backgroundColor: '#EDE9FE' },
  bannerPlaceholder: { backgroundColor: '#F5F3FF' },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    marginTop: -24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#EDE9FE',
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  followers: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  followBtnActive: { backgroundColor: '#7C3AED' },
  followBtnText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },
  followBtnTextActive: { color: '#FFFFFF' },
  compact: { alignItems: 'center', gap: 6, width: 72 },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  compactName: { fontSize: 11, color: '#374151', fontWeight: '600', textAlign: 'center' },
});
