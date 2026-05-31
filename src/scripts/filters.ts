import { map, atom, computed } from 'nanostores';
import type { Product, ProductSubcategory } from './types';
import {
  ProductCategory,
  SortOption,
  PriceBracket,
  WaterTech,
  Placement,
  Capacity,
  VacType,
  VacApp,
  VacDust,
  VacPow,
} from './types';
import { registerClickAction } from './events';
import { handleAppRouting, closeActiveOverlay } from './routing';
import { debounce } from './utils';

export interface FilterState {
  categories: string[];
  facets: string[];
  query: string;
  sort: SortOption | string;
}

// 1. Synchronously read URL parameters to prevent hydration mismatches and ensure
// JS-enabled crawlers see the exact filtered state immediately upon execution.
const getInitialState = (): FilterState => {
  const defaultState = { categories: ['all'], facets: [], query: '', sort: SortOption.RELEVANCE };
  if (typeof window === 'undefined') return defaultState;

  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const facetParam = params.get('facets');

  return {
    categories: catParam ? catParam.split(',') : defaultState.categories,
    facets: facetParam ? facetParam.split(',') : defaultState.facets,
    query: params.get('q') || defaultState.query,
    sort: (params.get('sort') as SortOption) || defaultState.sort,
  };
};

// Create a reactive, framework-agnostic Nano Store
export const $filterState = map<FilterState>(getInitialState());

export const $allProducts = atom<Product[]>([]);

// 2. Pure business logic: Compute the catalog strictly from the state.
// Memoize string computations to prevent O(N) memory allocations during rapid state changes
const searchIndexCache = new WeakMap<Product, string>();
const searchWordsCache = new WeakMap<Product, string[]>();
const subcatCache = new WeakMap<Product, string[]>();
const catCache = new WeakMap<Product, string>();

// 3. High-performance Levenshtein distance for Typo-Tolerant (Fuzzy) Search
// Uses a single continuous memory block (1D array swap) to prevent GC pauses
function isTypoMatch(term: string, word: string, maxDistance: number): boolean {
  if (Math.abs(term.length - word.length) > maxDistance) return false;
  if (term === word) return true;

  let v0 = Array.from({ length: word.length + 1 }, (_, i) => i);
  let v1 = new Array(word.length + 1);

  for (let i = 0; i < term.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < word.length; j++) {
      const cost = term[i] === word[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    let tmp = v0;
    v0 = v1;
    v1 = tmp;
  }
  return v0[word.length] <= maxDistance;
}

export function buildFacetGroups(facets: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  facets.forEach((val) => {
    let groupName = 'other';
    if (/^\d+(-\d+|\+)$/.test(val)) {
      groupName = 'price';
    } else {
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
  return groups;
}

// This completely removes the Preact useEffect cascade.
export const $filteredCatalog = computed([$allProducts, $filterState], (products, state) => {
  const { categories, facets, query, sort } = state;
  const isAllSelected = categories.includes('all');
  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const prebuiltGroups = buildFacetGroups(facets);

  const filtered: Product[] = [];
  const counts: Record<string, number> = {
    [ProductCategory.WATER_PURIFIER]: 0,
    [ProductCategory.AIR_PURIFIER]: 0,
    [ProductCategory.VACUUM_CLEANER]: 0,
    [ProductCategory.WATER_SOFTENER]: 0,
  };
  const facetCounts: Record<string, number> = {};

  products.forEach((product) => {
    const matchesCat = isAllSelected || categories.includes(product.category);

    let searchString = searchIndexCache.get(product);
    let words = searchWordsCache.get(product);

    if (!searchString || !words) {
      const rawText = `${product.name} ${product.description}`.toLowerCase();

      // Cache individual words for fuzzy matching
      words = Array.from(new Set(rawText.split(/[^a-z0-9]+/))).filter((w) => w.length > 2);
      searchWordsCache.set(product, words);

      // Append no-space version to easily match "aqua guard" vs "aquaguard"
      searchString = rawText + ' ' + rawText.replace(/\s+/g, '');
      searchIndexCache.set(product, searchString);
    }

    const matchesSearch =
      searchTerms.length === 0 ||
      searchTerms.every((term) => {
        if (searchString!.includes(term)) return true; // Exact substring match is O(1) fast path
        const tolerance = term.length <= 4 ? 1 : 2; // Allow 1 typo for short words, 2 for long
        return words!.some((word) => isTypoMatch(term, word, tolerance));
      });

    const matchesFacet = productMatchesFacets(product, facets, prebuiltGroups);

    if (matchesCat && matchesSearch && matchesFacet) {
      if (counts[product.category] !== undefined) {
        counts[product.category]++;
      }

      // Calculate active facet counts dynamically
      let subcats = subcatCache.get(product);
      if (!subcats) {
        subcats = product.subcategories.map((s) => s.toLowerCase());
        subcatCache.set(product, subcats);
      }
      subcats.forEach((sub) => {
        facetCounts[sub] = (facetCounts[sub] || 0) + 1;
      });

      if (subcats.some((s) => s.includes(WaterTech.RO)))
        facetCounts[WaterTech.RO] = (facetCounts[WaterTech.RO] || 0) + 1;
      if (subcats.some((s) => s.includes(WaterTech.UV)))
        facetCounts[WaterTech.UV] = (facetCounts[WaterTech.UV] || 0) + 1;
      if (subcats.some((s) => s.includes(WaterTech.UF)))
        facetCounts[WaterTech.UF] = (facetCounts[WaterTech.UF] || 0) + 1;

      if (product.mop < 10000) facetCounts[PriceBracket.UNDER_10K] = (facetCounts[PriceBracket.UNDER_10K] || 0) + 1;
      else if (product.mop < 15000)
        facetCounts[PriceBracket.BETWEEN_10K_15K] = (facetCounts[PriceBracket.BETWEEN_10K_15K] || 0) + 1;
      else if (product.mop < 20000)
        facetCounts[PriceBracket.BETWEEN_15K_20K] = (facetCounts[PriceBracket.BETWEEN_15K_20K] || 0) + 1;
      else facetCounts[PriceBracket.ABOVE_20K] = (facetCounts[PriceBracket.ABOVE_20K] || 0) + 1;

      filtered.push(product);
    }
  });

  if (sort !== SortOption.RELEVANCE) {
    filtered.sort((a, b) => (sort === SortOption.PRICE_LOW ? a.mop - b.mop : b.mop - a.mop));
  }

  return { visibleProducts: filtered, visibleCount: filtered.length, categoryCounts: counts, facetCounts };
});

export interface CatalogMeta {
  visibleCount: number;
  categoryCounts: Record<string, number>;
  facetCounts: Record<string, number>;
}

export const $catalogMeta = computed($filteredCatalog, (catalog) => ({
  visibleCount: catalog.visibleCount,
  categoryCounts: catalog.categoryCounts,
  facetCounts: catalog.facetCounts,
}));

/**
 * Domain Knowledge Dictionary: Defines which facets belong exclusively to which categories.
 * This completely replaces the need to query the DOM to validate filter state cleanup.
 * (Note: Ensure these match the exact 'value' attributes of your HTML inputs)
 */
export let FACET_DOMAINS: Record<string, string[]> = {};

const SPECIAL_MAPPINGS: Record<string, string[]> = {
  [Capacity.SMALL]: [Capacity.SMALL, 'without-storage'],
  [Capacity.MEDIUM]: [Capacity.MEDIUM, 'storage'],
  [VacType.UPRIGHT]: [VacType.UPRIGHT, VacType.STICK],
  [VacDust.BAGLESS]: [VacDust.BAGLESS, VacDust.CYCLONIC],
  [VacPow.CORDLESS]: [VacPow.CORDLESS, VacPow.BATTERY],
};

export function setProductsData(products: Product[]) {
  $allProducts.set(products);

  // Dynamically generate FACET_DOMAINS and tech SPECIAL_MAPPINGS to decouple business logic
  FACET_DOMAINS = {};
  const roSet = new Set<string>([WaterTech.RO]);
  const uvSet = new Set<string>([WaterTech.UV]);
  const ufSet = new Set<string>([WaterTech.UF]);

  products.forEach((p) => {
    if (!FACET_DOMAINS[p.category]) {
      // Initialize with base tech facets so UI state cleanup works properly
      FACET_DOMAINS[p.category] =
        p.category === ProductCategory.WATER_PURIFIER ? [WaterTech.RO, WaterTech.UV, WaterTech.UF] : [];
    }

    p.subcategories.forEach((sub) => {
      const s = sub.toLowerCase();
      if (!FACET_DOMAINS[p.category].includes(s)) {
        FACET_DOMAINS[p.category].push(s);
      }
      if (s.includes(WaterTech.RO)) roSet.add(s);
      if (s.includes(WaterTech.UV)) uvSet.add(s);
      if (s.includes(WaterTech.UF)) ufSet.add(s);
    });
  });

  // Fix 4: Inject abstract mapped facets so they are recognized by the domain leakage engine
  const injectMapping = (cat: string, mappingKeys: string[]) => {
    if (FACET_DOMAINS[cat]) {
      mappingKeys.forEach((key) => {
        if (!FACET_DOMAINS[cat].includes(key)) FACET_DOMAINS[cat].push(key);
      });
    }
  };
  injectMapping(ProductCategory.VACUUM_CLEANER, [VacDust.BAGLESS, VacPow.CORDLESS, VacType.UPRIGHT]);
  injectMapping(ProductCategory.WATER_PURIFIER, [Capacity.SMALL, Capacity.MEDIUM]);

  SPECIAL_MAPPINGS[WaterTech.RO] = Array.from(roSet);
  SPECIAL_MAPPINGS[WaterTech.UV] = Array.from(uvSet);
  SPECIAL_MAPPINGS[WaterTech.UF] = Array.from(ufSet);
}

// Configuration object for generic facet groupings.
// This moves business logic out of the core filtering algorithm.
export const FACET_GROUPS: Record<string, string[]> = {
  tech: [WaterTech.RO, WaterTech.UV, WaterTech.UF],
  placement: [Placement.WALL_MOUNTED, Placement.UNDER_COUNTER, Placement.TABLE_TOP],
  capacity: [Capacity.SMALL, Capacity.MEDIUM, Capacity.LARGE],
  vac_type: [VacType.CANISTER, VacType.HANDHELD, VacType.UPRIGHT, VacType.ROBOTIC],
  vac_app: [VacApp.DRY, VacApp.WET_DRY],
  vac_dust: [VacDust.BAGLESS, VacDust.BAGGED],
  vac_pow: [VacPow.CORDED, VacPow.CORDLESS],
};

export function productMatchesFacets(
  product: Product,
  facets: string[],
  prebuiltGroups?: Record<string, string[]>,
): boolean {
  if (facets.length === 0) return true;

  let subcategories = subcatCache.get(product);
  if (!subcategories) {
    subcategories = product.subcategories.map((s) => s.toLowerCase());
    subcatCache.set(product, subcategories);
  }

  let cat = catCache.get(product);
  if (!cat) {
    cat = product.category.toLowerCase();
    catCache.set(product, cat);
  }

  const groups = prebuiltGroups || buildFacetGroups(facets);

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
      } else if (
        val === Placement.WALL_MOUNTED &&
        cat === ProductCategory.WATER_PURIFIER.toLowerCase() &&
        !subcategories.includes(Placement.UNDER_COUNTER)
      ) {
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

  // Fix 1 & 2: Intelligent Domain Leakage Prevention. Only clean up domain facets when switching categories.
  const catsChanged =
    newState.categories &&
    (newState.categories.length !== currentState.categories.length ||
      newState.categories.some((c) => !currentState.categories.includes(c)));
  const isAllSelected = updatedState.categories.includes('all');

  if (catsChanged && isAllSelected) {
    const allDomainFacets = new Set<string>();
    Object.values(FACET_DOMAINS).forEach((facets) => facets.forEach((f) => allDomainFacets.add(f)));
    updatedState.facets = updatedState.facets.filter((f) => !allDomainFacets.has(f));
  } else if (!isAllSelected) {
    const allowedDomainFacets = new Set<string>();
    updatedState.categories.forEach((cat) => {
      FACET_DOMAINS[cat]?.forEach((f) => allowedDomainFacets.add(f));
    });
    const allDomainFacets = new Set<string>();
    Object.values(FACET_DOMAINS).forEach((facets) => facets.forEach((f) => allDomainFacets.add(f)));
    updatedState.facets = updatedState.facets.filter((f) => !allDomainFacets.has(f) || allowedDomainFacets.has(f));
  }

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

  const handleSearchInput = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.id !== 'product-search') return;

    // Fix 4: Prevent empty search scroll hijacking
    const val = target.value.trim();
    if (val && window.location.hash !== '#products') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#products');
      window.dispatchEvent(new Event('popstate'));
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setFilterState({ query: target.value });
  }, 300);

  document.addEventListener('input', handleSearchInput);

  document.addEventListener('submit', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest('.header-search')) {
      e.preventDefault();
      document.getElementById('product-search')?.blur();

      // A11y Focus Management: Shift focus to the product grid when search is executed
      const productGrid = document.getElementById('product-grid');
      if (productGrid) {
        productGrid.setAttribute('tabindex', '-1');
        productGrid.focus({ preventScroll: true });
      }
    }
  });
}
