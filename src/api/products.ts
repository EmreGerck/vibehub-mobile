import api from './client';
import type { Product, PaginatedResponse, ApiResponse } from '../types';
import { normalizePage, normalizeProduct } from './normalize';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  status?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<ApiResponse<any>>('/products', {
    params: { ...filters, page: filters.page ?? 1, limit: filters.limit ?? 20 },
  });
  const raw = data.data;
  // Backend returns { items, total, page, limit }
  if (raw && Array.isArray(raw.items)) {
    return normalizePage(raw, normalizeProduct);
  }
  // Fallback: already in expected shape
  return { data: (raw.data ?? raw.items ?? []).map(normalizeProduct), total: raw.total ?? 0, page: raw.page ?? 1, limit: raw.limit ?? 20, hasMore: false };
}

export async function getProduct(idOrSlug: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<any>>(`/products/${idOrSlug}`);
  return normalizeProduct(data.data);
}

export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  const { data } = await api.get<ApiResponse<any[]>>('/products/trending', {
    params: { limit },
  });
  const items = Array.isArray(data.data) ? data.data : [];
  return items.map(normalizeProduct);
}
