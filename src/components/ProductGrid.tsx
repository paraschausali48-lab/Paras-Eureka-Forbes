import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';
import { $filteredCatalog, setFilterState, setProductsData, $allProducts } from '../scripts/filters';
import type { Product } from '../scripts/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  translations: Record<string, string>;
}

export default function ProductGrid({ products, translations }: Props) {
  // 1. Safe SSG initialization (Server-side only)
  if (typeof window === 'undefined' && $allProducts.get().length === 0 && products.length > 0) {
    setProductsData(products);
  }

  // 2. Safe Client-side hydration (prevents React render-phase mutations)
  useEffect(() => {
    if ($allProducts.get().length === 0 && products.length > 0) {
      setProductsData(products);
    }
  }, [products]);

  const catalog = useStore($filteredCatalog);
  const isHydrated = $allProducts.get().length > 0;

  // Fallback to static props before client-side hydration to prevent FOUC
  const visibleProducts = isHydrated ? catalog.visibleProducts : products;
  const visibleCount = isHydrated ? catalog.visibleCount : products.length;
  const t = (key: string) => translations[key] || key;

  return (
    <div id="product-grid" class="product-grid">
      {visibleProducts.map((product) => (
        <ProductCard key={product.sku} product={product} t={t} />
      ))}
      <div id="empty-state" class="empty-state" style={{ display: visibleCount === 0 ? 'flex' : 'none' }}>
        <div class="empty-state-content">
          <h3>{t('empty_title')}</h3>
          <p>{t('empty_desc')}</p>
          <button class="btn" onClick={() => setFilterState({ categories: ['all'], facets: [], query: '' })}>
            {t('empty_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
