/**
 * Search History API Service
 * Handles search history and popular queries API calls
 */

import api, { handleApiError } from './api';

// Types
export interface SearchHistoryItem {
  query: string;
  resultsCount?: number;
  searchedAt: string;
}

export interface PopularQuery {
  query: string;
  count: number;
}

// API functions
export const searchService = {
  /**
   * Get user's search history
   */
  async getSearchHistory(limit: number = 10): Promise<SearchHistoryItem[]> {
    try {
      const response = await api.get(`/search/history?limit=${limit}`);
      const history = response.data.history || response.data || [];
      return history.map(transformHistoryItem);
    } catch (error) {
      // If not authenticated, return empty array
      console.warn('Failed to fetch search history:', error);
      return [];
    }
  },

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await api.delete('/search/history');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get popular search queries
   */
  async getPopularQueries(limit: number = 5): Promise<PopularQuery[]> {
    try {
      const response = await api.get(`/search/popular?limit=${limit}`);
      const popular = response.data.popular || response.data || [];
      return popular.map(transformPopularQuery);
    } catch (error) {
      console.warn('Failed to fetch popular queries:', error);
      // Return default popular queries as fallback
      return [
        { query: 'nike', count: 0 },
        { query: 'adidas', count: 0 },
        { query: 'sneakers', count: 0 },
        { query: 'кросівки', count: 0 },
      ];
    }
  },

  /**
   * Track a search query
   */
  async trackSearch(query: string, resultsCount?: number): Promise<void> {
    try {
      await api.post('/search/track', {
        query: query.trim(),
        results_count: resultsCount,
      });
    } catch (error) {
      // Silent fail - tracking is not critical
      console.warn('Failed to track search:', error);
    }
  },
};

// Transform functions (backend → frontend)
function transformHistoryItem(raw: Record<string, unknown>): SearchHistoryItem {
  return {
    query: String(raw.query || ''),
    resultsCount: raw.results_count !== undefined ? Number(raw.results_count) : undefined,
    searchedAt: String(raw.searched_at || raw.searchedAt || new Date().toISOString()),
  };
}

function transformPopularQuery(raw: Record<string, unknown>): PopularQuery {
  return {
    query: String(raw.query || ''),
    count: Number(raw.count || raw.search_count || 0),
  };
}

export default searchService;
