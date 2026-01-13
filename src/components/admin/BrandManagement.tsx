/**
 * Brand Management Component
 * Управління брендами в адмін панелі
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit3, Trash2, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Brand {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
}

interface BrandManagementProps {
  brands: Brand[];
  onBrandCreate: (brandData: Omit<Brand, 'id'>) => Promise<void>;
  onBrandUpdate: (id: string, brandData: Partial<Brand>) => Promise<void>;
  onBrandDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const BrandManagement: React.FC<BrandManagementProps> = ({
  brands = [],
  onBrandCreate,
  onBrandUpdate,
  onBrandDelete,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    is_active: true,
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      logo_url: '',
      is_active: true,
    });
    setEditingBrand(null);
  };

  // Handle edit brand
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      logo_url: brand.logo_url || '',
      is_active: brand.is_active,
    });
    setIsAddDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrand) {
        await onBrandUpdate(editingBrand.id, formData);
      } else {
        await onBrandCreate(formData);
      }
      
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving brand:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteBrand'))) return;
    
    setSubmitting(true);
    try {
      await onBrandDelete(id);
    } catch (error) {
      console.error('Error deleting brand:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered brands
  const filteredBrands = searchTerm
    ? brands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : brands;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="w-6 h-6" />
          {t('admin.brandManagement')}
        </h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} modal={false}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.addBrand')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? t('admin.editBrand') : t('admin.addBrand')}
              </DialogTitle>
              <DialogDescription>
                {editingBrand ? t('admin.editBrandDescription', 'Edit brand information') : t('admin.addBrandDescription', 'Add a new brand to the system')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.brandName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.enterBrandName')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('admin.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('admin.enterDescription')}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">{t('admin.website')}</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                {(() => {
                  if (submitting) return t('common.saving');
                  if (editingBrand) return t('common.save');
                  return t('common.create');
                })()}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.searchBrands')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brands Grid */}
      <div className="grid gap-4 md:gap-6">
        {(() => {
          if (loading) {
            return (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            );
          }
          
          if (filteredBrands.length === 0) {
            return (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t('admin.noBrands')}</h3>
                <p className="text-sm text-muted-foreground">{t('admin.createFirstBrand')}</p>
              </div>
            );
          }
          
          return filteredBrands.map((brand) => (
            <Card key={brand.id} className="bg-card/40 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {brand.name}
                    {!brand.is_active && (
                      <Badge variant="secondary">{t('admin.inactive')}</Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                      disabled={submitting}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
                      disabled={submitting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {brand.description && (
                  <p className="text-sm text-muted-foreground mb-3">{brand.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {brand.products_count || 0} {t('common.products')}
                  </span>
                  {brand.website && (
                    <a 
                      href={brand.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t('admin.visitWebsite')}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ));
        })()}
      </div>
    </div>
  );
};