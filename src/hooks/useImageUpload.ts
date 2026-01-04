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

      const result = await uploadService.uploadImage(file);
      // Return just the URL string for easier handling
      return result.url;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    },
    onError: (error: Error) => {
      console.error('Upload error details:', error);
      
      // Check if upload endpoint is not configured
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        toast({
          title: 'Upload Not Configured',
          description: 'Please paste the image URL directly in the field below',
          variant: 'default',
        });
      } else if (error.message.includes('filePath')) {
        toast({
          title: 'Upload Configuration Error',
          description: 'Backend upload endpoint needs configuration. Please contact support.',
          variant: 'destructive',
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
