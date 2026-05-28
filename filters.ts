import { renderProducts } from './render';
import { applyTranslations } from './translations';
import type { Product } from './types';

export interface FilterState {
  categories: string[];
  facets: string[];
  query: string;
  sort: string;
}

export let filterState: FilterState = Object.freeze({
  categories: ['all'],
  facets: [],
  query: '',
  sort: 'relevance',
});

export function sortProductsData(sortType: string, products: Product[]): Product[] {
  if (sortType === 'price-low-high') {
    return products.slice().sort((a, b) => a.mop - b.mop);
  } else if (sortType === 'price-high-low') {
    return products.slice().sort((a, b) => b.mop - a.mop);
  } else {
    return products; // Relevance (default order)
  }
}

export function productMatchesFacets(product: Product, facetValues: string[]): boolean {
  const subs = product.subcategories.map((s) => s.toLowerCase().trim());
  const price = product.mop;
  const category = product.category;

  for (const val of facetValues) {
    // Price filtering logic
    if (['0-10000', '10000-15000', '15000-20000', '20000+'].includes(val)) {
      if (val === '0-10000' && price >= 10000) return false;
      if (val === '10000-15000' && (price < 10000 || price >= 15000)) return false;
      if (val === '15000-20000' && (price < 15000 || price >= 20000)) return false;
      if (val === '20000+' && price < 20000) return false;
      continue;
    }

    // Generic offers
    if (['exchange', 'free-installation', 'municipal'].includes(val)) continue;

    // Spec mappings
    const specialMappings: Record<string, string[]> = {
      ro: ['ro', 'ro-uv', 'ro-uv-uf', 'ro-uv-alk', 'ro-uv-alk-ss', 'ro-uv-ss', 'ro-uv-mc'],
      uv: ['uv', 'uv-uf', 'ro-uv', 'ro-uv-uf', 'ro-uv-alk', 'ro-uv-alk-ss', 'ro-uv-ss', 'uv-uf-ss'],
      uf: ['uf', 'uv-uf', 'ro-uv-uf', 'uv-uf-ss'],
      small: ['small', 'without-storage'],
      medium: ['medium', 'storage'],
      upright: ['upright', 'stick'],
      bagless: ['bagless', 'cyclonic'],
      cordless: ['cordless', 'battery'],
    };

    const mapped = specialMappings[val] || [val];
    if (!mapped.some((m: string) => subs.includes(m) || category === m)) {
      if (val === 'wall-mounted' && category === 'Water Purifier' && !subs.includes('under-counter')) continue;
      return false;
    }
  }
  return true;
}

export function setFilterState(newState: Partial<FilterState>, productsData: Product[]) {
  // 1. Create a shallow copy and apply updates
  let updatedState = { ...filterState, ...newState };

  // 2. Facet cleanup logic
  const isAllSelected = updatedState.categories.includes('all');
  let newFacets = [...updatedState.facets];

  if (!isAllSelected) {
    if (!updatedState.categories.includes('Water Purifier')) {
      const waterFacets = Array.from(document.querySelectorAll<HTMLInputElement>('.water-filter input')).map(
        (cb) => cb.value,
      );
      newFacets = newFacets.filter((f) => !waterFacets.includes(f));
    }
    if (!updatedState.categories.includes('Vacuum Cleaner')) {
      const vacuumFacets = Array.from(document.querySelectorAll<HTMLInputElement>('.vacuum-filter input')).map(
        (cb) => cb.value,
      );
      newFacets = newFacets.filter((f) => !vacuumFacets.includes(f));
    }
  }
  updatedState.facets = newFacets;

  // 3. Freeze and assign
  filterState = Object.freeze(updatedState);

  // Sync DOM inputs to match the state
  document.querySelectorAll<HTMLInputElement>('.filter-cat').forEach((cb) => {
    cb.checked = filterState.categories.includes(cb.value);
  });
  document.querySelectorAll<HTMLInputElement>('.filter-facet').forEach((cb) => {
    cb.checked = filterState.facets.includes(cb.value);
  });
  const searchInput = document.getElementById('product-search') as HTMLInputElement | null;
  if (searchInput && searchInput.value !== filterState.query) {
    searchInput.value = filterState.query;
  }
  const desktopSort = document.getElementById('desktop-sort-select') as HTMLSelectElement | null;
  if (desktopSort && desktopSort.value !== filterState.sort) {
    desktopSort.value = filterState.sort;
  }

  applyFilters(productsData);
}

export function applyFilters(productsData: Product[]) {
  const clearAllBtn = document.getElementById('filter-clear-all');

  const { categories: checkedCats, facets: activeFacets, query, sort } = filterState;
  const isAllSelected = checkedCats.includes('all');

  // Dynamic Sidebar Filters - Show only relevant facet groups
  document.querySelectorAll<HTMLElement>('.water-filter').forEach((el) => {
    const show = isAllSelected || checkedCats.includes('Water Purifier');
    el.style.display = show ? '' : 'none';
  });
  document.querySelectorAll<HTMLElement>('.vacuum-filter').forEach((el) => {
    const show = isAllSelected || checkedCats.includes('Vacuum Cleaner');
    el.style.display = show ? '' : 'none';
  });

  const searchTerms = query
    .toLowerCase()
    .trim()
    .split(' ')
    .filter((t) => t.length > 0);

  const filteredProducts = productsData.filter((product) => {
    const cat = product.category;
    const title = product.name.toLowerCase();
    const desc = product.description.toLowerCase();

    const matchesCat = isAllSelected || checkedCats.includes(cat);
    const matchesSearch =
      searchTerms.length === 0 || searchTerms.every((term) => title.includes(term) || desc.includes(term));
    const matchesFacet = activeFacets.length === 0 || productMatchesFacets(product as Product, activeFacets);

    return matchesCat && matchesSearch && matchesFacet;
  });

  const sortedProducts = sortProductsData(sort, filteredProducts);
  renderProducts(sortedProducts);

  const visibleCount = sortedProducts.length;

  // Announce results to screen readers
  const announcer = document.getElementById('search-announcer');
  if (announcer) {
    announcer.textContent = `Showing ${visibleCount} product${visibleCount !== 1 ? 's' : ''}`;
  }

  // Sync Filter State to URL for easy sharing
  const url = new URL(window.location.href);
  if (checkedCats.length && !isAllSelected) url.searchParams.set('cat', checkedCats.join(','));
  else url.searchParams.delete('cat');
  if (activeFacets.length) url.searchParams.set('facets', activeFacets.join(','));
  else url.searchParams.delete('facets');
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  window.history.replaceState(null, '', url);

  // Update empty state
  let emptyState = document.getElementById('empty-state');
  if (visibleCount === 0) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.id = 'empty-state';
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `<h3 data-i18n="empty_title">No products found</h3>
                              <p data-i18n="empty_desc">Try adjusting your filters or search query to find what you're looking for.</p>
                              <button class="btn" onclick="document.getElementById('filter-clear-all').click()" data-i18n="empty_btn">Clear All Filters</button>`;
      const productGrid = document.getElementById('product-grid');
      if (productGrid) productGrid.appendChild(emptyState);
      applyTranslations(document.documentElement.lang || 'en');
    }
    emptyState.style.display = 'flex';
  } else if (emptyState) {
    emptyState.style.display = 'none';
  }

  // Update Badges and Clear All state
  if (clearAllBtn) {
    if (activeFacets.length > 0 || !isAllSelected || query.length > 0) {
      clearAllBtn.classList.add('active-filters');
    } else {
      clearAllBtn.classList.remove('active-filters');
    }
  }

  const filterBadge = document.getElementById('filter-badge');
  if (filterBadge) {
    const activeCount = activeFacets.length + (isAllSelected ? 0 : checkedCats.length);
    filterBadge.textContent = activeCount.toString();
    filterBadge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
  }

  document.querySelectorAll('.filter-group').forEach((group) => {
    const groupInputs = Array.from(group.querySelectorAll<HTMLInputElement>('.filter-option input')).map(
      (cb) => cb.value,
    );
    const checkedInGroup =
      activeFacets.filter((facet) => groupInputs.includes(facet)).length +
      checkedCats.filter((cat) => groupInputs.includes(cat) && cat !== 'all').length;

    const title = group.querySelector('.filter-group-title');
    if (title) {
      if (checkedInGroup > 0) title.setAttribute('data-selected-count', checkedInGroup.toString());
      else title.removeAttribute('data-selected-count');
    }
  });

  // Category counts update
  ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'].forEach((catName) => {
    const count = productsData.filter((p: Product) => p.category === catName && filteredProducts.includes(p)).length;
    const countEl = document.querySelector(`.filter-count[data-cat="${catName}"]`);
    if (countEl) countEl.textContent = `(${count})`;
  });
}
