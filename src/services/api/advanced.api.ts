/**
 * Advanced Admin Features API
 * Integration with backend advanced endpoints
 */

import { getAuth, isCookieAuthMode } from '@/utils/authStorage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const ADVANCED_BASE = `${API_BASE}/api/v1/advanced`;

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const getCsrfToken = (): string | null => {
  return readCookie('csrf_token');
};

const getAuthHeaders = (
  withJson = true,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): HeadersInit => {
  const headers: HeadersInit = {};
  const shouldAttachCsrf = method !== 'GET';
  if (shouldAttachCsrf) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }
  if (!isCookieAuthMode()) {
    const token = getAuth();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  if (withJson) headers['Content-Type'] = 'application/json';
  return headers;
};

const withCredentials = isCookieAuthMode() ? { credentials: 'include' as RequestCredentials } : {};

// ===== EXPORT/IMPORT =====

export const exportProducts = async (format: 'csv' | 'json', ids?: string[]) => {
  const params = new URLSearchParams({ format });
  if (ids?.length) params.append('ids', ids.join(','));

  const response = await fetch(`${ADVANCED_BASE}/items/export?${params}`, {
    headers: getAuthHeaders(true, 'GET'),
    ...withCredentials,
  });

  if (!response.ok) throw new Error('Export failed');
  return response.blob();
};

export const importProducts = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ADVANCED_BASE}/items/import`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(false, 'POST'),
    },
    ...withCredentials,
    body: formData,
  });

  if (!response.ok) throw new Error('Import failed');
  return response.json();
};

// ===== TEMPLATES =====

export const getTemplates = async (category?: string) => {
  const params = category ? `?category=${category}` : '';
  const response = await fetch(`${ADVANCED_BASE}/templates${params}`, {
    headers: getAuthHeaders(true, 'GET'),
    ...withCredentials,
  });

  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
};

export const createTemplate = async (data: {
  name: string;
  category?: string;
  template_data: Record<string, unknown>;
}) => {
  const response = await fetch(`${ADVANCED_BASE}/templates`, {
    method: 'POST',
    headers: getAuthHeaders(true, 'POST'),
    ...withCredentials,
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create template');
  return response.json();
};

export const deleteTemplate = async (id: string) => {
  const response = await fetch(`${ADVANCED_BASE}/templates/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(true, 'DELETE'),
    ...withCredentials,
  });

  if (!response.ok) throw new Error('Failed to delete template');
  return response.json();
};

// ===== STOCK MANAGEMENT =====

export const getStock = async (productId: string) => {
  const response = await fetch(`${ADVANCED_BASE}/items/${productId}/stock`, {
    headers: getAuthHeaders(true, 'GET'),
    ...withCredentials,
  });

  if (!response.ok) throw new Error('Failed to fetch stock');
  return response.json();
};

export const updateStock = async (productId: string, storeId: string, stock: number) => {
  const response = await fetch(`${ADVANCED_BASE}/items/${productId}/stock`, {
    method: 'PUT',
    headers: getAuthHeaders(true, 'PUT'),
    ...withCredentials,
    body: JSON.stringify({ store_id: storeId, stock }),
  });

  if (!response.ok) throw new Error('Failed to update stock');
  return response.json();
};

// ===== MULTIPLE IMAGES =====

export const uploadImages = async (productId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await fetch(`${ADVANCED_BASE}/items/${productId}/images`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(false, 'POST'),
    },
    ...withCredentials,
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to upload images');
  return response.json();
};

export const setPrimaryImage = async (productId: string, imageId: string) => {
  const response = await fetch(`${ADVANCED_BASE}/items/${productId}/images/${imageId}/primary`, {
    method: 'PUT',
    headers: getAuthHeaders(true, 'PUT'),
    ...withCredentials,
  });

  if (!response.ok) throw new Error('Failed to set primary image');
  return response.json();
};

export const deleteImage = async (productId: string, imageId: string) => {
  const response = await fetch(`${ADVANCED_BASE}/items/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(true, 'DELETE'),
    ...withCredentials,
  });

  if (!response.ok) throw new Error('Failed to delete image');
  return response.json();
};

// ===== SCHEDULED PUBLISHING =====

export const scheduleProduct = async (
  productId: string,
  data: {
    status: 'scheduled' | 'draft' | 'published';
    publish_at?: string;
    unpublish_at?: string;
  }
) => {
  const response = await fetch(`${ADVANCED_BASE}/items/${productId}/schedule`, {
    method: 'POST',
    headers: getAuthHeaders(true, 'POST'),
    ...withCredentials,
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to schedule product');
  return response.json();
};

export const getScheduledProducts = async () => {
  const response = await fetch(`${ADVANCED_BASE}/items/scheduled`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to fetch scheduled products');
  return response.json();
};

// ===== PRICE HISTORY =====

export const getPriceHistory = async (productId: string, storeId?: string, limit: number = 50) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (storeId) params.append('store_id', storeId);

  const response = await fetch(`${API_BASE}/api/v1/items/${productId}/price-history?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to fetch price history');
  return response.json();
};

export const getStorePriceHistory = async (
  productId: string,
  storeId: string,
  limit: number = 50
) => {
  const params = new URLSearchParams({ limit: limit.toString() });

  const response = await fetch(
    `${API_BASE}/api/v1/items/${productId}/stores/${storeId}/price-history?${params}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) throw new Error('Failed to fetch store price history');
  return response.json();
};

// ===== ACTIVITY LOG / AUDIT TRAIL =====

export const getActivityLog = async (params?: {
  entity_type?: string;
  entity_id?: string;
  limit?: number;
  offset?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.entity_type) searchParams.append('entity_type', params.entity_type);
  if (params?.entity_id) searchParams.append('entity_id', params.entity_id);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const response = await fetch(`${API_BASE}/api/v1/audit-log?${searchParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to fetch activity log');
  return response.json();
};

export const createManualLogEntry = async (data: {
  entity_type: string;
  entity_id: string;
  action: string;
  changes: Record<string, unknown>;
}) => {
  const response = await fetch(`${API_BASE}/api/v1/audit-log`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create log entry');
  return response.json();
};

// ===== PRODUCT RELATIONS =====

export const getRelatedProducts = async (
  productId: string,
  type?: 'similar' | 'bundle' | 'frequently_bought'
) => {
  const params = type ? `?type=${type}` : '';
  const response = await fetch(`${API_BASE}/api/v1/items/${productId}/related${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to fetch related products');
  return response.json();
};

export const addProductRelation = async (
  productId: string,
  data: {
    related_id: string;
    relation_type: 'similar' | 'bundle' | 'frequently_bought';
    strength?: number;
  }
) => {
  const response = await fetch(`${API_BASE}/api/v1/items/${productId}/relations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to add relation');
  return response.json();
};

export const deleteProductRelation = async (productId: string, relationId: string) => {
  const response = await fetch(`${API_BASE}/api/v1/items/${productId}/relations/${relationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to delete relation');
  return response.json();
};

// ===== ANALYTICS =====

export const getAnalyticsSummary = async () => {
  const response = await fetch(`${ADVANCED_BASE}/analytics/summary`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

export const advancedApi = {
  // Export/Import
  exportProducts,
  importProducts,

  // Templates
  getTemplates,
  createTemplate,
  deleteTemplate,

  // Stock
  getStock,
  updateStock,

  // Images
  uploadImages,
  setPrimaryImage,
  deleteImage,

  // Scheduling
  scheduleProduct,
  getScheduledProducts,

  // Price History
  getPriceHistory,
  getStorePriceHistory,

  // Activity Log
  getActivityLog,
  createManualLogEntry,

  // Relations
  getRelatedProducts,
  addProductRelation,
  deleteProductRelation,

  // Analytics
  getAnalyticsSummary,
};
