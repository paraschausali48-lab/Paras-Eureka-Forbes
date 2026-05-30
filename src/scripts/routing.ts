import { navigate } from 'astro:transitions/client';
import { registerClickAction } from './events';

export let lastFocused: HTMLElement | null = null;
export function setLastFocused(el: HTMLElement | null) {
  lastFocused = el;
}

export function forceCloseAllOverlays() {
  document.getElementById('filter-sidebar')?.classList.remove('open');
  document.getElementById('sort-modal')?.classList.remove('active');
  document.getElementById('wishlist-modal')?.classList.remove('active');
  document.getElementById('pdp-modal')?.classList.remove('active');
  document.querySelector('.filter-overlay')?.classList.remove('active');

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

export function closeActiveOverlay() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('view') || params.has('p')) {
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      params.delete('view');
      params.delete('p');
      const url = new URL(window.location.href);
      url.search = params.toString();
      window.history.replaceState(null, '', url);
      forceCloseAllOverlays();
    }
  } else {
    forceCloseAllOverlays();
  }
}

export const closePDPAndCleanURL = () => {
  closeActiveOverlay();
  const url = new URL(window.location.href);
  if (url.searchParams.has('p')) {
    url.searchParams.delete('p');
    window.history.pushState(null, '', url);
  }
};

export function hideProductsView() {
  const prodEl = document.getElementById('products');
  if (prodEl) prodEl.style.display = 'none';
  document.body.classList.remove('products-visible');
  document.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
  const clearAllBtn = document.getElementById('filter-clear-all');
  if (clearAllBtn) clearAllBtn.click();
}

export function handleAppRouting() {
  const params = new URLSearchParams(window.location.search);
  const productSku = params.get('p');
  const view = params.get('view');
  const hash = window.location.hash;

  forceCloseAllOverlays();

  if (productSku) {
    const targetCard = document.querySelector<HTMLElement>(`.product-card[data-sku="${productSku}"]`);
    if (targetCard) {
      const lang = document.documentElement.lang || 'en';
      const baseUrl = import.meta.env.BASE_URL;
      navigate(`${baseUrl}${lang}/products/${productSku}/`, { history: 'replace' });
    }
  } else if (view === 'filter') {
    document.getElementById('filter-sidebar')?.classList.add('open');
    document.querySelector('.filter-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (view === 'sort') {
    document.getElementById('sort-modal')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (view === 'wishlist') {
    document.getElementById('wishlist-modal')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (hash === '#products') {
    const productsEl = document.getElementById('products');
    if (productsEl) productsEl.style.display = '';
    document.body.classList.add('products-visible');
  } else if (!hash || hash === '') {
    hideProductsView();
  }
}

// ============= ROUTING EVENT BINDINGS =============
registerClickAction({
  selector: '.pdp-close, .wishlist-close, .sort-close',
  handle: (el: HTMLElement) => {
    el.closest('#pdp-modal') ? closePDPAndCleanURL() : closeActiveOverlay();
  },
});

registerClickAction({
  selector: '.pdp-modal',
  handle: (el: HTMLElement, e: Event) => {
    // Clicking the backdrop directly closes the modal
    if (e.target === el) {
      el.id === 'pdp-modal' ? closePDPAndCleanURL() : closeActiveOverlay();
    }
  },
});

registerClickAction({
  selector: '#filter-mobile-toggle',
  handle: () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'filter');
    window.history.pushState(null, '', url);
    handleAppRouting();
  },
});

registerClickAction({
  selector: '#filter-sidebar-close, .filter-overlay',
  handle: () => closeActiveOverlay(),
});

registerClickAction({
  selector: '.vf-back-btn',
  handle: () => (window.location.hash === '#products' ? window.history.back() : hideProductsView()),
});

registerClickAction({
  selector: '#sidebar-toggle',
  handle: () => {
    document.getElementById('main-sidebar')?.classList.add('active');
    document.getElementById('main-sidebar-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('sidebar-close')?.focus(), 50);
  },
});

registerClickAction({
  selector: '#sidebar-close, #main-sidebar-overlay',
  handle: () => {
    document.getElementById('main-sidebar')?.classList.remove('active');
    document.getElementById('main-sidebar-overlay')?.classList.remove('active');
    if (!document.querySelector('.pdp-modal.active, .filter-sidebar.open')) document.body.style.overflow = '';
    if (window.location.hash === '#faq' || window.location.hash === '#contact')
      window.history.pushState(null, '', window.location.pathname + window.location.search);
  },
});
