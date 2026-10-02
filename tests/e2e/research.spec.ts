import { test, expect } from "@playwright/test";
import { entries, isTrue, publishedPostsWithTopic, text } from "./content";

// Counts come from the content files rather than from literals. Both
// numbers this test cares about are ones CONTENT-GUIDE.md Task 6 actively
// instructs a maintainer to change: adding a research entry, and setting
// `manuscriptAvailable: true` on an entry whose write-up can be shared.
// Pinned literals turned those correct edits into a red suite.
const researchEntries = entries("research");
const withManuscript = researchEntries.filter((entry) =>
  isTrue(entry, "manuscriptAvailable"),
);

test("manuscript form appears only where the manuscript is available", async ({ page }) => {
  await page.goto("/research");
  await expect(page.locator(".research-entry")).toHaveCount(researchEntries.length);

  // Guards against the assertion passing vacuously if every entry were to
  // set `manuscriptAvailable: false`: "zero forms rendered" would satisfy
  // a count check while proving nothing about where forms appear.
  expect(withManuscript.length).toBeGreaterThan(0);
  await expect(page.locator('form[name="manuscript-request"]')).toHaveCount(
    withManuscript.length,
  );

  // Per-entry correspondence, not just the total: each rendered form
  // identifies itself with the title of one available manuscript, and
  // together they name exactly the set of entries that declare one.
  const identified = await page
    .locator('input[name="manuscript"]')
    .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
  expect(identified.sort()).toEqual(
    withManuscript.map((entry) => text(entry, "title")).sort(),
  );
});

// The expected titles are the published posts whose `topics` include
// `research`, read from the blog files. A post carrying several topics
// (CONTENT-GUIDE.md Task 1) appears here as well as on its other pages;
// one carrying none of them must not.
test("research updates list exactly the posts carrying the research topic", async ({
  page,
}) => {
  await page.goto("/research");
  const expected = publishedPostsWithTopic("research")
    .map((entry) => text(entry, "title"))
    .sort();
  expect(expected.length).toBeGreaterThan(0);
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.sort()).toEqual(expected);
});
