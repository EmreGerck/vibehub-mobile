import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrder, cancelOrder, placeOrder, mockPay, requestRefund } from '../api/orders';
import type { PlaceOrderDto } from '../api/orders';

export function useOrders() {
  return useInfiniteQuery({
    queryKey: ['orders'],
    queryFn: ({ pageParam = 1 }) => getOrders(pageParam as number),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });
}

/** Place order — backend reads cart server-side, returns new order id. */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PlaceOrderDto) => placeOrder(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/** Confirm payment (mock until Iyzico keys live). */
export function useMockPay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => mockPay(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      qc.setQueryData(['order', order.id], order);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useRequestRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      requestRefund(orderId, reason),
    onSuccess: (order) => {
      qc.setQueryData(['order', order.id], order);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
