import api from './client';
import type { Product, ApiResponse } from '../types';

/**
 * Backend wishlist routes (verified against backend/src/wishlist):
 *   GET  /wishlist                → list of Products
 *   POST /wishlist/:productId     → TOGGLE; returns { added: boolean }
 *
 * Mobile previously used:
 *   POST /wishlist { productId }            → 404
 *   DELETE /wishlist/:productId             → 404
 * Both broken; fixed to single toggle endpoint.
 */

export async function getWishlist(): Promise<Product[]> {
  const { data } = await api.get<ApiResponse<Product[]>>('/wishlist');
  return data.data;
}

/** Toggles wishlist membership. Returns true if the item is now wishlisted. */
export async function toggleWishlist(productId: string): Promise<boolean> {
  const { data } = await api.post<ApiResponse<{ added: boolean }>>(`/wishlist/${productId}`);
  return data.data.added;
}

// Backwards-compat aliases so existing screens keep working
export const addToWishlist    = toggleWishlist;
export const removeFromWishlist = toggleWishlist;
