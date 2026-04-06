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

  test('about, donate, and volunteer render from CMS JSON', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/About Artify Ocala/);
    await expect(page.getByText(/cultivate a vibrant arts community/i)).toBeVisible();
    await page.goto('/donate');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Donate/);
    await expect(page.getByRole('link', { name: /Donate online/i })).toBeVisible();
    await page.goto('/volunteer');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Volunteer/);
  });

  test('program routes render', async ({ page }) => {
    await page.goto('/programs/maker-collective');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Marion County Maker Collective/);
    await page.goto('/programs/maker-collective/equipment');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Equipment wish list/);
  });

  test('Brick City Glam program page shows marquee photo gallery', async ({ page }) => {
    await page.goto('/programs/brick-city-glam');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Brick City Glam/i);
    const gallery = page.getByTestId('brick-city-glam-gallery-marquee');
    await expect(gallery).toBeVisible();
    const visibleImgs = gallery.locator('img').filter({ visible: true });
    await expect(visibleImgs.first()).toBeVisible();
    expect(await visibleImgs.count()).toBe(34);
  });

  test('Maker Collective and Storytelling Knights program pages show marquee galleries', async ({
    page,
  }) => {
    await page.goto('/programs/maker-collective');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Marion County Maker Collective/i);
    const makerGallery = page.getByTestId('maker-collective-gallery-marquee');
    await expect(makerGallery).toBeVisible();
    expect(await makerGallery.locator('img').filter({ visible: true }).count()).toBe(10);

    await page.goto('/programs/storytelling-knights');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Storytelling Knights/i);
    const storyGallery = page.getByTestId('storytelling-knights-gallery-marquee');
    await expect(storyGallery).toBeVisible();
    expect(await storyGallery.locator('img').filter({ visible: true }).count()).toBe(10);
  });

  test('equipment wish list page shows marquee makerspace strip', async ({ page }) => {
    await page.goto('/programs/maker-collective/equipment');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Equipment wish list/i);
    const gallery = page.getByTestId('makerspace-equipment-gallery-marquee');
    await expect(gallery).toBeVisible();
    expect(await gallery.locator('img').filter({ visible: true }).count()).toBe(8);
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
