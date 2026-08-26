import { test, expect } from "@playwright/test";

test("hardware is listed before software", async ({ page }) => {
  await page.goto("/products");
  const kinds = await page.locator(".product[data-kind]").evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-kind")),
  );
  expect(kinds).toEqual(["hardware", "software"]);
});

test("the multi-topic post appears here too", async ({ page }) => {
  await page.goto("/products");
  const titles = await page.locator(".updates .title").allTextContents();
  expect(titles.join(" ")).toContain("Vision");
});
