import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '../api/app-config';

export function useAppConfig() {
  return useQuery({ queryKey: ['app-config'], queryFn: getAppConfig, staleTime: 5 * 60 * 1000 });
}
