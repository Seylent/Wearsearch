/**
 * Admin Content - Simplified Admin Panel
 * TODO: Implement role-based permissions
 */

'use client';

import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Plus, Package, Store, Tag, Mail, ImageIcon, Users } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';

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
const BrandOwnerManagement = lazy(() =>
  import('@/components/admin/BrandOwnerManagement').then(m => ({ default: m.BrandOwnerManagement }))
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
      value: 'brand-access',
      icon: <Tag className="w-4 h-4" />,
      label: t('brand.accessTab', 'Доступ бренду'),
    },
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
              <span className="hidden md:inline">{tab.label}</span>
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
              onSaveAsTemplate={() => {}}
              onLoadTemplate={() => {}}
              onDeleteTemplate={() => {}}
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
              onEditProduct={product => admin.setEditingProductId(product.id as string)}
              onDeleteProduct={() => {}}
              onBulkDelete={() => {}}
              onExportToCSV={() => {}}
              onExportToJSON={() => {}}
              onDownloadTemplate={() => {}}
              loadingExport={admin.loadingExport}
            />
          </Suspense>
        </TabsContent>

        {/* STORES TAB - Simplified */}
        <TabsContent value="stores" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            {/* 
              TODO: StoreManagement requires stores and handler props.
              Currently rendering without props - needs implementation.
            */}
            <Card>
              <CardContent className="py-6">
                <p className="text-muted-foreground">
                  {t(
                    'admin.storeManagementPlaceholder',
                    'Store management component will be rendered here'
                  )}
                </p>
                {/* StoreManagement requires: stores, onStoreCreate, onStoreUpdate, onStoreDelete */}
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>

        {/* BRANDS TAB - Simplified */}
        <TabsContent value="brands" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            {/* 
              TODO: BrandManagement requires brands and handler props.
              Currently rendering without props - needs implementation.
            */}
            <Card>
              <CardContent className="py-6">
                <p className="text-muted-foreground">
                  {t(
                    'admin.brandManagementPlaceholder',
                    'Brand management component will be rendered here'
                  )}
                </p>
                {/* BrandManagement requires: brands, onBrandCreate, onBrandUpdate, onBrandDelete */}
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>

        {/* BRAND ACCESS TAB */}
        <TabsContent value="brand-access" className="space-y-4">
          <Suspense fallback={<AdminTabSkeleton />}>
            <BrandOwnerManagement />
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
                <StoreOwnerManagement />
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
