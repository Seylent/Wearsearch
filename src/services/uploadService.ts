import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

// Type definitions for file uploads
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface MultipleUploadResponse {
  files: UploadResponse[];
}

// Upload Service - handles file uploads
export const uploadService = {
  /**
   * Upload a single image file
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response: AxiosResponse<UploadResponse> = await api.post(
        ENDPOINTS.UPLOAD.IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Upload multiple image files
   */
  async uploadImages(files: File[]): Promise<MultipleUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response: AxiosResponse<MultipleUploadResponse> = await api.post(
        ENDPOINTS.UPLOAD.IMAGES,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Validate image file before upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true };
  },

  /**
   * Validate multiple image files before upload
   */
  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    files.forEach((file, index) => {
      const validation = this.validateImage(file);
      if (!validation.valid && validation.error) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default uploadService;
