import { test, expect } from '@playwright/test';

test('has title and displays recommended equity share', async ({ page }) => {
  await page.goto('/');

  // Check title
  await expect(page).toHaveTitle(/Practical Finance Calculator/);

  // Check for the large value display (recommended share)
  const valueDisplay = page.locator('.result-hero .value');
  await expect(valueDisplay).toBeVisible();

  // Initial calculation check: 
  // 30y old, 100k net worth, 100k salary, RRA 7 -> Should be 100% equity 
  // Because human capital is huge (~2M) relative to 100k net worth.
  // 0.155 * (1 + 2000000/100000) = 0.155 * 21 = 3.255 -> Capped at 100%
  await expect(valueDisplay).toHaveText('100%');

  // Change risk aversion to 10 (most conservative)
  const raSlider = page.locator('input[type="range"]').first();
  await raSlider.fill('10');

  // Value should still probably be 100% or close.
  // Merton share for 10 is 0.108
  // 0.108 * 21 = 2.26 -> still 100%
});
