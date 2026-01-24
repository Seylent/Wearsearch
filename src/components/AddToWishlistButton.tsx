'use client';

import { useState } from 'react';
import { FolderPlus, Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCollections } from '@/hooks/useCollections';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddToWishlistButtonProps {
  productId: string;
  productName?: string;
  className?: string;
}

const AddToWishlistButton = ({ productId, productName, className }: AddToWishlistButtonProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { collections, createCollection, addToCollection, removeFromCollection, isInCollection } =
    useCollections();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleToggle = (collectionId: string) => {
    const isAdded = isInCollection(collectionId, productId);
    if (isAdded) {
      removeFromCollection(collectionId, productId);
      toast({
        title: t('collections.removed', 'Removed from wishlist'),
        description: productName ? `${productName}` : undefined,
      });
      return;
    }

    addToCollection(collectionId, productId);
    toast({
      title: t('collections.added', 'Added to wishlist'),
      description: productName ? `${productName}` : undefined,
    });
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const created = await createCollection(newName.trim(), '❤️');
    if (created?.id) {
      addToCollection(created.id, productId);
    }
    setNewName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('w-12 h-12 rounded-full', className)}
          aria-label={t('collections.addToWishlist', 'Add to wishlist')}
        >
          <FolderPlus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border/60 top-6 sm:top-[10%] translate-y-0">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t('collections.selectWishlist', 'Choose wishlist')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('collections.chooseWishlistHelp', 'Select a wishlist to save this product.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {collections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('collections.empty', 'No wishlists yet')}
            </p>
          )}

          {collections.map(collection => {
            const isAdded = isInCollection(collection.id, productId);
            return (
              <button
                key={collection.id}
                onClick={() => handleToggle(collection.id)}
                className={cn(
                  'w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors',
                  isAdded
                    ? 'border-foreground/40 bg-foreground/5'
                    : 'border-border/60 hover:border-foreground/30'
                )}
              >
                <span className="flex items-center gap-2">
                  <span>{collection.emoji || '❤️'}</span>
                  <span className="text-sm font-medium text-foreground">{collection.name}</span>
                </span>
                {isAdded && <Check className="w-4 h-4 text-foreground" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            {t('collections.createNew', 'Create new wishlist')}
          </p>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('collections.namePlaceholder', 'Wishlist name')}
              className="h-10"
            />
            <Button onClick={handleCreate} size="sm" className="h-10">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWishlistButton;
