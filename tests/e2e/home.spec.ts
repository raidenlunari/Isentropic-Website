import { test, expect } from "@playwright/test";
import { entries, field, publishedPosts, text } from "./content";

test("official description appears verbatim", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".intro")).toHaveText(
    "Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students.",
  );
});

// The expected sequence is built from the board files' own `order`
// values, so this still asserts what it was written to assert - that the
// grid honours `order` - while surviving the addition of a board member
// (CONTENT-GUIDE.md Task 3).
test("board members appear in their declared order", async ({ page }) => {
  await page.goto("/");
  const expected = entries("board")
    .sort((a, b) => Number(field(a, "order")) - Number(field(b, "order")))
    .map((member) => text(member, "name"));
  expect(expected.length).toBeGreaterThan(1);
  const names = await page.locator(".board-grid .board-name").allTextContents();
  expect(names).toEqual(expected);
});

test("every board headshot carries alt text", async ({ page }) => {
  await page.goto("/");
  const imgs = page.locator(".board-grid img");
  for (let i = 0; i < (await imgs.count()); i++) {
    await expect(imgs.nth(i)).toHaveAttribute("alt", /\S/);
  }
});

test("homepage lists every published post", async ({ page }) => {
  await page.goto("/");
  const published = publishedPosts();
  // A derived count can pass vacuously if the derivation returns zero, so
  // the expectation is checked for substance before it is used.
  expect(published.length).toBeGreaterThan(0);
  await expect(page.locator(".rail .card")).toHaveCount(published.length);
});
