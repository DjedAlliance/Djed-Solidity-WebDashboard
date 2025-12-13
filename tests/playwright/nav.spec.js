const { test, expect } = require('@playwright/test');

test('navigate to StableCoin and ReserveCoin via main nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav, header')).toBeVisible();

  // Click the StableCoin link in the main nav
  await page.click('text=StableCoin');
  await expect(page.locator('h1')).toContainText('StableCoin');

  // Click the ReserveCoin link
  await page.click('text=ReserveCoin');
  await expect(page.locator('h1')).toContainText('ReserveCoin');
});
