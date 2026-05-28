export function getCardCategory(card) {
  return card.querySelector('.product-tag')?.dataset.category || '';
}

export function getCardPrice(card) {
  const priceEl = card.querySelector('.price');
  return priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0;
}

export function sortProducts(sortType, productCards, defaultOrder) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;

  const visibleCards = Array.from(productCards).filter((c) => c.style.display !== 'none');
  const hiddenCards = Array.from(productCards).filter((c) => c.style.display === 'none');
  let sorted = visibleCards;

  if (sortType === 'price-low-high') {
    sorted.sort((a, b) => {
      const diff = getCardPrice(a) - getCardPrice(b);
      return diff === 0 ? defaultOrder.indexOf(a) - defaultOrder.indexOf(b) : diff;
    });
  } else if (sortType === 'price-high-low') {
    sorted.sort((a, b) => {
      const diff = getCardPrice(b) - getCardPrice(a);
      return diff === 0 ? defaultOrder.indexOf(a) - defaultOrder.indexOf(b) : diff;
    });
  } else {
    sorted.sort((a, b) => defaultOrder.indexOf(a) - defaultOrder.indexOf(b));
  }

  sorted.forEach((c) => productGrid.appendChild(c));
  hiddenCards.forEach((c) => productGrid.appendChild(c));
}

export function cardMatchesFacets(card, facetValues, category) {
  const subs = (card.dataset.subcategory || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim());
  const price = getCardPrice(card);

  for (const val of facetValues) {
    // Price filtering logic
    if (val === '0-10000' && price >= 10000) return false;
    if (val === '10000-15000' && (price < 10000 || price >= 15000)) return false;
    if (val === '15000-20000' && (price < 15000 || price >= 20000)) return false;
    if (val === '20000+' && price < 20000) return false;

    // Generic offers
    if (['exchange', 'free-installation', 'municipal'].includes(val)) continue;

    // Spec mappings
    const specialMappings = {
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
    if (!mapped.some((m) => subs.includes(m) || category === m)) {
      if (val === 'wall-mounted' && category === 'Water Purifier' && !subs.includes('under-counter')) continue;
      return false;
    }
  }
  return true;
}

export function applyFilters(productCards, defaultOrder) {
  const searchInput = document.getElementById('product-search');
  const desktopSort = document.getElementById('desktop-sort-select');
  const clearAllBtn = document.getElementById('filter-clear-all');
  const productGrid = document.getElementById('product-grid');

  const checkedCats = Array.from(document.querySelectorAll('.filter-cat:checked')).map((cb) => cb.value);
  const isAllSelected = checkedCats.includes('all');

  // Dynamic Sidebar Filters - Show only relevant facet groups
  document.querySelectorAll('.water-filter').forEach((el) => {
    const show = isAllSelected || checkedCats.includes('Water Purifier');
    el.style.display = show ? '' : 'none';
    if (!show) el.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = false));
  });
  document.querySelectorAll('.vacuum-filter').forEach((el) => {
    const show = isAllSelected || checkedCats.includes('Vacuum Cleaner');
    el.style.display = show ? '' : 'none';
    if (!show) el.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = false));
  });

  const activeFacets = Array.from(document.querySelectorAll('.filter-facet:checked')).map((cb) => cb.value);
  const query = (searchInput?.value || '').toLowerCase().trim();
  const searchTerms = query.split(' ').filter((t) => t.length > 0);

  let visibleCount = 0;

  productCards.forEach((card) => {
    const cat = getCardCategory(card);
    const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

    const matchesCat = isAllSelected || checkedCats.includes(cat);
    const matchesSearch =
      searchTerms.length === 0 || searchTerms.every((term) => title.includes(term) || desc.includes(term));
    const matchesFacet = activeFacets.length === 0 || cardMatchesFacets(card, activeFacets, cat);

    if (matchesCat && matchesSearch && matchesFacet) {
      card.style.display = 'flex';
      card.style.animation = 'none';
      void card.offsetWidth; // trigger reflow
      card.style.animation = `filterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Announce results to screen readers
  const announcer = document.getElementById('search-announcer');
  if (announcer) {
    announcer.textContent = `Showing ${visibleCount} product${visibleCount !== 1 ? 's' : ''}`;
  }

  // Sync Filter State to URL for easy sharing
  const url = new URL(window.location);
  if (checkedCats.length && !isAllSelected) url.searchParams.set('cat', checkedCats.join(','));
  else url.searchParams.delete('cat');
  if (activeFacets.length) url.searchParams.set('facets', activeFacets.join(','));
  else url.searchParams.delete('facets');
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  window.history.replaceState(null, '', url);

  const currentSort = desktopSort ? desktopSort.value : 'relevance';
  sortProducts(currentSort, productCards, defaultOrder);

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
      if (productGrid) productGrid.appendChild(emptyState);
      if (window.applyTranslations) window.applyTranslations(document.documentElement.lang || 'en');
    }
    emptyState.style.display = 'flex';
  } else if (emptyState) {
    emptyState.style.display = 'none';
  }

  // Update Badges and Clear All state
  if (clearAllBtn) {
    if (activeFacets.length > 0 || !isAllSelected || (searchInput && searchInput.value.length > 0)) {
      clearAllBtn.classList.add('active-filters');
    } else {
      clearAllBtn.classList.remove('active-filters');
    }
  }

  const filterBadge = document.getElementById('filter-badge');
  if (filterBadge) {
    const activeCount = activeFacets.length + (isAllSelected ? 0 : checkedCats.length);
    filterBadge.textContent = activeCount;
    filterBadge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
  }

  document.querySelectorAll('.filter-group').forEach((group) => {
    const checkedInGroup = Array.from(group.querySelectorAll('.filter-option input:checked')).filter(
      (cb) => cb.value !== 'all',
    ).length;
    const title = group.querySelector('.filter-group-title');
    if (title) {
      if (checkedInGroup > 0) title.setAttribute('data-selected-count', checkedInGroup);
      else title.removeAttribute('data-selected-count');
    }
  });

  // Category counts update
  ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'].forEach((catName) => {
    const count = Array.from(productCards).filter(
      (c) => getCardCategory(c) === catName && c.style.display !== 'none',
    ).length;
    const countEl = document.querySelector(`.filter-count[data-cat="${catName}"]`);
    if (countEl) countEl.textContent = `(${count})`;
  });
}
