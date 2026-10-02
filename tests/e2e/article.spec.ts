import { test, expect } from "@playwright/test";

const ARTICLE_PATH = "/blog/2026-10-02-state-estimation-paper";

test("article renders in the reading layer", async ({ page }) => {
  await page.goto(ARTICLE_PATH);
  const h1 = page.locator("h1");
  await expect(h1).toBeVisible();
  const family = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain("Garamond");
  const body = await page
    .locator(".prose p")
    .first()
    .evaluate((el) => getComputedStyle(el).fontSize);
  expect(body).toBe("18px");
});

// _TEMPLATE.md is excluded before publishedPosts() ever runs, by the
// content loader's own glob pattern ("**/[^_]*.md" in content.config.ts).
// This proves an unknown/underscore-excluded slug 404s; it does NOT
// exercise the draft filter itself - see the next test for that, which
// uses a real draft post the glob does include.
test("an unknown slug excluded by the content loader's glob returns 404", async ({
  page,
}) => {
  const response = await page.goto("/blog/_TEMPLATE");
  expect(response?.status()).toBe(404);
});

// src/content/blog/2026-10-02-string-based-differential-elevator.md has
// draft: true and an ordinary (non-underscore) filename, so the loader's
// glob includes it and only publishedPosts() in getStaticPaths keeps it off
// the site. Deleting `publishedPosts(...)` from
// src/pages/blog/[...slug].astro turns this test red.
test("draft posts do not get a route, and are excluded from the homepage", async ({
  page,
}) => {
  const response = await page.goto("/blog/2026-10-02-string-based-differential-elevator");
  expect(response?.status()).toBe(404);

  await page.goto("/");
  await expect(
    page.getByText("Design and kinematic analysis of a string-based differential elevator for VEX Robotics"),
  ).toHaveCount(0);
});

test("prose column does not exceed its measure", async ({ page }) => {
  await page.goto(ARTICLE_PATH);
  const width = await page
    .locator(".prose")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(768);
});

test("article metadata block shows the publish date and contact email", async ({
  page,
}) => {
  await page.goto(ARTICLE_PATH);
  const meta = page.locator(".article-meta");
  await expect(meta).toContainText("Published");
  await expect(meta).toContainText("October 2, 2026");
  await expect(meta.locator("a[href='mailto:contact@isentropic.tech']")).toBeVisible();
});

// getComputedStyle(...).fontFamily only reports the CSS-declared font
// stack - it would still say `"EB Garamond Variable", ...` even if that
// file 404'd and the browser silently fell back to Georgia. These two
// tests use the same canvas text-metrics technique as the Task 1
// precedent in tests/e2e/wordmark.spec.ts: a glyph rendered by a fallback
// face measures a different width than one rendered by the real face, so
// a font that failed to load produces a ratio close to 1 instead of one
// that differs from it.
test("the article title is measurably EB Garamond, not a fallback", async ({
  page,
}) => {
  await page.goto(ARTICLE_PATH);
  const ratio = await page.evaluate(async () => {
    const h1 = document.querySelector("h1")!;
    const cs = getComputedStyle(h1);
    // Wait for the exact face the assertion cares about before measuring,
    // so an in-flight load can't get measured as if it were the fallback.
    await document.fonts.load('60px "EB Garamond Variable"');
    await document.fonts.ready;
    const measure = (text: string, family: string, size: string) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `${size} ${family}`;
      return c.measureText(text).width;
    };
    const probe = "Reliability-oriented evaluation of state estimation on VEX V5";
    const inFace = measure(probe, cs.fontFamily, cs.fontSize);
    const inFallback = measure(probe, "Georgia, serif", cs.fontSize);
    return inFace / inFallback;
  });
  expect(ratio).not.toBeCloseTo(1, 3);
});

test("the article body is measurably Source Sans 3, not a fallback", async ({
  page,
}) => {
  await page.goto(ARTICLE_PATH);
  const ratio = await page.evaluate(async () => {
    const p = document.querySelector(".prose p")!;
    const cs = getComputedStyle(p);
    await document.fonts.load('18px "Source Sans 3 Variable"');
    await document.fonts.ready;
    const measure = (text: string, family: string, size: string) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `${size} ${family}`;
      return c.measureText(text).width;
    };
    const probe = "The quick brown fox jumps over the lazy dog";
    const inFace = measure(probe, cs.fontFamily, cs.fontSize);
    const inFallback = measure(probe, "system-ui, sans-serif", cs.fontSize);
    return inFace / inFallback;
  });
  expect(ratio).not.toBeCloseTo(1, 3);
});

// The state-estimation paper post carries representative Markdown
// (nested headings, lists, a fenced code block, a captioned table, a
// figure, and links) drawn from the paper itself, so the reading layer's
// heading, list, and scroll rules are exercised by real content and a
// committed test rather than staying proven only in principle.
test("headings render in the reading layer, and the article has exactly one h1", async ({
  page,
}) => {
  await page.goto(ARTICLE_PATH);

  // Exactly one h1 on the whole document - the article title from
  // ArticleLayout - and none inside the rendered Markdown body itself.
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".prose h1")).toHaveCount(0);

  // The post body's headings start at h2, per the single-h1 rule.
  const tags = await page
    .locator(".prose :is(h2, h3, h4, h5, h6)")
    .evaluateAll((els) => els.map((el) => el.tagName));
  expect(tags.length).toBeGreaterThan(0);
  expect(tags[0]).toBe("H2");
  expect(tags).toContain("H3");

  // Body headings render in the display face, not the body face.
  const family = await page
    .locator(".prose h2")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain("Garamond");
});

test("a wide table and a wide code block scroll within themselves, not the page, at 360px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(ARTICLE_PATH);

  // rehype-wrap-tables (astro.config.mjs) wraps every <table> in a
  // .table-scroll div; that wrapper is what scrolls, not the table
  // itself - see the accessibility-role test below for why.
  const tableScroll = page.locator(".prose .table-scroll").first();
  const tableMetrics = await tableScroll.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));
  expect(tableMetrics.scrollWidth).toBeGreaterThan(tableMetrics.clientWidth);

  const pre = page.locator(".prose pre").first();
  const preMetrics = await pre.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));
  expect(preMetrics.scrollWidth).toBeGreaterThan(preMetrics.clientWidth);

  // The content scrolls; the page itself must not.
  const pageMetrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(pageMetrics.scrollWidth).toBeLessThanOrEqual(pageMetrics.clientWidth);
});

// A table needs `display: table` to keep its implicit table/row/cell
// accessibility roles - putting `overflow-x: auto` directly on the table
// (which computes its display away from `table`) silently strips them,
// removing row/column navigation and header association for screen
// reader users. getByRole("table") queries the browser's actual
// accessibility tree, so this fails if that regression comes back, not
// just a CSS property assertion.
test("the table keeps its table accessibility role while its wrapper scrolls", async ({
  page,
}) => {
  await page.goto(ARTICLE_PATH);
  // The post carries one table, the physical-trial results, which is the
  // one wide enough to need scrolling; it must keep its role.
  const tables = page.getByRole("table");
  expect(await tables.count()).toBeGreaterThan(0);

  const display = await page
    .locator(".prose table")
    .first()
    .evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe("table");
});

// Every PostCard on every index page has linked to /blog/<id>/ since Task 5,
// but the route did not exist until this task - every one of those links
// was a 404. This test collects every card href actually emitted into the
// built output on each index page and requests it, so a future slug or
// trailing-slash mismatch between a card's href and getStaticPaths fails
// the suite instead of shipping silently (Task 4's trailing-slash bug is
// exactly this class of mistake).
test("every card link on every index page resolves", async ({ page, request }) => {
  const indexPages = ["/", "/community", "/research", "/products"];
  const hrefs = new Set<string>();

  for (const path of indexPages) {
    await page.goto(path);
    const links = await page.locator("a[href]").evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")).filter((href): href is string => !!href),
    );
    for (const href of links) {
      // Only check same-site content links (cards, nav) - skip mailto:,
      // external links, and anchors, which are not this task's concern.
      if (href.startsWith("/") && !href.startsWith("//")) {
        hrefs.add(href);
      }
    }
  }

  expect(hrefs.size).toBeGreaterThan(0);

  const results: Array<{ href: string; status: number }> = [];
  for (const href of hrefs) {
    const response = await request.get(href);
    results.push({ href, status: response.status() });
  }

  const failures = results.filter((r) => r.status === 404);
  expect(failures, JSON.stringify(failures)).toEqual([]);

  // Surface the count for the test report without failing the run.
  console.log(`Checked ${results.length} links across ${indexPages.length} index pages.`);
});
