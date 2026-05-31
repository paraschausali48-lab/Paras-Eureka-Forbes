import { useStore } from '@nanostores/preact';
import { useState } from 'preact/hooks';
import { $filterState, $catalogMeta, setFilterState } from '../scripts/filters';
import { ProductCategory, WaterTech, VacType, VacPow } from '../scripts/types';
import styles from './FilterSidebar.module.css';

interface Props {
  translations: Record<string, string>;
}

export function FilterSidebar({ translations }: Props) {
  const state = useStore($filterState);
  const meta = useStore($catalogMeta);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const t = (key: string) => translations[key] || key;

  const handleCategoryChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    let newCats = ['all'];

    if (val !== 'all' && target.checked) {
      newCats = [val];
    }

    setFilterState({ categories: newCats });
  };

  const handleFacetChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    let newFacets = [...state.facets];

    if (target.checked) {
      newFacets.push(val);
    } else {
      newFacets = newFacets.filter((f) => f !== val);
    }
    setFilterState({ facets: newFacets });
  };

  const clearAll = () => {
    setFilterState({ categories: ['all'], facets: [], query: '' });
  };

  const closeSidebar = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    window.history.pushState(null, '', url);
    window.dispatchEvent(new Event('popstate'));
  };

  const isAll = state.categories.includes('all');
  const showWater = isAll || state.categories.includes(ProductCategory.WATER_PURIFIER);
  const showVacuum = isAll || state.categories.includes(ProductCategory.VACUUM_CLEANER);

  const toggleAccordion = (group: string) => {
    setExpanded((prev) => ({ ...prev, [group]: prev[group] === false ? true : false }));
  };

  const WATER_FACETS = [
    {
      group: 'filter_tech_title',
      options: [
        { val: WaterTech.RO, label: 'filter_tech_ro' },
        { val: WaterTech.UV, label: 'filter_tech_uv' },
        { val: WaterTech.UF, label: 'filter_tech_uf' },
      ],
    },
    {
      group: 'filter_feat_title',
      options: [
        { val: 'active-copper', label: 'filter_feat_copper' },
        { val: 'hot-ambient', label: 'filter_feat_hot' },
        { val: 'alkaline-boost', label: 'filter_feat_alk' },
        { val: 'stainless-steel', label: 'filter_feat_ss' },
        { val: 'zero-pressure-pump', label: 'filter_feat_zp' },
      ],
    },
  ];

  const VACUUM_FACETS = [
    {
      group: 'filter_vac_type_title',
      options: [
        { val: VacType.CANISTER, label: 'filter_vac_type_can' },
        { val: VacType.HANDHELD, label: 'filter_vac_type_hand' },
        { val: VacType.UPRIGHT, label: 'filter_vac_type_stick' },
        { val: VacType.ROBOTIC, label: 'filter_vac_type_rob' },
      ],
    },
    {
      group: 'filter_vac_pow_title',
      options: [
        { val: VacPow.CORDED, label: 'filter_vac_pow_corded' },
        { val: VacPow.CORDLESS, label: 'filter_vac_pow_cordless' },
      ],
    },
  ];

  return (
    <aside class={`${styles.filterSidebar} filter-sidebar`} id="filter-sidebar">
      <div class={styles.filterSidebarHeader}>
        <h2>{t('filter_title')}</h2>
        {(state.facets.length > 0 || !isAll || state.query !== '') && (
          <button onClick={clearAll} class={styles.filterClearAll} id="filter-clear-all">
            {t('filter_clear_all')}
          </button>
        )}
        <button onClick={closeSidebar} class={styles.filterSidebarClose} aria-label="Close filters">
          &times;
        </button>
      </div>

      {/* Main Categories */}
      <div class={styles.filterGroup}>
        <button
          class={styles.filterGroupToggle}
          aria-expanded={expanded['categories'] !== false ? 'true' : 'false'}
          type="button"
          onClick={() => toggleAccordion('categories')}
        >
          <div class={styles.filterGroupTitle}>{t('filter_cat_title')}</div>
          <span class={styles.filterChevron}>
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </button>
        <div class={styles.filterGroupContent}>
          <label class={styles.filterOption}>
            <input type="radio" name="category" value="all" checked={isAll} onChange={handleCategoryChange} />
            <span>{t('filter_all')}</span>
          </label>

          {[
            ProductCategory.WATER_PURIFIER,
            ProductCategory.VACUUM_CLEANER,
            ProductCategory.AIR_PURIFIER,
            ProductCategory.WATER_SOFTENER,
          ].map((cat) => {
            const count = meta.categoryCounts[cat] || 0;
            const tKey =
              cat === ProductCategory.WATER_PURIFIER
                ? 'filter_water'
                : cat === ProductCategory.VACUUM_CLEANER
                  ? 'filter_vacuum'
                  : cat === ProductCategory.AIR_PURIFIER
                    ? 'filter_air'
                    : 'filter_softener';

            return (
              <label key={cat} class={styles.filterOption}>
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={state.categories.includes(cat)}
                  onChange={handleCategoryChange}
                />
                <span>
                  {t(tKey)} <span class={styles.filterCount}>({count})</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Dynamic Water Purifier Facets */}
      {showWater &&
        WATER_FACETS.map((section) => {
          const activeCount = section.options.filter((opt) => state.facets.includes(opt.val)).length;
          return (
            <div key={section.group} class={`${styles.filterGroup} water-filter`}>
              <button
                class={styles.filterGroupToggle}
                aria-expanded={expanded[section.group] !== false ? 'true' : 'false'}
                type="button"
                onClick={() => toggleAccordion(section.group)}
              >
                <div class={styles.filterGroupTitle} data-selected-count={activeCount.toString()}>
                  {t(section.group)}
                </div>
                <span class={styles.filterChevron}>
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              <div class={styles.filterGroupContent}>
                {section.options.map((opt) => (
                  <label key={opt.val} class={styles.filterOption}>
                    <input
                      type="checkbox"
                      value={opt.val}
                      checked={state.facets.includes(opt.val)}
                      onChange={handleFacetChange}
                    />
                    <span>{t(opt.label)}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

      {/* Dynamic Vacuum Cleaner Facets */}
      {showVacuum &&
        VACUUM_FACETS.map((section) => {
          const activeCount = section.options.filter((opt) => state.facets.includes(opt.val)).length;
          return (
            <div key={section.group} class={`${styles.filterGroup} vacuum-filter`}>
              <button
                class={styles.filterGroupToggle}
                aria-expanded={expanded[section.group] !== false ? 'true' : 'false'}
                type="button"
                onClick={() => toggleAccordion(section.group)}
              >
                <div class={styles.filterGroupTitle} data-selected-count={activeCount.toString()}>
                  {t(section.group)}
                </div>
                <span class={styles.filterChevron}>
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              <div class={styles.filterGroupContent}>
                {section.options.map((opt) => (
                  <label key={opt.val} class={styles.filterOption}>
                    <input
                      type="checkbox"
                      value={opt.val}
                      checked={state.facets.includes(opt.val)}
                      onChange={handleFacetChange}
                    />
                    <span>{t(opt.label)}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
    </aside>
  );
}
