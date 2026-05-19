import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTopics } from '@/hooks/useForum';
import type { ForumTopic } from '@/types';

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useTopics(id);
  const topics = data?.pages.flatMap((p) => p.data) ?? [];

  function renderTopic({ item }: { item: ForumTopic }) {
    return (
      <TouchableOpacity
        style={styles.topicRow}
        onPress={() => router.push(`/forum/topic/${item.id}`)}
        activeOpacity={0.9}
      >
        {item.isPinned && (
          <View style={styles.pinBadge}><Text style={styles.pinText}>📌 Pinned</Text></View>
        )}
        <Text style={styles.topicTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.topicMeta}>
          <Image
            source={{
              uri: item.author.avatarUrl ?? 'https://placehold.co/24x24/EDE9FE/7C3AED?text=U',
            }}
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>
            {item.author.firstName} {item.author.lastName}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.topicDate}>{timeAgo(item.createdAt)}</Text>
          <View style={styles.spacer} />
          <Text style={styles.replies}>💬 {item.replyCount}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={renderTopic}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator size="small" color="#7C3AED" style={styles.loadMore} /> : null
          }
          ListEmptyComponent={
            <View style={styles.empty}><Text style={styles.emptyText}>No topics yet. Start the conversation!</Text></View>
          }
        />
      )}

      {/* New topic FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 10 },
  topicRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pinBadge: { alignSelf: 'flex-start' },
  pinText: { fontSize: 12, color: '#7C3AED', fontWeight: '600' },
  topicTitle: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 22 },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: { width: 20, height: 20, borderRadius: 10 },
  authorName: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  dot: { color: '#D1D5DB' },
  topicDate: { fontSize: 13, color: '#9CA3AF' },
  spacer: { flex: 1 },
  replies: { fontSize: 13, color: '#6B7280' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center' },
  loadMore: { marginVertical: 16 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
});
