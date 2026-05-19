import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '../api/feed';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => getFeed(pageParam as number),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
  });
}
