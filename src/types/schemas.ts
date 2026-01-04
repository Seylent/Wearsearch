/**
 * API Response Schemas
 * Zod schemas for runtime validation of API responses
 */

import { z } from 'zod';

/**
 * Product Schema
 */
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  brands: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
  category: z.string().optional().nullable(),
  type: z.string().optional().nullable(), // Legacy field
  color: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()]).optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  gender: z.enum(['men', 'women', 'unisex']).optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export const ProductsResponseSchema = z.object({
  success: z.boolean().optional(),
  products: z.array(ProductSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// Allow direct array response as well
export const ProductsArraySchema = z.array(ProductSchema);

/**
 * Store Schema
 */
export const StoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  tiktok_url: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  shipping: z.string().optional().nullable(),
  is_verified: z.boolean().optional(),
  is_recommended: z.boolean().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export const StoresResponseSchema = z.object({
  success: z.boolean().optional(),
  stores: z.array(StoreSchema),
  total: z.number().optional(),
});

export const StoresArraySchema = z.array(StoreSchema);

/**
 * Brand Schema
 */
export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export const BrandsResponseSchema = z.object({
  brands: z.array(BrandSchema),
  total: z.number().optional(),
});

export const BrandsArraySchema = z.array(BrandSchema);

/**
 * Favorite Schema
 */
export const FavoriteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  created_at: z.string().optional().nullable(),
  products: ProductSchema.optional().nullable(),
  product: ProductSchema.optional().nullable(),
});

export const FavoritesResponseSchema = z.object({
  success: z.boolean().optional(),
  favorites: z.array(FavoriteSchema),
  total: z.number().optional(),
});

/**
 * User Schema
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional().nullable(),
  display_name: z.string().optional().nullable(),
  role: z.enum(['user', 'admin']).optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
  }).optional(),
  user: UserSchema.optional(),
  token: z.string().optional(),
});

/**
 * Generic API Response Schema
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    error_code: z.string().optional(),
    success_code: z.string().optional(),
  });

/**
 * Type exports
 */
export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
export type Store = z.infer<typeof StoreSchema>;
export type StoresResponse = z.infer<typeof StoresResponseSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type BrandsResponse = z.infer<typeof BrandsResponseSchema>;
export type Favorite = z.infer<typeof FavoriteSchema>;
export type FavoritesResponse = z.infer<typeof FavoritesResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
