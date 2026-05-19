import api from './client';
import type { Product, ApiResponse } from '../types';

export async function getWishlist(): Promise<Product[]> {
  const { data } = await api.get<ApiResponse<Product[]>>('/wishlist');
  return data.data;
}

export async function addToWishlist(productId: string): Promise<void> {
  await api.post('/wishlist', { productId });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/wishlist/${productId}`);
}
