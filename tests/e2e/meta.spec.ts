import { test, expect } from "@playwright/test";

test("feed lists published posts and excludes drafts", async ({ request }) => {
  const res = await request.get("/rss.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect((xml.match(/<item>/g) ?? []).length).toBe(8);
  expect(xml).not.toContain("Fall build season preview");
  expect(xml).toContain("https://isentropic.tech");
});

test("feed item links are absolute", async ({ request }) => {
  const res = await request.get("/rss.xml");
  const xml = await res.text();
  const links = [...xml.matchAll(/<link>(.*?)<\/link>/g)].map((m) => m[1]);
  // The first <link> is the channel link; the rest belong to items.
  const itemLinks = links.slice(1);
  expect(itemLinks.length).toBe(8);
  for (const link of itemLinks) {
    expect(link.startsWith("https://isentropic.tech")).toBe(true);
  }
});

test("sitemap is generated", async ({ request }) => {
  const res = await request.get("/sitemap-index.xml");
  expect(res.status()).toBe(200);
});

test("each page carries a distinct title and description", async ({ page }) => {
  const seen = new Set<string>();
  for (const route of ["/", "/community", "/research", "/products", "/contribute"]) {
    await page.goto(route);
    const title = await page.title();
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(title.trim().length).toBeGreaterThan(0);
    expect(desc?.trim().length).toBeGreaterThan(0);
    expect(seen.has(title)).toBe(false);
    seen.add(title);
  }
});
