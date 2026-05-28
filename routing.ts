import { renderWishlist } from './wishlist';
import type { Product } from './types';

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

export function hideProductsView() {
  const prodEl = document.getElementById('products');
  if (prodEl) prodEl.style.display = 'none';
  document.body.classList.remove('products-visible');
  document.querySelectorAll<HTMLElement>('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
  const vfMain = document.getElementById('vf-main');
  if (vfMain) vfMain.style.display = 'flex';
  document.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
  const clearAllBtn = document.getElementById('filter-clear-all');
  if (clearAllBtn) clearAllBtn.click();
}

export function handleAppRouting(productsData: Product[] = []) {
  const params = new URLSearchParams(window.location.search);
  const productSku = params.get('p');
  const view = params.get('view');
  const hash = window.location.hash;

  forceCloseAllOverlays();

  if (productSku) {
    const targetCard = document.querySelector<HTMLElement>(`.product-card[data-sku="${productSku}"]`);
    if (targetCard && !document.getElementById('pdp-modal')?.classList.contains('active')) {
      const productsEl = document.getElementById('products');
      if (productsEl) productsEl.style.display = '';
      document.body.classList.add('products-visible');
      targetCard.click();
    }
  } else if (view === 'filter') {
    document.getElementById('filter-sidebar')?.classList.add('open');
    document.querySelector('.filter-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (view === 'sort') {
    document.getElementById('sort-modal')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (view === 'wishlist') {
    renderWishlist(
      productsData,
      document.getElementById('wishlist-modal'),
      document.getElementById('wishlist-items-container'),
      document.getElementById('wishlist-clear-all'),
    );
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
