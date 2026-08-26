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
