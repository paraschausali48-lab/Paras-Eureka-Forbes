import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { subscribeToFilters, allProducts } from '../scripts/filters';
import { applyFiltersAndSort } from '../scripts/render';
import { getSku } from '../scripts/utils';
import type { Product } from '../scripts/types';

interface ProductGridProps {
  initialProducts: Product[];
  lang?: string;
}

export default function ProductGrid({ initialProducts, lang = 'en' }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    // Bridge the Vanilla JS State to Preact's Lifecycle!
    // Whenever filterState changes globally, Preact will automatically re-render the grid.
    subscribeToFilters((newState) => {
      const filtered = applyFiltersAndSort(newState, allProducts);
      setProducts(filtered);
    });
  }, []);

  return (
    <div id="product-grid" className="product-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {products.map((product) => {
        const sku = getSku(product.name);

        return (
          <article key={sku} className="product-card reveal active" data-sku={sku} data-prefetched="false">
            <a href={`/${lang}/products/${sku}`} className="product-link">
              <div className="product-image-wrapper">
                <img src={product.image || '/placeholder.png'} alt={product.name} loading="lazy" />
              </div>
              <div className="product-info">
                <span className="product-tag" data-category={product.category}>
                  {product.category}
                </span>
                <h3>{product.name}</h3>
                <p className="price">₹{product.mop.toLocaleString('en-IN')}</p>
              </div>
            </a>
            <button
              className="product-btn"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              More Info
            </button>
          </article>
        );
      })}
    </div>
  );
}
