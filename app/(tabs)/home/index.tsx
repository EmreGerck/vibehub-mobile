import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeed } from '@/hooks/useFeed';
import { useFollowedVendors } from '@/hooks/useVendors';
import { useTrendingProducts } from '@/hooks/useProducts';
import { FeedCard } from '@/components/FeedCard';
import { ProductCard } from '@/components/ProductCard';
import { VendorCard } from '@/components/VendorCard';
import { useAuthStore } from '@/store/authStore';
import type { FeedItem } from '@/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: feedLoading,
    refetch: refetchFeed,
    isRefetching,
  } = useFeed();

  const { data: followedVendors } = useFollowedVendors();
  const { data: trending } = useTrendingProducts(6);

  const feedItems = feedData?.pages.flatMap((p) => p.data) ?? [];

  function renderFeedItem({ item }: { item: FeedItem }) {
    return <FeedCard item={item} />;
  }

  const ListHeader = (
    <View>
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          Hey, {user?.firstName ?? 'fan'} 👋
        </Text>
        <Text style={styles.greetingSubtext}>What's new in your world</Text>
      </View>

      {/* Followed vendors horizontal scroll */}
      {!!followedVendors?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artists you follow</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vendorRow}
          >
            {followedVendors.map((v) => (
              <VendorCard key={v.id} vendor={v} compact />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Trending products */}
      {!!trending?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending right now</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingRow}
          >
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Feed label */}
      <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginBottom: 8 }]}>
        Your feed
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {feedLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetchFeed}
              tintColor="#7C3AED"
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#7C3AED" style={styles.loadMore} />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  greeting: { paddingVertical: 20 },
  greetingText: { fontSize: 24, fontWeight: '800', color: '#111827' },
  greetingSubtext: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  vendorRow: { gap: 12, paddingRight: 4 },
  trendingRow: { gap: 12, paddingRight: 4 },
  separator: { height: 0 },
  loadMore: { marginVertical: 16 },
});
