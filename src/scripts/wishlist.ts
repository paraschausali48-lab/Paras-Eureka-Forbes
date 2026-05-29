import { navigate } from 'astro:transitions/client';
import { showToast } from './toast';
import { escapeHTML, getSku } from './utils';
import { allProducts } from './filters';
import { handleAppRouting } from './routing';

export function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
  } catch (e) {
    console.warn('Failed to read wishlist from local storage', e);
    return [];
  }
}

export function saveWishlist(list: string[]) {
  try {
    localStorage.setItem('ef_wishlist', JSON.stringify(list));
    updateWishlistUI();
  } catch (e) {
    console.warn('Failed to save wishlist to local storage', e);
  }
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
      const currentSku = pdpSkuEl.querySelector('span')?.textContent?.trim();
      if (currentSku) {
        pdpWishBtn.innerHTML = list.includes(currentSku)
          ? '<svg width="24" height="24" fill="#e63946" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
          : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
      }
    }
  }
}

export function renderWishlist(
  wishlistModal: HTMLElement | null,
  wishlistContainer: HTMLElement | null,
  wishlistClearBtn: HTMLElement | null,
) {
  const list = getWishlist();
  if (!wishlistContainer) return;
  wishlistContainer.innerHTML = '';
  if (wishlistClearBtn) wishlistClearBtn.style.display = list.length > 0 ? 'block' : 'none';

  if (list.length === 0) {
    const emptyText = document.body.dataset.wishlistEmpty || 'Your wishlist is currently empty.';
    wishlistContainer.innerHTML = `<div class="wishlist-empty"><p>${emptyText}</p></div>`;
    return;
  }

  list.forEach((sku) => {
    const product = allProducts.find((p) => getSku(p.name) === sku);
    // Fallback to DOM in case allProducts hasn't hydrated yet (e.g., immediate page load race condition)
    const card = document.querySelector<HTMLElement>(`.product-card[data-sku="${sku}"]`);

    if (product || card) {
      const title = product ? product.name : card?.querySelector('h3')?.textContent || sku;
      const category = product
        ? product.category
        : card?.querySelector('.product-tag')?.getAttribute('data-category') || '';
      const priceText = product
        ? `₹${product.mop.toLocaleString('en-IN')}`
        : card?.querySelector('.price')?.textContent || '';

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
          const lang = document.documentElement.lang || 'en';
          navigate(`/${lang}/products/${sku}`);
        }
      });

      item.querySelector('.wishlist-item-remove')!.addEventListener('click', (e: Event) => {
        saveWishlist(getWishlist().filter((s) => s !== (e.target as HTMLElement).dataset.sku));
        renderWishlist(wishlistModal, wishlistContainer, wishlistClearBtn);
      });
      wishlistContainer.appendChild(item);
    }
  });
}

export function handleWishlistToggle(sku: string) {
  let list = getWishlist();
  if (list.includes(sku)) {
    list = list.filter((item) => item !== sku);
    showToast(document.body.dataset.toastRemove || 'Removed from Wishlist');
  } else {
    list.push(sku);
    showToast(document.body.dataset.toastAdd || 'Added to Wishlist!');
  }
  saveWishlist(list);
}

export function initWishlistEvents() {
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
    const pdpSkuEl = document.getElementById('pdp-sku');
    if (pdpSkuEl) {
      const sku = pdpSkuEl.querySelector('span')!.textContent!;
      handleWishlistToggle(sku);
    }
  });

  updateWishlistUI();
}
