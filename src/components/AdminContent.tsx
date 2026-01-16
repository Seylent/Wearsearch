/**
 * Admin Content - Refactored Component
 * Now uses smaller, focused components and custom hook
 */

'use client';

import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Plus, Package, Store, Tag, Mail, ImageIcon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { useAdmin } from "@/hooks/useAdmin";

const AddProductForm = lazy(() => import("@/components/admin/AddProductForm").then(m => ({ default: m.AddProductForm })));
const ProductList = lazy(() => import("@/components/admin/ProductList").then(m => ({ default: m.ProductList })));
const StoreManagement = lazy(() => import("@/components/admin/StoreManagement").then(m => ({ default: m.StoreManagement })));
const BrandManagement = lazy(() => import("@/components/admin/BrandManagement").then(m => ({ default: m.BrandManagement })));
const ContactManagement = lazy(() => import("@/components/admin/ContactManagement").then(m => ({ default: m.ContactManagement })));
const BannerManager = lazy(() => import("@/components/admin/BannerManager").then(m => ({ default: m.BannerManager })));

const AdminTabSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-white/5 rounded w-1/3"></div>
    <div className="h-64 bg-white/5 rounded"></div>
  </div>
);

const AdminContent = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin } = useAuth();
  const admin = useAdmin();

  useSEO({
    title: t('admin.title'),
    description: t('admin.description'),
    noindex: true,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-4">{t('admin.loginRequired')}</p>
          <p className="text-sm text-muted-foreground">{t('admin.redirecting')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <p className="text-lg mb-4">{t('admin.accessDenied')}</p>
          <p className="text-sm text-muted-foreground">{t('admin.adminOnly')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <section className="relative py-12 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-4 lg:mb-8">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs text-foreground tracking-wider uppercase font-medium">{t('admin.title')}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
            {t('admin.dashboard')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('admin.manageProducts')}, {t('admin.manageStores')}, and marketplace content
          </p>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-6 md:py-12 overflow-visible">
        <div className="container mx-auto px-4 md:px-6 overflow-visible">
          <Tabs 
            defaultValue="add-product" 
            className="max-w-6xl mx-auto overflow-visible" 
            value={admin.activeTab} 
            onValueChange={admin.setActiveTab}
          >
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-6 bg-card/40 border border-border/50 backdrop-blur-sm mb-4 md:mb-8 p-1 rounded-xl gap-1">
              <TabsTrigger 
                value="add-product"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.addProduct')}</span>
                <span className="md:hidden ml-1">{t('admin.add')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manage-products"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Package className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('common.products')} ({admin.products.length})</span>
                <span className="md:hidden ml-1">{t('admin.list')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="stores"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Store className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.stores')}</span>
                <span className="md:hidden ml-1">{t('admin.stores')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brands"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Tag className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.brands')}</span>
                <span className="md:hidden ml-1">Brands</span>
              </TabsTrigger>
              <TabsTrigger 
                value="banners"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <ImageIcon className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Банери</span>
                <span className="md:hidden ml-1">Банери</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Mail className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.contacts')}</span>
                <span className="md:hidden ml-1">Contact</span>
              </TabsTrigger>
            </TabsList>

            {/* ADD/EDIT PRODUCT TAB */}
            <TabsContent value="add-product" className="space-y-4 md:space-y-8 overflow-visible">
              <Suspense fallback={<AdminTabSkeleton />}>
                <AddProductForm
                // Form data
                editingProductId={admin.editingProductId}
                productName={admin.productName}
                productCategory={admin.productCategory}
                productColor={admin.productColor}
                productGender={admin.productGender}
                productBrandId={admin.productBrandId}
                productDescription={admin.productDescription}
                productImageUrl={admin.productImageUrl}
                productImages={admin.productImages}
                primaryImageIndex={admin.primaryImageIndex}
                publishAt={admin.publishAt}
                unpublishAt={admin.unpublishAt}
                productStatus={admin.productStatus}
                
                // Store management
                selectedStores={admin.selectedStores}
                currentStore={admin.currentStore}
                currentStorePrice={admin.currentStorePrice}
                currentStoreSizes={admin.currentStoreSizes}
                currentSizeInput={admin.currentSizeInput}
                
                // Templates
                savedTemplates={admin.savedTemplates}
                showTemplates={admin.showTemplates}
                
                // Data
                stores={admin.stores}
                brands={admin.brands}
                
                // Handlers
                onProductNameChange={admin.setProductName}
                onProductCategoryChange={admin.setProductCategory}
                onProductColorChange={admin.setProductColor}
                onProductGenderChange={admin.setProductGender}
                onProductBrandIdChange={admin.setProductBrandId}
                onProductDescriptionChange={admin.setProductDescription}
                onProductImageUrlChange={admin.setProductImageUrl}
                onProductImagesChange={admin.setProductImages}
                onPrimaryImageIndexChange={admin.setPrimaryImageIndex}
                onPublishAtChange={admin.setPublishAt}
                onUnpublishAtChange={admin.setUnpublishAt}
                onProductStatusChange={admin.setProductStatus}
                
                // Store handlers
                onCurrentStoreChange={admin.setCurrentStore}
                onCurrentStorePriceChange={admin.setCurrentStorePrice}
                onCurrentSizeInputChange={admin.setCurrentSizeInput}
                onAddSize={admin.addSize}
                onRemoveSize={admin.removeSize}
                onAddStore={admin.addStore}
                onRemoveStore={admin.removeStore}
                
                // Template handlers
                onSaveAsTemplate={admin.saveAsTemplate}
                onLoadTemplate={admin.loadTemplate}
                onDeleteTemplate={admin.deleteTemplate}
                onToggleTemplates={() => admin.setShowTemplates(!admin.showTemplates)}
                
                // Submit
                onSubmit={admin.handleProductSubmit}
                submitting={admin.submitting}
                
                // Translation
                autoTranslateDescription={admin.autoTranslateDescription}
                onAutoTranslateDescriptionChange={admin.setAutoTranslateDescription}
              />
              </Suspense>
            </TabsContent>

            {/* MANAGE PRODUCTS TAB */}
            <TabsContent value="manage-products" className="space-y-6 overflow-visible">
              <Suspense fallback={<AdminTabSkeleton />}>
                <ProductList
                products={admin.products}
                stores={admin.stores}
                brands={admin.brands}
                searchProducts={admin.searchProducts}
                onSearchProductsChange={admin.setSearchProducts}
                viewMode={admin.viewMode}
                onViewModeChange={admin.setViewMode}
                isSelectMode={admin.isSelectMode}
                selectedProductIds={admin.selectedProductIds}
                onToggleSelectMode={admin.toggleSelectMode}
                onToggleProductSelection={admin.toggleProductSelection}
                onSelectAllProducts={admin.selectAllProducts}
                onEditProduct={(product) => {
                  // Load product for editing and switch to add-product tab
                  admin.setEditingProductId(product.id);
                  admin.setActiveTab("add-product");
                }}
                onDeleteProduct={(product) => {
                  // Product deletion handled by ProductManagement component internally
                  console.log('Delete product:', product);
                }}
                onBulkDelete={() => {
                  // Bulk deletion to be implemented when batch API endpoint is available
                  console.log('Bulk delete:', admin.selectedProductIds);
                }}
                onExportToCSV={() => {
                  // CSV export to be implemented when export service is ready
                  console.log('Export CSV');
                }}
                onExportToJSON={() => {
                  // JSON export to be implemented when export service is ready
                  console.log('Export JSON');
                }}
                onDownloadTemplate={() => {
                  // Template download to be implemented when template service is ready
                  console.log('Download template');
                }}
                loadingExport={admin.loadingExport}
                resetFilters={() => admin.setSearchProducts("")}
              />
              </Suspense>
            </TabsContent>

            {/* STORES TAB */}
            <TabsContent value="stores" className="space-y-8 overflow-visible">
              <Suspense fallback={<AdminTabSkeleton />}>
                <StoreManagement
                stores={admin.stores}
                onStoreCreate={async (storeData) => {
                  // Store creation handled by StoreManagement component with API integration
                  console.log('Create store:', storeData);
                }}
                onStoreUpdate={async (id, storeData) => {
                  // Store update handled by StoreManagement component with API integration
                  console.log('Update store:', id, storeData);
                }}
                onStoreDelete={async (id) => {
                  // Store deletion handled by StoreManagement component with API integration
                  console.log('Delete store:', id);
                }}
                loading={admin.loading}
              />
              </Suspense>
            </TabsContent>

            {/* BRANDS TAB */}
            <TabsContent value="brands" className="space-y-6">
              <Suspense fallback={<AdminTabSkeleton />}>
                <BrandManagement
                brands={admin.brands || []}
                onBrandCreate={async (brandData) => {
                  // Brand creation handled by BrandManagement component with API integration
                  console.log('Create brand:', brandData);
                }}
                onBrandUpdate={async (id, brandData) => {
                  // Brand update handled by BrandManagement component with API integration
                  console.log('Update brand:', id, brandData);
                }}
                onBrandDelete={async (id) => {
                  // Brand deletion handled by BrandManagement component with API integration
                  console.log('Delete brand:', id);
                }}
                loading={admin.loading}
              />
              </Suspense>
            </TabsContent>

            {/* BANNERS TAB */}
            <TabsContent value="banners" className="space-y-6">
              <Suspense fallback={<AdminTabSkeleton />}>
                <BannerManager />
              </Suspense>
            </TabsContent>

            {/* CONTACTS TAB */}
            <TabsContent value="contacts" className="space-y-6">
              <Suspense fallback={<AdminTabSkeleton />}>
                <ContactManagement
                contacts={[
                  {
                    id: '1',
                    name: 'Іван Петренко',
                    email: 'ivan@example.com',
                    phone: '+380123456789',
                    subject: 'Проблема з замовленням',
                    message: 'Привіт! У мене проблема з моїм останнім замовленням #12345. Воно не було доставлене вчасно.',
                    type: 'support',
                    status: 'new',
                    priority: 'high',
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    name: 'Марія Коваленко',
                    email: 'maria@example.com',
                    subject: 'Питання про доставку',
                    message: 'Коли буде доставка мого замовлення? Чи є можливість відстежити його?',
                    type: 'general',
                    status: 'read',
                    priority: 'medium',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                  },
                ]}
                onContactUpdate={async (id, updates) => {
                  // Contact update to be implemented when contact API endpoint is available
                  console.log('Update contact:', id, updates);
                }}
                onContactDelete={async (id) => {
                  // Contact deletion to be implemented when contact API endpoint is available
                  console.log('Delete contact:', id);
                }}
                onReply={async (contactId, message) => {
                  // Reply functionality to be implemented when email service is integrated
                  console.log('Reply to contact:', contactId, message);
                }}
                loading={admin.loading}
              />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdminContent;