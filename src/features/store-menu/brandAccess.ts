export type StoreMenuBrand = {
  id: string;
  name: string;
  is_closed: boolean;
};

const normalizeBrandName = (value?: string | null) => value?.trim().toLowerCase() || '';

export const normalizeStoreMenuBrands = (brandsData: unknown): StoreMenuBrand[] => {
  if (!Array.isArray(brandsData)) return [];

  return brandsData
    .map(item => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : undefined;
      const name = typeof record.name === 'string' ? record.name : undefined;
      if (!id || !name) return null;
      return {
        id,
        name,
        is_closed: record.is_closed === true,
      } satisfies StoreMenuBrand;
    })
    .filter((item): item is StoreMenuBrand => Boolean(item));
};

export const getBrandAccess = ({
  brandId,
  brands,
  storeBrandId,
}: {
  brandId?: string | null;
  brands: StoreMenuBrand[];
  storeBrandId?: string | null;
}) => {
  if (!brandId) {
    return { isClosed: false, isAllowed: true, brandName: undefined };
  }

  const brand = brands.find(item => item.id === brandId);
  const isClosed = Boolean(brand?.is_closed);
  const isOfficialStore = Boolean(storeBrandId && brandId && storeBrandId === brandId);
  const isAllowed = !isClosed || isOfficialStore;

  return { isClosed, isAllowed, brandName: brand?.name };
};

export const getBrandAccessByName = ({
  brandName,
  brands,
  storeBrandId,
}: {
  brandName?: string | null;
  brands: StoreMenuBrand[];
  storeBrandId?: string | null;
}) => {
  if (!brandName) {
    return { isClosed: false, isAllowed: true, brandName: undefined };
  }

  const normalizedName = normalizeBrandName(brandName);
  const match = brands.find(item => normalizeBrandName(item.name) === normalizedName);
  if (!match) {
    return { isClosed: false, isAllowed: true, brandName };
  }

  return getBrandAccess({ brandId: match.id, brands, storeBrandId });
};
