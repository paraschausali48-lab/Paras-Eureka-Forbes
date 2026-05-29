import { setLastFocused } from './routing';
import { navigate } from 'astro:transitions/client';

export function initProductNavigation() {
  const productGrid = document.getElementById('product-grid');

  if (!productGrid) return;

  productGrid.addEventListener('click', function (e: Event) {
    const card = (e.target as HTMLElement).closest('.product-card') as HTMLElement;
    if (!card) return;

    const isMoreInfoBtn = (e.target as HTMLElement).closest('.product-btn[href="#contact"]');
    if (!isMoreInfoBtn && ((e.target as HTMLElement).closest('.product-btn') || (e.target as HTMLElement).closest('a')))
      return;
    if (isMoreInfoBtn) e.preventDefault(); // Prevent jumping down the page, open modal instead
    setLastFocused(card);

    const sku = card.dataset.sku!;
    const lang = document.documentElement.lang || 'en';
    navigate(`/${lang}/products/${sku}`);
  });
}
