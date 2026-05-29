import { describe, it, expect, beforeEach, vi } from 'vitest';
import { closeActiveOverlay, hideProductsView } from './routing';

describe('Routing & UI State Management', () => {
  beforeEach(() => {
    // Mock DOM environment for routing updates
    document.body.innerHTML = `
      <div id="filter-sidebar" class="open"></div>
      <div id="sort-modal" class="active"></div>
      <div id="products" style="display: flex;"></div>
      <button id="filter-clear-all"></button>
    `;

    // Mock Window History
    window.history.replaceState = vi.fn();
  });

  it('should remove query parameters and close overlays when back is unavailable', () => {
    // Set URL with view parameter
    window.history.pushState({}, '', 'http://localhost/?view=filter');

    closeActiveOverlay();

    // DOM Overlays should be cleaned
    expect(document.getElementById('filter-sidebar')?.classList.contains('open')).toBe(false);
    expect(document.getElementById('sort-modal')?.classList.contains('active')).toBe(false);

    // URL should be cleaned (called via replaceState without parameters)
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it('should correctly hide products view and clear filters', () => {
    document.body.classList.add('products-visible');
    hideProductsView();
    expect(document.getElementById('products')?.style.display).toBe('none');
    expect(document.body.classList.contains('products-visible')).toBe(false);
  });
});
