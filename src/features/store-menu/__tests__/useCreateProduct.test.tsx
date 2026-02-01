import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import api from '../../../services/api';
import { useCreateProduct } from '../hooks/useStoreMenu';

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateProduct', () => {
  beforeEach(() => {
    (api.post as jest.Mock).mockReset();
  });

  it('posts store_id and uses store_price as price', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        storeId: 'store-1',
        data: {
          name: 'Sneakers',
          color: 'black',
          category_id: 'shoes',
          gender: 'unisex',
          brand_id: 'brand-1',
          store_price: 1999,
          sizes: ['42'],
          images: ['img.jpg'],
        },
      });
    });

    expect(api.post).toHaveBeenCalledWith('/store-menu/products', {
      store_id: 'store-1',
      name: 'Sneakers',
      color: 'black',
      category_id: 'shoes',
      gender: 'unisex',
      brand_id: 'brand-1',
      sizes: ['42'],
      images: ['img.jpg'],
      price: 1999,
    });
  });

  it('prefers explicit price over store_price when provided', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        storeId: 'store-2',
        data: {
          name: 'Jacket',
          color: 'navy',
          category_id: 'jackets',
          gender: 'male',
          store_price: 2500,
          sizes: ['M'],
          images: ['img-2.jpg'],
          price: 2300,
        } as unknown as {
          name: string;
          color: string;
          category_id: string;
          gender: 'male' | 'female' | 'unisex';
          store_price: number;
          sizes: string[];
          images: string[];
          price: number;
        },
      });
    });

    expect(api.post).toHaveBeenCalledWith('/store-menu/products', {
      store_id: 'store-2',
      name: 'Jacket',
      color: 'navy',
      category_id: 'jackets',
      gender: 'male',
      sizes: ['M'],
      images: ['img-2.jpg'],
      price: 2300,
    });
  });
});
