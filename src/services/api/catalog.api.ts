/**
 * Catalog API Service
 * Taxonomy filters: categories, sizes, materials, technologies
 */

import { apiLegacy } from '../api';

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  parent_id?: string | null;
};

export type CatalogSize = {
  id: string;
  slug: string;
  label: string;
  group: 'tops' | 'bottoms' | 'footwear' | 'accessories' | 'universal' | string;
};

export type CatalogMaterial = {
  id: string;
  slug: string;
  name: string;
};

export type CatalogTechnology = {
  id: string;
  slug: string;
  name: string;
};

export type CatalogFiltersResponse = {
  categories: CatalogCategory[];
  sizes: CatalogSize[];
  materials: CatalogMaterial[];
  technologies: CatalogTechnology[];
};

const emptyFilters: CatalogFiltersResponse = {
  categories: [],
  sizes: [],
  materials: [],
  technologies: [],
};

export const catalogApi = {
  getFilters: async (): Promise<CatalogFiltersResponse> => {
    try {
      const response = await apiLegacy.get('/catalog/filters');
      const data = response.data as Partial<CatalogFiltersResponse> | undefined;
      return {
        categories: Array.isArray(data?.categories) ? data?.categories : [],
        sizes: Array.isArray(data?.sizes) ? data?.sizes : [],
        materials: Array.isArray(data?.materials) ? data?.materials : [],
        technologies: Array.isArray(data?.technologies) ? data?.technologies : [],
      };
    } catch (error) {
      console.error('[Catalog API] Failed to fetch catalog filters:', error);
      return emptyFilters;
    }
  },
};

export default catalogApi;
