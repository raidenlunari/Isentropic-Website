import { test, expect } from "@playwright/test";

test("each tier renders its own tick and card treatment", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".card--major").first()).toBeVisible();
  await expect(page.locator(".card--progress").first()).toBeVisible();
  await expect(page.locator(".card--standard").first()).toBeVisible();
  await expect(page.locator(".tick--major").first()).toBeVisible();
  await expect(page.locator(".tick--progress").first()).toBeVisible();
  await expect(page.locator(".tick--standard").first()).toBeVisible();
});

test("major card raises its shadow on hover", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".card--major").first();
  const before = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  await card.hover();
  await page.waitForTimeout(200);
  const after = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(after).not.toBe(before);
});

test("all three tiers share identical box width", async ({ page }) => {
  await page.goto("/");
  const widths = await page.evaluate(() =>
    ["major", "progress", "standard"].map((t) => {
      const el = document.querySelector(`.card--${t}`);
      return el ? Math.round(el.getBoundingClientRect().width) : -1;
    }),
  );
  expect(new Set(widths).size).toBe(1);
});

test("year markers appear once per year", async ({ page }) => {
  await page.goto("/");
  const years = await page.locator(".year").allTextContents();
  expect(new Set(years).size).toBe(years.length);
});
