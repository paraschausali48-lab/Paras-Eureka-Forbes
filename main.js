import { VENDOR_WHATSAPP } from './config.js';
import { debounce } from './utils.js';
import { showToast } from './toast.js';
import { updateWishlistUI, renderWishlist, handleWishlistToggle, saveWishlist } from './wishlist.js';

document.addEventListener('DOMContentLoaded', async function () {
  // ============= 0. DYNAMIC PRODUCT RENDERING =============
  function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const categoryIcons = {
      'Water Purifier': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path><path d="M9 13l2 2 4-4"></path>',
      'Vacuum Cleaner':
        '<rect x="4" y="14" width="16" height="6" rx="2"></rect><path d="M8 14V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"></path>',
      'Air Purifier':
        '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>',
      'Water Softener':
        '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M12 11l-2.5 3c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5L12 11z"></path>',
    };

    function getProductHighlights(product) {
      const specs = product.specs || {};
      const candidates = [];

      if (product.category === 'Water Purifier') {
        candidates.push(specs['TDS'], specs['Storage Capacity'], specs['Filter Life'], specs['Installation Type']);
      } else if (product.category === 'Vacuum Cleaner') {
        candidates.push(specs['Type'], specs['Application'], specs['Dust Capacity'], specs['Run Time']);
      } else if (product.category === 'Air Purifier') {
        candidates.push(specs['Ideal For'], specs['Air Flow'], specs['Purification Stages']);
      } else if (product.category === 'Water Softener') {
        candidates.push(specs['Max. Input Hardness (ppm)'], specs['Max. Input Flow Rate (LPH)'], specs['Technology']);
      }

      return candidates
        .filter(Boolean)
        .map((value) => String(value).replace(/\s+/g, ' ').trim())
        .filter((value, index, arr) => value && arr.indexOf(value) === index)
        .slice(0, 3);
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const article = document.createElement('article');
      article.className = `product-card reveal ${product.outOfStock ? 'out-of-stock' : ''}`;
      article.dataset.subcategory = product.subcategories.join(', ');
      if (product.leaflet) article.dataset.leaflet = product.leaflet;

      let specsHtml = '<ul>';
      if (product.specs) {
        for (const [key, value] of Object.entries(product.specs)) {
          specsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
        }
      }
      specsHtml += '</ul>';

      const imgHtml = product.image
        ? `<div class="product-media"><img src="${product.image}" alt="${product.name}" loading="lazy" width="300" height="200"></div>`
        : `<div class="product-media product-media-placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              ${categoryIcons[product.category] || categoryIcons['Water Purifier']}
            </svg>
            <span>${product.category}</span>
          </div>`;
      const highlights = getProductHighlights(product);
      const highlightsHtml = highlights.length
        ? `<div class="product-highlights">${highlights.map((item) => `<span>${item}</span>`).join('')}</div>`
        : '';

      article.innerHTML = `
        ${imgHtml}
        <div class="product-tag" data-category="${product.category}" data-i18n="${product.i18nTag}">${product.category}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        ${highlightsHtml}
        <div class="price-info">
          <div class="mrp">MRP ₹${product.mrp.toLocaleString('en-IN')}</div>
          <div class="price">MOP ₹${product.mop.toLocaleString('en-IN')}</div>
        </div>
        <div class="product-trust-note">Inquiry only. Final purchase and billing through official Eureka Forbes channels.</div>
        <a href="#contact" class="product-btn" data-i18n="btn_more_info">More Info</a>
        <div class="hidden-specs" style="display: none">${specsHtml}</div>
      `;
      fragment.appendChild(article);
    });

    grid.appendChild(fragment);

    if (typeof window.applyTranslations === 'function') {
      window.applyTranslations(document.documentElement.lang || 'en');
    }
  }

  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('HTTP status ' + response.status);
    const productsData = await response.json();
    renderProducts(productsData);
  } catch (error) {
    console.error('Failed to load products.json:', error);
    const grid = document.getElementById('product-grid');
    if (grid)
      grid.innerHTML =
        '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">Error loading products. Ensure you are running a local web server (Not file://).</p>';
  }

  const productCards = document.querySelectorAll('.product-card');

  // ============= 0.5 GLOBAL KEYBOARD ACCESSIBILITY =============
  // Allow users to close modals using the Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeOverlay = document.querySelector('.pdp-modal.active, .filter-sidebar.open, .main-sidebar.active');
      if (activeOverlay) closeActiveOverlay();
    }

    // Focus trapping for active modals
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
    if (!isTabPressed) return;

    const activeModal = document.querySelector('.pdp-modal.active, .main-sidebar.active, .filter-sidebar.open');
    if (!activeModal) return;

    const focusableEls = activeModal.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusableEls.length === 0) return;

    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableEl || document.activeElement === document.body) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  });

  // ============= 1. SCROLL ANIMATIONS =============
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

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ============= 2. HEADER SCROLL EFFECT =============
  const siteHeader = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 20) siteHeader.classList.add('scrolled');
      else siteHeader.classList.remove('scrolled');

      // Auto-hide header on scroll down, show on scroll up
      if (window.scrollY > lastScrollY && window.scrollY > 150) {
        siteHeader.classList.add('hidden');
      } else {
        siteHeader.classList.remove('hidden');
      }
      lastScrollY = window.scrollY;
    },
    { passive: true },
  );

  // ============= 2.8 ACCORDION GENERATION =============
  document.querySelectorAll('.filter-group').forEach((group) => {
    const titleEl = group.querySelector('.filter-group-title');
    if (!titleEl || group.querySelector('.filter-group-toggle')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'filter-group-toggle';
    toggleBtn.setAttribute('aria-expanded', 'true');
    const contentId = `filter-content-${Math.random().toString(36).substr(2, 9)}`;
    toggleBtn.setAttribute('aria-controls', contentId);
    toggleBtn.setAttribute('type', 'button');

    const chevron = document.createElement('span');
    chevron.className = 'filter-chevron';
    chevron.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    const newTitle = document.createElement('div');
    newTitle.className = 'filter-group-title';
    newTitle.textContent = titleEl.textContent;
    toggleBtn.appendChild(newTitle);
    toggleBtn.appendChild(chevron);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'filter-group-content';
    contentDiv.id = contentId;

    Array.from(group.children).forEach((child) => {
      if (child !== titleEl) contentDiv.appendChild(child);
    });

    titleEl.remove();
    group.appendChild(toggleBtn);
    group.appendChild(contentDiv);

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
    });
  });

  const searchForm = document.querySelector('.header-search');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (searchInput) searchInput.blur();
    });
  }

  // ============= 3. FACETED FILTERING ENGINE =============
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterToggle = document.getElementById('filter-mobile-toggle');
  const filterClose = document.getElementById('filter-sidebar-close');
  const clearAllBtn = document.getElementById('filter-clear-all');
  const searchInput = document.getElementById('product-search');
  const productGrid = document.getElementById('product-grid');
  const defaultOrder = Array.from(productCards);

  // ============= 3.5 SORTING LOGIC =============
  const desktopSort = document.getElementById('desktop-sort-select');
  function sortProducts(sortType) {
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
    if (productGrid) {
      sorted.forEach((c) => productGrid.appendChild(c));
      hiddenCards.forEach((c) => productGrid.appendChild(c));
    }
  }

  // Mobile Overlay
  const overlay = document.createElement('div');
  overlay.className = 'filter-overlay';
  // Lock background scroll when dragging on the overlay
  overlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.body.appendChild(overlay);

  function forceCloseAllOverlays() {
    if (filterSidebar) filterSidebar.classList.remove('open');
    if (sortModal) sortModal.classList.remove('active');
    if (wishlistModal) wishlistModal.classList.remove('active');
    if (pdpModal) pdpModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    const mainSidebar = document.getElementById('main-sidebar');
    const mainSidebarOverlay = document.getElementById('main-sidebar-overlay');
    if (mainSidebar) mainSidebar.classList.remove('active');
    if (mainSidebarOverlay) mainSidebarOverlay.classList.remove('active');

    if (document.body) document.body.style.overflow = '';
    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  function closeActiveOverlay() {
    const hash = window.location.hash;
    // If the hash is tied to a modal or product view, trigger a native back event
    if (['#view-filter', '#view-sort', '#view-wishlist'].includes(hash) || hash.startsWith('#EF-')) {
      // Prevent kicking the user off the site if they landed directly via a shared link
      if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.hash = '#products'; // Fallback to a safe state
      }
    } else {
      forceCloseAllOverlays();
    }
  }

  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      window.location.hash = 'view-filter';
    });
  }

  if (filterClose) filterClose.addEventListener('click', closeActiveOverlay);
  if (overlay) overlay.addEventListener('click', closeActiveOverlay);

  function getCardCategory(card) {
    return card.querySelector('.product-tag')?.dataset.category || '';
  }

  function getCardPrice(card) {
    const priceEl = card.querySelector('.price');
    return priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0;
  }

  function cardMatchesFacets(card, facetValues, category) {
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

  function applyFilters() {
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

    // NEW: Sync Filter State to URL for easy sharing
    const url = new URL(window.location);
    if (checkedCats.length && !isAllSelected) url.searchParams.set('cat', checkedCats.join(','));
    else url.searchParams.delete('cat');
    if (activeFacets.length) url.searchParams.set('facets', activeFacets.join(','));
    else url.searchParams.delete('facets');
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);

    const currentSort = desktopSort ? desktopSort.value : 'relevance';
    sortProducts(currentSort);

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

  // Wire up sorting events
  if (desktopSort) {
    desktopSort.addEventListener('change', (e) => {
      sortProducts(e.target.value);
      // Sync with new mobile sort buttons
      document.querySelectorAll('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sort === e.target.value);
      });
    });
  }
  const sortMobileToggle = document.getElementById('sort-mobile-toggle');
  const sortModal = document.getElementById('sort-modal');
  if (sortMobileToggle && sortModal) {
    sortMobileToggle.addEventListener('click', () => {
      // Set initial active state based on current sort
      const currentSort = desktopSort ? desktopSort.value : 'relevance';
      document.querySelectorAll('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sort === currentSort);
      });
      window.location.hash = 'view-sort';
    });

    document.querySelectorAll('.sort-option-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sortValue = e.currentTarget.dataset.sort;

        // Update desktop dropdown and sort products
        if (desktopSort) desktopSort.value = sortValue;
        sortProducts(sortValue);

        // Close modal after a short delay
        setTimeout(() => {
          closeActiveOverlay();
        }, 250);
      });
    });
  }

  document.querySelectorAll('.filter-cat').forEach((cb) => {
    cb.addEventListener('change', function () {
      if (this.value === 'all' && this.checked) {
        document.querySelectorAll('.filter-cat:not([value="all"])').forEach((c) => (c.checked = false));
      } else if (this.value !== 'all') {
        const allCb = document.querySelector('.filter-cat[value="all"]');
        if (allCb) allCb.checked = false;
      }
      applyFilters();
    });
  });

  document.querySelectorAll('.filter-facet').forEach((cb) => cb.addEventListener('change', applyFilters));
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce(() => {
        const prodEl = document.getElementById('products');
        if (prodEl && prodEl.style.display === 'none') {
          prodEl.style.display = '';
          document.body.classList.add('products-visible');
          prodEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        applyFilters();
      }, 300),
    );
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
      document.querySelector('.filter-cat[value="all"]').checked = true;
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  function hideProductsView() {
    const prodEl = document.getElementById('products');
    if (prodEl) prodEl.style.display = 'none';
    document.body.classList.remove('products-visible');
    document.querySelectorAll('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
    const vfMain = document.getElementById('vf-main');
    if (vfMain) vfMain.style.display = 'flex';
    document.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
    if (clearAllBtn) clearAllBtn.click();
  }

  // ============= 4. VISUAL FILTERS =============
  document.querySelectorAll('.visual-filter-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      if (window.location.hash !== '#products') {
        window.history.pushState(null, null, '#products');
      }
      document.getElementById('products').style.display = '';
      document.body.classList.add('products-visible');
      const navCat = this.dataset.navCategory;
      const filterVal = this.dataset.filter;

      // Update visual active state highlight
      const parentContainer = this.closest('.visual-filters');
      if (parentContainer) {
        parentContainer.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
      }
      this.classList.add('active');

      if (navCat) {
        document.querySelectorAll('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
        const vfId = navCat === 'Water Softener' ? 'vf-softener' : `vf-${navCat.split(' ')[0].toLowerCase()}`;
        const targetVf = document.getElementById(vfId);
        if (targetVf) targetVf.style.display = 'flex';

        document.querySelectorAll('.filter-cat').forEach((cb) => (cb.checked = cb.value === navCat));
        document.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = false));
      } else if (filterVal) {
        document.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = cb.value === filterVal));
        let targetCat = 'Water Purifier';
        if (['robotic', 'canister', 'handheld', 'wet-dry'].includes(filterVal)) targetCat = 'Vacuum Cleaner';
        else if (['Air Purifier', 'Water Softener'].includes(filterVal)) targetCat = filterVal;
        document.querySelectorAll('.filter-cat').forEach((cb) => (cb.checked = cb.value === targetCat));
      }

      if (searchInput) searchInput.value = '';
      applyFilters();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.vf-back-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.location.hash === '#products') {
        window.history.back(); // Triggers the clean popstate transition
      } else {
        hideProductsView();
      }
    });
  });

  // ============= 5. PRICING & DISCOUNTS =============
  productCards.forEach((card) => {
    const priceEl = card.querySelector('.price');
    const mrpEl = card.querySelector('.mrp');
    if (!priceEl || !mrpEl) return;

    const mop = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
    const mrp = parseInt(mrpEl.textContent.replace(/[^0-9]/g, ''));

    if (mrp > mop && mop > 0) {
      const discount = Math.round(((mrp - mop) / mrp) * 100);
      if (discount > 0 && !card.querySelector('.discount-badge')) {
        const badge = document.createElement('span');
        badge.className = 'discount-badge';
        badge.textContent = `${discount}% OFF`;

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

  // ============= 6. PDP MODAL & DYNAMIC GALLERY =============
  const pdpModal = document.getElementById('pdp-modal');
  let lastFocused = null;

  document
    .querySelectorAll('.pdp-close, .wishlist-close, .sort-close')
    .forEach((btn) => btn.addEventListener('click', closeActiveOverlay));

  // Allow closing any modal by tapping its dark background
  document.querySelectorAll('.pdp-modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeActiveOverlay();
    });
  });

  productCards.forEach((card) => {
    card.addEventListener('click', function (e) {
      const isMoreInfoBtn = e.target.closest('.product-btn[href="#contact"]');
      if (!isMoreInfoBtn && (e.target.closest('.product-btn') || e.target.closest('a'))) return;
      if (isMoreInfoBtn) e.preventDefault(); // Prevent jumping down the page, open modal instead
      lastFocused = this;

      const title = this.querySelector('h3').textContent;
      const category = getCardCategory(this);
      const priceHTML = this.querySelector('.price-info')?.innerHTML || '';
      const specsHTML = this.querySelector('.hidden-specs')?.innerHTML || '';
      const desc = this.querySelector('p')?.textContent || '';
      const sku =
        'EF-' +
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .toUpperCase();

      document.getElementById('pdp-title').textContent = title;
      document.getElementById('pdp-category').textContent = category;
      document.getElementById('pdp-sku').querySelector('span').textContent = sku;
      document.getElementById('pdp-price').innerHTML = priceHTML;
      document.getElementById('pdp-specs').innerHTML = specsHTML;
      if (document.getElementById('pdp-desc')) document.getElementById('pdp-desc').textContent = desc;

      const specsDetails = document.querySelector('.pdp-specs-details');
      if (specsDetails) {
        specsDetails.style.display = specsHTML.trim() ? 'block' : 'none';
      }

      // Action Buttons
      const btnContainer = document.getElementById('pdp-action-btn');
      btnContainer.innerHTML = '';

      const bookDemoBtn = document.createElement('button');
      bookDemoBtn.className = 'product-btn';
      const isVacuum = category === 'Vacuum Cleaner';
      bookDemoBtn.setAttribute('data-i18n', isVacuum ? 'btn_ask' : 'btn_book_appointment');
      bookDemoBtn.textContent = isVacuum ? 'Book a Free Demo' : 'Book an Appointment';
      bookDemoBtn.onclick = (e) => {
        e.preventDefault();
        const actionText = isVacuum ? 'book a free home demonstration' : 'book an appointment';
        const message = `Hello Paras, I am interested in the ${title} and would like to ${actionText}. Please share the details.`;
        const waUrl = `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      };
      btnContainer.appendChild(bookDemoBtn);

      // Download Leaflet Button
      const leafletSrc = this.dataset.leaflet;
      if (leafletSrc) {
        const leafletBtn = document.createElement('a');
        leafletBtn.href = leafletSrc;
        leafletBtn.target = '_blank';
        leafletBtn.className = 'product-btn product-btn-secondary';
        leafletBtn.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span data-i18n="btn_leaflet">Download Leaflet</span>';
        btnContainer.appendChild(leafletBtn);
      }

      // Native Share Button
      const shareBtn = document.createElement('button');
      shareBtn.className = 'product-btn product-btn-secondary';
      const shareIcon =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
      shareBtn.innerHTML = shareIcon + '<span data-i18n="btn_share">Share</span>';
      shareBtn.onclick = async () => {
        const url = window.location.href.split('#')[0] + '#' + sku;
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch (err) {}
        } else {
          navigator.clipboard.writeText(url);
          shareBtn.innerHTML = shareIcon + '<span data-i18n="toast_link_copied">Copied!</span>';
          if (typeof window.applyTranslations === 'function')
            window.applyTranslations(document.documentElement.lang || 'en');
          setTimeout(() => {
            shareBtn.innerHTML = shareIcon + '<span data-i18n="btn_share">Share</span>';
            if (typeof window.applyTranslations === 'function')
              window.applyTranslations(document.documentElement.lang || 'en');
          }, 2000);
        }
      };
      btnContainer.appendChild(shareBtn);

      // URL Direct linking
      if (window.history.pushState && window.location.hash !== '#' + sku)
        window.history.pushState(null, null, '#' + sku);

      pdpModal.classList.add('active');
      const scrollableContent = pdpModal.querySelector('.pdp-scrollable-content');
      if (scrollableContent) scrollableContent.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      if (typeof updateWishlistUI === 'function') updateWishlistUI();
      setTimeout(() => pdpModal.querySelector('.pdp-close')?.focus(), 50);

      // Apply translations instantly to the newly created button
      if (typeof window.applyTranslations === 'function')
        window.applyTranslations(document.documentElement.lang || 'en');
    });
  });

  // ============= 7. FAQ ACCORDION LOGIC =============
  document.querySelectorAll('.faq-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.faq-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.faq-tab-panel').forEach((p) => (p.hidden = true));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const panel = document.querySelector(`.faq-tab-panel[data-faq-panel="${this.dataset.faqTab}"]`);
      if (panel) panel.hidden = false;
    });
  });

  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isActive = item.classList.contains('active');
      item
        .closest('.faq-tab-panel')
        .querySelectorAll('.faq-item')
        .forEach((i) => {
          i.classList.remove('active');
          i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        });
      if (!isActive) {
        item.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ============= 9. WISHLIST & SECONDARY MODALS =============
  const wishlistToggleBtns = document.querySelectorAll('.wishlist-toggle-btn');
  const wishlistModal = document.getElementById('wishlist-modal');
  const wishlistContainer = document.getElementById('wishlist-items-container');
  const wishlistClearBtn = document.getElementById('wishlist-clear-all');

  wishlistToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'view-wishlist';
    });
  });

  if (wishlistClearBtn) {
    wishlistClearBtn.addEventListener('click', () => {
      saveWishlist([]);
      renderWishlist(productCards, wishlistModal, wishlistContainer, wishlistClearBtn);
      showToast('toast_wishlist_clear');
    });
  }

  document.getElementById('pdp-wishlist-btn')?.addEventListener('click', function () {
    const sku = document.getElementById('pdp-sku').querySelector('span').textContent;
    handleWishlistToggle(sku);
  });
  updateWishlistUI();

  // ============= 10. APP-LIKE ROUTING & GESTURES =============
  function handleAppRouting() {
    const hash = window.location.hash;

    forceCloseAllOverlays();

    if (hash.startsWith('#EF-')) {
      const sku = hash.substring(1);
      const targetCard = Array.from(productCards).find((c) => {
        const title = c.querySelector('h3').textContent;
        return (
          'EF-' +
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .toUpperCase() ===
          sku
        );
      });
      if (targetCard && (!pdpModal || !pdpModal.classList.contains('active'))) {
        document.getElementById('products').style.display = '';
        document.body.classList.add('products-visible');
        targetCard.click();
      }
    } else if (hash === '#view-filter') {
      if (filterSidebar) {
        filterSidebar.classList.add('open');
        setTimeout(() => filterSidebar.querySelector('.filter-sidebar-close')?.focus(), 50);
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    } else if (hash === '#view-sort') {
      if (sortModal) {
        sortModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => sortModal.querySelector('.sort-close')?.focus(), 50);
      }
    } else if (hash === '#view-wishlist') {
      renderWishlist(productCards, wishlistModal, wishlistContainer, wishlistClearBtn);
      if (wishlistModal) {
        wishlistModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => wishlistModal.querySelector('.wishlist-close')?.focus(), 50);
      }
    } else if (hash === '#contact' || hash === '#faq') {
      // Close any open overlays (including the sidebar itself)
      forceCloseAllOverlays();
      const el = document.querySelector(hash);
      if (el) {
        // Use a timeout to allow closing animations to finish before scrolling
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }
    } else if (hash === '#products') {
      document.getElementById('products').style.display = '';
      document.body.classList.add('products-visible');
    } else if (!hash || hash === '') {
      hideProductsView();
    }
  }
  window.addEventListener('hashchange', handleAppRouting);
  setTimeout(handleAppRouting, 300);

  // Handle WA button visibility based on hash
  function updateWaButtonVisibility() {
    const waBtn = document.querySelector('.whatsapp-float');
    if (!waBtn) return;
    const hash = window.location.hash;
    if (!hash || hash === '' || hash === '#home') {
      waBtn.style.display = 'flex';
    } else {
      waBtn.style.display = 'none';
    }
  }
  window.addEventListener('hashchange', updateWaButtonVisibility);
  updateWaButtonVisibility();

  // Swipe Gestures for Mobile
  function enableSwipeToClose(element, closeAction, direction = 'down') {
    if (!element) return;
    let startPos = 0;
    let currentPos = 0;
    let isSwiping = false;
    element.addEventListener(
      'touchstart',
      (e) => {
        if (direction === 'down' && element.scrollTop > 0) return;
        startPos = direction === 'down' ? e.touches[0].clientY : e.touches[0].clientX;
        isSwiping = true;
      },
      { passive: true },
    );
    element.addEventListener(
      'touchmove',
      (e) => {
        if (!isSwiping || (direction === 'down' && element.scrollTop > 0)) return;
        currentPos = direction === 'down' ? e.touches[0].clientY : e.touches[0].clientX;
        const diff = currentPos - startPos;
        if (diff > 0) {
          element.style.transform = direction === 'down' ? `translateY(${diff}px)` : `translateX(${diff}px)`;
          element.style.transition = 'none';
        }
      },
      { passive: true },
    );
    element.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      element.style.transform = '';
      element.style.transition = '';
      if (currentPos - startPos > 100) closeAction();
    });
  }

  if (sortModal) enableSwipeToClose(sortModal.querySelector('.pdp-content'), closeActiveOverlay, 'down');
  if (filterSidebar) enableSwipeToClose(filterSidebar, closeActiveOverlay, 'down');
  if (pdpModal) enableSwipeToClose(pdpModal.querySelector('.pdp-content'), closeActiveOverlay, 'right');
  if (wishlistModal) enableSwipeToClose(wishlistModal.querySelector('.pdp-content'), closeActiveOverlay, 'right');
  const mainSidebarEl = document.getElementById('main-sidebar');
  if (mainSidebarEl) enableSwipeToClose(mainSidebarEl, () => document.getElementById('sidebar-close')?.click(), 'left');

  // ============= 11. SCROLL TO TOP BUTTON =============
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 300) {
          scrollToTopBtn.classList.add('show');
        } else {
          scrollToTopBtn.classList.remove('show');
        }
      },
      { passive: true },
    );

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============= 12. INITIALIZE URL STATE =============
  // Read URL parameters on load so shared links apply the correct filters
  const params = new URLSearchParams(window.location.search);
  const initCats = params.get('cat');
  const initFacets = params.get('facets');
  const initQ = params.get('q');

  if (initCats || initFacets || initQ) {
    document.querySelector('.filter-cat[value="all"]').checked = false;
    if (initCats) {
      const catArr = initCats.split(',');
      document.querySelectorAll('.filter-cat').forEach((cb) => (cb.checked = catArr.includes(cb.value)));
    }
    if (initFacets) {
      const facetArr = initFacets.split(',');
      document.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = facetArr.includes(cb.value)));
    }
    if (initQ && searchInput) searchInput.value = initQ;

    // Automatically expand the products view to show the filtered results
    if (window.location.hash !== '#products')
      window.history.replaceState(null, null, window.location.search + '#products');
  }

  applyFilters();

  // Sidebar Menu Logic
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('main-sidebar');
  const sidebarOverlay = document.getElementById('main-sidebar-overlay');
  const sidebarClose = document.getElementById('sidebar-close');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => sidebarClose?.focus(), 50);
  }
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');

    if (!document.querySelector('.pdp-modal.active, .filter-sidebar.open')) {
      document.body.style.overflow = '';
    }
    if (window.location.hash === '#faq' || window.location.hash === '#contact') {
      window.history.pushState(null, null, window.location.pathname + window.location.search);
    }
  }
  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar when clicking a language button
  document
    .querySelectorAll('.language-switcher-sidebar .lang-btn')
    .forEach((btn) => btn.addEventListener('click', closeSidebar));
});
