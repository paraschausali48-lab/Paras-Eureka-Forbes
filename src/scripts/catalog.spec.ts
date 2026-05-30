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

    // 3. Assert DOM Update: Preact dynamically unmounts non-matching products from the grid.
    // We assert that the total number of rendered products has decreased.
    const finalProductCount = await page.locator('.product-card').count();

    // The number of filtered products should be less than the total, but more than zero.
    expect(finalProductCount).toBeLessThan(initialProductCount);
    expect(finalProductCount).toBeGreaterThan(0);
  });

  test('should persist wishlist state across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card');

    // 1. Locate the first product's wishlist toggle button
    const firstWishlistBtn = page.locator('.wishlist-toggle-btn').first();

    // Get the SKU of the first product to verify it later
    const productCard = firstWishlistBtn.locator('closest=.product-card');
    const expectedSku = await productCard.getAttribute('data-sku');

    // 2. Add to wishlist
    await firstWishlistBtn.click();

    // 3. Reload the page to simulate a returning user
    await page.reload();
    await page.waitForSelector('.product-card');

    // 4. Assert that the LocalStorage hydration worked and the badge updated
    const wishlistBadge = page.locator('.wishlist-badge').first();
    await expect(wishlistBadge).toBeVisible();
    await expect(wishlistBadge).toHaveText('1');
  });
});
