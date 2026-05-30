import { useStore } from '@nanostores/preact';
import { $filterState, $catalogMeta, setFilterState } from '../scripts/filters';

interface Props {
  translations: Record<string, string>;
}

export function FilterSidebar({ translations }: Props) {
  const state = useStore($filterState);
  const meta = useStore($catalogMeta);
  const t = (key: string) => translations[key] || key;

  const handleCategoryChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = target.value;
    let newCats = [...state.categories];

    if (val === 'all') {
      newCats = ['all'];
    } else {
      newCats = newCats.filter((c) => c !== 'all');
      if (target.checked) {
        newCats.push(val);
      } else {
        newCats = newCats.filter((c) => c !== val);
      }
      if (newCats.length === 0) newCats = ['all'];
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
    document.getElementById('filter-sidebar')?.classList.remove('active');
    document.body.style.overflow = '';
  };

  const isAll = state.categories.includes('all');
  const showWater = isAll || state.categories.includes('Water Purifier');
  const showVacuum = isAll || state.categories.includes('Vacuum Cleaner');

  const WATER_FACETS = [
    {
      group: 'filter_tech_title',
      options: [
        { val: 'ro', label: 'filter_tech_ro' },
        { val: 'uv', label: 'filter_tech_uv' },
        { val: 'uf', label: 'filter_tech_uf' },
      ],
    },
    {
      group: 'filter_feat_title',
      options: [
        { val: 'active-copper', label: 'filter_feat_copper' },
        { val: 'hot', label: 'filter_feat_hot' },
        { val: 'alkaline', label: 'filter_feat_alk' },
        { val: 'stainless-steel', label: 'filter_feat_ss' },
        { val: 'zero-pressure', label: 'filter_feat_zp' },
      ],
    },
  ];

  const VACUUM_FACETS = [
    {
      group: 'filter_vac_type_title',
      options: [
        { val: 'canister', label: 'filter_vac_type_can' },
        { val: 'handheld', label: 'filter_vac_type_hand' },
        { val: 'upright', label: 'filter_vac_type_stick' },
        { val: 'robotic', label: 'filter_vac_type_rob' },
      ],
    },
    {
      group: 'filter_vac_pow_title',
      options: [
        { val: 'corded', label: 'filter_vac_pow_corded' },
        { val: 'cordless', label: 'filter_vac_pow_cordless' },
      ],
    },
  ];

  return (
    <aside className="filter-sidebar" id="filter-sidebar">
      <div className="filter-sidebar-header">
        <h2>{t('filter_title')}</h2>
        {(state.facets.length > 0 || !isAll || state.query !== '') && (
          <button onClick={clearAll} className="clear-all-btn">
            {t('filter_clear_all')}
          </button>
        )}
        <button onClick={closeSidebar} className="filter-sidebar-close" aria-label="Close filters">
          &times;
        </button>
      </div>

      {/* Main Categories */}
      <div className="filter-group">
        <h3 className="filter-group-title">{t('filter_cat_title')}</h3>
        <label className="filter-option">
          <input type="checkbox" value="all" checked={isAll} onChange={handleCategoryChange} />
          <span>{t('filter_all')}</span>
        </label>

        {['Water Purifier', 'Vacuum Cleaner', 'Air Purifier', 'Water Softener'].map((cat) => {
          const count = meta.categoryCounts[cat] || 0;
          const tKey =
            cat === 'Water Purifier'
              ? 'filter_water'
              : cat === 'Vacuum Cleaner'
                ? 'filter_vacuum'
                : cat === 'Air Purifier'
                  ? 'filter_air'
                  : 'filter_softener';

          return (
            <label key={cat} className="filter-option">
              <input
                type="checkbox"
                value={cat}
                checked={state.categories.includes(cat)}
                onChange={handleCategoryChange}
              />
              <span>
                {t(tKey)} <span className="filter-count">({count})</span>
              </span>
            </label>
          );
        })}
      </div>

      {/* Dynamic Water Purifier Facets */}
      {showWater &&
        WATER_FACETS.map((section) => (
          <div key={section.group} className="filter-group water-filter">
            <h3 className="filter-group-title">{t(section.group)}</h3>
            {section.options.map((opt) => (
              <label key={opt.val} className="filter-option">
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
        ))}

      {/* Dynamic Vacuum Cleaner Facets */}
      {showVacuum &&
        VACUUM_FACETS.map((section) => (
          <div key={section.group} className="filter-group vacuum-filter">
            <h3 className="filter-group-title">{t(section.group)}</h3>
            {section.options.map((opt) => (
              <label key={opt.val} className="filter-option">
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
        ))}
    </aside>
  );
}
