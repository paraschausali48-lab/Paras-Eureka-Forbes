import { navigate } from 'astro:transitions/client';
import { debounce, enableSwipeToClose, handleFocusTrap } from './utils';
import { filterState, setFilterState, setProductsData } from './filters';
import { handleAppRouting, closeActiveOverlay, hideProductsView } from './routing';
import { initScrollAnimations, initHeaderScroll, initAccordions } from './ui';
import { initProductNavigation } from './pdp';
import { initTelemetry } from './telemetry';

// ============= OBSERVABILITY =============
initTelemetry();

// ============= SERVICE WORKER REGISTRATION =============
if ('serviceWorker' in navigator) {
  // Defer service worker registration until after the page has fully loaded
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');

      // Automatically check for deployment updates every hour
      setInterval(() => registration.update(), 1000 * 60 * 60);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[Service Worker] New update found. Forcing activation...');
              window.location.reload();
            }
          });
        }
      });
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
    }
  });
}

// ============= GLOBAL EVENT LISTENERS (Run Once) =============
// Top-level module code only runs once per session, safely avoiding duplicate
// bindings during Astro View Transitions without polluting the window object.

const closePDPAndCleanURL = () => {
  closeActiveOverlay();
  const url = new URL(window.location.href);
  if (url.searchParams.has('p')) {
    url.searchParams.delete('p');
    window.history.pushState(null, '', url);
  }
};

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
      document.querySelector<HTMLElement>(`.product-card[data-sku="${sku}"]`)?.click();
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

// Initialize global debounced search handler outside of lifecycles
const handleSearchInput = debounce((e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.id !== 'product-search') return;

  const prodEl = document.getElementById('products');
  if (prodEl && prodEl.style.display === 'none') {
    prodEl.style.display = '';
    document.body.classList.add('products-visible');
    prodEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  setFilterState({ query: target.value });
}, 300);

document.addEventListener('input', handleSearchInput);

// ============= TOP-LEVEL EVENT DELEGATION =============
// Attach once to the document. Survives Astro view transitions automatically.

// Action Map for Global Clicks (Command Pattern)
const clickHandlers = [
  {
    selector: '.visual-filter-btn',
    handle: (el: HTMLElement) => {
      if (window.location.hash !== '#products') {
        window.history.pushState(null, '', '#products');
      }
      const productsEl = document.getElementById('products');
      if (productsEl) productsEl.style.display = '';
      document.body.classList.add('products-visible');

      const navCat = el.dataset.navCategory;
      const filterVal = el.dataset.filter;

      const parentContainer = el.closest('.visual-filters');
      if (parentContainer) {
        parentContainer.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
      }
      el.classList.add('active');

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
    },
  },
  {
    selector: '.pdp-close, .wishlist-close, .sort-close',
    handle: (el: HTMLElement) => {
      el.closest('#pdp-modal') ? closePDPAndCleanURL() : closeActiveOverlay();
    },
  },
  {
    selector: '.lang-btn',
    handle: (el: HTMLElement) => {
      const lang = el.getAttribute('data-lang');
      const docLang = document.documentElement.lang || 'en';
      if (lang && lang !== docLang) {
        try {
          localStorage.setItem('preferredLanguage', lang);
        } catch (e) {}
        const url = new URL(window.location.href);
        const baseUrl = import.meta.env.BASE_URL;
        const pathParts = url.pathname.replace(baseUrl, '').split('/').filter(Boolean);
        if (pathParts.length > 0 && ['en', 'hi', 'mr', 'gu'].includes(pathParts[0])) {
          pathParts[0] = lang;
          url.pathname = baseUrl + pathParts.join('/');
        } else {
          url.pathname = baseUrl + lang + '/' + pathParts.join('/');
        }
        navigate(url.pathname + url.search + url.hash);
      }
      const mainSidebar = document.getElementById('main-sidebar');
      if (mainSidebar?.classList.contains('active')) document.getElementById('sidebar-close')?.click();
    },
  },
  {
    selector: '#filter-mobile-toggle',
    handle: () => {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'filter');
      window.history.pushState(null, '', url);
      handleAppRouting();
    },
  },
  {
    selector: '#sort-mobile-toggle',
    handle: () => {
      document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sort === filterState.sort);
      });
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'sort');
      window.history.pushState(null, '', url);
      handleAppRouting();
    },
  },
  {
    selector: '.sort-option-btn',
    handle: (el: HTMLElement) => {
      const sortValue = el.dataset.sort;
      if (sortValue) setFilterState({ sort: sortValue });
      setTimeout(() => closeActiveOverlay(), 250);
    },
  },
  {
    selector: '#filter-sidebar-close, .filter-overlay',
    handle: () => closeActiveOverlay(),
  },
  {
    selector: '#filter-clear-all',
    handle: () => setFilterState({ categories: ['all'], facets: [], query: '' }),
  },
  {
    selector: '.vf-back-btn',
    handle: () => (window.location.hash === '#products' ? window.history.back() : hideProductsView()),
  },
  {
    selector: '#sidebar-toggle',
    handle: () => {
      document.getElementById('main-sidebar')?.classList.add('active');
      document.getElementById('main-sidebar-overlay')?.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('sidebar-close')?.focus(), 50);
    },
  },
  {
    selector: '#sidebar-close, #main-sidebar-overlay',
    handle: () => {
      document.getElementById('main-sidebar')?.classList.remove('active');
      document.getElementById('main-sidebar-overlay')?.classList.remove('active');
      if (!document.querySelector('.pdp-modal.active, .filter-sidebar.open')) {
        document.body.style.overflow = '';
      }
      if (window.location.hash === '#faq' || window.location.hash === '#contact') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    },
  },
  {
    selector: '#scrollToTop',
    handle: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  },
];

document.addEventListener('click', (e: Event) => {
  const target = e.target as HTMLElement;

  // Special case: clicking the backdrop of a modal directly
  const pdpModal = target.closest('.pdp-modal');
  if (pdpModal && target === pdpModal) {
    pdpModal.id === 'pdp-modal' ? closePDPAndCleanURL() : closeActiveOverlay();
    return;
  }

  // Declarative Event Router
  for (const action of clickHandlers) {
    const matchedEl = target.closest(action.selector) as HTMLElement;
    if (matchedEl) {
      action.handle(matchedEl);
      return; // Ensure only one handler executes per click
    }
  }
});

document.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (target.id === 'desktop-sort-select') {
    setFilterState({ sort: target.value });
    document.querySelectorAll<HTMLElement>('.sort-option-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sort === target.value);
    });
  }
});

document.addEventListener('submit', (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.closest('.header-search')) {
    e.preventDefault();
    document.getElementById('product-search')?.blur();
  }
});

// Manage lifecycle teardowns across Astro page transitions
let pageTransitionController: AbortController | null = null;

// Use Astro's page-load event instead of DOMContentLoaded to ensure JS
// re-runs and attaches to the new DOM elements when using View Transitions.
document.addEventListener('astro:page-load', function () {
  const langButtons = document.querySelectorAll<HTMLElement>('.lang-btn[data-lang]');
  const docLang = document.documentElement.lang || 'en';
  langButtons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-lang') === docLang));

  if (pageTransitionController) pageTransitionController.abort();
  pageTransitionController = new AbortController();

  // ============= 1. SCROLL ANIMATIONS =============
  initScrollAnimations();

  // ============= 2. HEADER SCROLL EFFECT =============
  initHeaderScroll();

  // ============= 2.8 ACCORDION GENERATION =============
  initAccordions();

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
  if (sortModal) enableSwipeToClose(sortModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'down');
  if (filterSidebar) enableSwipeToClose(filterSidebar, closeActiveOverlay, 'down');
  if (pdpModal) enableSwipeToClose(pdpModal.querySelector<HTMLElement>('.pdp-content'), closePDPAndCleanURL, 'right');
  if (wishlistModal)
    enableSwipeToClose(wishlistModal.querySelector<HTMLElement>('.pdp-content'), closeActiveOverlay, 'right');
  const mainSidebarEl = document.getElementById('main-sidebar');
  if (mainSidebarEl) enableSwipeToClose(mainSidebarEl, () => document.getElementById('sidebar-close')?.click(), 'left');

  // ============= 12. DATA HYDRATION & URL STATE =============
  const hydrateCatalog = () => {
    try {
      // Hydrate instantly from the DOM to eliminate network race conditions
      const dataScript = document.getElementById('product-data');
      if (dataScript) {
        setProductsData(JSON.parse(dataScript.textContent || '[]'));
      }
    } catch (err) {
      console.error('Failed to parse product data:', err);
    }

    // Now that data is loaded, apply shared link parameters
    const params = new URLSearchParams(window.location.search);
    const initCats = params.get('cat');
    const initFacets = params.get('facets');
    const initQ = params.get('q');

    if (initCats || initFacets || initQ) {
      const newState: Partial<typeof filterState> = { categories: ['all'], facets: [], query: '' };
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
      // Since data is now synchronous, we can safely invoke this via routing
      handleAppRouting();
    }
  };
  hydrateCatalog();
});
