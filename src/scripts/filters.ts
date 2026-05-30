import { map } from 'nanostores';
import type { Product } from './types';

export interface FilterState {
  categories: string[];
  facets: string[];
  query: string;
  sort: string;
}

// 1. Create a reactive, framework-agnostic Nano Store
export const $filterState = map<FilterState>({
  categories: ['all'],
  facets: [],
  query: '',
  sort: 'relevance',
});

// 2. Create a metadata store so Preact can broadcast catalog stats
// without imperatively calling legacy Vanilla JS functions.
export interface CatalogMeta {
  visibleCount: number;
  categoryCounts: Record<string, number>;
}
export const $catalogMeta = map<CatalogMeta>({
  visibleCount: 0,
  categoryCounts: {},
});

export let allProducts: Product[] = [];
export function setProductsData(products: Product[]) {
  allProducts = products;
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

// Configuration object for generic facet groupings.
// This moves business logic out of the core filtering algorithm.
const FACET_GROUPS: Record<string, string[]> = {
  tech: ['ro', 'uv', 'uf'],
  placement: ['wall-mounted', 'under-counter', 'table-top'],
  capacity: ['small', 'medium', 'large'],
  vac_type: ['canister', 'handheld', 'upright', 'robotic'],
  vac_app: ['dry', 'wet-dry'],
  vac_dust: ['bagless', 'bagged'],
  vac_pow: ['corded', 'cordless'],
};

export function productMatchesFacets(product: Product, facets: string[]): boolean {
  if (facets.length === 0) return true;
  const subcategories = product.subcategories.map((s) => s.toLowerCase());
  const cat = product.category.toLowerCase();

  // 1. Dynamically group active facets into their logical families
  const groups: Record<string, string[]> = {};

  facets.forEach((val) => {
    let groupName = 'other';

    // Dynamically detect price bands (e.g., "10000-15000", "20000+")
    if (/^\d+(-\d+|\+)$/.test(val)) {
      groupName = 'price';
    } else {
      // Resolve group from configuration
      for (const [gName, gFacets] of Object.entries(FACET_GROUPS)) {
        if (gFacets.includes(val)) {
          groupName = gName;
          break;
        }
      }
    }

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(val);
  });

  // 2. Evaluate OR within the same group, AND across different groups
  for (const [groupName, groupFacets] of Object.entries(groups)) {
    let groupMatch = false;

    for (const val of groupFacets) {
      if (groupName === 'price') {
        if (val.endsWith('+')) {
          const min = parseInt(val, 10);
          if (product.mop >= min) groupMatch = true;
        } else {
          const [min, max] = val.split('-').map(Number);
          if (product.mop >= min && product.mop < max) groupMatch = true;
        }
        continue;
      }

      if (['exchange', 'free-installation', 'municipal'].includes(val)) {
        groupMatch = true;
        continue;
      }

      const mapped = SPECIAL_MAPPINGS[val] || [val];
      const hasMatch = mapped.some((m) => subcategories.includes(m) || cat === m);

      if (hasMatch) {
        groupMatch = true;
      } else if (val === 'wall-mounted' && cat === 'water purifier' && !subcategories.includes('under-counter')) {
        groupMatch = true;
      }
    }

    // If the product matched NONE of the selected facets in this group, it fails the global AND check
    if (!groupMatch) return false;
  }

  return true;
}

export function setFilterState(newState: Partial<FilterState>) {
  const currentState = $filterState.get();
  let updatedState = { ...currentState, ...newState };

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

  // Update the reactive store
  $filterState.set(updatedState);
}

// 3. Decouple Environment Side Effects (URL Sync) from UI Rendering
if (typeof window !== 'undefined') {
  $filterState.subscribe((state) => {
    const url = new URL(window.location.href);
    const isAllSelected = state.categories.includes('all');

    if (state.categories.length && !isAllSelected) url.searchParams.set('cat', state.categories.join(','));
    else url.searchParams.delete('cat');
    if (state.facets.length) url.searchParams.set('facets', state.facets.join(','));
    else url.searchParams.delete('facets');
    if (state.query) url.searchParams.set('q', state.query);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  });
}
