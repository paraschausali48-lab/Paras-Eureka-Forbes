export function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const categoryIcons = {
    'Water Purifier': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path><path d="M9 13l2 2 4-4"></path>',
    'Vacuum Cleaner':
      '<rect x="4" y="14" width="16" height="6" rx="2"></rect><path d="M8 14V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"></path>',
    'Air Purifier':
      '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>',
    'Water Softener':
      '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M12 11l-2.5 3c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5L12 11z"></path>',
  };

  function getProductHighlights(product) {
    const specs = product.specs || {};
    const candidates = [];

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
      .map((value) => String(value).replace(/\s+/g, ' ').trim())
      .filter((value, index, arr) => value && arr.indexOf(value) === index)
      .slice(0, 3);
  }

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const article = document.createElement('article');
    article.className = `product-card reveal ${product.outOfStock ? 'out-of-stock' : ''}`;
    article.dataset.subcategory = product.subcategories.join(', ');
    if (product.leaflet) article.dataset.leaflet = product.leaflet;

    let specsHtml = '<ul>';
    if (product.specs) {
      for (const [key, value] of Object.entries(product.specs)) {
        specsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
      }
    }
    specsHtml += '</ul>';

    const imgHtml = product.image
      ? `<div class="product-media"><img src="${product.image}" alt="${product.name}" loading="lazy" width="300" height="200"></div>`
      : `<div class="product-media product-media-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            ${categoryIcons[product.category] || categoryIcons['Water Purifier']}
          </svg>
          <span>${product.category}</span>
        </div>`;
    const highlights = getProductHighlights(product);
    const highlightsHtml = highlights.length
      ? `<div class="product-highlights">${highlights.map((item) => `<span>${item}</span>`).join('')}</div>`
      : '';

    article.innerHTML = `
      ${imgHtml}
      <div class="product-tag" data-category="${product.category}" data-i18n="${product.i18nTag}">${product.category}</div>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      ${highlightsHtml}
      <div class="price-info">
        <div class="mrp">MRP ₹${product.mrp.toLocaleString('en-IN')}</div>
        <div class="price">MOP ₹${product.mop.toLocaleString('en-IN')}</div>
      </div>
      <div class="product-trust-note">Inquiry only. Final purchase and billing through official Eureka Forbes channels.</div>
      <a href="#contact" class="product-btn" data-i18n="btn_more_info">More Info</a>
      <div class="hidden-specs" style="display: none">${specsHtml}</div>
    `;
    fragment.appendChild(article);
  });

  grid.appendChild(fragment);

  if (typeof window.applyTranslations === 'function') {
    window.applyTranslations(document.documentElement.lang || 'en');
  }
}
