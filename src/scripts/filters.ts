import { applyFiltersAndSort } from './render';
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

export let allProducts: Product[] = [];
export function setProductsData(products: Product[]) {
  allProducts = products;
}

type StateListener = (state: FilterState) => void;
const listeners: StateListener[] = [];

export function subscribeToFilters(listener: StateListener) {
  listeners.push(listener);
}

/**
 * Domain Knowledge Dictionary: Defines which facets belong exclusively to which categories.
 * This completely replaces the need to query the DOM to validate filter state cleanup.
 * (Note: Ensure these match the exact 'value' attributes of your HTML inputs)
 */
const FACET_DOMAINS: Record<string, string[]> = {
  'Water Purifier': [
    'ro',
    'uv',
    'uf',
    'wall-mounted',
    'under-counter',
    'table-top',
    'small',
    'medium',
    'large',
    'active-copper',
    'hot',
    'alkaline',
    'alkaline-copper',
    'plastic',
    'slim',
    'smart',
    'stainless-steel',
    'zero-pressure',
    'municipal',
  ],
  'Vacuum Cleaner': [
    'canister',
    'handheld',
    'upright',
    'robotic',
    'dry',
    'wet-dry',
    'bagless',
    'bagged',
    'corded',
    'cordless',
  ],
};

const SPECIAL_MAPPINGS: Record<string, string[]> = {
  ro: ['ro', 'ro-uv', 'ro-uv-uf', 'ro-uv-alk', 'ro-uv-alk-ss', 'ro-uv-ss', 'ro-uv-mc'],
  uv: ['uv', 'uv-uf', 'ro-uv', 'ro-uv-uf', 'ro-uv-alk', 'ro-uv-alk-ss', 'ro-uv-ss', 'uv-uf-ss'],
  uf: ['uf', 'uv-uf', 'ro-uv-uf', 'uv-uf-ss'],
  small: ['small', 'without-storage'],
  medium: ['medium', 'storage'],
  upright: ['upright', 'stick'],
  bagless: ['bagless', 'cyclonic'],
  cordless: ['cordless', 'battery'],
};

export function productMatchesFacets(product: Product, facets: string[]): boolean {
  if (facets.length === 0) return true;
  const subcategories = product.subcategories.map((s) => s.toLowerCase());
  const cat = product.category.toLowerCase();

  for (const val of facets) {
    if (['0-10000', '10000-15000', '15000-20000', '20000+'].includes(val)) {
      if (val === '0-10000' && product.mop >= 10000) return false;
      if (val === '10000-15000' && (product.mop < 10000 || product.mop >= 15000)) return false;
      if (val === '15000-20000' && (product.mop < 15000 || product.mop >= 20000)) return false;
      if (val === '20000+' && product.mop < 20000) return false;
      continue;
    }
    if (['exchange', 'free-installation', 'municipal'].includes(val)) continue;

    const mapped = SPECIAL_MAPPINGS[val] || [val];
    const hasMatch = mapped.some((m) => subcategories.includes(m) || cat === m);

    if (!hasMatch) {
      if (val === 'wall-mounted' && cat === 'water purifier' && !subcategories.includes('under-counter')) continue;
      return false;
    }
  }
  return true;
}

export function setFilterState(newState: Partial<FilterState>) {
  // 1. Create a shallow copy and apply updates
  let updatedState = { ...filterState, ...newState };

  // 2. Facet cleanup logic
  const isAllSelected = updatedState.categories.includes('all');
  let newFacets = [...updatedState.facets];

  if (!isAllSelected) {
    if (!updatedState.categories.includes('Water Purifier')) {
      newFacets = newFacets.filter((f) => !FACET_DOMAINS['Water Purifier']?.includes(f));
    }
    if (!updatedState.categories.includes('Vacuum Cleaner')) {
      newFacets = newFacets.filter((f) => !FACET_DOMAINS['Vacuum Cleaner']?.includes(f));
    }
  }
  updatedState.facets = newFacets;

  // 3. Freeze and assign
  filterState = Object.freeze(updatedState);

  // 4. Notify subscribers (Reactive Pub/Sub)
  listeners.forEach((listener) => listener(filterState));
}

/**
 * SIDE EFFECT: Updates the DOM to reflect the new filter state.
 */
export function updateFilterUI(state: FilterState, visibleProducts: Product[]) {
  const visibleCount = visibleProducts.length;
  const { categories: checkedCats, facets: activeFacets, query } = state;
  const isAllSelected = checkedCats.includes('all');
  const clearAllBtn = document.getElementById('filter-clear-all');

  // Sync DOM inputs to match the state
  document.querySelectorAll<HTMLInputElement>('.filter-cat').forEach((cb) => {
    cb.checked = state.categories.includes(cb.value);
  });
  document.querySelectorAll<HTMLInputElement>('.filter-facet').forEach((cb) => {
    cb.checked = state.facets.includes(cb.value);
  });
  const searchInput = document.getElementById('product-search') as HTMLInputElement | null;
  if (searchInput && searchInput.value !== state.query) {
    searchInput.value = state.query;
  }
  const desktopSort = document.getElementById('desktop-sort-select') as HTMLSelectElement | null;
  if (desktopSort && desktopSort.value !== state.sort) {
    desktopSort.value = state.sort;
  }

  // Dynamic Sidebar Filters - Show only relevant facet groups
  document.querySelectorAll<HTMLElement>('.water-filter').forEach((el) => {
    const show = isAllSelected || checkedCats.includes('Water Purifier');
    el.style.display = show ? '' : 'none';
  });
  document.querySelectorAll<HTMLElement>('.vacuum-filter').forEach((el) => {
    const show = isAllSelected || checkedCats.includes('Vacuum Cleaner');
    el.style.display = show ? '' : 'none';
  });

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
    if (emptyState) emptyState.style.display = 'flex';
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

  // Category counts update (Pure Data calculation)
  ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'].forEach((catName) => {
    const count = visibleProducts.filter((p) => p.category === catName).length;
    const countEl = document.querySelector(`.filter-count[data-cat="${catName}"]`);
    if (countEl) countEl.textContent = `(${count})`;
  });
}

/**
 * Core application subscription:
 * Automatically triggers the render pipeline whenever the filter state changes.
 */
subscribeToFilters((newState) => {
  const visibleProducts = applyFiltersAndSort(newState, allProducts);
  updateFilterUI(newState, visibleProducts);
});
