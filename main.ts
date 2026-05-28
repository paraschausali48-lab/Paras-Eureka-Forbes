import { applyTranslations, initLanguageSwitcher } from './translations';
import { VENDOR_WHATSAPP } from './config';
import { debounce, enableSwipeToClose } from './utils';
import { showToast } from './toast';
import { updateWishlistUI, renderWishlist, handleWishlistToggle, saveWishlist } from './wishlist';
import { filterState, setFilterState } from './filters';
import { renderProducts } from './render';
import {
  handleAppRouting,
  closeActiveOverlay,
  forceCloseAllOverlays,
  hideProductsView,
  setLastFocused,
} from './routing';
import type { Product } from './types';

// ============= SERVICE WORKER REGISTRATION =============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register((import.meta as any).env?.BASE_URL + 'sw.js').catch((err) => {
      console.warn('Service Worker registration failed:', err);
    });
  });
}

let productsData: Product[] = [];

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('HTTP status ' + response.status);
    productsData = await response.json();
  } catch (error) {
    console.error('Failed to load products.json:', error);
    const grid = document.getElementById('product-grid');
    if (grid)
      grid.innerHTML =
        '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">Error loading products. Ensure you are running a local web server (Not file://).</p>';
  }

  // ============= 0.5 GLOBAL KEYBOARD ACCESSIBILITY =============
  // Allow users to close modals using the Escape key
  document.addEventListener('keydown', (e: KeyboardEvent) => {
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
    ) as NodeListOf<HTMLElement>;
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
      if (siteHeader) {
        if (window.scrollY > 20) siteHeader.classList.add('scrolled');
        else siteHeader.classList.remove('scrolled');

        // Auto-hide header on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 150) {
          siteHeader.classList.add('hidden');
        } else {
          siteHeader.classList.remove('hidden');
        }
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
    searchForm.addEventListener('submit', (e: Event) => {
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

  // ============= 3.5 SORTING LOGIC =============
  const desktopSort = document.getElementById('desktop-sort-select');
  // Mobile Overlay
  const overlay = document.createElement('div');
  overlay.className = 'filter-overlay';
  // Lock background scroll when dragging on the overlay
  overlay.addEventListener('touchmove', (e: Event) => e.preventDefault(), { passive: false });
  document.body.appendChild(overlay);

  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'filter');
      window.history.pushState(null, '', url);
      handleAppRouting(productsData);
    });
  }

  if (filterClose) filterClose.addEventListener('click', closeActiveOverlay);
  if (overlay) overlay.addEventListener('click', closeActiveOverlay);

  // Wire up sorting events
  if (desktopSort) {
    desktopSort.addEventListener('change', (e: Event) => {
      setFilterState({ sort: (e.target as HTMLSelectElement).value }, productsData);
      // Sync with new mobile sort buttons
      document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', (btn as HTMLElement).dataset.sort === (e.target as HTMLSelectElement).value);
      });
    });
  }
  const sortMobileToggle = document.getElementById('sort-mobile-toggle');
  const sortModal = document.getElementById('sort-modal');
  if (sortMobileToggle && sortModal) {
    sortMobileToggle.addEventListener('click', () => {
      // Set initial active state based on current sort
      document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sort === filterState.sort);
      });
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'sort');
      window.history.pushState(null, '', url);
      handleAppRouting(productsData);
    });

    document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
      btn.addEventListener('click', (e: Event) => {
        const sortValue = (e.currentTarget as HTMLElement).dataset.sort;

        if (sortValue) setFilterState({ sort: sortValue }, productsData);

        // Close modal after a short delay
        setTimeout(() => {
          closeActiveOverlay();
        }, 250);
      });
    });
  }

  document.querySelectorAll<HTMLInputElement>('.filter-cat').forEach((cb) => {
    cb.addEventListener('change', function () {
      let newCats: string[] = [...filterState.categories];
      if (this.value === 'all' && this.checked) {
        newCats = ['all'];
      } else if (this.value !== 'all') {
        newCats = newCats.filter((cat) => cat !== 'all');
        if (this.checked) newCats.push(this.value);
        else newCats = newCats.filter((cat) => cat !== this.value);
        if (newCats.length === 0) newCats = ['all'];
      }
      setFilterState({ categories: newCats }, productsData);
    });
  });

  document.querySelectorAll<HTMLInputElement>('.filter-facet').forEach((cb) =>
    cb.addEventListener('change', function () {
      let newFacets: string[] = [...filterState.facets];
      if (this.checked) newFacets.push(this.value);
      else newFacets = newFacets.filter((f) => f !== this.value);
      setFilterState({ facets: newFacets }, productsData);
    }),
  );

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
        setFilterState({ query: (searchInput as HTMLInputElement).value }, productsData);
      }, 300),
    );
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      setFilterState({ categories: ['all'], facets: [], query: '' }, productsData);
    });
  }

  // ============= 4. VISUAL FILTERS =============
  document.querySelectorAll<HTMLElement>('.visual-filter-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      if (window.location.hash !== '#products') {
        window.history.pushState(null, '', '#products');
      }
      document.getElementById('products')!.style.display = '';
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
        document.querySelectorAll<HTMLElement>('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
        const vfId = navCat === 'Water Softener' ? 'vf-softener' : `vf-${navCat.split(' ')[0].toLowerCase()}`;
        const targetVf = document.getElementById(vfId);
        if (targetVf) targetVf.style.display = 'flex';

        setFilterState({ categories: [navCat], facets: [], query: '' }, productsData);
      } else if (filterVal) {
        let targetCat = 'Water Purifier';
        if (['robotic', 'canister', 'handheld', 'wet-dry'].includes(filterVal)) targetCat = 'Vacuum Cleaner';
        else if (['Air Purifier', 'Water Softener'].includes(filterVal)) targetCat = filterVal;

        setFilterState({ categories: [targetCat], facets: [filterVal], query: '' }, productsData);
      }

      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll<HTMLElement>('.vf-back-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.location.hash === '#products') {
        window.history.back(); // Triggers the clean popstate transition
      } else {
        hideProductsView();
      }
    });
  });

  // ============= 6. PDP MODAL & DYNAMIC GALLERY =============
  const pdpModal = document.getElementById('pdp-modal');

  document
    .querySelectorAll('.pdp-close, .wishlist-close, .sort-close')
    .forEach((btn) => btn.addEventListener('click', closeActiveOverlay));

  // Allow closing any modal by tapping its dark background
  document.querySelectorAll<HTMLElement>('.pdp-modal').forEach((modal) => {
    modal.addEventListener('click', (e: Event) => {
      if (e.target === modal) closeActiveOverlay();
    });
  });

  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    productGrid.addEventListener('click', function (e: Event) {
      const card = (e.target as HTMLElement).closest('.product-card') as HTMLElement;
      if (!card) return;

      const isMoreInfoBtn = (e.target as HTMLElement).closest('.product-btn[href="#contact"]');
      if (
        !isMoreInfoBtn &&
        ((e.target as HTMLElement).closest('.product-btn') || (e.target as HTMLElement).closest('a'))
      )
        return;
      if (isMoreInfoBtn) e.preventDefault(); // Prevent jumping down the page, open modal instead
      setLastFocused(card);

      const title = card.querySelector('h3')!.textContent!;
      const category = card.querySelector('.product-tag')!.textContent!;
      const priceHTML = card.querySelector('.price-info')?.innerHTML || '';
      const specsHTML = card.querySelector('.hidden-specs')?.innerHTML || '';
      const desc = card.querySelector('p')?.textContent || '';
      const sku = card.dataset.sku!;

      document.getElementById('pdp-title')!.textContent = title;
      document.getElementById('pdp-category')!.textContent = category;
      document.getElementById('pdp-sku')!.querySelector('span')!.textContent = sku;
      document.getElementById('pdp-price')!.innerHTML = priceHTML;
      document.getElementById('pdp-specs')!.innerHTML = specsHTML;
      if (document.getElementById('pdp-desc')) document.getElementById('pdp-desc')!.textContent = desc;

      const specsDetails = document.querySelector<HTMLElement>('.pdp-specs-details');
      if (specsDetails) {
        specsDetails.style.display = specsHTML.trim() ? 'block' : 'none';
      }

      // Action Buttons
      const btnContainer = document.getElementById('pdp-action-btn')!;
      btnContainer.innerHTML = '';

      const bookDemoBtn = document.createElement('button');
      bookDemoBtn.className = 'product-btn';
      const isVacuum = category === 'Vacuum Cleaner';
      bookDemoBtn.setAttribute('data-i18n', isVacuum ? 'btn_ask' : 'btn_book_appointment');
      bookDemoBtn.textContent = isVacuum ? 'Book a Free Demo' : 'Book an Appointment';
      bookDemoBtn.onclick = (e: Event) => {
        e.preventDefault();
        const actionText = isVacuum ? 'book a free home demonstration' : 'book an appointment';
        const message = `Hello Paras, I am interested in the ${title} and would like to ${actionText}. Please share the details.`;
        const waUrl = `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      };
      btnContainer.appendChild(bookDemoBtn);

      // Download Leaflet Button
      const leafletSrc = card.dataset.leaflet;
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
        const shareUrl = new URL(window.location.href);
        shareUrl.searchParams.set('p', sku);
        const url = shareUrl.toString();
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch (err) {}
        } else {
          navigator.clipboard.writeText(url);
          shareBtn.innerHTML = shareIcon + '<span data-i18n="toast_link_copied">Copied!</span>';
          applyTranslations(document.documentElement.lang || 'en');
          setTimeout(() => {
            shareBtn.innerHTML = shareIcon + '<span data-i18n="btn_share">Share</span>';
            applyTranslations(document.documentElement.lang || 'en');
          }, 2000);
        }
      };
      btnContainer.appendChild(shareBtn);

      // URL Direct linking
      const url = new URL(window.location.href);
      if (url.searchParams.get('p') !== sku) {
        url.searchParams.set('p', sku);
        window.history.pushState(null, '', url);
      }

      pdpModal!.classList.add('active');
      const scrollableContent = pdpModal?.querySelector('.pdp-scrollable-content');
      if (scrollableContent) scrollableContent.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      if (typeof updateWishlistUI === 'function') updateWishlistUI();
      setTimeout(() => (pdpModal?.querySelector('.pdp-close') as HTMLElement)?.focus(), 50);

      // Apply translations instantly to the newly created button
      applyTranslations(document.documentElement.lang || 'en');
    });
  }

  // ============= 7. FAQ ACCORDION LOGIC =============
  document.querySelectorAll<HTMLElement>('.faq-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      document.querySelectorAll<HTMLElement>('.faq-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll<HTMLElement>('.faq-tab-panel').forEach((p) => (p.hidden = true));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const panel = document.querySelector<HTMLElement>(`.faq-tab-panel[data-faq-panel="${this.dataset.faqTab}"]`);
      if (panel) panel.hidden = false;
    });
  });

  document.querySelectorAll<HTMLElement>('.faq-question').forEach((btn) => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item')!;
      const isActive = item.classList.contains('active');
      item
        .closest('.faq-tab-panel')!
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
  const wishlistToggleBtns = document.querySelectorAll<HTMLElement>('.wishlist-toggle-btn');
  const wishlistModal = document.getElementById('wishlist-modal');
  const wishlistContainer = document.getElementById('wishlist-items-container');
  const wishlistClearBtn = document.getElementById('wishlist-clear-all');

  wishlistToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e: Event) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'wishlist');
      window.history.pushState(null, '', url);
      handleAppRouting(productsData);
    });
  });

  if (wishlistClearBtn) {
    wishlistClearBtn.addEventListener('click', () => {
      saveWishlist([]);
      renderWishlist(productsData, wishlistModal, wishlistContainer, wishlistClearBtn);
      showToast('toast_wishlist_clear');
    });
  }

  document.getElementById('pdp-wishlist-btn')?.addEventListener('click', function () {
    const sku = document.getElementById('pdp-sku')!.querySelector('span')!.textContent!;
    handleWishlistToggle(sku);
  });
  updateWishlistUI();

  // ============= 10. APP-LIKE ROUTING & GESTURES =============
  window.addEventListener('popstate', () => handleAppRouting(productsData));
  window.addEventListener('hashchange', () => handleAppRouting(productsData));
  setTimeout(() => handleAppRouting(productsData), 300);

  // Handle WA button visibility based on hash
  function updateWaButtonVisibility() {
    const waBtn = document.querySelector<HTMLElement>('.whatsapp-float');
    if (!waBtn) return;
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('p') && (!hash || hash === '' || hash === '#home')) {
      waBtn.style.display = 'flex';
    } else {
      waBtn.style.display = 'none';
    }
  }
  window.addEventListener('popstate', updateWaButtonVisibility);
  window.addEventListener('hashchange', updateWaButtonVisibility);
  updateWaButtonVisibility();

  if (sortModal) enableSwipeToClose(sortModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'down');
  if (filterSidebar) enableSwipeToClose(filterSidebar, closeActiveOverlay, 'down');
  if (pdpModal) enableSwipeToClose(pdpModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'right');
  if (wishlistModal)
    enableSwipeToClose(wishlistModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'right');
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
    const newState: any = { categories: ['all'], facets: [], query: '' };
    if (initCats) {
      newState.categories = initCats.split(',');
    }
    if (initFacets) {
      newState.facets = initFacets.split(',');
    }
    if (initQ) newState.query = initQ;

    setFilterState(newState, productsData);

    // Automatically expand the products view to show the filtered results
    if (window.location.hash !== '#products')
      window.history.replaceState(null, '', window.location.search + '#products');
  } else {
    setFilterState({}, productsData);
  }

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
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }
  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar when clicking a language button
  document
    .querySelectorAll<HTMLElement>('.language-switcher-sidebar .lang-btn')
    .forEach((btn) => btn.addEventListener('click', closeSidebar));
});
