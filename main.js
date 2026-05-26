document.addEventListener('DOMContentLoaded', function () {
  const productCards = document.querySelectorAll('.product-card');
  const vendorWhatsApp = '918928002642';

  // ============= FACETED FILTERING ENGINE =============
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterToggle = document.getElementById('filter-mobile-toggle');
  const filterClose = document.getElementById('filter-sidebar-close');
  const clearAllBtn = document.getElementById('filter-clear-all');

  // ============= FILTER ACCORDION LOGIC =============
  const filterToggles = document.querySelectorAll('.filter-group-toggle');
  filterToggles.forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });

  // ============= REVEAL PRODUCTS LOGIC =============
  function revealProductsSection() {
    const productsSection = document.getElementById('products');
    const filterSidebar = document.getElementById('filter-sidebar');
    if (productsSection) productsSection.style.display = '';
    if (filterSidebar) filterSidebar.style.display = '';
  }

  // ============= HEADER SCROLL EFFECT =============
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let isScrolled = false;
    window.addEventListener(
      'scroll',
      () => {
        const currentScroll = window.scrollY;
        if (!isScrolled && currentScroll > 20) {
          isScrolled = true;
          siteHeader.classList.add('scrolled');
        } else if (isScrolled && currentScroll <= 20) {
          isScrolled = false;
          siteHeader.classList.remove('scrolled');
        }
      },
      { passive: true },
    );
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'filter-overlay';
  document.body.appendChild(overlay);

  // Mobile toggle
  if (filterToggle) {
    filterToggle.addEventListener('click', function () {
      filterSidebar.classList.toggle('open');
      overlay.classList.toggle('active');
      document.body.style.overflow = filterSidebar.classList.contains('open') ? 'hidden' : '';
    });
  }
  if (filterClose) {
    filterClose.addEventListener('click', closeFilterDrawer);
  }
  overlay.addEventListener('click', closeFilterDrawer);
  function closeFilterDrawer() {
    filterSidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Parse price from card
  function getCardPrice(card) {
    const priceEl = card.querySelector('.price');
    if (!priceEl) return 0;
    return parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0;
  }

  // Get card category
  function getCardCategory(card) {
    return card.querySelector('.product-tag')?.dataset.category || '';
  }

  function getSkuCode(title) {
    return (
      'EF-' +
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toUpperCase()
    );
  }

  // Get card facets from subcategory attribute
  function getCardSubcategories(card) {
    return (card.dataset.subcategory || '')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());
  }

  // Check if card matches a facet (value)
  function cardHasFacet(card, facetValue) {
    const subs = getCardSubcategories(card);
    const cat = getCardCategory(card);
    const price = getCardPrice(card);

    // Price ranges
    if (facetValue === '0-10000') return price < 10000;
    if (facetValue === '10000-15000') return price >= 10000 && price < 15000;
    if (facetValue === '15000-20000') return price >= 15000 && price < 20000;
    if (facetValue === '20000+') return price >= 20000;

    // Category matching
    if (
      facetValue === 'Water Purifier' ||
      facetValue === 'Air Purifier' ||
      facetValue === 'Vacuum Cleaner' ||
      facetValue === 'Water Softener'
    ) {
      return cat === facetValue;
    }

    // Vacuum type mapping
    const vacTypeMap = {
      canister: ['canister'],
      handheld: ['handheld'],
      upright: ['upright', 'stick'],
      robotic: ['robotic'],
    };
    if (vacTypeMap[facetValue]) {
      return subs.some((s) => vacTypeMap[facetValue].includes(s));
    }

    // Vacuum dust collection
    const dustMap = {
      bagless: ['bagless', 'cyclonic'],
      bagged: ['bagged'],
    };
    if (dustMap[facetValue]) {
      return subs.some((s) => dustMap[facetValue].includes(s));
    }

    // Vacuum power
    const powerMap = {
      corded: ['corded'],
      cordless: ['cordless', 'battery'],
    };
    if (powerMap[facetValue]) {
      return subs.some((s) => powerMap[facetValue].includes(s));
    }

    // Vacuum application
    const appMap = {
      dry: ['dry'],
      'wet-dry': ['wet-dry'],
    };
    if (appMap[facetValue]) {
      return subs.some((s) => appMap[facetValue].includes(s));
    }

    // Features - direct subcategory match
    if (
      [
        'active-copper',
        'hot-ambient',
        'alkaline',
        'alkaline-boost',
        'alkaline-boost-active-copper',
        'food-grade plastic',
        'slim',
        'stainless-steel',
        'zero-pressure-pump',
        'mtds',
        'smart',
        'ro',
        'uv',
        'uf',
        'wall-mounted',
        'under-counter',
        'table-top',
        'small',
        'medium',
        'large',
      ].includes(facetValue)
    ) {
      if (facetValue === 'wall-mounted')
        return subs.includes('wall-mounted') || (cat === 'Water Purifier' && !subs.includes('under-counter'));
      if (facetValue === 'table-top') return subs.includes('table-top');
      if (facetValue === 'small') return subs.includes('small') || subs.includes('without-storage');
      if (facetValue === 'medium') return subs.includes('medium') || subs.includes('storage');
      if (facetValue === 'large') return subs.includes('large');
      if (facetValue === 'ro') return subs.includes('ro-uv') || subs.includes('ro-uv-uf') || subs.includes('ro');
      if (facetValue === 'uv')
        return subs.includes('uv') || subs.includes('ro-uv') || subs.includes('uv-uf') || subs.includes('ro-uv-uf');
      if (facetValue === 'uf') return subs.includes('uv-uf') || subs.includes('ro-uv-uf') || subs.includes('uf');
      return subs.includes(facetValue);
    }

    // Exchange eligible - all water purifiers are exchange-eligible
    if (facetValue === 'exchange') return cat === 'Water Purifier';
    if (facetValue === 'free-installation') return true; // All products have free installation

    // Water source - municipal compatible
    if (facetValue === 'municipal') return true; // All water purifiers work with municipal

    return subs.includes(facetValue);
  }

  // Apply all filters
  function applyFilters() {
    const checkedCats = document.querySelectorAll('.filter-cat:checked');
    const checkedFacets = document.querySelectorAll('.filter-facet:checked');
    const searchQuery = (document.getElementById('product-search')?.value || '').toLowerCase().trim();

    const allChecked = document.querySelector('.filter-cat[value="all"]:checked');

    // Calculate active filters for badge
    let activeCount = checkedFacets.length;
    if (!allChecked) {
      activeCount += checkedCats.length;
    }
    if (searchQuery) {
      activeCount += 1;
    }

    const badge = document.getElementById('filter-badge');
    const bottomNavBadge = document.getElementById('bottom-nav-filter-badge');

    if (badge) {
      if (activeCount > 0) {
        badge.textContent = activeCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (bottomNavBadge) {
      if (activeCount > 0) {
        bottomNavBadge.textContent = activeCount;
        bottomNavBadge.style.display = 'flex';
      } else {
        bottomNavBadge.style.display = 'none';
      }
    }

    if (clearAllBtn) {
      if (activeCount > 0) {
        clearAllBtn.classList.add('active-filters');
      } else {
        clearAllBtn.classList.remove('active-filters');
      }
    }

    // Get selected categories (if "all" is unchecked, use individually checked)
    let selectedCategories = [];
    if (allChecked) {
      selectedCategories = ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'];
    } else {
      checkedCats.forEach((cb) => {
        if (cb.value !== 'all') selectedCategories.push(cb.value);
      });
    }

    // Sync Visual Image Filters
    const visualFilters = document.querySelectorAll('.visual-filter-btn');
    if (visualFilters.length > 0) {
      visualFilters.forEach((btn) => btn.classList.remove('active'));
      const activeFacetsList = Array.from(checkedFacets).map((cb) => cb.value);

      if (activeFacetsList.length === 1 && selectedCategories.length === 1) {
        const btn = document.querySelector(`.visual-filter-btn[data-filter="${activeFacetsList[0]}"]`);
        if (btn) btn.classList.add('active');
      } else if (activeFacetsList.length === 0 && selectedCategories.length === 1) {
        const btn = document.querySelector(
          `.visual-filter-btn[data-filter="${selectedCategories[0]}"], .visual-filter-btn[data-nav-category="${selectedCategories[0]}"]`,
        );
        if (btn) btn.classList.add('active');
      }
    }

    // Gather active facet values grouped by their facet type (e.g., 'price', 'tech', 'storage')
    const activeFacetGroups = {};
    checkedFacets.forEach((cb) => {
      const facetType = cb.dataset.facet;
      if (!activeFacetGroups[facetType]) {
        activeFacetGroups[facetType] = [];
      }
      activeFacetGroups[facetType].push(cb.value);
    });

    // Show/hide products
    let visibleCount = 0;
    const toShow = [];
    const toHide = [];
    productCards.forEach((card) => {
      const cat = getCardCategory(card);

      // Check category
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(cat);

      // Check all active facets using Advanced Faceted Logic (AND between groups, OR within groups)
      let matchesFacets = true;
      const facetKeys = Object.keys(activeFacetGroups);

      if (facetKeys.length > 0) {
        matchesFacets = facetKeys.every((key) => {
          const groupValues = activeFacetGroups[key];
          // Card must match at least ONE of the selected values in THIS specific group
          return groupValues.some((val) => cardHasFacet(card, val));
        });
      }

      // Check search query (Advanced multi-word search)
      let matchesSearch = true;
      if (searchQuery) {
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

        const searchTerms = searchQuery.split(' ').filter((term) => term.trim().length > 0);
        matchesSearch = searchTerms.every((term) => title.includes(term) || desc.includes(term));
      }

      const show = matchesCategory && matchesFacets && matchesSearch;
      if (show) {
        toShow.push(card);
        visibleCount++;
      } else {
        toHide.push(card);
      }
    });

    // Batch DOM writes to prevent layout thrashing
    toHide.forEach((card) => (card.style.display = 'none'));
    toShow.forEach((card) => {
      card.style.display = 'flex';
      card.style.animation = 'none';
    });

    // Advanced UI: Handle Empty State
    let emptyState = document.getElementById('empty-state-message');
    const productGrid = document.getElementById('product-grid');
    if (visibleCount === 0) {
      if (!emptyState && productGrid) {
        emptyState = document.createElement('div');
        emptyState.id = 'empty-state-message';
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-gray-400); margin-bottom: 16px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search query to find what you're looking for.</p>
          <button type="button" class="btn btn-outline filter-clear-all-empty" style="margin-top: 20px; border-color: var(--color-primary); color: var(--color-primary); padding: 10px 24px;">Clear All Filters</button>
        `;
        productGrid.parentNode.insertBefore(emptyState, productGrid);

        emptyState.querySelector('.filter-clear-all-empty').addEventListener('click', () => {
          if (clearAllBtn) clearAllBtn.click();
        });
      }
      if (emptyState) emptyState.style.display = 'flex';
      if (productGrid) productGrid.style.display = 'none';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (productGrid) productGrid.style.display = ''; // Restore grid layout
    }

    // Restart animations cleanly in the next frame
    requestAnimationFrame(() => {
      toShow.forEach((card, idx) => {
        card.style.animation = `filterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards ${Math.min(idx, 15) * 0.04}s`;
      });
    });

    // Update category counts
    ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'].forEach((cat) => {
      const count = Array.from(productCards).filter(
        (c) => getCardCategory(c) === cat && c.style.display !== 'none',
      ).length;
      const countEl = document.querySelector(`.filter-count[data-cat="${cat}"]`);
      if (countEl) countEl.textContent = `(${count})`;
    });

    // Update individual filter group bubble counters
    document.querySelectorAll('.filter-group').forEach((group) => {
      const checkedCount = Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).filter(
        (cb) => cb.value !== 'all',
      ).length;
      const title = group.querySelector('.filter-group-title');
      if (title) title.setAttribute('data-selected-count', checkedCount);
    });

    // Announce to screen readers
    const announcer = document.getElementById('search-announcer');
    if (announcer) {
      announcer.textContent = `Showing ${visibleCount} products.`;
    }
  }

  // Category checkbox logic (mutually exclusive with "all")
  document.querySelectorAll('.filter-cat').forEach((cb) => {
    cb.addEventListener('change', function () {
      if (this.value === 'all' && this.checked) {
        // Uncheck all other categories
        document.querySelectorAll('.filter-cat').forEach((c) => {
          if (c.value !== 'all') c.checked = false;
        });
      } else if (this.value !== 'all') {
        // If any specific category is checked, uncheck "all"
        document.querySelector('.filter-cat[value="all"]').checked = false;
      }

      // Show/hide water/vacuum specific filters
      const waterFilters = document.querySelectorAll('.water-filter');
      const vacuumFilters = document.querySelectorAll('.vacuum-filter');
      const hasWater = document.querySelector('.filter-cat[value="Water Purifier"]:checked');
      const hasVacuum = document.querySelector('.filter-cat[value="Vacuum Cleaner"]:checked');
      const allCats = document.querySelector('.filter-cat[value="all"]:checked');

      waterFilters.forEach((el) => (el.style.display = allCats || hasWater ? '' : 'none'));
      vacuumFilters.forEach((el) => (el.style.display = allCats || hasVacuum ? '' : 'none'));

      applyFilters();
    });
  });

  // Facet checkbox change
  document.querySelectorAll('.filter-facet').forEach((cb) => {
    cb.addEventListener('change', applyFilters);
  });

  // Debounce utility to prevent layout thrashing on fast typing
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Search input event listener
  const searchInput = document.getElementById('product-search');
  const searchBtn = document.querySelector('.header-search button');
  let searchTimeout;

  function executeSearchAndScroll() {
    if (!searchInput) return;
    clearTimeout(searchTimeout); // Prevent double-execution

    revealProductsSection();
    applyFilters();

    const productsSection = document.getElementById('products');
    if (productsSection) {
      const y = productsSection.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      revealProductsSection();
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        applyFilters();

        // Auto-scroll if products section isn't fully in view
        const productsSection = document.getElementById('products');
        if (productsSection) {
          const rect = productsSection.getBoundingClientRect();
          if (rect.top > window.innerHeight * 0.6 || rect.bottom < 0) {
            window.scrollTo({ top: rect.top + window.scrollY - 120, behavior: 'smooth' });
          }
        }
      }, 300);
    });

    // Handle 'Enter' key press
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearchAndScroll();
      }
    });
  }

  // Handle Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', function (e) {
      e.preventDefault();
      executeSearchAndScroll();
    });
  }

  // Clear all
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function () {
      document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
      document.querySelector('.filter-cat[value="all"]').checked = true;
      document.querySelectorAll('.water-filter').forEach((el) => (el.style.display = ''));
      document.querySelectorAll('.vacuum-filter').forEach((el) => (el.style.display = ''));

      const vfMain = document.getElementById('vf-main');
      if (vfMain) {
        document.getElementById('vf-water').style.display = 'none';
        document.getElementById('vf-vacuum').style.display = 'none';
        vfMain.style.display = 'flex';
      }

      if (searchInput) {
        searchInput.value = '';
      }
      applyFilters();
    });
  }

  // Visual Filters Click Logic
  const visualFilters = document.querySelectorAll('.visual-filter-btn');
  if (visualFilters.length > 0) {
    visualFilters.forEach((btn) => {
      btn.addEventListener('click', function () {
        revealProductsSection();

        // Handle Top-Level Navigation to Sub-Filters
        if (this.hasAttribute('data-nav-category')) {
          const cat = this.dataset.navCategory;
          const vfMain = document.getElementById('vf-main');
          const vfWater = document.getElementById('vf-water');
          const vfVacuum = document.getElementById('vf-vacuum');

          if (vfMain) vfMain.style.display = 'none';
          if (cat === 'Water Purifier' && vfWater) vfWater.style.display = 'flex';
          if (cat === 'Vacuum Cleaner' && vfVacuum) vfVacuum.style.display = 'flex';

          document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
          const searchInput = document.getElementById('product-search');
          if (searchInput) searchInput.value = '';

          const catCb = document.querySelector(`.filter-cat[value="${cat}"]`);
          if (catCb) catCb.checked = true;

          const hasWater = cat === 'Water Purifier';
          const hasVacuum = cat === 'Vacuum Cleaner';
          document.querySelectorAll('.water-filter').forEach((el) => (el.style.display = hasWater ? '' : 'none'));
          document.querySelectorAll('.vacuum-filter').forEach((el) => (el.style.display = hasVacuum ? '' : 'none'));

          applyFilters();
          const productsSection = document.getElementById('products');
          if (productsSection) {
            const y = productsSection.getBoundingClientRect().top + window.scrollY - 150;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
          return; // Stop standard filter logic
        }

        const filterVal = this.dataset.filter;

        // Clear all existing checkbox filters
        document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
        const searchInput = document.getElementById('product-search');
        if (searchInput) searchInput.value = '';

        const mainCategories = ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'];

        if (mainCategories.includes(filterVal)) {
          const catCb = document.querySelector(`.filter-cat[value="${filterVal}"]`);
          if (catCb) catCb.checked = true;
        } else {
          // Determine if facet belongs to Vacuum or Water Purifier
          const vacuumFacets = ['robotic', 'canister', 'handheld', 'wet-dry'];
          if (vacuumFacets.includes(filterVal)) {
            document.querySelector('.filter-cat[value="Vacuum Cleaner"]').checked = true;
          } else {
            document.querySelector('.filter-cat[value="Water Purifier"]').checked = true;
          }

          const facetCb = document.querySelector(`.filter-facet[value="${filterVal}"]`);
          if (facetCb) facetCb.checked = true;
        }

        const hasWater = document.querySelector('.filter-cat[value="Water Purifier"]:checked');
        const hasVacuum = document.querySelector('.filter-cat[value="Vacuum Cleaner"]:checked');
        const allCats = document.querySelector('.filter-cat[value="all"]:checked');

        document
          .querySelectorAll('.water-filter')
          .forEach((el) => (el.style.display = allCats || hasWater ? '' : 'none'));
        document
          .querySelectorAll('.vacuum-filter')
          .forEach((el) => (el.style.display = allCats || hasVacuum ? '' : 'none'));

        applyFilters();

        // Auto-scroll to the product section so the user can see the filtered results
        const productsSection = document.getElementById('products');
        if (productsSection) {
          const y = productsSection.getBoundingClientRect().top + window.scrollY - 150;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }

  // Back Button Logic for Visual Filters
  const backBtns = document.querySelectorAll('.vf-back-btn');
  if (backBtns.length > 0) {
    backBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        document.getElementById('vf-water').style.display = 'none';
        document.getElementById('vf-vacuum').style.display = 'none';
        document.getElementById('vf-main').style.display = 'flex';

        document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
        document.querySelector('.filter-cat[value="all"]').checked = true;
        document.querySelectorAll('.water-filter').forEach((el) => (el.style.display = ''));
        document.querySelectorAll('.vacuum-filter').forEach((el) => (el.style.display = ''));

        applyFilters();
      });
    });
  }

  // Initial filter run & Cross-Page Search Routing
  setTimeout(() => {
    applyFilters();

    const urlParams = new URLSearchParams(window.location.search);
    const searchQueryParam = urlParams.get('q');
    if (searchQueryParam && searchInput) {
      searchInput.value = searchQueryParam;
      executeSearchAndScroll();
    }
  }, 50);

  // ============= END FACETED FILTERING =============

  // Accessibility: Make product cards keyboard navigable
  productCards.forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // ============= DYNAMIC META TAGS FOR SEO & BROWSER TABS =============
  const originalMeta = {
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content || '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
    ogDesc: document.querySelector('meta[property="og:description"]')?.content || '',
    ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
  };

  function updateMetaTags(title, desc, image) {
    // Update Browser Tab Title
    document.title = title ? `${title} | Eureka Forbes Specialist` : originalMeta.title;

    const updateTag = (selector, attr, content) => {
      const tag = document.querySelector(selector);
      if (tag && content) {
        tag.setAttribute(attr, content);
      }
    };

    // Update Meta Tags
    updateTag('meta[name="description"]', 'content', desc || originalMeta.desc);
    updateTag('meta[property="og:title"]', 'content', title || originalMeta.ogTitle);
    updateTag('meta[property="og:description"]', 'content', desc || originalMeta.ogDesc);

    updateTag('meta[property="og:image"]', 'content', image || originalMeta.ogImage);
  }

  function updateProductSchema(title, sku, price, image, description) {
    let schemaScript = document.getElementById('dynamic-product-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'dynamic-product-schema';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: title,
      image: image,
      description: description,
      sku: sku,
      brand: {
        '@type': 'Brand',
        name: 'Eureka Forbes',
      },
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'INR',
        price: price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    });
  }

  function getCardCtaLabelKey(category) {
    switch (category) {
      case 'Water Purifier':
        return 'btn_check_suitability';
      case 'Water Softener':
        return 'btn_check_hard_water';
      case 'Vacuum Cleaner':
        return 'btn_get_best_offer';
      case 'Air Purifier':
        return 'btn_get_recommendation';
      default:
        return 'btn_get_details';
    }
  }

  function getModalActions(category, title, isOutOfStock = false) {
    const stockMsg = isOutOfStock
      ? ' I understand it is currently out of stock, could you let me know when it will be available?'
      : '';

    switch (category) {
      case 'Water Purifier':
        return [
          {
            label: 'Book Free TDS Test',
            message: `Hello Paras, I am interested in ${title}.${stockMsg} Please help me book a free TDS test and check if this purifier is suitable for my home water.`,
          },
          {
            label: 'Check Exchange Value',
            secondary: true,
            message: `Hello Paras, I want to exchange my old water purifier for the ${title}.${stockMsg} Please let me know the exchange value and offers.`,
          },
        ];
      case 'Water Softener':
        return [
          {
            label: 'Book Hard Water Check',
            message: `Hello Paras, I am interested in ${title}.${stockMsg} Please help me check if this water softener is suitable for my hard water issue and home usage.`,
          },
        ];
      case 'Vacuum Cleaner':
        return [
          {
            label: 'Book Home Demo',
            isDemo: true,
            productTitle: title,
          },
          {
            label: 'Get Best Offer on WhatsApp',
            secondary: true,
            message: `Hello Paras, I am interested in ${title}.${stockMsg} Please share the best current offer and demo availability.`,
          },
        ];
      case 'Air Purifier':
        return [
          {
            label: 'Check Room Coverage',
            message: `Hello Paras, I am interested in ${title}.${stockMsg} Please help me check if it is suitable for my room size and air quality needs.`,
          },
        ];
      default:
        return [
          {
            label: 'Get Details on WhatsApp',
            message: `Hello Paras, I am interested in ${title}.${stockMsg} Please share details, offer, and availability.`,
          },
        ];
    }
  }

  function openWhatsAppMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_message', { event_category: 'WhatsApp', event_label: 'Product Inquiry Modal' });
    }
    window.open(`https://wa.me/${vendorWhatsApp}?text=${encodedMessage}`, '_blank');
  }

  function createModalActionButton(action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.className = action.secondary ? 'product-btn product-btn-secondary' : 'product-btn';
    button.addEventListener('click', function () {
      if (action.isDemo) {
        const demoModal = document.getElementById('demo-modal');
        const demoProduct = document.getElementById('demo-product-name');
        if (demoModal && demoProduct) {
          demoProduct.textContent = `Product: ${action.productTitle}`;
          demoModal.classList.add('active');
        }
      } else {
        openWhatsAppMessage(action.message);
      }
    });
    return button;
  }

  function updateProductActionLabels() {
    const lang = document.documentElement.lang || 'en';
    productCards.forEach((card) => {
      const category = getCardCategory(card);
      let button = card.querySelector('.product-btn:not(.exchange-btn)');
      if (!button) {
        button = card.querySelector(':scope > .product-btn');
      }
      if (!button) return;

      const key = getCardCtaLabelKey(category);
      button.setAttribute('data-i18n', key);
      button.setAttribute('href', '#');

      if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
        button.textContent = translations[lang][key];
      }

      // Add Exchange Button for Water Purifiers dynamically
      if (category === 'Water Purifier' && !card.querySelector('.exchange-btn')) {
        const exchangeBtn = document.createElement('button');
        exchangeBtn.type = 'button';
        exchangeBtn.className = 'product-btn product-btn-secondary exchange-btn';

        const exchangeLabel =
          typeof translations !== 'undefined' && translations[lang] && translations[lang]['btn_exchange']
            ? translations[lang]['btn_exchange']
            : 'Exchange Offer';

        exchangeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; flex-shrink:0;"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg><span data-i18n="btn_exchange">${exchangeLabel}</span>`;

        exchangeBtn.addEventListener('click', function (e) {
          e.stopPropagation(); // prevent modal from opening
          const title = card.querySelector('h3')?.textContent || '';
          const isOutOfStock = card.classList.contains('out-of-stock');
          const stockMsg = isOutOfStock
            ? ' I understand it is currently out of stock, could you let me know when it will be available?'
            : '';
          const message = `Hello Paras, I want to exchange my old water purifier for the ${title}.${stockMsg} Please let me know the exchange value and offers.`;
          const waUrl = `https://wa.me/${vendorWhatsApp}?text=${encodeURIComponent(message)}`;

          if (typeof gtag === 'function') {
            gtag('event', 'exchange_click', { event_category: 'WhatsApp', event_label: title });
          }
          window.open(waUrl, '_blank');
        });

        if (!button.parentElement.classList.contains('card-actions')) {
          const actionsContainer = document.createElement('div');
          actionsContainer.className = 'card-actions';
          button.parentNode.insertBefore(actionsContainer, button);
          actionsContainer.appendChild(button);
        }
        button.parentElement.appendChild(exchangeBtn);
      }
    });
  }

  function createProductImagePlaceholder(card) {
    const existingPlaceholder = card.querySelector('.product-image-placeholder');
    if (existingPlaceholder) return existingPlaceholder;

    const title = card.querySelector('h3')?.textContent || 'Product image coming soon';
    const category = card.querySelector('.product-tag')?.textContent || 'Eureka Forbes';
    const placeholder = document.createElement('div');
    placeholder.className = 'product-image-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', `${title} image coming soon`);
    placeholder.innerHTML = `
        <span class="placeholder-brand">${category}</span>
        <strong>${title}</strong>
        <span>Image coming soon</span>
    `;

    const image = card.querySelector(':scope > img');
    if (image) {
      image.insertAdjacentElement('afterend', placeholder);
    } else {
      card.insertBefore(placeholder, card.firstChild);
    }

    return placeholder;
  }

  function applyProductImageFallbacks() {
    productCards.forEach((card) => {
      const image = card.querySelector(':scope > img');
      if (!image) {
        createProductImagePlaceholder(card);
        return;
      }

      image.addEventListener(
        'error',
        function () {
          this.classList.add('image-missing');
          createProductImagePlaceholder(card);
        },
        { once: true },
      );

      if (image.complete && image.naturalWidth === 0) {
        image.classList.add('image-missing');
        createProductImagePlaceholder(card);
      }
    });
  }

  // 1. Inject Prices and Calculate Discounts dynamically
  function processPricingAndDiscounts() {
    productCards.forEach((card) => {
      let priceEl = card.querySelector('.price');
      let mrpEl = card.querySelector('.mrp');

      if (!priceEl) return;

      const mopValue = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
      if (!mopValue) return;

      let mrpValue = 0;

      // Ensure MRP element exists, if not generate a fallback
      if (!mrpEl) {
        const explicitMrp = parseInt(priceEl.dataset.mrp && priceEl.dataset.mrp.replace(/[^0-9]/g, ''));
        mrpValue = explicitMrp || Math.ceil((mopValue * 1.2) / 500) * 500;

        const priceInfo = document.createElement('div');
        priceInfo.className = 'price-info';

        mrpEl = document.createElement('div');
        mrpEl.className = 'mrp';
        mrpEl.textContent = `MRP ₹${mrpValue.toLocaleString('en-IN')}`;

        priceEl.textContent = `MOP ₹${mopValue.toLocaleString('en-IN')}`;
        priceEl.parentNode.insertBefore(priceInfo, priceEl);
        priceInfo.appendChild(mrpEl);
        priceInfo.appendChild(priceEl);
      } else {
        mrpValue = parseInt(mrpEl.textContent.replace(/[^0-9]/g, ''));
      }

      // Calculate and Inject Discount Badge
      if (mrpValue > mopValue && mopValue > 0 && !card.querySelector('.discount-badge')) {
        const discount = Math.round(((mrpValue - mopValue) / mrpValue) * 100);

        if (discount > 0) {
          const badge = document.createElement('span');
          badge.className = 'discount-badge';
          badge.textContent = `${discount}% OFF`;

          // Create a wrapper for MRP and Badge to sit side-by-side
          if (!mrpEl.parentElement.classList.contains('mrp-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'mrp-wrapper';
            mrpEl.parentNode.insertBefore(wrapper, mrpEl);
            wrapper.appendChild(mrpEl);
            wrapper.appendChild(badge);
          }
        }
      }
    });
  }

  function getSkuSlugFromCard(card) {
    const img = card.querySelector('img');
    if (img && img.getAttribute('src')) {
      const match = img.getAttribute('src').match(/images\/([^\/]+)\//);
      if (match && match[1]) {
        return match[1];
      }
    }
    const titleEl = card.querySelector('h3');
    if (!titleEl) return '';
    return titleEl.textContent
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function buildModalGalleryOnDemand(card, galleryContainer) {
    const galleryCount = parseInt(card.getAttribute('data-gallery-count') || '1');
    const skuSlug = getSkuSlugFromCard(card);
    const imgExt = 'webp';

    if (!skuSlug || galleryCount < 1) {
      console.warn('[Gallery] Invalid gallery data for card:', card);
      return;
    }

    // Create main display image area
    const mainDisplay = document.createElement('div');
    mainDisplay.className = 'pdp-main-image-container';

    const mainImg = document.createElement('img');
    mainImg.className = 'pdp-main-image';
    mainImg.src = `images/${skuSlug}/1.${imgExt}`;
    mainImg.alt = card.querySelector('h3')?.textContent || 'Product image';
    mainImg.onerror = function () {
      mainDisplay.classList.add('image-unavailable');
      mainDisplay.innerHTML = `
        <div class="pdp-image-placeholder">
            <span>${card.querySelector('.product-tag')?.textContent || 'Eureka Forbes'}</span>
            <strong>${card.querySelector('h3')?.textContent || 'Product image'}</strong>
            <small>Product image coming soon</small>
        </div>
        `;
    };
    mainDisplay.appendChild(mainImg);
    galleryContainer.appendChild(mainDisplay);

    // Create thumbnail strip container
    const thumbStrip = document.createElement('div');
    thumbStrip.className = 'pdp-thumb-strip';

    // Generate thumbnails for images 1 through galleryCount
    for (let i = 1; i <= galleryCount; i++) {
      const thumbWrapper = document.createElement('div');
      thumbWrapper.className = 'pdp-thumb-wrapper';

      const thumb = document.createElement('img');
      thumb.className = 'pdp-thumb';
      thumb.dataset.index = i;
      thumb.dataset.src = `images/${skuSlug}/${i}.${imgExt}`;
      thumb.alt = `${card.querySelector('h3')?.textContent} - Image ${i}`;
      thumb.loading = 'lazy'; // Native lazy loading for thumbnails
      thumb.src = thumb.dataset.src;

      // Mark first image as active
      if (i === 1) {
        thumbWrapper.classList.add('active');
      }

      // Error handling: Hide thumb if image doesn't exist (e.g., image 14 out of 20)
      thumb.onerror = function () {
        this.style.display = 'none';
        this.parentElement.style.display = 'none';
        console.debug(`[Gallery] Image not found: images/${skuSlug}/${i}.${imgExt}`);
      };

      // Click handler: Update main image when thumbnail is clicked
      thumb.onclick = function () {
        // Update main image
        mainImg.src = this.dataset.src;

        // Update active state
        thumbStrip.querySelectorAll('.pdp-thumb-wrapper').forEach((w) => w.classList.remove('active'));
        thumbWrapper.classList.add('active');
      };

      thumbWrapper.appendChild(thumb);
      thumbStrip.appendChild(thumbWrapper);
    }

    galleryContainer.appendChild(thumbStrip);

    // Store reference to main image for later use
    galleryContainer._mainImage = mainImg;
  }

  function cleanupModalGallery(galleryContainer) {
    // Remove all child elements
    galleryContainer.innerHTML = '';
    // Clear any stored references
    galleryContainer._mainImage = null;
  }

  // Generates a single ItemList schema containing all products on page load
  function generateAllProductsSchema() {
    const itemListElements = [];
    const baseUrl = window.location.href.split('#')[0];

    productCards.forEach((card, index) => {
      const title = card.querySelector('h3')?.textContent || '';
      if (!title) return;

      const sku = getSkuCode(title);
      const rawPrice = card.querySelector('.price')
        ? card.querySelector('.price').textContent.replace(/[^0-9]/g, '')
        : '0';
      const imgSrc = card.querySelector('img') ? card.querySelector('img').src : '';
      const descText = card.querySelector('p') ? card.querySelector('p').textContent : title;

      itemListElements.push({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: title,
          image: imgSrc,
          description: descText,
          sku: sku,
          brand: {
            '@type': 'Brand',
            name: 'Eureka Forbes',
          },
          offers: {
            '@type': 'Offer',
            url: baseUrl + '#' + sku,
            priceCurrency: 'INR',
            price: rawPrice,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        },
      });
    });

    if (itemListElements.length > 0) {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'catalog-schema';
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'ItemList',
        itemListElement: itemListElements,
      });
      document.head.appendChild(schemaScript);
    }
  }

  // Generates FAQ Schema for Rich Snippets in Google Search
  function generateFaqSchema() {
    const faqItems = document.querySelectorAll('.faq-item');
    const mainEntity = [];

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question-text')?.textContent;
      const answer = item.querySelector('.faq-answer-content')?.textContent;
      if (question && answer) {
        mainEntity.push({
          '@type': 'Question',
          name: question.trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer.trim(),
          },
        });
      }
    });

    if (mainEntity.length > 0) {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'faq-schema';
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: mainEntity,
      });
      document.head.appendChild(schemaScript);
    }
  }

  // Run initial setup - ONLY inject MRP labels
  // NOTE: Gallery preloading removed for performance optimization
  // Galleries are now built on-demand when modal opens
  processPricingAndDiscounts();
  applyProductImageFallbacks();
  updateProductActionLabels();

  // Defer heavy SEO schema generation to avoid blocking the main thread during initial page load
  setTimeout(() => {
    generateAllProductsSchema();
    generateFaqSchema();
  }, 1500);

  // Make product cards act like real links for professional behavior
  function enhanceProductCardsWithLinks() {
    productCards.forEach((card) => {
      const titleEl = card.querySelector('h3');
      if (!titleEl || titleEl.querySelector('a')) return;
      const title = titleEl.textContent;
      const sku = getSkuCode(title);
      const link = document.createElement('a');
      link.href = '#' + sku;
      link.className = 'product-card-link';
      link.textContent = title;
      titleEl.textContent = '';
      titleEl.appendChild(link);
    });
  }
  enhanceProductCardsWithLinks();

  // Professional Modal Logic (Optimized: On-Demand Gallery Injection)
  const pdpModal = document.getElementById('pdp-modal');
  const modalGallery = document.getElementById('pdp-gallery');
  let lastFocusedElement = null;

  productCards.forEach((card) => {
    card.addEventListener('click', function (e) {
      // Let the browser handle standard middle-click/ctrl-click for opening in a new tab
      if (e.ctrlKey || e.metaKey || e.button === 1) return;

      const cardButton = e.target.closest('.product-btn');
      if (cardButton) {
        e.preventDefault();
      } else if (e.target.closest('a.product-card-link')) {
        e.preventDefault(); // Handle it manually in this script
      } else if (e.target.closest('a')) {
        return;
      }

      // Store focus for accessibility restoration later
      lastFocusedElement = this;

      // Grab details from the card
      const title = this.querySelector('h3').textContent;
      const category = this.querySelector('.product-tag').textContent;
      const categoryKey = getCardCategory(this);
      const priceHTML = this.querySelector('.price-info') ? this.querySelector('.price-info').innerHTML : '';

      const hiddenSpecs = this.querySelector('.hidden-specs');

      const specsHTML = hiddenSpecs
        ? hiddenSpecs.innerHTML
        : '<ul><li><strong>Brand:</strong> Eureka Forbes</li><li><strong>Warranty:</strong> 1 Year</li></ul>';

      // Generate SKU from product name
      const sku = getSkuCode(title);

      // Put the text into the modal
      document.getElementById('pdp-title').textContent = title;
      document.getElementById('pdp-category').textContent = category;
      document.getElementById('pdp-sku').querySelector('span').textContent = sku;
      document.getElementById('pdp-price').innerHTML = priceHTML;

      // Extract details for schema
      const rawPrice = this.querySelector('.price')
        ? this.querySelector('.price').textContent.replace(/[^0-9]/g, '')
        : '0';
      const imgSrc = this.querySelector('img') ? this.querySelector('img').src : '';
      const descText = this.querySelector('p') ? this.querySelector('p').textContent : title;

      // Inject dynamic schema
      updateProductSchema(title, sku, rawPrice, imgSrc, descText);

      // Update URL Hash for direct linking (unless triggered by hashchange)
      if (!this.hasAttribute('data-hash-triggered')) {
        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, '#' + sku);
        }
      }
      this.removeAttribute('data-hash-triggered');

      // Update Browser Metadata
      updateMetaTags(title, descText, imgSrc);

      document.getElementById('pdp-specs').innerHTML = specsHTML;

      // PERFORMANCE OPTIMIZATION: Build gallery on-demand instead of cloning pre-built thumbnails
      // This is the KEY change - images 2-20 are ONLY fetched when user clicks to open modal
      cleanupModalGallery(modalGallery); // Ensure clean state
      buildModalGalleryOnDemand(this, modalGallery);

      const btnContainer = document.getElementById('pdp-action-btn');
      btnContainer.innerHTML = '';

      // Align buttons side by side
      btnContainer.style.display = 'flex';
      btnContainer.style.gap = '10px';
      btnContainer.style.flexWrap = 'wrap';

      const isOutOfStock = this.classList.contains('out-of-stock');

      getModalActions(categoryKey, title, isOutOfStock).forEach((action) => {
        btnContainer.appendChild(createModalActionButton(action));
      });

      const leafletUrl = this.dataset.leaflet;
      if (leafletUrl) {
        const leafletBtn = document.createElement('a');
        leafletBtn.href = leafletUrl;
        leafletBtn.target = '_blank';
        leafletBtn.rel = 'noopener noreferrer';
        leafletBtn.textContent = 'View Product Leaflet';
        leafletBtn.className = 'product-btn product-btn-secondary';
        btnContainer.appendChild(leafletBtn);
      }

      // Add Unified Native Share Button
      const nativeShareBtn = document.createElement('button');
      nativeShareBtn.type = 'button';
      nativeShareBtn.className = 'product-btn product-btn-secondary';
      const lang = document.documentElement.lang || 'en';
      const shareLabel = 'Share';

      nativeShareBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span>${shareLabel}</span>`;

      nativeShareBtn.addEventListener('click', async function () {
        const baseUrl = window.location.href.split('#')[0];
        const productUrl = `${baseUrl}#${sku}`;
        if (navigator.share) {
          try {
            await navigator.share({ title: title, text: `Check out ${title}`, url: productUrl });
            if (typeof gtag === 'function')
              gtag('event', 'share', { event_category: 'Engagement', event_label: title, method: 'Native Share' });
          } catch (err) {
            console.log('Share canceled or failed.', err);
          }
        } else {
          navigator.clipboard.writeText(productUrl).then(() => {
            const span = nativeShareBtn.querySelector('span');
            const originalText = span.textContent;
            span.textContent = 'Link Copied!';
            setTimeout(() => {
              span.textContent = originalText;
            }, 2000);
          });
        }
      });
      btnContainer.appendChild(nativeShareBtn);

      // Add Wishlist Button
      const wishlistBtn = document.createElement('button');
      wishlistBtn.type = 'button';
      wishlistBtn.className = 'product-btn product-btn-secondary';

      const getWishlist = () => JSON.parse(localStorage.getItem('ef_wishlist') || '[]');

      const updateWishlistUI = (wished) => {
        wishlistBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${wished ? '#e63946' : 'none'}" stroke="${wished ? '#e63946' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span>${wished ? 'Saved' : 'Wishlist'}</span>`;
        if (wished) {
          wishlistBtn.style.color = '#e63946';
          wishlistBtn.style.borderColor = '#e63946';
          wishlistBtn.style.background = '#fff0f2';
        } else {
          wishlistBtn.style.color = '';
          wishlistBtn.style.borderColor = '';
          wishlistBtn.style.background = '';
        }
      };

      let currentWished = getWishlist().includes(sku);
      updateWishlistUI(currentWished);

      wishlistBtn.addEventListener('click', function () {
        let wishlist = getWishlist();
        const index = wishlist.indexOf(sku);
        if (index > -1) {
          wishlist.splice(index, 1);
          currentWished = false;
          showToast('Removed from Wishlist', false);
        } else {
          wishlist.push(sku);
          currentWished = true;
          showToast('Added to Wishlist!', true);
        }
        localStorage.setItem('ef_wishlist', JSON.stringify(wishlist));
        updateWishlistUI(currentWished);
        if (typeof updateWishlistBadgeDisplay === 'function') updateWishlistBadgeDisplay();
      });
      btnContainer.appendChild(wishlistBtn);

      // Show the modal
      pdpModal.classList.add('active');
      pdpModal.scrollTop = 0; // Scroll to top for the full-page view
      document.body.style.overflow = 'hidden';

      // Focus the close button for accessibility
      setTimeout(() => {
        const closeBtn = pdpModal.querySelector('.pdp-close');
        if (closeBtn) closeBtn.focus();
      }, 100);
    });
  });

  // Handle closing of the Demo Form Modal
  const demoModal = document.getElementById('demo-modal');
  document.querySelector('.demo-close').addEventListener('click', () => {
    demoModal.classList.remove('active');
  });
  demoModal.addEventListener('click', (e) => {
    if (e.target === demoModal) {
      demoModal.classList.remove('active');
    }
  });

  // Handle sending the Demo Form to WhatsApp
  document.getElementById('demo-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('demo-name').value;
    const phone = document.getElementById('demo-phone').value;
    const email = document.getElementById('demo-email').value;
    const address = document.getElementById('demo-address').value;
    const product = document.getElementById('demo-product-name').textContent.replace('Product: ', '');

    const message = `*Free Demo Request*\n\n*Product:* ${product}\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n*Address:* ${address}`;
    const encodedMessage = encodeURIComponent(message);

    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', { event_category: 'WhatsApp', event_label: 'Demo Request' });
    }

    const waUrl = `https://wa.me/${vendorWhatsApp}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');

    demoModal.classList.remove('active');
    this.reset();
  });

  // ============= TOAST NOTIFICATION LOGIC =============
  function showToast(message, isAdded = true) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';

    const icon = isAdded
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="#e63946" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path><line x1="18" y1="6" x2="6" y2="18"></line></svg>';

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============= WISHLIST MODAL LOGIC =============
  const wishlistModal = document.getElementById('wishlist-modal');
  const wishlistContainer = document.getElementById('wishlist-items-container');
  const wishlistToggleBtns = document.querySelectorAll('.wishlist-toggle-btn');
  const wishlistClearAllBtn = document.getElementById('wishlist-clear-all');

  function updateWishlistBadgeDisplay() {
    const wishlist = JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
    const badges = document.querySelectorAll('.wishlist-badge');
    badges.forEach((badge) => {
      badge.style.display = wishlist.length > 0 ? 'block' : 'none';
    });
  }
  updateWishlistBadgeDisplay();

  function renderWishlist() {
    if (!wishlistContainer) return;
    wishlistContainer.innerHTML = '';
    const wishlist = JSON.parse(localStorage.getItem('ef_wishlist') || '[]');

    if (wishlist.length === 0) {
      if (wishlistClearAllBtn) wishlistClearAllBtn.style.display = 'none';
      wishlistContainer.innerHTML = `
        <div class="wishlist-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <p>Your wishlist is currently empty.</p>
        </div>`;
      return;
    }

    if (wishlistClearAllBtn) wishlistClearAllBtn.style.display = 'block';

    wishlist.forEach((sku) => {
      const originalCard = Array.from(productCards).find((card) => {
        const title = card.querySelector('h3')?.textContent || '';
        return getSkuCode(title) === sku;
      });

      if (originalCard) {
        const title = originalCard.querySelector('h3').textContent;
        const price = originalCard.querySelector('.price').textContent;
        const imgSrc = originalCard.querySelector('img') ? originalCard.querySelector('img').src : '';

        const itemEl = document.createElement('div');
        itemEl.className = 'wishlist-item';
        itemEl.innerHTML = `
          <img src="${imgSrc}" alt="${title}">
          <div class="wishlist-item-details">
            <div class="wishlist-item-title">${title}</div>
            <div class="wishlist-item-price">${price}</div>
          </div>
          <button class="wishlist-item-remove" aria-label="Remove from Wishlist" data-sku="${sku}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;

        itemEl.querySelector('.wishlist-item-title').addEventListener('click', () => {
          wishlistModal.classList.remove('active');
          document.body.style.overflow = '';
          originalCard.click();
        });

        itemEl.querySelector('.wishlist-item-remove').addEventListener('click', (e) => {
          const currentSku = e.currentTarget.dataset.sku;
          let wl = JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
          wl = wl.filter((item) => item !== currentSku);
          localStorage.setItem('ef_wishlist', JSON.stringify(wl));
          renderWishlist();
          updateWishlistBadgeDisplay();
          showToast('Removed from Wishlist', false);
        });

        wishlistContainer.appendChild(itemEl);
      }
    });
  }

  wishlistToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      renderWishlist();
      wishlistModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (wishlistClearAllBtn) {
    wishlistClearAllBtn.addEventListener('click', () => {
      localStorage.setItem('ef_wishlist', '[]');
      renderWishlist();
      updateWishlistBadgeDisplay();
      showToast('Wishlist cleared', false);
    });
  }

  const wishlistCloseBtn = wishlistModal?.querySelector('.wishlist-close');
  if (wishlistCloseBtn) {
    wishlistCloseBtn.addEventListener('click', () => {
      wishlistModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  wishlistModal?.addEventListener('click', (e) => {
    if (e.target === wishlistModal) {
      wishlistModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Logic to close the modal (with gallery cleanup for memory management)
  function closePdpModal() {
    pdpModal.classList.remove('active');
    document.body.style.overflow = '';

    // Restore original metadata
    updateMetaTags(null, null, null);

    // PERFORMANCE: Clean up dynamically generated gallery images to free memory
    // Wait for the exit transition (0.3s) to finish before removing elements from the DOM
    setTimeout(() => {
      cleanupModalGallery(modalGallery);
    }, 300);

    // Restore focus for accessibility
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }

    // Clean up URL hash if closing manually (via X button or overlay)
    if (window.location.hash.startsWith('#EF-')) {
      if (window.history && window.history.replaceState) {
        // replaceState removes the hash without jumping the page or breaking back button
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    }
  }

  document.querySelector('.pdp-close').addEventListener('click', closePdpModal);

  pdpModal.addEventListener('click', (e) => {
    if (e.target === pdpModal) {
      closePdpModal();
    }
  });

  // Also close on Escape key for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdpModal.classList.contains('active')) {
      closePdpModal();
    }
  });

  // ============= FAQ CATEGORY TABS LOGIC =============
  const faqTabs = document.querySelectorAll('.faq-tab');
  const faqPanels = document.querySelectorAll('.faq-tab-panel');

  faqTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabId = this.getAttribute('data-faq-tab');

      // Deactivate all tabs
      faqTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      // Hide all panels
      faqPanels.forEach((p) => {
        p.hidden = true;
      });

      // Activate clicked tab and its panel
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      const targetPanel = document.querySelector(`.faq-tab-panel[data-faq-panel="${tabId}"]`);
      if (targetPanel) {
        targetPanel.hidden = false;

        // Close any open accordion items when switching tabs
        targetPanel.querySelectorAll('.faq-item.active').forEach((item) => {
          const btn = item.querySelector('.faq-question');
          const answer = item.querySelector('.faq-answer');
          item.classList.remove('active');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          if (answer) answer.setAttribute('aria-hidden', 'true');
        });
      }
    });
  });

  // ============= FAQ ACCORDION LOGIC (per-panel) =============
  document.querySelectorAll('.faq-tab-panel .faq-question').forEach((button) => {
    button.addEventListener('click', function () {
      const faqItem = this.closest('.faq-item');
      const answerPanel = faqItem.querySelector('.faq-answer');
      const isExpanded = faqItem.classList.contains('active');

      // Get the parent tab panel
      const parentPanel = faqItem.closest('.faq-tab-panel');

      // Close all other FAQ items within the same panel only (exclusive accordion behavior)
      if (parentPanel) {
        parentPanel.querySelectorAll('.faq-item').forEach((item) => {
          const otherButton = item.querySelector('.faq-question');
          const otherAnswer = item.querySelector('.faq-answer');
          item.classList.remove('active');
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
        });
      }

      // Toggle the clicked item
      if (!isExpanded) {
        faqItem.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
        if (answerPanel) answerPanel.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // ============= URL HASH ROUTING (DIRECT LINKING) =============
  function openModalFromHash() {
    if (window.location.hash && window.location.hash.startsWith('#EF-')) {
      const hashSku = window.location.hash.substring(1);
      const targetCard = Array.from(productCards).find((card) => {
        const title = card.querySelector('h3')?.textContent || '';
        return getSkuCode(title) === hashSku;
      });

      if (targetCard && !pdpModal.classList.contains('active')) {
        revealProductsSection();
        targetCard.setAttribute('data-hash-triggered', 'true');
        targetCard.click();
      }
    }
  }

  setTimeout(openModalFromHash, 500);

  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#EF-')) {
      openModalFromHash();
    } else if (pdpModal.classList.contains('active')) {
      closePdpModal();
    }
  });

  // 6. Scroll Animation Logic
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Stop tracking once revealed to save memory
        }
      });
    },
    { rootMargin: '0px 0px -50px 0px', threshold: 0.05 },
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // ============= COUNTDOWN TIMER LOGIC =============
  const countDownDate = new Date('May 31, 2026 23:59:59').getTime();

  const countdownInterval = setInterval(function () {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const elCountdown = document.getElementById('offer-countdown');
    if (!elCountdown) return;

    if (distance < 0) {
      clearInterval(countdownInterval);
      elCountdown.style.display = 'none';
      return;
    }

    // Add red "ending-soon" warning if less than 24 hours remain
    if (distance < 24 * 60 * 60 * 1000) {
      elCountdown.classList.add('ending-soon');
    } else {
      elCountdown.classList.remove('ending-soon');
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins = document.getElementById('cd-minutes');
    const elSecs = document.getElementById('cd-seconds');

    if (elDays) elDays.textContent = days.toString().padStart(2, '0');
    if (elHours) elHours.textContent = hours.toString().padStart(2, '0');
    if (elMins) elMins.textContent = minutes.toString().padStart(2, '0');
    if (elSecs) elSecs.textContent = seconds.toString().padStart(2, '0');
  }, 1000);
}); // End of DOMContentLoaded

// Track clicks on all direct WhatsApp links (Floating button, Exchange Offer, etc.)
document.addEventListener('click', function (e) {
  const link = e.target.closest('a');
  if (link && link.href && (link.href.includes('wa.me') || link.href.includes('whatsapp.com'))) {
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', {
        event_category: 'WhatsApp',
        event_label: link.className || 'Direct WhatsApp Link',
      });
    }
  }
});

const scrollToTopBtn = document.getElementById('scrollToTop');
const bottomNav = document.querySelector('.mobile-bottom-nav');
let lastScrollTop = 0;

if (scrollToTopBtn || bottomNav) {
  let isScrolling = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (scrollToTopBtn) {
            if (currentScrollY > 500) {
              scrollToTopBtn.classList.add('show');
            } else {
              scrollToTopBtn.classList.remove('show');
            }
          }

          isScrolling = false;
        });
        isScrolling = true;
      }
    },
    { passive: true },
  );

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
