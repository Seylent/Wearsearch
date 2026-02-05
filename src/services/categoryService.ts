/**
 * Category Service for WearSearch
 */

import { API_CONFIG } from '@/config/api.config';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  parentId?: string | null;
  subcategories?: Category[];
  isActive?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFilter {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortBy?: 'name' | 'productCount' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  lang?: string;
}

export interface CategoryAPIResponse {
  categories: Category[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class CategoryService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.API_URL;
  }

  private async fetchWithFallback(path: string, init?: RequestInit): Promise<Response | null> {
    const v1Url = `${this.baseUrl}/api/v1${path}`;
    const legacyUrl = `${this.baseUrl}/api${path}`;

    try {
      const response = await fetch(v1Url, init);
      if (response.ok || (response.status !== 404 && response.status !== 405)) {
        return response;
      }
    } catch {
      // ignore and try legacy
    }

    try {
      return await fetch(legacyUrl, init);
    } catch {
      return null;
    }
  }

  /**
   * Get all categories with optional filters
   */
  async getCategories(filters?: CategoryFilter): Promise<Category[]> {
    try {
      const searchParams = new URLSearchParams();

      if (filters?.page) searchParams.set('page', filters.page.toString());
      if (filters?.limit) searchParams.set('limit', filters.limit.toString());
      if (filters?.search) searchParams.set('search', filters.search);
      if (filters?.parentId !== undefined) searchParams.set('parentId', filters.parentId || '');
      if (filters?.isActive !== undefined)
        searchParams.set('isActive', filters.isActive.toString());
      if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) searchParams.set('sortOrder', filters.sortOrder);
      if (filters?.lang) searchParams.set('lang', filters.lang);

      const response = await this.fetchWithFallback(`/categories?${searchParams.toString()}`, {
        next: { revalidate: 3600 }, // 1 hour cache
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response || !response.ok) {
        const status = response?.status ?? 'unknown';
        console.warn(`Categories API error: ${status}`);
        return this.getFallbackCategories();
      }

      const data = await response.json();
      const rawItems = data?.data?.items ?? data?.items ?? data ?? [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      if (items.length === 0) return this.getFallbackCategories();
      return items.map(item => this.normalizeCategory(item as Category));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getFallbackCategories();
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await this.fetchWithFallback(`/categories/${id}`, {
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!response || !response.ok) {
        return null;
      }

      const data = await response.json();
      return data?.data || data || null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await this.fetchWithFallback(`/categories/slug/${slug}`, {
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!response || !response.ok) {
        return null;
      }

      const data = await response.json();
      return data?.data || data || null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return null;
    }
  }

  /**
   * Get main categories (top-level)
   */
  async getMainCategories(): Promise<Category[]> {
    return this.getCategories({
      parentId: null,
      isActive: true,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    });
  }

  /**
   * Get subcategories for a parent category
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    return this.getCategories({
      parentId,
      isActive: true,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    });
  }

  /**
   * Search categories
   */
  async searchCategories(query: string, limit = 10): Promise<Category[]> {
    return this.getCategories({
      search: query,
      limit,
      isActive: true,
    });
  }

  /**
   * Fallback categories for when API is not available
   */
  public getFallbackCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion clothing for all occasions',
        productCount: 0,
        isActive: true,
        sortOrder: 1,
        subcategories: [
          {
            id: '1-1',
            name: 'Jackets',
            slug: 'jackets',
            description: 'Outerwear and jackets',
            productCount: 0,
            isActive: true,
            sortOrder: 1,
            parentId: '1',
          },
          {
            id: '1-2',
            name: 'Hoodies',
            slug: 'hoodies',
            description: 'Hoodies and sweatshirts',
            productCount: 0,
            isActive: true,
            sortOrder: 2,
            parentId: '1',
          },
          {
            id: '1-3',
            name: 'T-shirts',
            slug: 't-shirts',
            description: 'T-shirts and tops',
            productCount: 0,
            isActive: true,
            sortOrder: 3,
            parentId: '1',
          },
          {
            id: '1-4',
            name: 'Pants',
            slug: 'pants',
            description: 'Pants and trousers',
            productCount: 0,
            isActive: true,
            sortOrder: 4,
            parentId: '1',
          },
        ],
      },
      {
        id: '2',
        name: 'Shoes',
        slug: 'shoes',
        description: 'Footwear for every style',
        productCount: 0,
        isActive: true,
        sortOrder: 2,
        subcategories: [
          {
            id: '2-1',
            name: 'Sneakers',
            slug: 'sneakers',
            description: 'Casual sneakers',
            productCount: 0,
            isActive: true,
            sortOrder: 1,
            parentId: '2',
          },
          {
            id: '2-2',
            name: 'Boots',
            slug: 'boots',
            description: 'Boots and ankle boots',
            productCount: 0,
            isActive: true,
            sortOrder: 2,
            parentId: '2',
          },
        ],
      },
      {
        id: '3',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Complete your look with accessories',
        productCount: 0,
        isActive: true,
        sortOrder: 3,
        subcategories: [
          {
            id: '3-1',
            name: 'Bags',
            slug: 'bags',
            description: 'Handbags and backpacks',
            productCount: 0,
            isActive: true,
            sortOrder: 1,
            parentId: '3',
          },
          {
            id: '3-2',
            name: 'Hats',
            slug: 'hats',
            description: 'Caps and hats',
            productCount: 0,
            isActive: true,
            sortOrder: 2,
            parentId: '3',
          },
        ],
      },
      {
        id: '4',
        name: 'Bags',
        slug: 'bags',
        description: 'Handbags, backpacks, and more',
        productCount: 0,
        isActive: true,
        sortOrder: 4,
      },
    ];
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree(lang?: string): Promise<Category[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('tree', '1');
      if (lang) searchParams.set('lang', lang);
      const response = await this.fetchWithFallback(`/categories?${searchParams.toString()}`, {
        next: { revalidate: 3600 },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response?.ok) {
        const data = await response.json();
        const tree =
          data?.tree ?? data?.data?.tree ?? data?.data?.items?.tree ?? data?.items?.tree ?? null;

        if (Array.isArray(tree)) {
          return tree.map(node => this.normalizeCategory(node as Category, true));
        }
      }

      const allCategories = await this.getCategories({ isActive: true, lang });

      // Build tree structure from flat list
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      allCategories.forEach(category => {
        categoryMap.set(category.id, { ...category, subcategories: [] });
      });

      allCategories.forEach(category => {
        const categoryWithSubcategories = categoryMap.get(category.id);
        if (!categoryWithSubcategories) return;

        const parentId = category.parentId;
        if (parentId) {
          const parent = categoryMap.get(parentId);
          if (parent?.subcategories) {
            parent.subcategories.push(categoryWithSubcategories);
          }
        } else {
          rootCategories.push(categoryWithSubcategories);
        }
      });

      return rootCategories;
    } catch (error) {
      console.error('Error building category tree:', error);
      return this.getFallbackCategories();
    }
  }

  private normalizeCategory(raw: Category, includeChildren = false): Category {
    const record = raw as unknown as Record<string, unknown>;
    const normalized: Category = {
      ...(raw as Category),
      parentId:
        typeof (record.parentId as string | undefined) === 'string'
          ? (record.parentId as string)
          : typeof (record.parent_id as string | undefined) === 'string'
            ? (record.parent_id as string)
            : null,
      sortOrder:
        typeof (record.sortOrder as number | undefined) === 'number'
          ? (record.sortOrder as number)
          : typeof (record.sort_order as number | undefined) === 'number'
            ? (record.sort_order as number)
            : undefined,
    };

    if (includeChildren) {
      const rawChildren = Array.isArray(record.subcategories)
        ? record.subcategories
        : Array.isArray(record.children)
          ? record.children
          : [];
      if (rawChildren.length > 0) {
        normalized.subcategories = rawChildren.map(child =>
          this.normalizeCategory(child as Category, true)
        );
      }
    }

    return normalized;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();

// Helper functions
export const formatCategoryName = (category: Category): string => {
  return category.name;
};

export const getCategoryUrl = (category: Category): string => {
  return `/products?category=${category.slug}`;
};

export const getCategoryImageUrl = (category: Category): string => {
  return category.imageUrl || `/images/categories/${category.slug}.jpg`;
};

// Type guards
export const isCategory = (obj: unknown): obj is Category => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'slug' in obj;
};

export default categoryService;
