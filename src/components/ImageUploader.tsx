import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export const ImageUploader = ({
  onImageUpload,
  currentImage,
  label: _label = 'Product Image',
}: ImageUploaderProps) => {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use centralized upload hook instead of direct fetch
  const uploadMutation = useImageUpload();

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: t('imageUploader.invalidTypeTitle'),
        description: t('imageUploader.invalidTypeDescription'),
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: t('imageUploader.fileTooLargeTitle'),
        description: t('imageUploader.fileTooLargeDescription'),
      });
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    try {
      // Use centralized upload service via hook
      const url = await uploadMutation.mutateAsync(selectedFile);
      onImageUpload(url);
      setPreview(url); // Update preview with uploaded URL
      toast({
        title: t('imageUploader.uploadSuccessTitle'),
        description: t('imageUploader.uploadSuccessDescription'),
      });
    } catch (error) {
      // Error handling is done in the hook
      console.error('Upload failed:', error);
      // Reset preview on error
      setPreview(currentImage || '');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative group">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleClick}>
                {t('imageUploader.change')}
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="p-12 text-center w-full hover:bg-muted/50 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={handleClick}
            aria-label={t('aria.uploadImage')}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium select-none">
                  {t('imageUploader.clickToUpload')}
                </p>
                <p className="text-xs text-muted-foreground select-none">
                  {t('imageUploader.fileTypes')}
                </p>
              </div>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {uploadMutation.isPending && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
          <span className="animate-spin">⏳</span>
          <span className="text-sm">{t('imageUploader.uploading')}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground select-none">💡 {t('imageUploader.tip')}</p>
    </div>
  );
};
