import { deriveAuthPermissions } from '../permissions';

describe('deriveAuthPermissions', () => {
  it('grants full admin permissions', () => {
    const { isAdmin, canAccessAdminPanel, canAccessStoreMenu, permissions } =
      deriveAuthPermissions('admin');

    expect(isAdmin).toBe(true);
    expect(canAccessAdminPanel).toBe(true);
    expect(canAccessStoreMenu).toBe(false);
    expect(permissions.canManageProducts).toBe(true);
    expect(permissions.canManageBrands).toBe(true);
    expect(permissions.canManageStoreProducts).toBe(true);
  });

  it('allows brand owner to manage brand permissions only', () => {
    const { isBrandOwner, canAccessStoreMenu, canAccessAdminPanel, permissions } =
      deriveAuthPermissions('brand_owner');

    expect(isBrandOwner).toBe(true);
    expect(canAccessStoreMenu).toBe(true);
    expect(canAccessAdminPanel).toBe(false);
    expect(permissions.canManageBrandPermissions).toBe(true);
    expect(permissions.canManageStoreProducts).toBe(false);
  });

  it('allows store manager to manage store products only', () => {
    const { isStoreManager, canAccessStoreMenu, canAccessAdminPanel, permissions } =
      deriveAuthPermissions('store_manager');

    expect(isStoreManager).toBe(true);
    expect(canAccessStoreMenu).toBe(true);
    expect(canAccessAdminPanel).toBe(false);
    expect(permissions.canManageStoreProducts).toBe(true);
    expect(permissions.canManageBrands).toBe(false);
  });

  it('denies permissions for unknown roles', () => {
    const { isAdmin, isBrandOwner, isStoreManager, canAccessAnyPanel, permissions } =
      deriveAuthPermissions('reseller');

    expect(isAdmin).toBe(false);
    expect(isBrandOwner).toBe(false);
    expect(isStoreManager).toBe(false);
    expect(canAccessAnyPanel).toBe(false);
    expect(permissions.canManageStoreProducts).toBe(false);
    expect(permissions.canManageBrandPermissions).toBe(false);
  });
});
