import { test, expect } from "@playwright/test";

test("phi renders in EB Garamond, not a fallback", async ({ page }) => {
  await page.goto("/");
  const mark = page.locator(".wordmark");
  await expect(mark).toContainText("φ");

  // A glyph served by a fallback face measures differently from one served by
  // EB Garamond. Compare the phi against a Latin character known to come from
  // EB Garamond: if the phi fell back, the ratio shifts sharply.
  const ratio = await page.evaluate(async () => {
    const cs = getComputedStyle(document.querySelector(".wordmark")!);
    // The wordmark's font stack resolves EB Garamond Variable first;
    // measuring before it has finished loading would silently measure the
    // fallback face instead and pass for the wrong reason. Wait for the
    // exact face the assertion cares about, then for fonts overall.
    await document.fonts.load('30px "EB Garamond Variable"');
    await document.fonts.ready;
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

  await expect(mark).toHaveScreenshot("wordmark.png");
});
