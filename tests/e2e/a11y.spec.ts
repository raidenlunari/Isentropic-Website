import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { entries as contentEntries, isTrue } from "./content";

const openRoleCount = () =>
  contentEntries("roles").filter((role) => isTrue(role, "open")).length;

const ROUTES = [
  "/", "/community", "/parts", "/research", "/products", "/contribute",
  "/thanks", "/blog/2026-10-02-state-estimation-paper",
  "/blog/2026-07-17-east-bay-robotics-camp-report",
];

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

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
      .withTags(AXE_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

// A second axe pass at phone width with every disclosure open. Some rules
// only have something to flag once content overflows: a table wrapper or
// a code block that scrolls at 360px but fits at desktop width is invisible
// to the sweep above (scrollable-region-focusable), and a disclosure's
// body is not rendered until it is open.
for (const route of ["/research", "/products", "/blog/2026-10-02-state-estimation-paper"]) {
  test(`${route} has no accessibility violations at 360px with disclosures open`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(route);
    await page.$$eval("details", (els) => els.forEach((el) => (el.open = true)));
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

// Every disclosure is opened before measuring. A closed <details> renders
// none of its body, so a table or an unbreakable URL inside an entry can
// only widen the page once a visitor expands it - which is exactly when
// this check has to hold, and exactly what a closed-state measurement
// cannot see.
for (const width of [360, 768, 1440]) {
  test(`no horizontal overflow at ${width}px, with every disclosure open`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      await page.$$eval("details", (els) => els.forEach((el) => (el.open = true)));
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

// Volunteer roles are the third place an entry's Markdown body is spliced
// in under an <h3> entry title (contribute.astro renders each role title as
// an h3). No role file exists today, so the assertion has nothing to check
// until one is added - but CONTENT-GUIDE.md Task 11 tells authors to write
// "## ..." headings, and src/content/roles/ is in the level-shifting
// plugin's list precisely so that a role author who follows that guidance
// gets h4s under the h3 rather than h2s over it. This is the assertion that
// holds that arrangement in place once a role is listed.
test("role bodies nest strictly under their role's h3 title", async ({ page }) => {
  await page.goto("/contribute");
  const entries = await headingLevelsPerEntry(page, ".role");
  // The expected count comes from the role files rather than a literal:
  // with no open role, the page lists none and there is nothing to nest.
  // The assertion engages again the moment a role is listed.
  expect(entries.length).toBe(openRoleCount());
  for (const levels of entries) {
    const [titleLevel, ...bodyLevels] = levels;
    expect(titleLevel).toBe(3);
    for (const level of bodyLevels) {
      expect(level).toBeGreaterThan(titleLevel);
    }
  }
});

// Community events are the one many-entries-per-page surface whose bodies
// are NOT level-shifted: the Disclosure summary that titles each event is a
// <span>, not a heading, so a shifted body heading would have no ancestor
// heading to nest under. CONTENT-GUIDE.md Task 11 tells event authors to
// use bold labels and lists instead of "##" headings, and this assertion is
// what makes that rule enforceable rather than merely documented.
test("community events carry no headings (unaffected by the heading-nesting plugin)", async ({ page }) => {
  await page.goto("/community");
  const headingsInEvents = await page.locator(".events h1,.events h2,.events h3,.events h4,.events h5,.events h6").count();
  expect(headingsInEvents).toBe(0);
});

// Asserted structurally rather than as a pinned sequence: the title is
// the page's only h1, the body's first heading is an h2 (so the shift the
// plugin applies to entry bodies did NOT touch this article), and every
// later body heading is an h2 or an h3 with at least one h3 present. A
// shifted article would start its body at h4 and fail the second check.
test("blog article headings are unshifted (h1 title, h2/h3 body as authored)", async ({ page }) => {
  await page.goto("/blog/2026-10-02-state-estimation-paper");
  const levels = await page.$$eval("main h1,main h2,main h3,main h4,main h5,main h6", (hs) =>
    hs.map((h) => Number(h.tagName.slice(1))),
  );
  expect(levels[0]).toBe(1);
  const body = levels.slice(1);
  expect(body.length).toBeGreaterThan(1);
  expect(body[0]).toBe(2);
  expect(body.every((level) => level === 2 || level === 3)).toBe(true);
  expect(body).toContain(3);
});
