import { test, expect } from '@playwright/test';

test.describe('public pages', () => {
  test('home loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Artify Ocala/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Art & exploration/i);
    await expect(page.locator('#who')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /Who we are/i })).toBeVisible();
    await expect(page.locator('#artify-who-canvas')).toHaveCount(1);
  });

  test('about and volunteer render', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/About Artify Ocala/);
    await page.goto('/volunteer');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Volunteer/);
  });

  test('program routes render', async ({ page }) => {
    await page.goto('/programs/maker-collective');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Marion County Maker Collective/);
    await page.goto('/programs/maker-collective/equipment');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Equipment wish list/);
  });

  test('floating wheel menu opens and lists program links', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const wheelNav = page.getByRole('navigation', { name: 'Site menu' });
    await expect(wheelNav).toBeVisible();
    await expect(wheelNav.getByRole('link', { name: 'Brick City Glam' })).toBeVisible();
  });

});
