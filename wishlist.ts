import { showToast } from './toast';
import { applyTranslations } from './translations';
import { escapeHTML } from './utils';
import type { Product } from './types';

export function getWishlist(): string[] {
  return JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
}

export function saveWishlist(list: string[]) {
  localStorage.setItem('ef_wishlist', JSON.stringify(list));
  updateWishlistUI();
}

export function updateWishlistUI() {
  const list = getWishlist();
  document.querySelectorAll<HTMLElement>('.wishlist-badge').forEach((badge) => {
    badge.style.display = list.length > 0 ? 'flex' : 'none';
    badge.textContent = list.length.toString();
  });
  const pdpWishBtn = document.getElementById('pdp-wishlist-btn');
  if (pdpWishBtn) {
    const pdpSkuEl = document.getElementById('pdp-sku');
    if (pdpSkuEl) {
      const currentSku = pdpSkuEl.querySelector('span')!.textContent!;
      pdpWishBtn.innerHTML = list.includes(currentSku)
        ? '<svg width="24" height="24" fill="#e63946" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    }
  }
}

export function renderWishlist(
  productsData: Product[],
  wishlistModal: HTMLElement | null,
  wishlistContainer: HTMLElement | null,
  wishlistClearBtn: HTMLElement | null,
) {
  const list = getWishlist();
  if (!wishlistContainer) return;
  wishlistContainer.innerHTML = '';
  if (wishlistClearBtn) wishlistClearBtn.style.display = list.length > 0 ? 'block' : 'none';

  if (list.length === 0) {
    wishlistContainer.innerHTML =
      '<div class="wishlist-empty"><p data-i18n="wishlist_empty">Your wishlist is currently empty.</p></div>';
    applyTranslations(document.documentElement.lang || 'en');
    return;
  }

  list.forEach((sku) => {
    const product = productsData.find((p: Product) => {
      const generatedSku =
        'EF-' +
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .toUpperCase();
      return generatedSku === sku;
    });

    if (product) {
      const title = product.name;
      const category = product.category;
      const priceText = `MOP ₹${product.mop.toLocaleString('en-IN')}`;

      const item = document.createElement('div');
      item.className = 'wishlist-item';
      item.innerHTML = `<div class="wishlist-item-details"><div style="font-size:0.8rem; color:var(--color-primary-light); font-weight:700; margin-bottom:2px;">${escapeHTML(category)}</div><div class="wishlist-item-title">${escapeHTML(title)}</div><div class="wishlist-item-price">${escapeHTML(priceText)}</div></div><button class="wishlist-item-remove" data-sku="${escapeHTML(sku)}">×</button>`;

      item.querySelector('.wishlist-item-title')!.addEventListener('click', () => {
        if (wishlistModal) wishlistModal.classList.remove('active');
        document.body.style.overflow = '';
        const productsEl = document.getElementById('products');
        if (productsEl) productsEl.style.display = '';

        const card = document.querySelector<HTMLElement>(`.product-card[data-sku="${sku}"]`);
        if (card) {
          card.click();
        } else {
          // Fallback if item is filtered out: redirect to item URL
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          url.searchParams.set('p', sku);
          window.location.href = url.toString();
        }
      });

      item.querySelector('.wishlist-item-remove')!.addEventListener('click', (e: Event) => {
        saveWishlist(getWishlist().filter((s) => s !== (e.target as HTMLElement).dataset.sku));
        renderWishlist(productsData, wishlistModal, wishlistContainer, wishlistClearBtn);
      });
      wishlistContainer.appendChild(item);
    }
  });
}

export function handleWishlistToggle(sku: string) {
  let list = getWishlist();
  if (list.includes(sku)) {
    list = list.filter((item) => item !== sku);
    showToast('toast_wishlist_remove');
  } else {
    list.push(sku);
    showToast('toast_wishlist_add');
  }
  saveWishlist(list);
}
