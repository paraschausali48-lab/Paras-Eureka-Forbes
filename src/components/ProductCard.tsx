import type { Product } from '../scripts/types';
import { getSku } from '../scripts/utils';

interface Props {
  product: Product;
  t: (key: string) => string;
}

export function ProductCard({ product, t }: Props) {
  const sku = getSku(product.name);
  const price = `₹${product.mop.toLocaleString('en-IN')}`;
  const mrp = `₹${product.mrp.toLocaleString('en-IN')}`;

  return (
    <div
      className={`product-card reveal ${product.outOfStock ? 'out-of-stock' : ''}`}
      data-sku={sku}
      data-category={product.category}
    >
      <div className="product-image">
        <img src={`${import.meta.env.BASE_URL}images/products/${sku}.webp`} alt={product.name} loading="lazy" />
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
          <button className="action-btn wishlist-card-btn" data-sku={sku} aria-label={t('nav_wishlist')}>
            {/* SVG icon will be updated by wishlist.ts */}
          </button>
        </div>
      </div>
    </div>
  );
}
