import { navigate } from 'astro:transitions/client';
import { registerClickAction } from './events';

export let lastFocused: HTMLElement | null = null;
export function setLastFocused(el: HTMLElement | null) {
  lastFocused = el;
}

export function forceCloseAllOverlays() {
  const overlays = [
    { id: 'filter-sidebar', class: 'open' },
    { id: 'sort-modal', class: 'active' },
    { id: 'wishlist-modal', class: 'active' },
    { id: 'pdp-modal', class: 'active' },
  ];

  overlays.forEach((overlay) => {
    const el = document.getElementById(overlay.id);
    if (el) {
      el.classList.remove(overlay.class);
      el.setAttribute('aria-hidden', 'true');
    }
  });
  document.querySelector('.filter-overlay')?.classList.remove('active');

  const mainSidebar = document.getElementById('main-sidebar');
  const mainSidebarOverlay = document.getElementById('main-sidebar-overlay');
  if (mainSidebar) {
    mainSidebar.classList.remove('active');
    mainSidebar.setAttribute('aria-hidden', 'true');
  }
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
    const el = document.getElementById('filter-sidebar');
    if (el) {
      el.classList.add('open');
      el.setAttribute('aria-hidden', 'false');
      setTimeout(
        () =>
          el
            .querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ?.focus(),
        50,
      );
    }
    document.querySelector('.filter-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (view === 'sort') {
    const el = document.getElementById('sort-modal');
    if (el) {
      el.classList.add('active');
      el.setAttribute('aria-hidden', 'false');
      setTimeout(
        () =>
          el
            .querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ?.focus(),
        50,
      );
    }
    document.body.style.overflow = 'hidden';
  } else if (view === 'wishlist') {
    const el = document.getElementById('wishlist-modal');
    if (el) {
      el.classList.add('active');
      el.setAttribute('aria-hidden', 'false');
      setTimeout(
        () =>
          el
            .querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ?.focus(),
        50,
      );
    }
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
  handle: () => {
    if (window.location.hash === '#products') {
      if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        hideProductsView();
      }
    } else {
      hideProductsView();
    }
  },
});

registerClickAction({
  selector: '#sidebar-toggle',
  handle: () => {
    const el = document.getElementById('main-sidebar');
    if (el) {
      el.classList.add('active');
      el.setAttribute('aria-hidden', 'false');
    }
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
