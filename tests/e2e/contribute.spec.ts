import { test, expect } from "@playwright/test";

test("sponsor packet link resolves", async ({ page, request }) => {
  await page.goto("/contribute");
  const href = await page.locator("a.packet").getAttribute("href");
  expect(href).toBeTruthy();
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("role select lists open roles plus the open-ended option", async ({ page }) => {
  await page.goto("/contribute");
  const options = await page
    .locator('form[name="application"] select[name="role"] option')
    .allTextContents();
  expect(options).toContain("<insert-role-you-excel-at/>");
  expect(options.length).toBeGreaterThan(4);
});

test("closed roles are not listed", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page.locator(".role")).toHaveCount(4);
});

test("contribute page has a single h1", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page.locator("h1")).toHaveCount(1);
});
