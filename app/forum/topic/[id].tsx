import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTopic, useReplies, useCreateReply } from '@/hooks/useForum';
import type { ForumReply } from '@/types';

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: topic, isLoading: topicLoading } = useTopic(id);
  const { data: repliesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useReplies(id);
  const { mutate: sendReply, isPending } = useCreateReply(id);
  const [draft, setDraft] = useState('');

  const replies = repliesData?.pages.flatMap((p) => p.data) ?? [];

  function handleSend() {
    if (!draft.trim()) return;
    sendReply(draft.trim(), {
      onSuccess: () => setDraft(''),
      onError: () => Alert.alert('Error', 'Failed to post reply.'),
    });
  }

  function renderReply({ item }: { item: ForumReply }) {
    return (
      <View style={styles.replyRow}>
        <Image
          source={{
            uri: item.author.avatarUrl ?? 'https://placehold.co/36x36/EDE9FE/7C3AED?text=U',
          }}
          style={styles.avatar}
        />
        <View style={styles.replyContent}>
          <View style={styles.replyHeader}>
            <Text style={styles.replyAuthor}>
              {item.author.firstName} {item.author.lastName}
            </Text>
            <Text style={styles.replyDate}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.replyBody}>{item.body}</Text>
          {Object.entries(item.reactions).length > 0 && (
            <View style={styles.reactions}>
              {Object.entries(item.reactions).map(([emoji, count]) => (
                <View key={emoji} style={styles.reaction}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  if (topicLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const ListHeader = topic ? (
    <View style={styles.topicHeader}>
      <Text style={styles.topicTitle}>{topic.title}</Text>
      <View style={styles.topicMeta}>
        <Image
          source={{
            uri: topic.author.avatarUrl ?? 'https://placehold.co/28x28/EDE9FE/7C3AED?text=U',
          }}
          style={styles.topicAuthorAvatar}
        />
        <Text style={styles.topicAuthor}>
          {topic.author.firstName} {topic.author.lastName}
        </Text>
        <Text style={styles.topicDate}>{timeAgo(topic.createdAt)}</Text>
      </View>
      <Text style={styles.topicBody}>{topic.body}</Text>
      <View style={styles.divider} />
      <Text style={styles.repliesLabel}>{topic.replyCount} replies</Text>
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={replies}
        keyExtractor={(item) => item.id}
        renderItem={renderReply}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#7C3AED" style={styles.loadMore} />
          ) : null
        }
      />

      {/* Reply input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Write a reply…"
          placeholderTextColor="#9CA3AF"
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!draft.trim() || isPending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!draft.trim() || isPending}
        >
          <Text style={styles.sendBtnText}>{isPending ? '…' : '↑'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  topicHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginTop: 8,
    gap: 10,
  },
  topicTitle: { fontSize: 20, fontWeight: '800', color: '#111827', lineHeight: 26 },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicAuthorAvatar: { width: 28, height: 28, borderRadius: 14 },
  topicAuthor: { fontSize: 14, fontWeight: '600', color: '#374151' },
  topicDate: { fontSize: 13, color: '#9CA3AF', marginLeft: 4 },
  topicBody: { fontSize: 15, color: '#374151', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  repliesLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  replyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDE9FE', flexShrink: 0 },
  replyContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  replyAuthor: { fontSize: 14, fontWeight: '700', color: '#111827' },
  replyDate: { fontSize: 12, color: '#9CA3AF' },
  replyBody: { fontSize: 14, color: '#374151', lineHeight: 20 },
  reactions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reactionEmoji: { fontSize: 13 },
  reactionCount: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  loadMore: { marginVertical: 16 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#DDD6FE' },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
