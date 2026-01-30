import { useQuery } from '@tanstack/react-query';
import { catalogApi, type CatalogFiltersResponse } from '@/services/api/catalog.api';

export const useCatalogFilters = () => {
  return useQuery<CatalogFiltersResponse>({
    queryKey: ['catalog-filters'],
    queryFn: catalogApi.getFilters,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export default useCatalogFilters;
