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
import { initScrollAnimations, initHeaderScroll, initAccordions, initFaq } from './ui';
import { initProductNavigation } from './pdp';

// ============= SERVICE WORKER REGISTRATION =============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register((import.meta as any).env?.BASE_URL + 'sw.js').catch((err) => {
      console.warn('Service Worker registration failed:', err);
    });
  });
}

let productsData: Product[] = [];
let globalsInitialized = false;

document.addEventListener('astro:page-load', function () {
  // ============= 0.5 GLOBAL KEYBOARD ACCESSIBILITY =============
  // Allow users to close modals using the Escape key
  if (!globalsInitialized) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeOverlay = document.querySelector('.filter-sidebar.open, .main-sidebar.active');
        if (activeOverlay) {
          closeActiveOverlay();
        }
      }
    });
  }

  // ============= 1. SCROLL ANIMATIONS =============
  initScrollAnimations();

  // ============= 2. HEADER SCROLL EFFECT =============
  initHeaderScroll();

  // ============= 2.8 ACCORDION GENERATION =============
  initAccordions();

  // ============= 3. FACETED FILTERING ENGINE =============
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterToggle = document.getElementById('filter-mobile-toggle');
  const filterClose = document.getElementById('filter-sidebar-close');
  const clearAllBtn = document.getElementById('filter-clear-all');
  const searchInput = document.getElementById('product-search');

  const searchForm = document.getElementById('header-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      if (searchInput) searchInput.blur();
    });
  }

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
  document
    .querySelectorAll('.wishlist-close, .sort-close')
    .forEach((btn) => btn.addEventListener('click', closeActiveOverlay));

  initProductNavigation();

  // ============= 7. FAQ ACCORDION LOGIC =============
  initFaq();

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
  if (!globalsInitialized) {
    window.addEventListener('popstate', () => {
      handleAppRouting(productsData);
    });
    window.addEventListener('hashchange', () => handleAppRouting(productsData));
  }

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
  if (!globalsInitialized) {
    window.addEventListener('popstate', updateWaButtonVisibility);
    window.addEventListener('hashchange', updateWaButtonVisibility);
  }
  updateWaButtonVisibility();

  if (sortModal) enableSwipeToClose(sortModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'down');
  if (filterSidebar) enableSwipeToClose(filterSidebar, closeActiveOverlay, 'down');
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

  // ============= 12. DATA HYDRATION & URL STATE =============
  const hydrateCatalog = async () => {
    try {
      const response = await fetch('products.json');
      if (!response.ok) throw new Error('HTTP status ' + response.status);
      productsData = await response.json();
    } catch (error) {
      console.error('Failed to load products.json:', error);
      const grid = document.getElementById('product-grid');
      if (grid)
        grid.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">Error loading products.</p>';
      return;
    }

    // Now that data is loaded, apply shared link parameters
    const params = new URLSearchParams(window.location.search);
    const initCats = params.get('cat');
    const initFacets = params.get('facets');
    const initQ = params.get('q');

    if (initCats || initFacets || initQ) {
      const newState: any = { categories: ['all'], facets: [], query: '' };
      if (initCats) newState.categories = initCats.split(',');
      if (initFacets) newState.facets = initFacets.split(',');
      if (initQ) newState.query = initQ;
      setFilterState(newState, productsData);
      if (window.location.hash !== '#products')
        window.history.replaceState(null, '', window.location.search + '#products');
    } else {
      setFilterState({}, productsData);
    }

    handleAppRouting(productsData);
  };
  hydrateCatalog(); // Execute without blocking the thread

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

    if (!document.querySelector('.filter-sidebar.open')) {
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

  document.querySelectorAll<HTMLElement>('.sidebar-link').forEach((link) => {
    link.addEventListener('click', () => document.getElementById('sidebar-close')?.click());
  });

  globalsInitialized = true;
});
