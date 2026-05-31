import { map, atom, computed } from 'nanostores';
import type { Product } from './types';
import { registerClickAction } from './events';
import { handleAppRouting, closeActiveOverlay } from './routing';
import { debounce } from './utils';

export interface FilterState {
  categories: string[];
  facets: string[];
  query: string;
  sort: string;
}

// 1. Synchronously read URL parameters to prevent hydration mismatches and ensure
// JS-enabled crawlers see the exact filtered state immediately upon execution.
const getInitialState = (): FilterState => {
  const defaultState = { categories: ['all'], facets: [], query: '', sort: 'relevance' };
  if (typeof window === 'undefined') return defaultState;

  const params = new URLSearchParams(window.location.search);
  return {
    categories: params.get('cat')?.split(',') || defaultState.categories,
    facets: params.get('facets')?.split(',') || defaultState.facets,
    query: params.get('q') || defaultState.query,
    sort: params.get('sort') || defaultState.sort,
  };
};

// Create a reactive, framework-agnostic Nano Store
export const $filterState = map<FilterState>(getInitialState());

export const $allProducts = atom<Product[]>([]);

// 2. Pure business logic: Compute the catalog strictly from the state.
// This completely removes the Preact useEffect cascade.
export const $filteredCatalog = computed([$allProducts, $filterState], (products, state) => {
  const { categories, facets, query, sort } = state;
  const isAllSelected = categories.includes('all');
  const searchTerms = query.toLowerCase().trim().split(' ').filter(Boolean);

  const filtered: Product[] = [];
  const counts: Record<string, number> = {
    'Water Purifier': 0,
    'Air Purifier': 0,
    'Vacuum Cleaner': 0,
    'Water Softener': 0,
  };

  products.forEach((product) => {
    const matchesCat = isAllSelected || categories.includes(product.category);
    const searchString = `${product.name} ${product.description}`.toLowerCase();
    const matchesSearch = searchTerms.length === 0 || searchTerms.every((term) => searchString.includes(term));
    const matchesFacet = productMatchesFacets(product, facets);

    if (matchesCat && matchesSearch && matchesFacet) {
      if (counts[product.category] !== undefined) {
        counts[product.category]++;
      }
      filtered.push(product);
    }
  });

  if (sort !== 'relevance') {
    filtered.sort((a, b) => (sort === 'price-low' ? a.mop - b.mop : b.mop - a.mop));
  }

  return { visibleProducts: filtered, visibleCount: filtered.length, categoryCounts: counts };
});

export interface CatalogMeta {
  visibleCount: number;
  categoryCounts: Record<string, number>;
}

export const $catalogMeta = computed($filteredCatalog, (catalog) => ({
  visibleCount: catalog.visibleCount,
  categoryCounts: catalog.categoryCounts,
}));

/**
 * Domain Knowledge Dictionary: Defines which facets belong exclusively to which categories.
 * This completely replaces the need to query the DOM to validate filter state cleanup.
 * (Note: Ensure these match the exact 'value' attributes of your HTML inputs)
 */
let FACET_DOMAINS: Record<string, string[]> = {};

const SPECIAL_MAPPINGS: Record<string, string[]> = {
  small: ['small', 'without-storage'],
  medium: ['medium', 'storage'],
  upright: ['upright', 'stick'],
  bagless: ['bagless', 'cyclonic'],
  cordless: ['cordless', 'battery'],
};

export function setProductsData(products: Product[]) {
  $allProducts.set(products);

  // Dynamically generate FACET_DOMAINS and tech SPECIAL_MAPPINGS to decouple business logic
  FACET_DOMAINS = {};
  const roSet = new Set<string>(['ro']);
  const uvSet = new Set<string>(['uv']);
  const ufSet = new Set<string>(['uf']);

  products.forEach((p) => {
    if (!FACET_DOMAINS[p.category]) {
      // Initialize with base tech facets so UI state cleanup works properly
      FACET_DOMAINS[p.category] = p.category === 'Water Purifier' ? ['ro', 'uv', 'uf'] : [];
    }

    p.subcategories.forEach((sub) => {
      const s = sub.toLowerCase();
      if (!FACET_DOMAINS[p.category].includes(s)) {
        FACET_DOMAINS[p.category].push(s);
      }
      if (s.includes('ro')) roSet.add(s);
      if (s.includes('uv')) uvSet.add(s);
      if (s.includes('uf')) ufSet.add(s);
    });
  });

  SPECIAL_MAPPINGS['ro'] = Array.from(roSet);
  SPECIAL_MAPPINGS['uv'] = Array.from(uvSet);
  SPECIAL_MAPPINGS['uf'] = Array.from(ufSet);
}

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
  const getAnnouncer = () => {
    let el = document.getElementById('a11y-announcer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'a11y-announcer';
      el.className = 'sr-only';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      document.body.appendChild(el);
    }
    return el;
  };

  let initialLoad = true;
  $catalogMeta.subscribe((meta) => {
    if (initialLoad) {
      initialLoad = false;
      return; // Standard a11y practice: Don't announce on first render
    }
    const announcer = getAnnouncer();
    announcer.textContent = `Showing ${meta.visibleCount} products.`;
  });

  $filterState.subscribe((state) => {
    // Prevent URL pollution on non-catalog pages (e.g., Legal Terms) during View Transitions
    if (!document.getElementById('product-grid')) return;

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

  // ============= UI EVENT BINDINGS (Decoupled Routing) =============
  registerClickAction({
    selector: '.visual-filter-btn',
    handle: (el: HTMLElement) => {
      if (window.location.hash !== '#products') {
        window.history.pushState(null, '', '#products');
      }
      const productsEl = document.getElementById('products');
      if (productsEl) productsEl.style.display = '';
      document.body.classList.add('products-visible');

      const navCat = el.dataset.navCategory;
      const filterVal = el.dataset.filter;

      const parentContainer = el.closest('.visual-filters');
      if (parentContainer) {
        parentContainer.querySelectorAll('.visual-filter-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
      }
      el.classList.add('active');
      el.setAttribute('aria-pressed', 'true');

      if (navCat) {
        setFilterState({ categories: [navCat], facets: [], query: '' });
      } else if (filterVal) {
        // Hardcoded domain strings removed, defaults to data-target-category
        const targetCat = el.dataset.targetCategory || 'Water Purifier';
        setFilterState({ categories: [targetCat], facets: [filterVal], query: '' });
      }

      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });

  registerClickAction({
    selector: '#sort-mobile-toggle',
    handle: () => {
      const currentState = $filterState.get();
      document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sort === currentState.sort);
      });
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'sort');
      window.history.pushState(null, '', url);
      handleAppRouting();
    },
  });

  registerClickAction({
    selector: '.sort-option-btn',
    handle: (el: HTMLElement) => {
      const sortValue = el.dataset.sort;
      if (sortValue) setFilterState({ sort: sortValue });
      setTimeout(() => closeActiveOverlay(), 250);
    },
  });

  registerClickAction({
    selector: '#filter-clear-all',
    handle: () => setFilterState({ categories: ['all'], facets: [], query: '' }),
  });

  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    if (target.id === 'desktop-sort-select') {
      setFilterState({ sort: target.value });
      document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sort === target.value);
      });
    }
  });

  const handleSearchInput = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.id !== 'product-search') return;

    const prodEl = document.getElementById('products');
    if (prodEl && prodEl.style.display === 'none') {
      prodEl.style.display = '';
      document.body.classList.add('products-visible');
      prodEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setFilterState({ query: target.value });
  }, 300);

  document.addEventListener('input', handleSearchInput);

  document.addEventListener('submit', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest('.header-search')) {
      e.preventDefault();
      document.getElementById('product-search')?.blur();
    }
  });
}
