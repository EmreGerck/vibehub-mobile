import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useChannels, useConversations } from '@/hooks/useForum';
import type { ForumChannel, Conversation } from '@/types';

type Tab = 'channels' | 'messages';

export default function ForumScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('channels');
  const { data: channels, isLoading: chLoading } = useChannels();
  const { data: convos, isLoading: dmLoading }   = useConversations();

  function renderChannel({ item }: { item: ForumChannel }) {
    return (
      <TouchableOpacity
        style={styles.channelRow}
        onPress={() => router.push(`/forum/channel/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image
          source={{
            uri: item.vendor.logoUrl ?? 'https://placehold.co/48x48/EDE9FE/7C3AED?text=VW',
          }}
          style={styles.channelAvatar}
        />
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>{item.vendor.name}</Text>
          <Text style={styles.channelMeta}>
            {item.topicCount} topics
            {item.lastActivity ? ` · ${timeAgo(item.lastActivity)}` : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  }

  function renderConvo({ item }: { item: Conversation }) {
    return (
      <TouchableOpacity
        style={styles.channelRow}
        onPress={() => router.push(`/forum/dm/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image
          source={{
            uri:
              item.participant.avatarUrl ??
              'https://placehold.co/48x48/EDE9FE/7C3AED?text=VW',
          }}
          style={styles.channelAvatar}
        />
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>
            {item.participant.firstName} {item.participant.lastName}
          </Text>
          {item.lastMessage && (
            <Text style={styles.channelMeta} numberOfLines={1}>
              {item.lastMessage.body}
            </Text>
          )}
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const loading = tab === 'channels' ? chLoading : dmLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'channels' && styles.tabBtnActive]}
          onPress={() => setTab('channels')}
        >
          <Text style={[styles.tabBtnText, tab === 'channels' && styles.tabBtnTextActive]}>
            Artist Forums
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'messages' && styles.tabBtnActive]}
          onPress={() => setTab('messages')}
        >
          <Text style={[styles.tabBtnText, tab === 'messages' && styles.tabBtnTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : tab === 'channels' ? (
        <FlatList
          data={channels ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderChannel}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Follow artists to see their forums</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={convos ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderConvo}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabBtnTextActive: { color: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  channelAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EDE9FE' },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  channelMeta: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 22, color: '#D1D5DB' },
  unreadBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
