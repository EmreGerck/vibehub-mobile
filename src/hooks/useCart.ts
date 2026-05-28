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
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) =>
      addToCart(variantId, qty),
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
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) =>
      updateCartItem(variantId, qty),
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
    mutationFn: (variantId: string) => removeCartItem(variantId),
    onSuccess: (cart) => {
      setCart(cart);
      qc.setQueryData(['cart'], cart);
    },
  });
}
