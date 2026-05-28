import api from './client';
import type { Order, ShippingAddress, PaginatedResponse, ApiResponse } from '../types';

/**
 * Backend routes (backend/src/order/order.controller.ts):
 *   POST   /orders                      → place order (PlaceOrderDto)
 *   GET    /orders/my                   → list customer orders
 *   GET    /orders/my/:id               → single order
 *   PATCH  /orders/my/:id/cancel        → cancel (CUSTOMER, before SHIPPED)
 *   PATCH  /orders/my/:id/request-refund → request refund (DELIVERED only)
 *
 * Payment (backend/src/payment/payment.controller.ts):
 *   POST /payments/mock/pay             → dev/staging only; confirms order
 *   POST /payments/iyzico/initiate/:id  → real Iyzico (when keys configured)
 */

/** Mirrors backend PlaceOrderDto. `name` is the customer-facing display name. */
export interface PlaceOrderDto {
  shippingAddress: ShippingAddress;
  currency?: string;
}

export interface PlaceOrderResult {
  id: string;
  status: string;
  totalAmount: string | number;
  currency: string;
}

/** Step 1: create the order from current cart. Backend reads cart server-side. */
export async function placeOrder(dto: PlaceOrderDto): Promise<PlaceOrderResult> {
  const { data } = await api.post<ApiResponse<PlaceOrderResult>>('/orders', dto);
  return data.data;
}

/**
 * Step 2: confirm payment.
 * Mobile uses the mock-pay endpoint for now (placeholder until Iyzico keys live).
 * When Iyzico is wired, swap to `POST /payments/iyzico/initiate/:orderId` and
 * present the returned URL in an in-app browser (expo-web-browser).
 */
export async function mockPay(orderId: string): Promise<{ orderId: string; paymentRef: string; invoiceNumber: string | null }> {
  const { data } = await api.post<ApiResponse<any>>('/payments/mock/pay', { orderId });
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

/** Backend route is PATCH (mobile previously used POST → 405). */
export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/my/${orderId}/cancel`);
  return data.data;
}

/** Refund request (DELIVERED only, within 14 days of delivery — backend enforces). */
export async function requestRefund(orderId: string, reason: string): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(
    `/orders/my/${orderId}/request-refund`,
    { reason },
  );
  return data.data;
}
