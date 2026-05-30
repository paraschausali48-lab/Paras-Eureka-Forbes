import { useStore } from '@nanostores/preact';
import { useMemo, useEffect } from 'preact/hooks';
import { $filterState, productMatchesFacets, $catalogMeta, setFilterState } from '../scripts/filters';
import type { Product } from '../scripts/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  translations: Record<string, string>;
}

export default function ProductGrid({ products, translations }: Props) {
  const state = useStore($filterState);
  const t = (key: string) => translations[key] || key;

  // This useMemo hook is the new, declarative filtering and sorting engine.
  // It recalculates automatically whenever the filter state changes.
  const { visibleProducts, visibleCount, categoryCounts } = useMemo(() => {
    const { categories, facets, query, sort } = state;
    const isAllSelected = categories.includes('all');
    const searchTerms = query.toLowerCase().trim().split(' ').filter(Boolean);

    const filtered: Product[] = [];
    const counts: Record<string, number> = {
      'Water Purifier': 0,
      'Air Purifier': 0,
      'Vacuum Cleaner': 0,
      'Water Softener': 0,
    };

    products.forEach((product) => {
      const matchesCat = isAllSelected || categories.includes(product.category);
      const searchString = `${product.name} ${product.description}`.toLowerCase();
      const matchesSearch = searchTerms.length === 0 || searchTerms.every((term) => searchString.includes(term));
      const matchesFacet = productMatchesFacets(product, facets);

      // This logic is for the sidebar counts, which should reflect all potential matches
      if (matchesCat && matchesSearch && matchesFacet) {
        if (counts[product.category] !== undefined) {
          counts[product.category]++;
        }
      }

      if (matchesCat && matchesSearch && matchesFacet) {
        filtered.push(product);
      }
    });

    if (sort !== 'relevance') {
      filtered.sort((a, b) => (sort === 'price-low' ? a.mop - b.mop : b.mop - a.mop));
    }

    return { visibleProducts: filtered, visibleCount: filtered.length, categoryCounts: counts };
  }, [state, products]);

  // This effect broadcasts UI updates (like counts) to the reactive store
  useEffect(() => {
    $catalogMeta.set({ visibleCount, categoryCounts });
  }, [visibleCount, categoryCounts]);

  return (
    <div id="product-grid">
      {visibleProducts.map((product) => (
        <ProductCard key={product.sku} product={product} t={t} />
      ))}
      <div id="empty-state" style={{ display: visibleCount === 0 ? 'flex' : 'none' }}>
        <div class="empty-state-content">
          <h3>{t('empty_title')}</h3>
          <p>{t('empty_desc')}</p>
          <button class="primary-btn" onClick={() => setFilterState({ categories: ['all'], facets: [], query: '' })}>
            {t('empty_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
