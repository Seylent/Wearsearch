/**
 * API Services Index
 * Central export point for all API services
 */

export * from './products.api';
export * from './stores.api';
export * from './brands.api';
export * from './seo.api';

// Re-export for convenience
import { productsApi } from './products.api';
import { storesApi } from './stores.api';
import { brandsApi } from './brands.api';
import { seoApi } from './seo.api';

export const apiServices = {
  products: productsApi,
  stores: storesApi,
  brands: brandsApi,
  seo: seoApi,
};
