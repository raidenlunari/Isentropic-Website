import { test, expect } from "@playwright/test";

test("official description appears verbatim", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".intro")).toHaveText(
    "Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students.",
  );
});

test("all four board members appear in order", async ({ page }) => {
  await page.goto("/");
  const names = await page.locator(".board-grid .board-name").allTextContents();
  expect(names).toEqual(["Moon Liu", "Jay Wang", "Owen Fong", "Stuart Li"]);
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
  await expect(page.locator(".rail .card")).toHaveCount(8);
});
