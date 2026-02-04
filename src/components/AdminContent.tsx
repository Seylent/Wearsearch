/**
 * Admin Content - Simplified Admin Panel
 * TODO: Implement role-based permissions
 */

'use client';

import { lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Plus, Package, Store, Tag, Mail, ImageIcon, Users } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/services/api/admin.api';

// Lazy load all components
const AddProductForm = lazy(() =>
  import('@/components/admin/AddProductForm').then(m => ({ default: m.AddProductForm }))
);
const ProductList = lazy(() =>
  import('@/components/admin/ProductList').then(m => ({ default: m.ProductList }))
);
const ContactManagement = lazy(() =>
  import('@/components/admin/ContactManagement').then(m => ({ default: m.ContactManagement }))
);
const BannerManager = lazy(() =>
  import('@/components/admin/BannerManager').then(m => ({ default: m.BannerManager }))
);
const UserRoleManagement = lazy(() =>
  import('@/components/admin/UserRoleManagement').then(m => ({ default: m.UserRoleManagement }))
);
const StoreManagement = lazy(() =>
  import('@/components/admin/StoreManagement').then(m => ({ default: m.StoreManagement }))
);
const BrandManagement = lazy(() =>
  import('@/components/admin/BrandManagement').then(m => ({ default: m.BrandManagement }))
);
const StoreOwnerManagement = lazy(() =>
  import('@/components/admin/StoreOwnerManagement').then(m => ({ default: m.StoreOwnerManagement }))
);

const AdminTabSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-white/5 rounded w-1/3"></div>
    <div className="h-64 bg-white/5 rounded"></div>
  </div>
);

const AdminContent = () => {
  const { t } = useTranslation();
  const { isAuthenticated, canAccessAdminPanel } = useAuth();
  const admin = useAdmin();
  const [activeTab, setActiveTab] = useState('add-product');
  const { toast } = useToast();
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const normalizedStores = useMemo(() => {
    type VerificationStatus = 'pending' | 'verified' | 'rejected';
    const resolveVerificationStatus = (value: unknown): VerificationStatus =>
      value === 'verified' || value === 'rejected' ? value : 'pending';
    return (admin.stores || []).map(store => {
      const record = store as Record<string, unknown>;
      const rawId = record.id ?? '';
      return {
        id: typeof rawId === 'string' || typeof rawId === 'number' ? rawId : String(rawId),
        name: typeof record.name === 'string' ? record.name : '',
        website_url: typeof record.website_url === 'string' ? record.website_url : undefined,
        telegram_url: typeof record.telegram_url === 'string' ? record.telegram_url : undefined,
        instagram_url: typeof record.instagram_url === 'string' ? record.instagram_url : undefined,
        tiktok_url: typeof record.tiktok_url === 'string' ? record.tiktok_url : undefined,
        shipping_info: typeof record.shipping_info === 'string' ? record.shipping_info : undefined,
        is_active: typeof record.is_active === 'boolean' ? record.is_active : true,
        verification_status: resolveVerificationStatus(record.verification_status),
      };
    });
  }, [admin.stores]);

  const normalizedBrands = useMemo(() => {
    return (admin.brands || []).map(brand => {
      const record = brand as Record<string, unknown>;
      const rawId = record.id ?? '';
      return {
        id: typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : '',
        name: typeof record.name === 'string' ? record.name : '',
        description: typeof record.description === 'string' ? record.description : undefined,
        website: typeof record.website_url === 'string' ? record.website_url : undefined,
        logo_url: typeof record.logo_url === 'string' ? record.logo_url : undefined,
        is_active: typeof record.is_active === 'boolean' ? record.is_active : true,
        is_closed: typeof record.is_closed === 'boolean' ? record.is_closed : undefined,
        products_count:
          typeof record.products_count === 'number' ? record.products_count : undefined,
      };
    });
  }, [admin.brands]);

  const handleStoreCreate = async (storeData: {
    name: string;
    website_url?: string;
    telegram_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    shipping_info?: string;
    is_active?: boolean;
    verification_status?: 'pending' | 'verified' | 'rejected';
  }) => {
    setIsSavingStore(true);
    try {
      await adminApi.createStore(
        storeData as unknown as Parameters<typeof adminApi.createStore>[0]
      );
      await admin.loadDashboard();
      toast({ title: t('admin.storeCreated', 'Store created') });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('admin.storeCreateFailed', 'Failed to create store'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleStoreUpdate = async (
    id: string | number,
    storeData: Partial<{
      name: string;
      website_url?: string;
      telegram_url?: string;
      instagram_url?: string;
      tiktok_url?: string;
      shipping_info?: string;
      is_active?: boolean;
      verification_status?: 'pending' | 'verified' | 'rejected';
    }>
  ) => {
    setIsSavingStore(true);
    try {
      await adminApi.updateStore(
        String(id),
        storeData as unknown as Parameters<typeof adminApi.updateStore>[1]
      );
      await admin.loadDashboard();
      toast({ title: t('admin.storeUpdated', 'Store updated') });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('admin.storeUpdateFailed', 'Failed to update store'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleStoreDelete = async (id: string | number) => {
    setIsSavingStore(true);
    try {
      await adminApi.deleteStore(String(id));
      await admin.loadDashboard();
      toast({ title: t('admin.storeDeleted', 'Store deleted') });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('admin.storeDeleteFailed', 'Failed to delete store'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleBrandCreate = async (brandData: {
    name: string;
    description?: string;
    website?: string;
    logo_url?: string;
    is_active: boolean;
    is_closed?: boolean;
  }) => {
    setIsSavingBrand(true);
    try {
      await adminApi.createBrand({
        name: brandData.name,
        description: brandData.description,
        website_url: brandData.website,
        logo_url: brandData.logo_url,
        is_closed: brandData.is_closed,
      });
      await admin.loadDashboard();
      toast({ title: t('admin.brandCreated', 'Brand created') });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('admin.brandCreateFailed', 'Failed to create brand'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleBrandUpdate = async (
    id: string,
    brandData: Partial<{
      name: string;
      description?: string;
      website?: string;
      logo_url?: string;
      is_active: boolean;
      is_closed?: boolean;
    }>
  ) => {
    setIsSavingBrand(true);
    try {
      await adminApi.updateBrand(id, {
        name: brandData.name,
        description: brandData.description,
        website_url: brandData.website,
        logo_url: brandData.logo_url,
        is_closed: brandData.is_closed,
      });
      await admin.loadDashboard();
      toast({ title: t('admin.brandUpdated', 'Brand updated') });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('admin.brandUpdateFailed', 'Failed to update brand'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleBrandDelete = async (id: string) => {
    setIsSavingBrand(true);
    try {
      await adminApi.deleteBrand(id);
      await admin.loadDashboard();
      toast({ title: t('admin.brandDeleted', 'Brand deleted') });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('admin.brandDeleteFailed', 'Failed to delete brand'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingBrand(false);
    }
  };

  // SEO setup
  useSEO({
    title: t('seo.adminTitle', 'Admin Panel'),
    description: t('seo.adminDescription', 'Manage your store or brand'),
  });

  // Tab definitions - simplified
  const tabs = [
    {
      value: 'add-product',
      icon: <Plus className="w-4 h-4" />,
      label: t('admin.addProduct', 'Додати товар'),
    },
    {
      value: 'manage-products',
      icon: <Package className="w-4 h-4" />,
      label: t('common.products', 'Товари'),
    },
    { value: 'stores', icon: <Store className="w-4 h-4" />, label: t('admin.stores', 'Магазини') },
    { value: 'brands', icon: <Tag className="w-4 h-4" />, label: t('admin.brands', 'Бренди') },
    {
      value: 'banners',
      icon: <ImageIcon className="w-4 h-4" />,
      label: t('admin.banners', 'Банери'),
    },
    {
      value: 'contacts',
      icon: <Mail className="w-4 h-4" />,
      label: t('admin.contacts', 'Контакти'),
    },
    {
      value: 'user-roles',
      icon: <Users className="w-4 h-4" />,
      label: t('admin.userRoles', 'Ролі користувачів'),
    },
    { value: 'team', icon: <Users className="w-4 h-4" />, label: t('admin.team', 'Команда') },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ShieldCheck className="w-16 h-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">{t('admin.notAuthenticated')}</p>
        </div>
      </div>
    );
  }

  if (!canAccessAdminPanel) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ShieldCheck className="w-16 h-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">{t('admin.noAccess')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{t('admin.title')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2 justify-start mt-4">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
            >
              {tab.icon}
              <span className="inline truncate max-w-[140px] sm:max-w-[180px]">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ADD/EDIT PRODUCT TAB - Simplified */}
        <TabsContent value="add-product" className="space-y-4 md:space-y-8 overflow-visible">
          <Suspense fallback={<AdminTabSkeleton />}>
            {/* 
              TODO: AddProductForm requires many props from useAdmin.
              Currently passing minimal props - needs proper implementation.
            */}
            <AddProductForm
              editingProductId={admin.editingProductId}
              productName={admin.productName}
              productCategory={admin.productCategory}
              productColor={admin.productColor}
              productGender={admin.productGender}
              productBrandId={admin.productBrandId}
              productDescription={admin.productDescription}
              productMaterialIds={admin.productMaterialIds}
              productTechnologyIds={admin.productTechnologyIds}
              productSizeIds={admin.productSizeIds}
              productImageUrl={admin.productImageUrl}
              productImages={admin.productImages}
              primaryImageIndex={admin.primaryImageIndex}
              publishAt={admin.publishAt}
              unpublishAt={admin.unpublishAt}
              productStatus={admin.productStatus}
              selectedStores={admin.selectedStores}
              currentStore={admin.currentStore}
              currentStorePrice={admin.currentStorePrice}
              currentStoreSizes={admin.currentStoreSizes}
              currentSizeInput={admin.currentSizeInput}
              savedTemplates={admin.savedTemplates}
              showTemplates={admin.showTemplates}
              stores={admin.stores || []}
              brands={(admin.brands || []) as Array<{ id: string; name: string }>}
              onProductNameChange={admin.setProductName}
              onProductCategoryChange={admin.setProductCategory}
              onProductColorChange={admin.setProductColor}
              onProductGenderChange={admin.setProductGender}
              onProductBrandIdChange={admin.setProductBrandId}
              onProductDescriptionChange={admin.setProductDescription}
              onProductMaterialIdsChange={admin.setProductMaterialIds}
              onProductTechnologyIdsChange={admin.setProductTechnologyIds}
              onProductSizeIdsChange={admin.setProductSizeIds}
              onProductImageUrlChange={admin.setProductImageUrl}
              onProductImagesChange={admin.setProductImages}
              onPrimaryImageIndexChange={admin.setPrimaryImageIndex}
              onPublishAtChange={admin.setPublishAt}
              onUnpublishAtChange={admin.setUnpublishAt}
              onProductStatusChange={admin.setProductStatus}
              onCurrentStoreChange={admin.setCurrentStore}
              onCurrentStorePriceChange={admin.setCurrentStorePrice}
              onCurrentSizeInputChange={admin.setCurrentSizeInput}
              onAddSize={admin.addSize}
              onRemoveSize={admin.removeSize}
              onAddStore={admin.addStore}
              onRemoveStore={admin.removeStore}
              onUpdateStorePrice={admin.updateStorePrice}
              onAddStoreSize={admin.addStoreSize}
              onRemoveStoreSize={admin.removeStoreSize}
              onSaveAsTemplate={admin.saveAsTemplate}
              onLoadTemplate={admin.loadTemplate}
              onDeleteTemplate={admin.deleteTemplate}
              onToggleTemplates={() => admin.setShowTemplates(!admin.showTemplates)}
              onAutoTranslateDescriptionChange={admin.setAutoTranslateDescription}
              autoTranslateDescription={admin.autoTranslateDescription}
              onSubmit={admin.handleProductSubmit}
              submitting={admin.submitting}
            />
          </Suspense>
        </TabsContent>

        {/* MANAGE PRODUCTS TAB - Simplified */}
        <TabsContent value="manage-products" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <Card className="mb-4">
              <CardContent className="py-3 text-sm text-muted-foreground">
                {t('admin.productListDescription', 'Manage your products')}
              </CardContent>
            </Card>
            {/* 
              TODO: ProductList requires different props than what useAdmin provides.
              Need to align interfaces or create adapter.
            */}
            <ProductList
              products={(admin.products || []) as Record<string, unknown>[]}
              searchProducts={admin.searchProducts}
              onSearchProductsChange={admin.setSearchProducts}
              viewMode={admin.viewMode}
              onViewModeChange={admin.setViewMode}
              isSelectMode={admin.isSelectMode}
              selectedProductIds={admin.selectedProductIds}
              onToggleSelectMode={admin.toggleSelectMode}
              onToggleProductSelection={admin.toggleProductSelection}
              onSelectAllProducts={admin.selectAllProducts}
              onEditProduct={product => {
                admin.setEditingProductId(product.id as string);
                setActiveTab('add-product');
              }}
              onDeleteProduct={() => {}}
              onBulkDelete={() => {}}
              onExportToCSV={() => {}}
              onExportToJSON={() => {}}
              onDownloadTemplate={() => {}}
              loadingExport={admin.loadingExport}
            />
          </Suspense>
        </TabsContent>

        {/* STORES TAB */}
        <TabsContent value="stores" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <StoreManagement
              stores={normalizedStores}
              onStoreCreate={handleStoreCreate}
              onStoreUpdate={handleStoreUpdate}
              onStoreDelete={handleStoreDelete}
              loading={isSavingStore}
            />
          </Suspense>
        </TabsContent>

        {/* BRANDS TAB */}
        <TabsContent value="brands" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <BrandManagement
              brands={normalizedBrands}
              onBrandCreate={handleBrandCreate}
              onBrandUpdate={handleBrandUpdate}
              onBrandDelete={handleBrandDelete}
              loading={isSavingBrand}
            />
          </Suspense>
        </TabsContent>

        {/* BANNERS TAB */}
        <TabsContent value="banners" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <BannerManager />
          </Suspense>
        </TabsContent>

        {/* CONTACTS TAB */}
        <TabsContent value="contacts" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <ContactManagement />
          </Suspense>
        </TabsContent>

        {/* USER ROLES TAB */}
        <TabsContent value="user-roles" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <UserRoleManagement />
          </Suspense>
        </TabsContent>

        {/* TEAM TAB - Simplified */}
        <TabsContent value="team" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <Card>
              <CardContent className="py-6">
                <StoreOwnerManagement
                  stores={normalizedStores.map(store => ({ id: store.id, name: store.name }))}
                />
                {/* StoreOwnerManagement doesn't accept readOnly prop */}
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
