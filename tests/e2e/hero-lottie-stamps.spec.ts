import { test, expect } from "@playwright/test";

test.describe("hero Lottie stamps", () => {
  test("inits Lottie canvases on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const scene = page.locator(".artify-hero-scene-grid");
    await scene.scrollIntoViewIfNeeded();

    const canvases = scene.locator("canvas[data-dotlottie-src]");
    await expect(canvases).toHaveCount(3);

    const first = canvases.nth(0);
    await expect(async () => {
      const w = await first.evaluate((el) => (el as HTMLCanvasElement).clientWidth);
      expect(w).toBeGreaterThan(16);
    }).toPass({ timeout: 12_000 });
  });
});
