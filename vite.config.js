import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeHTML(str) {
  if (typeof str !== 'string' && typeof str !== 'number') return str;
  return String(str).replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[tag] || tag,
  );
}

function getSku(title) {
  return (
    'EF-' +
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toUpperCase()
  );
}

function getProductHighlights(product) {
  const specs = product.specs || {};
  const candidates = [];
  if (product.category === 'Water Purifier')
    candidates.push(specs['TDS'], specs['Storage Capacity'], specs['Filter Life'], specs['Installation Type']);
  else if (product.category === 'Vacuum Cleaner')
    candidates.push(specs['Type'], specs['Application'], specs['Dust Capacity'], specs['Run Time']);
  else if (product.category === 'Air Purifier')
    candidates.push(specs['Ideal For'], specs['Air Flow'], specs['Purification Stages']);
  else if (product.category === 'Water Softener')
    candidates.push(specs['Max. Input Hardness (ppm)'], specs['Max. Input Flow Rate (LPH)'], specs['Technology']);

  return candidates
    .filter(Boolean)
    .map((v) => String(v).replace(/\s+/g, ' ').trim())
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .slice(0, 3);
}

export default defineConfig({
  base: '/Paras-Eureka-Forbes/',
  plugins: [
    {
      name: 'ssg-pre-render',
      transformIndexHtml(html) {
        const productsPath = path.resolve(__dirname, 'public/products.json');
        if (!fs.existsSync(productsPath)) return html;

        const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        let productsHtml = '';

        const categoryIcons = {
          'Water Purifier': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path><path d="M9 13l2 2 4-4"></path>',
          'Vacuum Cleaner':
            '<rect x="4" y="14" width="16" height="6" rx="2"></rect><path d="M8 14V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"></path>',
          'Air Purifier':
            '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>',
          'Water Softener':
            '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M12 11l-2.5 3c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5L12 11z"></path>',
        };

        products.forEach((product) => {
          const sku = getSku(product.name);
          const imgHtml = product.image
            ? `<div class="product-media"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" width="300" height="200"></div>`
            : `<div class="product-media product-media-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${categoryIcons[product.category] || categoryIcons['Water Purifier']}</svg><span>${escapeHTML(product.category)}</span></div>`;

          const highlights = getProductHighlights(product);
          const highlightsHtml = highlights.length
            ? `<div class="product-highlights">${highlights.map((item) => `<span>${escapeHTML(item)}</span>`).join('')}</div>`
            : '';

          let discountHtml = '';
          if (product.mrp > product.mop && product.mop > 0) {
            discountHtml = `<span class="discount-badge">${Math.round(((product.mrp - product.mop) / product.mrp) * 100)}% OFF</span>`;
          }

          let specsHtml = '<ul>';
          if (product.specs)
            for (const [key, value] of Object.entries(product.specs))
              specsHtml += `<li><strong>${escapeHTML(key)}:</strong> ${escapeHTML(value)}</li>`;
          specsHtml += '</ul>';

          productsHtml += `
        <article class="product-card reveal active ${product.outOfStock ? 'out-of-stock' : ''}" data-sku="${sku}" data-subcategory="${product.subcategories.join(', ')}" ${product.leaflet ? `data-leaflet="${product.leaflet}"` : ''}>
          ${imgHtml}
          <div class="product-tag" data-category="${escapeHTML(product.category)}" data-i18n="${escapeHTML(product.i18nTag)}">${escapeHTML(product.category)}</div>
          <h3>${escapeHTML(product.name)}</h3><p>${escapeHTML(product.description)}</p>${highlightsHtml}
          <div class="price-info"><div class="mrp-wrapper"><div class="mrp">MRP ₹${escapeHTML(product.mrp.toLocaleString('en-IN'))}</div>${discountHtml}</div><div class="price">MOP ₹${escapeHTML(product.mop.toLocaleString('en-IN'))}</div></div>
          <div class="product-trust-note">Inquiry only. Final purchase and billing through official Eureka Forbes channels.</div>
          <a href="#contact" class="product-btn" data-i18n="btn_more_info">More Info</a>
          <div class="hidden-specs" style="display: none">${specsHtml}</div>
        </article>`;
        });
        return html.replace(
          '<!-- Products are now dynamically injected here via main.js and products.json -->',
          productsHtml,
        );
      },
    },
  ],
});
