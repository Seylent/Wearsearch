/**
 * Image Upload Hook
 * Reusable hook for image upload with validation and error handling
 */

import { useMutation } from '@tanstack/react-query';
import { uploadService } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate before upload
      const validation = uploadService.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return uploadService.uploadImage(file);
    },
    onSuccess: (url) => {
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    },
    onError: (error: Error) => {
      // Check if upload endpoint is not configured
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        toast({
          title: 'Upload Not Configured',
          description: 'Please paste the image URL directly in the field below',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: error.message || 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
      }
    },
  });
};
