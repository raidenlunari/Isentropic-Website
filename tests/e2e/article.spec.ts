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
