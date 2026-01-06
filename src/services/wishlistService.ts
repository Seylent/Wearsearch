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
  const data = response.data;
  
  // Debug logging - show full structure
  if (import.meta.env.DEV) {
    console.log('📋 Public wishlist raw response:', JSON.stringify(data, null, 2));
    console.log('📋 Raw data keys:', Object.keys(data));
    if (data.items) console.log('📋 items array length:', data.items.length);
    if (data.products) console.log('📋 products array length:', data.products.length);
    if (data.favorites) console.log('📋 favorites array length:', data.favorites.length);
  }
  
  // Handle different response formats from backend
  // Format 1: { owner_name, items, items_count } - expected format
  // Format 2: { user, products/favorites, total } - alternative format
  // Format 3: { data: { ... } } - wrapped format (already unwrapped by interceptor)
  
  const result: PublicWishlist = {
    owner_name: data.owner_name || data.user_name || data.user?.name || data.username || 'User',
    items: [],
    items_count: 0,
  };
  
  // Try to find items array in various locations
  const itemsSource = data.items || data.products || data.favorites || data.data?.items || [];
  
  if (Array.isArray(itemsSource)) {
    result.items = itemsSource.map((item: Record<string, unknown>) => ({
      id: String(item.id || item.product_id || item.item_id || ''),
      name: String(item.name || item.title || item.product_name || ''),
      brand: item.brand as string | undefined || item.brand_name as string | undefined,
      image_url: item.image_url as string | undefined || item.image as string | undefined || item.thumbnail as string | undefined,
      price: typeof item.price === 'number' ? item.price : (typeof item.price === 'string' ? parseFloat(item.price) : undefined),
      added_at: item.added_at as string | undefined || item.created_at as string | undefined,
    }));
  }
  
  result.items_count = data.items_count ?? data.total ?? data.count ?? result.items.length;
  
  if (import.meta.env.DEV) {
    console.log('📋 Parsed public wishlist:', result);
  }
  
  return result;
};
