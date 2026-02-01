/**
 * Tests for safeStorage utilities
 */

import {
  isBrowser,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeClear,
  getMatchingKeys,
} from '../safeStorage';

describe('safeStorage', () => {
  // Mock localStorage
  const localStorageMock: Record<string, unknown> & {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
    key: jest.Mock;
    length: number;
  } = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
  };

  const withStorageUnavailable = (callback: () => void) => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    try {
      callback();
    } finally {
      if (original) {
        Object.defineProperty(window, 'localStorage', original);
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  describe('isBrowser', () => {
    it('should return true when window is defined', () => {
      expect(isBrowser()).toBe(true);
    });

    it('should return false when localStorage is unavailable', () => {
      withStorageUnavailable(() => {
        expect(isBrowser()).toBe(false);
      });
    });
  });

  describe('safeGetItem', () => {
    it('should return null when not in browser', () => {
      withStorageUnavailable(() => {
        expect(safeGetItem('key')).toBeNull();
      });
    });

    it('should return default value when key not found', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(safeGetItem('key', 'default')).toBe('default');
    });

    it('should parse JSON when value is valid JSON', () => {
      const data = { test: 'value' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      expect(safeGetItem('key')).toEqual(data);
    });

    it('should return string when value is not valid JSON', () => {
      localStorageMock.getItem.mockReturnValue('plain string');
      expect(safeGetItem('key')).toBe('plain string');
    });

    it('should return default value on error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(safeGetItem('key', 'default')).toBe('default');
    });
  });

  describe('safeSetItem', () => {
    it('should return false when not in browser', () => {
      withStorageUnavailable(() => {
        expect(safeSetItem('key', 'value')).toBe(false);
      });
    });

    it('should set string value directly', () => {
      expect(safeSetItem('key', 'value')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value');
    });

    it('should stringify object values', () => {
      const data = { test: 'value' };
      expect(safeSetItem('key', data)).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key', JSON.stringify(data));
    });

    it('should handle QuotaExceededError', () => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      localStorageMock.setItem.mockImplementation(() => {
        throw error;
      });
      expect(safeSetItem('key', 'value')).toBe(false);
    });

    it('should handle generic errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(safeSetItem('key', 'value')).toBe(false);
    });
  });

  describe('safeRemoveItem', () => {
    it('should return false when not in browser', () => {
      withStorageUnavailable(() => {
        expect(safeRemoveItem('key')).toBe(false);
      });
    });

    it('should remove item successfully', () => {
      expect(safeRemoveItem('key')).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('key');
    });

    it('should return false on error', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(safeRemoveItem('key')).toBe(false);
    });
  });

  describe('safeClear', () => {
    it('should return false when not in browser', () => {
      withStorageUnavailable(() => {
        expect(safeClear()).toBe(false);
      });
    });

    it('should clear storage successfully', () => {
      expect(safeClear()).toBe(true);
      expect(localStorageMock.clear).toHaveBeenCalled();
    });

    it('should return false on error', () => {
      localStorageMock.clear.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(safeClear()).toBe(false);
    });
  });

  describe('getMatchingKeys', () => {
    it('should return empty array when not in browser', () => {
      withStorageUnavailable(() => {
        expect(getMatchingKeys('test')).toEqual([]);
      });
    });

    it('should return keys matching string pattern', () => {
      localStorageMock.test_key_1 = '1';
      localStorageMock.other_key = '2';
      localStorageMock.test_key_2 = '3';

      const result = getMatchingKeys('test');
      expect(result).toEqual(['test_key_1', 'test_key_2']);
    });

    it('should return keys matching regex pattern', () => {
      localStorageMock.test_key_1 = '1';
      localStorageMock.other_key = '2';
      localStorageMock.test_key_2 = '3';

      const result = getMatchingKeys(/^test/);
      expect(result).toEqual(['test_key_1', 'test_key_2']);
    });

    it('should return empty array on error', () => {
      const originalStorage = window.localStorage;
      const proxyStorage = new Proxy(localStorageMock, {
        ownKeys() {
          throw new Error('Storage error');
        },
      });

      Object.defineProperty(window, 'localStorage', {
        value: proxyStorage,
        writable: true,
        configurable: true,
      });

      expect(getMatchingKeys('test')).toEqual([]);

      Object.defineProperty(window, 'localStorage', {
        value: originalStorage,
        writable: true,
        configurable: true,
      });
    });
  });
});
