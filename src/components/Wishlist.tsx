import { useStore } from '@nanostores/preact';
import { navigate } from 'astro:transitions/client';
import { $wishlist, saveWishlist } from '../scripts/wishlist';
import { $allProducts } from '../scripts/filters';
import { showToast } from '../scripts/toast';

export default function Wishlist() {
  const list = useStore($wishlist);

  const handleRemove = (sku: string) => {
    saveWishlist(list.filter((s) => s !== sku));
  };

  const handleNavigate = (sku: string) => {
    const modal = document.getElementById('wishlist-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';

    const productsEl = document.getElementById('products');
    if (productsEl) productsEl.style.display = '';

    const card = document.querySelector<HTMLElement>(`.product-card[data-sku="${sku}"]`);
    if (card) {
      card.click();
    } else {
      const lang = document.documentElement?.lang || 'en';
      navigate(`${import.meta.env.BASE_URL}${lang}/products/${sku}`);
    }
  };

  const handleClear = () => {
    saveWishlist([]);
    showToast(document.body.dataset.toastClear || 'Wishlist cleared');
  };

  if (list.length === 0) {
    // Safely retrieve the localized empty message from the DOM
    const emptyText =
      typeof document !== 'undefined'
        ? document.body.dataset.wishlistEmpty || 'Your wishlist is currently empty.'
        : 'Your wishlist is currently empty.';

    return (
      <div class="wishlist-empty">
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div class="wishlist-container">
      {list.map((sku) => {
        const product = $allProducts.get().find((p) => p.sku === sku);
        const card =
          typeof document !== 'undefined'
            ? document.querySelector<HTMLElement>(`.product-card[data-sku="${sku}"]`)
            : null;

        const title = product?.name || card?.querySelector('h3')?.textContent || sku;
        const category = product?.category || card?.querySelector('.product-tag')?.getAttribute('data-category') || '';
        const priceText = product
          ? `₹${product.mop.toLocaleString('en-IN')}`
          : card?.querySelector('.price')?.textContent || '';

        return (
          <div class="wishlist-item" key={sku}>
            <div class="wishlist-item-details">
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-primary-light)',
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {category}
              </div>
              <div class="wishlist-item-title" onClick={() => handleNavigate(sku)} style={{ cursor: 'pointer' }}>
                {title}
              </div>
              <div class="wishlist-item-price">{priceText}</div>
            </div>
            <button class="wishlist-item-remove" onClick={() => handleRemove(sku)}>
              ×
            </button>
          </div>
        );
      })}

      <button
        id="wishlist-clear-all"
        onClick={handleClear}
        style={{ display: 'block', width: '100%', marginTop: '1rem' }}
        class="primary-btn"
      >
        Clear All
      </button>
    </div>
  );
}
