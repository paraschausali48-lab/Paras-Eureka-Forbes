import { useStore } from '@nanostores/preact';
import { navigate } from 'astro:transitions/client';
import { $wishlist, saveWishlist } from '../scripts/wishlist';
import { $allProducts } from '../scripts/filters';
import { showToast } from '../scripts/toast';
import styles from './Wishlist.module.css';
import btnStyles from './Button.module.css';

export default function Wishlist() {
  const list = useStore($wishlist);
  const allProducts = useStore($allProducts);

  const handleRemove = (sku: string) => {
    saveWishlist(list.filter((s) => s !== sku));
  };

  const handleNavigate = (sku: string) => {
    const modal = document.getElementById('wishlist-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';

    const productsEl = document.getElementById('product-grid');
    if (productsEl) productsEl.style.display = '';

    const card = document.querySelector<HTMLElement>(`.product-card[data-sku="${sku}"]`);
    if (card) {
      card.querySelector<HTMLElement>('a')?.click();
    } else {
      const lang = document.documentElement?.lang || 'en';
      navigate(`${import.meta.env.BASE_URL}${lang}/products/${sku}/`);
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
      <div class={styles.wishlistEmpty}>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div class={styles.wishlistContainer}>
      {list.map((sku) => {
        const product = allProducts.find((p) => p.sku === sku);

        const title = product?.name || sku;
        const category = product?.category || '';
        const priceText = product ? `₹${product.mop.toLocaleString('en-IN')}` : '';

        return (
          <div class={styles.wishlistItem} key={sku}>
            <div class={styles.wishlistItemDetails}>
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
              <div class={styles.wishlistItemTitle} onClick={() => handleNavigate(sku)} style={{ cursor: 'pointer' }}>
                {title}
              </div>
              <div class={styles.wishlistItemPrice}>{priceText}</div>
            </div>
            <button
              class={styles.wishlistItemRemove}
              onClick={() => handleRemove(sku)}
              aria-label={`Remove ${title} from wishlist`}
            >
              ×
            </button>
          </div>
        );
      })}

      <button
        id="wishlist-clear-all"
        onClick={handleClear}
        style={{ display: 'block', width: '100%', marginTop: '1rem' }}
        class={`${btnStyles.btn} btn`}
      >
        Clear All
      </button>
    </div>
  );
}
