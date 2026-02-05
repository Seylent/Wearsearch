/**
 * Brand Service for WearSearch
 */

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  countryOfOrigin?: string;
  foundedYear?: number;
  productCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  countryOfOrigin?: string;
  sortBy?: 'name' | 'productCount' | 'foundedYear' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

export interface BrandAPIResponse {
  brands: Brand[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class BrandService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Get all brands with optional filters
   */
  async getBrands(filters?: BrandFilter): Promise<Brand[]> {
    try {
      const searchParams = new URLSearchParams();

      if (filters?.page) searchParams.set('page', filters.page.toString());
      if (filters?.limit) searchParams.set('limit', filters.limit.toString());
      if (filters?.search) searchParams.set('search', filters.search);
      if (filters?.isActive !== undefined)
        searchParams.set('isActive', filters.isActive.toString());
      if (filters?.isFeatured !== undefined)
        searchParams.set('isFeatured', filters.isFeatured.toString());
      if (filters?.countryOfOrigin) searchParams.set('countryOfOrigin', filters.countryOfOrigin);
      if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) searchParams.set('sortOrder', filters.sortOrder);

      const url = `${this.baseUrl}/api/brands?${searchParams.toString()}`;

      const response = await fetch(url, {
        next: { revalidate: 3600 }, // 1 hour cache
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Brands API error: ${response.status}`);
        return this.getFallbackBrands();
      }

      const data = await response.json();
      return data?.data?.items || data?.items || data || this.getFallbackBrands();
    } catch (error) {
      console.error('Error fetching brands:', error);
      return this.getFallbackBrands();
    }
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brands/${id}`, {
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data?.data || data || null;
    } catch (error) {
      console.error('Error fetching brand by ID:', error);
      return null;
    }
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brands/slug/${slug}`, {
        next: { revalidate: 1800 }, // 30 min cache
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data?.data || data || null;
    } catch (error) {
      console.error('Error fetching brand by slug:', error);
      return null;
    }
  }

  /**
   * Get featured brands
   */
  async getFeaturedBrands(limit = 12): Promise<Brand[]> {
    return this.getBrands({
      isFeatured: true,
      isActive: true,
      limit,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    });
  }

  /**
   * Get popular brands (by product count)
   */
  async getPopularBrands(limit = 20): Promise<Brand[]> {
    return this.getBrands({
      isActive: true,
      limit,
      sortBy: 'productCount',
      sortOrder: 'desc',
    });
  }

  /**
   * Search brands
   */
  async searchBrands(query: string, limit = 10): Promise<Brand[]> {
    return this.getBrands({
      search: query,
      limit,
      isActive: true,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }

  /**
   * Get brands by country
   */
  async getBrandsByCountry(countryOfOrigin: string, limit = 50): Promise<Brand[]> {
    return this.getBrands({
      countryOfOrigin,
      isActive: true,
      limit,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }

  /**
   * Fallback brands for when API is not available
   */
  private getFallbackBrands(): Brand[] {
    return [
      {
        id: '1',
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It',
        countryOfOrigin: 'USA',
        foundedYear: 1971,
        productCount: 0,
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
      },
      {
        id: '2',
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing',
        countryOfOrigin: 'Germany',
        foundedYear: 1949,
        productCount: 0,
        isActive: true,
        isFeatured: true,
        sortOrder: 2,
      },
      {
        id: '3',
        name: 'Zara',
        slug: 'zara',
        description: 'Love Your Curves',
        countryOfOrigin: 'Spain',
        foundedYear: 1975,
        productCount: 0,
        isActive: true,
        isFeatured: true,
        sortOrder: 3,
      },
      {
        id: '4',
        name: 'H&M',
        slug: 'hm',
        description: 'Fashion and quality at the best price',
        countryOfOrigin: 'Sweden',
        foundedYear: 1947,
        productCount: 0,
        isActive: true,
        isFeatured: true,
        sortOrder: 4,
      },
      {
        id: '5',
        name: 'Uniqlo',
        slug: 'uniqlo',
        description: 'Made for All',
        countryOfOrigin: 'Japan',
        foundedYear: 1949,
        productCount: 0,
        isActive: true,
        isFeatured: false,
        sortOrder: 5,
      },
    ];
  }

  /**
   * Get brand statistics
   */
  async getBrandStats(): Promise<{
    totalBrands: number;
    activeBrands: number;
    featuredBrands: number;
    countsByCountry: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brands/stats`, {
        next: { revalidate: 3600 }, // 1 hour cache
      });

      if (!response.ok) {
        const fallbackBrands = this.getFallbackBrands();
        return {
          totalBrands: fallbackBrands.length,
          activeBrands: fallbackBrands.filter(b => b.isActive).length,
          featuredBrands: fallbackBrands.filter(b => b.isFeatured).length,
          countsByCountry: {},
        };
      }

      const data = await response.json();
      return (
        data?.data || {
          totalBrands: 0,
          activeBrands: 0,
          featuredBrands: 0,
          countsByCountry: {},
        }
      );
    } catch (error) {
      console.error('Error fetching brand stats:', error);
      const fallbackBrands = this.getFallbackBrands();
      return {
        totalBrands: fallbackBrands.length,
        activeBrands: fallbackBrands.filter(b => b.isActive).length,
        featuredBrands: fallbackBrands.filter(b => b.isFeatured).length,
        countsByCountry: {},
      };
    }
  }
}

// Export singleton instance
export const brandService = new BrandService();

// Helper functions
export const formatBrandName = (brand: Brand): string => {
  return brand.name;
};

export const getBrandUrl = (brand: Brand): string => {
  return `/products?brand=${brand.slug}`;
};

export const getBrandLogoUrl = (brand: Brand): string => {
  return brand.logoUrl || `/images/brands/${brand.slug}.jpg`;
};

export const getBrandDescription = (brand: Brand): string => {
  if (brand.description) return brand.description;
  if (brand.foundedYear && brand.countryOfOrigin) {
    return `Founded in ${brand.foundedYear} in ${brand.countryOfOrigin}`;
  }
  if (brand.countryOfOrigin) {
    return `From ${brand.countryOfOrigin}`;
  }
  return `Explore ${brand.name} products`;
};

// Type guards
export const isBrand = (obj: unknown): obj is Brand => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'slug' in obj;
};

// Sorting functions
export const sortBrandsByName = (brands: Brand[]): Brand[] => {
  return [...brands].sort((a, b) => a.name.localeCompare(b.name));
};

export const sortBrandsByPopularity = (brands: Brand[]): Brand[] => {
  return [...brands].sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
};

export const sortBrandsByFoundedYear = (brands: Brand[]): Brand[] => {
  return [...brands].sort((a, b) => (a.foundedYear || 0) - (b.foundedYear || 0));
};

export default brandService;
