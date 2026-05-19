import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/api/notifications';
import type { AppNotification } from '@/types';

const TYPE_ICON: Record<string, string> = {
  order_shipped: '📦',
  forum_reply:   '💬',
  new_drop:      '🎵',
};

export default function NotificationsScreen() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });
  const { mutate: markRead } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const { mutate: markAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  function handleTap(n: AppNotification) {
    if (!n.readAt) markRead(n.id);
    // Navigate based on deep-link payload
    if (n.data?.productId) router.push(`/product/${n.data.productId}`);
    else if (n.data?.orderId) router.push(`/order/${n.data.orderId}`);
    else if (n.data?.topicId) router.push(`/forum/topic/${n.data.topicId}`);
  }

  function renderNotification({ item }: { item: AppNotification }) {
    return (
      <TouchableOpacity
        style={[styles.row, !item.readAt && styles.rowUnread]}
        onPress={() => handleTap(item)}
        activeOpacity={0.85}
      >
        <Text style={styles.icon}>{TYPE_ICON[item.type] ?? '🔔'}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.date}>{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.readAt && <View style={styles.dot} />}
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

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <View style={styles.container}>
      {unread > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={() => markAll()}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySubtext}>Notifications will appear here</Text>
          </View>
        }
      />
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
  markAllBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  markAllText: { fontSize: 14, color: '#7C3AED', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowUnread: { backgroundColor: '#F5F3FF' },
  icon: { fontSize: 24, marginTop: 2 },
  content: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  body: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
    marginTop: 6,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
});
