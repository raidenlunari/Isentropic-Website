import { test, expect } from "@playwright/test";
import { site } from "../../src/data/site";

// Per-form attribute and behavior tests (honeypot, validation, inline
// submission, file upload, per-entry manuscript identification) are
// appended here by Tasks 10 and 11, once the Contribute and Research
// pages actually render the forms these tests would otherwise be
// exercising against stub content. Only tests that can pass against
// what Task 8 built are included here.

test("detection stub declares every form", async ({ page }) => {
  await page.goto("/__forms.html");
  for (const name of Object.values(site.formNames)) {
    await expect(page.locator(`form[name="${name}"]`)).toHaveCount(1);
  }
});

test("/thanks renders a single h1 and states what was received and what happens next", async ({
  page,
}) => {
  await page.goto("/thanks");
  await expect(page.locator("h1")).toHaveCount(1);
  const body = page.locator(".body-text").first();
  await expect(body).toContainText(/received/i);
  await expect(body).toContainText(/reply by email/i);
});

// The count is deliberately not pinned to 1. One manuscript-request form is
// rendered per research entry with `manuscriptAvailable: true`, and
// CONTENT-GUIDE.md Task 6 tells maintainers to set that field on any entry
// whose write-up can be shared. Asserting exactly one form would turn this
// test red on an ordinary, correct content change; asserting the attributes
// on every rendered form is what the test is actually for.
test("every manuscript-request form carries the expected Netlify attributes", async ({
  page,
}) => {
  await page.goto("/research");
  const forms = page.locator('form[name="manuscript-request"]');
  const count = await forms.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const form = forms.nth(i);
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("method", "POST");
    await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
    const formNameInput = form.locator('input[name="form-name"]');
    await expect(formNameInput).toHaveAttribute("value", "manuscript-request");
  }
});

test("every rendered manuscript field has a non-empty, distinct value", async ({
  page,
}) => {
  await page.goto("/research");
  const values = await page.locator('input[name="manuscript"]').evaluateAll(
    (els) => els.map((e) => (e as HTMLInputElement).value),
  );
  expect(values.length).toBeGreaterThan(0);
  for (const value of values) {
    expect(value).not.toBe("");
  }
  expect(new Set(values).size).toBe(values.length);
});

const SINGLE_INSTANCE_FORMS: Array<{ route: string; name: string }> = [
  { route: "/contribute", name: "application" },
  { route: "/parts", name: "parts-donation" },
  { route: "/parts", name: "parts-request" },
];

for (const { route, name } of SINGLE_INSTANCE_FORMS) {
  test(`${name} on ${route} carries the expected Netlify attributes`, async ({ page }) => {
    await page.goto(route);
    const form = page.locator(`form[name="${name}"]`);
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("method", "POST");
    await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
    const formNameInput = form.locator('input[name="form-name"]');
    await expect(formNameInput).toHaveAttribute("value", name);
  });
}

test("the application form is multipart with exactly one file input", async ({ page }) => {
  await page.goto("/contribute");
  const form = page.locator('form[name="application"]');
  await expect(form).toHaveAttribute("enctype", "multipart/form-data");
  await expect(form.locator('input[type="file"]')).toHaveCount(1);
});

// Fills every field of the parts-donation form except the one the test
// varies. Used by the validation tests below.
async function fillDonationForm(
  form: import("@playwright/test").Locator,
  overrides: Partial<Record<"organization" | "email", string>> = {},
) {
  const organization = overrides.organization ?? "Acme Robotics";
  if (organization !== "") {
    await form.locator('input[name="organization"]').fill(organization);
  }
  await form.locator('input[name="contact-name"]').fill("Jordan Lee");
  await form.locator('input[name="email"]').fill(overrides.email ?? "jordan@example.com");
  await form.locator('textarea[name="parts"]').fill("Six V5 smart motors, two brains, assorted channel.");
  await form.locator('input[name="availability"]').fill("Any weekend in November");
  await form.locator('select[name="handoff"]').selectOption("Drop-off");
}

test("submitting the donation form with an invalid email does not navigate", async ({
  page,
}) => {
  await page.goto("/parts");
  const form = page.locator('form[name="parts-donation"]');
  await fillDonationForm(form, { email: "not-an-email" });
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(/\/parts/);
  const emailIsValid = await form
    .locator('input[name="email"]')
    .evaluate((el) => (el as HTMLInputElement).checkValidity());
  expect(emailIsValid).toBe(false);
});

// Task 8 built the form primitives and verified the no-JavaScript path —
// native POST navigation, native `required` validation, honeypot
// reachability — against a temporary fixture, then deleted it, leaving
// zero permanent coverage of that path. These two tests are that
// permanent coverage, exercised against the real parts-donation form
// rendered on /parts. A separate browser context is required (not just a
// page) because `javaScriptEnabled` can only be set at context creation
// time.
test.describe("no-JavaScript submission path", () => {
  test("a validly-filled donation form performs a real navigation to /thanks", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto("/parts");
      const form = page.locator('form[name="parts-donation"]');
      await fillDonationForm(form);
      await form.locator('button[type="submit"]').click();
      await page.waitForURL("**/thanks");
      expect(new URL(page.url()).pathname).toBe("/thanks");
    } finally {
      await context.close();
    }
  });

  test("leaving a required field empty blocks submission natively", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto("/parts");
      const form = page.locator('form[name="parts-donation"]');
      // "organization" is left empty; every other required field is filled.
      await fillDonationForm(form, { organization: "" });
      await form.locator('button[type="submit"]').click();
      await page.waitForTimeout(300);
      expect(new URL(page.url()).pathname).toBe("/parts");
    } finally {
      await context.close();
    }
  });
});

// ---------------------------------------------------------------------------
// Structural contracts that no automated sweep covers.
//
// axe cannot catch either of the next two: its `label` rule resolves a
// control's label by *string-matching* `label[for="x"]` against `id="x"`,
// without checking that the id is unique on the page, so two controls
// sharing an id both look labelled to it. The rule that would have caught
// the root cause, `duplicate-id-active`, was removed from axe-core in 4.10
// (this project runs 4.13). `element.labels` is the DOM's own resolution
// and follows the same rules a screen reader does, so it is the check that
// actually bites.
//
// /parts renders two forms that both carry an `email`, and /research
// renders one manuscript form per entry with its manuscript available,
// each repeating every field name - exactly the condition that produces
// colliding ids if ids are derived from the field name alone. /contribute
// renders a single form today but is kept in the sweep: it is where a
// second form (sponsorship, say) would most plausibly return.
const MULTI_FORM_ROUTES = ["/contribute", "/research", "/parts"];

// The duplicate-id sweep runs wider than the form pages. Writing it first
// showed the same class of bug in a second place: every page that splices
// several Markdown entry bodies into one page was shipping duplicate
// heading ids (two research entries both writing "## Results" produced two
// elements with id="results"). Keeping the whole set of many-entries-per-
// page routes under this assertion is what stops that recurring.
const ID_UNIQUENESS_ROUTES = [
  ...MULTI_FORM_ROUTES,
  "/",
  "/community",
  "/products",
];

for (const route of ID_UNIQUENESS_ROUTES) {
  test(`${route} emits no duplicate element ids`, async ({ page }) => {
    await page.goto(route);
    const ids = await page.$$eval("[id]", (els) => els.map((el) => el.id));
    expect(ids.length).toBeGreaterThan(0);
    const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    expect(duplicates, `duplicate ids on ${route}`).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });
}

for (const route of MULTI_FORM_ROUTES) {
  test(`${route} gives every form control exactly one label`, async ({ page }) => {
    await page.goto(route);
    const controls = await page.$$eval(
      "input:not([type='hidden']), select, textarea",
      (els) =>
        els.map((el) => ({
          form: el.closest("form")?.getAttribute("name") ?? null,
          name: el.getAttribute("name"),
          labels:
            (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
              .labels?.length ?? 0,
        })),
    );
    expect(controls.length).toBeGreaterThan(0);
    const wrong = controls.filter((c) => c.labels !== 1);
    expect(wrong, `controls not labelled exactly once on ${route}`).toEqual([]);
  });
}

// The one coupling in this codebase where a mistake loses production data
// with no local symptom: `public/__forms.html` is the stub Netlify parses
// at build time to register each form and its fields. A field name that
// exists on a real form but not in the stub is silently dropped from real
// submissions - the site keeps building, every other test keeps passing,
// and the data is simply gone. This asserts the two sets are identical.
test("every rendered form's field names match the Netlify detection stub", async ({
  page,
}) => {
  const collect = (page: import("@playwright/test").Page) =>
    page.$$eval("form[name]", (forms) =>
      forms.map((form) => ({
        name: form.getAttribute("name"),
        fields: Array.from(form.querySelectorAll("[name]"))
          .map((el) => el.getAttribute("name") as string)
          // `form-name` is Netlify's own routing input, added by
          // NetlifyForm at render time and never declared in the stub.
          .filter((name) => name !== "form-name")
          .sort(),
      })),
    );

  await page.goto("/__forms.html");
  const stub = new Map(
    (await collect(page)).map((form) => [form.name, form.fields]),
  );
  // Derived from site.formNames rather than pinned, so adding another
  // form to the site without declaring it in the stub fails here too.
  expect(stub.size).toBe(Object.keys(site.formNames).length);

  let checked = 0;
  for (const route of MULTI_FORM_ROUTES) {
    await page.goto(route);
    for (const form of await collect(page)) {
      expect(
        stub.has(form.name),
        `form "${form.name}" on ${route} is not declared in public/__forms.html`,
      ).toBe(true);
      expect(
        form.fields,
        `field names for form "${form.name}" on ${route} differ from public/__forms.html`,
      ).toEqual(stub.get(form.name));
      checked += 1;
    }
  }
  expect(checked).toBeGreaterThanOrEqual(Object.keys(site.formNames).length);
});
