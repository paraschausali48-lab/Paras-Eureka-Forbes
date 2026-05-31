import { useStore } from '@nanostores/preact';
import { $filterState, setFilterState } from '../scripts/filters';
import { SortOption } from '../scripts/types';
import styles from './MobileActions.module.css';

interface Props {
  translations: Record<string, string>;
}

export function SortDropdown({ translations }: Props) {
  const state = useStore($filterState);
  const t = (key: string) => translations[key] || key;

  return (
    <select
      id="desktop-sort-select"
      class={styles.sortSelect}
      value={state.sort}
      onChange={(e) => setFilterState({ sort: e.currentTarget.value })}
    >
      <option value={SortOption.RELEVANCE}>{t('sort_relevance')}</option>
      <option value={SortOption.PRICE_LOW}>{t('sort_price_low')}</option>
      <option value={SortOption.PRICE_HIGH}>{t('sort_price_high')}</option>
    </select>
  );
}
