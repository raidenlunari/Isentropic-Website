import { test, expect } from "@playwright/test";
import { entries, publishedPostsWithTopic, text } from "./content";

// Counts derive from the content files. Adding an event (Task 5) and
// adding a post with `topics: [community]` (Task 1) are both routine
// instructed edits; neither should turn the suite red.
test("timeline lists every event", async ({ page }) => {
  await page.goto("/community");
  const events = entries("events");
  expect(events.length).toBeGreaterThan(0);
  await expect(page.locator(".events details")).toHaveCount(events.length);
});

// The expected titles are the published posts whose `topics` include
// `community`, read from the blog files - so a post from another topic
// leaking in, or a community post going missing, both fail here.
test("community updates list exactly the posts carrying the community topic", async ({
  page,
}) => {
  await page.goto("/community");
  const expected = publishedPostsWithTopic("community")
    .map((entry) => text(entry, "title"))
    .sort();
  expect(expected.length).toBeGreaterThan(0);
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.sort()).toEqual(expected);
});
