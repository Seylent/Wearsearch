import { apiUpload, handleApiError } from './api';
import { logError, logInfo } from './logger';
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

      logInfo('Uploading image', {
        component: 'uploadService',
        action: 'UPLOAD_IMAGE',
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          endpoint: '/upload/image',
          fieldName: 'image',
        },
      });

      const response: AxiosResponse<UploadResponse> = await apiUpload.post(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      logInfo('Upload successful', {
        component: 'uploadService',
        action: 'UPLOAD_IMAGE_SUCCESS',
      });
      return response.data;
    } catch (error: unknown) {
      logError('Upload failed', {
        component: 'uploadService',
        action: 'UPLOAD_IMAGE_ERROR',
        metadata: { error },
      });

      // Extract proper error message
      const apiError = handleApiError(error);
      const errorMessage =
        typeof apiError === 'string'
          ? apiError
          : (apiError as { message?: string } | null)?.message || 'Upload failed';

      throw new Error(errorMessage);
    }
  },

  /**
   * Upload multiple image files
   */
  async uploadImages(files: File[]): Promise<MultipleUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      logInfo('Uploading multiple images', {
        component: 'uploadService',
        action: 'UPLOAD_IMAGES',
        metadata: {
          count: files.length,
          endpoint: '/upload/images',
        },
      });

      const response: AxiosResponse<MultipleUploadResponse> = await apiUpload.post(
        '/upload/images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      logInfo('Multiple upload successful', {
        component: 'uploadService',
        action: 'UPLOAD_IMAGES_SUCCESS',
      });
      return response.data;
    } catch (error: unknown) {
      logError('Multiple upload failed', {
        component: 'uploadService',
        action: 'UPLOAD_IMAGES_ERROR',
        metadata: { error },
      });

      // Extract proper error message
      const apiError = handleApiError(error);
      const errorMessage =
        typeof apiError === 'string'
          ? apiError
          : (apiError as { message?: string } | null)?.message || 'Upload failed';

      throw new Error(errorMessage);
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
