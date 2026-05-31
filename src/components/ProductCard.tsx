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
  // Use pre-calculated discount, fallback to runtime calc if JSON is outdated
  const discount =
    (product as Product & { discount?: number }).discount ??
    Math.round(((product.mrp - product.mop) / product.mrp) * 100);
  const highlights = product.highlights;

  // Dynamically summarize the product description using its technical features (subcategories)
  const specSummary =
    product.subcategories && product.subcategories.length > 0
      ? product.subcategories
          .slice(0, 5)
          .map((s) =>
            s.length <= 2
              ? s.toUpperCase()
              : s
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' '),
          )
          .join(' • ')
      : product.description;

  return (
    <div
      class={`product-card reveal ${product.outOfStock ? 'out-of-stock' : ''}`}
      data-sku={sku}
      data-category={product.category}
    >
      <span class="product-tag" data-category={product.category}>
        {product.i18nTag ? t(product.i18nTag) : product.category}
      </span>

      <button
        type="button"
        class="add-to-wishlist-btn"
        aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        aria-pressed={isWishlisted}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleWishlistToggle(sku);
        }}
      >
        {isWishlisted ? (
          <svg
            aria-hidden="true"
            width="20"
            height="20"
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
            width="20"
            height="20"
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

      <div
        class="skeleton-wrapper"
        style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/products/${sku}.webp`}
          alt={`${product.name} - ${product.category} by Eureka Forbes`}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            opacity: 0,
            transition: 'opacity 0.3s ease-in',
          }}
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.opacity = '1';
            target.parentElement?.classList.remove('skeleton-wrapper');
          }}
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
      </div>

      <h3>
        <a href={`?p=${sku}`} class="product-card-link">
          {product.name}
        </a>
      </h3>

      <p class="product-specs-summary" title={product.description}>
        {specSummary}
      </p>
      {highlights && highlights.length > 0 ? (
        <ul class="product-highlights">
          {highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      ) : (
        <p class="product-specs-summary" title={product.description}>
          {specSummary}
        </p>
      )}

      <div class="price-info">
        {product.mrp > product.mop && (
          <div class="mrp-wrapper">
            <span class="mrp">{mrp}</span>
            <span class="discount-badge">{discount}% OFF</span>
          </div>
        )}
        <div class="price">{price}</div>
      </div>

      <div class="card-actions" style={{ gridTemplateColumns: '1fr' }}>
        <a href={`?p=${sku}`} class="product-btn" data-sku={sku} style={{ position: 'relative', zIndex: 2 }}>
          {t('btn_more_info')}
        </a>
      </div>
    </div>
  );
}
