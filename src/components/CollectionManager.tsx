/**
 * Collections Manager Component
 * UI for creating and managing product collections/wishlists
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FolderHeart, Trash2, Edit2, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCollections, type Collection } from '@/hooks/useCollections';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CollectionManagerProps {
  className?: string;
  activeCollectionId?: string | null;
  onSelect?: (collectionId: string) => void;
  filterQuery?: string;
}

const EMOJI_OPTIONS = ['❤️', '🛒', '🎁', '☀️', '🔥', '⭐', '👔', '👟', '👗', '🧥', '💎', '🎯'];

const CollectionManager: React.FC<CollectionManagerProps> = ({
  className,
  activeCollectionId,
  onSelect,
  filterQuery,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { collections, createCollection, deleteCollection, updateCollection, templates } =
    useCollections();

  const normalizedQuery = filterQuery?.trim().toLowerCase() ?? '';
  const filteredCollections = normalizedQuery
    ? collections.filter(collection => collection.name.toLowerCase().includes(normalizedQuery))
    : collections;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('❤️');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast({
        title: t('collections.nameRequired', 'Name is required'),
        variant: 'destructive',
      });
      return;
    }

    await createCollection(newName.trim(), newEmoji);
    toast({
      title: t('collections.created', 'Collection created'),
      description: `"${newName}" ${t('collections.createdDesc', 'has been created successfully')}`,
    });

    setNewName('');
    setNewEmoji('❤️');
    setIsCreateOpen(false);
  };

  const handleDelete = (collection: Collection) => {
    deleteCollection(collection.id);
    toast({
      title: t('collections.deleted', 'Collection deleted'),
      description: `"${collection.name}" ${t('collections.deletedDesc', 'has been removed')}`,
    });
  };

  const handleStartEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
  };

  const handleSaveEdit = (collection: Collection) => {
    if (!editName.trim()) return;
    updateCollection(collection.id, { name: editName.trim() });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleCreateFromTemplate = async (template: (typeof templates)[0]) => {
    await createCollection(template.name, template.emoji);
    toast({
      title: t('collections.created', 'Collection created'),
      description: `"${template.name}" ${t('collections.createdDesc', 'has been created successfully')}`,
    });
  };

  return (
    <div className={cn('space-y-4 rounded-2xl border border-border/50 bg-card/40 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-foreground/70" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t('collections.title', 'Collections')}
          </h2>
          <span className="text-sm text-muted-foreground">({collections.length})</span>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} modal={false}>
          <DialogTrigger asChild>
            <Button
              id="collection-manager-create-trigger"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('collections.create', 'New')}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {t('collections.createNew', 'Create New Collection')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t(
                  'collections.collectionDescription',
                  'Create a collection to organize your products'
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Quick templates */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  {t('collections.quickStart', 'Quick Start')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <button
                      key={template.name}
                      onClick={() => handleCreateFromTemplate(template)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted/40 text-foreground/80 hover:bg-muted/70 transition-colors"
                    >
                      <span>{template.emoji}</span>
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('collections.or', 'or create custom')}
                  </span>
                </div>
              </div>

              {/* Custom collection form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collection-name" className="text-sm text-muted-foreground">
                    {t('collections.name', 'Name')}
                  </Label>
                  <Input
                    id="collection-name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={t('collections.namePlaceholder', 'My Collection')}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    {t('collections.icon', 'Icon')}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setNewEmoji(emoji)}
                        className={cn(
                          'w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all',
                          newEmoji === emoji
                            ? 'bg-foreground/10 ring-2 ring-foreground/30'
                            : 'bg-muted/30 hover:bg-muted/60'
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreate} className="w-full">
                  {t('collections.createButton', 'Create Collection')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections list */}
      {filteredCollections.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FolderHeart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('collections.empty', 'No collections yet')}</p>
          <p className="text-sm mt-1">
            {t('collections.emptyHint', 'Create your first collection to organize products')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCollections.map(collection => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              isEditing={editingId === collection.id}
              editName={editName}
              onEditName={setEditName}
              onStartEdit={() => handleStartEdit(collection)}
              onSaveEdit={() => handleSaveEdit(collection)}
              onCancelEdit={handleCancelEdit}
              onDelete={() => handleDelete(collection)}
              isActive={collection.id === activeCollectionId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CollectionItemProps {
  collection: Collection;
  isEditing: boolean;
  editName: string;
  onEditName: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isActive?: boolean;
  onSelect?: (collectionId: string) => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  isEditing,
  editName,
  onEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isActive,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onSelect?.(collection.id)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors group text-left',
        isActive
          ? 'border-foreground/40 bg-foreground/5'
          : 'border-border/40 bg-background/40 hover:bg-muted/40'
      )}
    >
      <span className="text-xl">{collection.emoji || '📁'}</span>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editName}
            onChange={e => onEditName(e.target.value)}
            className="flex-1 h-8 text-sm"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
          <button
            onClick={e => {
              e.stopPropagation();
              onSaveEdit();
            }}
            className="p-1.5 rounded-md hover:bg-muted/60 text-green-600"
            aria-label={t('common.save', 'Save')}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onCancelEdit();
            }}
            className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"
            aria-label={t('common.cancel', 'Cancel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{collection.name}</h3>
            <p className="text-xs text-muted-foreground">
              {collection.productCount ?? collection.items.length} {t('collections.items', 'items')}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => {
                e.stopPropagation();
                onStartEdit();
              }}
              className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              aria-label={t('common.edit', 'Edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-red-500"
              aria-label={t('common.delete', 'Delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </>
      )}
    </button>
  );
};

export default CollectionManager;
