/**
 * Category Service for WearSearch
 */

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
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
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
      if (filters?.isActive !== undefined) searchParams.set('isActive', filters.isActive.toString());
      if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) searchParams.set('sortOrder', filters.sortOrder);

      const url = `${this.baseUrl}/api/categories?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        next: { revalidate: 3600 }, // 1 hour cache
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Categories API error: ${response.status}`);
        return this.getFallbackCategories();
      }

      const data = await response.json();
      return data?.data?.items || data?.items || data || this.getFallbackCategories();
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
      const response = await fetch(`${this.baseUrl}/api/categories/${id}`, {
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!response.ok) {
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
      const response = await fetch(`${this.baseUrl}/api/categories/slug/${slug}`, {
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!response.ok) {
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
      sortOrder: 'asc'
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
      sortOrder: 'asc'
    });
  }

  /**
   * Search categories
   */
  async searchCategories(query: string, limit = 10): Promise<Category[]> {
    return this.getCategories({ 
      search: query, 
      limit,
      isActive: true 
    });
  }

  /**
   * Fallback categories for when API is not available
   */
  private getFallbackCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion clothing for all occasions',
        productCount: 0,
        isActive: true,
        sortOrder: 1,
      },
      {
        id: '2',
        name: 'Shoes',
        slug: 'shoes',
        description: 'Footwear for every style',
        productCount: 0,
        isActive: true,
        sortOrder: 2,
      },
      {
        id: '3',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Complete your look with accessories',
        productCount: 0,
        isActive: true,
        sortOrder: 3,
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
  async getCategoryTree(): Promise<Category[]> {
    try {
      const allCategories = await this.getCategories({ isActive: true });
      
      // Build tree structure
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // First pass: create map of all categories
      allCategories.forEach(category => {
        categoryMap.set(category.id, { ...category, subcategories: [] });
      });

      // Second pass: build tree structure
      allCategories.forEach(category => {
        const categoryWithSubcategories = categoryMap.get(category.id);
        if (!categoryWithSubcategories) return;

        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
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
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'slug' in obj
  );
};

export default categoryService;