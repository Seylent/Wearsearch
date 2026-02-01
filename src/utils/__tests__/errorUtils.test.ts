/**
 * Error Utils Tests
 */

import { isError, hasMessage, isCanceledError, getErrorMessage, isAuthError } from '../errorUtils';

describe('errorUtils', () => {
  describe('isError', () => {
    it('should return true for Error instance', () => {
      expect(isError(new Error('test'))).toBe(true);
    });

    it('should return false for non-Error objects', () => {
      expect(isError('string')).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError({})).toBe(false);
    });
  });

  describe('hasMessage', () => {
    it('should return true for objects with message property', () => {
      expect(hasMessage({ message: 'test' })).toBe(true);
      expect(hasMessage(new Error('test'))).toBe(true);
    });

    it('should return false for objects without message', () => {
      expect(hasMessage({})).toBe(false);
      expect(hasMessage('string')).toBe(false);
      expect(hasMessage(null)).toBe(false);
    });
  });

  describe('isCanceledError', () => {
    it('should detect CanceledError', () => {
      expect(isCanceledError({ name: 'CanceledError' })).toBe(true);
    });

    it('should detect ERR_CANCELED code', () => {
      expect(isCanceledError({ code: 'ERR_CANCELED' })).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(isCanceledError(new Error('test'))).toBe(false);
      expect(isCanceledError({ name: 'TypeError' })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      expect(getErrorMessage(new Error('test error'))).toBe('test error');
    });

    it('should extract message from object with message', () => {
      expect(getErrorMessage({ message: 'custom error' })).toBe('custom error');
    });

    it('should return string directly', () => {
      expect(getErrorMessage('simple error')).toBe('simple error');
    });

    it('should use fallback for unknown types', () => {
      expect(getErrorMessage(null, 'fallback')).toBe('fallback');
      expect(getErrorMessage(undefined)).toBe('An error occurred');
      expect(getErrorMessage(123)).toBe('An error occurred');
    });
  });

  describe('isAuthError', () => {
    it('should detect authentication errors', () => {
      expect(isAuthError({ message: 'Unauthorized access' })).toBe(true);
      expect(isAuthError({ message: 'Authentication failed' })).toBe(true);
      expect(isAuthError({ message: 'Invalid token' })).toBe(true);
      expect(isAuthError({ message: 'Please login' })).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      expect(isAuthError({ message: 'Network error' })).toBe(false);
      expect(isAuthError(new Error('Not found'))).toBe(false);
      expect(isAuthError('Regular error')).toBe(false);
    });
  });
});
