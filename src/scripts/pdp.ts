import { setLastFocused } from './routing';
import { navigate } from 'astro:transitions/client';
import { prefetch } from 'astro:prefetch';

export function initProductNavigation() {
  const productGrid = document.getElementById('product-grid');

  if (!productGrid) return;

  const baseUrl = import.meta.env.BASE_URL;

  // Intent-based preloading handler for both Desktop (hover) and Mobile (touch)
  const handlePrefetch = (e: Event) => {
    const card = (e.target as HTMLElement).closest('.product-card') as HTMLElement;
    if (!card || card.hasAttribute('data-prefetched')) return;

    card.setAttribute('data-prefetched', 'true'); // Ensure we only prefetch once per card
    const sku = card.dataset.sku!;
    const lang = document.documentElement.lang || 'en';
    prefetch(`${baseUrl}${lang}/products/${sku}`);
  };

  productGrid.addEventListener('mouseover', handlePrefetch, { passive: true });
  productGrid.addEventListener('touchstart', handlePrefetch, { passive: true });

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
    navigate(`${baseUrl}${lang}/products/${sku}`);
  });
}
