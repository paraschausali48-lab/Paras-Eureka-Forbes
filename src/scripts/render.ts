import type { FilterState } from './filters';

export function applyFiltersAndSort(state: FilterState): number {
  const grid = document.getElementById('product-grid');
  if (!grid) return 0;

  const currentCards = Array.from(grid.children) as HTMLElement[];
  const { categories, facets, query, sort } = state;
  const isAllSelected = categories.includes('all');
  const searchTerms = query
    .toLowerCase()
    .trim()
    .split(' ')
    .filter((t) => t.length > 0);

  let visibleCount = 0;

  // 1. Filter elements via DOM dataset attributes
  currentCards.forEach((card) => {
    if (!card.classList.contains('product-card')) return;

    const cat = card.dataset.category || '';
    const searchString = card.dataset.search || '';
    const subcategories = (card.dataset.subcategory || '').split(',').map((s) => s.trim().toLowerCase());
    const price = parseInt(card.dataset.price || '0', 10);

    const matchesCat = isAllSelected || categories.includes(cat);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every((term) => searchString.includes(term));

    let matchesFacet = true;
    if (facets.length > 0) {
      for (const val of facets) {
        if (['0-10000', '10000-15000', '15000-20000', '20000+'].includes(val)) {
          if (val === '0-10000' && price >= 10000) {
            matchesFacet = false;
            break;
          }
          if (val === '10000-15000' && (price < 10000 || price >= 15000)) {
            matchesFacet = false;
            break;
          }
          if (val === '15000-20000' && (price < 15000 || price >= 20000)) {
            matchesFacet = false;
            break;
          }
          if (val === '20000+' && price < 20000) {
            matchesFacet = false;
            break;
          }
          continue;
        }
        if (['exchange', 'free-installation', 'municipal'].includes(val)) continue;

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
        if (!mapped.some((m) => subcategories.includes(m) || cat.toLowerCase() === m)) {
          if (val === 'wall-mounted' && cat === 'Water Purifier' && !subcategories.includes('under-counter')) continue;
          matchesFacet = false;
          break;
        }
      }
    }

    if (matchesCat && matchesSearch && matchesFacet) {
      card.style.display = '';
      card.classList.add('reveal', 'active');
      visibleCount++;
    } else {
      card.style.display = 'none';
      card.classList.remove('reveal', 'active');
    }
  });

  // 2. Sorting Logic
  const visibleCards = currentCards.filter((card) => card.style.display !== 'none');
  visibleCards.sort((a, b) => {
    if (sort === 'relevance') {
      const indexA = parseInt(a.dataset.index || '0', 10);
      const indexB = parseInt(b.dataset.index || '0', 10);
      return indexA - indexB;
    }
    const priceA = parseInt(a.dataset.price || '0', 10);
    const priceB = parseInt(b.dataset.price || '0', 10);
    return sort === 'price-low-high' ? priceA - priceB : priceB - priceA;
  });

  // Append visible cards in sorted order to the end of the grid
  visibleCards.forEach((card) => grid.appendChild(card));

  return visibleCount;
}
