import { test, expect } from "@playwright/test";

// Per-form attribute and behavior tests (honeypot, validation, inline
// submission, file upload, per-entry manuscript identification) are
// appended here by Tasks 10 and 11, once the Contribute and Research
// pages actually render the forms these tests would otherwise be
// exercising against stub content. Only tests that can pass against
// what Task 8 built are included here.

test("detection stub declares every form", async ({ page }) => {
  await page.goto("/__forms.html");
  for (const name of ["sponsor-contact", "manuscript-request", "application"]) {
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

test("the manuscript-request form carries the expected Netlify attributes", async ({
  page,
}) => {
  await page.goto("/research");
  const form = page.locator('form[name="manuscript-request"]');
  await expect(form).toHaveCount(1);
  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
  const formNameInput = form.locator('input[name="form-name"]');
  await expect(formNameInput).toHaveAttribute("value", "manuscript-request");
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

test("sponsor-contact and application carry the expected Netlify attributes", async ({
  page,
}) => {
  await page.goto("/contribute");
  for (const name of ["sponsor-contact", "application"]) {
    const form = page.locator(`form[name="${name}"]`);
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("method", "POST");
    await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
    const formNameInput = form.locator('input[name="form-name"]');
    await expect(formNameInput).toHaveAttribute("value", name);
  }
});

test("the application form is multipart with exactly one file input", async ({ page }) => {
  await page.goto("/contribute");
  const form = page.locator('form[name="application"]');
  await expect(form).toHaveAttribute("enctype", "multipart/form-data");
  await expect(form.locator('input[type="file"]')).toHaveCount(1);
});

test("submitting the sponsor form with an invalid email does not navigate", async ({
  page,
}) => {
  await page.goto("/contribute");
  const form = page.locator('form[name="sponsor-contact"]');
  await form.locator('input[name="organization"]').fill("Acme Robotics");
  await form.locator('input[name="contact-name"]').fill("Jordan Lee");
  await form.locator('input[name="email"]').fill("not-an-email");
  await form.locator('select[name="sponsorship-level"]').selectOption("Gold");
  await form.locator('textarea[name="message"]').fill("Interested in sponsoring.");
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(/\/contribute/);
  const emailIsValid = await form
    .locator('input[name="email"]')
    .evaluate((el) => (el as HTMLInputElement).checkValidity());
  expect(emailIsValid).toBe(false);
});

// Task 8 built the form primitives and verified the no-JavaScript path —
// native POST navigation, native `required` validation, honeypot
// reachability — against a temporary fixture, then deleted it, leaving
// zero permanent coverage of that path. These two tests are that
// permanent coverage, exercised against the real sponsor-contact form
// rendered on /contribute. A separate browser context is required (not
// just a page) because `javaScriptEnabled` can only be set at context
// creation time.
test.describe("no-JavaScript submission path", () => {
  test("a validly-filled sponsor form performs a real navigation to /thanks", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/contribute");
    const form = page.locator('form[name="sponsor-contact"]');
    await form.locator('input[name="organization"]').fill("Acme Robotics");
    await form.locator('input[name="contact-name"]').fill("Jordan Lee");
    await form.locator('input[name="email"]').fill("jordan@example.com");
    await form.locator('select[name="sponsorship-level"]').selectOption("Gold");
    await form.locator('textarea[name="message"]').fill("Interested in sponsoring.");
    await form.locator('button[type="submit"]').click();
    await page.waitForURL("**/thanks");
    expect(new URL(page.url()).pathname).toBe("/thanks");
    await context.close();
  });

  test("leaving a required field empty blocks submission natively", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/contribute");
    const form = page.locator('form[name="sponsor-contact"]');
    // "organization" is left empty; every other required field is filled.
    await form.locator('input[name="contact-name"]').fill("Jordan Lee");
    await form.locator('input[name="email"]').fill("jordan@example.com");
    await form.locator('select[name="sponsorship-level"]').selectOption("Gold");
    await form.locator('textarea[name="message"]').fill("Interested in sponsoring.");
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    expect(new URL(page.url()).pathname).toBe("/contribute");
    await context.close();
  });
});
