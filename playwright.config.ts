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
    // Build then serve the actual production output, not the dev server.
    // The dev server's markup and behavior (e.g. its dev toolbar) diverge
    // from what ships to Netlify, so e2e tests must exercise `dist/`.
    command: "npm run build && npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    // `astro preview` (like `astro dev`) auto-detects AI coding agent
    // environments and daemonizes itself in the background, which makes the
    // launching process exit immediately (0 exit code) before Playwright's
    // readiness check runs. Note the env var name differs from dev's:
    // preview reads ASTRO_PREVIEW_BACKGROUND, not ASTRO_DEV_BACKGROUND.
    // Setting it (to any non-empty value) disables that auto-detection so
    // the preview server stays in the foreground, as Playwright's
    // webServer option requires.
    env: {
      ASTRO_PREVIEW_BACKGROUND: "false",
    },
    // The added `astro build` step means startup now includes a full
    // production build (content sync + static route generation), not just
    // a dev server boot. Give it headroom above the default 60s.
    timeout: 120_000,
  },
});
