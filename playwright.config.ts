import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Screenshot baselines are per-platform: Playwright names them
  // `-{platform}` because font rasterization differs between Windows, Linux,
  // and macOS, so one committed baseline cannot match everywhere. The only
  // screenshot in this suite is the wordmark, and its real correctness gate
  // is the canvas glyph-width assertion beside it (tests/e2e/wordmark.spec.ts),
  // which compares the rendered phi against a fallback face and runs on every
  // platform. The image exists so a human can look at the glyph; comparing it
  // in CI would only assert that CI's font stack matches the machine that last
  // regenerated it. Skip the pixel comparison in CI, keep it locally.
  ignoreSnapshots: !!process.env.CI,
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
    // Always false, in CI and locally. `reuseExistingServer` does not just
    // skip *waiting* for boot - if anything already answers at `url` it
    // skips running `command` at all. That is fine in front of a dev
    // server (always reflects current source), but not in front of a
    // one-shot `build && preview`: a stray preview process left over from
    // an earlier run, or one a developer started by hand, would make the
    // suite silently test whatever `dist/` happened to contain instead of
    // rebuilding from current source. This project's e2e strategy depends
    // on every run testing freshly built output, so that guarantee is not
    // negotiable for a bit of local speed. Close any server already
    // listening on 4321 before running tests; Playwright will error
    // loudly if you don't, rather than fail silently.
    reuseExistingServer: false,
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
