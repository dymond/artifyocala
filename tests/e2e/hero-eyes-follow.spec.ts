import { test, expect } from '@playwright/test';

test.describe('hero collage eyes', () => {
  test('pupils follow pointer on the live build', async ({ page }) => {
    await page.goto('/');

    const pupils = page.locator('[data-artify-hero-eyes] .artify-hero-pupil');
    await expect(pupils).toHaveCount(2);

    const before = await pupils.first().evaluate((el) => (el as HTMLElement).style.transform);

    // Use a real PointerEvent (our implementation listens to `pointermove` on window).
    await page.evaluate(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 40,
          clientY: 40,
          pointerId: 1,
          pointerType: 'mouse',
        }),
      );
    });
    await page.waitForTimeout(25);

    const after = await pupils.first().evaluate((el) => (el as HTMLElement).style.transform);

    // If the binding runs, the transform matrix should change.
    expect(after).not.toBe(before);
    expect(after).toContain('translate3d(');
  });
});

