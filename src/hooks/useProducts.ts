import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getProducts, getProduct, getTrendingProducts } from '../api/products';
import type { ProductFilters } from '../api/products';

export function useProducts(filters: ProductFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ ...filters, page: pageParam as number }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => getProduct(idOrSlug),
    enabled: !!idOrSlug,
  });
}

export function useTrendingProducts(limit = 10) {
  return useQuery({
    queryKey: ['products', 'trending', limit],
    queryFn: () => getTrendingProducts(limit),
  });
}
