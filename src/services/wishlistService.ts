import { api } from './api';

export interface WishlistSettings {
  is_public: boolean;
  share_id?: string;
  share_url?: string;
}

export interface PublicWishlist {
  owner_name: string;
  items: Array<{
    id: string;
    name: string;
    brand?: string;
    image_url?: string;
    price?: number;
    added_at?: string;
  }>;
  items_count: number;
}

// Get wishlist privacy settings
export const getWishlistSettings = async (): Promise<WishlistSettings> => {
  try {
    const response = await api.get('/wishlist/settings');
    return response.data;
  } catch {
    // Default to private if API fails
    return { is_public: false };
  }
};

// Update wishlist privacy settings
export const updateWishlistSettings = async (isPublic: boolean): Promise<WishlistSettings> => {
  const response = await api.put('/wishlist/settings', {
    is_public: isPublic
  });
  return response.data;
};

// Generate/get share link
export const getShareLink = async (): Promise<{ share_url: string; share_id: string }> => {
  const response = await api.post('/wishlist/share');
  return response.data;
};

// Get public wishlist by share ID (no auth required)
export const getPublicWishlist = async (shareId: string): Promise<PublicWishlist> => {
  const response = await api.get(`/wishlist/public/${shareId}`);
  return response.data;
};
