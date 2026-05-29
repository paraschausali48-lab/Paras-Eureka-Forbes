import { productMatchesFacets, type FilterState } from './filters';
import type { Product } from './types';

// Accept the actual product data model as an argument
export function applyFiltersAndSort(state: FilterState, allProducts: Product[]): Product[] {
  const { categories, facets, query, sort } = state;
  const isAllSelected = categories.includes('all');
  const searchTerms = query
    .toLowerCase()
    .trim()
    .split(' ')
    .filter((t) => t.length > 0);

  // 1. Filter the pure data model
  let visibleProducts = allProducts.filter((product) => {
    const matchesCat = isAllSelected || categories.includes(product.category);
    const searchString = `${product.name} ${product.description}`.toLowerCase();
    const matchesSearch = searchTerms.length === 0 || searchTerms.every((term) => searchString.includes(term));
    const matchesFacet = productMatchesFacets(product, facets);

    return matchesCat && matchesSearch && matchesFacet;
  });

  // 2. Sort the pure data model
  visibleProducts.sort((a, b) => {
    if (sort === 'relevance') {
      // Original array index preserves relevance
      return allProducts.indexOf(a) - allProducts.indexOf(b);
    }
    return sort === 'price-low-high' ? a.mop - b.mop : b.mop - a.mop;
  });

  return visibleProducts;
}
