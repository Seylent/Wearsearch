import {
  mapFavoritesResponse,
  mapCollectionsResponse,
  mapCollectionItemsResponse,
} from '@/utils/apiMappers';

describe('API Mappers', () => {
  test('maps Favorites response to internal items', () => {
    const apiResp = {
      success: true,
      count: 2,
      products: [
        {
          id: 'p1',
          name: 'Sample Product',
          image_url: 'https://example.com/p1.jpg',
          price_min: 10,
          price: 12,
          currency: 'USD',
          added_at: '2020-01-01T00:00:00Z',
          favorite_id: 'f1',
        },
        {
          product_id: 'p2',
          name: 'Second',
          image: 'https://example.com/p2.jpg',
          price_min: 5,
          price: 8,
          currency: 'USD',
          added_at: '2020-01-02T00:00:00Z',
          favorite_id: 'f2',
        },
      ],
      meta: { totalItems: 2 },
    };

    const { items, meta } = mapFavoritesResponse(apiResp, 'USD');
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(2);
    const first = items[0];
    expect(first).toHaveProperty('name', 'Sample Product');
    expect(first).toHaveProperty('currency', 'USD');
  });

  test('maps Collections response to internal collections', () => {
    const apiResp = {
      success: true,
      collections: [
        {
          id: 'c1',
          name: 'Wish',
          emoji: '❤️',
          description: 'desc',
          is_public: true,
          product_count: 3,
          created_at: '2020-01-01',
          updated_at: '2020-01-02',
        },
      ],
      meta: { totalItems: 1 },
    };

    const { collections, meta } = mapCollectionsResponse(apiResp as any);
    expect(Array.isArray(collections)).toBe(true);
    expect(collections[0]).toHaveProperty('id', 'c1');
    expect(meta).toBeDefined();
  });

  test('maps Collection Items response to internal items with nested products', () => {
    const apiResp = {
      success: true,
      items: [
        {
          product_id: 'p1',
          added_at: '2020-01-01',
          notes: 'note',
          product: {
            id: 'p1',
            name: 'Prod',
            image_url: 'https://example.com/p1.jpg',
            price_min: 5,
            currency: 'USD',
          },
        },
      ],
      meta: { totalItems: 1 },
    };

    const { items, meta } = mapCollectionItemsResponse(apiResp as any, 'USD');
    expect(Array.isArray(items)).toBe(true);
    expect(items[0]).toHaveProperty('product_id', 'p1');
    expect(items[0].product).toBeDefined();
    expect(meta.totalItems).toBe(1);
  });
});
