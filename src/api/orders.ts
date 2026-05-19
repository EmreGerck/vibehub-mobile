import api from './client';
import type { Order, ShippingAddress, PaginatedResponse, ApiResponse } from '../types';

export interface CheckoutDto {
  shippingAddress: ShippingAddress;
  paymentMethod: 'iyzico' | 'stripe';
  cartId: string;
}

export interface CheckoutResult {
  orderId: string;
  paymentUrl?: string;   // iyzico webview URL
  clientSecret?: string; // Stripe payment intent secret
}

export async function checkout(dto: CheckoutDto): Promise<CheckoutResult> {
  const { data } = await api.post<ApiResponse<CheckoutResult>>('/orders/checkout', dto);
  return data.data;
}

export async function getOrders(page = 1, limit = 20): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<ApiResponse<any>>('/orders/my', {
    params: { page, limit },
  });
  const raw = data.data;
  if (raw && Array.isArray(raw.items)) {
    const hasMore = (raw.page ?? 1) * (raw.limit ?? limit) < (raw.total ?? 0);
    return { data: raw.items, total: raw.total ?? 0, page: raw.page ?? 1, limit: raw.limit ?? limit, hasMore };
  }
  const arr: Order[] = Array.isArray(raw) ? raw : raw?.data ?? [];
  return { data: arr, total: arr.length, page: 1, limit, hasMore: false };
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/orders/my/${orderId}`);
  return data.data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await api.post<ApiResponse<Order>>(`/orders/my/${orderId}/cancel`);
  return data.data;
}
