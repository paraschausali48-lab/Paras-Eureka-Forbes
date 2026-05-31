import { useStore } from '@nanostores/preact';
import { $filterState } from '../scripts/filters';
import { handleAppRouting } from '../scripts/routing';

interface Props {
  translations: Record<string, string>;
}

export function MobileFilterActions({ translations }: Props) {
  const state = useStore($filterState);
  const t = (key: string) => translations[key] || key;

  // Compute active filters natively
  const activeFilterCount = state.facets.length + (state.categories.includes('all') ? 0 : state.categories.length);

  const triggerOverlay = (view: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState(null, '', url);
    handleAppRouting();
  };

  return (
    <div class="mobile-actions-wrapper">
      <button id="sort-mobile-toggle" class="mobile-action-btn" onClick={() => triggerOverlay('sort')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
        {t('btn_sort')}
      </button>
      <button id="filter-mobile-toggle" class="mobile-action-btn" onClick={() => triggerOverlay('filter')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        {t('btn_filter')}
        <span class="filter-badge" id="filter-badge" style={{ display: activeFilterCount > 0 ? 'flex' : 'none' }}>
          {activeFilterCount}
        </span>
      </button>
    </div>
  );
}
