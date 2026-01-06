/**
 * Save Store Button Component
 * Button to save/unsave a store to favorites
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSavedStores } from '@/hooks/useSavedStores';
import { cn } from '@/lib/utils';

interface SaveStoreButtonProps {
  storeId: string;
  storeName: string;
  storeLogo?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
}

export const SaveStoreButton: React.FC<SaveStoreButtonProps> = ({
  storeId,
  storeName,
  storeLogo,
  className,
  size = 'sm',
  variant = 'outline',
  showText = true,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isSaved, toggleStore, isAddingStore, isRemovingStore } = useSavedStores();

  const saved = isSaved(storeId);
  const isLoading = isAddingStore || isRemovingStore;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleStore({
      id: storeId,
      name: storeName,
      logo_url: storeLogo,
    });

    toast({
      title: saved ? t('stores.removed') : t('stores.saved'),
      description: saved
        ? t('stores.removedDescription', { name: storeName })
        : t('stores.savedDescription', { name: storeName }),
    });
  };

  return (
    <Button
      variant={saved ? 'default' : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'transition-all',
        saved && 'bg-primary text-primary-foreground',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {showText && (
        <span className="ml-2">
          {saved ? t('stores.savedButton') : t('stores.saveButton')}
        </span>
      )}
    </Button>
  );
};

export default SaveStoreButton;
