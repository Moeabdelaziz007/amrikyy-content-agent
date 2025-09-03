import { test, expect } from '@playwright/test';

test('landing loads and dashboard runs agent (DEV mode)', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('text=AI Content Agent')).toBeVisible();

  await page.evaluate(() => {
    document.cookie = `siwe_jwt=${btoa(JSON.stringify({ sub:'0xdev', wallet:'0xdev' }))}; path=/; SameSite=Lax`;
  });

  await page.click('text=Open Dashboard');
  await expect(page.locator('text=Content Agent')).toBeVisible();

  await page.click('text=Run Content Agent');

  await page.waitForTimeout(1000);
  const pre = page.locator('pre');
  await expect(pre).toBeVisible({ timeout: 5000 });
});
