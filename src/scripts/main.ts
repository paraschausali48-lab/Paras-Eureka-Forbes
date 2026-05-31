import { navigate } from 'astro:transitions/client';
import { enableSwipeToClose, handleFocusTrap } from './utils';
import { setFilterState, type FilterState } from './filters';
import { handleAppRouting, closeActiveOverlay, closePDPAndCleanURL } from './routing';
import { initScrollAnimations, initHeaderScroll } from './ui';
import { initProductNavigation } from './pdp';
import { initTelemetry } from './telemetry';
import { registerClickAction, initGlobalEventRouter } from './events';

// ============= OBSERVABILITY =============
initTelemetry();

// ============= GLOBAL EVENT LISTENERS (Run Once) =============
// Top-level module code only runs once per session, safely avoiding duplicate
// bindings during Astro View Transitions without polluting the window object.

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

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    const activeOverlay = document.querySelector('.pdp-modal.active, .filter-sidebar.open, .main-sidebar.active');
    if (activeOverlay) {
      activeOverlay.id === 'pdp-modal' ? closePDPAndCleanURL() : closeActiveOverlay();
    }
  }
  const activeModal = document.querySelector('.pdp-modal.active, .main-sidebar.active, .filter-sidebar.open');
  if (activeModal) handleFocusTrap(e, activeModal as HTMLElement);
});

window.addEventListener('popstate', () => {
  handleAppRouting();
  updateWaButtonVisibility();

  const sku = new URLSearchParams(window.location.search).get('p');
  if (sku) {
    requestAnimationFrame(() => {
      const lang = document.documentElement.lang || 'en';
      const baseUrl = import.meta.env.BASE_URL;
      navigate(`${baseUrl}${lang}/products/${sku}/`, { history: 'replace' });
    });
  } else if (document.getElementById('pdp-modal')?.classList.contains('active')) {
    closeActiveOverlay();
  }
});

window.addEventListener('hashchange', () => {
  handleAppRouting();
  updateWaButtonVisibility();
});

window.addEventListener(
  'scroll',
  () => {
    const dynamicBtn = document.getElementById('scrollToTop');
    if (dynamicBtn) {
      window.scrollY > 300 ? dynamicBtn.classList.add('show') : dynamicBtn.classList.remove('show');
    }
  },
  { passive: true },
);

// ============= TOP-LEVEL EVENT DELEGATION =============
// Attach once to the document. Survives Astro view transitions automatically.

initGlobalEventRouter();
// Manage lifecycle teardowns across Astro page transitions
let pageTransitionController: AbortController | null = null;
let swipeCleanupFns: Array<() => void> = [];

// Use Astro's page-load event instead of DOMContentLoaded to ensure JS
// re-runs and attaches to the new DOM elements when using View Transitions.
document.addEventListener('astro:page-load', function () {
  const langButtons = document.querySelectorAll<HTMLElement>('.lang-btn[data-lang]');
  const docLang = document.documentElement.lang || 'en';
  langButtons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-lang') === docLang));

  if (pageTransitionController) pageTransitionController.abort();
  pageTransitionController = new AbortController();

  // Clean up any dangling swipe listeners from the previous page
  swipeCleanupFns.forEach((cleanup) => cleanup());
  swipeCleanupFns = [];

  // ============= 1. SCROLL ANIMATIONS =============
  initScrollAnimations();

  // ============= 2. HEADER SCROLL EFFECT =============
  initHeaderScroll();

  // ============= 3. FACETED FILTERING ENGINE =============
  const filterSidebar = document.getElementById('filter-sidebar');
  const sortModal = document.getElementById('sort-modal');

  // Mobile Overlay
  let overlay = document.querySelector('.filter-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    document.body.appendChild(overlay);
  }

  // Keep touchmove block since it strictly prevents mobile scroll bleed.
  // Use AbortSignal to cleanly and automatically detach the listener on page transitions.
  overlay.addEventListener('touchmove', (e: Event) => e.preventDefault(), {
    passive: false,
    signal: pageTransitionController.signal,
  });

  // ============= 6. PDP MODAL & DYNAMIC GALLERY =============
  const pdpModal = document.getElementById('pdp-modal');

  initProductNavigation();

  // ============= 7. FAQ ACCORDION LOGIC (Lazy Loaded) =============
  if (document.querySelector('.faq-tab')) {
    import('./faq').then((module) => module.initFaq());
  }

  // ============= 9. WISHLIST & SECONDARY MODALS (Lazy Loaded) =============
  import('./wishlist').then((module) => module.initWishlistEvents());

  // Always execute once on current page load to ensure correct initial state
  updateWaButtonVisibility();

  const wishlistModal = document.getElementById('wishlist-modal');
  const mainSidebarEl = document.getElementById('main-sidebar');

  const bindSwipe = (el: HTMLElement | null | undefined, action: () => void, dir: 'down' | 'left' | 'right') => {
    if (el) {
      const cleanup = enableSwipeToClose(el, action, dir);
      if (cleanup) swipeCleanupFns.push(cleanup);
    }
  };
  bindSwipe(sortModal?.querySelector<HTMLElement>('.demo-modal-content'), closeActiveOverlay, 'down');
  bindSwipe(filterSidebar, closeActiveOverlay, 'down');
  bindSwipe(pdpModal?.querySelector<HTMLElement>('.pdp-content'), closePDPAndCleanURL, 'right');
  bindSwipe(wishlistModal?.querySelector<HTMLElement>('.demo-modal-content'), closeActiveOverlay, 'right');
  bindSwipe(mainSidebarEl, () => document.getElementById('sidebar-close')?.click(), 'left');

  // ============= 12. DATA HYDRATION & URL STATE =============
  const hydrateCatalog = () => {
    // Now that data is loaded, apply shared link parameters
    const params = new URLSearchParams(window.location.search);
    const initCats = params.get('cat');
    const initFacets = params.get('facets');
    const initQ = params.get('q');
    const initSort = params.get('sort');

    if (document.getElementById('product-grid')) {
      if (initCats || initFacets || initQ || initSort) {
        const newState: Partial<FilterState> = { categories: ['all'], facets: [], query: '', sort: 'relevance' };
        if (initCats) newState.categories = initCats.split(',');
        if (initFacets) newState.facets = initFacets.split(',');
        if (initQ) newState.query = initQ;
        if (initSort) newState.sort = initSort;
        setFilterState(newState);
        if (window.location.hash !== '#products') {
          window.history.replaceState(null, '', window.location.search + '#products');
        }
      } else {
        setFilterState({ categories: ['all'], facets: [], query: '', sort: 'relevance' });
      }
    }

    // Remove the SSG Anti-FOUC style now that JS state has successfully hydrated
    const antiFoucStyle = document.getElementById('anti-fouc-style');
    if (antiFoucStyle) antiFoucStyle.remove();

    handleAppRouting();

    const initProduct = params.get('p');
    if (initProduct) {
      // Since data is now synchronous, we can safely invoke this via routing
      handleAppRouting();
    }
  };
  hydrateCatalog();
});
