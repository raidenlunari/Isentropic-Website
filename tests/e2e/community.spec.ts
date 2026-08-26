import { test, expect } from "@playwright/test";

test("timeline lists every event", async ({ page }) => {
  await page.goto("/community");
  await expect(page.locator(".events details")).toHaveCount(4);
});

test("community updates exclude posts from other topics", async ({ page }) => {
  await page.goto("/community");
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.length).toBe(3);
  expect(titles.join(" ")).not.toContain("Chassis");
});
