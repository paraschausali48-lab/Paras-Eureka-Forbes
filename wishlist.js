import { showToast } from './toast.js';

export function getWishlist() {
  return JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
}

export function saveWishlist(list) {
  localStorage.setItem('ef_wishlist', JSON.stringify(list));
  updateWishlistUI();
}

export function updateWishlistUI() {
  const list = getWishlist();
  document.querySelectorAll('.wishlist-badge').forEach((badge) => {
    badge.style.display = list.length > 0 ? 'flex' : 'none';
    badge.textContent = list.length;
  });
  const pdpWishBtn = document.getElementById('pdp-wishlist-btn');
  if (pdpWishBtn) {
    const pdpSkuEl = document.getElementById('pdp-sku');
    if (pdpSkuEl) {
      const currentSku = pdpSkuEl.querySelector('span').textContent;
      pdpWishBtn.innerHTML = list.includes(currentSku)
        ? '<svg width="24" height="24" fill="#e63946" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    }
  }
}

export function renderWishlist(productCards, wishlistModal, wishlistContainer, wishlistClearBtn) {
  const list = getWishlist();
  if (!wishlistContainer) return;
  wishlistContainer.innerHTML = '';
  if (wishlistClearBtn) wishlistClearBtn.style.display = list.length > 0 ? 'block' : 'none';

  if (list.length === 0) {
    wishlistContainer.innerHTML =
      '<div class="wishlist-empty"><p data-i18n="wishlist_empty">Your wishlist is currently empty.</p></div>';
    if (window.applyTranslations) window.applyTranslations(document.documentElement.lang || 'en');
    return;
  }

  list.forEach((sku) => {
    const card = Array.from(productCards).find((c) => {
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
    if (card) {
      const title = card.querySelector('h3').textContent;
      const price = card.querySelector('.price').textContent;
      const category = card.querySelector('.product-tag').textContent;
      const item = document.createElement('div');
      item.className = 'wishlist-item';
      item.innerHTML = `<div class="wishlist-item-details"><div style="font-size:0.8rem; color:var(--color-primary-light); font-weight:700; margin-bottom:2px;">${category}</div><div class="wishlist-item-title">${title}</div><div class="wishlist-item-price">${price}</div></div><button class="wishlist-item-remove" data-sku="${sku}">×</button>`;

      item.querySelector('.wishlist-item-title').addEventListener('click', () => {
        wishlistModal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('products').style.display = '';
        card.click();
      });

      item.querySelector('.wishlist-item-remove').addEventListener('click', (e) => {
        saveWishlist(getWishlist().filter((s) => s !== e.target.dataset.sku));
        renderWishlist(productCards, wishlistModal, wishlistContainer, wishlistClearBtn);
      });
      wishlistContainer.appendChild(item);
    }
  });
}

export function handleWishlistToggle(sku) {
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
