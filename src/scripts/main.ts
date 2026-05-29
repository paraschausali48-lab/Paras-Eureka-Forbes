import { navigate } from 'astro:transitions/client';
import { VENDOR_WHATSAPP } from './config';
import { debounce, enableSwipeToClose, handleFocusTrap } from './utils';
import { showToast } from './toast';
import { updateWishlistUI, renderWishlist, handleWishlistToggle, saveWishlist } from './wishlist';
import { filterState, setFilterState } from './filters';
import {
  handleAppRouting,
  closeActiveOverlay,
  forceCloseAllOverlays,
  hideProductsView,
  setLastFocused,
} from './routing';
import { initScrollAnimations, initHeaderScroll, initAccordions, initFaq } from './ui';
import { initProductModal } from './pdp';

// ============= SERVICE WORKER REGISTRATION =============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register((import.meta as any).env?.BASE_URL + 'sw.js').catch((err) => {
      console.warn('Service Worker registration failed:', err);
    });
  });
}

// Use Astro's page-load event instead of DOMContentLoaded to ensure JS
// re-runs and attaches to the new DOM elements when using View Transitions.
document.addEventListener('astro:page-load', function () {
  const closePDPAndCleanURL = () => {
    closeActiveOverlay();
    const url = new URL(window.location.href);
    if (url.searchParams.has('p')) {
      url.searchParams.delete('p');
      window.history.pushState(null, '', url);
    }
  };

  // ============= 0.1 LANGUAGE SWITCHER =============
  const langButtons = document.querySelectorAll<HTMLElement>('.lang-btn[data-lang]');
  const docLang = document.documentElement.lang || 'en';

  langButtons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-lang') === docLang));

  langButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const lang = this.getAttribute('data-lang');
      if (lang && lang !== docLang) {
        try {
          localStorage.setItem('preferredLanguage', lang);
        } catch (e) {}
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0 && ['en', 'hi', 'mr', 'gu'].includes(pathParts[0])) {
          pathParts[0] = lang;
          url.pathname = '/' + pathParts.join('/');
        } else {
          url.pathname = `/${lang}${url.pathname}`;
        }
        navigate(url.pathname + url.search + url.hash);
      }
    });
  });

  // ============= 0.5 GLOBAL KEYBOARD ACCESSIBILITY =============
  // Allow users to close modals using the Escape key
  // Check if listener already exists to avoid memory leaks during Astro View Transitions
  if (!(window as any).__keydownListenerAdded) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeOverlay = document.querySelector('.pdp-modal.active, .filter-sidebar.open, .main-sidebar.active');
        if (activeOverlay) {
          if (activeOverlay.id === 'pdp-modal') {
            closePDPAndCleanURL();
          } else {
            closeActiveOverlay();
          }
        }
      }

      // Focus trapping for active modals
      const activeModal = document.querySelector('.pdp-modal.active, .main-sidebar.active, .filter-sidebar.open');
      if (activeModal) {
        handleFocusTrap(e, activeModal as HTMLElement);
      }
    });
    (window as any).__keydownListenerAdded = true;
  }

  // ============= 1. SCROLL ANIMATIONS =============
  initScrollAnimations();

  // ============= 2. HEADER SCROLL EFFECT =============
  initHeaderScroll();

  // ============= 2.8 ACCORDION GENERATION =============
  initAccordions();

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
  let overlay = document.querySelector('.filter-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    // Lock background scroll when dragging on the overlay
    overlay.addEventListener('touchmove', (e: Event) => e.preventDefault(), { passive: false });
    document.body.appendChild(overlay);
  }

  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'filter');
      window.history.pushState(null, '', url);
      handleAppRouting();
    });
  }

  if (filterClose) filterClose.addEventListener('click', closeActiveOverlay);
  if (overlay) overlay.addEventListener('click', closeActiveOverlay);

  // Wire up sorting events
  if (desktopSort) {
    desktopSort.addEventListener('change', (e: Event) => {
      setFilterState({ sort: (e.target as HTMLSelectElement).value });
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
      handleAppRouting();
    });

    document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
      btn.addEventListener('click', (e: Event) => {
        const sortValue = (e.currentTarget as HTMLElement).dataset.sort;

        if (sortValue) setFilterState({ sort: sortValue });

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
      setFilterState({ categories: newCats });
    });
  });

  document.querySelectorAll<HTMLInputElement>('.filter-facet').forEach((cb) =>
    cb.addEventListener('change', function () {
      let newFacets: string[] = [...filterState.facets];
      if (this.checked) newFacets.push(this.value);
      else newFacets = newFacets.filter((f) => f !== this.value);
      setFilterState({ facets: newFacets });
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
        setFilterState({ query: (searchInput as HTMLInputElement).value });
      }, 300),
    );
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      setFilterState({ categories: ['all'], facets: [], query: '' });
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

        setFilterState({ categories: [navCat], facets: [], query: '' });
      } else if (filterVal) {
        let targetCat = 'Water Purifier';
        if (['robotic', 'canister', 'handheld', 'wet-dry'].includes(filterVal)) targetCat = 'Vacuum Cleaner';
        else if (['Air Purifier', 'Water Softener'].includes(filterVal)) targetCat = filterVal;

        setFilterState({ categories: [targetCat], facets: [filterVal], query: '' });
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

  document.querySelectorAll('.pdp-close, .wishlist-close, .sort-close').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('#pdp-modal')) {
        closePDPAndCleanURL();
      } else {
        closeActiveOverlay();
      }
    }),
  );

  // Allow closing any modal by tapping its dark background
  document.querySelectorAll<HTMLElement>('.pdp-modal').forEach((modal) => {
    modal.addEventListener('click', (e: Event) => {
      if (e.target === modal) {
        if (modal.id === 'pdp-modal') closePDPAndCleanURL();
        else closeActiveOverlay();
      }
    });
  });

  initProductModal();

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
      handleAppRouting();
    });
  });

  if (wishlistClearBtn) {
    wishlistClearBtn.addEventListener('click', () => {
      saveWishlist([]);
      renderWishlist(wishlistModal, wishlistContainer, wishlistClearBtn);
      showToast(document.body.dataset.toastClear || 'Wishlist cleared');
    });
  }

  document.getElementById('pdp-wishlist-btn')?.addEventListener('click', function () {
    const sku = document.getElementById('pdp-sku')!.querySelector('span')!.textContent!;
    handleWishlistToggle(sku);
  });
  updateWishlistUI();

  // ============= 10. APP-LIKE ROUTING & GESTURES =============
  // Protect global window listeners from being duplicated on Astro View Transitions
  if (!(window as any).__routingListenersAdded) {
    window.addEventListener('popstate', () => {
      handleAppRouting();

      // Handle History API for Product Detail Modal
      const urlParams = new URLSearchParams(window.location.search);
      const sku = urlParams.get('p');
      const pdpModal = document.getElementById('pdp-modal');

      if (sku) {
        setTimeout(() => {
          const card = document.querySelector(`.product-card[data-sku="${sku}"]`) as HTMLElement;
          if (card && !pdpModal?.classList.contains('active')) card.click();
        }, 100);
      } else if (pdpModal?.classList.contains('active')) {
        closeActiveOverlay();
      }
    });
    window.addEventListener('hashchange', () => handleAppRouting());

    window.addEventListener('popstate', updateWaButtonVisibility);
    window.addEventListener('hashchange', updateWaButtonVisibility);

    (window as any).__routingListenersAdded = true;
  }

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

  // Always execute once on current page load to ensure correct initial state
  updateWaButtonVisibility();

  if (sortModal) enableSwipeToClose(sortModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'down');
  if (filterSidebar) enableSwipeToClose(filterSidebar, closeActiveOverlay, 'down');
  if (pdpModal) enableSwipeToClose(pdpModal.querySelector<HTMLElement>('.pdp-content'), closePDPAndCleanURL, 'right');
  if (wishlistModal)
    enableSwipeToClose(wishlistModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'right');
  const mainSidebarEl = document.getElementById('main-sidebar');
  if (mainSidebarEl) enableSwipeToClose(mainSidebarEl, () => document.getElementById('sidebar-close')?.click(), 'left');

  // ============= 11. SCROLL TO TOP BUTTON =============
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    // Protect global scroll listener from leaking
    if (!(window as any).__scrollListenerAdded) {
      window.addEventListener(
        'scroll',
        () => {
          const dynamicBtn = document.getElementById('scrollToTop');
          if (!dynamicBtn) return;

          if (window.scrollY > 300) dynamicBtn.classList.add('show');
          else dynamicBtn.classList.remove('show');
        },
        { passive: true },
      );
      (window as any).__scrollListenerAdded = true;
    }

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============= 12. DATA HYDRATION & URL STATE =============
  const hydrateCatalog = async () => {
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
      setFilterState(newState);
      if (window.location.hash !== '#products')
        window.history.replaceState(null, '', window.location.search + '#products');
    } else {
      setFilterState({});
    }

    handleAppRouting();

    const initProduct = params.get('p');
    if (initProduct) {
      setTimeout(() => {
        const card = document.querySelector(`.product-card[data-sku="${initProduct}"]`) as HTMLElement;
        if (card) card.click();
      }, 100);
    }
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
