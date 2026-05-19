import api from './client';
import type { FeedItem, PaginatedResponse, ApiResponse } from '../types';
import { normalizePage } from './normalize';

export async function getFeed(page = 1, limit = 20): Promise<PaginatedResponse<FeedItem>> {
  const { data } = await api.get<ApiResponse<any>>('/feed', {
    params: { page, limit },
  });
  const raw = data.data;
  if (raw && Array.isArray(raw.items)) {
    return normalizePage<FeedItem, FeedItem>(raw, (x) => x);
  }
  const arr: FeedItem[] = Array.isArray(raw) ? raw : raw?.data ?? [];
  return { data: arr, total: raw?.total ?? arr.length, page: raw?.page ?? 1, limit: raw?.limit ?? limit, hasMore: false };
}
