import { describe, it, expect } from 'vitest';
import { productMatchesFacets } from './filters';
import type { Product } from './types';

describe('Filtering Logic: productMatchesFacets', () => {
  // Define a mock product to test against
  const mockProduct: Product = {
    sku: 'EF-AQUAGUARD-TEST-RO',
    name: 'AQUAGUARD TEST RO',
    category: 'Water Purifier',
    i18nTag: 'tag_water',
    subcategories: ['ro-uv', 'medium', 'active-copper'],
    outOfStock: false,
    leaflet: '',
    image: '',
    description: 'A test purifier',
    mrp: 20000,
    mop: 12500, // Price is exactly 12,500
  };

  it('should correctly match products within the specified price range', () => {
    // 12,500 falls in the 10000-15000 range
    expect(productMatchesFacets(mockProduct, ['10000-15000'])).toBe(true);

    // It should fail for all other price ranges
    expect(productMatchesFacets(mockProduct, ['0-10000'])).toBe(false);
    expect(productMatchesFacets(mockProduct, ['15000-20000'])).toBe(false);
    expect(productMatchesFacets(mockProduct, ['20000+'])).toBe(false);
  });

  it('should correctly evaluate multiple price ranges with OR logic', () => {
    // The product price is 12,500. Selecting BOTH "Under 10k" and "10k-15k" should return true.
    expect(productMatchesFacets(mockProduct, ['0-10000', '10000-15000'])).toBe(true);
  });

  it('should correctly map and match complex subcategories (e.g., RO technology)', () => {
    // The product has 'ro-uv' in its subcategories. The filter engine maps 'ro' to 'ro-uv', so this should pass.
    expect(productMatchesFacets(mockProduct, ['ro'])).toBe(true);

    // The product does NOT have 'uf', so it should fail
    expect(productMatchesFacets(mockProduct, ['uf'])).toBe(false);
  });

  it('should bypass generic offers like exchange or free-installation', () => {
    expect(productMatchesFacets(mockProduct, ['exchange'])).toBe(true);
    expect(productMatchesFacets(mockProduct, ['free-installation'])).toBe(true);
  });
});
