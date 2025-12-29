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
      // Try 'image' field name (matches endpoint name)
      formData.append('image', file);

      console.log('📤 Uploading image:', {
        name: file.name,
        size: file.size,
        type: file.type,
        endpoint: ENDPOINTS.UPLOAD.IMAGE,
        fieldName: 'image'
      });

      const response: AxiosResponse<UploadResponse> = await api.post(
        ENDPOINTS.UPLOAD.IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      
      // Extract proper error message
      const apiError = handleApiError(error);
      const errorMessage = typeof apiError === 'string' 
        ? apiError 
        : apiError.message || 'Upload failed';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Upload multiple image files
   */
  async uploadImages(files: File[]): Promise<MultipleUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        // Backend expects 'filePaths' field name for multiple files
        formData.append('filePaths', file);
      });

      console.log('📤 Uploading multiple images:', {
        count: files.length,
        endpoint: ENDPOINTS.UPLOAD.IMAGES
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
      
      console.log('✅ Multiple upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Multiple upload failed:', error);
      
      // Extract proper error message
      const apiError = handleApiError(error);
      const errorMessage = typeof apiError === 'string' 
        ? apiError 
        : apiError.message || 'Upload failed';
      
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
