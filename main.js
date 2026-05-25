document.addEventListener('DOMContentLoaded', function () {
  const productCards = document.querySelectorAll('.product-card');
  const vendorWhatsApp = '918928002642';

  // ============= FACETED FILTERING ENGINE =============
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterToggle = document.getElementById('filter-mobile-toggle');
  const filterClose = document.getElementById('filter-sidebar-close');
  const clearAllBtn = document.getElementById('filter-clear-all');

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
      canister: ['canister', 'wet-dry', 'upright'],
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

      if (searchQuery || (activeFacetsList.length === 0 && allChecked)) {
        const allBtn = document.querySelector('.visual-filter-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add('active');
      } else if (
        activeFacetsList.length === 1 &&
        selectedCategories.length === 1 &&
        selectedCategories[0] === 'Water Purifier'
      ) {
        const btn = document.querySelector(`.visual-filter-btn[data-filter="${activeFacetsList[0]}"]`);
        if (btn) btn.classList.add('active');
      } else if (activeFacetsList.length === 0 && selectedCategories.length === 1) {
        const btn = document.querySelector(`.visual-filter-btn[data-filter="${selectedCategories[0]}"]`);
        if (btn) btn.classList.add('active');
      }
    }

    // Gather active facet values
    const activeFacets = [];
    checkedFacets.forEach((cb) => activeFacets.push(cb.value));

    // Show/hide products
    let visibleCount = 0;
    productCards.forEach((card) => {
      const cat = getCardCategory(card);

      // Check category
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(cat);

      // Check all active facets
      let matchesFacets = true;
      if (activeFacets.length > 0) {
        // For each active facet, at least one must match (OR within same facet group)
        // But different facet groups must all be satisfied (AND between groups)
        // Simplified: if any facet is checked, card must match at least one
        matchesFacets = activeFacets.some((f) => cardHasFacet(card, f));
      }

      // Check search query
      let matchesSearch = true;
      if (searchQuery) {
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
        matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);
      }

      const show = matchesCategory && matchesFacets && matchesSearch;
      if (show) {
        card.style.display = 'flex';
        card.style.animation = 'none';
        void card.offsetHeight; // Trigger reflow to restart animation
        card.style.animation = `filterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards ${Math.min(visibleCount, 15) * 0.04}s`;
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update category counts
    ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'].forEach((cat) => {
      const count = Array.from(productCards).filter(
        (c) => getCardCategory(c) === cat && c.style.display !== 'none',
      ).length;
      const countEl = document.querySelector(`.filter-count[data-cat="${cat}"]`);
      if (countEl) countEl.textContent = `(${count})`;
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

  function executeSearchAndScroll() {
    if (!searchInput) return;

    const catView = document.getElementById('category-view');
    const prodView = document.getElementById('product-listing-view');

    if (searchInput.value.trim() !== '') {
      if (catView && prodView) {
        catView.style.display = 'none';
        prodView.style.display = 'block';
      }
      applyFilters();

      const productsSection = document.getElementById('products');
      if (productsSection) {
        const y = productsSection.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      if (catView && prodView) {
        catView.style.display = 'block';
        prodView.style.display = 'none';
        const y = catView.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      applyFilters();
    }
  }

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce(function () {
        const catView = document.getElementById('category-view');
        const prodView = document.getElementById('product-listing-view');
        if (searchInput.value.trim() !== '') {
          if (catView && prodView) {
            catView.style.display = 'none';
            prodView.style.display = 'block';
          }
        } else {
          if (catView && prodView) {
            catView.style.display = 'block';
            prodView.style.display = 'none';
          }
        }
        applyFilters();
      }, 300),
    );

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
        const filterVal = this.dataset.filter;

        // Clear all existing checkbox filters
        document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
        const searchInput = document.getElementById('product-search');
        if (searchInput) searchInput.value = '';

        if (filterVal === 'all') {
          document.querySelector('.filter-cat[value="all"]').checked = true;
        } else if (filterVal === 'Air Purifier' || filterVal === 'Vacuum Cleaner') {
          const catCb = document.querySelector(`.filter-cat[value="${filterVal}"]`);
          if (catCb) catCb.checked = true;
        } else {
          // Water purifier specific filter
          document.querySelector('.filter-cat[value="Water Purifier"]').checked = true;
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
      });
    });
  }

  // Initial filter run
  setTimeout(applyFilters, 50);

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

  function getModalActions(category, title) {
    switch (category) {
      case 'Water Purifier':
        return [
          {
            label: 'Book Free TDS Test',
            message: `Hello Paras, I am interested in ${title}. Please help me book a free TDS test and check if this purifier is suitable for my home water.`,
          },
          {
            label: 'Get Price & Installation Details',
            secondary: true,
            message: `Hello Paras, I am interested in ${title}. Please share the current price, offer, installation details, and availability.`,
          },
          {
            label: 'Check Exchange Value',
            secondary: true,
            message: `Hello Paras, I want to exchange my old water purifier for the ${title}. Please let me know the exchange value and offers.`,
          },
        ];
      case 'Water Softener':
        return [
          {
            label: 'Book Hard Water Check',
            message: `Hello Paras, I am interested in ${title}. Please help me check if this water softener is suitable for my hard water issue and home usage.`,
          },
          {
            label: 'Get Price & Installation Details',
            secondary: true,
            message: `Hello Paras, I am interested in ${title}. Please share the current price, installation requirements, and availability.`,
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
            message: `Hello Paras, I am interested in ${title}. Please share the best current offer and demo availability.`,
          },
        ];
      case 'Air Purifier':
        return [
          {
            label: 'Check Room Coverage',
            message: `Hello Paras, I am interested in ${title}. Please help me check if it is suitable for my room size and air quality needs.`,
          },
          {
            label: 'Get Price & Filter Details',
            secondary: true,
            message: `Hello Paras, I am interested in ${title}. Please share the current price, filter details, and availability.`,
          },
        ];
      default:
        return [
          {
            label: 'Get Details on WhatsApp',
            message: `Hello Paras, I am interested in ${title}. Please share details, offer, and availability.`,
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
          const message = `Hello Paras, I want to exchange my old water purifier for the ${title}. Please let me know the exchange value and offers.`;
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
      updateMetaTags(title, descText, new URL(imgSrc, window.location.origin).href);

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

      getModalActions(categoryKey, title).forEach((action) => {
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

      // Add "Share on WhatsApp" Button
      const shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'product-btn product-btn-secondary';

      const lang = document.documentElement.lang || 'en';
      const shareLabel =
        typeof translations !== 'undefined' && translations[lang] && translations[lang]['share_btn']
          ? translations[lang]['share_btn']
          : 'Share on WhatsApp';

      shareBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span data-i18n="share_btn">${shareLabel}</span>`;

      shareBtn.addEventListener('click', function () {
        const baseUrl = window.location.href.split('#')[0];
        const productUrl = `${baseUrl}#${sku}`;
        const message = `Check out this product: *${title}*\n\n${productUrl}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

        if (typeof gtag === 'function') {
          gtag('event', 'share', {
            event_category: 'Engagement',
            event_label: title,
            method: 'WhatsApp',
          });
        }

        window.open(waUrl, '_blank');
      });

      btnContainer.appendChild(shareBtn);

      // Add "Share on Facebook" Button
      const shareFbBtn = document.createElement('button');
      shareFbBtn.type = 'button';
      shareFbBtn.className = 'product-btn product-btn-secondary';

      const fbLabel =
        typeof translations !== 'undefined' && translations[lang] && translations[lang]['share_fb_btn']
          ? translations[lang]['share_fb_btn']
          : 'Share on Facebook';

      shareFbBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg><span data-i18n="share_fb_btn">${fbLabel}</span>`;

      shareFbBtn.addEventListener('click', function () {
        const baseUrl = window.location.href.split('#')[0];
        const productUrl = `${baseUrl}#${sku}`;
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

        if (typeof gtag === 'function') {
          gtag('event', 'share', {
            event_category: 'Engagement',
            event_label: title,
            method: 'Facebook',
          });
        }

        window.open(fbUrl, 'facebook-share-dialog', 'width=600,height=400');
      });

      btnContainer.appendChild(shareFbBtn);

      // Add "Copy Link" Button
      const shareCopyBtn = document.createElement('button');
      shareCopyBtn.type = 'button';
      shareCopyBtn.className = 'product-btn product-btn-secondary';

      const copyLabel =
        typeof translations !== 'undefined' && translations[lang] && translations[lang]['share_copy_btn']
          ? translations[lang]['share_copy_btn']
          : 'Copy Link';

      shareCopyBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span data-i18n="share_copy_btn">${copyLabel}</span>`;

      shareCopyBtn.addEventListener('click', function () {
        const baseUrl = window.location.href.split('#')[0];
        const productUrl = `${baseUrl}#${sku}`;

        navigator.clipboard.writeText(productUrl).then(() => {
          const span = shareCopyBtn.querySelector('span');
          const originalText = span.textContent;
          span.textContent = 'Copied!';

          if (typeof gtag === 'function') {
            gtag('event', 'share', { event_category: 'Engagement', event_label: title, method: 'Copy Link' });
          }

          setTimeout(() => {
            span.textContent = originalText;
          }, 2000);
        });
      });

      btnContainer.appendChild(shareCopyBtn);

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

  // ============= SHOP BY CATEGORY LOGIC =============
  const categoryView = document.getElementById('category-view');
  const productListingView = document.getElementById('product-listing-view');
  const backToCategoriesBtn = document.getElementById('back-to-categories');
  const catCards = document.querySelectorAll('.cat-card');

  if (catCards.length > 0 && productListingView && categoryView) {
    catCards.forEach((card) => {
      card.addEventListener('click', function () {
        const targetCat = this.getAttribute('data-target-category');

        categoryView.style.display = 'none';
        productListingView.style.display = 'block';

        // Reset filters
        document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
        const targetCb = document.querySelector(`.filter-cat[value="${targetCat}"]`);
        if (targetCb) targetCb.checked = true;

        const waterFilters = document.querySelectorAll('.water-filter');
        const vacuumFilters = document.querySelectorAll('.vacuum-filter');
        waterFilters.forEach((el) => (el.style.display = targetCat === 'Water Purifier' ? '' : 'none'));
        vacuumFilters.forEach((el) => (el.style.display = targetCat === 'Vacuum Cleaner' ? '' : 'none'));

        document.querySelectorAll('.visual-filter-btn').forEach((btn) => btn.classList.remove('active'));
        const visualBtn = document.querySelector(`.visual-filter-btn[data-filter="${targetCat}"]`);
        if (visualBtn) {
          visualBtn.classList.add('active');
        } else if (targetCat === 'Water Purifier') {
          const allBtn = document.querySelector('.visual-filter-btn[data-filter="all"]');
          if (allBtn) allBtn.classList.add('active');
        }

        applyFilters();

        setTimeout(() => {
          document.querySelectorAll('.product-card').forEach((el) => {
            if (el.style.display !== 'none') el.classList.add('active');
          });
        }, 50);

        const productsSection = document.getElementById('products');
        if (productsSection) {
          const y = productsSection.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });

    if (backToCategoriesBtn) {
      backToCategoriesBtn.addEventListener('click', function () {
        productListingView.style.display = 'none';
        categoryView.style.display = 'block';
        const catViewEl = document.getElementById('category-view');
        if (catViewEl) {
          const y = catViewEl.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    }
  }
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

          if (bottomNav && window.innerWidth <= 768) {
            if (currentScrollY > lastScrollTop && currentScrollY > 100) {
              bottomNav.classList.add('hidden'); // Scrolling down
            } else {
              bottomNav.classList.remove('hidden'); // Scrolling up
            }
            lastScrollTop = currentScrollY <= 0 ? 0 : currentScrollY;
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
