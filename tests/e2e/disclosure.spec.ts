import { test, expect } from "@playwright/test";

test("disclosure opens with the keyboard", async ({ page }) => {
  await page.goto("/community");
  const first = page.locator("details").first();
  await expect(first).not.toHaveAttribute("open", "");
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");
});

test("disclosure content is present in the DOM before opening", async ({ page }) => {
  await page.goto("/community");
  const body = page.locator("details .disclosure-body").first();
  await expect(body).toBeAttached();
});
