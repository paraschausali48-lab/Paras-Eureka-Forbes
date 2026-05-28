import { escapeHTML } from './utils';
import { applyTranslations } from './translations';
import type { Product } from './types';

export function renderProducts(products: Product[]) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const categoryIcons: Record<string, string> = {
    'Water Purifier': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path><path d="M9 13l2 2 4-4"></path>',
    'Vacuum Cleaner':
      '<rect x="4" y="14" width="16" height="6" rx="2"></rect><path d="M8 14V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"></path>',
    'Air Purifier':
      '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>',
    'Water Softener':
      '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M12 11l-2.5 3c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5L12 11z"></path>',
  };

  function getProductHighlights(product: Product): string[] {
    const specs = product.specs || {};
    const candidates: (string | number | undefined)[] = [];

    if (product.category === 'Water Purifier') {
      candidates.push(specs['TDS'], specs['Storage Capacity'], specs['Filter Life'], specs['Installation Type']);
    } else if (product.category === 'Vacuum Cleaner') {
      candidates.push(specs['Type'], specs['Application'], specs['Dust Capacity'], specs['Run Time']);
    } else if (product.category === 'Air Purifier') {
      candidates.push(specs['Ideal For'], specs['Air Flow'], specs['Purification Stages']);
    } else if (product.category === 'Water Softener') {
      candidates.push(specs['Max. Input Hardness (ppm)'], specs['Max. Input Flow Rate (LPH)'], specs['Technology']);
    }

    return candidates
      .filter(Boolean)
      .map((value) => String(value!).replace(/\s+/g, ' ').trim())
      .filter((value, index, arr) => value && arr.indexOf(value) === index)
      .slice(0, 3);
  }

  function getSku(title: string) {
    return (
      'EF-' +
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toUpperCase()
    );
  }

  const newSkus = products.map((p) => getSku(p.name));
  const currentCards = Array.from(grid.children) as HTMLElement[];

  // 1. Unmount cards that do not match the filter
  currentCards.forEach((card) => {
    if (card.classList.contains('product-card') && !newSkus.includes(card.dataset.sku!)) {
      grid.removeChild(card);
    }
  });

  // 2. Mount new cards or reorder existing ones
  products.forEach((product, index) => {
    const sku = getSku(product.name);
    let card = grid.querySelector<HTMLElement>(`[data-sku="${sku}"]`);

    if (!card) {
      // Mount new card
      card = document.createElement('article');
      card.className = `product-card reveal active ${product.outOfStock ? 'out-of-stock' : ''}`;
      card.style.animation = `filterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
      card.dataset.sku = sku;
      card.dataset.subcategory = product.subcategories.join(', ');
      if (product.leaflet) card.dataset.leaflet = product.leaflet;

      let specsHtml = '<ul>';
      if (product.specs) {
        for (const [key, value] of Object.entries(product.specs)) {
          specsHtml += `<li><strong>${escapeHTML(key)}:</strong> ${escapeHTML(String(value))}</li>`;
        }
      }
      specsHtml += '</ul>';

      const imgHtml = product.image
        ? `<div class="product-media"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" width="300" height="200"></div>`
        : `<div class="product-media product-media-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            ${categoryIcons[product.category] || categoryIcons['Water Purifier']}
          </svg>
          <span>${escapeHTML(product.category)}</span>
        </div>`;
      const highlights = getProductHighlights(product);
      const highlightsHtml = highlights.length
        ? `<div class="product-highlights">${highlights.map((item) => `<span>${escapeHTML(item)}</span>`).join('')}</div>`
        : '';

      let discountHtml = '';
      if (product.mrp > product.mop && product.mop > 0) {
        const discount = Math.round(((product.mrp - product.mop) / product.mrp) * 100);
        discountHtml = `<span class="discount-badge">${discount}% OFF</span>`;
      }

      card.innerHTML = `
      ${imgHtml}
      <div class="product-tag" data-category="${escapeHTML(product.category)}" data-i18n="${escapeHTML(product.i18nTag)}">${escapeHTML(product.category)}</div>
      <h3>${escapeHTML(product.name)}</h3>
      <p>${escapeHTML(product.description)}</p>
      ${highlightsHtml}
      <div class="price-info">
        <div class="mrp-wrapper"><div class="mrp">MRP ₹${escapeHTML(product.mrp.toLocaleString('en-IN'))}</div>${discountHtml}</div>
        <div class="price">MOP ₹${escapeHTML(product.mop.toLocaleString('en-IN'))}</div>
      </div>
      <div class="product-trust-note">Inquiry only. Final purchase and billing through official Eureka Forbes channels.</div>
      <a href="#contact" class="product-btn" data-i18n="btn_more_info">More Info</a>
      <div class="hidden-specs" style="display: none">${specsHtml}</div>
    `;

      if (grid.children[index]) grid.insertBefore(card!, grid.children[index]);
      else grid.appendChild(card);
    } else {
      // Reorder existing card if necessary
      if (grid.children[index] !== card) {
        grid.insertBefore(card, grid.children[index]);
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = `filterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
      }
    }
  });

  applyTranslations(document.documentElement.lang || 'en');
}
