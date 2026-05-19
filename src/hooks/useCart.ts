import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useEffect } from 'react';

export function useCart() {
  const setCart = useCartStore((s) => s.setCart);
  const query = useQuery({ queryKey: ['cart'], queryFn: getCart });

  useEffect(() => {
    if (query.data) setCart(query.data);
  }, [query.data]);

  return query;
}

export function useAddToCart() {
  const qc = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      addToCart(variantId, quantity),
    onSuccess: (cart) => {
      setCart(cart);
      qc.setQueryData(['cart'], cart);
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (cart) => {
      setCart(cart);
      qc.setQueryData(['cart'], cart);
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (cart) => {
      setCart(cart);
      qc.setQueryData(['cart'], cart);
    },
  });
}
