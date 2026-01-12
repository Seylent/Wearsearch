/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(globalThis.window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
// Default behavior: treat observed elements as visible immediately.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? '0px';

    const threshold = options?.threshold;
    const _thresholds = (() => {
      if (Array.isArray(threshold)) {
        return threshold;
      }
      if (typeof threshold === 'number') {
        return [threshold];
      }
      return [0];
    })();
  }

  disconnect(): void {
    // Mock implementation
  }

  observe(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this
    );
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(_target: Element): void {
    // Mock implementation
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() { /* Mock implementation */ }
  disconnect() { /* Mock implementation */ }
  unobserve() { /* Mock implementation */ }
} as any;

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
globalThis.localStorage = localStorageMock as any;
