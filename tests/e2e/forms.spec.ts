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
