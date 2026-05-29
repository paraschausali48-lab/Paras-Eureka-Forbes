import { test, expect, type Page } from '@playwright/test';

test.describe('Catalog Filtering & Routing', () => {
  test('should sync visual filter selection to the URL and update the Preact grid', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Navigate to the index
    await page.goto('/');

    // Wait for the page to be ready and the Preact island to be hydrated
    await page.waitForSelector('.product-card');

    // Get the initial count of products
    const initialProductCount = await page.locator('.product-card').count();
    expect(initialProductCount).toBeGreaterThan(10); // Sanity check we have a full grid

    // Locate and click the "RO" technology visual filter
    const roFilterBtn = page.locator('.visual-filter-btn[data-filter="ro"]').first();
    await roFilterBtn.click();

    // 1. Assert URL State: ensure exact state shareability is working
    // This assertion is correct. If it fails, it indicates a regression in the
    // `setFilterState` function which is responsible for syncing state to the URL.
    await expect(page).toHaveURL(/facets=ro/);

    // 2. Assert UI State: ensure the button gets the active CSS highlight
    await expect(roFilterBtn).toHaveClass(/active/);

    // 3. Assert DOM Update: With Preact, the DOM is re-rendered with a new set of products.
    // We assert that the number of products has changed correctly.
    const finalProductCount = await page.locator('.product-card').count();

    // The number of filtered products should be less than the total, but more than zero.
    expect(finalProductCount).toBeLessThan(initialProductCount);
    expect(finalProductCount).toBeGreaterThan(0);
  });
});
