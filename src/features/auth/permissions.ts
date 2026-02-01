export type UserRole =
  | 'admin'
  | 'store_owner'
  | 'store_manager'
  | 'manager'
  | 'brand_owner'
  | 'moderator'
  | string
  | undefined
  | null;

export const deriveAuthPermissions = (role: UserRole) => {
  const normalizedRole = typeof role === 'string' ? role : undefined;
  const isAdmin = normalizedRole === 'admin';
  const isStoreOwner = normalizedRole === 'store_owner';
  const isStoreManager = normalizedRole === 'store_manager' || normalizedRole === 'manager';
  const isBrandOwner = normalizedRole === 'brand_owner';
  const isModerator = normalizedRole === 'moderator';

  const canAccessStoreMenu = isStoreOwner || isStoreManager || isBrandOwner;
  const canAccessAdminPanel = isAdmin || isModerator;
  const canAccessAnyPanel = canAccessStoreMenu || canAccessAdminPanel;

  const permissions = {
    canManageProducts: isAdmin,
    canManageStores: isAdmin,
    canManageBrands: isAdmin,
    canManageBanners: isAdmin,
    canManageContacts: isAdmin,
    canManageUserRoles: isAdmin,
    canManageBrandPermissions: isAdmin || isBrandOwner,
    canManageBrandOfficialStore: isAdmin || isBrandOwner,
    canManageStoreManagers: isAdmin || isStoreOwner,
    canManageStoreProducts: isAdmin || isStoreOwner || isStoreManager,
  };

  return {
    role: normalizedRole,
    isAdmin,
    isStoreOwner,
    isStoreManager,
    isBrandOwner,
    isModerator,
    canAccessStoreMenu,
    canAccessAdminPanel,
    canAccessAnyPanel,
    permissions,
  };
};
