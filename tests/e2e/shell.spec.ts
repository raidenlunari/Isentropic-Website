import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/community", "/research", "/products", "/contribute"];

test("skip link reaches main content", async ({ page }) => {
  await page.goto("/");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeAttached();
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main");
});

test("every route exposes exactly one h1", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("current page is marked in the navigation", async ({ page }) => {
  await page.goto("/community");
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText("Community");
});

// Nav.astro's normalize() strips a trailing slash from every path except
// "/" itself (stripping it there would leave an empty string, which would
// never equal the "/" href). That root-path branch has its own guard
// clause and is not exercised by any other route in this file.
test("home is marked in the navigation at the root path", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText("Home");
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${route} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
