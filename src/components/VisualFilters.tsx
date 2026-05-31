import { useStore } from '@nanostores/preact';
import { $filterState, setFilterState } from '../scripts/filters';
import { ProductCategory } from '../scripts/types';

interface Props {
  translations: Record<string, string>;
  baseUrl: string;
}

export function VisualFilters({ translations, baseUrl }: Props) {
  const state = useStore($filterState);
  const t = (key: string) => translations[key] || key;

  const toggleCategory = (navCat: string) => {
    const isActiveCat = state.categories.includes(navCat) && state.categories.length === 1;
    const nextCategories = isActiveCat ? ['all'] : [navCat];

    setFilterState({ categories: nextCategories });

    // Scroll to the product grid section smoothly
    if (window.location.hash !== '#products') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#products');

      const productsEl = document.getElementById('product-grid');
      if (productsEl) productsEl.style.display = '';
      document.body.classList.add('products-visible');
    }
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = [
    { id: ProductCategory.WATER_PURIFIER, img: 'images/cat-water.webp', key: 'filter_water' },
    { id: ProductCategory.VACUUM_CLEANER, img: 'images/cat-vacuum.webp', key: 'filter_vacuum' },
    { id: ProductCategory.AIR_PURIFIER, img: 'images/cat-air.webp', key: 'filter_air' },
    { id: ProductCategory.WATER_SOFTENER, img: 'images/cat-softener.webp', key: 'filter_softener' },
  ];

  return (
    <div class="visual-filters">
      {categories.map((cat) => {
        const isActive = state.categories.includes(cat.id);
        return (
          <button
            key={cat.id}
            class={`visual-filter-btn ${isActive ? 'active' : ''}`}
            aria-pressed={isActive ? 'true' : 'false'}
            onClick={() => toggleCategory(cat.id)}
          >
            <div class="vf-img-wrap">
              <img
                src={`${baseUrl}${cat.img}`}
                alt={t(cat.key)}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span>{t(cat.key)}</span>
          </button>
        );
      })}
    </div>
  );
}
