import { test, expect } from "@playwright/test";
import { entries, publishedPostsWithTopic } from "./content";

// Counts derive from the content files. Adding an event (Task 5) and
// adding a post with `topics: [community]` (Task 1) are both routine
// instructed edits; neither should turn the suite red.
test("timeline lists every event", async ({ page }) => {
  await page.goto("/community");
  const events = entries("events");
  expect(events.length).toBeGreaterThan(0);
  await expect(page.locator(".events details")).toHaveCount(events.length);
});

test("community updates exclude posts from other topics", async ({ page }) => {
  await page.goto("/community");
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.length).toBe(publishedPostsWithTopic("community").length);
  expect(titles.join(" ")).not.toContain("Chassis");
});
