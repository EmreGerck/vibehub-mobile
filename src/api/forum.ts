import api from './client';
import type {
  ForumChannel,
  ForumTopic,
  ForumReply,
  Conversation,
  DirectMessage,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { normalizePage } from './normalize';

// ─── Helper: normalise a paginated api response ──────────────────────────────
function normPage<T>(raw: any): PaginatedResponse<T> {
  if (raw && Array.isArray(raw.items)) {
    return normalizePage<T, T>(raw, (x) => x);
  }
  // already in expected shape or flat array
  const arr: T[] = Array.isArray(raw) ? raw : raw?.data ?? [];
  return { data: arr, total: raw?.total ?? arr.length, page: raw?.page ?? 1, limit: raw?.limit ?? arr.length, hasMore: false };
}

// ─── Channels ────────────────────────────────────────────────────────────────
// The backend is tenant-scoped: GET /forum/:tenantId/channels
// We fetch the vendor list and use each vendor as a "community hub".

export async function getChannels(): Promise<ForumChannel[]> {
  // Get all active vendors and shape them as ForumChannels
  const { data } = await api.get<ApiResponse<any>>('/vendors', {
    params: { page: 1, limit: 50 },
  });
  const raw = data.data;
  const vendors: any[] = Array.isArray(raw)
    ? raw
    : raw?.items ?? raw?.data ?? [];

  return vendors.map((v: any) => ({
    id: v.id,                        // tenantId used to fetch channels
    name: v.displayName ?? v.name,
    vendor: {
      id: v.id,
      name: v.displayName ?? v.name,
      slug: v.slug,
      logoUrl: v.logoUrl,
    },
    topicCount: v._count?.topics ?? 0,
    lastActivity: v.updatedAt,
  }));
}

export async function getVendorChannels(tenantId: string): Promise<any[]> {
  const { data } = await api.get<ApiResponse<any>>(`/forum/${tenantId}/channels`);
  const raw = data.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export async function getTopics(
  channelId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<ForumTopic>> {
  // channelId can be a channel UUID; tenantId scoped at /forum/:tenantId/topics?channelId=...
  // The backend route is GET /forum/:tenantId/topics — channelId is passed as query param.
  // We store tenantId in the route as part of topic navigation.
  const { data } = await api.get<ApiResponse<any>>(
    `/forum/${channelId}/topics`,
    { params: { page, limit } },
  );
  return normPage<ForumTopic>(data.data);
}

export async function getTopic(topicId: string): Promise<ForumTopic> {
  const { data } = await api.get<ApiResponse<ForumTopic>>(`/forum/topics/${topicId}`);
  return data.data;
}

export async function createTopic(
  channelId: string,
  title: string,
  body: string,
  imageUrls?: string[],
): Promise<ForumTopic> {
  const { data } = await api.post<ApiResponse<ForumTopic>>(
    `/forum/channels/${channelId}/topics`,
    { title, body, imageUrls },
  );
  return data.data;
}

// ─── Replies ─────────────────────────────────────────────────────────────────

export async function getReplies(
  topicId: string,
  page = 1,
  limit = 30,
): Promise<PaginatedResponse<ForumReply>> {
  const { data } = await api.get<ApiResponse<any>>(
    `/forum/topics/${topicId}/replies`,
    { params: { page, limit } },
  );
  return normPage<ForumReply>(data.data);
}

export async function createReply(topicId: string, body: string): Promise<ForumReply> {
  const { data } = await api.post<ApiResponse<ForumReply>>(
    `/forum/topics/${topicId}/replies`,
    { body },
  );
  return data.data;
}

export async function reactToPost(
  postId: string,
  type: 'topic' | 'reply',
  emoji: string,
): Promise<void> {
  await api.post(`/forum/${type}s/${postId}/reactions`, { emoji });
}

// ─── Direct Messages ─────────────────────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get<ApiResponse<any>>('/messages/conversations');
  const raw = data.data;
  return Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 30,
): Promise<PaginatedResponse<DirectMessage>> {
  const { data } = await api.get<ApiResponse<any>>(
    `/messages/conversations/${conversationId}`,
    { params: { page, limit } },
  );
  return normPage<DirectMessage>(data.data);
}

export async function sendMessage(recipientId: string, body: string): Promise<DirectMessage> {
  const { data } = await api.post<ApiResponse<DirectMessage>>('/messages', {
    recipientId,
    body,
  });
  return data.data;
}
