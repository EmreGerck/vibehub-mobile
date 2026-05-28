import api from './client';
import type { Vendor, Product, PaginatedResponse, ApiResponse } from '../types';
import { normalizePage, normalizeVendor, normalizeProduct } from './normalize';

export async function getVendors(page = 1, limit = 20): Promise<PaginatedResponse<Vendor>> {
  const { data } = await api.get<ApiResponse<any>>('/vendors', {
    params: { page, limit },
  });
  const raw = data.data;
  if (raw && Array.isArray(raw.items)) {
    return normalizePage(raw, normalizeVendor);
  }
  return { data: (raw.data ?? raw.items ?? []).map(normalizeVendor), total: raw.total ?? 0, page: raw.page ?? 1, limit: raw.limit ?? 20, hasMore: false };
}

/**
 * Backend route: GET /vendors/slug/:slug (NOT /vendors/:slug).
 * Previously called the wrong path → silent 404 → empty vendor page.
 */
export async function getVendor(slug: string): Promise<Vendor> {
  const { data } = await api.get<ApiResponse<any>>(`/vendors/slug/${slug}`);
  return normalizeVendor(data.data);
}

export async function getVendorProducts(
  vendorId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<ApiResponse<any>>(
    `/vendors/${vendorId}/products`,
    { params: { page, limit } },
  );
  const raw = data.data;
  if (raw && Array.isArray(raw.items)) {
    return normalizePage(raw, normalizeProduct);
  }
  return { data: (raw.data ?? raw.items ?? []).map(normalizeProduct), total: raw.total ?? 0, page: raw.page ?? 1, limit: raw.limit ?? 20, hasMore: false };
}

export async function followVendor(vendorId: string): Promise<void> {
  await api.post(`/vendors/${vendorId}/follow`);
}

export async function unfollowVendor(vendorId: string): Promise<void> {
  await api.delete(`/vendors/${vendorId}/follow`);
}

/**
 * Backend `/vendors/following` doesn't exist yet — client-side filter
 * over the full vendors list using `isFollowed` flag returned per vendor.
 * Trade-off: pulls the full list, but unblocks the Profile→Following
 * screen until a dedicated endpoint lands.
 */
export async function getFollowedVendors(): Promise<Vendor[]> {
  const all = await getVendors(1, 200);
  return all.data.filter((v) => v.isFollowed);
}
