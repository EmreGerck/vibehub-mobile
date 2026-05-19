import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrder, cancelOrder, checkout } from '../api/orders';
import type { CheckoutDto } from '../api/orders';

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

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { shippingAddress: CheckoutDto['shippingAddress'] }) =>
      checkout({ ...dto, paymentMethod: 'iyzico', cartId: '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
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
