import { renderWishlist } from './wishlist.js';

export let lastFocused = null;
export function setLastFocused(el) {
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
  const hash = window.location.hash;
  if (['#view-filter', '#view-sort', '#view-wishlist'].includes(hash) || hash.startsWith('#EF-')) {
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      window.location.hash = '#products';
    }
  } else {
    forceCloseAllOverlays();
  }
}

export function hideProductsView() {
  const prodEl = document.getElementById('products');
  if (prodEl) prodEl.style.display = 'none';
  document.body.classList.remove('products-visible');
  document.querySelectorAll('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
  const vfMain = document.getElementById('vf-main');
  if (vfMain) vfMain.style.display = 'flex';
  document.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
  const clearAllBtn = document.getElementById('filter-clear-all');
  if (clearAllBtn) clearAllBtn.click();
}

export function handleAppRouting() {
  const hash = window.location.hash;
  forceCloseAllOverlays();

  if (hash.startsWith('#EF-')) {
    const sku = hash.substring(1);
    const targetCard = Array.from(document.querySelectorAll('.product-card')).find((c) => {
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
    if (targetCard && !document.getElementById('pdp-modal')?.classList.contains('active')) {
      document.getElementById('products').style.display = '';
      document.body.classList.add('products-visible');
      targetCard.click();
    }
  } else if (hash === '#view-filter') {
    document.getElementById('filter-sidebar')?.classList.add('open');
    document.querySelector('.filter-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (hash === '#view-sort') {
    document.getElementById('sort-modal')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (hash === '#view-wishlist') {
    renderWishlist(
      document.querySelectorAll('.product-card'),
      document.getElementById('wishlist-modal'),
      document.getElementById('wishlist-items-container'),
      document.getElementById('wishlist-clear-all'),
    );
    document.getElementById('wishlist-modal')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else if (hash === '#products') {
    document.getElementById('products').style.display = '';
    document.body.classList.add('products-visible');
  } else if (!hash || hash === '') {
    hideProductsView();
  }
}
