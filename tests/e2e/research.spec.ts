import { test, expect } from "@playwright/test";

test("manuscript form appears only where the manuscript is available", async ({ page }) => {
  await page.goto("/research");
  const entries = page.locator(".research-entry");
  await expect(entries).toHaveCount(2);
  await expect(page.locator('form[name="manuscript-request"]')).toHaveCount(1);
});

test("research updates include the multi-topic post", async ({ page }) => {
  await page.goto("/research");
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.length).toBe(2);
  expect(titles.join(" ")).toContain("Vision");
});
