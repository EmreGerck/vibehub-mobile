/**
 * Normalize raw API responses to match the mobile app's internal types.
 * The live backend uses slightly different field names (e.g. title vs name,
 * displayName vs name, items vs data) so we translate here in one place.
 */

import type { Product, Vendor, PaginatedResponse } from '../types';

// ─── Pagination ────────────────────────────────────────────────────────────────

/** The shape the backend actually returns for paginated lists */
interface RawPage<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function normalizePage<Raw, Out>(
  raw: RawPage<Raw>,
  mapItem: (item: Raw) => Out,
): PaginatedResponse<Out> {
  const { items, total, page, limit } = raw;
  return {
    data: items.map(mapItem),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

// ─── Vendor ────────────────────────────────────────────────────────────────────

interface RawVendor {
  id: string;
  slug: string;
  displayName: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
  followerCount?: number;
  productCount?: number;
  isFollowed?: boolean;
  [key: string]: unknown;
}

export function normalizeVendor(raw: RawVendor): Vendor {
  return {
    id: raw.id,
    name: raw.displayName,
    slug: raw.slug,
    logoUrl: raw.logoUrl,
    bannerUrl: raw.bannerUrl,
    description: raw.bio,
    followerCount: raw.followerCount ?? 0,
    productCount: raw.productCount,
    isFollowed: raw.isFollowed,
    rating: undefined,
  };
}

// ─── Product ──────────────────────────────────────────────────────────────────

interface RawVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  price: string | number;
  [key: string]: unknown;
}

interface RawProduct {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  price: string | number;
  compareAtPrice?: string | number;
  images: string[];
  tenant?: RawVendor;
  vendor?: RawVendor;
  variants?: RawVariant[];
  rating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  tags?: string[];
  createdAt: string;
  [key: string]: unknown;
}

export function normalizeProduct(raw: RawProduct): Product {
  const rawVendor = raw.tenant ?? raw.vendor;
  return {
    id: raw.id,
    name: raw.title,
    slug: raw.slug ?? raw.id,
    description: raw.description,
    price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
    compareAtPrice:
      raw.compareAtPrice != null
        ? typeof raw.compareAtPrice === 'string'
          ? parseFloat(raw.compareAtPrice)
          : raw.compareAtPrice
        : undefined,
    images: raw.images ?? [],
    vendor: rawVendor ? normalizeVendor(rawVendor as RawVendor) : ({} as Vendor),
    category: (raw.category as Product['category']) ?? { id: '', name: '', slug: '' },
    variants: (raw.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
    })),
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    isWishlisted: raw.isWishlisted,
    tags: raw.tags,
    createdAt: raw.createdAt,
  };
}
