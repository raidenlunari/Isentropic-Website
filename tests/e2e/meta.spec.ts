import { test, expect } from "@playwright/test";
import { draftPosts, publishedPosts, text } from "./content";

// Both the item count and the titles that must be absent derive from the
// blog files, so publishing a post (Task 1) or starting a new draft
// (Task 2) does not turn this red for a correct content change.
test("feed lists published posts and excludes drafts", async ({ request }) => {
  const res = await request.get("/rss.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect((xml.match(/<item>/g) ?? []).length).toBe(publishedPosts().length);
  const drafts = draftPosts();
  expect(drafts.length).toBeGreaterThan(0);
  for (const draft of drafts) {
    expect(xml).not.toContain(text(draft, "title"));
  }
  expect(xml).toContain("https://isentropic.tech");
});

test("feed item links are absolute", async ({ request }) => {
  const res = await request.get("/rss.xml");
  const xml = await res.text();
  const links = [...xml.matchAll(/<link>(.*?)<\/link>/g)].map((m) => m[1]);
  // The first <link> is the channel link; the rest belong to items.
  const itemLinks = links.slice(1);
  expect(itemLinks.length).toBe(publishedPosts().length);
  for (const link of itemLinks) {
    expect(link.startsWith("https://isentropic.tech")).toBe(true);
  }
});

test("sitemap is generated", async ({ request }) => {
  const res = await request.get("/sitemap-index.xml");
  expect(res.status()).toBe(200);
});

// Both halves of the name are asserted. An earlier version of this test
// collected only titles into `seen` and checked descriptions for
// non-emptiness, which would have passed while all five pages shared the
// single sitewide `site.description` - the exact regression this test
// exists to catch. Descriptions get the same Set treatment as titles.
test("each page carries a distinct title and description", async ({ page }) => {
  const seenTitles = new Set<string>();
  const seenDescriptions = new Set<string>();
  for (const route of ["/", "/community", "/parts", "/research", "/products", "/contribute"]) {
    await page.goto(route);
    const title = await page.title();
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(title.trim().length).toBeGreaterThan(0);
    expect(desc?.trim().length ?? 0).toBeGreaterThan(0);
    expect(seenTitles.has(title), `${route} repeats an earlier title`).toBe(false);
    expect(
      seenDescriptions.has(desc!.trim()),
      `${route} repeats an earlier description`,
    ).toBe(false);
    seenTitles.add(title);
    seenDescriptions.add(desc!.trim());
  }
});
