import { test, expect } from "@playwright/test";

test("article renders in the reading layer", async ({ page }) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
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

test("draft posts do not get a route", async ({ page }) => {
  const response = await page.goto("/blog/_TEMPLATE");
  expect(response?.status()).toBe(404);
});

test("prose column does not exceed its measure", async ({ page }) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
  const width = await page
    .locator(".prose")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(768);
});

test("article metadata block shows the publish date and contact email", async ({
  page,
}) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
  const meta = page.locator(".article-meta");
  await expect(meta).toContainText("Published");
  await expect(meta).toContainText("August 12, 2026");
  await expect(meta.locator("a[href='mailto:contact@isentropicrobotics.org']")).toBeVisible();
});

test("body text renders in the Source Sans body face, not a fallback", async ({
  page,
}) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");
  const family = await page
    .locator(".prose p")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain("Source Sans");
});

// The 2026-08-12 post is enriched with representative Markdown (headings,
// lists, a blockquote, inline code, a fenced code block, a table, and a
// link) specifically so the reading layer's heading, list, and scroll
// rules are exercised by real content and a committed test rather than
// staying proven only in principle.
test("headings render in the reading layer, and the article has exactly one h1", async ({
  page,
}) => {
  await page.goto("/blog/2026-08-12-summer-camp-program-report");

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
  await page.goto("/blog/2026-08-12-summer-camp-program-report");

  const table = page.locator(".prose table").first();
  const tableMetrics = await table.evaluate((el) => ({
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
