import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Every collection's `_TEMPLATE.md` file is excluded from the built site
// by the glob pattern in content.config.ts (`"**/[^_]*.md"`), and each
// template's placeholder frontmatter ("Replace with ...") would otherwise
// pass that collection's own schema just fine - a template validates
// because its placeholder strings are still non-empty strings, valid
// dates, etc. So a regression that loosened or broke the glob (for
// example, matching `_TEMPLATE.md` after all) would not fail the build:
// it would silently publish the placeholder as if it were a real entry.
// This test reads the actual built pages and checks for that placeholder
// text directly, rather than trusting that "the build succeeded" means
// "no template leaked through".

const CONTENT_ROOT = fileURLToPath(new URL("../../src/content", import.meta.url));

function publishedBlogSlugs(): string[] {
  const dir = path.join(CONTENT_ROOT, "blog");
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .filter((name) => {
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      return !/^draft:\s*true\s*$/m.test(raw);
    })
    .map((name) => name.replace(/\.md$/, ""));
}

// Home renders the board collection; community/research/products each
// render their own collection plus role/event/research/product bodies;
// contribute renders the roles collection. Between the five page routes
// and every published blog post, all six collections appear somewhere.
const ROUTES = [
  "/",
  "/community",
  "/research",
  "/products",
  "/contribute",
  ...publishedBlogSlugs().map((slug) => `/blog/${slug}/`),
];

const PLACEHOLDER_PATTERN = /replace with/i;

for (const route of ROUTES) {
  test(`${route} carries no template placeholder text`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(PLACEHOLDER_PATTERN);
  });
}
