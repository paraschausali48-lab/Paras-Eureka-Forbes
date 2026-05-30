import { useStore } from '@nanostores/preact';
import type { Product } from '../scripts/types';
import { $wishlist, handleWishlistToggle } from '../scripts/wishlist';

interface Props {
  product: Product;
  t: (key: string) => string;
}

export function ProductCard({ product, t }: Props) {
  const sku = product.sku;
  const price = `₹${product.mop.toLocaleString('en-IN')}`;
  const mrp = `₹${product.mrp.toLocaleString('en-IN')}`;
  const wishlist = useStore($wishlist);
  const isWishlisted = wishlist.includes(sku);

  return (
    <div
      className={`product-card reveal ${product.outOfStock ? 'out-of-stock' : ''}`}
      data-sku={sku}
      data-category={product.category}
    >
      <div className="product-image skeleton-wrapper">
        <img
          src={`${import.meta.env.BASE_URL}images/products/${sku}.webp`}
          alt={product.name}
          width="300"
          height="300"
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.opacity = '1';
            target.parentElement?.classList.remove('skeleton-wrapper');
          }}
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          style={{ opacity: 0, transition: 'opacity 0.3s ease-in' }}
        />
        <div className="product-tags">
          <span className="product-tag" data-category={product.category}>
            {t(product.i18nTag)}
          </span>
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-pricing">
          <span className="price">{price}</span>
          {product.mrp > product.mop && <span className="mrp">{mrp}</span>}
        </div>
        <div className="product-actions">
          <button className="action-btn primary" data-sku={sku}>
            {t('btn_more_info')}
          </button>
          <button
            className="action-btn wishlist-card-btn"
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-pressed={isWishlisted}
            onClick={() => handleWishlistToggle(sku)}
          >
            {isWishlisted ? (
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                fill="#e63946"
                stroke="#e63946"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
