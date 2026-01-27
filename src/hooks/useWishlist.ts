import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { getAuth } from '@/utils/authStorage';
import type { WishlistResponse } from '@/types';
import {
  addWishlistItem,
  clearWishlist,
  getWishlist,
  removeWishlistItem,
  updateWishlistItem,
  type AddWishlistItemPayload,
  type UpdateWishlistItemPayload,
} from '@/services/wishlistService';

export const wishlistQueryKey = ['wishlist'] as const;

export const useWishlist = (enabled = true) => {
  const isLoggedIn = useIsAuthenticated();

  return useQuery<WishlistResponse>({
    queryKey: wishlistQueryKey,
    queryFn: getWishlist,
    enabled: enabled && isLoggedIn && !!getAuth(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useAddWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddWishlistItemPayload) => addWishlistItem(payload),
    onSuccess: data => {
      if (data.wishlist) {
        queryClient.setQueryData(wishlistQueryKey, data.wishlist);
        return;
      }
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey, refetchType: 'active' });
    },
  });
};

export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWishlistItemPayload }) =>
      updateWishlistItem(id, payload),
    onSuccess: data => {
      if (data.wishlist) {
        queryClient.setQueryData(wishlistQueryKey, data.wishlist);
        return;
      }
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey, refetchType: 'active' });
    },
  });
};

export const useRemoveWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeWishlistItem(id),
    onSuccess: data => {
      if (data.wishlist) {
        queryClient.setQueryData(wishlistQueryKey, data.wishlist);
        return;
      }
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey, refetchType: 'active' });
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearWishlist(),
    onSuccess: data => {
      if (data.wishlist) {
        queryClient.setQueryData(wishlistQueryKey, data.wishlist);
        return;
      }
      queryClient.setQueryData(wishlistQueryKey, { items: [], totalItems: 0, totalValue: 0 });
    },
  });
};
