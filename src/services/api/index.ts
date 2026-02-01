/**
 * API Services Index
 * Central export point for all API services
 */

export * from './products.api';
export * from './stores.api';
export * from './brands.api';
export * from './seo.api';
export * from './catalog.api';
export * from './userContext.api';

// Re-export for convenience
import { productsApi } from './products.api';
import { storesApi } from './stores.api';
import { brandsApi } from './brands.api';
import { seoApi } from './seo.api';
import { catalogApi } from './catalog.api';
import { userContextApi } from './userContext.api';

export const apiServices = {
  products: productsApi,
  stores: storesApi,
  brands: brandsApi,
  seo: seoApi,
  catalog: catalogApi,
  userContext: userContextApi,
};
