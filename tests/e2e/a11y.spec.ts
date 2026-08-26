import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/", "/community", "/research", "/products", "/contribute",
  "/thanks", "/blog/2026-08-12-summer-camp-program-report",
];

for (const route of ROUTES) {
  test(`${route} has no accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      // "best-practice" is defence in depth: it would not have caught the
      // h3-title/h2-body heading inversion below (heading-order only flags
      // an *increase* that skips a level, never a decrease - a decrease is
      // always structurally legal to axe), but it does surface
      // landmark-one-main, region, page-has-heading-one, and empty-heading,
      // which are worth having checked on every route.
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const width of [360, 768, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

// axe's heading-order rule only flags an *increase* that skips a level; a
// decrease is always structurally legal to it and is never flagged. That
// means no axe configuration - "best-practice" tag included - can catch an
// entry's own body headings (rendered from its Markdown "##") outranking
// the <h3> entry title that contains them. This has to be asserted directly
// by reading the actual rendered heading sequence per entry.
async function headingLevelsPerEntry(page: import("@playwright/test").Page, entrySelector: string) {
  return page.$$eval(entrySelector, (entries) =>
    entries.map((entry) =>
      Array.from(entry.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) =>
        Number(h.tagName.slice(1)),
      ),
    ),
  );
}

test("research entry bodies nest strictly under their entry's h3 title", async ({ page }) => {
  await page.goto("/research");
  const entries = await headingLevelsPerEntry(page, ".research-entry");
  expect(entries.length).toBeGreaterThan(0);
  for (const levels of entries) {
    const [titleLevel, ...bodyLevels] = levels;
    expect(titleLevel).toBe(3);
    for (const level of bodyLevels) {
      expect(level).toBeGreaterThan(titleLevel);
    }
  }
});

test("product entry bodies nest strictly under their entry's h3 title", async ({ page }) => {
  await page.goto("/products");
  const entries = await headingLevelsPerEntry(page, ".product");
  expect(entries.length).toBeGreaterThan(0);
  for (const levels of entries) {
    const [titleLevel, ...bodyLevels] = levels;
    expect(titleLevel).toBe(3);
    for (const level of bodyLevels) {
      expect(level).toBeGreaterThan(titleLevel);
    }
  }
});

test("community events carry no headings (unaffected by the heading-nesting plugin)", async ({ page }) => {
  await page.goto("/community");
  const headingsInEvents = await page.locator(".events h1,.events h2,.events h3,.events h4,.events h5,.events h6").count();
  expect(headingsInEvents).toBe(0);
});

test("blog article headings are unshifted (h1 title, h2/h3 body as authored)", async ({ page }) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
  const levels = await page.$$eval("main h1,main h2,main h3,main h4,main h5,main h6", (hs) =>
    hs.map((h) => Number(h.tagName.slice(1))),
  );
  expect(levels[0]).toBe(1);
  expect(levels.slice(1)).toEqual([2, 3, 2]);
});
