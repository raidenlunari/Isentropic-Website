import { test, expect } from "@playwright/test";
import { entries, isTrue, text } from "./content";
import { site } from "../../src/data/site";

// Sponsorship is handled by email rather than a form or a packet download:
// the Sponsor section must carry a working mailto link to the
// organization's contact address from src/data/site.ts.
test("sponsorship is offered by email", async ({ page }) => {
  await page.goto("/contribute");
  const link = page.locator("a.sponsor-email");
  await expect(link).toHaveAttribute("href", `mailto:${site.email}`);
  await expect(link).toHaveText(site.email);
});

const openRoles = () => entries("roles").filter((role) => isTrue(role, "open"));

// The role field changes shape with the content: while roles are listed
// it is a select of every open role plus the open-ended option; while
// none are, a one-item menu would be pointless, so it is a free-text
// input under the same field name. Both branches are asserted so that
// whichever state the content is in, the form offers a usable role field
// and keeps the name public/__forms.html declares.
test("role field lists open roles plus the open-ended option, or is free text when none are open", async ({
  page,
}) => {
  await page.goto("/contribute");
  const form = page.locator('form[name="application"]');
  const open = openRoles();
  if (open.length > 0) {
    const options = await form.locator('select[name="role"] option').allTextContents();
    expect(options).toContain("<insert-role-you-excel-at/>");
    for (const role of open) {
      expect(options).toContain(text(role, "title"));
    }
    // Every open role, the open-ended option, and the select's own
    // "Select one" placeholder.
    expect(options.length).toBe(open.length + 2);
  } else {
    await expect(form.locator('select[name="role"]')).toHaveCount(0);
    const input = form.locator('input[name="role"]');
    await expect(input).toHaveCount(1);
    await expect(input).toHaveAttribute("required", "");
  }
});

// The expected count is the number of roles with `open: true`, read from
// the role files. Adding a role, or retiring one by setting `open: false`,
// is exactly what CONTENT-GUIDE.md Task 8 tells a maintainer to do, and a
// pinned literal made either edit fail the suite. With no open role at
// all, the listing is omitted rather than rendered empty.
test("only open roles are listed", async ({ page }) => {
  await page.goto("/contribute");
  const open = openRoles();
  await expect(page.locator(".role")).toHaveCount(open.length);
  if (open.length === 0) {
    await expect(page.locator(".role-groups")).toHaveCount(0);
  }
});

test("contribute page has a single h1", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page.locator("h1")).toHaveCount(1);
});
