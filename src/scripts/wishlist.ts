import { atom } from 'nanostores';
import { showToast } from './toast';
import { handleAppRouting } from './routing';

export function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
  } catch (e) {
    console.warn('Failed to read wishlist from local storage', e);
    return [];
  }
}

// 1. Initialize with an empty array so the server and client start with the same state.
export const $wishlist = atom<string[]>([]);

// 2. Check if we are running in the browser (client-side)
if (typeof window !== 'undefined') {
  // Read the existing wishlist from localStorage after the script loads
  const storedWishlist = getWishlist();
  if (storedWishlist.length > 0) {
    $wishlist.set(storedWishlist);
  }

  // 3. Automatically sync the store back to localStorage whenever it changes
  $wishlist.listen((newWishlist) => {
    localStorage.setItem('ef_wishlist', JSON.stringify(newWishlist));
  });
}

export function saveWishlist(list: string[]) {
  try {
    $wishlist.set(list);
    updateWishlistUI();
  } catch (e) {
    showToast(document.body.dataset.toastError || 'Unable to save wishlist. Storage may be restricted.');
    console.warn('Failed to update wishlist state', e);
  }
}

export function updateWishlistUI() {
  const list = $wishlist.get();
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

export function handleWishlistToggle(sku: string) {
  let list = $wishlist.get();
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

  wishlistToggleBtns.forEach((btn) => {
    if (btn.hasAttribute('data-evt-bound')) return;
    btn.setAttribute('data-evt-bound', 'true');
    btn.addEventListener('click', (e: Event) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'wishlist');
      window.history.pushState(null, '', url);
      handleAppRouting();
    });
  });

  const pdpWishBtn = document.getElementById('pdp-wishlist-btn');
  if (pdpWishBtn && !pdpWishBtn.hasAttribute('data-evt-bound')) {
    pdpWishBtn.setAttribute('data-evt-bound', 'true');
    pdpWishBtn.addEventListener('click', function () {
      const pdpSkuEl = document.getElementById('pdp-sku');
      if (pdpSkuEl) {
        const sku = pdpSkuEl.querySelector('span')!.textContent!;
        handleWishlistToggle(sku);
      }
    });
  }

  updateWishlistUI();
}
