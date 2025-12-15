/**
 * API Configuration
 * Central place for API URLs to support network access from other devices
 */

// Get API base URL from environment or use default IP
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://192.168.0.117:3000';
export const API_URL = `${API_BASE_URL}/api`;
