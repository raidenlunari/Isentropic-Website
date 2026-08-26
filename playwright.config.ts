import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    // Astro 7 auto-detects AI coding agent environments and daemonizes
    // `astro dev` in the background, which makes the launching process exit
    // immediately (0 exit code) before Playwright's readiness check runs.
    // Setting this env var (to any non-empty value) disables that
    // auto-detection so the dev server stays in the foreground, as
    // Playwright's webServer option requires.
    env: {
      ASTRO_DEV_BACKGROUND: "false",
    },
  },
});
