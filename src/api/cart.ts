import api from './client';
import type { Cart, ApiResponse } from '../types';

/**
 * Backend cart routes (verified against backend/src/cart/cart.controller.ts):
 *   GET    /cart                          → get current cart
 *   POST   /cart/items   { variantId, qty }
 *   PATCH  /cart/items/:variantId  { qty }   (qty=0 removes the item)
 *   DELETE /cart/items/:variantId
 *   DELETE /cart                          → clear
 *
 * Mobile previously used `quantity` (web naming) and `/cart/items/:itemId`
 * (treating cart-item row as identifier). Both broke against backend DTO.
 */

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<ApiResponse<Cart>>('/cart');
  return data.data;
}

export async function addToCart(variantId: string, qty: number): Promise<Cart> {
  const { data } = await api.post<ApiResponse<Cart>>('/cart/items', { variantId, qty });
  return data.data;
}

export async function updateCartItem(variantId: string, qty: number): Promise<Cart> {
  const { data } = await api.patch<ApiResponse<Cart>>(`/cart/items/${variantId}`, { qty });
  return data.data;
}

export async function removeCartItem(variantId: string): Promise<Cart> {
  const { data } = await api.delete<ApiResponse<Cart>>(`/cart/items/${variantId}`);
  return data.data;
}

export async function clearCart(): Promise<void> {
  await api.delete('/cart');
}
