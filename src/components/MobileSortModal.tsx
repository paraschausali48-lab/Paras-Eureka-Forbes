import { useStore } from '@nanostores/preact';
import { $filterState, setFilterState } from '../scripts/filters';
import { closeActiveOverlay } from '../scripts/routing';
import { SortOption } from '../scripts/types';

interface Props {
  translations: Record<string, string>;
}

export function MobileSortModal({ translations }: Props) {
  const state = useStore($filterState);
  const t = (key: string) => translations[key] || key;

  const handleSort = (sortVal: string) => {
    setFilterState({ sort: sortVal });
    // Allow a small delay so the user sees the active state change before it closes
    setTimeout(() => closeActiveOverlay(), 250);
  };

  return (
    <div class="sort-options-new">
      <button
        class={`sort-option-btn ${state.sort === SortOption.RELEVANCE ? 'active' : ''}`}
        onClick={() => handleSort(SortOption.RELEVANCE)}
      >
        {t('sort_relevance')}
      </button>
      <button
        class={`sort-option-btn ${state.sort === SortOption.PRICE_LOW ? 'active' : ''}`}
        onClick={() => handleSort(SortOption.PRICE_LOW)}
      >
        {t('sort_price_low')}
      </button>
      <button
        class={`sort-option-btn ${state.sort === SortOption.PRICE_HIGH ? 'active' : ''}`}
        onClick={() => handleSort(SortOption.PRICE_HIGH)}
      >
        {t('sort_price_high')}
      </button>
    </div>
  );
}
