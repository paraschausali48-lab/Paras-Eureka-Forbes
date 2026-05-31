import { useStore } from '@nanostores/preact';
import { $filterState, setFilterState } from '../scripts/filters';
import { SortOption } from '../scripts/types';
import styles from './FilterSidebar.module.css';

interface Props {
  translations: Record<string, string>;
}

export function ClearFiltersButton({ translations }: Props) {
  const state = useStore($filterState);
  const t = (key: string) => translations[key] || key;

  // Only show the button if filters are actually active
  const isActive = !state.categories.includes('all') || state.facets.length > 0 || state.query !== '';

  if (!isActive) return null;

  return (
    <button
      id="filter-clear-all"
      class={styles.filterClearAll}
      onClick={() => setFilterState({ categories: ['all'], facets: [], query: '' })}
    >
      {t('filter_clear_all')}
    </button>
  );
}
