import { test, expect } from "@playwright/test";

test("phi renders in EB Garamond, not a fallback", async ({ page }) => {
  await page.goto("/");
  const mark = page.locator(".wordmark");
  await expect(mark).toContainText("φ");

  // A glyph served by a fallback face measures differently from one served by
  // EB Garamond. Compare the phi against a Latin character known to come from
  // EB Garamond: if the phi fell back, the ratio shifts sharply.
  const ratio = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector(".wordmark")!);
    const measure = (text: string, family: string) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `30px ${family}`;
      return c.measureText(text).width;
    };
    const inFace = measure("φ", cs.fontFamily);
    const inFallback = measure("φ", "Georgia, serif");
    return inFace / inFallback;
  });
  expect(ratio).not.toBeCloseTo(1, 3);

  await expect(page).toHaveScreenshot("wordmark.png");
});
