/**
 * Search History Hook
 * Manages search history and popular queries with API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/utils/authStorage';
import searchService from '@/services/searchService';

const HISTORY_KEY = 'wearsearch_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  searchedAt: number;
}

/**
 * Get search history from localStorage (fallback for guests)
 */
const getStoredHistory = (): SearchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

/**
 * Save search history to localStorage
 */
const saveHistory = (items: SearchHistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    console.warn('Failed to save search history');
  }
};

/**
 * Hook for managing search history - uses API when authenticated
 */
export const useSearchHistory = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = isAuthenticated();
  
  // Local state for guests
  const [localHistory, setLocalHistory] = useState<SearchHistoryItem[]>([]);

  // Load local history on mount (for guests)
  useEffect(() => {
    if (!isLoggedIn) {
      setLocalHistory(getStoredHistory());
    }
  }, [isLoggedIn]);

  // Fetch history from API for authenticated users
  const { data: apiHistory } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => searchService.getSearchHistory(MAX_HISTORY_ITEMS),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch popular queries from API
  const { data: apiPopularQueries } = useQuery({
    queryKey: ['popularQueries'],
    queryFn: () => searchService.getPopularQueries(8),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Transform API history to local format
  const history: SearchHistoryItem[] = isLoggedIn
    ? (apiHistory || []).map((h) => ({
        query: h.query,
        searchedAt: new Date(h.searchedAt).getTime(),
      }))
    : localHistory;

  // Popular queries from API or defaults
  const popularQueries: string[] = apiPopularQueries
    ? apiPopularQueries.map((p) => p.query)
    : ['nike', 'adidas', 'sneakers', 'jacket', 'hoodie', 'jeans', 't-shirt', 'shoes'];

  // Track search mutation
  const trackMutation = useMutation({
    mutationFn: ({ query, resultsCount }: { query: string; resultsCount?: number }) =>
      searchService.trackSearch(query, resultsCount),
    onSuccess: () => {
      if (isLoggedIn) {
        queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      }
    },
  });

  // Clear history mutation
  const clearMutation = useMutation({
    mutationFn: () => searchService.clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  /**
   * Add a search query to history
   */
  const addToHistory = useCallback((query: string, resultsCount?: number) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return;

    // Track via API (works for both authenticated and guest users)
    trackMutation.mutate({ query: trimmed, resultsCount });

    // Also save locally for guests
    if (!isLoggedIn) {
      setLocalHistory((prevHistory) => {
        // Remove if already exists
        const filtered = prevHistory.filter((item) => item.query.toLowerCase() !== trimmed);

        // Create new item
        const newItem: SearchHistoryItem = {
          query: trimmed,
          searchedAt: Date.now(),
        };

        // Add to beginning, limit to MAX_HISTORY_ITEMS
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        saveHistory(updated);
        return updated;
      });
    }
  }, [isLoggedIn, trackMutation]);

  /**
   * Remove a query from history
   */
  const removeFromHistory = useCallback((query: string) => {
    // For guests, remove from localStorage
    if (!isLoggedIn) {
      setLocalHistory((prevHistory) => {
        const updated = prevHistory.filter((item) => item.query !== query);
        saveHistory(updated);
        return updated;
      });
    }
    // Note: API doesn't have individual item removal - could add if needed
  }, [isLoggedIn]);

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(() => {
    if (isLoggedIn) {
      clearMutation.mutate();
    } else {
      setLocalHistory([]);
      localStorage.removeItem(HISTORY_KEY);
    }
  }, [isLoggedIn, clearMutation]);

  /**
   * Get suggestions based on input
   */
  const getSuggestions = useCallback(
    (input: string): string[] => {
      const trimmed = input.trim().toLowerCase();
      if (!trimmed) {
        // Return recent history + popular
        return [
          ...history.slice(0, 5).map((h) => h.query),
          ...popularQueries.filter((p) => !history.some((h) => h.query === p)).slice(0, 3),
        ];
      }

      // Filter history and popular that match input
      const historyMatches = history
        .filter((h) => h.query.includes(trimmed))
        .map((h) => h.query);

      const popularMatches = popularQueries.filter(
        (p) => p.includes(trimmed) && !historyMatches.includes(p)
      );

      return [...historyMatches, ...popularMatches].slice(0, 8);
    },
    [history, popularQueries]
  );

  return {
    history,
    popularQueries,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getSuggestions,
  };
};

export default useSearchHistory;
