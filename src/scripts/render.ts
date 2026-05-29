import { productMatchesFacets, type FilterState } from './filters';
import type { Product } from './types';
import { getSku } from './utils';

// Accept the actual product data model as an argument
export function applyFiltersAndSort(state: FilterState, allProducts: Product[]): Product[] {
  const grid = document.getElementById('product-grid');
  if (!grid) return [];

  const currentCards = Array.from(grid.children) as HTMLElement[];
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

  // 3. Update the DOM to map the filtered/sorted data exactly
  const cardMap = new Map<string, HTMLElement>();
  currentCards.forEach((card) => {
    if (!card.classList.contains('product-card')) return;
    if (card.dataset.sku) cardMap.set(card.dataset.sku, card);
    // Hide everything by default
    card.style.display = 'none';
    card.classList.remove('reveal', 'active');
  });

  // Use a DocumentFragment to batch DOM insertions and prevent multiple reflows
  const fragment = document.createDocumentFragment();

  visibleProducts.forEach((product) => {
    const sku = getSku(product.name);
    const card = cardMap.get(sku);
    if (card) {
      card.style.display = '';
      // Add a slight delay for the CSS transition reveal to kick in
      requestAnimationFrame(() => card.classList.add('reveal', 'active'));
      fragment.appendChild(card);
    }
  });

  // Append all elements to the DOM in a single operation
  grid.appendChild(fragment);

  return visibleProducts;
}
