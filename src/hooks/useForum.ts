import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChannels,
  getVendorChannels,
  getTopics,
  getTopic,
  createTopic,
  getReplies,
  createReply,
  getConversations,
  getMessages,
  sendMessage,
} from '../api/forum';

export function useChannels() {
  return useQuery({ queryKey: ['forum-channels'], queryFn: getChannels });
}

export function useVendorChannels(tenantId: string) {
  return useQuery({
    queryKey: ['forum-vendor-channels', tenantId],
    queryFn: () => getVendorChannels(tenantId),
    enabled: !!tenantId,
  });
}

export function useTopics(channelId: string) {
  return useInfiniteQuery({
    queryKey: ['forum-topics', channelId],
    queryFn: ({ pageParam = 1 }) => getTopics(channelId, pageParam as number),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
    enabled: !!channelId,
  });
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: () => getTopic(topicId),
    enabled: !!topicId,
  });
}

export function useReplies(topicId: string) {
  return useInfiniteQuery({
    queryKey: ['forum-replies', topicId],
    queryFn: ({ pageParam = 1 }) => getReplies(topicId, pageParam as number),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
    enabled: !!topicId,
  });
}

export function useCreateReply(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createReply(topicId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum-replies', topicId] }),
  });
}

export function useConversations() {
  return useQuery({ queryKey: ['conversations'], queryFn: getConversations });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam = 1 }) => getMessages(conversationId, pageParam as number),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId, body }: { recipientId: string; body: string }) =>
      sendMessage(recipientId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
