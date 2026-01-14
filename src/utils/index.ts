/**
 * Client-Only Utils Index
 * 
 * Re-exports verified utilities from the utils folder.
 * Only exports what actually exists to avoid TypeScript errors.
 */

// Authentication utilities
export { 
  setAuth, 
  getAuth, 
  getAuthData, 
  clearAuth, 
  isAuthenticated,
  type AuthData 
} from './authStorage';

// Performance monitoring
export { 
  performanceMonitor 
} from './performanceMonitor';

// Local storage cleanup
export { 
  cleanupLocalStorage
} from './localStorageCleanup';

// Safe to use anywhere
export { cn } from './cn';

// Error translation
export { 
  translateErrorCode
} from './errorTranslation';

// Price utilities 
export { 
  parsePrice,
  formatPriceRange 
} from './priceUtils';

// Retry utilities
export { 
  retryWithBackoff
} from './retryWithBackoff';

// API utilities
export { 
  batchRequests
} from './apiOptimizations';

// Search utilities
export { 
  detectSearchFilter
} from './searchFilters';