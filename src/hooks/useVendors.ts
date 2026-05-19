import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVendor,
  getVendorProducts,
  followVendor,
  unfollowVendor,
  getFollowedVendors,
} from '../api/vendors';

export function useVendor(slug: string) {
  return useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => getVendor(slug),
    enabled: !!slug,
  });
}

export function useVendorProducts(vendorId: string, page = 1) {
  return useQuery({
    queryKey: ['vendor-products', vendorId, page],
    queryFn: () => getVendorProducts(vendorId, page),
    enabled: !!vendorId,
  });
}

export function useFollowedVendors() {
  return useQuery({
    queryKey: ['followed-vendors'],
    queryFn: getFollowedVendors,
  });
}

export function useFollowVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followVendor,
    onSuccess: (_, vendorId) => {
      qc.invalidateQueries({ queryKey: ['vendor', vendorId] });
      qc.invalidateQueries({ queryKey: ['followed-vendors'] });
    },
  });
}

export function useUnfollowVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unfollowVendor,
    onSuccess: (_, vendorId) => {
      qc.invalidateQueries({ queryKey: ['vendor', vendorId] });
      qc.invalidateQueries({ queryKey: ['followed-vendors'] });
    },
  });
}
