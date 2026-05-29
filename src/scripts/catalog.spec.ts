import { test, expect } from '@playwright/test';

test.describe('Catalog Filtering & Routing', () => {
  test('should sync visual filter selection to the URL and update the grid', async ({ page }) => {
    // Navigate to the index
    await page.goto('/');

    // Wait for the synchronous DOM hydration to complete
    await page.waitForLoadState('domcontentloaded');

    // Locate and click the "RO" technology visual filter
    const roFilterBtn = page.locator('.visual-filter-btn[data-filter="ro"]').first();
    await roFilterBtn.click();

    // 1. Assert URL State: ensure exact state shareability is working
    await expect(page).toHaveURL(/.*facets=ro/);

    // 2. Assert UI State: ensure the button gets the active CSS highlight
    await expect(roFilterBtn).toHaveClass(/active/);

    // 3. Assert DOM Update: ensure filtered products are revealed
    // (We count cards that do not have inline style="display: none")
    const visibleProducts = page.locator('.product-card:not([style*="display: none"])');
    const count = await visibleProducts.count();
    expect(count).toBeGreaterThan(0);
  });
});
