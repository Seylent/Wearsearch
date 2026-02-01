import { getBrandAccess, getBrandAccessByName } from '../brandAccess';

describe('getBrandAccess', () => {
  it('allows open brands', () => {
    const result = getBrandAccess({
      brandId: 'b1',
      storeBrandId: null,
      brands: [{ id: 'b1', name: 'Open Brand', is_closed: false }],
    });

    expect(result.isClosed).toBe(false);
    expect(result.isAllowed).toBe(true);
  });

  it('blocks closed brands for non-official store', () => {
    const result = getBrandAccess({
      brandId: 'b2',
      storeBrandId: 'b1',
      brands: [{ id: 'b2', name: 'Closed Brand', is_closed: true }],
    });

    expect(result.isClosed).toBe(true);
    expect(result.isAllowed).toBe(false);
  });

  it('allows closed brands for official store', () => {
    const result = getBrandAccess({
      brandId: 'b3',
      storeBrandId: 'b3',
      brands: [{ id: 'b3', name: 'Closed Brand', is_closed: true }],
    });

    expect(result.isClosed).toBe(true);
    expect(result.isAllowed).toBe(true);
  });

  it('allows when no brand selected', () => {
    const result = getBrandAccess({
      brandId: null,
      storeBrandId: null,
      brands: [{ id: 'b4', name: 'Any Brand', is_closed: true }],
    });

    expect(result.isClosed).toBe(false);
    expect(result.isAllowed).toBe(true);
  });

  it('resolves access by brand name', () => {
    const result = getBrandAccessByName({
      brandName: 'Nike',
      storeBrandId: null,
      brands: [{ id: 'nike', name: 'Nike', is_closed: true }],
    });

    expect(result.isClosed).toBe(true);
    expect(result.isAllowed).toBe(false);
  });
});
