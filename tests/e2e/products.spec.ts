import { test, expect } from "@playwright/test";
import { entries, publishedPostsWithTopic, text } from "./content";

const KIND_ORDER = ["hardware", "software"];

// Every product entry is listed, and the listing is grouped hardware
// first, then software (sortByKind in src/lib/posts.ts). The expected
// count comes from the product files, so adding a product (CONTENT-GUIDE.md
// Task 7) does not turn this red; the grouping is asserted as a sort
// order rather than a pinned sequence, so it holds for any mix of kinds,
// including a single product.
test("every product is listed, hardware before software", async ({ page }) => {
  await page.goto("/products");
  const kinds = await page.locator(".product[data-kind]").evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-kind")),
  );
  expect(kinds.length).toBe(entries("products").length);
  expect(kinds.length).toBeGreaterThan(0);
  const sorted = [...kinds].sort(
    (a, b) => KIND_ORDER.indexOf(a!) - KIND_ORDER.indexOf(b!),
  );
  expect(kinds).toEqual(sorted);
});

// The updates rail lists exactly the published posts whose `topics`
// include `product`. When no post carries that topic the page omits the
// section entirely rather than rendering an empty heading, and the test
// asserts that too.
test("product updates list exactly the posts carrying the product topic", async ({
  page,
}) => {
  await page.goto("/products");
  const expected = publishedPostsWithTopic("product")
    .map((entry) => text(entry, "title"))
    .sort();
  if (expected.length === 0) {
    await expect(page.locator(".updates")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Product updates" })).toHaveCount(0);
    return;
  }
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.sort()).toEqual(expected);
});
