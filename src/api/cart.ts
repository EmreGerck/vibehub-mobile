import api from './client';
import type { Cart, ApiResponse } from '../types';

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<ApiResponse<Cart>>('/cart');
  return data.data;
}

export async function addToCart(variantId: string, quantity: number): Promise<Cart> {
  const { data } = await api.post<ApiResponse<Cart>>('/cart/items', { variantId, quantity });
  return data.data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
  return data.data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
  return data.data;
}

export async function clearCart(): Promise<void> {
  await api.delete('/cart');
}
