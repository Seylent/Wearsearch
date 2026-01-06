/**
 * Add to Collection Button/Modal
 * Allows adding a product to one or more collections
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Check, Plus, FolderHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCollections } from '@/hooks/useCollections';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddToCollectionProps {
  productId: string;
  productName?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AddToCollection: React.FC<AddToCollectionProps> = ({
  productId,
  productName,
  className,
  variant = 'ghost',
  size = 'icon',
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    collections,
    createCollection,
    addToCollection,
    removeFromCollection,
    isInCollection,
  } = useCollections();

  const [isOpen, setIsOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');

  const handleToggleCollection = (collectionId: string, collectionName: string) => {
    if (isInCollection(collectionId, productId)) {
      removeFromCollection(collectionId, productId);
      toast({
        title: t('collections.removedFrom', 'Removed from collection'),
        description: `${productName || 'Product'} ${t('collections.removedFromDesc', 'was removed from')} "${collectionName}"`,
      });
    } else {
      addToCollection(collectionId, productId);
      toast({
        title: t('collections.addedTo', 'Added to collection'),
        description: `${productName || 'Product'} ${t('collections.addedToDesc', 'was added to')} "${collectionName}"`,
      });
    }
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim()) return;

    const collection = createCollection(newName.trim());
    addToCollection(collection.id, productId);
    
    toast({
      title: t('collections.createdAndAdded', 'Collection created'),
      description: `${productName || 'Product'} ${t('collections.addedToDesc', 'was added to')} "${newName}"`,
    });

    setNewName('');
    setShowNewForm(false);
  };

  const productCollectionsCount = collections.filter((c) =>
    isInCollection(c.id, productId)
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'text-white/60 hover:text-white relative',
            productCollectionsCount > 0 && 'text-purple-400',
            className
          )}
          aria-label={t('collections.addToCollection', 'Add to collection')}
        >
          <FolderPlus className="w-4 h-4" />
          {size !== 'icon' && (
            <span className="ml-2">{t('collections.save', 'Save')}</span>
          )}
          {productCollectionsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-[10px] font-bold flex items-center justify-center">
              {productCollectionsCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FolderHeart className="w-5 h-5" />
            {t('collections.saveToCollection', 'Save to Collection')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {collections.length === 0 && !showNewForm ? (
            <div className="text-center py-6">
              <FolderHeart className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/60 mb-4">
                {t('collections.noCollections', "You don't have any collections yet")}
              </p>
              <Button
                onClick={() => setShowNewForm(true)}
                className="bg-white text-black hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('collections.createFirst', 'Create your first collection')}
              </Button>
            </div>
          ) : (
            <>
              {/* Existing collections */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {collections.map((collection) => {
                  const isIn = isInCollection(collection.id, productId);
                  return (
                    <button
                      key={collection.id}
                      onClick={() => handleToggleCollection(collection.id, collection.name)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                        isIn
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      )}
                    >
                      <span className="text-lg">{collection.emoji || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{collection.name}</p>
                        <p className="text-xs text-white/40">
                          {collection.items.length} {t('collections.items', 'items')}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                          isIn
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-white/30'
                        )}
                      >
                        {isIn && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Create new collection */}
              {showNewForm ? (
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t('collections.newName', 'New collection name')}
                    className="flex-1 bg-white/5 border-white/10 text-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateAndAdd();
                      if (e.key === 'Escape') setShowNewForm(false);
                    }}
                  />
                  <Button onClick={handleCreateAndAdd} className="bg-white text-black hover:bg-white/90">
                    {t('common.add', 'Add')}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('collections.createNew', 'Create new collection')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollection;
